'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  CloudDone as WeaviateIcon,
  SmartToy as GoogleAIIcon,
  Storage as DatabaseIcon,
  Refresh as RefreshIcon,
  CheckCircle as HealthyIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface AIHealthStatus {
  timestamp: string;
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    weaviate: {
      service: string;
      available: boolean;
      connected: boolean;
      cluster_name: string;
      url: string;
      version?: string;
      modules?: string[];
      error?: string;
    };
    google_ai: {
      service: string;
      available: boolean;
      configured: boolean;
      model: string;
      status?: string;
      error?: string;
    };
  };
  errors?: string[];
}

interface ServiceStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  connected?: boolean;
  available?: boolean;
  configured?: boolean;
  version?: string;
  url?: string;
  cluster_name?: string;
  model?: string;
  database_name?: string;
  uptime?: string;
  total_connections?: number;
  error?: string;
  timestamp: string;
}

interface SystemStatusIndicatorsProps {
  showTitle?: boolean;
  showRefreshButton?: boolean;
  compact?: boolean;
}

const SystemStatusIndicators: React.FC<SystemStatusIndicatorsProps> = ({
  showTitle = true,
  showRefreshButton = true,
  compact = false,
}) => {
  const [aiHealthStatus, setAiHealthStatus] = useState<AIHealthStatus | null>(null);
  const [databaseStatus, setDatabaseStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch AI services health
      const aiResponse = await fetch('http://localhost:8000/api/v1/ai/health');
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        setAiHealthStatus(aiData);
      }

      // Fetch database health
      const dbResponse = await fetch('http://localhost:8000/api/v1/database/health');
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        setDatabaseStatus({
          service: dbData.service,
          status: dbData.connected ? 'healthy' : 'unhealthy',
          connected: dbData.connected,
          version: dbData.version,
          database_name: dbData.database_name,
          uptime: dbData.uptime,
          total_connections: dbData.total_connections,
          error: dbData.error,
          timestamp: dbData.timestamp,
        });
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch system status:', err);
      setError('Failed to fetch system status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <HealthyIcon sx={{ fontSize: 16 }} />;
      case 'degraded':
        return <WarningIcon sx={{ fontSize: 16 }} />;
      case 'unhealthy':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      default:
        return <InfoIcon sx={{ fontSize: 16 }} />;
    }
  };

  const formatUptime = (uptime?: string) => {
    if (!uptime) return 'N/A';
    return uptime;
  };

  if (compact) {
    return (
      <Box sx={{ mb: 2 }}>
        {loading && <LinearProgress sx={{ mb: 1 }} />}
        
        <Grid container spacing={1}>
          {/* Database Status */}
          <Grid item xs={4}>
            <Tooltip title={`Database: ${databaseStatus?.connected ? 'Connected' : 'Disconnected'}`}>
              <Chip
                icon={<DatabaseIcon sx={{ fontSize: 16 }} />}
                label="DB"
                color={getStatusColor(databaseStatus?.status || 'unknown')}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          </Grid>

          {/* Weaviate Status */}
          <Grid item xs={4}>
            <Tooltip title={`Weaviate: ${aiHealthStatus?.services?.weaviate?.connected ? 'Connected' : 'Disconnected'}`}>
              <Chip
                icon={<WeaviateIcon sx={{ fontSize: 16 }} />}
                label="AI-DB"
                color={getStatusColor(aiHealthStatus?.services?.weaviate?.connected ? 'healthy' : 'unhealthy')}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          </Grid>

          {/* Google AI Status */}
          <Grid item xs={4}>
            <Tooltip title={`Google AI: ${aiHealthStatus?.services?.google_ai?.configured ? 'Configured' : 'Not Configured'}`}>
              <Chip
                icon={<GoogleAIIcon sx={{ fontSize: 16 }} />}
                label="Gemini"
                color={getStatusColor(aiHealthStatus?.services?.google_ai?.configured ? 'healthy' : 'unhealthy')}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card elevation={2}>
        <CardContent>
          {showTitle && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                System Status
              </Typography>
              {showRefreshButton && (
                <Tooltip title="Refresh Status">
                  <IconButton 
                    size="small" 
                    onClick={fetchSystemStatus}
                    disabled={loading}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Database Status */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <DatabaseIcon sx={{ fontSize: 32, color: getStatusColor(databaseStatus?.status || 'unknown') + '.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  MySQL Database
                </Typography>
                <Chip
                  icon={getStatusIcon(databaseStatus?.status || 'unknown')}
                  label={databaseStatus?.connected ? 'Connected' : 'Disconnected'}
                  color={getStatusColor(databaseStatus?.status || 'unknown')}
                  size="small"
                  sx={{ mt: 1 }}
                />
                {databaseStatus && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" display="block">
                      DB: {databaseStatus.database_name}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Version: {databaseStatus.version || 'N/A'}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Uptime: {formatUptime(databaseStatus.uptime)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Connections: {databaseStatus.total_connections || 0}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Weaviate Status */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <WeaviateIcon sx={{ 
                  fontSize: 32, 
                  color: aiHealthStatus?.services?.weaviate?.connected ? 'success.main' : 'error.main',
                  mb: 1 
                }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Weaviate Vector DB
                </Typography>
                <Chip
                  icon={getStatusIcon(aiHealthStatus?.services?.weaviate?.connected ? 'healthy' : 'unhealthy')}
                  label={aiHealthStatus?.services?.weaviate?.connected ? 'Connected' : 'Disconnected'}
                  color={aiHealthStatus?.services?.weaviate?.connected ? 'success' : 'error'}
                  size="small"
                  sx={{ mt: 1 }}
                />
                {aiHealthStatus?.services?.weaviate && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" display="block">
                      Cluster: {aiHealthStatus.services.weaviate.cluster_name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Version: {aiHealthStatus.services.weaviate.version || 'N/A'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ 
                      color: aiHealthStatus.services.weaviate.available ? 'success.main' : 'error.main' 
                    }}>
                      {aiHealthStatus.services.weaviate.available ? 'Available' : 'Unavailable'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Google AI Status */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <GoogleAIIcon sx={{ 
                  fontSize: 32, 
                  color: aiHealthStatus?.services?.google_ai?.configured ? 'success.main' : 'error.main',
                  mb: 1 
                }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Google AI (Gemini)
                </Typography>
                <Chip
                  icon={getStatusIcon(aiHealthStatus?.services?.google_ai?.configured ? 'healthy' : 'unhealthy')}
                  label={aiHealthStatus?.services?.google_ai?.configured ? 'Configured' : 'Not Configured'}
                  color={aiHealthStatus?.services?.google_ai?.configured ? 'success' : 'error'}
                  size="small"
                  sx={{ mt: 1 }}
                />
                {aiHealthStatus?.services?.google_ai && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" display="block">
                      Model: {aiHealthStatus.services.google_ai.model || 'N/A'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ 
                      color: aiHealthStatus.services.google_ai.available ? 'success.main' : 'error.main' 
                    }}>
                      {aiHealthStatus.services.google_ai.available ? 'Available' : 'Unavailable'}
                    </Typography>
                    {aiHealthStatus.services.google_ai.status && (
                      <Typography variant="caption" display="block">
                        Status: {aiHealthStatus.services.google_ai.status}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          {lastUpdated && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            </Box>
          )}

          {/* Overall Status Summary */}
          {aiHealthStatus && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Chip
                  icon={getStatusIcon(aiHealthStatus.overall_status)}
                  label={`Overall System: ${aiHealthStatus.overall_status?.toUpperCase()}`}
                  color={getStatusColor(aiHealthStatus.overall_status)}
                  variant="outlined"
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SystemStatusIndicators;
