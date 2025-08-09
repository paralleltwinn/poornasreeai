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
  Storage as DatabaseIcon,
  Warning as WarningIcon,
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
  status: 'queued' | 'running' | 'completed' | 'failed' | 'initializing';
  progress: number;
  fileCount: number;
  createdBy: string;
  startedAt: string;
  completedAt?: string;
  currentStep?: string;
  error?: string;
  trainingSummary?: {
    filesProcessed?: number;
    totalContentSize?: number;
    weaviateConnected?: boolean;
    geminiConfigured?: boolean;
    chunksCreated?: number;
  };
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

interface DashboardStats {
  total_users: number;
  total_admins: number;
  total_engineers: number;
  total_customers: number;
  pending_engineers: number;
  active_users: number;
  inactive_users: number;
  approved_engineers?: number;
  rejected_engineers?: number;
  active_customers?: number;
}

interface AITrainingProps {
  stats?: DashboardStats | null;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  realTimePendingCount?: number;
}

// Constants
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const AITraining: React.FC<AITrainingProps> = () => {
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
  
  // Enhanced Features State
  const [filePreviewDialog, setFilePreviewDialog] = useState(false);
  const [selectedFilePreview, setSelectedFilePreview] = useState<{
    file_id: string;
    filename: string;
    content_preview: string;
    content_length: number;
    extraction_method: string;
    pages_processed?: number;
    content_quality: string;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [processingDetails, setProcessingDetails] = useState<{
    pdf_files_processed?: number;
    enhanced_extraction?: boolean;
    weaviate_integration?: boolean;
    text_extraction_method?: string;
  }>({});
  
  // Vector Database Management State
  const [vectorDbStatus, setVectorDbStatus] = useState<{
    connected: boolean;
    collections: Array<{
      name: string;
      object_count: number;
      size: string;
    }>;
    total_objects: number;
    total_size: string;
    last_updated: string;
    error?: string;
  } | null>(null);
  const [vectorDbLoading, setVectorDbLoading] = useState(false);
  const [clearDatabaseLoading, setClearDatabaseLoading] = useState(false);
  const [clearCollectionLoading, setClearCollectionLoading] = useState(false);
  const [vectorDbDialogOpen, setVectorDbDialogOpen] = useState(false);
  const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false);
  const [clearAction, setClearAction] = useState<'database' | 'collection' | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('');

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
        console.error('❌ No auth token available');
        showError('Authentication required. Please login again.');
        return;
      }

      console.log('🔄 Fetching training files from:', `${API_BASE}/ai/training-files`);
      console.log('🔑 Using token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`${API_BASE}/ai/training-files`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Training files response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Training files API response:', data);
        console.log('📊 Response type:', typeof data, 'Is array:', Array.isArray(data));
        
        // Handle different response formats from backend
        let files = [];
        if (data.success && data.files) {
          files = data.files;
          console.log('🔍 Found files in data.files:', files.length);
        } else if (data.files) {
          files = data.files;
          console.log('🔍 Found files in data.files (no success field):', files.length);
        } else if (Array.isArray(data)) {
          files = data;
          console.log('🔍 Data is array:', files.length);
        } else {
          console.log('❓ Unexpected response format:', data);
        }
        
        if (files && files.length > 0) {
          console.log('📄 Raw files data:', files);
          const formattedFiles = files.map((file: ApiFileResponse) => ({
            id: file.file_id,
            name: file.filename,
            size: file.size,
            type: file.content_type,
            uploadedAt: file.uploaded_at,
          }));
          setUploadedFiles(formattedFiles);
          console.log(`✅ Successfully loaded ${formattedFiles.length} uploaded files`);
          console.log('📁 Formatted files:', formattedFiles);
        } else {
          setUploadedFiles([]);
          console.log('⚠️ No training files found or empty array');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to load uploaded files. Status:', response.status, 'Response:', errorText);
        
        if (response.status === 401) {
          showError('Authentication expired. Please login again.');
        } else if (response.status === 403) {
          showError('Access denied. Admin permissions required.');
        } else {
          showError('Failed to load training files. Please try again.');
        }
      }
    } catch (error) {
      console.error('💥 Error loading uploaded files:', error);
      showError('Network error while loading files. Please check your connection.');
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

  // Enhanced file upload with PDF processing feedback
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

      // Count file types for enhanced feedback
      const fileTypeCounts = {
        pdf: selectedFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')).length,
        doc: selectedFiles.filter(f => f.type.includes('word') || f.name.toLowerCase().match(/\.(doc|docx)$/)).length,
        text: selectedFiles.filter(f => f.type === 'text/plain' || f.name.toLowerCase().endsWith('.txt')).length,
        json: selectedFiles.filter(f => f.type === 'application/json' || f.name.toLowerCase().endsWith('.json')).length,
        csv: selectedFiles.filter(f => f.type === 'text/csv' || f.name.toLowerCase().endsWith('.csv')).length,
      };

      console.log('📊 Uploading file types:', fileTypeCounts);

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Progress simulation with enhanced feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);

      console.log('🚀 Starting enhanced upload with PDF text extraction...');

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
        console.log('✅ Enhanced upload response:', data);
        
        // Extract processing details for enhanced feedback
        const processingInfo = data.processing_details || {};
        setProcessingDetails(processingInfo);
        
        let successMessage = `Successfully uploaded ${data.files_processed || selectedFiles.length} files`;
        
        // Add enhanced processing details to success message
        if (fileTypeCounts.pdf > 0) {
          successMessage += ` (${fileTypeCounts.pdf} PDF${fileTypeCounts.pdf > 1 ? 's' : ''} with enhanced text extraction)`;
        }
        
        if (processingInfo.enhanced_extraction) {
          successMessage += '. Enhanced PDF text extraction completed.';
        }
        
        showSuccess(successMessage);
        setSelectedFiles([]);
        setUploadDialogOpen(false);
        
        // Reload files and jobs to update the UI
        console.log('🔄 Reloading uploaded files after enhanced upload...');
        await loadUploadedFiles();
        
        // If no files loaded immediately, retry after a short delay
        setTimeout(() => {
          console.log('⏰ Delayed reload of uploaded files...');
          loadUploadedFiles();
        }, 1000);
        
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(errorData.detail || 'Failed to upload files');
      }
    } catch (error) {
      console.error('❌ Enhanced upload error:', error);
      showError(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Enhanced file content preview function
  const handleFilePreview = async (fileId: string, filename: string) => {
    setPreviewLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        showError('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE}/ai/training-files/${fileId}/preview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const previewData = await response.json();
        setSelectedFilePreview({
          file_id: fileId,
          filename: filename,
          content_preview: previewData.content_preview,
          content_length: previewData.content_length,
          extraction_method: previewData.extraction_method,
          pages_processed: previewData.pages_processed,
          content_quality: previewData.content_quality
        });
        setFilePreviewDialog(true);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to get preview' }));
        showError(errorData.detail || 'Failed to get file preview');
      }
    } catch (error) {
      console.error('Preview error:', error);
      showError('Failed to load file preview');
    } finally {
      setPreviewLoading(false);
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
        body: JSON.stringify(selectedFileIds),
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

  // =============================================================================
  // VECTOR DATABASE MANAGEMENT FUNCTIONS
  // =============================================================================

  // Get vector database status
  const loadVectorDbStatus = useCallback(async () => {
    setVectorDbLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_BASE}/ai/vector-database/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVectorDbStatus(data);
        console.log('✅ Vector database status loaded:', data);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to load vector database status' }));
        throw new Error(errorData.detail || 'Failed to load vector database status');
      }
    } catch (error) {
      console.error('Vector database status error:', error);
      showError(error instanceof Error ? error.message : 'Failed to load vector database status');
    } finally {
      setVectorDbLoading(false);
    }
  }, [showError]);

  // Clear entire vector database
  const handleClearDatabase = async () => {
    setClearDatabaseLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_BASE}/ai/vector-database/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(`Vector database cleared successfully. Deleted ${data.deleted_objects || 0} objects from ${data.deleted_collections?.length || 0} collections.`);
        await loadVectorDbStatus(); // Refresh status
        setConfirmClearDialogOpen(false);
        setClearAction(null);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to clear vector database' }));
        throw new Error(errorData.detail || 'Failed to clear vector database');
      }
    } catch (error) {
      console.error('Clear database error:', error);
      showError(error instanceof Error ? error.message : 'Failed to clear vector database');
    } finally {
      setClearDatabaseLoading(false);
    }
  };

  // Clear specific collection
  const handleClearCollection = async (collectionName: string) => {
    setClearCollectionLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_BASE}/ai/vector-database/collection/${encodeURIComponent(collectionName)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(`Collection "${collectionName}" cleared successfully. Deleted ${data.deleted_objects || 0} objects.`);
        await loadVectorDbStatus(); // Refresh status
        setConfirmClearDialogOpen(false);
        setClearAction(null);
        setSelectedCollection('');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to clear collection' }));
        throw new Error(errorData.detail || 'Failed to clear collection');
      }
    } catch (error) {
      console.error('Clear collection error:', error);
      showError(error instanceof Error ? error.message : 'Failed to clear collection');
    } finally {
      setClearCollectionLoading(false);
    }
  };

  // Confirm clear action
  const handleConfirmClear = () => {
    if (clearAction === 'database') {
      handleClearDatabase();
    } else if (clearAction === 'collection' && selectedCollection) {
      handleClearCollection(selectedCollection);
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
      case 'initializing': return theme.palette.info.main;
      case 'queued': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  // Load vector database status when dialog opens
  useEffect(() => {
    if (vectorDbDialogOpen) {
      loadVectorDbStatus();
    }
  }, [vectorDbDialogOpen, loadVectorDbStatus]);

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
        <Button
          variant="outlined"
          startIcon={<DatabaseIcon />}
          onClick={() => setVectorDbDialogOpen(true)}
          sx={{ borderColor: theme.palette.info.main, color: theme.palette.info.main }}
        >
          Vector Database
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Training Files ({uploadedFiles.length})
                </Typography>
                <IconButton size="small" onClick={loadUploadedFiles} title="Refresh files">
                  <RefreshIcon />
                </IconButton>
              </Box>
              
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          edge="end"
                          aria-label="preview"
                          onClick={() => handleFilePreview(file.id, file.name)}
                          disabled={previewLoading}
                          size="small"
                          title="Preview extracted content"
                        >
                          {previewLoading ? (
                            <LoadingAnimation size={16} />
                          ) : (
                            <FileIcon fontSize="small" color="primary" />
                          )}
                        </IconButton>
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
                      </Box>
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
                      {(job.status === 'running' || job.status === 'initializing') && <LoadingAnimation size={20} />}
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
                          {(job.status === 'running' || job.status === 'initializing') && (
                            <Box sx={{ mt: 0.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {job.currentStep || 'Processing...'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {job.progress}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={job.progress} 
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          )}
                          {job.status === 'completed' && job.completedAt && (
                            <Typography variant="caption" color="success.main" display="block">
                              Completed: {new Date(job.completedAt).toLocaleString()}
                            </Typography>
                          )}
                          {job.status === 'failed' && job.error && (
                            <Typography variant="caption" color="error.main" display="block">
                              Error: {job.error}
                            </Typography>
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

      {/* Vector Database Management Dialog */}
      <Dialog 
        open={vectorDbDialogOpen} 
        onClose={() => setVectorDbDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DatabaseIcon />
          Vector Database Management
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Manage your trained AI model data stored in the Weaviate vector database. 
              These operations affect only the trained embeddings, not your original training files.
            </Alert>

            {/* Database Status Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                Database Status
                <Button 
                  size="small" 
                  startIcon={vectorDbLoading ? <LoadingAnimation size={16} /> : <RefreshIcon />}
                  onClick={loadVectorDbStatus}
                  disabled={vectorDbLoading}
                >
                  Refresh
                </Button>
              </Typography>
              
              {vectorDbStatus ? (
                <Paper sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Connection Status</Typography>
                      <Chip 
                        label={vectorDbStatus.connected ? 'Connected' : 'Disconnected'}
                        color={vectorDbStatus.connected ? 'success' : 'error'}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Total Objects</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {vectorDbStatus.total_objects || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Total Size</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {vectorDbStatus.total_size || 'Unknown'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Collections</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {vectorDbStatus.collections?.length || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {vectorDbStatus.collections && vectorDbStatus.collections.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Collections Detail:
                      </Typography>
                      {vectorDbStatus.collections.map((collection, index: number) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                          <Typography variant="body2">{collection.name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {collection.object_count} objects ({collection.size})
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              ) : (
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    Click &quot;Refresh&quot; to load database status
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Management Actions */}
            <Typography variant="h6" sx={{ mb: 2 }}>Management Actions</Typography>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={clearDatabaseLoading ? <LoadingAnimation size={16} /> : <WarningIcon />}
                onClick={() => {
                  setClearAction('database');
                  setConfirmClearDialogOpen(true);
                }}
                disabled={clearDatabaseLoading || clearCollectionLoading}
                fullWidth
              >
                Clear Entire Database
              </Button>
              
              {vectorDbStatus?.collections && vectorDbStatus.collections.length > 0 && (
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Clear Specific Collection:
                  </Typography>
                  {vectorDbStatus.collections.map((collection, index: number) => (
                    <Button
                      key={index}
                      variant="outlined"
                      color="warning"
                      size="small"
                      startIcon={clearCollectionLoading ? <LoadingAnimation size={16} /> : <DeleteIcon />}
                      onClick={() => {
                        setClearAction('collection');
                        setSelectedCollection(collection.name);
                        setConfirmClearDialogOpen(true);
                      }}
                      disabled={clearDatabaseLoading || clearCollectionLoading}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Clear &quot;{collection.name}&quot; ({collection.object_count})
                    </Button>
                  ))}
                </Box>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVectorDbDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Clear Operations */}
      <Dialog
        open={confirmClearDialogOpen}
        onClose={() => setConfirmClearDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
          <WarningIcon />
          Confirm Destructive Action
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>⚠️ This action cannot be undone!</strong>
          </Alert>
          
          {clearAction === 'database' ? (
            <Typography>
              Are you sure you want to clear the <strong>entire vector database</strong>?
              <br /><br />
              This will permanently delete:
              <br />• All vector embeddings
              <br />• All trained model data
              <br />• All collections and their contents
              <br /><br />
              Your original training files will remain intact and can be used to retrain the model.
            </Typography>
          ) : clearAction === 'collection' && selectedCollection ? (
            <Typography>
              Are you sure you want to clear the <strong>&quot;{selectedCollection}&quot;</strong> collection?
              <br /><br />
              This will permanently delete:
              <br />• All vector embeddings in this collection
              <br />• All objects and their metadata
              <br /><br />
              Other collections and your original training files will remain intact.
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setConfirmClearDialogOpen(false);
              setClearAction(null);
              setSelectedCollection('');
            }}
            disabled={clearDatabaseLoading || clearCollectionLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmClear}
            variant="contained"
            color="warning"
            startIcon={(clearDatabaseLoading || clearCollectionLoading) ? <LoadingAnimation size={16} /> : <WarningIcon />}
            disabled={clearDatabaseLoading || clearCollectionLoading}
          >
            {clearAction === 'database' ? 'Clear Database' : 'Clear Collection'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced File Content Preview Dialog */}
      <Dialog
        open={filePreviewDialog}
        onClose={() => setFilePreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              📄 File Content Preview
            </Typography>
            <IconButton onClick={() => setFilePreviewDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFilePreview && (
            <Stack spacing={2}>
              <Alert severity="info">
                Enhanced PDF text extraction using {selectedFilePreview.extraction_method}
              </Alert>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Content Quality: ${selectedFilePreview.content_quality}`}
                  color={selectedFilePreview.content_quality === 'high' ? 'success' : 
                         selectedFilePreview.content_quality === 'medium' ? 'warning' : 'error'}
                />
                <Chip 
                  label={`${selectedFilePreview.content_length} characters`}
                  variant="outlined"
                />
                {selectedFilePreview.pages_processed && selectedFilePreview.pages_processed > 0 && (
                  <Chip 
                    label={`${selectedFilePreview.pages_processed} pages processed`}
                    variant="outlined"
                  />
                )}
              </Box>

              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', maxHeight: 400, overflow: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Extracted Content Preview:
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.5
                  }}
                >
                  {selectedFilePreview.content_preview}
                </Typography>
              </Paper>

              {processingDetails.enhanced_extraction && (
                <Alert severity="success">
                  ✅ This file was processed with enhanced PDF text extraction and is ready for AI training.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilePreviewDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AITraining;
