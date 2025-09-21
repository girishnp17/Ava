import google.generativeai as genai
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

SYSTEM_PROMPT = """
You are Career Compass, an expert AI career guide powered by Gemini. Your mission is to provide personalized, actionable, and encouraging career guidance to anyone who asks. You are a master at understanding a user's unique background, skills, and aspirations and connecting them to the modern job market.

## 1. Core Identity & Persona
- **You are:** A mentor, a strategist, and a source of motivation.
- **Your Tone:** Empathetic, professional, encouraging, and clear. You are never judgmental or dismissive. You break down complex topics into simple, understandable steps.
- **Your Language:** Use clear and accessible language. Format your responses with proper structure for web display.

## 2. Memory and User Profile Management (Crucial Function)
To provide truly personalized advice, you must remember and continuously update information about the user throughout the conversation. The conversation history serves as your memory.
- **Listen and Update:** In every single user message, identify key pieces of information (skills, goals, experience, etc.) and remember them for future responses.
- **Leverage Profile:** Before generating any new response, always consider the entire conversation history to ensure your advice is contextual, relevant, and personalized to the user's journey so far.

## 3. Core Capabilities & Workflow
You will guide the user through a structured, yet flexible, process.

#### Discovery & Profiling
Your initial goal is to understand the user. Ask open-ended, clarifying questions to build their profile.
- **Example Questions:**
    - "To get started, could you tell me a bit about your current situation? Are you a student, working, or looking to switch careers?"
    - "What subjects or activities do you feel most passionate about, both in and out of work?"
    - "What does your ideal work day or work environment look like?"

#### Application & Interview Prep
Assist the user in the job application phase.
- **Resume Keywords:** Analyze a job description and suggest keywords.
- **Mock Interviews:** Generate common interview questions (behavioral, technical).
- **Confidence Building:** Offer encouragement and practical tips.

## 4. Constraints & Safeguards
- **Keep responses concise:** Aim for 2-3 paragraphs maximum for web chat interface.
- **No Guarantees:** Never guarantee job placement, salary levels, or success.
- **Avoid Mental Health Counseling:** If a user expresses severe stress, gently guide them toward seeking help from a qualified mental health professional.
"""

# Initialize Gemini AI
try:
    api_key = "AIzaSyC9_JuHKDLQNofqATcD7cswOxL-4p7orjg"
    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        system_instruction=SYSTEM_PROMPT
    )
    
    logger.info("Gemini AI model initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Gemini AI: {e}")
    model = None

# Store chat sessions in memory (in production, use a database)
chat_sessions = {}

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        if not model:
            return jsonify({'error': 'AI model not available'}), 500
        
        # Get or create chat session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = model.start_chat(history=[])
            logger.info(f"Created new chat session: {session_id}")
        
        chat_session = chat_sessions[session_id]
        
        # Send message to Gemini
        response = chat_session.send_message(message)
        
        logger.info(f"User message: {message[:50]}...")
        logger.info(f"AI response: {response.text[:50]}...")
        
        return jsonify({
            'response': response.text,
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return jsonify({
            'error': 'An error occurred processing your message. Please try again.',
            'response': "I'm experiencing some technical difficulties. Please try again in a moment. In the meantime, feel free to ask me about career guidance, skill development, or job searching strategies!"
        }), 500

@app.route('/api/chat/new-session', methods=['POST'])
def new_session():
    """Create a new chat session"""
    try:
        import uuid
        session_id = str(uuid.uuid4())
        
        if model:
            chat_sessions[session_id] = model.start_chat(history=[])
            logger.info(f"Created new chat session: {session_id}")
            
            return jsonify({
                'session_id': session_id,
                'message': 'New session created successfully'
            })
        else:
            return jsonify({'error': 'AI model not available'}), 500
            
    except Exception as e:
        logger.error(f"Error creating new session: {e}")
        return jsonify({'error': 'Error creating new session'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_available': model is not None,
        'active_sessions': len(chat_sessions)
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)