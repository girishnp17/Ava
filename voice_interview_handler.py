#!/usr/bin/env python3
"""
WebSocket-based Voice Interview Handler
Integrates the optimized voice interview system with real-time WebSocket communication
"""

import asyncio
import threading
import queue
import concurrent.futures
import time
import json
import re
import os
import tempfile
import wave
import subprocess
import PyPDF2
import base64
from datetime import datetime
from typing import Dict, List, Any, Optional
from datetime import datetime
from dotenv import load_dotenv
import google.genai as genai
from google.genai import types
import google.generativeai as text_genai

# Load environment variables
load_dotenv()

# Configure APIs
GEMINI_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY
text_genai.configure(api_key=GEMINI_API_KEY)

# Audio settings
FORMAT = 16  # 16-bit
CHANNELS = 1
RATE = 16000
CHUNK = 1024

class WebSocketOptimizedVoiceInterview:
    """High-performance voice interview system optimized for WebSocket communication"""
    
    def __init__(self):
        # Core models
        self.text_model = text_genai.GenerativeModel('gemini-1.5-pro')
        self.client = genai.Client()
        
        # Interview state
        self.resume_data = {}
        self.job_data = {}
        self.qa_history = []
        self.questions_asked = 0
        self.max_questions = 15
        
        # Enhanced question tracking for diversity
        self.question_types_used = {
            "introduction": [],
            "technical_skills": [],
            "projects_deep_dive": [],
            "certifications": [],
            "behavioral": [],
            "situational": [],
            "leadership": [],
            "problem_solving": [],
            "communication": [],
            "career_goals": []
        }
        
        self.covered_topics = set()
        self.projects_discussed = set()
        self.skills_discussed = set()
        
        # Performance optimization queues
        self.audio_queue = queue.Queue()
        self.transcription_queue = queue.Queue()
        self.question_queue = queue.Queue()
        
        # Thread pools for parallel processing
        self.tts_executor = concurrent.futures.ThreadPoolExecutor(max_workers=3, thread_name_prefix="TTS")
        self.transcribe_executor = concurrent.futures.ThreadPoolExecutor(max_workers=2, thread_name_prefix="Transcribe")
        
        # FIXED first 3 questions - always the same for zero lag
        self.fixed_starter_questions = [
            {"text": "Introduce yourself.", "type": "introduction", "order": 1},
            {"text": "Why are you interested in this role and company?", "type": "behavioral", "order": 2},
            {"text": "What's your biggest weakness and how are you improving it?", "type": "behavioral", "order": 3}
        ]
    
    def extract_pdf_text(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            print(f"Error extracting PDF: {e}")
            return ""
    
    def parse_resume(self, resume_text: str) -> Dict[str, Any]:
        """Parse resume using text Gemini API"""
        prompt = f"""
        Analyze this resume and extract structured information as JSON:
        
        {resume_text}
        
        Return ONLY a JSON object with this exact structure:
        {{
            "name": "candidate name",
            "skills": ["technical skill 1", "technical skill 2", "skill 3", "skill 4", "skill 5"],
            "certifications": ["certification 1", "certification 2"],
            "projects": [
                {{
                    "name": "project name",
                    "description": "brief description",
                    "technologies": ["tech1", "tech2"],
                    "key_features": ["feature1", "feature2"]
                }}
            ],
            "experience": [
                {{
                    "company": "company name",
                    "role": "job title",
                    "duration": "time period",
                    "achievements": ["achievement1", "achievement2"]
                }}
            ],
            "education": [
                {{
                    "degree": "degree name",
                    "institution": "school name",
                    "year": "graduation year"
                }}
            ],
            "soft_skills": ["leadership", "teamwork", "communication"]
        }}
        """
        
        try:
            response = self.text_model.generate_content(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {"error": "Could not parse resume"}
        except Exception as e:
            return {"error": str(e)}
    
    def analyze_job_description(self, job_description: str) -> Dict[str, Any]:
        """Analyze job description"""
        prompt = f"""
        Analyze this job description and extract key requirements as JSON:
        
        {job_description}
        
        Return ONLY a JSON object:
        {{
            "job_title": "job title",
            "required_skills": ["skill1", "skill2", "skill3", "skill4"],
            "preferred_skills": ["pref1", "pref2"],
            "experience_level": "junior/mid/senior",
            "key_responsibilities": ["responsibility1", "responsibility2"],
            "soft_skills_needed": ["teamwork", "leadership", "communication"],
            "interview_focus_areas": ["area1", "area2", "area3"]
        }}
        """
        
        try:
            response = self.text_model.generate_content(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {"error": "Could not parse job description"}
        except Exception as e:
            return {"error": str(e)}

            interview.resume_data = interview.parse_resume(resume_text)
            interview.job_data = interview.analyze_job_description(job_description)

            # Pre-load fixed starter questions
            interview.preload_fixed_starter_questions()

            # Store session
            self.sessions[session_id] = interview
            self.audio_chunks[session_id] = []

            return {
                "success": True,
                "session_id": session_id,
                "resume_data": interview.resume_data,
                "job_data": interview.job_data,
                "total_questions": interview.max_questions,
                "fixed_starter_questions": [q["text"] for q in interview.fixed_starter_questions]
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_next_question(self, session_id: str):
        """Get the next interview question with audio"""
        try:
            if session_id not in self.sessions:
                return {"success": False, "error": "Session not found"}
            
            interview = self.sessions[session_id]
            
            if interview.questions_asked >= interview.max_questions:
                return {"success": False, "error": "Interview completed", "completed": True}
            
            print(f"🎤 Getting question #{interview.questions_asked + 1} for session {session_id}")
            
            # Get question data
            question_data = None
            
            if interview.questions_asked < 3:
                # First 3 questions are fixed and preloaded
                try:
                    question_data = interview.audio_queue.get_nowait()
                    print(f"✅ Got preloaded question: {question_data['question'][:50]}...")
                except:
                    # Fallback to fixed questions text
                    fixed_q = interview.fixed_starter_questions[interview.questions_asked]
                    question_data = {
                        "question": fixed_q["text"],
                        "audio": None,
                        "type": fixed_q["type"],
                        "source": "fixed_starter",
                        "order": fixed_q["order"]
                    }
                    print(f"⚠️ Audio queue empty, using text fallback: {fixed_q['text'][:50]}...")
            else:
                # For questions 4-15, try to get from queue or generate
                try:
                    question_data = interview.audio_queue.get_nowait()
                    print(f"✅ Got dynamic question: {question_data['question'][:50]}...")
                except:
                    # Generate dynamically if queue is empty
                    print(f"🔄 Generating dynamic question #{interview.questions_asked + 1}")
                    question_data = self._generate_dynamic_question_sync(session_id)
            
            if question_data:
                question_number = interview.questions_asked + 1
                
                result = {
                    "success": True,
                    "question_number": question_number,
                    "question_text": question_data["question"],
                    "question_type": question_data.get("type", "unknown"),
                    "has_audio": question_data.get("audio") is not None,
                    "total_questions": interview.max_questions
                }
                
                # Add audio data if available
                if question_data.get("audio"):
                    result["audio_data"] = base64.b64encode(question_data["audio"]).decode('utf-8')
                    print(f"✅ Question includes audio data")
                else:
                    print(f"ℹ️ Question is text-only")
                
                print(f"✅ Successfully prepared question {question_number}: {question_data['question'][:50]}...")
                return result
            else:
                print(f"❌ No question data generated")
                return {"success": False, "error": "Could not generate question"}
                
        except Exception as e:
            print(f"❌ Error in get_next_question: {e}")
            import traceback
            print(f"🔍 Full error trace: {traceback.format_exc()}")
            return {"success": False, "error": str(e)}
    
    def generate_tts_audio(self, question_text: str) -> Optional[bytes]:
        """Generate TTS audio in background thread"""
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-preview-tts",
                contents=f"Please read this interview question in a professional, clear interviewer voice: {question_text}",
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name="Aoede"
                            )
                        )
                    )
                )
            )
            
            if response.candidates and len(response.candidates) > 0:
                candidate = response.candidates[0]
                if candidate.content and candidate.content.parts:
                    for part in candidate.content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data:
                            return part.inline_data.data
            return None
                    
        except Exception as e:
            print(f"TTS Error: {e}")
            return None
    
    def preload_fixed_starter_questions(self):
        """Preload the fixed first 3 questions IMMEDIATELY for zero lag"""
        
        def load_fixed_question(question_data):
            question_text = question_data["text"]
            question_type = question_data["type"]
            order = question_data["order"]
            
            audio_data = self.generate_tts_audio(question_text)
            
            self.audio_queue.put({
                "question": question_text,
                "audio": audio_data,
                "type": question_type,
                "source": "fixed_starter",
                "order": order
            })
        
        # Generate all 3 starter questions immediately
        for question_data in self.fixed_starter_questions:
            self.tts_executor.submit(load_fixed_question, question_data)
    
    def generate_next_question_async(self):
        """Generate dynamic questions 4-15 with enhanced diversity"""
        def generate_and_convert():
            if self.questions_asked >= self.max_questions:
                return
            
            # Skip if we're still in the first 3 questions (they're fixed)
            if self.questions_asked < 3:
                return
            
            # Determine what type of question to ask (for questions 4-15)
            question_type = self.determine_next_question_type()
            unused_skills, unused_projects = self.get_unused_resume_elements()
            
            # Build comprehensive context for dynamic questions
            prompt = f"""
            Generate interview question #{self.questions_asked + 1} of 15 for a voice interview.
            
            CANDIDATE RESUME:
            {json.dumps(self.resume_data, indent=2)}
            
            JOB REQUIREMENTS:
            {json.dumps(self.job_data, indent=2)}
            
            ALL PREVIOUS QUESTIONS AND ANSWERS:
            {json.dumps(self.qa_history, indent=2)}
            
            QUESTION TYPE TO FOCUS ON: {question_type}
            
            TOPICS ALREADY COVERED: {list(self.covered_topics)}
            SKILLS ALREADY DISCUSSED: {list(self.skills_discussed)}
            PROJECTS ALREADY DISCUSSED: {list(self.projects_discussed)}
            
            UNUSED SKILLS TO EXPLORE: {unused_skills[:3]}
            UNUSED PROJECTS TO EXPLORE: {unused_projects[:2]}
            
            QUESTION TYPES USED SO FAR: {json.dumps(self.question_types_used, indent=2)}
            
            IMPORTANT CONTEXT:
            - Questions 1-3 were: "Introduce yourself", "Why interested in role", "Biggest weakness"
            - This is question #{self.questions_asked + 1}, so make it DIFFERENT from the first 3
            - Focus on technical depth, specific projects, or situational scenarios
            
            STRICT REQUIREMENTS:
            1. Do NOT repeat any topics, skills, or projects already covered
            2. Focus specifically on the question type: {question_type}
            3. Reference UNUSED elements from their resume
            4. Make it conversational and professional for voice delivery
            5. Be specific and detailed, not generic
            6. Ensure the question explores NEW territory not covered in first 3 questions
            
            Generate ONE specific, unique, technical interview question.
            """
            
            try:
                response = self.text_model.generate_content(prompt)
                question_text = response.text.strip()
                
                # Generate audio for this question
                audio_data = self.generate_tts_audio(question_text)
                
                # Track this question type
                self.question_types_used[question_type].append(self.questions_asked + 1)
                
                # Add to queue
                self.audio_queue.put({
                    "question": question_text,
                    "audio": audio_data,
                    "type": question_type,
                    "source": "generated",
                    "question_number": self.questions_asked + 1
                })
                
            except Exception as e:
                print(f"Error generating question: {e}")
        
        # Submit to executor
        self.tts_executor.submit(generate_and_convert)
    
    def update_covered_topics(self, question: str, answer: str):
        """Update tracking of covered topics, skills, and projects"""
        question_lower = question.lower()
        answer_lower = answer.lower()
        
        # Track skills mentioned
        for skill in self.resume_data.get('skills', []):
            if skill.lower() in question_lower or skill.lower() in answer_lower:
                self.skills_discussed.add(skill)
        
        # Track projects mentioned  
        for project in self.resume_data.get('projects', []):
            project_name = project.get('name', '').lower()
            if project_name and (project_name in question_lower or project_name in answer_lower):
                self.projects_discussed.add(project.get('name', ''))
        
        # Track general topics
        topic_keywords = {
            'leadership': ['lead', 'manage', 'team', 'mentor'],
            'challenges': ['challenge', 'problem', 'difficult', 'issue'],
            'learning': ['learn', 'new', 'study', 'research'],
            'teamwork': ['team', 'collaborate', 'work together'],
            'communication': ['explain', 'present', 'communicate', 'document']
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in question_lower or keyword in answer_lower for keyword in keywords):
                self.covered_topics.add(topic)
    
    def transcribe_audio_blob(self, audio_blob: bytes) -> str:
        """Transcribe audio blob using Gemini"""
        try:
            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_path = temp_file.name
                temp_file.write(audio_blob)
            
            # Upload and transcribe
            uploaded_file = text_genai.upload_file(temp_path)
            response = self.text_model.generate_content([
                uploaded_file,
                "Please transcribe the audio exactly as spoken. Only provide the transcription text, nothing else."
            ])
            
            transcription = response.text.strip()
            
            # Clean up
            os.unlink(temp_path)
            
            return transcription
            
        except Exception as e:
            print(f"Transcription error: {e}")
            return f"[Transcription failed: {e}]"
    
    def generate_final_report(self) -> Dict[str, Any]:
        """Generate evaluation report by ANALYZING ALL USER RESPONSES"""
        prompt = f"""
        You are an expert interviewer evaluating a candidate's interview performance. 
        Analyze the complete interview conversation and provide a comprehensive assessment.
        
        COMPLETE INTERVIEW TRANSCRIPT:
        {json.dumps(self.qa_history, indent=2)}
        
        CANDIDATE PROFILE:
        {json.dumps(self.resume_data, indent=2)}
        
        JOB REQUIREMENTS:
        {json.dumps(self.job_data, indent=2)}
        
        INTERVIEW ANALYTICS:
        - Skills Discussed: {list(self.skills_discussed)}
        - Projects Covered: {list(self.projects_discussed)}
        - Topics Explored: {list(self.covered_topics)}
        
        EVALUATION INSTRUCTIONS:
        Analyze EACH answer the candidate gave. Look for:
        1. Technical accuracy and depth of knowledge
        2. Communication clarity and professionalism
        3. Problem-solving approach and critical thinking
        4. Relevant experience and examples provided
        5. Cultural fit and soft skills demonstrated
        6. Honesty and self-awareness (especially in weakness question)
        7. Enthusiasm and genuine interest in the role
        
        Base your evaluation ENTIRELY on what the candidate actually said in their responses.
        Do NOT make assumptions - only evaluate based on the transcribed answers.
        
        Return ONLY JSON:
        {{
            "overall_score": <integer 1-10>,
            "selected": <boolean true/false>,
            "selection_reason": "detailed justification based on specific answers given",
            "strengths": ["specific strength based on their responses"],
            "improvement_areas": ["specific areas where answers were weak"],
            "recommendations": ["actionable advice based on interview performance"],
            "technical_competency": "poor/fair/good/excellent",
            "communication_skills": "poor/fair/good/excellent", 
            "problem_solving": "poor/fair/good/excellent",
            "cultural_fit": "poor/fair/good/excellent",
            "answer_quality": "assessment of how well they answered questions",
            "summary": "4-5 sentence summary of their actual interview performance"
        }}
        """
        
        try:
            response = self.text_model.generate_content(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {"overall_score": 5, "selected": False, "summary": response.text}
        except Exception as e:
            return {"overall_score": 5, "selected": False, "summary": f"Report error: {e}"}
    
    def __del__(self):
        """Cleanup executors"""
        try:
            self.tts_executor.shutdown(wait=False)
            self.transcribe_executor.shutdown(wait=False)
        except:
            pass


class WebSocketVoiceInterviewHandler:
    """
    Handles WebSocket-based voice interviews with real-time audio streaming
    """

    def __init__(self, socketio):
        self.socketio = socketio
        self.sessions = {}  # session_id -> interview_instance
        self.audio_chunks = {}  # session_id -> audio_data_buffer

    def create_session(self, session_id: str, job_description: str, resume_path: str = "resume.pdf"):
        """Initialize a new interview session"""
        try:
            print(f"🎯 Creating new interview session: {session_id}")
            
            # Create new interview instance
            interview = WebSocketOptimizedVoiceInterview()
            
            # Check if resume file exists
            if not os.path.exists(resume_path):
                error_msg = f"Resume file not found: {resume_path}. Please upload a resume file first."
                print(f"❌ {error_msg}")
                return {"success": False, "error": error_msg}
            
            print(f"📄 Loading resume from: {resume_path}")
            
            # Extract and parse resume
            resume_text = interview.extract_pdf_text(resume_path)
            if not resume_text:
                error_msg = f"Could not extract text from resume file: {resume_path}. Please ensure it's a valid PDF file."
                print(f"❌ {error_msg}")
                return {"success": False, "error": error_msg}
            
            print("✅ Resume extracted successfully")
            
            # Parse resume and job description
            interview.resume_data = interview.parse_resume(resume_text)
            interview.job_data = interview.analyze_job_description(job_description)
            
            print("✅ Resume and job data parsed")
            
            # Preload fixed starter questions immediately
            interview.preload_fixed_starter_questions()
            
            print("🚀 Fixed starter questions preloading...")
            
            # Generate dynamic questions in background
            for i in range(7):  # Generate several dynamic questions
                interview.generate_next_question_async()
            
            print("🔄 Dynamic questions generating in background...")
            
            # Store session
            self.sessions[session_id] = interview
            self.audio_chunks[session_id] = []
            
            # Allow some time for TTS generation
            time.sleep(2)
            
            return {
                "success": True,
                "message": "Interview session created successfully",
                "candidate_name": interview.resume_data.get('name', 'Unknown'),
                "job_title": interview.job_data.get('job_title', 'Unknown Position'),
                "total_questions": interview.max_questions
            }
            
        except Exception as e:
            print(f"❌ Error creating session: {e}")
            import traceback
            print(f"🔍 Full error trace: {traceback.format_exc()}")
            return {"success": False, "error": str(e)}

    def get_next_question(self, session_id: str):
        """Get the next interview question with audio"""
        try:
            if session_id not in self.sessions:
                return {"success": False, "error": "Session not found"}
            
            interview = self.sessions[session_id]
            
            if interview.questions_asked >= interview.max_questions:
                return {"success": False, "error": "Interview completed", "completed": True}
            
            print(f"🎤 Getting question #{interview.questions_asked + 1} for session {session_id}")
            
            # Get question data
            question_data = None
            
            if interview.questions_asked < 3:
                # First 3 questions are fixed and preloaded
                try:
                    question_data = interview.audio_queue.get_nowait()
                    print(f"✅ Got preloaded question: {question_data['question'][:50]}...")
                except:
                    # Fallback to fixed questions text
                    fixed_q = interview.fixed_starter_questions[interview.questions_asked]
                    question_data = {
                        "question": fixed_q["text"],
                        "audio": None,
                        "type": fixed_q["type"],
                        "source": "fixed_starter",
                        "order": fixed_q["order"]
                    }
                    print(f"⚠️ Audio queue empty, using text fallback: {fixed_q['text'][:50]}...")
            else:
                # For questions 4-15, try to get from queue or generate
                try:
                    question_data = interview.audio_queue.get_nowait()
                    print(f"✅ Got dynamic question: {question_data['question'][:50]}...")
                except:
                    # Generate dynamically if queue is empty
                    print(f"🔄 Generating dynamic question #{interview.questions_asked + 1}")
                    question_data = self._generate_dynamic_question_sync(session_id)
            
            if question_data:
                question_number = interview.questions_asked + 1
                
                result = {
                    "success": True,
                    "question_number": question_number,
                    "question_text": question_data["question"],
                    "question_type": question_data.get("type", "unknown"),
                    "has_audio": question_data.get("audio") is not None,
                    "total_questions": interview.max_questions
                }
                
                # Add audio data if available
                if question_data.get("audio"):
                    result["audio_data"] = base64.b64encode(question_data["audio"]).decode('utf-8')
                    print(f"✅ Question includes audio data")
                else:
                    print(f"ℹ️ Question is text-only")
                
                print(f"✅ Successfully prepared question {question_number}: {question_data['question'][:50]}...")
                return result
            else:
                print(f"❌ No question data generated")
                return {"success": False, "error": "Could not generate question"}
                
        except Exception as e:
            print(f"❌ Error in get_next_question: {e}")
            import traceback
            print(f"🔍 Full error trace: {traceback.format_exc()}")
            return {"success": False, "error": str(e)}
    
    def _generate_dynamic_question_sync(self, session_id: str) -> Dict[str, Any]:
        """Synchronously generate a dynamic question"""
        try:
            interview = self.sessions[session_id]
            
            # Determine question type
            question_type = interview.determine_next_question_type()
            unused_skills, unused_projects = interview.get_unused_resume_elements()
            
            prompt = f"""
            Generate interview question #{interview.questions_asked + 1} of 15 for a voice interview.
            
            CANDIDATE RESUME:
            {json.dumps(interview.resume_data, indent=2)}
            
            JOB REQUIREMENTS:
            {json.dumps(interview.job_data, indent=2)}
            
            QUESTION TYPE TO FOCUS ON: {question_type}
            
            UNUSED SKILLS TO EXPLORE: {unused_skills[:3]}
            UNUSED PROJECTS TO EXPLORE: {unused_projects[:2]}
            
            Generate ONE specific, unique, technical interview question that explores {question_type}.
            """
            
            response = interview.text_model.generate_content(prompt)
            question_text = response.text.strip()
            
            # Try to generate audio
            audio_data = interview.generate_tts_audio(question_text)
            
            # Track this question type
            interview.question_types_used[question_type].append(interview.questions_asked + 1)
            
            return {
                "question": question_text,
                "audio": audio_data,
                "type": question_type,
                "source": "generated_sync"
            }
            
        except Exception as e:
            print(f"Error generating dynamic question: {e}")
            return {
                "question": "Tell me about your problem-solving approach when facing technical challenges.",
                "audio": None,
                "type": "problem_solving",
                "source": "fallback"
            }

    def submit_answer(self, session_id: str, audio_blob: bytes):
        """Process audio answer from the user"""
        try:
            if session_id not in self.sessions:
                return {"success": False, "error": "Session not found"}
            
            interview = self.sessions[session_id]
            
            print(f"🎤 Processing answer for session {session_id}, question #{interview.questions_asked + 1}")
            
            # Get current question text
            current_question = "Unknown question"
            if interview.questions_asked < 3:
                current_question = interview.fixed_starter_questions[interview.questions_asked]["text"]
            
            # Transcribe the audio
            transcription = interview.transcribe_audio_blob(audio_blob)
            
            print(f"✅ Transcription: {transcription[:100]}...")
            
            # Update interview tracking
            interview.questions_asked += 1
            interview.update_covered_topics(current_question, transcription)
            
            # Add to history
            interview.qa_history.append({
                "question_number": interview.questions_asked,
                "question": current_question,
                "answer": transcription,
                "timestamp": datetime.now().isoformat()
            })
            
            # Generate next question in background if needed
            if interview.questions_asked < interview.max_questions and interview.questions_asked >= 3:
                interview.generate_next_question_async()
            
            return {
                "success": True,
                "transcription": transcription,
                "question_number": interview.questions_asked,
                "next_available": interview.questions_asked < interview.max_questions
            }
            
        except Exception as e:
            print(f"❌ Error processing answer: {e}")
            return {"success": False, "error": str(e)}

    def get_final_report(self, session_id: str):
        """Generate final interview evaluation report"""
        try:
            if session_id not in self.sessions:
                return {"success": False, "error": "Session not found"}
            
            interview = self.sessions[session_id]
            
            print(f"📊 Generating final report for session {session_id}")
            
            # Generate evaluation
            report = interview.generate_final_report()
            
            # Save to file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"interview_session_{timestamp}.txt"
            
            try:
                with open(filename, 'w') as f:
                    f.write("=" * 80 + "\n")
                    f.write("AI VOICE INTERVIEW SESSION - WEBSOCKET VERSION\n")
                    f.write("=" * 80 + "\n")
                    f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"Candidate: {interview.resume_data.get('name', 'Unknown')}\n")
                    f.write(f"Total Questions: {len(interview.qa_history)}\n")
                    f.write(f"Skills Discussed: {', '.join(interview.skills_discussed)}\n")
                    f.write(f"Projects Discussed: {', '.join(interview.projects_discussed)}\n")
                    f.write(f"Topics Covered: {', '.join(interview.covered_topics)}\n")
                    f.write("=" * 80 + "\n\n")
                    
                    # Full Q&A
                    for qa in interview.qa_history:
                        f.write(f"QUESTION {qa['question_number']}:\n")
                        f.write(f"{qa['question']}\n\n")
                        f.write(f"ANSWER:\n{qa['answer']}\n")
                        f.write("-" * 60 + "\n\n")
                    
                    f.write("=" * 80 + "\n")
                    f.write("EVALUATION REPORT:\n")
                    f.write(json.dumps(report, indent=2))
                    f.write("\n" + "=" * 80 + "\n")
                
                print(f"✅ Interview saved to: {filename}")
                
            except Exception as e:
                print(f"Warning: Could not save to file: {e}")
                filename = None
            
            return {
                "success": True,
                "report": report,
                "saved_file": filename,
                "qa_history": interview.qa_history,
                "session_stats": {
                    "total_questions": len(interview.qa_history),
                    "skills_discussed": len(interview.skills_discussed),
                    "projects_discussed": len(interview.projects_discussed),
                    "topics_covered": len(interview.covered_topics)
                }
            }
            
        except Exception as e:
            print(f"❌ Error generating report: {e}")
            return {"success": False, "error": str(e)}

    def cleanup_session(self, session_id: str):
        """Clean up session data"""
        try:
            if session_id in self.sessions:
                # Cleanup executors
                interview = self.sessions[session_id]
                del interview
                del self.sessions[session_id]
                
            if session_id in self.audio_chunks:
                del self.audio_chunks[session_id]
                
            print(f"🧹 Session {session_id} cleaned up")
            return {"success": True}
            
        except Exception as e:
            print(f"Error cleaning up session: {e}")
            return {"success": False, "error": str(e)}


# Global handler instance
voice_interview_handler = None

def get_voice_interview_handler(socketio):
    """Get or create the voice interview handler"""
    global voice_interview_handler
    if voice_interview_handler is None:
        voice_interview_handler = WebSocketVoiceInterviewHandler(socketio)
    return voice_interview_handler

    def _generate_dynamic_question(self, session_id: str) -> Dict[str, Any]:
        """Generate a dynamic question for questions 4-15"""
        try:
            print(f"🔄 Starting dynamic question generation for session {session_id}")

            if session_id not in self.sessions:
                raise Exception(f"Session {session_id} not found")

            interview = self.sessions[session_id]

            print(f"📊 Session state: questions_asked={interview.questions_asked}, max_questions={interview.max_questions}")
            print(f"📋 Resume data available: {bool(interview.resume_data)}")
            print(f"🎯 Skills discussed: {len(interview.skills_discussed)}")
            print(f"🗂️ Projects discussed: {len(interview.projects_discussed)}")

            # Get unused resume elements for personalization
            try:
                unused_skills, unused_projects = interview.get_unused_resume_elements()
                print(f"🔍 Found unused skills: {len(unused_skills)}, unused projects: {len(unused_projects)}")
                if unused_skills:
                    print(f"   Skills: {list(unused_skills)[:3]}")  # Show first 3
                if unused_projects:
                    print(f"   Projects: {list(unused_projects)[:3]}")  # Show first 3
            except Exception as e:
                print(f"⚠️ Error getting resume elements: {e}")
                unused_skills, unused_projects = set(), set()

            # Generate question based on current progress
            question_text = None
            question_type = "behavioral"  # default

            if unused_skills and len(unused_skills) > 0:
                skill = list(unused_skills)[0]  # Convert to list to get first item
                question_text = f"Tell me about your experience with {skill} and how you've applied it in your projects."
                interview.skills_discussed.add(skill)
                question_type = "technical_skills"
                print(f"✅ Generated skill-based question about: {skill}")

            elif unused_projects and len(unused_projects) > 0:
                project = list(unused_projects)[0]  # Convert to list to get first item
                question_text = f"Can you walk me through your {project} project and the challenges you faced?"
                interview.projects_discussed.add(project)
                question_type = "projects_deep_dive"
                print(f"✅ Generated project-based question about: {project}")

            else:
                # Behavioral/situational questions as fallback
                behavioral_questions = [
                    "Describe a time when you had to work under pressure. How did you handle it?",
                    "Tell me about a challenging technical problem you solved recently.",
                    "How do you stay updated with new technologies in your field?",
                    "Describe your approach to debugging complex issues.",
                    "Tell me about a time you disagreed with a team member. How did you resolve it?",
                    "What's your process for learning a new technology or framework?",
                    "Describe a project where you had to work with unclear requirements.",
                    "How do you ensure code quality in your projects?",
                    "Tell me about a time you had to explain a technical concept to a non-technical person.",
                    "What motivates you to work in this field?",
                    "How do you approach testing your code?",
                    "Describe a time when you had to optimize performance in an application."
                ]

                question_index = min(interview.questions_asked - 3, len(behavioral_questions) - 1)
                question_text = behavioral_questions[question_index]
                question_type = "behavioral"
                print(f"✅ Generated behavioral question #{question_index + 1}")

            if not question_text:
                raise Exception("Failed to generate question text")

            print(f"📝 Generated question: {question_text[:50]}...")

            # Try to generate TTS audio for the question (optional)
            audio_data = None
            try:
                print(f"🎵 Attempting TTS audio generation...")
                audio_data = interview.generate_tts_audio(question_text)
                if audio_data:
                    print(f"✅ TTS audio generated successfully")
                else:
                    print(f"ℹ️ No TTS audio - question will be text-only")
            except Exception as e:
                print(f"⚠️ TTS generation error (continuing without audio): {e}")
                audio_data = None

            result = {
                "question": question_text,
                "audio": audio_data,
                "type": question_type,
                "source": "generated"
            }

            print(f"✅ Dynamic question generation completed successfully")
            return result

        except Exception as e:
            print(f"❌ Critical error in dynamic question generation: {e}")
            import traceback
            print(f"🔍 Full error trace: {traceback.format_exc()}")

            # Return a safe fallback question to prevent the system from crashing
            fallback_question = f"Tell me about a project you're proud of and what you learned from it."
            print(f"🚨 Using fallback question: {fallback_question}")

            return {
                "question": fallback_question,
                "audio": None,
                "type": "fallback",
                "source": "error_fallback"
            }

    def process_audio_chunk(self, session_id: str, audio_data: bytes, mime_type: str = 'audio/webm'):
        """Process incoming audio chunk from client"""
        if session_id not in self.audio_chunks:
            self.audio_chunks[session_id] = []

        # Store or update MIME type for this session
        self.audio_mime_types[session_id] = mime_type

        self.audio_chunks[session_id].append(audio_data)

    def finish_recording(self, session_id: str) -> Dict[str, Any]:
        """Process complete audio recording and get transcription"""
        if session_id not in self.sessions:
            return {"success": False, "error": "Session not found"}

        if session_id not in self.audio_chunks or not self.audio_chunks[session_id]:
            return {"success": False, "error": "No audio data received"}

        interview = self.sessions[session_id]

        try:
            # Combine all audio chunks
            combined_audio = b''.join(self.audio_chunks[session_id])

            # Clear audio buffer
            self.audio_chunks[session_id] = []

            # Get current question info
            question_number = interview.questions_asked + 1
            current_question = "Current question"  # We'll track this properly

            # Get MIME type for this session
            mime_type = self.audio_mime_types.get(session_id, 'audio/webm')

            # Transcribe the audio directly (synchronous)
            print(f"🎤 Transcribing audio for question #{question_number}...")
            transcription = interview.transcribe_audio_blob(combined_audio)
            
            print(f"✅ Transcription: {transcription[:100]}...")
            
            # Update interview tracking
            interview.update_covered_topics("Current question", transcription)
            
            # Add to history
            interview.qa_history.append({
                "question_number": question_number,
                "question": "Current question",  # We'll track this properly
                "answer": transcription,
                "timestamp": datetime.now().isoformat()
            })

            # Note: questions_asked counter is incremented in get_next_question when question is delivered
            # Don't increment here to avoid double counting
            
            # Process transcription purely in background - no frontend interaction needed
            def process_transcription_background():
                print(f"📝 Background transcription processing: {transcription[:50]}...")
                # Just log the transcription - frontend doesn't need to know about it
                # The interview flow is now completely decoupled from transcription
            
            # Start background thread for transcription processing (optional logging)
            threading.Thread(target=process_transcription_background, daemon=True).start()

            return {
                "success": True,
                "message": "Audio processed, next question coming automatically",
                "question_number": question_number
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_transcription(self, session_id: str) -> Dict[str, Any]:
        """Get the latest transcription if available"""
        if session_id not in self.sessions:
            return {"success": False, "error": "Session not found"}

        interview = self.sessions[session_id]

        try:
            # Check if transcription is ready
            transcription_data = interview.transcription_queue.get_nowait()

            # Add to QA history
            interview.qa_history.append(transcription_data)

            return {
                "success": True,
                "transcription": transcription_data["answer"],
                "question_number": transcription_data["question_number"],
                "timestamp": transcription_data["timestamp"]
            }

        except:
            return {"success": False, "error": "Transcription not ready"}

    def end_session(self, session_id: str) -> Dict[str, Any]:
        """End the interview session and generate final report"""
        if session_id not in self.sessions:
            return {"success": False, "error": "Session not found"}

        interview = self.sessions[session_id]

        try:
            # Generate final evaluation report
            final_report = interview.generate_final_report()

            # Save interview to file
            saved_file = interview.save_interview_to_file()

            # Clean up session
            del self.sessions[session_id]
            if session_id in self.audio_chunks:
                del self.audio_chunks[session_id]
            if session_id in self.audio_mime_types:
                del self.audio_mime_types[session_id]

            return {
                "success": True,
                "final_report": final_report,
                "saved_file": saved_file,
                "qa_history": interview.qa_history,
                "total_questions_asked": len(interview.qa_history)
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_session_status(self, session_id: str) -> Dict[str, Any]:
        """Get current status of the interview session"""
        if session_id not in self.sessions:
            return {"success": False, "error": "Session not found"}

        interview = self.sessions[session_id]

        return {
            "success": True,
            "session_id": session_id,
            "questions_asked": interview.questions_asked,
            "total_questions": interview.max_questions,
            "progress_percent": (interview.questions_asked / interview.max_questions) * 100,
            "skills_discussed": list(interview.skills_discussed),
            "projects_discussed": list(interview.projects_discussed),
            "is_complete": interview.questions_asked >= interview.max_questions
        }