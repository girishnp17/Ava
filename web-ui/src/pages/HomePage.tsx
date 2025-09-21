import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Container,
  Stack,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Description,
  Work,
  School,
  Search,
  Psychology,
  AutoAwesome,
  Speed,
  Security,
  PlayArrow,
} from '@mui/icons-material';
import ChatBot from '../components/ChatBot/ChatBot';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      title: 'Career Guidance',
      description: 'Get AI-powered career advice and market insights tailored to your goals',
      icon: <Work sx={{ fontSize: 40 }} />,
      path: '/career',
      color: '#3b82f6',
    },
    {
      title: 'Learning Roadmap',
      description: 'Create structured learning paths with AI-curated courses and resources',
      icon: <School sx={{ fontSize: 40 }} />,
      path: '/roadmap',
      color: '#10b981',
    },
    {
      title: 'Job Search',
      description: 'Find relevant jobs with AI-powered matching and real-time market data',
      icon: <Search sx={{ fontSize: 40 }} />,
      path: '/jobs',
      color: '#f59e0b',
    },
    {
      title: 'Resume Generator',
      description: 'Create ATS-optimized resumes with AI-powered content generation',
      icon: <Description sx={{ fontSize: 40 }} />,
      path: '/resume',
      color: '#8b5cf6',
      beta: true,
    },
    {
      title: 'Interview Bot',
      description: 'Practice interviews with AI voice coaching and personalized feedback',
      icon: <Psychology sx={{ fontSize: 40 }} />,
      path: '/interview',
      color: '#ef4444',
      beta: true,
    },
  ];

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 32, color: '#6366f1' }} />,
      title: 'AI-Powered Intelligence',
      description: 'Advanced AI algorithms provide personalized recommendations and insights',
    },
    {
      icon: <Speed sx={{ fontSize: 32, color: '#10b981' }} />,
      title: 'Lightning Fast',
      description: 'Get instant results and recommendations without any delays',
    },
    {
      icon: <Security sx={{ fontSize: 32, color: '#8b5cf6' }} />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security measures',
    },
  ];



  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 3,
                color: '#8b5cf6',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Your Career Success Starts Here
            </Typography>
            
            <Typography
              variant="h1"
              sx={{
                mb: 4,
                background: 'linear-gradient(135deg, #f1f5f9 0%, #8b5cf6 50%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                maxWidth: '4xl',
                mx: 'auto',
                fontSize: { xs: '5rem', md: '6rem', lg: '7rem' },
                fontWeight: 900,
                textAlign: 'center',
                lineHeight: 0.8,
                letterSpacing: '-0.02em',
              }}
            >
              Ava
            </Typography>
            
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                color: '#e2e8f0',
                maxWidth: '600px',
                mx: 'auto',
                textAlign: 'center',
                fontWeight: 500,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 1.5,
              }}
            >
              Your AI-powered career companion
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                mb: 8,
                maxWidth: '500px',
                mx: 'auto',
                fontSize: { xs: '0.95rem', md: '1rem' },
                lineHeight: 1.6,
                color: '#94a3b8',
                textAlign: 'center',
              }}
            >
              Smart guidance, personalized paths, and intelligent matching for your career success.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              sx={{ mb: 12 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesome />}
                onClick={() => navigate('/career')}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                    boxShadow: '0 12px 40px rgba(139, 92, 246, 0.5)',
                    transform: 'translateY(-3px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Start Your Journey
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayArrow />}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  color: '#8b5cf6',
                  borderColor: 'rgba(139, 92, 246, 0.5)',
                  '&:hover': {
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Watch Demo
              </Button>
            </Stack>
          </Box>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 3, color: '#f1f5f9' }}>
              Everything you need to{' '}
              <Box component="span" sx={{ color: '#3b82f6' }}>
                accelerate
              </Box>
              {' '}your career
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: '600px',
                mx: 'auto',
                fontSize: '1.125rem',
                color: '#94a3b8',
              }}
            >
              Our AI-powered platform provides all the tools you need to make informed 
              career decisions and achieve your professional goals.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 12 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      textAlign: 'center',
                      background: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 3, color: '#f1f5f9' }}>
              Powerful tools for every career stage
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: '600px',
                mx: 'auto',
                fontSize: '1.125rem',
                color: '#94a3b8',
              }}
            >
              From career exploration to interview preparation, our comprehensive 
              suite of AI tools guides you every step of the way.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {tools.map((tool, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ height: '100%' }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        background: 'rgba(139, 92, 246, 0.05)',
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(135deg, ${tool.color} 0%, #8b5cf6 100%)`,
                      },
                    }}
                    onClick={() => navigate(tool.path)}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            color: tool.color,
                            mr: 2,
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {tool.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
                              {tool.title}
                            </Typography>
                            {tool.beta && (
                              <Box
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: 'white',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.1em',
                                  boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                                }}
                              >
                                Beta
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 3, color: '#94a3b8' }}>
                        {tool.description}
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: tool.color,
                          color: tool.color,
                          '&:hover': {
                            borderColor: tool.color,
                            bgcolor: alpha(tool.color, 0.05),
                          },
                        }}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Box
            sx={{
              mt: 12,
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              border: '1px solid rgba(139, 92, 246, 0.2)',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)',
            }}
          >
            <Typography variant="h3" sx={{ mb: 2, color: '#f1f5f9', fontSize: { xs: '1.75rem', md: '2rem' } }}>
              Ready to accelerate your career?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                maxWidth: '400px',
                mx: 'auto',
                fontSize: '1rem',
                color: '#94a3b8',
                lineHeight: 1.5,
              }}
            >
              Join professionals advancing their careers with AI-powered guidance.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AutoAwesome />}
              onClick={() => navigate('/career')}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Start Your Journey
            </Button>
          </Box>
        </motion.div>
      </Container>

      {/* ChatBot Component */}
      <ChatBot />
    </Box>
  );
};

export default HomePage;
