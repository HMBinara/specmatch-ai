import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Header, HTTPException

cred = credentials.Certificate("firebase-service-account.json")
firebase_admin.initialize_app(cred)


def verify_token(authorization: str = Header(...)) -> str:
    """
    Extracts and verifies the Firebase ID token from the Authorization header.
    Returns the company_id (Firebase uid) if valid.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header.")

    id_token = authorization.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")