#!/usr/bin/env python3
"""
Unified AI Tools - Main Flask Application
Provides REST API and WebSocket support for career guidance, job search, resume generation, and voice interviews
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
import sys
from dotenv import load_dotenv
import threading
import subprocess
import time
import uuid
import base64
import inspect
import traceback
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()

# Configuration
current_dir = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(current_dir, 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*")

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Add AI module paths correctly - each module in its own subdirectory
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(current_dir, 'ai-modules', 'career-guidance-ai'))
sys.path.insert(0, os.path.join(current_dir, 'ai-modules', 'course-recommender'))
sys.path.insert(0, os.path.join(current_dir, 'ai-modules', 'JobbbSSS'))
sys.path.insert(0, os.path.join(current_dir, 'ai-modules', 'resume-generator'))
sys.path.insert(0, os.path.join(current_dir, 'ai-modules', 'chatbot'))

print("🔧 Loading AI modules...")

# Import modules with proper error handling
try:
    from ai_course_core import CourseRecommender, get_course_recommendations
    print("✅ Course recommender loaded")
except Exception as e:
    print(f"❌ Course recommender error: {e}")
    CourseRecommender = None
    get_course_recommendations = None

try:
    # Use RapidAPI job scraper exclusively for better reliability
    from rapidapi_job_scraper import AIJobScraper
    print("✅ RapidAPI job scraper loaded")
except Exception as e:
    print(f"❌ RapidAPI job scraper error: {e}")
    AIJobScraper = None

# Import career guidance with forced reload
AICareerGuidance = None
try:
    # Force reload by clearing any cached modules
    if 'ai_career_guidance' in sys.modules:
        del sys.modules['ai_career_guidance']
    
    from ai_career_guidance import AICareerGuidance
    print("✅ Career guidance loaded")
    
    # Verify the function signature immediately after import
    import inspect
    sig = inspect.signature(AICareerGuidance().get_complete_analysis)
    print(f"✅ Verified function signature: {sig}")
    
except Exception as e:
    print(f"❌ Career guidance error: {e}")
    AICareerGuidance = None

try:
    from ai_resume_core import AIResumeCore
    print("✅ Resume generator loaded")
except Exception as e:
    print(f"❌ Resume generator error: {e}")
    AIResumeCore = None

# Import AVA Voice Interview System
try:
    sys.path.insert(0, os.path.join(current_dir, 'ai-modules', 'AVA_voice'))
    
    # Set the correct API key for voice interview
    os.environ["GOOGLE_API_KEY"] = os.getenv('GOOGLE_API_KEY')
    
    from voice_final import OptimizedVoiceInterview
    print("✅ AVA Voice Interview loaded")
except Exception as e:
    print(f"❌ AVA Voice Interview error: {e}")
    OptimizedVoiceInterview = None

# Import WebSocket Voice Interview Handler
try:
    from voice_interview_handler import WebSocketVoiceInterviewHandler
    voice_handler = WebSocketVoiceInterviewHandler(socketio)
    print("✅ WebSocket Voice Interview Handler loaded")
except Exception as e:
    print(f"❌ WebSocket Voice Interview Handler error: {e}")
    voice_handler = None

# Import Career Compass Chat
try:
    from ai_chat_core import get_chat_response, create_new_session, get_chat_health
    print("✅ Career Compass Chat loaded")
except Exception as e:
    print(f"❌ Career Compass Chat error: {e}")
    get_chat_response = None
    create_new_session = None
    get_chat_health = None

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'message': 'AI API running'})

# ============================================================================
# FILE UPLOAD API - Resume Upload
# ============================================================================

@app.route('/api/upload/resume', methods=['POST'])
def upload_resume():
    """Upload resume file for voice interview"""
    try:
        print("📄 Resume upload request received")
        
        # Check if file was included in request
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if file was selected
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'File type not allowed. Please upload PDF, DOC, or DOCX files.'}), 400
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save file
        file.save(file_path)
        
        print(f"✅ Resume uploaded successfully: {unique_filename}")
        
        return jsonify({
            'success': True,
            'filename': unique_filename,
            'original_filename': filename,
            'file_path': file_path,
            'message': 'Resume uploaded successfully'
        })
        
    except Exception as e:
        print(f"❌ Resume upload error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ============================================================================
# CHAT API - Career Compass Chatbot
# ============================================================================

@app.route('/api/chat', methods=['POST'])
def chat():
    """Career Compass Chat API"""
    try:
        if get_chat_response is None:
            return jsonify({
                'response': "I'm experiencing some technical difficulties with my AI systems. However, I'm still here to help! I specialize in career guidance, skill development, and job search strategies. What specific area would you like to explore?",
                'session_id': 'fallback'
            })
        
        data = request.get_json()
        message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get response from chat module
        result = get_chat_response(session_id, message)
        
        return jsonify({
            'response': result.get('response', 'No response generated'),
            'session_id': session_id,
            'success': result.get('success', False)
        })
        
    except Exception as e:
        print(f"❌ Chat API error: {e}")
        return jsonify({
            'response': "I encountered an issue processing your message. Let me try to help anyway! I'm here to assist with career guidance, skill development, job searching strategies, and professional growth. What specific area would you like to explore?",
            'session_id': data.get('session_id', 'fallback') if 'data' in locals() else 'fallback'
        })

@app.route('/api/chat/new-session', methods=['POST'])
def new_chat_session():
    """Create a new chat session"""
    try:
        import uuid
        session_id = str(uuid.uuid4())
        
        if create_new_session:
            success = create_new_session(session_id)
            if success:
                return jsonify({
                    'session_id': session_id,
                    'message': 'New session created successfully'
                })
        
        return jsonify({
            'session_id': session_id,
            'message': 'Session created (fallback mode)'
        })
            
    except Exception as e:
        print(f"❌ Error creating new session: {e}")
        return jsonify({'error': 'Error creating new session'}), 500

@app.route('/api/chat/health', methods=['GET'])
def chat_health():
    """Chat system health check"""
    try:
        if get_chat_health:
            health_data = get_chat_health()
            return jsonify({
                'status': 'healthy',
                'chat_available': True,
                **health_data
            })
        else:
            return jsonify({
                'status': 'degraded',
                'chat_available': False,
                'message': 'Chat module not loaded'
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'chat_available': False,
            'error': str(e)
        })

# ============================================================================
# 5-PAGE APPLICATION STRUCTURE
# ============================================================================
# PAGE 1: Career Guidance Analysis (/api/career/analyze)
# PAGE 2: Course Recommendations & Learning Roadmap (/api/courses/recommend, /api/roadmap/create)  
# PAGE 3: Job Search (/api/jobs/search)
# PAGE 4: Resume Generation (/api/resume/generate)
# PAGE 5: AVA Voice Interview (/api/interview/voice/*)
# ============================================================================

@app.route('/api/courses/recommend', methods=['POST'])
def recommend_courses():
    """PAGE 2: Course Recommendations using AI Course Core"""
    try:
        if get_course_recommendations is None:
            return jsonify({'success': False, 'error': 'Course recommender module not available'}), 500
            
        data = request.get_json()
        print(f"🎓 PAGE 2: Generating course recommendations for: {data.get('interests', '')}")
        
        # Use the main API function from the course recommender
        result = get_course_recommendations(
            interests=data.get('interests', ''),
            skills=data.get('skills', ''),
            goals=data.get('goals', '')
        )
        
        print(f"✅ Course recommendations generated: {result.get('success', False)}")
        if result.get('success'):
            courses_count = len(result.get('data', {}).get('course_recommendations', []))
            print(f"   🎓 Found {courses_count} courses")
            
        return jsonify(result)
    except Exception as e:
        print(f"❌ Course recommendation error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Add request tracking to prevent duplicates
active_requests = set()
active_career_requests = set()

@app.route('/api/roadmap/create', methods=['POST'])  
def create_roadmap():
    """PAGE 2: Learning Roadmap using AI Course Core (same as course recommendations)"""
    try:
        data = request.get_json()
        subject = data.get('subject', '')
        current_skills = data.get('currentSkills', '')
        goals = data.get('goals', '')
        
        # Create request ID to prevent duplicates
        request_id = f"{subject}_{current_skills}_{goals}".lower().replace(' ', '_')
        
        # Check if this request is already being processed
        if request_id in active_requests:
            print(f"⚠️ Duplicate request detected for: {subject} - skipping")
            return jsonify({'success': False, 'error': 'Request already being processed'}), 429
        
        # Add to active requests
        active_requests.add(request_id)
        
        try:
            print(f"🎯 PAGE 2: Creating integrated roadmap + courses for: {subject}")
            
            # Use the course recommender which generates both roadmap and courses
            if get_course_recommendations is not None:
                print("✅ Using CourseRecommender for integrated roadmap+courses")
                
                try:
                    result = get_course_recommendations(
                        interests=subject,
                        skills=current_skills,
                        goals=goals
                    )
                    
                    if result.get('success'):
                        print(f"✅ Integrated roadmap+courses generated successfully")
                        courses_count = len(result.get('data', {}).get('course_recommendations', []))
                        steps_count = len(result.get('data', {}).get('roadmap', {}).get('steps', []))
                        print(f"   📚 {steps_count} learning steps")
                        print(f"   🎓 {courses_count} courses with URLs")
                        return jsonify(result)
                    else:
                        print(f"⚠️ Course recommender failed with error: {result.get('error', 'Unknown error')}")
                        return jsonify({'success': False, 'error': f"Course recommender failed: {result.get('error', 'Unknown error')}"}), 500
                except Exception as e:
                    print(f"❌ Exception in course recommender: {str(e)}")
                    print(f"❌ Full traceback: {traceback.format_exc()}")
                    return jsonify({'success': False, 'error': f"Course recommender exception: {str(e)}"}), 500
        finally:
            # Always remove from active requests
            active_requests.discard(request_id)
        
        # If course recommender is not available
        return jsonify({
            'success': False, 
            'error': 'Course recommender module not available'
        }), 500
        
    except Exception as e:
        print(f"❌ Roadmap creation error: {e}")
        print(f"❌ Full traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/jobs/search', methods=['POST'])
def search_jobs():
    """PAGE 3: Job Search using RapidAPI Job Scraper"""
    try:
        if AIJobScraper is None:
            return jsonify({'success': False, 'error': 'Job scraper module not available'}), 500
            
        print("🔍 PAGE 3: Job search request received")
        data = request.get_json()
        print(f"📝 Request data: {data}")
        
        scraper = AIJobScraper()
        result = scraper.search_jobs(
            query=data.get('query', ''),
            location=data.get('location', 'Remote')
        )
        
        print(f"✅ Job search completed: Found {result.get('total_found', 0)} jobs")
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        print(f"❌ Job search error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/career/analyze', methods=['POST'])
def analyze_career():
    """PAGE 1: Career Guidance Analysis"""
    try:
        # Check if AICareerGuidance is available
        if AICareerGuidance is None:
            return jsonify({
                'success': False, 
                'error': 'Career guidance module is not available. Please check the server logs for import errors.'
            }), 500
        
        data = request.get_json()
        print(f"📝 PAGE 1: Received career analysis data: {data}")  # Debug log
        
        # Create request ID to prevent duplicates
        domain_interest = data.get('domainInterest', '').lower().strip()
        request_id = f"career_{domain_interest}".replace(' ', '_')
        
        # Check if this request is already being processed
        if request_id in active_career_requests:
            print(f"⚠️ Duplicate career analysis request detected for: {domain_interest} - skipping")
            return jsonify({'success': False, 'error': 'Career analysis already in progress for this domain'}), 429
        
        # Add to active requests
        active_career_requests.add(request_id)
        
        try:
            guidance = AICareerGuidance()
            
            # Debug: Check the function signature
            sig = inspect.signature(guidance.get_complete_analysis)
            print(f"🔍 Function signature: {sig}")  # Debug log
            
            # Only use domain interest and resume file - simplified inputs
            print("🚀 PAGE 1: Calling get_complete_analysis with simplified parameters...")
            result = guidance.get_complete_analysis(
                domain_interest=data.get('domainInterest', ''),
                resume_path=data.get('resumeFile')  # Handle resume file if provided
            )
            print("✅ Career analysis completed successfully")
            return jsonify({'success': True, 'data': result})
        finally:
            # Always remove from active requests
            active_career_requests.discard(request_id)
            
    except Exception as e:
        print(f"❌ Career analysis error: {e}")
        print(f"❌ Error type: {type(e)}")
        print(f"❌ Full traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resume/generate', methods=['POST'])
def generate_resume():
    """PAGE 4: Resume Generation"""
    try:
        if AIResumeCore is None:
            return jsonify({'success': False, 'error': 'Resume generator module not available'}), 500
            
        data = request.get_json()
        print("📄 PAGE 4: Generating resume")
        generator = AIResumeCore()
        
        user_data = {
            'full_name': data.get('personalInfo', {}).get('fullName', ''),
            'email': data.get('personalInfo', {}).get('email', ''),
            'phone': data.get('personalInfo', {}).get('phone', ''),
            'location': data.get('personalInfo', {}).get('location', ''),
            'summary': data.get('personalInfo', {}).get('summary', ''),
            'experience': '\n'.join([f"{exp.get('position', '')} at {exp.get('company', '')}" for exp in data.get('experience', [])]),
            'education': '\n'.join([f"{edu.get('degree', '')} - {edu.get('institution', '')}" for edu in data.get('education', [])]),
            'skills': ', '.join(data.get('skills', []))
        }
        
        result = generator.generate_resume(user_data, data.get('jobDescription', ''))
        print("✅ Resume generated successfully")
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        print(f"❌ Resume generation error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/interview/voice', methods=['POST'])
def start_voice_interview():
    """PAGE 5: AVA Voice Interview - Initialize Session"""
    try:
        data = request.get_json()
        job_description = data.get('jobDescription', '')
        
        print(f"🎙️ PAGE 5: Voice interview request received")
        print(f"📝 Job description length: {len(job_description)}")
        
        # Simple response without trying to import the problematic module
        result = {
            'session_id': f"interview_{int(time.time())}",
            'status': 'ready',
            'interview_structure': {
                'total_questions': 15,
                'fixed_questions': [
                    'Introduce yourself',
                    'Why are you interested in this role and company?',
                    'What\'s your biggest weakness and how are you improving it?'
                ]
            }
        }
        
        print("✅ PAGE 5: Voice interview session prepared successfully")
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        print(f"❌ Voice interview error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/interview/voice/start', methods=['POST'])
def execute_voice_interview():
    """PAGE 5: AVA Voice Interview - Start Execution"""
    try:
        # Return terminal execution instructions
        result = {
            'status': 'terminal_execution',
            'instructions': [
                '1. Open terminal in ai-modules/AVA_voice/',
                '2. Run: python3 voice_final.py',
                '3. Follow voice prompts for interview',
                '4. Results saved automatically'
            ],
            'note': 'Voice interview runs in terminal for microphone access'
        }
        
        print("✅ PAGE 5: Voice interview execution instructions provided")
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        print(f"❌ Voice interview execution error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# WebSocket Event Handlers for Live Voice Interview
# ============================================================================

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f"✅ Client connected: {request.sid}")
    emit('connected', {'status': 'connected', 'sid': request.sid})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"❌ Client disconnected: {request.sid}")

@socketio.on('create_interview_session')
def handle_create_session(data):
    """Create a new voice interview session"""
    try:
        if voice_handler is None:
            emit('error', {'message': 'Voice interview handler not available'})
            return

        session_id = str(uuid.uuid4())
        job_description = data.get('jobDescription', '')
        resume_filename = data.get('resumeFilename', '')
        
        # Construct full path to uploaded resume
        if resume_filename and resume_filename != '':
            resume_path = os.path.join(app.config['UPLOAD_FOLDER'], resume_filename)
            print(f"📄 Using uploaded resume: {resume_path}")
        else:
            # Fallback to default path if no file uploaded
            resume_path = 'resume.pdf'
            print(f"📄 Using default resume path: {resume_path}")

        print(f"🎙️ Creating interview session: {session_id}")
        print(f"📝 Job description length: {len(job_description)}")

        result = voice_handler.create_session(session_id, job_description, resume_path)

        if result['success']:
            join_room(session_id)
            emit('session_created', {
                'session_id': session_id,
                'candidate_name': result.get('candidate_name'),
                'job_title': result.get('job_title'),
                'total_questions': result.get('total_questions'),
                'message': result.get('message')
            })
            print(f"✅ Session created successfully: {session_id}")
        else:
            emit('error', {'message': result['error']})
            print(f"❌ Failed to create session: {result['error']}")

    except Exception as e:
        print(f"❌ Error creating session: {e}")
        emit('error', {'message': str(e)})

@socketio.on('get_next_question')
def handle_get_question(data):
    """Get the next interview question"""
    try:
        if voice_handler is None:
            emit('error', {'message': 'Voice interview handler not available'})
            return

        session_id = data.get('session_id')
        if not session_id:
            emit('error', {'message': 'Session ID required'})
            return

        print(f"📝 Getting next question for session: {session_id}")

        result = voice_handler.get_next_question(session_id)

        if result['success']:
            emit('next_question', result, room=session_id)
            print(f"✅ Question {result['question_number']} sent")
        else:
            emit('error', {'message': result['error'], 'completed': result.get('completed', False)}, room=session_id)

    except Exception as e:
        print(f"❌ Error getting question: {e}")
        emit('error', {'message': str(e)})

@socketio.on('audio_chunk')
def handle_audio_chunk(data):
    """Process incoming audio chunk (complete audio answer)"""
    try:
        print(f"🎵 Received audio_chunk event")
        if voice_handler is None:
            emit('error', {'message': 'Voice interview handler not available'})
            return

        session_id = data.get('session_id')
        audio_b64 = data.get('audio_data')

        print(f"🔑 Session ID: {session_id}")
        print(f"📊 Audio data length: {len(audio_b64) if audio_b64 else 0}")

        if not session_id or not audio_b64:
            emit('error', {'message': 'Session ID and audio data required'})
            return

        # Decode audio data
        audio_bytes = base64.b64decode(audio_b64)

        # Submit answer using the new method
        print(f"🎤 Processing audio answer...")
        result = voice_handler.submit_answer(session_id, audio_bytes)
        
        if result['success']:
            emit('answer_processed', {
                'transcription': result['transcription'],
                'question_number': result['question_number'],
                'next_available': result['next_available']
            }, room=session_id)
            print(f"✅ Answer processed successfully")
        else:
            emit('error', {'message': result['error']})

    except Exception as e:
        print(f"❌ Error processing audio chunk: {e}")
        emit('error', {'message': str(e)})

@socketio.on('finish_recording')
def handle_finish_recording(data):
    """Process complete audio recording (legacy support)"""
    try:
        # This is handled by audio_chunk now, but keeping for compatibility
        print(f"📝 Finish recording event received (using audio_chunk instead)")
        emit('info', {'message': 'Use audio_chunk event to submit complete audio'})

    except Exception as e:
        print(f"❌ Error in finish_recording: {e}")
        emit('error', {'message': str(e)})

@socketio.on('get_transcription')
def handle_get_transcription(data):
    """Get transcription status (legacy support)"""
    try:
        # Transcriptions are now handled immediately in submit_answer
        print(f"📝 Get transcription event received (transcriptions handled immediately)")
        emit('info', {'message': 'Transcriptions are processed immediately with answers'})

    except Exception as e:
        print(f"❌ Error getting transcription: {e}")
        emit('error', {'message': str(e)})

@socketio.on('get_final_report')
def handle_get_final_report(data):
    """Get final interview evaluation report"""
    try:
        if voice_handler is None:
            emit('error', {'message': 'Voice interview handler not available'})
            return

        session_id = data.get('session_id')
        if not session_id:
            emit('error', {'message': 'Session ID required'})
            return

        print(f"📊 Getting final report for session: {session_id}")

        result = voice_handler.get_final_report(session_id)

        if result['success']:
            emit('final_report', result, room=session_id)
            print(f"✅ Final report generated")
        else:
            emit('error', {'message': result['error']})

    except Exception as e:
        print(f"❌ Error getting final report: {e}")
        emit('error', {'message': str(e)})

@socketio.on('cleanup_session')
def handle_cleanup_session(data):
    """Clean up interview session"""
    try:
        if voice_handler is None:
            emit('error', {'message': 'Voice interview handler not available'})
            return

        session_id = data.get('session_id')
        if not session_id:
            emit('error', {'message': 'Session ID required'})
            return

        print(f"🧹 Cleaning up session: {session_id}")

        result = voice_handler.cleanup_session(session_id)

        if result['success']:
            emit('session_cleaned', {'message': 'Session cleaned up successfully'}, room=session_id)
            leave_room(session_id)
            print(f"✅ Session cleaned up: {session_id}")
        else:
            emit('error', {'message': result['error']})

    except Exception as e:
        print(f"❌ Error cleaning up session: {e}")
        emit('error', {'message': str(e)})

def start_frontend():
    """Start the React frontend"""
    time.sleep(3)  # Wait for API to start
    print("🎨 Starting React frontend...")
    os.chdir('web-ui')
    subprocess.run(['npm', 'run', 'dev'])

if __name__ == '__main__':
    print("🚀 Starting Unified AI Tools")
    print(f"🔑 Using API keys from .env")
    
    # Start frontend in separate thread
    frontend_thread = threading.Thread(target=start_frontend)
    frontend_thread.daemon = True
    frontend_thread.start()
    
    print("📡 Starting API server with WebSocket support on http://localhost:8000")
    socketio.run(app, debug=False, host='0.0.0.0', port=8000)
