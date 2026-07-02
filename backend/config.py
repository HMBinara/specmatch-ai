import os
import google.generativeai as genai

# Initialize Gemini SDK
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_FALLBACK_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def get_gemini_model(model_name="gemini-1.5-flash"):
    """Returns a configured GenerativeModel instance."""
    return genai.GenerativeModel(model_name)