import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import {
  VoiceChat,
  PlayArrow,
  Computer,
  CloudUpload,
  Description,
} from '@mui/icons-material';
import { useStartVoiceInterviewMutation, useExecuteVoiceInterviewMutation } from '../store/apiSlice';
import { VoiceInterviewSession } from '../components/Interview/VoiceInterviewSession';

export default function InterviewBot() {
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [voiceSession, setVoiceSession] = useState<any>(null);
  const [useLiveInterview, setUseLiveInterview] = useState(true);
  const [showLiveInterview, setShowLiveInterview] = useState(false);
  const [interviewReport, setInterviewReport] = useState<any>(null);
  const [uploadedResume, setUploadedResume] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startVoiceInterview, { isLoading: isStartingVoice }] = useStartVoiceInterviewMutation();
  const [executeVoiceInterview, { isLoading: isExecutingVoice }] = useExecuteVoiceInterviewMutation();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      alert('File size must be less than 16MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload/resume', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedResume(result);
        console.log('✅ Resume uploaded successfully:', result);
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartVoiceInterview = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description first');
      return;
    }

    if (!uploadedResume) {
      alert('Please upload your resume first');
      return;
    }

    try {
      const result = await startVoiceInterview({
        jobDescription: jobDescription,
        resumeFilename: uploadedResume.filename
      }).unwrap();

      setVoiceSession(result.data);
    } catch (error) {
      console.error('❌ Failed to start voice interview:', error);
      alert('Failed to prepare voice interview. Please try again.');
    }
  };

  const handleExecuteVoiceInterview = async () => {
    try {
      const result = await executeVoiceInterview({
        sessionId: voiceSession?.session_id
      }).unwrap();

      alert(`Voice Interview Instructions:\n\n${result.data.instructions.join('\n')}\n\n${result.data.note}`);
    } catch (error) {
      console.error('❌ Failed to execute voice interview:', error);
      alert('Failed to execute voice interview. Please try again.');
    }
  };

  const handleStartLiveInterview = () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description first');
      return;
    }
    setShowVoiceDialog(false);
    setShowLiveInterview(true);
  };

  const handleInterviewComplete = (report: any) => {
    setInterviewReport(report);
    setShowLiveInterview(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, gap: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center' }}>
          AVA Voice Interview
        </Typography>
        <Box
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
          }}
        >
          Beta
        </Box>
      </Box>

      <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <VoiceChat sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            AI-Powered Voice Interview System
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Experience real-time voice interview with AI evaluation
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label="15 Questions" color="primary" />
            <Chip label="Voice-to-Voice" color="secondary" />
            <Chip label="Real-time Analysis" color="info" />
            <Chip label="Browser-based" color="success" />
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<VoiceChat />}
            onClick={() => setShowVoiceDialog(true)}
            sx={{ px: 4, py: 1.5 }}
          >
            Start Voice Interview
          </Button>
        </CardContent>
      </Card>

      {/* Voice Interview Dialog */}
      <Dialog 
        open={showVoiceDialog} 
        onClose={() => setShowVoiceDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          AVA Voice Interview Setup
        </DialogTitle>
        
        <DialogContent>
          {!voiceSession ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Requirements: Microphone, quiet environment, and your resume file
              </Alert>

              {/* Resume Upload Section */}
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description />
                    Upload Resume
                  </Typography>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                  />
                  
                  {!uploadedResume ? (
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      fullWidth
                    >
                      {isUploading ? 'Uploading...' : 'Choose Resume File (PDF, DOC, DOCX)'}
                    </Button>
                  ) : (
                    <Box>
                      <Alert severity="success" sx={{ mb: 1 }}>
                        ✅ Resume uploaded: {uploadedResume.original_filename}
                      </Alert>
                      <Button
                        variant="text"
                        startIcon={<CloudUpload />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        size="small"
                      >
                        Upload Different File
                      </Button>
                    </Box>
                  )}
                  
                  {isUploading && <LinearProgress sx={{ mt: 1 }} />}
                </CardContent>
              </Card>

              <FormControlLabel
                control={
                  <Switch
                    checked={useLiveInterview}
                    onChange={(e) => setUseLiveInterview(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {useLiveInterview ? <Computer /> : <PlayArrow />}
                    <Typography>
                      {useLiveInterview ? 'Live Browser Interview (Recommended)' : 'Terminal Interview'}
                    </Typography>
                  </Box>
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Job Description"
                placeholder="Paste job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="15 Questions" size="small" />
                <Chip label="AI Generated" size="small" />
                <Chip label="Voice Evaluation" size="small" />
                {useLiveInterview && <Chip label="Real-time" size="small" color="success" />}
              </Box>
            </>
          ) : (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                Session ready: {voiceSession.session_id}
              </Alert>
              
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Fixed Questions:
              </Typography>
              <Box sx={{ mb: 2 }}>
                {voiceSession.interview_structure?.fixed_questions?.map((question: string, index: number) => (
                  <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                    {index + 1}. {question}
                  </Typography>
                ))}
              </Box>
              
              <Alert severity="warning">
                Voice interview runs in terminal. Click Execute for instructions.
              </Alert>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowVoiceDialog(false)}>
            Cancel
          </Button>
          {!voiceSession ? (
            useLiveInterview ? (
              <Button
                variant="contained"
                onClick={handleStartLiveInterview}
                disabled={!jobDescription.trim()}
                color="success"
                startIcon={<Computer />}
              >
                Start Live Interview
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleStartVoiceInterview}
                disabled={!jobDescription.trim() || isStartingVoice}
              >
                {isStartingVoice ? 'Preparing...' : 'Prepare'}
              </Button>
            )
          ) : (
            <Button
              variant="contained"
              onClick={handleExecuteVoiceInterview}
              disabled={isExecutingVoice}
              color="success"
              startIcon={<PlayArrow />}
            >
              {isExecutingVoice ? 'Starting...' : 'Execute'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Live Interview Session */}
      {showLiveInterview && (
        <VoiceInterviewSession
          jobDescription={jobDescription}
          resumeFilename={uploadedResume?.filename}
          onComplete={handleInterviewComplete}
        />
      )}

      {/* Interview Report Display */}
      {interviewReport && !showLiveInterview && (
        <Box sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => setInterviewReport(null)}
            sx={{ mb: 2 }}
          >
            ← Back to Start
          </Button>
        </Box>
      )}
    </Box>
  );
}
