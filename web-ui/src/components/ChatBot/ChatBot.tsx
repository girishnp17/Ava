import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Fab,
  Divider,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Send,
  Chat,
  Close,
  SmartToy,
  Person,
  Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🚀 Hi there! I'm Career Compass, your AI career guide. I'm here to help you navigate your professional journey, find opportunities, and accelerate your career growth. What can I help you with today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-focus on text field when chat opens
  useEffect(() => {
    if (isOpen && textFieldRef.current) {
      setTimeout(() => textFieldRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize session when chat opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      const initializeSession = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/chat/new-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (response.ok) {
            const data = await response.json();
            setSessionId(data.session_id);
          }
        } catch (error) {
          console.error('Session init error:', error);
          setSessionId('fallback-' + Date.now());
        }
      };
      
      initializeSession();
    }
  }, [isOpen, sessionId]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setCurrentMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentMessage.trim(),
          session_id: sessionId || 'default'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.session_id && !sessionId) {
          setSessionId(data.session_id);
        }
        
        // Simulate typing delay for better UX
        setTimeout(() => {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.response,
            sender: 'bot',
            timestamp: new Date(),
          };
          addMessage(botMessage);
          setIsTyping(false);
        }, 500);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setTimeout(() => {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "⚡ I'm having trouble connecting right now, but I'm still here to help! I can assist with career guidance, skill development, job search strategies, and professional growth. What would you like to explore?",
          sender: 'bot',
          timestamp: new Date(),
        };
        addMessage(errorMessage);
        setIsTyping(false);
      }, 300);
    } finally {
      setIsLoading(false);
    }
  }, [currentMessage, isLoading, sessionId, addMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const clearChat = useCallback(() => {
    setMessages([{
      id: '1',
      text: "🚀 Chat cleared! I'm ready to help you with your career journey. What can I assist you with?",
      sender: 'bot',
      timestamp: new Date(),
    }]);
    setSessionId('');
  }, []);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 500 }}
      >
        <Fab
          color="primary"
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 40px rgba(139, 92, 246, 0.6)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1300,
          }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <Close /> : <Chat />}
          </motion.div>
        </Fab>
      </motion.div>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '420px',
              zIndex: 1200,
            }}
          >
            <Paper
              elevation={24}
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  color: 'white',
                  boxShadow: '0 2px 20px rgba(139, 92, 246, 0.3)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha('#fff', 0.2),
                      width: 36,
                      height: 36,
                    }}
                  >
                    <SmartToy fontSize="small" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      Career Compass
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                      AI Career Guide • Online
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={clearChat}
                    sx={{ color: 'white', mr: 0.5 }}
                    title="Clear Chat"
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => setIsOpen(false)}
                    sx={{ color: 'white' }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(theme.palette.primary.main, 0.3),
                    borderRadius: '3px',
                  },
                }}
              >
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-start',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      {message.sender === 'bot' && (
                        <Avatar
                          sx={{
                            bgcolor: '#8b5cf6',
                            width: 28,
                            height: 28,
                            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                          }}
                        >
                          <SmartToy sx={{ fontSize: 16 }} />
                        </Avatar>
                      )}
                      
                      <Box
                        sx={{
                          maxWidth: '75%',
                          p: 1.5,
                          borderRadius: 2,
                          background: message.sender === 'user'
                            ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                            : alpha('#8b5cf6', 0.1),
                          border: message.sender === 'bot' ? `1px solid ${alpha('#8b5cf6', 0.2)}` : 'none',
                          color: message.sender === 'user' ? 'white' : '#f1f5f9',
                          boxShadow: message.sender === 'user' 
                            ? '0 4px 12px rgba(139, 92, 246, 0.3)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.9rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {message.text}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            display: 'block',
                            mt: 0.5,
                            fontSize: '0.7rem',
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Box>

                      {message.sender === 'user' && (
                        <Avatar
                          sx={{
                            bgcolor: '#6366f1',
                            width: 28,
                            height: 28,
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                          }}
                        >
                          <Person sx={{ fontSize: 16 }} />
                        </Avatar>
                      )}
                    </Box>
                  </motion.div>
                ))}
                
                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#8b5cf6',
                            width: 28,
                            height: 28,
                          }}
                        >
                          <SmartToy sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: alpha('#8b5cf6', 0.1),
                            border: `1px solid ${alpha('#8b5cf6', 0.2)}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor: '#8b5cf6',
                                }}
                              />
                            ))}
                          </Box>
                          <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                            Thinking...
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </Box>

              <Divider sx={{ borderColor: alpha('#8b5cf6', 0.2) }} />

              {/* Input Area */}
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    inputRef={textFieldRef}
                    fullWidth
                    multiline
                    maxRows={3}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about your career..."
                    disabled={isLoading}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: alpha('#8b5cf6', 0.05),
                        border: `1px solid ${alpha('#8b5cf6', 0.2)}`,
                        borderRadius: 2,
                        color: '#f1f5f9',
                        fontSize: '0.9rem',
                        '& fieldset': { border: 'none' },
                        '&:hover': {
                          backgroundColor: alpha('#8b5cf6', 0.1),
                          border: `1px solid ${alpha('#8b5cf6', 0.3)}`,
                        },
                        '&.Mui-focused': {
                          backgroundColor: alpha('#8b5cf6', 0.1),
                          border: `1px solid ${alpha('#8b5cf6', 0.4)}`,
                          boxShadow: `0 0 0 2px ${alpha('#8b5cf6', 0.2)}`,
                        },
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: '#94a3b8',
                        opacity: 1,
                      },
                    }}
                  />
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    sx={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                      color: 'white',
                      width: 48,
                      height: 48,
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)',
                      },
                      '&:disabled': {
                        background: alpha('#8b5cf6', 0.3),
                        color: alpha('#fff', 0.5),
                        transform: 'none',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                    ) : (
                      <Send sx={{ fontSize: 20 }} />
                    )}
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
