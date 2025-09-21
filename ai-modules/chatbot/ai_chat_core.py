import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SYSTEM_PROMPT = """
You are Career Compass Your Name is AVA AI, an expert AI career guide powered by Gemini. Your mission is to provide personalized, actionable, and encouraging career guidance to anyone who asks. You are a master at understanding a user's unique background, skills, and aspirations and connecting them to the modern job market.

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
- **Stay Professional:** Maintain a helpful, encouraging tone while being realistic.
"""

class CareerCompassChat:
    def __init__(self):
        self.model = None
        self.chat_sessions = {}
        self.initialize_model()
    
    def initialize_model(self):
        """Initialize the Gemini AI model"""
        try:
            # Get API key from environment
            api_key = os.getenv('GOOGLE_API_KEY')
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
            genai.configure(api_key=api_key)
            
            self.model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction=SYSTEM_PROMPT
            )
            
            print("✅ Career Compass Chat model initialized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error initializing Career Compass Chat: {e}")
            self.model = None
            return False
    
    def create_session(self, session_id):
        """Create a new chat session"""
        try:
            if not self.model:
                return None
            
            chat_session = self.model.start_chat(history=[])
            self.chat_sessions[session_id] = chat_session
            print(f"🤖 Created new chat session: {session_id}")
            return chat_session
            
        except Exception as e:
            print(f"❌ Error creating chat session: {e}")
            return None
    
    def get_session(self, session_id):
        """Get existing chat session or create new one"""
        if session_id not in self.chat_sessions:
            return self.create_session(session_id)
        return self.chat_sessions[session_id]
    
    def send_message(self, session_id, message):
        """Send message to chat session and get response"""
        try:
            if not self.model:
                return {
                    'success': False,
                    'response': "I'm experiencing some technical difficulties with my AI systems. However, I'm still here to help! I specialize in career guidance, skill development, and job search strategies. What specific area would you like to explore?",
                    'error': 'Model not initialized'
                }
            
            chat_session = self.get_session(session_id)
            if not chat_session:
                return {
                    'success': False,
                    'response': "I'm having trouble creating a chat session. Let me try to help anyway! What career-related question can I assist you with?",
                    'error': 'Failed to create session'
                }
            
            # Send message to Gemini
            response = chat_session.send_message(message)
            
            print(f"💬 User [{session_id[:8]}]: {message[:50]}...")
            print(f"🤖 AI Response: {response.text[:50]}...")
            
            return {
                'success': True,
                'response': response.text,
                'session_id': session_id
            }
            
        except Exception as e:
            print(f"❌ Error sending message: {e}")
            return {
                'success': False,
                'response': "I encountered an issue processing your message. Let me try to help anyway! I'm here to assist with career guidance, skill development, job searching strategies, and professional growth. What specific area would you like to explore?",
                'error': str(e)
            }
    
    def clear_session(self, session_id):
        """Clear a specific chat session"""
        if session_id in self.chat_sessions:
            del self.chat_sessions[session_id]
            print(f"🗑️ Cleared chat session: {session_id}")
    
    def get_session_count(self):
        """Get number of active sessions"""
        return len(self.chat_sessions)

# Create global instance
career_compass_chat = CareerCompassChat()

# API functions for integration
def get_chat_response(session_id, message):
    """Main API function for getting chat responses"""
    return career_compass_chat.send_message(session_id, message)

def create_new_session(session_id):
    """Create a new chat session"""
    session = career_compass_chat.create_session(session_id)
    return session is not None

def get_chat_health():
    """Get chat system health status"""
    return {
        'model_available': career_compass_chat.model is not None,
        'active_sessions': career_compass_chat.get_session_count()
    }

if __name__ == "__main__":
    # Test the chat system
    print("🤖 Testing Career Compass Chat...")
    test_session = "test_session"
    
    # Test creating session
    if create_new_session(test_session):
        print("✅ Session created successfully")
        
        # Test sending a message
        result = get_chat_response(test_session, "Hello, I need career advice!")
        if result['success']:
            print(f"✅ Chat response: {result['response'][:100]}...")
        else:
            print(f"❌ Chat error: {result['error']}")
    else:
        print("❌ Failed to create session")