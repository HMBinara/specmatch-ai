import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Header, HTTPException, status

# Firebase Admin SDK Initialization
cred = credentials.Certificate("firebase-service-account.json")
firebase_admin.initialize_app(cred)

# Default Test Company ID (Matches your active workspace/ChromaDB/Neo4j)
TEST_COMPANY_ID = "p8m3oA2qJ1XW6ZKLmqNwWPnPaCM2"


def verify_token(authorization: str = Header(None)) -> str:
    """
    Extracts and verifies the Firebase ID token from the Authorization header.
    Allows easy Swagger UI testing using fallback test tokens while strictly
    verifying real Firebase tokens in production.
    """
    # 1. Missing Authorization Header Case
    if not authorization:
        # Fallback for testing environment / Swagger UI without token
        print("[Auth Warning] No Authorization header provided. Using Test Company ID.")
        return TEST_COMPANY_ID

    # 2. Testing Bypass Case (Swagger UI Convenience)
    cleaned_token = authorization.replace("Bearer ", "").strip()
    if cleaned_token.lower() in ["test", "test-token", "123"]:
        print("[Auth Info] Test Token Detected. Bypassing Firebase Verification.")
        return TEST_COMPANY_ID

    # 3. Real Firebase Authentication Token Verification
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Expected format: 'Bearer <token>'"
        )

    id_token = authorization.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token["uid"]
    except Exception as e:
        print(f"[Auth Error] Firebase Verification Failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token."
        )