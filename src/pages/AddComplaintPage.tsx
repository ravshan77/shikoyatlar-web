import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Eye, User, Phone, FileText, Hash } from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Select } from '../components/ui/Select.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
import { apiService } from '../services/apiService.ts';
import { useComplaintStore } from '../stores/useComplaintStore.ts';
import { ComplaintFormData } from '../types/complaint.types.ts';

interface ImagePreview {
  file: File;
  url: string;
}

export const AddComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userSession } = useComplaintStore();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ComplaintFormData>();

  // Fetch branches
  const {  data: branchesData, isLoading: isLoadingBranches } = useQuery({ queryKey: ['branches'], queryFn: apiService.getBranches });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: ImagePreview = {
            file,
            url: e.target?.result as string,
          };
          setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageRemove = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  const formatPhoneInput = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If starts with 998, format as +998 XX XXX XX XX
    if (digits.startsWith('998')) {
      const number = digits.slice(3);
      return `+998 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5, 7)} ${number.slice(7, 9)}`.trim();
    }
    
    // If just digits, add +998 prefix
    if (digits.length > 0 && !digits.startsWith('998')) {
      return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`.trim();
    }
    
    return '+998 ';
  };

  const onFormSubmit = async (data: ComplaintFormData) => {
    if (!userSession) {
      alert('Foydalanuvchi ma\'lumotlari topilmadi');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const image of images) {
        const url = await apiService.uploadImage(image.file);
        if (url) imageUrls.push(url);
      }

      // Prepare complaint data
      const complaintRequest = {
        client_name: data.client_name,
        client_phone_one: data.client_phone_one,
        client_phone_two: data.client_phone_two || null,
        complaint_text: data.complaint_text,
        rent_number: data.rent_number || '',
        branch_id: data.branch_id,
        images: imageUrls,
        worker_id: userSession.workerId,
        worker_name: userSession.workerName,
      };

      // Submit complaint
      const success = await apiService.createComplaint(complaintRequest);

      if (success) {
        alert('Shikoyat muvaffaqiyatli yaratildi!');
        navigate('/dashboard');
      } else {
        alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      }
    } catch (error) {
      console.error('Error creating complaint:', error);
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => navigate('/dashboard')

  if (isLoadingBranches) {
    return <LoadingSpinner fullScreen message="Ma'lumotlar yuklanmoqda..." />;
  }

  const branches = branchesData?.data || [];
  const branchOptions = branches.map(branch => ({
    value: branch.id,
    label: branch.name,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
              {/* Client Info Section */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Mijoz ma'lumotlari
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Name */}
                  <Input
                    label="Mijoz ismi *"
                    icon={<User />}
                    {...register('client_name', {
                      required: 'Mijoz ismini kiriting',
                      minLength: { value: 2, message: 'Kamida 2 ta belgi kiriting' },
                    })}
                    error={errors.client_name?.message}
                    placeholder="Mijoz ismini kiriting"
                  />

                  {/* Branch */}
                  <Select
                    label="Filial *"
                    value={watch('branch_id')}
                    onChange={(value) => setValue('branch_id', Number(value))}
                    options={branchOptions}
                    error={errors.branch_id?.message}
                    placeholder="Filialni tanlang"
                  />

                  {/* Phone 1 */}
                  <Input
                    label="Asosiy telefon raqam *"
                    icon={<Phone />}
                    {...register('client_phone_one', {
                      required: 'Telefon raqamni kiriting',
                      pattern: {
                        value: /^\+998 \d{2} \d{3} \d{2} \d{2}$/,
                        message: 'To\'g\'ri telefon raqam formatini kiriting',
                      },
                    })}
                    onChange={(e) => {
                      const formatted = formatPhoneInput(e.target.value);
                      setValue('client_phone_one', formatted);
                    }}
                    error={errors.client_phone_one?.message}
                    placeholder="+998 XX XXX XX XX"
                  />

                  {/* Phone 2 (Optional) */}
                  <Input
                    label="Qo'shimcha telefon raqam"
                    icon={<Phone />}
                    {...register('client_phone_two')}
                    onChange={(e) => {
                      const formatted = formatPhoneInput(e.target.value);
                      setValue('client_phone_two', formatted);
                    }}
                    error={errors.client_phone_two?.message}
                    placeholder="+998 XX XXX XX XX (ixtiyoriy)"
                  />
                </div>
              </div>

              {/* Complaint Details Section */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Shikoyat ma'lumotlari
                </h2>

                {/* Rent Number */}
                <div className="mb-6">
                  <Input
                    label="Ijara raqami"
                    icon={<Hash />}
                    {...register('rent_number')}
                    error={errors.rent_number?.message}
                    placeholder="Ijara raqamini kiriting (ixtiyoriy)"
                    helperText="Agar mavjud bo'lsa, ijara raqamini kiriting"
                  />
                </div>

                {/* Complaint Text */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <FileText className="inline w-4 h-4 mr-1" />
                    Shikoyat matni *
                  </label>
                  <textarea
                    {...register('complaint_text', {
                      required: 'Shikoyat matnini kiriting',
                      minLength: { value: 10, message: 'Kamida 10 ta belgi kiriting' },
                    })}
                    rows={6}
                    className={`block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none ${
                      errors.complaint_text ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder="Shikoyat matnini batafsil yozing..."
                  />
                  {errors.complaint_text && (
                    <p className="text-sm text-red-600">{errors.complaint_text.message}</p>
                  )}
                </div>
              </div>

              {/* Images Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Rasmlar
                  </h2>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Rasm yuklash</span>
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Image Previews */}
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => setSelectedImage(image.url)}
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedImage(image.url)}
                          className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200 rounded-lg"
                        >
                          <Eye className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Rasm yuklash uchun bosing</p>
                    <p className="text-gray-400 text-sm">yoki fayllarni bu yerga sudrang</p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleGoBack}
                  className="px-8"
                >
                  Bekor qilish
                </Button>
                
                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  className="px-8"
                >
                  Shikoyat yaratish
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Image Preview Modal */}
      <Modal 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)}
        size="xl"
      >
        {selectedImage && (
          <div className="flex justify-center">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};