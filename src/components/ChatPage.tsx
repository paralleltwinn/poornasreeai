'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  useTheme,
  Button,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  Search as SearchIcon,
  AutoAwesome as AutoAwesomeIcon,
  Lightbulb as LightbulbIcon,
  Science as ScienceIcon,
  Business as BusinessIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Suggestion } from '../types/chat';
import { appConfig } from '../config/app';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import LoadingAnimation from './LoadingAnimation';
import { 
  chatWithAI, 
  searchKnowledgeBase, 
  checkAIHealth, 
  generateSuggestions,
  formatResponseWithSources,
  type ChatRequest,
  type SearchResult,
} from '../utils/aiApi';

// Function to render structured content with proper formatting
const renderStructuredContent = (content: string) => {
  const sections = content.split('\n\n');
  
  return sections.map((section, index) => {
    const trimmedSection = section.trim();
    if (!trimmedSection) return null;

    // Handle headers (## Header or **Header**)
    if (trimmedSection.startsWith('## ') || (trimmedSection.startsWith('**') && trimmedSection.endsWith('**') && trimmedSection.length < 100)) {
      const headerText = trimmedSection.replace(/^## /, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      return (
        <Typography 
          key={index}
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.main', 
            mb: 1, 
            mt: index > 0 ? 2 : 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {headerText.toLowerCase().includes('problem') && <ErrorIcon color="error" />}
          {headerText.toLowerCase().includes('step') && <CheckCircleIcon color="success" />}
          {headerText.toLowerCase().includes('recommendation') && <InfoIcon color="info" />}
          {headerText.toLowerCase().includes('warning') && <WarningIcon color="warning" />}
          {headerText}
        </Typography>
      );
    }

    // Handle numbered lists (1. Item, 2. Item, etc.)
    if (/^\d+\.\s/.test(trimmedSection)) {
      const lines = trimmedSection.split('\n').filter(line => line.trim());
      const numberedItems = [];
      let currentItem = '';
      
      for (const line of lines) {
        if (/^\d+\.\s/.test(line.trim())) {
          if (currentItem) numberedItems.push(currentItem.trim());
          currentItem = line.trim();
        } else {
          currentItem += '\n' + line.trim();
        }
      }
      if (currentItem) numberedItems.push(currentItem.trim());

      return (
        <List key={index} sx={{ pl: 0, '& .MuiListItem-root': { pl: 0 } }}>
          {numberedItems.map((item, itemIndex) => (
            <ListItem key={itemIndex} sx={{ display: 'list-item', listStyleType: 'none', pl: 0, py: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
                <Box
                  sx={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    mt: 0.5,
                    flexShrink: 0
                  }}
                >
                  {itemIndex + 1}
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.6, flex: 1 }}>
                  {item.replace(/^\d+\.\s/, '')}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      );
    }

    // Handle bullet points (- Item or • Item)
    if (trimmedSection.includes('\n- ') || trimmedSection.includes('\n• ')) {
      const lines = trimmedSection.split('\n').filter(line => line.trim());
      return (
        <List key={index} sx={{ pl: 2 }}>
          {lines.map((line, lineIndex) => {
            if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
              return (
                <ListItem key={lineIndex} sx={{ display: 'list-item', py: 0.25 }}>
                  <ListItemText 
                    primary={line.trim().replace(/^[•-]\s/, '')} 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        fontSize: '16px', 
                        lineHeight: 1.6 
                      } 
                    }}
                  />
                </ListItem>
              );
            }
            return (
              <Typography key={lineIndex} variant="body1" sx={{ lineHeight: 1.6, mb: 1 }}>
                {line.trim()}
              </Typography>
            );
          })}
        </List>
      );
    }

    // Handle regular paragraphs
    return (
      <Typography 
        key={index}
        variant="body1" 
        sx={{ 
          lineHeight: 1.7, 
          color: 'text.primary',
          mb: index < sections.length - 1 ? 2 : 0,
          whiteSpace: 'pre-line'
        }}
      >
        {trimmedSection}
      </Typography>
    );
  }).filter(Boolean);
};

const ChatPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showError, showSuccess } = useSnackbar();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [conversationId, setConversationId] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcomeText = `Welcome to ${appConfig.name}`;
  const subText = "Your intelligent AI research assistant powered by trained data";

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

  // Typing animation for welcome text
  useEffect(() => {
    if (showWelcome && messages.length === 0) {
      let i = 0;
      const timer = setInterval(() => {
        if (i < welcomeText.length) {
          setTypedText(welcomeText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [showWelcome, messages.length, welcomeText]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize suggestions
  useEffect(() => {
    if (!user) return;
    
    setSuggestions([
      { id: '1', text: 'What information is available in the trained data?', category: 'trending' },
      { id: '2', text: 'Search for specific topics in the knowledge base', category: 'trending' },
      { id: '3', text: 'Tell me about the latest features', category: 'trending' },
      { id: '4', text: 'How can I get the most accurate results?', category: 'related' },
    ]);
  }, [user]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;

    setShowWelcome(false);

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
      // Search knowledge base first for context
      const searchResponse = await searchKnowledgeBase(content, 3);
      setSearchResults(searchResponse.results);

      // Generate AI response using trained data
      const chatRequest: ChatRequest = {
        message: content,
        conversation_id: conversationId,
      };

      const aiResponse = await chatWithAI(chatRequest);
      
      // Update conversation ID
      if (aiResponse.conversation_id && aiResponse.conversation_id !== conversationId) {
        setConversationId(aiResponse.conversation_id);
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
  }, [conversationId, isConnected, isTyping, showError, showSuccess]);

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    handleSendMessage(suggestion.text);
  }, [handleSendMessage]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(inputValue);
    }
  }, [inputValue, handleSendMessage]);

  const quickActions = [
    { icon: <AutoAwesomeIcon />, label: 'Summarize', color: 'primary' },
    { icon: <LightbulbIcon />, label: 'Ideas', color: 'warning' },
    { icon: <ScienceIcon />, label: 'Research', color: 'info' },
    { icon: <BusinessIcon />, label: 'Analysis', color: 'success' },
  ];

  // Show connection status
  const ConnectionStatus = () => (
    isConnected ? null : (
      <Alert 
        severity="warning" 
        sx={{ mb: 2, mx: 2 }}
        icon={<ErrorIcon />}
      >
        AI services are currently offline. Limited functionality available.
      </Alert>
    )
  );

  // Typing animation for welcome text
  useEffect(() => {
    if (showWelcome && messages.length === 0) {
      let i = 0;
      const timer = setInterval(() => {
        if (i < welcomeText.length) {
          setTypedText(welcomeText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [showWelcome, messages.length, welcomeText]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize suggestions
  useEffect(() => {
    setSuggestions([
      { id: '1', text: 'What information is available from the PDF training data?', category: 'trending' },
      { id: '2', text: 'Search specific technical documents with enhanced extraction', category: 'trending' },
      { id: '3', text: 'Show me troubleshooting guides from the trained documents', category: 'trending' },
      { id: '4', text: 'How does the enhanced PDF text extraction improve accuracy?', category: 'related' },
    ]);
  }, [user]);

  // Welcome screen for new conversations
  if (messages.length === 0) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        maxWidth: '800px',
        margin: '0 auto',
        p: 3,
      }}>
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ 
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Box
              component="img"
              src="/logo/fulllogo.png"
              alt={`${appConfig.name} Logo`}
              sx={{
                height: 64,
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </motion.div>

          {/* Welcome Text */}
          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight="600"
            sx={{ 
              color: 'text.primary',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              mb: 2
            }}
          >
            {typedText}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              |
            </motion.span>
          </Typography>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary', 
                fontWeight: 400,
                mb: 6
              }}
            >
              {subText}
            </Typography>
          </motion.div>
        </motion.div>

        {/* Main Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{ width: '100%', maxWidth: '600px', marginBottom: '32px' }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask anything or @mention a Space"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: '12px',
                fontSize: '16px',
                minHeight: '56px',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused': {
                  borderColor: 'primary.main',
                  boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
                },
                '& fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                py: 2,
                px: 3,
              },
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              ),
              endAdornment: inputValue.trim() && (
                <IconButton
                  onClick={() => handleSendMessage(inputValue)}
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 1,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          style={{ width: '100%', maxWidth: '600px' }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outlined"
                  startIcon={action.icon}
                  onClick={() => handleSendMessage(`Help me with ${action.label.toLowerCase()}`)}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    py: 1.5,
                    px: 3,
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.main',
                      color: 'white',
                    },
                  }}
                >
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      maxWidth: '800px',
      mx: 'auto',
      px: 3,
    }}>
      {/* Header */}
      <Box sx={{ 
        py: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        mb: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src="/logo/fulllogo.png"
            alt={`${appConfig.name} Logo`}
            sx={{
              height: 28,
              objectFit: 'contain',
            }}
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<AutoAwesomeIcon />}
          onClick={() => window.location.reload()}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          New
        </Button>
      </Box>

      {/* Connection Status */}
      <ConnectionStatus />

      {/* Enhanced Training Status */}
      {isConnected && (
        <Alert 
          severity="success" 
          sx={{ mb: 2, mx: 2 }}
          icon={<PsychologyIcon />}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              AI powered by enhanced PDF text extraction
            </Typography>
            <Chip 
              label="Trained Data Active"
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip 
              label="PyPDF2 Extraction"
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip 
              label="Weaviate Vector DB"
              size="small"
              color="info"
              variant="outlined"
            />
          </Box>
        </Alert>
      )}

      {/* Messages Container */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        pb: 2,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '3px',
        },
      }}>
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Box sx={{ mb: 6 }}>
                {/* User Message */}
                {message.role === 'user' && (
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h5" 
                      fontWeight="600"
                      sx={{ 
                        color: 'text.primary',
                        lineHeight: 1.4,
                        mb: 2
                      }}
                    >
                      {message.content}
                    </Typography>
                  </Box>
                )}

                {/* Assistant Message */}
                {message.role === 'assistant' && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PsychologyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight="500">
                        Answer
                      </Typography>
                    </Box>
                    
                    {/* Render structured content with proper formatting */}
                    <Box sx={{ '& > *': { mb: 2 } }}>
                      {renderStructuredContent(message.content)}
                    </Box>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            fontWeight="600"
                            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <SearchIcon fontSize="small" />
                            Sources from Trained Data ({message.sources.length})
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {message.sources.map((source, idx) => (
                              <motion.div
                                key={source.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 + idx * 0.1 }}
                              >
                                <Box
                                  sx={{
                                    p: 1.5,
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    cursor: source.url !== '#' ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease',
                                    '&:hover': source.url !== '#' ? {
                                      borderColor: 'primary.main',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    } : {},
                                  }}
                                  onClick={() => source.url !== '#' && window.open(source.url, '_blank')}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography 
                                      variant="body2" 
                                      fontWeight="600"
                                      color="text.primary"
                                      sx={{ flex: 1 }}
                                    >
                                      {source.title}
                                    </Typography>
                                    {source.relevance_score && (
                                      <Chip
                                        label={`${(source.relevance_score * 100).toFixed(0)}%`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ ml: 1, fontSize: '10px', height: '20px' }}
                                      />
                                    )}
                                  </Box>
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                      fontSize: '13px',
                                      lineHeight: 1.4,
                                      display: '-webkit-box',
                                      WebkitBoxOrient: 'vertical',
                                      WebkitLineClamp: 2,
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {source.snippet}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    color="primary.main"
                                    sx={{ mt: 0.5, display: 'block', fontSize: '11px' }}
                                  >
                                    {source.domain}
                                  </Typography>
                                </Box>
                              </motion.div>
                            ))}
                          </Box>
                        </Box>
                      </motion.div>
                    )}
                  </Box>
                )}
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Enhanced Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PsychologyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Answer
                </Typography>
              </Box>
              <Box sx={{ ml: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <LoadingAnimation size={24} duration={1} pauseDuration={0.3} />
                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                    Analyzing your question and searching trained data...
                  </Typography>
                </Box>
                
                {/* Processing Steps Indicator */}
                <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SearchIcon fontSize="small" />
                      Searching knowledge base...
                    </Typography>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PsychologyIcon fontSize="small" />
                      Generating step-by-step response...
                    </Typography>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" />
                      Formatting troubleshooting guide...
                    </Typography>
                  </motion.div>
                </Box>
              </Box>
            </Box>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '20px',
                      borderColor: 'divider',
                      color: 'text.primary',
                      py: 0.5,
                      px: 2,
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.main',
                        color: 'white',
                      },
                    }}
                  >
                    {suggestion.text}
                  </Button>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Box>
      )}

      {/* Input Area */}
      <Box sx={{ 
        borderTop: '1px solid',
        borderColor: 'divider',
        pt: 3,
        pb: 2
      }}>
        {/* AI Status Indicator */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ 
              mb: 2, 
              p: 1.5, 
              bgcolor: 'primary.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.200',
            }}>
              <Typography variant="body2" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon fontSize="small" />
                Found {searchResults.length} relevant sources in trained data
              </Typography>
            </Box>
          </motion.div>
        )}

        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder={
              isConnected 
                ? "Ask anything about the trained data..." 
                : "AI services offline - limited functionality"
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping || !isConnected}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: isConnected ? 'divider' : 'error.light',
                '&:hover': {
                  borderColor: isConnected ? 'primary.main' : 'error.main',
                },
                '&.Mui-focused': {
                  borderColor: isConnected ? 'primary.main' : 'error.main',
                  boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
                },
                '& fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                py: 2,
                px: 3,
                fontSize: '16px',
              },
            }}
            InputProps={{
              startAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                  <SearchIcon sx={{ color: isConnected ? 'primary.main' : 'text.disabled' }} />
                  {isConnected && (
                    <Chip 
                      label="AI Ready" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                      sx={{ fontSize: '10px', height: '20px' }}
                    />
                  )}
                  {!isConnected && (
                    <Chip 
                      label="Offline" 
                      size="small" 
                      color="error" 
                      variant="outlined"
                      sx={{ fontSize: '10px', height: '20px' }}
                    />
                  )}
                </Box>
              ),
              endAdornment: inputValue.trim() && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconButton
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={isTyping || !isConnected}
                    sx={{ 
                      bgcolor: isConnected ? 'primary.main' : 'grey.300',
                      color: 'white',
                      width: 36,
                      height: 36,
                      mr: 1,
                      '&:hover': {
                        bgcolor: isConnected ? 'primary.dark' : 'grey.400',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'grey.300',
                        color: 'grey.500',
                      },
                    }}
                  >
                    {isTyping ? <LoadingAnimation size={16} /> : <SendIcon fontSize="small" />}
                  </IconButton>
                </motion.div>
              ),
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage;
