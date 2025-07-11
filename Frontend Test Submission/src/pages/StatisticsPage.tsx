import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  IconButton,
  Collapse
} from '@mui/material';
import { ExpandMore, ExpandLess, Visibility, Schedule, Link } from '@mui/icons-material';
import { getUrlStats } from '../services/api';
import Logger from '../../../Logging Middleware/logger';

const logger = Logger.getInstance();

interface UrlStats {
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

const StatisticsPage: React.FC = () => {
  const [urlStats, setUrlStats] = useState<UrlStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleExpanded = (shortcode: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(shortcode)) {
      newExpanded.delete(shortcode);
    } else {
      newExpanded.add(shortcode);
    }
    setExpandedCards(newExpanded);
  };

  const loadStatistics = async () => {
    await logger.info('frontend', 'page', 'Loading URL statistics');
    setLoading(true);
    setError(null);

    try {
      // In a real application, you would get the list of shortcodes from localStorage or a backend
      // For demo purposes, we'll use some example shortcodes
      const shortcodes = ['demo1', 'demo2', 'test123']; // This would come from your app state
      const stats: UrlStats[] = [];

      for (const shortcode of shortcodes) {
        try {
          const stat = await getUrlStats(shortcode);
          stats.push(stat);
        } catch (err) {
          // Skip URLs that don't exist or have expired
          await logger.warn('frontend', 'page', `Could not load stats for ${shortcode}`);
        }
      }

      setUrlStats(stats);
      await logger.info('frontend', 'page', `Loaded statistics for ${stats.length} URLs`);
    } catch (err: any) {
      await logger.error('frontend', 'page', `Error loading statistics: ${err.message}`);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        URL Statistics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {urlStats.length === 0 && !loading && (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No URL statistics available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create some short URLs first to see statistics here.
          </Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {urlStats.map((stat) => (
          <Grid item xs={12} key={stat.shortcode}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Link color="primary" />
                      <Typography variant="h6" color="primary">
                        /{stat.shortcode}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Original URL:
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 2 }}>
                      {stat.originalUrl}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Visibility />}
                        label={`${stat.totalClicks} clicks`}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Schedule />}
                        label={`Created: ${new Date(stat.createdAt).toLocaleDateString()}`}
                        variant="outlined"
                      />
                      <Chip
                        label={`Expires: ${new Date(stat.expiresAt).toLocaleDateString()}`}
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <IconButton
                    onClick={() => toggleExpanded(stat.shortcode)}
                    disabled={stat.totalClicks === 0}
                  >
                    {expandedCards.has(stat.shortcode) ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>

                <Collapse in={expandedCards.has(stat.shortcode)}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Click History
                    </Typography>
                    
                    {stat.clicks.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No clicks recorded yet.
                      </Typography>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Timestamp</TableCell>
                              <TableCell>Referrer</TableCell>
                              <TableCell>Location</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stat.clicks.map((click, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {new Date(click.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {click.referrer || 'Direct'}
                                </TableCell>
                                <TableCell>
                                  {click.location}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatisticsPage;