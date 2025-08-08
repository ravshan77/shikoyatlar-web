import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AuthResponse,
  BranchesResult,
  ComplaintsResult,
  ComplaintRequest,
  ImageUploadResponse,
} from '../types/complaint.types.ts';

class ApiService {
  private httpClient: AxiosInstance;
  private readonly baseUrl = 'https://garant-hr.uz/api';

  constructor() {
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.setBasicAuthentication('login', 'password');
  }

  private setBasicAuthentication(username: string, password: string): void {
    const credentials = btoa(`${username}:${password}`);
    this.httpClient.defaults.headers['Authorization'] = `Basic ${credentials}`;
  }

  async authenticate(code: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.httpClient.post(
        '/call-center-complaint-code',
        { code }
      );
      return response.data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async getComplaints(
    currentPage: number = 1,
    status: string | null = null,
    branchId: number | null = null
  ): Promise<ComplaintsResult> {
    try {
      const filterData = {
        status: status === 'Barchasi' || !status ? null : status,
        branch_id: branchId === 0 ? null : branchId,
      };

      const response: AxiosResponse<ComplaintsResult> = await this.httpClient.post(
        `/call-center-complaint-index?page=${currentPage}`,
        filterData
      );

      return response.data;
    } catch (error) {
      console.error('Get complaints error:', error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse<ImageUploadResponse> = await this.httpClient.post(
        '/call-center-complaint-image-store',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.status ? response.data.result : null;
    } catch (error) {
      console.error('Upload image error:', error);
      return null;
    }
  }

  async getBranches(): Promise<BranchesResult> {
    try {
      const response: AxiosResponse<BranchesResult> = await this.httpClient.get(
        '/call-center-complaint-branch'
      );
      return response.data;
    } catch (error) {
      console.error('Get branches error:', error);
      throw error;
    }
  }

  async createComplaint(complaint: ComplaintRequest): Promise<boolean> {
    try {
      const response = await this.httpClient.post('/call-center-complaint', complaint);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Create complaint error:', error);
      return false;
    }
  }

  async updateComplaint(id: number, complaint: ComplaintRequest): Promise<boolean> {
    try {
      const response = await this.httpClient.put(`/call-center-complaint/${id}`, complaint);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Update complaint error:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();