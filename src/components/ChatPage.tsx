'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  useTheme,
  Button,
  Chip,
  Avatar,
  Paper,
  Tooltip,
  Stack,
  Card,
  alpha,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
  Add as AddIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  FormatListBulleted as FormatListBulletedIcon,
  Tune as TuneIcon,
  AttachFile as AttachFileIcon,
  SmartToy as SmartToyIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from '../contexts/SnackbarContext';
import { appConfig } from '../config/app';
import LoadingAnimation from './LoadingAnimation';
import { 
  chatWithAI, 
  searchKnowledgeBase, 
  checkAIHealth,
  formatResponseWithSources,
  type ChatRequest,
} from '../utils/aiApi';
import { 
  saveCurrentConversation,
  createConversation,
  saveMessage,
  generateConversationTitle,
} from '../utils/chatHistoryApi';
import { Message } from '../types/chat';

// Parse AI structured troubleshooting response (concise PDF-style)
interface ParsedStructuredResponse {
  actionRequired?: string[];
  toolsNeeded?: string[];
  procedure?: { step: string; detail: string }[];
  resolution?: string[];
  raw: string;
  isStructured: boolean;
}

const parseStructuredTroubleshooting = (text: string): ParsedStructuredResponse => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const result: ParsedStructuredResponse = { raw: text, isStructured: false };
  let section: string | null = null;
  const proc: { step: string; detail: string }[] = [];
  
  for (const ln of lines) {
    const upper = ln.toUpperCase();
    if (upper.startsWith('ACTION REQUIRED')) { section = 'action'; result.actionRequired = []; result.isStructured = true; continue; }
    if (upper.startsWith('TOOLS NEEDED')) { section = 'tools'; result.toolsNeeded = []; result.isStructured = true; continue; }
    if (upper.startsWith('PROCEDURE')) { section = 'procedure'; result.isStructured = true; continue; }
    if (upper.startsWith('RESOLUTION')) { section = 'resolution'; result.resolution = []; result.isStructured = true; continue; }
    if (!section) continue;
    
    if (section === 'procedure') {
      const m = ln.match(/^([IVX]+)\.\s*(.*)$/); // Roman numeral
      if (m) {
        proc.push({ step: m[1], detail: m[2] });
      } else if (proc.length) {
        proc[proc.length - 1].detail += ' ' + ln;
      }
    } else if (section === 'action') {
      if (ln) (result.actionRequired as string[]).push(ln.replace(/^[-•]\s*/, ''));
    } else if (section === 'tools') {
      if (ln) (result.toolsNeeded as string[]).push(ln.replace(/^[-•]\s*/, ''));
    } else if (section === 'resolution') {
      if (ln) (result.resolution as string[]).push(ln.replace(/^[-•]\s*/, ''));
    }
  }
  if (proc.length) result.procedure = proc;
  return result;
};

const StructuredTroubleshootingView = ({ parsed }: { parsed: ParsedStructuredResponse }) => {
  const theme = useTheme();
  
  if (!parsed.isStructured) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Stack spacing={2} sx={{ mt: 1.5 }}>
        {parsed.actionRequired && (
          <Card 
            elevation={1}
            sx={{ 
              p: 2, 
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 24,
                  height: 24,
                }}
              >
                <FormatListBulletedIcon sx={{ fontSize: 14 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Action Required
              </Typography>
            </Box>
            <List dense>
              {parsed.actionRequired.map((action, i) => (
                <ListItem key={i} sx={{ pl: 0, py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={action}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { fontSize: '0.85rem', lineHeight: 1.4 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        )}
        
        {parsed.toolsNeeded && (
          <Card 
            elevation={1}
            sx={{ 
              p: 2, 
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              bgcolor: alpha(theme.palette.secondary.main, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  width: 24,
                  height: 24,
                }}
              >
                <BuildIcon sx={{ fontSize: 14 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Tools Needed
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {parsed.toolsNeeded.map((tool, i) => (
                <Chip 
                  key={i}
                  label={tool} 
                  variant="outlined"
                  size="small"
                  sx={{ 
                    fontSize: '0.75rem',
                    height: 24,
                    borderColor: alpha(theme.palette.secondary.main, 0.3),
                    color: theme.palette.secondary.main,
                  }} 
                />
              ))}
            </Box>
          </Card>
        )}
        
        {parsed.procedure && (
          <Card 
            elevation={1}
            sx={{ 
              p: 2, 
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              bgcolor: alpha(theme.palette.info.main, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.info.main,
                  width: 24,
                  height: 24,
                }}
              >
                <PsychologyIcon sx={{ fontSize: 14 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Procedure
              </Typography>
            </Box>
            <List dense>
              {parsed.procedure.map((step, i) => (
                <ListItem key={i} sx={{ pl: 0, alignItems: 'flex-start', py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Chip 
                      label={step.step} 
                      color="info" 
                      size="small"
                      sx={{ 
                        minWidth: 24,
                        height: 20, 
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }} 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={step.detail}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { fontSize: '0.85rem', lineHeight: 1.4, mt: 0.25 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        )}
        
        {parsed.resolution && (
          <Card 
            elevation={1}
            sx={{ 
              p: 2, 
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              bgcolor: alpha(theme.palette.success.main, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.success.main,
                  width: 24,
                  height: 24,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 14 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Resolution
              </Typography>
            </Box>
            <List dense>
              {parsed.resolution.map((resolution, i) => (
                <ListItem key={i} sx={{ pl: 0, py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: theme.palette.success.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={resolution}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { fontSize: '0.85rem', lineHeight: 1.4 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        )}
      </Stack>
    </motion.div>
  );
};

const ChatPage = () => {
  const { showError, showSuccess } = useSnackbar();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(true);
  const [isSavingConversation, setIsSavingConversation] = useState(false);
  const [conciseMode, setConciseMode] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check AI health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkAIHealth();
        setIsConnected(health.overall_status === 'healthy');
        if (health.overall_status !== 'healthy') {
          showError('AI services are currently unavailable. Some features may be limited.');
        }
      } catch {
        setIsConnected(false);
        showError('Unable to connect to AI services.');
      }
    };
    
    checkHealth();
  }, [showError]);

  // Auto-scroll to bottom smoothly
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Create conversation if this is the first message
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        try {
          const newConversation = await createConversation({
            title: generateConversationTitle(content.trim())
          });
          currentConversationId = newConversation.conversation_id;
          setConversationId(currentConversationId);
        } catch (error) {
          console.error('Failed to create conversation:', error);
        }
      }

      // Save user message to database
      if (currentConversationId) {
        try {
          await saveMessage({
            conversation_id: currentConversationId,
            role: 'user',
            content: content.trim(),
            sources: [],
            message_metadata: {}
          });
        } catch (error) {
          console.error('Failed to save user message:', error);
        }
      }

      // Search knowledge base first for context
      const searchResponse = await searchKnowledgeBase(content, 3);

      // Generate AI response using trained data
      const chatRequest: ChatRequest = {
        message: content,
        conversation_id: currentConversationId || undefined,
        concise: conciseMode,
      };

      const aiResponse = await chatWithAI(chatRequest);
      
      // Update conversation ID if returned by AI service
      if (aiResponse.conversation_id && aiResponse.conversation_id !== currentConversationId) {
        setConversationId(aiResponse.conversation_id);
        currentConversationId = aiResponse.conversation_id;
      }

      // Format response with sources
      const { content: formattedContent, sources } = formatResponseWithSources(
        aiResponse.response,
        searchResponse.results
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: formattedContent,
        role: 'assistant',
        timestamp: new Date(),
        sources,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      if (currentConversationId) {
        try {
          await saveMessage({
            conversation_id: currentConversationId,
            role: 'assistant',
            content: formattedContent,
            sources: sources || [],
            message_metadata: {}
          });
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }
      }

      showSuccess('Response generated successfully');

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I'm having trouble processing your request right now. ${
          isConnected 
            ? 'Please try again in a moment.' 
            : 'The AI services appear to be offline.'
        }`,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      showError(error instanceof Error ? error.message : 'Failed to get AI response');
    } finally {
      setIsTyping(false);
    }
  }, [conversationId, isConnected, isTyping, conciseMode, showError, showSuccess]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(inputValue);
    }
  }, [inputValue, handleSendMessage]);

  // Handle new chat button click
  const handleNewChat = useCallback(async () => {
    if (isSavingConversation) return;

    try {
      setIsSavingConversation(true);

      // Save current conversation if it has messages
      if (messages.length > 0) {
        try {
          await saveCurrentConversation(messages, conversationId);
          showSuccess('Conversation saved successfully');
        } catch (error) {
          console.error('Failed to save conversation:', error);
          showError('Failed to save current conversation');
          return;
        }
      }

      // Clear the chat state for new conversation
      setMessages([]);
      setConversationId('');
      setInputValue('');


      // Focus input for new conversation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

    } catch (error) {
      console.error('Failed to start new chat:', error);
      showError('Failed to start new conversation');
    } finally {
      setIsSavingConversation(false);
    }
  }, [messages, conversationId, isSavingConversation, showError, showSuccess]);

  const handleCopyMessage = useCallback((messageId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(messageId);
      showSuccess('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      showError('Failed to copy message');
    });
  }, [showError, showSuccess]);

  // Welcome screen for new conversations - Perplexity-style design
  if (messages.length === 0) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#fafafa',
        background: 'linear-gradient(135deg, #fafafa 0%, #f8fafc 100%)',
      }}>
        {/* Minimal Header - Perplexity Style */}
        <Box 
          sx={{ 
            px: { xs: 2, md: 3 },
            py: 1.5,
            bgcolor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/logo/iconlogo.png"
              alt={`${appConfig.name} Logo`}
              sx={{
                height: 24,
                width: 24,
                objectFit: 'contain',
              }}
            />
            <Typography 
              variant="h6" 
              fontWeight={700} 
              sx={{ 
                color: '#1a1a1a',
                fontSize: '1.1rem',
                letterSpacing: '-0.02em',
              }}
            >
              {appConfig.name}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<TuneIcon sx={{ fontSize: 14 }} />}
              onClick={() => setConciseMode(v => !v)}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontSize: '0.8rem',
                fontWeight: 500,
                borderColor: alpha('#1a1a1a', 0.15),
                color: '#1a1a1a',
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
                '&:hover': {
                  borderColor: alpha('#1a1a1a', 0.25),
                  bgcolor: alpha('#1a1a1a', 0.02),
                },
              }}
            >
              {conciseMode ? 'Concise' : 'Detailed'}
            </Button>
            <IconButton
              onClick={handleNewChat}
              disabled={isSavingConversation}
              size="small"
              sx={{ 
                color: '#666',
                width: 32,
                height: 32,
                '&:hover': { 
                  bgcolor: alpha('#1a1a1a', 0.05),
                  color: '#1a1a1a',
                },
              }}
            >
              {isSavingConversation ? (
                <LoadingAnimation size={16} />
              ) : (
                <AddIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Stack>
        </Box>

        {/* Centered Content - Perplexity Style */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '700px',
          mx: 'auto',
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '32px', width: '100%' }}
          >
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2rem', md: '2.8rem', lg: '3.2rem' },
                fontWeight: 700,
                color: '#1a1a1a',
                mb: 2,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
              }}
            >
              Where knowledge begins
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#666666', 
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.1rem' },
                mb: 4,
                maxWidth: '500px',
                mx: 'auto',
                lineHeight: 1.5,
              }}
            >
              Ask anything and get instant, intelligent answers from your knowledge base
            </Typography>

            {/* Main Search Input - Perplexity Style */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box sx={{ 
                position: 'relative',
                maxWidth: '600px',
                mx: 'auto',
                mb: 3,
              }}>
                <TextField
                  ref={inputRef}
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isConnected}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      bgcolor: '#ffffff',
                      fontSize: '15px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 3px 24px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        boxShadow: '0 6px 32px rgba(0, 0, 0, 0.12)',
                      },
                      '&.Mui-focused': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 6px 32px rgba(59, 130, 246, 0.15)',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 2.5,
                      px: 3,
                      fontSize: '15px',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 0.5, display: 'flex', gap: 0.5 }}>
                        <IconButton 
                          size="small" 
                          sx={{ 
                            color: '#9ca3af',
                            width: 32,
                            height: 32,
                            '&:hover': { color: '#6b7280' },
                          }}
                        >
                          <AttachFileIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ),
                    endAdornment: (
                      <IconButton
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={!inputValue.trim() || !isConnected}
                        sx={{ 
                          bgcolor: inputValue.trim() && isConnected ? '#3b82f6' : '#f3f4f6',
                          color: inputValue.trim() && isConnected ? 'white' : '#9ca3af',
                          width: 36,
                          height: 36,
                          mr: 0.5,
                          borderRadius: '10px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: inputValue.trim() && isConnected ? '#2563eb' : '#e5e7eb',
                            transform: inputValue.trim() && isConnected ? 'scale(1.05)' : 'none',
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#f3f4f6',
                            color: '#d1d5db',
                          },
                        }}
                      >
                        <SendIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </motion.div>
          </motion.div>

          {/* Quick Actions - Perplexity Style */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ width: '100%' }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: '#6b7280',
                fontSize: '0.85rem',
                fontWeight: 500,
                mb: 2,
                textAlign: 'center',
              }}
            >
              Try asking about
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {[
                { 
                  title: "Technical Support", 
                  text: "Help me troubleshoot a technical issue",
                  icon: "🔧"
                },
                { 
                  title: "Data Analysis", 
                  text: "Analyze this data for insights",
                  icon: "📊"
                },
                { 
                  title: "Knowledge Search", 
                  text: "Search my knowledge base",
                  icon: "🔍"
                },
                { 
                  title: "Creative Solutions", 
                  text: "Help me find a creative solution",
                  icon: "💡"
                },
              ].map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <Paper
                      onClick={() => handleSendMessage(item.text)}
                      elevation={0}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#cbd5e1',
                          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: '1.2rem' }}>
                          {item.icon}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight={500}
                          sx={{ 
                            color: '#1a1a1a',
                            fontSize: '0.9rem',
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#9ca3af',
                fontSize: '0.8rem',
                textAlign: 'center',
              }}
            >
              Powered by advanced AI • {isConnected ? 'Connected' : 'Offline'}
            </Typography>
          </motion.div>
        </Box>
      </Box>
    );
  }

  // Main chat interface (when messages exist) - Perplexity Style
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#fafafa',
      background: 'linear-gradient(135deg, #fafafa 0%, #f8fafc 100%)',
    }}>
      {/* Clean Header - Perplexity Style */}
      <Box 
        sx={{ 
          px: { xs: 2, md: 3 },
          py: 1.5,
          bgcolor: alpha('#ffffff', 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src="/logo/iconlogo.png"
            alt={`${appConfig.name} Logo`}
            sx={{
              height: 24,
              width: 24,
              objectFit: 'contain',
            }}
          />
          <Typography 
            variant="h6" 
            fontWeight={700} 
            sx={{ 
              color: '#1a1a1a',
              fontSize: '1.1rem',
              letterSpacing: '-0.02em',
            }}
          >
            {appConfig.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1.5 }}>
            {isConnected ? (
              <>
                <Box sx={{ 
                  width: 5, 
                  height: 5, 
                  borderRadius: '50%', 
                  bgcolor: '#10b981',
                }} />
                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  Online
                </Typography>
              </>
            ) : (
              <>
                <Box sx={{ 
                  width: 5, 
                  height: 5, 
                  borderRadius: '50%', 
                  bgcolor: '#ef4444',
                }} />
                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  Offline
                </Typography>
              </>
            )}
          </Box>
        </Box>
        
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<TuneIcon sx={{ fontSize: 14 }} />}
            onClick={() => setConciseMode(v => !v)}
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              borderColor: alpha('#1a1a1a', 0.15),
              color: '#1a1a1a',
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              '&:hover': {
                borderColor: alpha('#1a1a1a', 0.25),
                bgcolor: alpha('#1a1a1a', 0.02),
              },
            }}
          >
            {conciseMode ? 'Concise' : 'Detailed'}
          </Button>
          <IconButton
            onClick={handleNewChat}
            disabled={isSavingConversation}
            size="small"
            sx={{ 
              color: '#666',
              width: 32,
              height: 32,
              '&:hover': { 
                bgcolor: alpha('#1a1a1a', 0.05),
                color: '#1a1a1a',
              },
            }}
          >
            {isSavingConversation ? (
              <LoadingAnimation size={16} />
            ) : (
              <AddIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Stack>
      </Box>

      {/* Messages Container - Perplexity Style */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: alpha('#1a1a1a', 0.15),
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: alpha('#1a1a1a', 0.25),
        },
      }}>
        <Box sx={{ maxWidth: '700px', mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      bgcolor: message.role === 'user' ? '#3b82f6' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  >
                    {message.role === 'user' ? (
                      <PersonIcon sx={{ fontSize: 16, color: 'white' }} />
                    ) : (
                      <SmartToyIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600}
                        sx={{ 
                          color: '#1a1a1a',
                          fontSize: '0.85rem',
                        }}
                      >
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#9ca3af',
                          fontSize: '0.75rem',
                        }}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                      <Tooltip title={copiedId === message.id ? 'Copied!' : 'Copy message'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          sx={{
                            opacity: 0.5,
                            '&:hover': { opacity: 1 },
                            ml: 'auto',
                            width: 24,
                            height: 24,
                          }}
                        >
                          {copiedId === message.id ? (
                            <CheckIcon sx={{ fontSize: 12, color: '#10b981' }} />
                          ) : (
                            <ContentCopyIcon sx={{ fontSize: 12 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box
                      sx={{
                        color: '#1a1a1a',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {message.role === 'assistant' ? (
                        <Box>
                          {(() => {
                            const parsed = parseStructuredTroubleshooting(message.content);
                            if (parsed.isStructured) {
                              return <StructuredTroubleshootingView parsed={parsed} />;
                            }
                            return (
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  lineHeight: 1.6, 
                                  whiteSpace: 'pre-wrap',
                                  color: '#1a1a1a',
                                  fontSize: '0.9rem',
                                }}
                              >
                                {message.content}
                              </Typography>
                            );
                          })()}
                          
                          {message.sources && message.sources.length > 0 && (
                            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e5e7eb' }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  color: '#6b7280',
                                  fontSize: '0.8rem',
                                  fontWeight: 500,
                                  mb: 1.5,
                                }}
                              >
                                Sources
                              </Typography>
                              <Stack spacing={1}>
                                {message.sources.map((source, i) => (
                                  <Paper
                                    key={i}
                                    elevation={0}
                                    sx={{
                                      p: 1.5,
                                      bgcolor: '#f8fafc',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '6px',
                                    }}
                                  >
                                    <Typography 
                                      variant="body2"
                                      sx={{ 
                                        fontSize: '0.8rem',
                                        color: '#374151',
                                        fontWeight: 500,
                                      }}
                                    >
                                      {source.title}
                                    </Typography>
                                    {source.relevance_score && (
                                      <Typography 
                                        variant="caption"
                                        sx={{ 
                                          color: '#9ca3af',
                                          fontSize: '0.7rem',
                                        }}
                                      >
                                        {source.relevance_score.toFixed(1)}% match
                                      </Typography>
                                    )}
                                  </Paper>
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            lineHeight: 1.6,
                            color: '#1a1a1a',
                            fontSize: '0.9rem',
                          }}
                        >
                          {message.content}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    bgcolor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.5,
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight={600}
                    sx={{ 
                      color: '#1a1a1a',
                      fontSize: '0.85rem',
                      mb: 1.5,
                    }}
                  >
                    Assistant
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LoadingAnimation size={14} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#9ca3af',
                        fontSize: '0.85rem',
                      }}
                    >
                      Thinking...
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Input Area - Perplexity Style */}
      <Box 
        sx={{ 
          bgcolor: alpha('#ffffff', 0.9),
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid #e5e7eb',
          px: { xs: 2, md: 3 },
          py: 2,
        }}
      >
        <Box sx={{ maxWidth: '700px', mx: 'auto' }}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask a follow up..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected || isTyping}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                bgcolor: '#ffffff',
                fontSize: '15px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  boxShadow: '0 3px 16px rgba(0, 0, 0, 0.08)',
                },
                '&.Mui-focused': {
                  borderColor: '#3b82f6',
                  boxShadow: '0 3px 16px rgba(59, 130, 246, 0.15)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                py: 2,
                px: 2.5,
                fontSize: '15px',
                '&::placeholder': {
                  color: '#9ca3af',
                  opacity: 1,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 0.5, display: 'flex', gap: 0.5 }}>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: '#9ca3af',
                      width: 28,
                      height: 28,
                      '&:hover': { color: '#6b7280' },
                    }}
                  >
                    <AttachFileIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ),
              endAdornment: (
                <IconButton
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || !isConnected || isTyping}
                  sx={{ 
                    bgcolor: inputValue.trim() && isConnected && !isTyping ? '#3b82f6' : '#f3f4f6',
                    color: inputValue.trim() && isConnected && !isTyping ? 'white' : '#9ca3af',
                    width: 32,
                    height: 32,
                    mr: 0.5,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: inputValue.trim() && isConnected && !isTyping ? '#2563eb' : '#e5e7eb',
                      transform: inputValue.trim() && isConnected && !isTyping ? 'scale(1.05)' : 'none',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#f3f4f6',
                      color: '#d1d5db',
                    },
                  }}
                >
                  {isTyping ? (
                    <LoadingAnimation size={14} />
                  ) : (
                    <SendIcon sx={{ fontSize: 14 }} />
                  )}
                </IconButton>
              ),
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage;
