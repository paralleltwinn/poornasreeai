'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Stack,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  Paper,
  Grid,
  Checkbox,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  DataObject as JsonIcon,
  Close as CloseIcon,
  ModelTraining as TrainingIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useSnackbar } from '@/contexts/SnackbarContext';

// Essential type definitions
interface ApiFileResponse {
  file_id: string;
  filename: string;
  size: number;
  content_type: string;
  uploaded_at: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface TrainingJob {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  fileCount: number;
  createdBy: string;
  startedAt: string;
  completedAt?: string;
}

interface ServiceHealth {
  service: string;
  connected?: boolean;
  configured?: boolean;
  status?: string;
  error?: string;
}

interface SystemHealth {
  overall_status: string;
  services: {
    weaviate?: ServiceHealth;
    google_ai?: ServiceHealth;
  };
}

// Constants
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const AITraining: React.FC = () => {
  const theme = useTheme();
  const { showSuccess, showError } = useSnackbar();

  // Essential state management
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [trainingName, setTrainingName] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [fileDeleteLoading, setFileDeleteLoading] = useState<string | null>(null);
  const [servicesHealth, setServicesHealth] = useState<SystemHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Refs for proper interval management
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingJobsRef = useRef(false);

  // Memoized value to track running jobs
  const hasRunningJobs = useMemo(() => {
    return trainingJobs.some(job => job.status === 'running');
  }, [trainingJobs]);

  // Health status helpers
  const getStatusColor = (service?: ServiceHealth) => {
    if (!service) return theme.palette.grey[500];
    if (service.connected || service.configured) return theme.palette.success.main;
    if (service.error) return theme.palette.error.main;
    return theme.palette.warning.main;
  };

  const getStatusIcon = (service?: ServiceHealth) => {
    if (!service) return <ErrorIcon />;
    if (service.connected || service.configured) return <SuccessIcon />;
    if (service.error) return <ErrorIcon />;
    return <PendingIcon />;
  };

  // System health check
  const checkSystemHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('No auth token available for health check');
        return;
      }

      const response = await fetch(`${API_BASE}/ai/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const healthData = await response.json();
        setServicesHealth(healthData);
        console.log('System health check successful:', healthData);
      } else {
        console.error('Health check failed:', response.status);
        setServicesHealth({
          overall_status: 'error',
          services: {
            weaviate: { service: 'Weaviate', status: 'error', error: 'Health check failed' },
            google_ai: { service: 'Google AI', status: 'error', error: 'Health check failed' }
          }
        });
      }
    } catch (error) {
      console.error('Health check error:', error);
      setServicesHealth({
        overall_status: 'degraded', 
        services: {
          weaviate: { service: 'Weaviate', status: 'error', error: String(error) },
          google_ai: { service: 'Google AI', status: 'error', error: String(error) }
        }
      });
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Load training jobs
  const loadTrainingJobs = useCallback(async () => {
    if (isLoadingJobsRef.current) {
      console.log('Skipping loadTrainingJobs - already loading');
      return;
    }
    
    isLoadingJobsRef.current = true;
    setIsLoadingJobs(true);
    try {
      const token = getAuthToken();
      if (!token) {
        showError('Authentication required. Please login again.');
        return;
      }

      console.log('Fetching training jobs...');
      const response = await fetch(`${API_BASE}/ai/training-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Training jobs response:', data);
        
        const jobs = data.jobs || data || [];
        setTrainingJobs(Array.isArray(jobs) ? jobs : []);
        console.log(`Successfully loaded ${jobs.length} training jobs`);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to load training jobs' }));
        console.error('Failed to fetch training jobs:', errorData);
        throw new Error(errorData.detail || 'Failed to load training jobs');
      }
    } catch (error) {
      console.error('Error loading training jobs:', error);
      showError(error instanceof Error ? error.message : 'Failed to load training jobs');
    } finally {
      isLoadingJobsRef.current = false;
      setIsLoadingJobs(false);
    }
  }, [showError]);

  // Load uploaded files
  const loadUploadedFiles = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        showError('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE}/ai/training-files`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.files) {
          const formattedFiles = data.files.map((file: ApiFileResponse) => ({
            id: file.file_id,
            name: file.filename,
            size: file.size,
            type: file.content_type,
            uploadedAt: file.uploaded_at,
          }));
          setUploadedFiles(formattedFiles);
          console.log(`Loaded ${formattedFiles.length} uploaded files`);
        }
      } else {
        console.error('Failed to load uploaded files');
      }
    } catch (error) {
      console.error('Error loading uploaded files:', error);
    }
  }, [showError]);

  // Load data on component mount
  useEffect(() => {
    console.log('AITraining component mounted, loading initial data...');
    loadTrainingJobs();
    loadUploadedFiles();
    checkSystemHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up real-time updates for running jobs
  useEffect(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (hasRunningJobs) {
      console.log('Setting up interval for running jobs...');
      pollingIntervalRef.current = setInterval(() => {
        console.log('Refreshing training jobs for running jobs...');
        loadTrainingJobs();
      }, 10000); // Update every 10 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        console.log('Clearing interval for running jobs...');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [hasRunningJobs, loadTrainingJobs]);

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/json',
        'text/csv'
      ];
      return validTypes.includes(file.type) || 
             file.name.toLowerCase().endsWith('.pdf') ||
             file.name.toLowerCase().endsWith('.doc') ||
             file.name.toLowerCase().endsWith('.docx') ||
             file.name.toLowerCase().endsWith('.txt') ||
             file.name.toLowerCase().endsWith('.json') ||
             file.name.toLowerCase().endsWith('.csv');
    });

    if (validFiles.length !== files.length) {
      showError('Some files were rejected. Only PDF, DOC, DOCX, TXT, JSON, and CSV files are supported.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // File upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showError('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 200);

      const response = await fetch(`${API_BASE}/ai/upload-training-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        showSuccess(`Successfully uploaded ${data.files_processed || selectedFiles.length} files`);
        setSelectedFiles([]);
        setUploadDialogOpen(false);
        await loadUploadedFiles();
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(errorData.detail || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Start training
  const handleStartTraining = async () => {
    if (!trainingName.trim()) {
      showError('Please enter a training name');
      return;
    }

    if (uploadedFiles.length === 0) {
      showError('Please upload files before starting training');
      return;
    }

    setIsTraining(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_BASE}/ai/start-training`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trainingName,
          file_ids: uploadedFiles.map(f => f.id),
          config: {
            learning_rate: 0.001,
            batch_size: 32,
            epochs: 10,
            max_tokens: 1024,
            temperature: 0.7
          }
        }),
      });

      if (response.ok) {
        showSuccess(`Training job "${trainingName}" started successfully`);
        setTrainingName('');
        setTrainingDialogOpen(false);
        await loadTrainingJobs();
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Training start failed' }));
        throw new Error(errorData.detail || 'Training start failed');
      }
    } catch (error) {
      console.error('Training start error:', error);
      showError(error instanceof Error ? error.message : 'Failed to start training');
    } finally {
      setIsTraining(false);
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId: string) => {
    setFileDeleteLoading(fileId);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_BASE}/ai/training-files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSuccess('File deleted successfully');
        await loadUploadedFiles();
        await loadTrainingJobs();
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Delete failed' }));
        throw new Error(errorData.detail || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showError(error instanceof Error ? error.message : 'Failed to delete file');
    } finally {
      setFileDeleteLoading(null);
    }
  };

  // Bulk delete files
  const handleBulkDelete = async () => {
    if (selectedFileIds.length === 0) {
      showError('Please select files to delete');
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_BASE}/ai/training-files`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_ids: selectedFileIds }),
      });

      if (response.ok) {
        showSuccess(`Successfully deleted ${selectedFileIds.length} files`);
        setSelectedFileIds([]);
        await loadUploadedFiles();
        await loadTrainingJobs();
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Bulk delete failed' }));
        throw new Error(errorData.detail || 'Bulk delete failed');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      showError(error instanceof Error ? error.message : 'Failed to delete files');
    }
  };

  // File type icon helper
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <PdfIcon color="error" />;
    if (type.includes('word') || type.includes('document')) return <DocIcon color="primary" />;
    if (type.includes('json')) return <JsonIcon color="warning" />;
    return <FileIcon />;
  };

  // Status color helper
  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'failed': return theme.palette.error.main;
      case 'running': return theme.palette.warning.main;
      case 'queued': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        AI Training Management
      </Typography>

      {/* System Health Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">System Health</Typography>
            <IconButton size="small" onClick={checkSystemHealth} disabled={healthLoading}>
              {healthLoading ? <LoadingAnimation size={20} /> : <RefreshIcon />}
            </IconButton>
          </Box>
          
          {servicesHealth && (
            <Grid container spacing={2}>
              {Object.entries(servicesHealth.services).map(([key, service]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getStatusIcon(service)}
                    <Box>
                      <Typography variant="subtitle2">{service?.service || key}</Typography>
                      <Chip 
                        label={service?.status || 'unknown'} 
                        size="small" 
                        sx={{ 
                          backgroundColor: getStatusColor(service),
                          color: 'white',
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Training Data
        </Button>
        <Button
          variant="contained"
          startIcon={<TrainingIcon />}
          onClick={() => setTrainingDialogOpen(true)}
          disabled={uploadedFiles.length === 0}
        >
          Start Training
        </Button>
        {selectedFileIds.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedFileIds.length})
          </Button>
        )}
      </Stack>

      <Grid container spacing={3}>
        {/* Training Files */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Training Files ({uploadedFiles.length})
              </Typography>
              
              {uploadedFiles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      if (selectedFileIds.length === uploadedFiles.length) {
                        setSelectedFileIds([]);
                      } else {
                        setSelectedFileIds(uploadedFiles.map(f => f.id));
                      }
                    }}
                  >
                    {selectedFileIds.length === uploadedFiles.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>
              )}

              <List>
                {uploadedFiles.map((file) => (
                  <ListItem key={file.id} dense>
                    <Checkbox
                      checked={selectedFileIds.includes(file.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFileIds(prev => [...prev, file.id]);
                        } else {
                          setSelectedFileIds(prev => prev.filter(id => id !== file.id));
                        }
                      }}
                      size="small"
                    />
                    <ListItemIcon>
                      {getFileIcon(file.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(1)} KB • ${new Date(file.uploadedAt).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteFile(file.id)}
                        disabled={fileDeleteLoading === file.id}
                        size="small"
                      >
                        {fileDeleteLoading === file.id ? (
                          <LoadingAnimation size={16} />
                        ) : (
                          <DeleteIcon fontSize="small" />
                        )}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {uploadedFiles.length === 0 && (
                  <ListItem>
                    <ListItemText 
                      primary="No training files uploaded"
                      secondary="Upload files to start training your AI model"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Training Jobs */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Training Jobs ({trainingJobs.length})
                </Typography>
                <IconButton size="small" onClick={loadTrainingJobs} disabled={isLoadingJobs}>
                  {isLoadingJobs ? <LoadingAnimation size={20} /> : <RefreshIcon />}
                </IconButton>
              </Box>

              <List>
                {trainingJobs.map((job) => (
                  <ListItem key={job.id} dense>
                    <ListItemIcon>
                      {job.status === 'completed' && <SuccessIcon color="success" />}
                      {job.status === 'failed' && <ErrorIcon color="error" />}
                      {job.status === 'running' && <LoadingAnimation size={20} />}
                      {job.status === 'queued' && <PendingIcon color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {job.name}
                          <Chip 
                            label={job.status} 
                            size="small" 
                            sx={{ 
                              backgroundColor: getJobStatusColor(job.status),
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Files: {job.fileCount} • Created: {new Date(job.startedAt).toLocaleDateString()}
                          </Typography>
                          {job.status === 'running' && (
                            <LinearProgress 
                              variant="determinate" 
                              value={job.progress} 
                              sx={{ mt: 0.5, height: 4 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {trainingJobs.length === 0 && (
                  <ListItem>
                    <ListItemText 
                      primary="No training jobs"
                      secondary="Start training to create your first AI model"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Training Data</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept=".pdf,.doc,.docx,.txt,.json,.csv"
              style={{ display: 'none' }}
              id="file-upload"
              multiple
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                Select Files
              </Button>
            </label>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Supported formats: PDF, DOC, DOCX, TXT, JSON, CSV
            </Typography>

            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Selected Files ({selectedFiles.length}):
                </Typography>
                <List>
                  {selectedFiles.map((file, index) => (
                    <ListItem key={index} dense>
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(1)} KB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => removeSelectedFile(index)}>
                          <CloseIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {isUploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Uploading... {uploadProgress.toFixed(0)}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={selectedFiles.length === 0 || isUploading}
            startIcon={isUploading ? <LoadingAnimation size={16} /> : <UploadIcon />}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Training Dialog */}
      <Dialog open={trainingDialogOpen} onClose={() => setTrainingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start Training</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Training Name"
            fullWidth
            variant="outlined"
            value={trainingName}
            onChange={(e) => setTrainingName(e.target.value)}
            sx={{ mt: 2 }}
          />
          
          <Alert severity="info" sx={{ mt: 2 }}>
            This will start training using {uploadedFiles.length} uploaded files.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrainingDialogOpen(false)} disabled={isTraining}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartTraining} 
            variant="contained" 
            disabled={!trainingName.trim() || isTraining}
            startIcon={isTraining ? <LoadingAnimation size={16} /> : <PlayIcon />}
          >
            Start Training
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AITraining;
