import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LogOut, User } from 'lucide-react';
import { ComplaintFiltersComponent } from '../components/ComplaintFilters.tsx';
import { ComplaintsTable } from '../components/ComplaintsTable.tsx';
import { Button } from '../components/ui/Button.tsx';
import { apiService } from '../services/apiService.ts';
import { useComplaintStore } from '../stores/useComplaintStore.ts';
import { ComplaintResponse } from '../types/complaint.types.ts';

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const {
    userSession,
    filters,
    currentPage,
    setFilters,
    setCurrentPage,
    autoRefresh,
    setAutoRefresh,
  } = useComplaintStore();

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

  // Handle add complaint - navigate to add page
  const handleAddComplaint = () => {
    navigate('/complaints/add');
  };

  // Handle view complaint - navigate to edit page in view mode
  const handleViewComplaint = (complaint: ComplaintResponse) => {
    navigate(`/complaints/edit/${complaint.id}?mode=view`);
  };

  // Handle edit complaint - navigate to edit page
  const handleEditComplaint = (complaint: ComplaintResponse) => {
    if (complaint.status === 'completed') {
      alert('Yakunlangan shikoyatni tahrirlash mumkin emas!');
      return;
    }
    navigate(`/complaints/edit/${complaint.id}`);
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Haqiqatan ham chiqmoqchimisiz?')) {
      onLogout();
    }
  };

  const branches = branchesData.data || [];
  const complaints = complaintsData?.data || [];
  const pagination = complaintsData?.pagination || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-2">
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
      <main className="max-w-[95%] mx-auto px-4 sm:px-4 lg:px-2 py-8">
        <div className="space-y-">
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
    </div>
  );
};