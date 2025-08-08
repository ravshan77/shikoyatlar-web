export interface AuthResponse {
  status: boolean;
  message: string;
  data: {
    worker_id: number;
    worker_name: string;
  } | null;
}

export interface BranchItem {
  id: number;
  name: string;
}

export interface ComplaintResponse {
  id: number;
  status: string;
  client_name: string;
  client_phone_one: string;
  client_phone_two: string | null;
  complaint_text: string;
  rent_number: string;
  branch_id: number;
  branch_name: string;
  images: string[];
  worker_id: number;
  worker_name: string;
  created_at: string;
}

export interface ComplaintRequest {
  client_name: string;
  client_phone_one: string;
  client_phone_two: string | null;
  complaint_text: string;
  rent_number: string;
  branch_id: number;
  images: string[];
  worker_id: number;
  worker_name: string;
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ComplaintsResult {
  status: boolean;
  data: ComplaintResponse[];
  pagination: PaginationInfo;
}

export interface BranchesResult {
  status: boolean;
  data: BranchItem[];
}

export interface ImageUploadResponse {
  status: boolean;
  result: string;
}

export interface UserSession {
  workerId: number;
  workerName: string;
}

export interface ComplaintFilters {
  status: string | null;
  branchId: number | null;
}

export type ComplaintStatus = 'in_progress' | 'completed';

export interface ComplaintFormData {
  clientName: string;
  clientPhoneOne: string;
  clientPhoneTwo: string;
  complaintText: string;
  rentNumber: string;
  branchId: number;
  images: File[];
}