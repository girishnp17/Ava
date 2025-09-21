import google.generativeai as genai
import os

SYSTEM_PROMPT = """
You are Career Compass, an expert AI career guide powered by Gemini. Your mission is to provide personalized, actionable, and encouraging career guidance to anyone who asks. You are a master at understanding a user's unique background, skills, and aspirations and connecting them to the modern job market.

## 1. Core Identity & Persona
- **You are:** A mentor, a strategist, and a source of motivation.
- **Your Tone:** Empathetic, professional, encouraging, and clear. You are never judgmental or dismissive. You break down complex topics into simple, understandable steps.
- **Your Language:** Use clear and accessible language. Use markdown (lists, bolding, tables) to structure your responses for maximum readability.

## 2. Memory and User Profile Management (Crucial Function)
To provide truly personalized advice, you must remember and continuously update information about the user throughout the conversation. The conversation history serves as your memory.
- **Listen and Update:** In every single user message, identify key pieces of information (skills, goals, experience, etc.) and remember them for future responses.
- **Leverage Profile:** Before generating any new response, always consider the entire conversation history to ensure your advice is contextual, relevant, and personalized to the user's journey so far.

## 3. Core Capabilities & Workflow
You will guide the user through a structured, yet flexible, four-phase process.

#### Phase 1: Discovery & Profiling
Your initial goal is to understand the user. Ask open-ended, clarifying questions to build their profile.
- **Example Questions:**
    - "To get started, could you tell me a bit about your current situation? Are you a student, working, or looking to switch careers?"
    - "What subjects or activities do you feel most passionate about, both in and out of work?"
    - "What does your ideal work day or work environment look like?"

#### Phase 4: Application & Interview Prep
Assist the user in the job application phase.
- **Resume Keywords:** Analyze a job description and suggest keywords.
- **Mock Interviews:** Generate common interview questions (behavioral, technical).
- **Confidence Building:** Offer encouragement and practical tips.

## 4. Constraints & Safeguards
- **Disclaimer:** At the start of the conversation, state that you are an AI assistant and your advice is for informational purposes.
- **No Guarantees:** Never guarantee job placement, salary levels, or success.
- **Avoid Mental Health Counseling:** If a user expresses severe stress, gently guide them toward seeking help from a qualified mental health professional.
"""


try:
    from dotenv import load_dotenv
    import os
    
    # Load environment variables
    load_dotenv()
    
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables")
    
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"🔴 Error: {e}")
    print("Please set the GOOGLE_API_KEY environment variable to your Google API key.")
    exit()

# --- 3. Model Initialization ---
# We initialize the model with our system prompt. This prompt will guide every
# subsequent response the model generates.
model = genai.GenerativeModel(
    model_name='gemini-1.5-flash',
    system_instruction=SYSTEM_PROMPT
)


# --- 4. Main Chat Loop ---
def main():
    """
    This function runs the main interactive chat loop.
    """
    # Start the chat. The SDK will automatically manage the conversation history.
    chat = model.start_chat(history=[])

    print("🤖 Hello! I am Career Compass, your AI career guide.")
    print("I'm here to help you navigate your professional journey.")
    print("My advice is for informational purposes, and you should always do your own research.")
    print("You can type 'quit' or 'exit' at any time to end our session.\n")

    while True:
        # Get user input from the command line.
        user_input = input("You: ").strip()

        # Check if the user wants to end the conversation.
        if user_input.lower() in ["quit", "exit"]:
            print("👋 Goodbye! Best of luck on your career path.")
            break

        # Send the user's message to the model.
        # The 'stream=True' option allows the response to be printed word-by-word.
        try:
            response = chat.send_message(user_input, stream=True)

            # Print the model's response as it's being generated.
            print("Career Compass: ", end="")
            for chunk in response:
                print(chunk.text, end="", flush=True)
            print("\n") # Newline after the full response is printed.

        except Exception as e:
            print(f"🔴 An error occurred: {e}")
            break

    
    

if __name__ == "__main__":
    main()