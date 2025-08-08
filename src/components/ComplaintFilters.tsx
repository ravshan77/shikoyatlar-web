import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button.tsx';
import { Select } from './ui/Select.tsx';
import { BranchItem, ComplaintFilters } from '../types/complaint.types.ts';

interface ComplaintFiltersProps {
  filters: ComplaintFilters;
  onFiltersChange: (filters: Partial<ComplaintFilters>) => void;
  branches: BranchItem[];
  onAddComplaint: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  autoRefresh?: boolean;
  onAutoRefreshToggle?: (enabled: boolean) => void;
}

export const ComplaintFiltersComponent: React.FC<ComplaintFiltersProps> = ({
  filters,
  onFiltersChange,
  branches,
  onAddComplaint,
  onRefresh,
  isRefreshing = false,
  autoRefresh = true,
  onAutoRefreshToggle,
}) => {
  const statusOptions = [
    { value: '', label: 'Barchasi' },
    { value: 'in_progress', label: 'Jarayonda' },
    { value: 'completed', label: 'Yakunlangan' },
  ];

  const branchOptions = [
    { value: 0, label: 'Barchasi' },
    ...branches.map(branch => ({
      value: branch.id,
      label: branch.name,
    })),
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
          <div className="w-full sm:w-48">
            <Select
              label="Status"
              value={filters.status || ''}
              onChange={(value) => onFiltersChange({ status: value as string || null })}
              options={statusOptions}
            />
          </div>
          
          <div className="w-full sm:w-48">
            <Select
              label="Filial"
              value={filters.branchId || 0}
              onChange={(value) => onFiltersChange({ branchId: Number(value) || null })}
              options={branchOptions}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => onAutoRefreshToggle?.(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                autoRefresh ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  autoRefresh ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </label>
            <span className="text-sm text-gray-600">Avto yangilash</span>
          </div>

          {/* Refresh Button */}
          <Button
            variant="secondary"
            onClick={onRefresh}
            isLoading={isRefreshing}
            className="px-3 py-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Add Button */}
          <Button onClick={onAddComplaint} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Shikoyat qo'shish</span>
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.status || filters.branchId) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Faol filterlar:</span>
            
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {statusOptions.find(s => s.value === filters.status)?.label}
                <button
                  onClick={() => onFiltersChange({ status: null })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.branchId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Filial: {branches.find(b => b.id === filters.branchId)?.name}
                <button
                  onClick={() => onFiltersChange({ branchId: null })}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            
            <button
              onClick={() => onFiltersChange({ status: null, branchId: null })}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Barchasini tozalash
            </button>
          </div>
        </div>
      )}
    </div>
  );
};