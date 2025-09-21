import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  Radio,
  FormControlLabel,
  RadioGroup,
  Container,
  Stack,
  alpha,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  AttachMoney,
  ArrowForward,
  AutoAwesome,
  WorkOutline,
  Timeline,
  Psychology,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAnalyzeCareerMutation } from '../store/apiSlice';
import { useNavigate } from 'react-router-dom';

interface CareerData {
  domainInterest: string;
  resumeFile?: File;
}

export default function CareerGuidance() {
  const [careerData, setCareerData] = useState<CareerData>({
    domainInterest: '',
  });
  const [dragActive, setDragActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>('');
  const [analyzeCareer, { data: analysisResult, isLoading }] = useAnalyzeCareerMutation();
  const navigate = useNavigate();
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);

  const handleInputChange = (field: keyof CareerData, value: string | File) => {
    setCareerData(prev => ({ ...prev, [field]: value }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.type.includes('document')) {
        handleInputChange('resumeFile', file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleInputChange('resumeFile', e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    try {
      // Create FormData to send both text and file
      const formData = new FormData();
      formData.append('domainInterest', careerData.domainInterest);
      if (careerData.resumeFile) {
        formData.append('resumeFile', careerData.resumeFile);
      }

      const result = await analyzeCareer({
        domainInterest: careerData.domainInterest,
        resumeFile: careerData.resumeFile,
      }).unwrap();
      
      console.log('✅ Career analysis completed:', result);
      setShowResults(true);
      localStorage.setItem('careerDomain', careerData.domainInterest);
      setIsAutoProcessing(true);
      
    } catch (error: any) {
      console.error('❌ Analysis failed:', error);
      alert('Career analysis failed: ' + (error?.data?.error || error?.message || 'Unknown error'));
    }
  };

  const handleStartNewAnalysis = () => {
    setShowResults(false);
    setCareerData({
      domainInterest: '',
    });
    setSelectedRecommendation('');
  };

  const handleProceedToRoadmap = async () => {
    if (!selectedRecommendation) return;
    
    setIsGeneratingRoadmap(true);
    
    try {
      console.log('🚀 Generating roadmap for selected career:', selectedRecommendation);
      
      // Store selected career information
      localStorage.setItem('selectedCareer', selectedRecommendation);
      localStorage.setItem('careerDomain', selectedRecommendation);
      localStorage.setItem('userResume', careerData.resumeFile?.name || '');
      
      // Generate learning roadmap
      const roadmapResponse = await fetch('/api/roadmap/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedRecommendation,
          currentSkills: '',
          goals: `Master ${selectedRecommendation} skills for career advancement`
        })
      });
      
      const roadmapResult = await roadmapResponse.json();
      
      if (roadmapResult.success) {
        localStorage.setItem('preGeneratedRoadmap', JSON.stringify(roadmapResult));
        console.log('✅ Roadmap generated successfully for:', selectedRecommendation);
        
        // Navigate to roadmap page
        navigate('/roadmap');
      } else {
        console.error('❌ Failed to generate roadmap:', roadmapResult.error);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('❌ Error generating roadmap:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Remove automatic background processing - user will manually trigger roadmap generation

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {!showResults ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section */}
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Chip
              label="AI-Powered Analysis"
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
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              Get personalized career guidance
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
              Our AI analyzes market trends, salary data, and skill requirements to provide 
              tailored career recommendations that match your interests and goals.
            </Typography>
          </Box>

          {/* Input Form */}
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} lg={7}>
              <Card
                sx={{
                  p: 6,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Grid container spacing={4}>
                  {/* Domain Input */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      What career field interests you?
                    </Typography>
                    <TextField
                      fullWidth
                      label="Domain of Interest"
                      value={careerData.domainInterest}
                      onChange={(e) => handleInputChange('domainInterest', e.target.value)}
                      placeholder="e.g., Data Science, Software Development, AI/ML, Product Management"
                      variant="outlined"
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '1.1rem',
                          py: 1,
                        },
                      }}
                    />
                  </Grid>

                  {/* Resume Upload */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Upload your resume (optional)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#64748b' }}>
                      Upload your resume for more personalized recommendations
                    </Typography>
                    
                    <Box
                      sx={{
                        border: '2px dashed',
                        borderColor: dragActive ? '#3b82f6' : '#cbd5e1',
                        borderRadius: 2,
                        p: 6,
                        textAlign: 'center',
                        backgroundColor: dragActive ? alpha('#3b82f6', 0.15) : '#1e293b',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#3b82f6',
                          backgroundColor: alpha('#3b82f6', 0.15),
                        }
                      }}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('resume-upload')?.click()}
                    >
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                      />
                      
                      <CloudUpload sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                      
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'white' }}>
                        {careerData.resumeFile ? careerData.resumeFile.name : 'Drop your resume here'}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                        or click to browse • PDF, DOC, DOCX up to 10MB
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="medium"
                      onClick={handleAnalyze}
                      disabled={isLoading || !careerData.domainInterest.trim()}
                      startIcon={isLoading ? undefined : <AutoAwesome />}
                      sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                      }}
                    >
                      {isLoading ? 'Analyzing Your Career Path...' : 'Get AI Career Analysis'}
                    </Button>
                  </Grid>
                </Grid>

                {/* Info Alert */}
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 4,
                    bgcolor: alpha('#3b82f6', 0.05),
                    border: '1px solid',
                    borderColor: alpha('#3b82f6', 0.2),
                  }}
                >
                  <Typography variant="body2">
                    <strong>What you'll get:</strong> Market analysis, salary insights, required skills, 
                    job demand trends, and personalized career recommendations based on current industry data.
                  </Typography>
                </Alert>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Results Header */}
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Button
              variant="outlined"
              onClick={handleStartNewAnalysis}
              sx={{ mb: 4 }}
            >
              ← Start New Analysis
            </Button>
            
            <Typography 
              variant="h2" 
              sx={{ 
                mb: 2,
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'capitalize'
              }}
            >
              {careerData.domainInterest} Career Analysis
            </Typography>
            
            <Typography variant="body1" sx={{ fontSize: '1.125rem', color: '#64748b' }}>
              AI-powered recommendations based on current market data
            </Typography>
          </Box>

          {analysisResult && (
            <Box>
              {(() => {
                const data = analysisResult.data;
                const recommendationsData = data?.recommendations || {};
                
                let recommendations = [];
                if (Array.isArray(recommendationsData)) {
                  recommendations = recommendationsData;
                } else if (recommendationsData.recommendations && Array.isArray(recommendationsData.recommendations)) {
                  recommendations = recommendationsData.recommendations;
                } else if (data?.career_recommendations && Array.isArray(data.career_recommendations)) {
                  recommendations = data.career_recommendations;
                } else if (data?.recommended_roles && Array.isArray(data.recommended_roles)) {
                  recommendations = data.recommended_roles;
                }

                return (
                  <Box>
                    {/* Recommendations Grid */}
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        mb: 4, 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <WorkOutline color="primary" />
                      Career Recommendations
                    </Typography>
                    
                    {recommendations.length > 0 ? (
                      <Box>
                        <RadioGroup 
                          value={selectedRecommendation} 
                          onChange={(e) => setSelectedRecommendation(e.target.value)}
                        >
                          <Grid container spacing={3} sx={{ mb: 6 }}>
                            {recommendations.map((recommendation: any, index: number) => (
                              <Grid item xs={12} md={6} key={index}>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                  style={{ height: '100%' }}
                                >
                                  <Card
                                    sx={{ 
                                      height: '100%',
                                      border: '2px solid',
                                      borderColor: selectedRecommendation === (recommendation.job_title || `Recommendation ${index + 1}`) 
                                        ? '#3b82f6' : '#e2e8f0',
                                      bgcolor: selectedRecommendation === (recommendation.job_title || `Recommendation ${index + 1}`) 
                                        ? alpha('#3b82f6', 0.05) : '#ffffff',
                                      cursor: 'pointer',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        borderColor: '#3b82f6',
                                        transform: 'translateY(-2px)',
                                      }
                                    }}
                                    onClick={() => setSelectedRecommendation(recommendation.job_title || `Recommendation ${index + 1}`)}
                                  >
                                    <CardContent sx={{ p: 4 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                        <FormControlLabel
                                          value={recommendation.job_title || `Recommendation ${index + 1}`}
                                          control={<Radio />}
                                          label=""
                                          sx={{ mr: 2 }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            {recommendation.job_title || recommendation.title || `Recommendation ${index + 1}`}
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                                            {recommendation.description || recommendation}
                                          </Typography>
                                        </Box>
                                      </Box>

                                      <Divider sx={{ my: 2 }} />

                                      {/* Skills */}
                                      {recommendation.required_skills && (
                                        <Box sx={{ mb: 3 }}>
                                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                            Key Skills
                                          </Typography>
                                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                            {recommendation.required_skills.slice(0, 4).map((skill: string, idx: number) => (
                                              <Chip 
                                                key={idx} 
                                                label={skill} 
                                                size="small" 
                                                sx={{ 
                                                  bgcolor: alpha('#3b82f6', 0.1),
                                                  color: '#3b82f6',
                                                  fontSize: '0.75rem',
                                                }} 
                                              />
                                            ))}
                                          </Stack>
                                        </Box>
                                      )}

                                      {/* Salary and Demand */}
                                      <Stack direction="row" spacing={3}>
                                        {recommendation.salary_range && (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AttachMoney fontSize="small" sx={{ color: '#10b981' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                                              {recommendation.salary_range}
                                            </Typography>
                                          </Box>
                                        )}
                                        
                                        {recommendation.market_demand && (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Timeline fontSize="small" sx={{ color: '#3b82f6' }} />
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                              {recommendation.market_demand}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              </Grid>
                            ))}
                          </Grid>
                        </RadioGroup>
                        
                        {/* Next Steps */}
                        <Box 
                          sx={{ 
                            textAlign: 'center',
                            p: 4,
                            bgcolor: alpha('#3b82f6', 0.05),
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: alpha('#3b82f6', 0.2),
                          }}
                        >
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Ready to start your journey?
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
                            Select a career path above and click to generate your personalized learning roadmap
                          </Typography>
                          
                          <Button
                            variant="contained"
                            size="medium"
                            startIcon={isGeneratingRoadmap ? <CircularProgress size={20} color="inherit" /> : null}
                            endIcon={isGeneratingRoadmap ? null : <ArrowForward />}
                            onClick={handleProceedToRoadmap}
                            disabled={!selectedRecommendation || isGeneratingRoadmap}
                            sx={{ 
                              px: 4, 
                              py: 1.5,
                              fontSize: '1.1rem',
                              fontWeight: 600,
                            }}
                          >
                            {isGeneratingRoadmap ? 'Generating Roadmap...' : 'Generate Learning Roadmap'}
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Alert 
                        severity="info"
                        sx={{
                          p: 3,
                          bgcolor: alpha('#3b82f6', 0.05),
                          border: '1px solid',
                          borderColor: alpha('#3b82f6', 0.2),
                        }}
                      >
                        <Typography variant="body1">
                          AI is generating personalized recommendations based on your profile and current market data. 
                          This may take a few moments...
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                );
              })()}
            </Box>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box 
            sx={{ 
              textAlign: 'center',
              p: 6,
              bgcolor: '#1e293b',
              borderRadius: 3,
              border: '1px solid #334155',
              mt: 4,
            }}
          >
            <Psychology sx={{ fontSize: 64, color: '#3b82f6', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'white' }}>
              AI Analysis in Progress
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#e2e8f0' }}>
              Analyzing market trends, salary data, and skill requirements for your career path
            </Typography>
            <LinearProgress 
              sx={{ 
                width: '100%',
                maxWidth: 400,
                mx: 'auto',
                height: 8,
                borderRadius: 4,
              }} 
            />
          </Box>
        </motion.div>
      )}

      {/* Background Processing */}
      {showResults && isAutoProcessing && (
        <Alert 
          severity="info" 
          sx={{ 
            mt: 4,
            p: 3,
            bgcolor: alpha('#10b981', 0.05),
            border: '1px solid',
            borderColor: alpha('#10b981', 0.2),
          }}
        >
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
            🚀 Preparing your personalized resources
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            AI is generating your learning roadmap and finding relevant job opportunities
          </Typography>
          <LinearProgress sx={{ bgcolor: alpha('#10b981', 0.1) }} />
        </Alert>
      )}
    </Container>
  );
}
