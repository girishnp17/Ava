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
  Chip,
  Avatar,
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
    },
    {
      title: 'Interview Bot',
      description: 'Practice interviews with AI voice coaching and personalized feedback',
      icon: <Psychology sx={{ fontSize: 40 }} />,
      path: '/interview',
      color: '#ef4444',
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Chip
              label="AI-Powered Career Tools"
              sx={{
                mb: 3,
                bgcolor: alpha('#3b82f6', 0.1),
                color: '#3b82f6',
                fontWeight: 600,
                fontSize: '0.875rem',
                px: 2,
                py: 1,
              }}
            />
            
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                maxWidth: '4xl',
                mx: 'auto',
              }}
            >
              Career growth made{' '}
              <Box component="span" sx={{ color: '#3b82f6' }}>
                simple
              </Box>
              <br />
              for ambitious professionals
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                mb: 6,
                maxWidth: '600px',
                mx: 'auto',
                fontSize: '1.25rem',
                lineHeight: 1.7,
              }}
            >
              Most career tools are helpful, but hard to use together. We make the{' '}
              opposite trade-off, and hope you don't get overwhelmed.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 8 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesome />}
                onClick={() => navigate('/career')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Get started today
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayArrow />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Watch demo
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
            <Typography variant="h2" sx={{ mb: 3 }}>
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
            <Typography variant="h2" sx={{ mb: 3 }}>
              Powerful tools for every career stage
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: '600px',
                mx: 'auto',
                fontSize: '1.125rem',
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
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        bgcolor: tool.color,
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
                        <Avatar
                          sx={{
                            bgcolor: alpha(tool.color, 0.1),
                            color: tool.color,
                            mr: 2,
                            width: 56,
                            height: 56,
                          }}
                        >
                          {tool.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {tool.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 3 }}>
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
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              borderRadius: 3,
              border: '1px solid #334155',
            }}
          >
            <Typography variant="h3" sx={{ mb: 2, color: 'white' }}>
              Ready to transform your career?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                maxWidth: '500px',
                mx: 'auto',
                fontSize: '1.125rem',
                color: '#e2e8f0',
              }}
            >
              Join thousands of professionals who have accelerated their careers 
              with our AI-powered tools.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AutoAwesome />}
              onClick={() => navigate('/career')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              Start Your Journey
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HomePage;
