import React from 'react';
import { Eye, Edit, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Table } from './ui/Table.tsx';
import { Button } from './ui/Button.tsx';
import { ComplaintResponse, PaginationInfo } from '../types/complaint.types.ts';

interface ComplaintsTableProps {
  complaints: ComplaintResponse[];
  pagination: PaginationInfo | null;
  loading: boolean;
  onView: (complaint: ComplaintResponse) => void;
  onEdit: (complaint: ComplaintResponse) => void;
  onPageChange: (page: number) => void;
}

export const ComplaintsTable: React.FC<ComplaintsTableProps> = ({
  complaints,
  pagination,
  loading,
  onView,
  onEdit,
  onPageChange,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_progress: {
        label: 'Jarayonda',
        className: 'bg-yellow-100 text-yellow-800',
      },
      completed: {
        label: 'Yakunlangan',
        className: 'bg-green-100 text-green-800',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: 'Noma\'lum',
      className: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleString('uz-UZ', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //   });
  // };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const columns = [
    {
      key: 'id' as keyof ComplaintResponse,
      label: 'ID',
      width: '60px',
      align: 'center' as const,
    },
    {
      key: 'client_name' as keyof ComplaintResponse,
      label: 'Mijoz ismi',
      width: '150px',
    },
    {
      key: 'client_phone_one' as keyof ComplaintResponse,
      label: 'Telefon',
      width: '130px',
    },
    {
      key: 'branch_name' as keyof ComplaintResponse,
      label: 'Filial',
      width: '120px',
    },
    {
      key: 'complaint_text' as keyof ComplaintResponse,
      label: 'Shikoyat matni',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate" title={value}>
            {truncateText(value)}
          </p>
        </div>
      ),
    },
    {
      key: 'status' as keyof ComplaintResponse,
      label: 'Status',
      width: '120px',
      align: 'center' as const,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'created_at' as keyof ComplaintResponse,
      label: 'Sana',
      width: '140px',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
    },
    {
      key: 'actions' as keyof ComplaintResponse | 'actions',
      label: 'Amallar',
      width: '120px',
      align: 'center' as const,
      render: (_, complaint: ComplaintResponse) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(complaint)}
            className="p-1"
            title="Ko'rish"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {complaint.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(complaint)}
              className="p-1"
              title="Tahrirlash"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const generatePageNumbers = () => {
    if (!pagination || pagination.last_page <= 1) return [];

    const currentPage = pagination.current_page;
    const totalPages = pagination.last_page;
    const delta = 2;
    
    const startPage = Math.max(1, currentPage - delta);
    const endPage = Math.min(totalPages, currentPage + delta);
    
    const pages: (number | string)[] = [];

    // Add first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    // Add pages around current
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <Table
        data={complaints}
        columns={columns}
        loading={loading}
        emptyMessage="Shikoyatlar topilmadi"
      />

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            {/* Results Info */}
            <div className="text-sm text-gray-600">
              {((pagination.current_page - 1) * pagination.per_page + 1)}-
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} / 
              {pagination.total} ta natija
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              {/* First Page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={pagination.current_page === 1}
                className="p-2"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              {/* Previous Page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page Numbers */}
              {generatePageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-1 text-gray-400">...</span>
                  ) : (
                    <Button
                      variant={page === pagination.current_page ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => onPageChange(page as number)}
                      className="min-w-[36px]"
                    >
                      {page}
                    </Button>
                  )}
                </React.Fragment>
              ))}

              {/* Next Page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Last Page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(pagination.last_page)}
                disabled={pagination.current_page === pagination.last_page}
                className="p-2"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};