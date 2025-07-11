import { Router } from 'express';
import { UrlController } from '../controllers/urlController';
import Logger from '../../../Logging Middleware/logger';

const logger = Logger.getInstance();
const router = Router();
const urlController = new UrlController();

// Create short URL
router.post('/shorturls', async (req, res) => {
  await logger.info('backend', 'route', 'POST /shorturls route accessed');
  await urlController.createShortUrl(req, res);
});

// Get URL statistics
router.get('/shorturls/:shortcode', async (req, res) => {
  await logger.info('backend', 'route', `GET /shorturls/${req.params.shortcode} route accessed`);
  await urlController.getUrlStats(req, res);
});

// Redirect to original URL
router.get('/:shortcode', async (req, res) => {
  await logger.info('backend', 'route', `GET /${req.params.shortcode} redirect route accessed`);
  await urlController.redirectToOriginalUrl(req, res);
});

export default router;