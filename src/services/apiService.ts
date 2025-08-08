import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BranchesResult, ComplaintsResult, ComplaintRequest, ImageUploadResponse, ComplaintResult } from '../types/complaint.types.ts';

class ApiService {
  private httpClient: AxiosInstance;
  // private readonly baseUrl = 'https://garant-hr.uz/api';
  private readonly baseUrl = 'http://10.100.104.120:8008/api';

  constructor() {
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.setAuthorizationHeader();
  }

  private setAuthorizationHeader(): void {
    const token = sessionStorage.getItem('userToken');
    this.httpClient.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  // get complaints list
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

      const response: AxiosResponse<ComplaintsResult> = await this.httpClient.post(`/call-center-complaint-index?page=${currentPage}`, filterData);

      return response.data;
    } catch (error) {
      console.error('Get complaints error:', error);
      throw error;
    }
  }

  // show
  async getComplaint(id: number ): Promise<ComplaintResult> {
    try {
      const response: AxiosResponse<ComplaintResult> = await this.httpClient.get(`/call-center-complaint-index-show/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get complaints error:', error);
      throw error;
    }
  }

  // update image
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

  // get branches
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

  // create complaint
  async createComplaint(complaint: ComplaintRequest): Promise<boolean> {
    try {
      const response = await this.httpClient.post('/call-center-complaint', complaint);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Create complaint error:', error);
      return false;
    }
  }

  // update complaint
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