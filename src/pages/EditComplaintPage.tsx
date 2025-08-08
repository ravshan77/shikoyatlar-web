import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Eye } from 'lucide-react';
import { ComplaintForm } from '../components/ComplaintForm.tsx';
import { Button } from '../components/ui/Button.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
import { apiService } from '../services/apiService.ts';
import { useComplaintStore } from '../stores/useComplaintStore.ts';
import { ComplaintFormData, ComplaintResponse } from '../types/complaint.types.ts';

export const EditComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'edit' | 'view'>('edit');
  const { userSession } = useComplaintStore();

  // Fetch branches
  const { 
    data: branchesData, 
    isLoading: isLoadingBranches 
  } = useQuery({
    queryKey: ['branches'],
    queryFn: apiService.getBranches,
  });

  // Fetch specific complaint
  const { 
    data: complaintsData, 
    isLoading: isLoadingComplaint 
  } = useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => {
      // Since there's no single complaint endpoint, we'll fetch all complaints
      // and filter by ID. In a real app, you'd have a dedicated endpoint.
      const result = await apiService.getComplaints(1, null, null);
      return result;
    },
    enabled: !!id,
  });

  const complaint = complaintsData?.data?.find(c => c.id === Number(id));

  const handleSubmit = async (formData: ComplaintFormData): Promise<boolean> => {
    if (!userSession || !complaint) {
      alert('Ma\'lumotlar topilmadi');
      return false;
    }

    setIsSubmitting(true);

    try {
      // Upload new images
      const imageUrls: string[] = [];
      for (const file of formData.images) {
        const url = await apiService.uploadImage(file);
        if (url) imageUrls.push(url);
      }

      // Keep existing images and add new ones
      const allImages = [...complaint.images, ...imageUrls];

      // Prepare complaint data
      const complaintRequest = {
        client_name: formData.clientName,
        client_phone_one: formData.clientPhoneOne,
        client_phone_two: formData.clientPhoneTwo || null,
        complaint_text: formData.complaintText,
        rent_number: formData.rentNumber || '',
        branch_id: formData.branchId,
        images: allImages,
        worker_id: userSession.workerId,
        worker_name: userSession.workerName,
      };

      // Update complaint
      const success = await apiService.updateComplaint(complaint.id, complaintRequest);

      if (success) {
        alert('Shikoyat muvaffaqiyatli yangilandi!');
        navigate('/dashboard');
        return true;
      } else {
        alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
        return false;
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const toggleMode = () => {
    setMode(mode === 'edit' ? 'view' : 'edit');
  };

  if (isLoadingBranches || isLoadingComplaint) {
    return <LoadingSpinner fullScreen message="Ma'lumotlar yuklanmoqda..." />;
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Shikoyat topilmadi
          </h2>
          <p className="text-gray-600 mb-4">
            So'ralgan shikoyat mavjud emas yoki o'chirilgan.
          </p>
          <Button onClick={handleGoBack}>
            Asosiy sahifaga qaytish
          </Button>
        </div>
      </div>
    );
  }

  // Check if complaint is completed
  const isCompleted = complaint.status === 'completed';
  const currentMode = isCompleted ? 'view' : mode;

  const branches = branchesData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="flex items-center space-x-2 mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Orqaga</span>
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentMode === 'view' ? 'Shikoyatni ko\'rish' : 'Shikoyatni tahrirlash'}
                </h1>
                <p className="text-sm text-gray-600">
                  Shikoyat ID: #{complaint.id}
                </p>
              </div>
            </div>

            {/* Mode Toggle (only for non-completed complaints) */}
            {!isCompleted && (
              <Button
                variant="secondary"
                onClick={toggleMode}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>
                  {mode === 'edit' ? 'Ko\'rish rejimi' : 'Tahrirlash rejimi'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Status Badge */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            complaint.status === 'completed' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {complaint.status === 'completed' ? 'Yakunlangan' : 'Jarayonda'}
          </span>
          
          {isCompleted && (
            <span className="text-sm text-gray-500">
              Bu shikoyat yakunlangan va o'zgartirib bo'lmaydi
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <ComplaintForm
            isOpen={true}
            onClose={handleGoBack}
            onSubmit={handleSubmit}
            branches={branches}
            isLoading={isSubmitting}
            editData={complaint}
            mode={currentMode}
          />
        </div>
      </main>
    </div>
  );
};