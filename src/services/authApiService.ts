import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthResponse } from '../types/complaint.types.ts';

class AuthApiService {
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

    this.setBasicAuthentication('callcenter', 'callcentergirl');
  }

  private setBasicAuthentication(username: string, password: string): void {
    const credentials = btoa(`${username}:${password}`);
    this.httpClient.defaults.headers['Authorization'] = `Basic ${credentials}`;
  }

  // authenticate user with 2FA code
  async authenticate(code: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.httpClient.post('/call-center-complaint-code', { code });
      return response.data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }


}

export const authApiService = new AuthApiService();