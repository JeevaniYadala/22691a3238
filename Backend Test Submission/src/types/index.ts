export interface CreateUrlRequest {
  url: string;
  shortcode?: string;
  validity?: number; // in minutes
}

export interface CreateUrlResponse {
  shortcode: string;
  shortUrl: string;
  originalUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface UrlRecord {
  shortcode: string;
  originalUrl: string;
  createdAt: Date;
  expiresAt: Date;
  clicks: ClickRecord[];
}

export interface ClickRecord {
  timestamp: Date;
  referrer: string;
  ip: string;
  userAgent: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
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

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface ClickData {
  referrer: string;
  ip: string;
  userAgent: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
}