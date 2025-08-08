import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, User } from 'lucide-react';
import { ComplaintFiltersComponent } from '../components/ComplaintFilters.tsx';
import { ComplaintsTable } from '../components/ComplaintsTable.tsx';
import { ComplaintForm } from '../components/ComplaintForm.tsx';
import { Button } from '../components/ui/Button.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { apiService } from '../services/apiService.ts';
import { useComplaintStore } from '../stores/useComplaintStore.ts';
import { ComplaintResponse, ComplaintFormData, BranchItem } from '../types/complaint.types.ts';

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  const {
    userSession,
    filters,
    currentPage,
    setFilters,
    setCurrentPage,
    autoRefresh,
    setAutoRefresh,
  } = useComplaintStore();

  const queryClient = useQueryClient();

  // Fetch branches
  const { data: branchesData = { status: false, data: [] } } = useQuery({
    queryKey: ['branches'],
    queryFn: apiService.getBranches,
  });

  // Fetch complaints
  const {
    data: complaintsData,
    isLoading: isLoadingComplaints,
    refetch: refetchComplaints,
    isFetching: isFetchingComplaints,
  } = useQuery({
    queryKey: ['complaints', currentPage, filters.status, filters.branchId],
    queryFn: () => apiService.getComplaints(currentPage, filters.status, filters.branchId),
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds
  });

  // Handle complaint form submission
  const handleComplaintSubmit = async (formData: ComplaintFormData): Promise<boolean> => {
    if (!userSession) return false;

    setIsSubmittingComplaint(true);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const file of formData.images) {
        const url = await apiService.uploadImage(file);
        if (url) imageUrls.push(url);
      }

      // Prepare complaint data
      const complaintRequest = {
        client_name: formData.clientName,
        client_phone_one: formData.clientPhoneOne,
        client_phone_two: formData.clientPhoneTwo || null,
        complaint_text: formData.complaintText,
        rent_number: formData.rentNumber || '',
        branch_id: formData.branchId,
        images: imageUrls,
        worker_id: userSession.workerId,
        worker_name: userSession.workerName,
      };

      // Submit complaint
      const success = formMode === 'edit' && selectedComplaint
        ? await apiService.updateComplaint(selectedComplaint.id, complaintRequest)
        : await apiService.createComplaint(complaintRequest);

      if (success) {
        // Refresh complaints data
        await refetchComplaints();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      return false;
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  }, [setFilters]);

  // Handle manual refresh
  const handleRefresh = async () => {
    await refetchComplaints();
  };

  // Handle add complaint
  const handleAddComplaint = () => {
    setFormMode('create');
    setSelectedComplaint(null);
    setIsFormOpen(true);
  };

  // Handle view complaint
  const handleViewComplaint = (complaint: ComplaintResponse) => {
    setFormMode('view');
    setSelectedComplaint(complaint);
    setIsFormOpen(true);
  };

  // Handle edit complaint
  const handleEditComplaint = (complaint: ComplaintResponse) => {
    if (complaint.status === 'completed') {
      alert('Yakunlangan shikoyatni tahrirlash mumkin emas!');
      return;
    }
    setFormMode('edit');
    setSelectedComplaint(complaint);
    setIsFormOpen(true);
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Haqiqatan ham chiqmoqchimisiz?')) {
      onLogout();
    }
  };

  const branches: BranchItem[] = branchesData.data || [];
  const complaints: ComplaintResponse[] = complaintsData?.data || [];
  const pagination = complaintsData?.pagination || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Shikoyatlar tizimi
              </h1>
              <p className="text-sm text-gray-600">
                Mijozlar shikoyatlarini boshqarish
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Info */}
              {userSession && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{userSession.workerName}</span>
                </div>
              )}

              {/* Logout Button */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Chiqish</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <ComplaintFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            branches={branches}
            onAddComplaint={handleAddComplaint}
            onRefresh={handleRefresh}
            isRefreshing={isFetchingComplaints && !isLoadingComplaints}
            autoRefresh={autoRefresh}
            onAutoRefreshToggle={setAutoRefresh}
          />

          {/* Complaints Table */}
          <ComplaintsTable
            complaints={complaints}
            pagination={pagination}
            loading={isLoadingComplaints}
            onView={handleViewComplaint}
            onEdit={handleEditComplaint}
            onPageChange={handlePageChange}
          />
        </div>
      </main>

      {/* Complaint Form Modal */}
      <ComplaintForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedComplaint(null);
        }}
        onSubmit={handleComplaintSubmit}
        branches={branches}
        isLoading={isSubmittingComplaint}
        editData={selectedComplaint}
        mode={formMode}
      />
    </div>
  );
};