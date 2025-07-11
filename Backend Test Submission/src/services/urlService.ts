import { nanoid } from 'nanoid';
import { CreateUrlRequest, CreateUrlResponse, UrlRecord, ClickData } from '../types';
import Logger from '../../../Logging Middleware/logger';

const logger = Logger.getInstance();

export class UrlService {
  private static instance: UrlService;
  private urlDatabase: Map<string, UrlRecord> = new Map();

  private constructor() {}

  public static getInstance(): UrlService {
    if (!UrlService.instance) {
      UrlService.instance = new UrlService();
    }
    return UrlService.instance;
  }

  public async createShortUrl(request: CreateUrlRequest): Promise<CreateUrlResponse> {
    await logger.info('backend', 'service', 'Creating short URL');

    let shortcode = request.shortcode;

    // Generate shortcode if not provided
    if (!shortcode) {
      shortcode = nanoid(8);
      await logger.debug('backend', 'service', `Generated shortcode: ${shortcode}`);
    } else {
      // Validate custom shortcode
      if (!/^[a-zA-Z0-9_-]+$/.test(shortcode)) {
        await logger.error('backend', 'service', 'Invalid shortcode format');
        throw new Error('Invalid shortcode format');
      }

      // Check if shortcode already exists
      if (this.urlDatabase.has(shortcode)) {
        await logger.warn('backend', 'service', `Shortcode already exists: ${shortcode}`);
        throw new Error('Shortcode already exists');
      }
    }

    // Calculate expiry time (default 24 hours if not specified)
    const validityMinutes = request.validity || 24 * 60;
    const expiresAt = new Date(Date.now() + validityMinutes * 60 * 1000);
    const createdAt = new Date();

    const urlRecord: UrlRecord = {
      shortcode,
      originalUrl: request.url,
      createdAt,
      expiresAt,
      clicks: []
    };

    this.urlDatabase.set(shortcode, urlRecord);

    await logger.info('backend', 'service', `URL shortened successfully: ${shortcode}`);

    return {
      shortcode,
      shortUrl: `http://localhost:3000/${shortcode}`,
      originalUrl: request.url,
      expiresAt: expiresAt.toISOString(),
      createdAt: createdAt.toISOString()
    };
  }

  public async getUrlByShortcode(shortcode: string): Promise<UrlRecord | null> {
    await logger.debug('backend', 'service', `Looking up shortcode: ${shortcode}`);

    const urlRecord = this.urlDatabase.get(shortcode);

    if (!urlRecord) {
      await logger.warn('backend', 'service', `Shortcode not found: ${shortcode}`);
      return null;
    }

    // Check if URL has expired
    if (new Date() > urlRecord.expiresAt) {
      await logger.warn('backend', 'service', `URL expired: ${shortcode}`);
      this.urlDatabase.delete(shortcode);
      return null;
    }

    return urlRecord;
  }

  public async recordClick(shortcode: string, clickData: ClickData): Promise<void> {
    await logger.info('backend', 'service', `Recording click for: ${shortcode}`);

    const urlRecord = this.urlDatabase.get(shortcode);
    if (!urlRecord) {
      await logger.error('backend', 'service', `Cannot record click - URL not found: ${shortcode}`);
      return;
    }

    urlRecord.clicks.push({
      timestamp: new Date(),
      referrer: clickData.referrer,
      ip: clickData.ip,
      userAgent: clickData.userAgent,
      location: clickData.location
    });

    await logger.debug('backend', 'service', `Click recorded for: ${shortcode}`);
  }

  public getAllUrls(): UrlRecord[] {
    return Array.from(this.urlDatabase.values());
  }
}