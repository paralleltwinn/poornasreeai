'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  useTheme,
  Button,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  Search as SearchIcon,
  AutoAwesome as AutoAwesomeIcon,
  Lightbulb as LightbulbIcon,
  Science as ScienceIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Suggestion } from '../types/chat';
import { appConfig } from '../config/app';
import { generateResponseWithSources, generateFollowUpSuggestions } from '../utils/dataGenerators';
import LoadingAnimation from './LoadingAnimation';

const ChatPage = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [typedText, setTypedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcomeText = `Welcome to ${appConfig.name}`;
  const subText = "Your intelligent AI research assistant";

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
      { id: '1', text: 'What are the latest AI breakthroughs?', category: 'trending' },
      { id: '2', text: 'Explain quantum computing basics', category: 'trending' },
      { id: '3', text: 'Climate change solutions 2024', category: 'trending' },
      { id: '4', text: 'Future of renewable energy', category: 'related' },
    ]);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

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

    // Generate AI response with sources
    setTimeout(() => {
      const { content: responseContent, sources } = generateResponseWithSources(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date(),
        sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Update suggestions
      setSuggestions(generateFollowUpSuggestions(content));
    }, appConfig.chat.typingDelay);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    handleSendMessage(suggestion.text);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const quickActions = [
    { icon: <AutoAwesomeIcon />, label: 'Summarize', color: 'primary' },
    { icon: <LightbulbIcon />, label: 'Ideas', color: 'warning' },
    { icon: <ScienceIcon />, label: 'Research', color: 'info' },
    { icon: <BusinessIcon />, label: 'Analysis', color: 'success' },
  ];

  if (showWelcome && messages.length === 0) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          bgcolor: 'background.default',
          position: 'relative',
        }}
      >
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
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        lineHeight: 1.7,
                        color: 'text.primary',
                        fontSize: '16px',
                        mb: 3
                      }}
                    >
                      {message.content}
                    </Typography>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Box sx={{ mt: 3 }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            fontWeight="500"
                            sx={{ mb: 2 }}
                          >
                            Sources
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {message.sources.map((source, idx) => (
                              <motion.div
                                key={source.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                              >
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => window.open(source.url, '_blank')}
                                  sx={{
                                    textTransform: 'none',
                                    borderRadius: '6px',
                                    borderColor: 'divider',
                                    color: 'text.secondary',
                                    fontSize: '12px',
                                    py: 0.5,
                                    px: 1.5,
                                    '&:hover': {
                                      borderColor: 'primary.main',
                                      color: 'primary.main',
                                    },
                                  }}
                                >
                                  {idx + 1}
                                </Button>
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

        {/* Typing Indicator */}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 3 }}>
                <LoadingAnimation size={24} duration={1} pauseDuration={0.3} />
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
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
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder="Ask anything or @mention a Space"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'background.paper',
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
                fontSize: '16px',
              },
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />
              ),
              endAdornment: inputValue.trim() && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconButton
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={isTyping}
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 36,
                      height: 36,
                      mr: 1,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'grey.300',
                      },
                    }}
                  >
                    <SendIcon fontSize="small" />
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
