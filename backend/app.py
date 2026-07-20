import json
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

# Internal Imports
from config import get_gemini_model
from pdf_processor import extract_text_from_pdf
from vector_store import add_cv_to_vector_store, query_matching_developers
from auth import verify_token
from vector_store import add_cv_to_vector_store, query_matching_developers, list_developers, delete_developer

app = FastAPI(title="SpecMatch AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "SpecMatch AI FastAPI Backend is Running Successfully!"}

@app.post("/upload-cv/")
async def upload_cv(
    developer_name: str,
    file: UploadFile = File(...),
    company_id: str = Depends(verify_token)   # <-- Auto-verifies token, extracts company_id
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        contents = await file.read()
        extracted_text = extract_text_from_pdf(contents)

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")

        add_cv_to_vector_store(company_id, developer_name, file.filename, extracted_text)
        return {"status": "Success", "message": f"CV for {developer_name} uploaded successfully!"}
    except HTTPException:
        raise
    except RuntimeError as e:
        if "GEMINI_API_KEY" in str(e):
            raise HTTPException(status_code=503, detail="GEMINI_API_KEY is not configured. Set it in the backend environment before uploading CVs.")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-rfp/")
async def analyze_rfp(
    file: UploadFile = File(...),
    company_id: str = Depends(verify_token)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        contents = await file.read()
        rfp_text = extract_text_from_pdf(contents)

        if not rfp_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the RFP PDF.")

        model = get_gemini_model()
        prompt = f"""
        Analyze the following Request for Proposal (RFP) text and extract the key details.
        Return output STRICTLY in JSON format without markdown code blocks.

        Required JSON Structure:
        {{
            "project_name": "Extract title",
            "technical_stack": ["list", "of", "technologies"],
            "core_features": ["list", "of", "features"],
            "estimated_team_size": 3
        }}

        RFP Text:
        {rfp_text}
        """
        response = model.generate_content(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        return {"status": "Success", "data": json.loads(cleaned_response)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match-resources/")
async def match_resources(
    rfp_analysis: dict,
    company_id: str = Depends(verify_token)
):
    try:
        tech_stack = rfp_analysis.get("technical_stack", [])
        if not tech_stack:
            raise HTTPException(status_code=400, detail="No technical stack found in incoming data.")

        developers_context = query_matching_developers(company_id, tech_stack, n_results=5)

        model = get_gemini_model()
        prompt = f"""
        Compare Client RFP Requirements with Available Internal Developers profiles.
        Return output STRICTLY in JSON format without markdown code blocks.

        Client RFP Technical Stack: {tech_stack}
        Client RFP Core Features: {rfp_analysis.get("core_features", [])}

        Available Internal Developers Profiles:
        {developers_context if developers_context else "No developer profiles available."}

        Required JSON Structure:
        {{
            "overall_match_score": 85,
            "allocated_team": [
                {{
                    "name": "Developer Name",
                    "role": "Suggested Role",
                    "matched_skills": ["Skill 1"]
                }}
            ],
            "critical_skills_gap": ["Missing Tech"],
            "hiring_recommendation": "Detailed recommendation text."
        }}
        """
        response = model.generate_content(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        return {"status": "Success", "report": json.loads(cleaned_response)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/developers/")
async def get_developers(company_id: str = Depends(verify_token)):
    try:
        developers = list_developers(company_id)
        return {"status": "Success", "developers": developers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/developers/{doc_id}")
async def remove_developer(doc_id: str, company_id: str = Depends(verify_token)):
    try:
        deleted = delete_developer(company_id, doc_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Developer not found in your workspace.")
        return {"status": "Success", "message": "Developer removed successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)