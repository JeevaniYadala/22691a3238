import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Chip
} from '@mui/material';
import { Add, Delete, ContentCopy, Link } from '@mui/icons-material';
import { createShortUrl } from '../services/api';
import Logger from '../../../Logging Middleware/logger';

const logger = Logger.getInstance();

interface UrlEntry {
  id: number;
  url: string;
  shortcode: string;
  validity: number;
}

interface ShortenedUrl {
  shortcode: string;
  shortUrl: string;
  originalUrl: string;
  expiresAt: string;
  createdAt: string;
}

const UrlShortenerPage: React.FC = () => {
  const [urlEntries, setUrlEntries] = useState<UrlEntry[]>([
    { id: 1, url: '', shortcode: '', validity: 1440 }
  ]);
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addUrlEntry = async () => {
    await logger.info('frontend', 'page', 'Adding new URL entry');
    if (urlEntries.length < 5) {
      const newId = Math.max(...urlEntries.map(entry => entry.id)) + 1;
      setUrlEntries([...urlEntries, { id: newId, url: '', shortcode: '', validity: 1440 }]);
    }
  };

  const removeUrlEntry = async (id: number) => {
    await logger.info('frontend', 'page', `Removing URL entry: ${id}`);
    setUrlEntries(urlEntries.filter(entry => entry.id !== id));
  };

  const updateUrlEntry = (id: number, field: keyof UrlEntry, value: string | number) => {
    setUrlEntries(urlEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    await logger.info('frontend', 'page', 'Submitting URLs for shortening');
    setLoading(true);
    setError(null);
    
    const validEntries = urlEntries.filter(entry => entry.url.trim() !== '');
    
    if (validEntries.length === 0) {
      setError('Please enter at least one URL');
      setLoading(false);
      return;
    }

    // Validate URLs
    for (const entry of validEntries) {
      if (!validateUrl(entry.url)) {
        setError(`Invalid URL: ${entry.url}`);
        setLoading(false);
        return;
      }
    }

    try {
      const results: ShortenedUrl[] = [];
      
      for (const entry of validEntries) {
        const result = await createShortUrl({
          url: entry.url,
          shortcode: entry.shortcode || undefined,
          validity: entry.validity
        });
        results.push(result);
      }

      setShortenedUrls(prev => [...prev, ...results]);
      setSuccess(`Successfully shortened ${results.length} URL(s)`);
      
      // Reset form
      setUrlEntries([{ id: 1, url: '', shortcode: '', validity: 1440 }]);
      
      await logger.info('frontend', 'page', `Successfully shortened ${results.length} URLs`);
    } catch (err: any) {
      await logger.error('frontend', 'page', `Error shortening URLs: ${err.message}`);
      setError(err.message || 'Failed to shorten URLs');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        URL Shortener
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Enter URLs to Shorten (Max 5)
        </Typography>

        {urlEntries.map((entry, index) => (
          <Grid container spacing={2} key={entry.id} sx={{ mb: 2 }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label={`URL ${index + 1}`}
                value={entry.url}
                onChange={(e) => updateUrlEntry(entry.id, 'url', e.target.value)}
                placeholder="https://example.com"
                error={entry.url !== '' && !validateUrl(entry.url)}
                helperText={entry.url !== '' && !validateUrl(entry.url) ? 'Invalid URL format' : ''}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Custom Shortcode (Optional)"
                value={entry.shortcode}
                onChange={(e) => updateUrlEntry(entry.id, 'shortcode', e.target.value)}
                placeholder="my-link"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Validity (minutes)"
                value={entry.validity}
                onChange={(e) => updateUrlEntry(entry.id, 'validity', parseInt(e.target.value) || 1440)}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {urlEntries.length > 1 && (
                  <IconButton 
                    color="error" 
                    onClick={() => removeUrlEntry(entry.id)}
                    size="large"
                  >
                    <Delete />
                  </IconButton>
                )}
                {index === urlEntries.length - 1 && urlEntries.length < 5 && (
                  <IconButton 
                    color="primary" 
                    onClick={addUrlEntry}
                    size="large"
                  >
                    <Add />
                  </IconButton>
                )}
              </Box>
            </Grid>
          </Grid>
        ))}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={<Link />}
          >
            {loading ? 'Shortening...' : 'Shorten URLs'}
          </Button>
        </Box>
      </Paper>

      {shortenedUrls.length > 0 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Shortened URLs
          </Typography>
          
          <Grid container spacing={2}>
            {shortenedUrls.map((url, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Original URL:
                        </Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
                          {url.originalUrl}
                        </Typography>
                        
                        <Typography variant="subtitle2" color="text.secondary">
                          Short URL:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                            {url.shortUrl}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(url.shortUrl)}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                          label={`Expires: ${new Date(url.expiresAt).toLocaleString()}`}
                          size="small"
                          color="secondary"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UrlShortenerPage;