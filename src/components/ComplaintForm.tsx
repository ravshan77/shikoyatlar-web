import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Eye, Phone, User, Building, FileText, Hash } from 'lucide-react';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { Modal } from './ui/Modal.tsx';
import { ComplaintFormData, BranchItem, ComplaintResponse } from '../types/complaint.types.ts';

interface ComplaintFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ComplaintFormData) => Promise<boolean>;
  branches: BranchItem[];
  isLoading: boolean;
  editData?: ComplaintResponse | null;
  mode: 'create' | 'edit' | 'view';
}

interface ImagePreview {
  file?: File;
  url: string;
  isExisting?: boolean;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  branches,
  isLoading,
  editData,
  mode,
}) => {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ComplaintFormData>();

  // Initialize form with edit data
  React.useEffect(() => {
    if (editData && isOpen) {
      setValue('clientName', editData.client_name);
      setValue('clientPhoneOne', editData.client_phone_one);
      setValue('clientPhoneTwo', editData.client_phone_two || '');
      setValue('complaintText', editData.complaint_text);
      setValue('rentNumber', editData.rent_number);
      setValue('branchId', editData.branch_id);

      // Load existing images
      const existingImages: ImagePreview[] = editData.images.map(url => ({
        url,
        isExisting: true,
      }));
      setImages(existingImages);
    } else if (isOpen) {
      reset();
      setImages([]);
    }
  }, [editData, isOpen, setValue, reset]);

  const handleClose = () => {
    reset();
    setImages([]);
    setSelectedImage(null);
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: ImagePreview = {
            file,
            url: e.target?.result as string,
            isExisting: false,
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

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

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
    const formData: ComplaintFormData = {
      ...data,
      images: images.map(img => img.file).filter(Boolean) as File[],
    };

    const success = await onSubmit(formData);
    if (success) {
      handleClose();
    }
  };

  const branchOptions = branches.map(branch => ({
    value: branch.id,
    label: branch.name,
  }));

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Yangi shikoyat' : mode === 'edit' ? 'Shikoyatni tahrirlash' : 'Shikoyat ma\'lumotlari';

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Name */}
            <Input
              label="Mijoz ismi"
              icon={<User />}
              {...register('clientName', {
                required: 'Mijoz ismini kiriting',
                minLength: { value: 2, message: 'Kamida 2 ta belgi kiriting' },
              })}
              error={errors.clientName?.message}
              disabled={isReadOnly}
              placeholder="Mijoz ismini kiriting"
            />

            {/* Branch */}
            <Select
              label="Filial"
              value={watch('branchId')}
              onChange={(value) => setValue('branchId', Number(value))}
              options={branchOptions}
              error={errors.branchId?.message}
              disabled={isReadOnly}
              placeholder="Filialni tanlang"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone 1 */}
            <Input
              label="Asosiy telefon raqam"
              icon={<Phone />}
              {...register('clientPhoneOne', {
                required: 'Telefon raqamni kiriting',
                pattern: {
                  value: /^\+998 \d{2} \d{3} \d{2} \d{2}$/,
                  message: 'To\'g\'ri telefon raqam formatini kiriting',
                },
              })}
              onChange={(e) => {
                const formatted = formatPhoneInput(e.target.value);
                setValue('clientPhoneOne', formatted);
              }}
              error={errors.clientPhoneOne?.message}
              disabled={isReadOnly}
              placeholder="+998 XX XXX XX XX"
            />

            {/* Phone 2 (Optional) */}
            <Input
              label="Qo'shimcha telefon raqam"
              icon={<Phone />}
              {...register('clientPhoneTwo')}
              onChange={(e) => {
                const formatted = formatPhoneInput(e.target.value);
                setValue('clientPhoneTwo', formatted);
              }}
              error={errors.clientPhoneTwo?.message}
              disabled={isReadOnly}
              placeholder="+998 XX XXX XX XX (ixtiyoriy)"
            />
          </div>

          {/* Rent Number */}
          <Input
            label="Ijara raqami"
            icon={<Hash />}
            {...register('rentNumber')}
            error={errors.rentNumber?.message}
            disabled={isReadOnly}
            placeholder="Ijara raqamini kiriting (ixtiyoriy)"
            helperText="Agar mavjud bo'lsa, ijara raqamini kiriting"
          />

          {/* Complaint Text */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <FileText className="inline w-4 h-4 mr-1" />
              Shikoyat matni
            </label>
            <textarea
              {...register('complaintText', {
                required: 'Shikoyat matnini kiriting',
                minLength: { value: 10, message: 'Kamida 10 ta belgi kiriting' },
              })}
              rows={4}
              className={`block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                errors.complaintText ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
              }`}
              disabled={isReadOnly}
              placeholder="Shikoyat matnini batafsil yozing..."
            />
            {errors.complaintText && (
              <p className="text-sm text-red-600">{errors.complaintText.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Rasmlar
              </label>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Rasm yuklash</span>
                </Button>
              )}
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
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                    
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}

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
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={handleClose}>
              {isReadOnly ? 'Yopish' : 'Bekor qilish'}
            </Button>
            
            {!isReadOnly && (
              <Button type="submit" isLoading={isLoading}>
                {mode === 'create' ? 'Yaratish' : 'Saqlash'}
              </Button>
            )}
          </div>
        </form>
      </Modal>

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
    </>
  );
};