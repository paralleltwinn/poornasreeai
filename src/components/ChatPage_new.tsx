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
  CardContent,
  Divider,
  alpha,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  Search as SearchIcon,
  AutoAwesome as AutoAwesomeIcon,
  Lightbulb as LightbulbIcon,
  Science as ScienceIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  FormatListBulleted as FormatListBulletedIcon,
  ViewWeek as ViewWeekIcon,
  Tune as TuneIcon,
  Menu as MenuIcon,
  MoreVert as MoreVertIcon,
  Mic as MicIcon,
  AttachFile as AttachFileIcon,
  SmartToy as SmartToyIcon,
  RocketLaunch as RocketLaunchIcon,
  Bolt,
  AutoFixHigh as AutoFixHighIcon,
  Star as SparklesIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from '../contexts/SnackbarContext';
import { appConfig } from '../config/app';
import { 
  chatWithAI, 
  searchKnowledgeBase, 
  checkAIHealth,
  generateSuggestions,
  formatResponseWithSources,
  type ChatRequest,
} from '../utils/aiApi';
import { 
  saveCurrentConversation,
  createConversation,
  saveMessage,
  generateConversationTitle,
} from '../utils/chatHistoryApi';
import { Message, Suggestion } from '../types/chat';

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
      <Stack spacing={3} sx={{ mt: 2 }}>
        {parsed.actionRequired && (
          <Card 
            elevation={1}
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 32,
                  height: 32,
                }}
              >
                <FormatListBulletedIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Action Required
              </Typography>
            </Box>
            <List dense>
              {parsed.actionRequired.map((action, i) => (
                <ListItem key={i} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={action}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { fontSize: '0.9rem', lineHeight: 1.5 }
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
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              bgcolor: alpha(theme.palette.secondary.main, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  width: 32,
                  height: 32,
                }}
              >
                <BuildIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Tools Needed
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {parsed.toolsNeeded.map((tool, i) => (
                <Chip 
                  key={i}
                  label={tool} 
                  variant="outlined"
                  size="small"
                  sx={{ 
                    fontSize: '0.8rem',
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
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              bgcolor: alpha(theme.palette.info.main, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.info.main,
                  width: 32,
                  height: 32,
                }}
              >
                <PsychologyIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Procedure
              </Typography>
            </Box>
            <List dense>
              {parsed.procedure.map((step, i) => (
                <ListItem key={i} sx={{ pl: 0, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Chip 
                      label={step.step} 
                      color="info" 
                      size="small"
                      sx={{ 
                        minWidth: 32,
                        height: 24, 
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }} 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={step.detail}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { fontSize: '0.9rem', lineHeight: 1.5, mt: 0.5 }
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
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              bgcolor: alpha(theme.palette.success.main, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.success.main,
                  width: 32,
                  height: 32,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Resolution
              </Typography>
            </Box>
            <List dense>
              {parsed.resolution.map((resolution, i) => (
                <ListItem key={i} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: theme.palette.success.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={resolution}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { fontSize: '0.9rem', lineHeight: 1.5 }
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
  const theme = useTheme();
  const { showError, showSuccess } = useSnackbar();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
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

  // Initialize suggestions
  useEffect(() => {
    setSuggestions([
      { id: '1', text: 'What information is available in the trained data?', category: 'trending' },
      { id: '2', text: 'Search for specific topics in the knowledge base', category: 'trending' },
      { id: '3', text: 'Tell me about the latest features', category: 'trending' },
      { id: '4', text: 'How can I get the most accurate results?', category: 'related' },
    ]);
  }, []);

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

      // Generate contextual suggestions
      const newSuggestions = generateSuggestions(content).map((text, index) => ({
        id: `suggestion_${Date.now()}_${index}`,
        text,
        category: 'follow-up' as const,
      }));
      setSuggestions(newSuggestions);

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

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    handleSendMessage(suggestion.text);
  }, [handleSendMessage]);

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
      setSuggestions([
        { id: '1', text: 'What information is available in the trained data?', category: 'trending' },
        { id: '2', text: 'Search for specific topics in the knowledge base', category: 'trending' },
        { id: '3', text: 'Tell me about the latest features', category: 'trending' },
        { id: '4', text: 'How can I get the most accurate results?', category: 'related' },
      ]);

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

  // Welcome screen for new conversations
  if (messages.length === 0) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#ffffff',
      }}>
        {/* Professional Header */}
        <Paper 
          elevation={1}
          sx={{ 
            px: 4,
            py: 3,
            bgcolor: '#ffffff',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40,
              }}
            >
              <SmartToyIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600} color="text.primary">
                AI Assistant
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Powered by Advanced Intelligence
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title={conciseMode ? 'Concise mode ON' : 'Concise mode OFF'}>
              <Chip 
                icon={<TuneIcon sx={{ fontSize: 16 }} />}
                label={conciseMode ? 'Concise' : 'Full'}
                size="medium"
                variant={conciseMode ? 'filled' : 'outlined'}
                color={conciseMode ? 'primary' : 'default'}
                onClick={() => setConciseMode(v => !v)}
                sx={{ cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
              />
            </Tooltip>
            <Tooltip title="New conversation">
              <IconButton
                onClick={handleNewChat}
                disabled={isSavingConversation}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                {isSavingConversation ? (
                  <CircularProgress size={20} />
                ) : (
                  <AddIcon />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>

        {/* Welcome Content */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '1000px',
          mx: 'auto',
          px: 4,
          py: 6,
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <Box
              component="img"
              src="/logo/fulllogo.png"
              alt={`${appConfig.name} Logo`}
              sx={{
                height: 64,
                objectFit: 'contain',
                mb: 3,
              }}
            />
            <Typography 
              variant="h3" 
              fontWeight={700}
              sx={{ 
                color: theme.palette.text.primary,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              How can I help you today?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary, 
                fontWeight: 400,
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              I&apos;m your intelligent assistant, ready to help with troubleshooting, 
              analysis, and answering questions based on your trained data.
            </Typography>
          </motion.div>

          {/* Quick Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ width: '100%' }}
          >
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {[
                { 
                  icon: <RocketLaunchIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />, 
                  title: "Technical Support", 
                  desc: "Get instant troubleshooting help and technical guidance",
                  text: "Help me troubleshoot a technical issue"
                },
                { 
                  icon: <AutoFixHighIcon sx={{ fontSize: 32, color: theme.palette.secondary.main }} />, 
                  title: "Smart Analysis", 
                  desc: "Analyze complex data and generate actionable insights",
                  text: "Analyze this data for me"
                },
                { 
                  icon: <ScienceIcon sx={{ fontSize: 32, color: theme.palette.info.main }} />, 
                  title: "Knowledge Search", 
                  desc: "Search through your trained documents and knowledge base",
                  text: "Search my knowledge base"
                },
                { 
                  icon: <SparklesIcon sx={{ fontSize: 32, color: theme.palette.success.main }} />, 
                  title: "Creative Solutions", 
                  desc: "Generate innovative solutions and creative approaches",
                  text: "Help me find a creative solution"
                },
              ].map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card
                      onClick={() => handleSendMessage(item.text)}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        height: '100%',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ mt: 0.5 }}>
                          {item.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} sx={{ mb: 1, fontSize: '1.1rem' }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                            {item.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        {/* Professional Input Area */}
        <Paper 
          elevation={1}
          sx={{ 
            bgcolor: '#ffffff',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            px: 4,
            py: 3,
          }}
        >
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
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
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  fontSize: '16px',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  },
                },
                '& .MuiInputBase-input': {
                  py: 2,
                  px: 3,
                },
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                      <AttachFileIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                      <MicIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ),
                endAdornment: (
                  <IconButton
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || !isConnected}
                    sx={{ 
                      bgcolor: inputValue.trim() && isConnected ? theme.palette.primary.main : alpha(theme.palette.action.disabled, 0.2),
                      color: 'white',
                      width: 40,
                      height: 40,
                      mr: 1,
                      '&:hover': {
                        bgcolor: inputValue.trim() && isConnected ? theme.palette.primary.dark : alpha(theme.palette.action.disabled, 0.3),
                      },
                      '&.Mui-disabled': {
                        bgcolor: alpha(theme.palette.action.disabled, 0.2),
                        color: alpha(theme.palette.action.disabled, 0.5),
                      },
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Paper>
      </Box>
    );
  }

  // Main chat interface (when messages exist)
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#ffffff',
    }}>
      {/* Professional Header */}
      <Paper 
        elevation={1}
        sx={{ 
          px: 4,
          py: 3,
          bgcolor: '#ffffff',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
            }}
          >
            <SmartToyIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              AI Assistant
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isConnected ? (
                <>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#10b981',
                  }} />
                  <Typography variant="caption" color="text.secondary">
                    Online
                  </Typography>
                </>
              ) : (
                <>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#ef4444',
                  }} />
                  <Typography variant="caption" color="text.secondary">
                    Offline
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title={conciseMode ? 'Concise mode ON' : 'Concise mode OFF'}>
            <Chip 
              icon={<TuneIcon sx={{ fontSize: 16 }} />}
              label={conciseMode ? 'Concise' : 'Full'}
              size="medium"
              variant={conciseMode ? 'filled' : 'outlined'}
              color={conciseMode ? 'primary' : 'default'}
              onClick={() => setConciseMode(v => !v)}
              sx={{ cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
            />
          </Tooltip>
          <Tooltip title="New conversation">
            <IconButton
              onClick={handleNewChat}
              disabled={isSavingConversation}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              {isSavingConversation ? (
                <CircularProgress size={20} />
              ) : (
                <AddIcon />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Messages Container */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        bgcolor: alpha(theme.palette.background.default, 0.3),
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: alpha(theme.palette.primary.main, 0.2),
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: alpha(theme.palette.primary.main, 0.3),
        },
      }}>
        <Box sx={{ maxWidth: '1000px', mx: 'auto', px: 4, py: 3 }}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: message.role === 'user' ? theme.palette.primary.main : theme.palette.secondary.main,
                      fontSize: '0.9rem',
                    }}
                  >
                    {message.role === 'user' ? (
                      <PersonIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <SmartToyIcon sx={{ fontSize: 20 }} />
                    )}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2.5,
                        bgcolor: message.role === 'user' 
                          ? alpha(theme.palette.primary.main, 0.05)
                          : '#ffffff',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: 2,
                        position: 'relative',
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
                              <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {message.content}
                              </Typography>
                            );
                          })()}
                          
                          {message.sources && message.sources.length > 0 && (
                            <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                                Sources:
                              </Typography>
                              <Stack spacing={1}>
                                {message.sources.map((source, i) => (
                                  <Chip
                                    key={i}
                                    label={`${source.title} (${source.relevance_score?.toFixed(1) || '0'}% match)`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {message.content}
                        </Typography>
                      )}

                      <Tooltip title={copiedId === message.id ? 'Copied!' : 'Copy message'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            opacity: 0.7,
                            '&:hover': { opacity: 1 },
                          }}
                        >
                          {copiedId === message.id ? (
                            <CheckIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                          ) : (
                            <ContentCopyIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Paper>
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
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: theme.palette.secondary.main,
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    AI Assistant
                  </Typography>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2.5,
                      bgcolor: '#ffffff',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Thinking...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Paper 
          elevation={1}
          sx={{ 
            px: 4,
            py: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
              Suggested questions:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {suggestions.slice(0, 3).map((suggestion) => (
                <Chip
                  key={suggestion.id}
                  label={suggestion.text}
                  onClick={() => handleSuggestionClick(suggestion)}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Professional Input Area */}
      <Paper 
        elevation={1}
        sx={{ 
          bgcolor: '#ffffff',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          px: 4,
          py: 3,
        }}
      >
        <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected || isTyping}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                fontSize: '16px',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                },
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },
                },
              },
              '& .MuiInputBase-input': {
                py: 2,
                px: 3,
              },
            }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                    <AttachFileIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                    <MicIcon fontSize="small" />
                  </IconButton>
                </Box>
              ),
              endAdornment: (
                <IconButton
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || !isConnected || isTyping}
                  sx={{ 
                    bgcolor: inputValue.trim() && isConnected && !isTyping ? theme.palette.primary.main : alpha(theme.palette.action.disabled, 0.2),
                    color: 'white',
                    width: 40,
                    height: 40,
                    mr: 1,
                    '&:hover': {
                      bgcolor: inputValue.trim() && isConnected && !isTyping ? theme.palette.primary.dark : alpha(theme.palette.action.disabled, 0.3),
                    },
                    '&.Mui-disabled': {
                      bgcolor: alpha(theme.palette.action.disabled, 0.2),
                      color: alpha(theme.palette.action.disabled, 0.5),
                    },
                  }}
                >
                  {isTyping ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    <SendIcon fontSize="small" />
                  )}
                </IconButton>
              ),
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatPage;
