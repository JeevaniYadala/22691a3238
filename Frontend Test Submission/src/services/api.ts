import axios from 'axios';
import Logger from '../../../Logging Middleware/logger';

const logger = Logger.getInstance();

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  async (config) => {
    await logger.info('frontend', 'api', `Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  async (error) => {
    await logger.error('frontend', 'api', `Request error: ${error.message}`);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  async (response) => {
    await logger.info('frontend', 'api', `Received ${response.status} response from ${response.config.url}`);
    return response;
  },
  async (error) => {
    await logger.error('frontend', 'api', `Response error: ${error.response?.status} - ${error.message}`);
    return Promise.reject(error);
  }
);

export interface CreateUrlRequest {
  url: string;
  shortcode?: string;
  validity?: number;
}

export interface CreateUrlResponse {
  shortcode: string;
  shortUrl: string;
  originalUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface UrlStatsResponse {
  shortcode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  totalClicks: number;
  clicks: {
    timestamp: string;
    referrer: string;
    location: string;
  }[];
}

export const createShortUrl = async (request: CreateUrlRequest): Promise<CreateUrlResponse> => {
  try {
    const response = await api.post('/shorturls', request);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to create short URL';
    throw new Error(message);
  }
};

export const getUrlStats = async (shortcode: string): Promise<UrlStatsResponse> => {
  try {
    const response = await api.get(`/shorturls/${shortcode}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to get URL stats';
    throw new Error(message);
  }
};

export default api;