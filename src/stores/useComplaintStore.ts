import { create } from 'zustand';
import { UserSession, ComplaintFilters } from '../types/complaint.types.ts';

interface ComplaintStore {
  // User session
  userSession: UserSession | null;
  setUserSession: (session: UserSession | null) => void;
  
  // Filters
  filters: ComplaintFilters;
  setFilters: (filters: Partial<ComplaintFilters>) => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Auto refresh
  autoRefresh: boolean;
  setAutoRefresh: (refresh: boolean) => void;
  
  // Reset store
  reset: () => void;
}

export const useComplaintStore = create<ComplaintStore>((set) => ({
  // User session
  userSession: null,
  setUserSession: (session) => set({ userSession: session }),
  
  // Filters
  filters: {
    status: null,
    branchId: null,
  },
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    })),
  
  // Pagination
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  // Auto refresh
  autoRefresh: true,
  setAutoRefresh: (refresh) => set({ autoRefresh: refresh }),
  
  // Reset store
  reset: () =>
    set({
      userSession: null,
      filters: { status: null, branchId: null },
      currentPage: 1,
      isLoading: false,
      autoRefresh: true,
    }),
}));