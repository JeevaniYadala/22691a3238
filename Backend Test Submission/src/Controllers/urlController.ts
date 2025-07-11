import { Request, Response } from 'express';
import { UrlService } from '../services/urlService';
import { CreateUrlRequest, ErrorResponse } from '../types';
import validator from 'validator';
import geoip from 'geoip-lite';
import Logger from '../../../Logging Middleware/logger';

const logger = Logger.getInstance();
const urlService = UrlService.getInstance();

export class UrlController {
  public async createShortUrl(req: Request, res: Response) {
    try {
      await logger.info('backend', 'controller', 'Received create short URL request');

      const { url, validity, shortcode }: CreateUrlRequest = req.body;

      // Validate required fields
      if (!url) {
        await logger.warn('backend', 'controller', 'Missing URL in request');
        return res.status(400).json({
          error: 'Bad Request',
          message: 'URL is required'
        } as ErrorResponse);
      }

      // Validate URL format
      if (!validator.isURL(url)) {
        await logger.warn('backend', 'controller', 'Invalid URL format');
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid URL format'
        } as ErrorResponse);
      }

      // Validate validity if provided
      if (validity !== undefined && (!Number.isInteger(validity) || validity <= 0)) {
        await logger.warn('backend', 'controller', 'Invalid validity period');
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Validity must be a positive integer'
        } as ErrorResponse);
      }

      const result = await urlService.createShortUrl({ url, validity, shortcode });
      
      await logger.info('backend', 'controller', 'Short URL created successfully');
      res.status(201).json(result);
    } catch (error) {
      await logger.error('backend', 'controller', `Error creating short URL: ${error.message}`);
      
      if (error.message === 'Shortcode already exists') {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Shortcode already exists'
        } as ErrorResponse);
      }

      if (error.message === 'Invalid shortcode format') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid shortcode format'
        } as ErrorResponse);
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create short URL'
      } as ErrorResponse);
    }
  }

  public async getUrlStats(req: Request, res: Response) {
    try {
      const { shortcode } = req.params;
      
      await logger.info('backend', 'controller', `Fetching stats for: ${shortcode}`);

      const urlRecord = await urlService.getUrlByShortcode(shortcode);

      if (!urlRecord) {
        await logger.warn('backend', 'controller', `URL not found: ${shortcode}`);
        return res.status(404).json({
          error: 'Not Found',
          message: 'Short URL not found or expired'
        } as ErrorResponse);
      }

      const stats = {
        shortcode: urlRecord.shortcode,
        originalUrl: urlRecord.originalUrl,
        createdAt: urlRecord.createdAt.toISOString(),
        expiresAt: urlRecord.expiresAt.toISOString(),
        totalClicks: urlRecord.clicks.length,
        clicks: urlRecord.clicks.map(click => ({
          timestamp: click.timestamp.toISOString(),
          referrer: click.referrer || 'Direct',
          location: `${click.location.city || 'Unknown'}, ${click.location.region || 'Unknown'}, ${click.location.country || 'Unknown'}`
        }))
      };

      await logger.info('backend', 'controller', `Stats retrieved for: ${shortcode}`);
      res.json(stats);
    } catch (error) {
      await logger.error('backend', 'controller', `Error fetching stats: ${error.message}`);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve URL stats'
      } as ErrorResponse);
    }
  }

  public async redirectToOriginalUrl(req: Request, res: Response) {
    try {
      const { shortcode } = req.params;
      
      await logger.info('backend', 'controller', `Redirect request for: ${shortcode}`);

      const urlRecord = await urlService.getUrlByShortcode(shortcode);

      if (!urlRecord) {
        await logger.warn('backend', 'controller', `URL not found for redirect: ${shortcode}`);
        return res.status(404).json({
          error: 'Not Found',
          message: 'Short URL not found or expired'
        } as ErrorResponse);
      }

      // Record the click
      const ip = req.ip || req.connection.remoteAddress || '';
      const geo = geoip.lookup(ip);
      const referrer = req.get('Referer') || '';
      const userAgent = req.get('User-Agent') || '';

      await urlService.recordClick(shortcode, {
        referrer,
        ip,
        userAgent,
        location: {
          country: geo?.country || 'Unknown',
          region: geo?.region || 'Unknown',
          city: geo?.city || 'Unknown'
        }
      });

      await logger.info('backend', 'controller', `Redirecting to: ${urlRecord.originalUrl}`);
      res.redirect(urlRecord.originalUrl);
    } catch (error) {
      await logger.error('backend', 'controller', `Error in redirect: ${error.message}`);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to redirect'
      } as ErrorResponse);
    }
  }
}
