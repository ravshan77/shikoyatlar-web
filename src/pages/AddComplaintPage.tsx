import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { ComplaintForm } from '../components/ComplaintForm.tsx';
import { Button } from '../components/ui/Button.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
import { apiService } from '../services/apiService.ts';
import { useComplaintStore } from '../stores/useComplaintStore.ts';
import { ComplaintFormData } from '../types/complaint.types.ts';

export const AddComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userSession } = useComplaintStore();

  // Fetch branches
  const { 
    data: branchesData, 
    isLoading: isLoadingBranches 
  } = useQuery({
    queryKey: ['branches'],
    queryFn: apiService.getBranches,
  });

  const handleSubmit = async (formData: ComplaintFormData): Promise<boolean> => {
    if (!userSession) {
      alert('Foydalanuvchi ma\'lumotlari topilmadi');
      return false;
    }

    setIsSubmitting(true);

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
      const success = await apiService.createComplaint(complaintRequest);

      if (success) {
        alert('Shikoyat muvaffaqiyatli yaratildi!');
        navigate('/dashboard');
        return true;
      } else {
        alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
        return false;
      }
    } catch (error) {
      console.error('Error creating complaint:', error);
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  if (isLoadingBranches) {
    return <LoadingSpinner fullScreen message="Ma'lumotlar yuklanmoqda..." />;
  }

  const branches = branchesData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
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
                Yangi shikoyat qo'shish
              </h1>
              <p className="text-sm text-gray-600">
                Mijoz shikoyatini ro'yxatdan o'tkazing
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <ComplaintForm
            isOpen={true}
            onClose={handleGoBack}
            onSubmit={handleSubmit}
            branches={branches}
            isLoading={isSubmitting}
            editData={null}
            mode="create"
          />
        </div>
      </main>
    </div>
  );
};