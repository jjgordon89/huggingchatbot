
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { errorService } from '@/lib/errorHandling';

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ApiService {
  private axiosInstance: AxiosInstance;
  private retries: number;
  private retryDelay: number;

  constructor(config: ApiConfig = {}) {
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;

    this.axiosInstance = axios.create({
      timeout: config.timeout || 30000,
      baseURL: config.baseURL,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add common headers, auth tokens, etc.
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

        // Don't retry if already retrying or if it's a client error (4xx)
        if (
          originalRequest._retry ||
          !originalRequest ||
          (error.response && error.response.status >= 400 && error.response.status < 500)
        ) {
          return Promise.reject(error);
        }

        // Retry logic for network errors or 5xx errors
        if (
          !error.response ||
          (error.response.status >= 500) ||
          error.code === 'NETWORK_ERROR' ||
          error.code === 'ECONNABORTED'
        ) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

          if (originalRequest._retryCount <= this.retries) {
            originalRequest._retry = true;
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * originalRequest._retryCount!));
            
            return this.axiosInstance(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      errorService.handleApiError(error, `GET ${url}`);
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      errorService.handleApiError(error, `POST ${url}`);
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      errorService.handleApiError(error, `PUT ${url}`);
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      errorService.handleApiError(error, `DELETE ${url}`);
      throw error;
    }
  }

  setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }
}

// Create default instance
export const apiService = new ApiService();

// Specialized API services
export const huggingFaceApi = new ApiService({
  baseURL: 'https://api-inference.huggingface.co',
  timeout: 60000, // Longer timeout for AI models
  retries: 2
});

export const openAiApi = new ApiService({
  baseURL: 'https://api.openai.com/v1',
  timeout: 60000,
  retries: 2
});
