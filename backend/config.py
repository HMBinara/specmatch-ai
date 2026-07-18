import os
import google.generativeai as genai
from dotenv import load_dotenv

# .env ෆයිල් එක ඇතුළේ තියෙන Key එක සිස්ටම් එකට ලෝඩ් කිරීම
load_dotenv()

def get_gemini_api_key():
    return os.getenv("GEMINI_API_KEY")

def get_gemini_model(model_name="gemini-2.5-flash-lite"):
    """Returns a configured GenerativeModel instance."""
    api_key = get_gemini_api_key()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    genai.configure(api_key=api_key)
    return genai.GenerativeModel(model_name)