import json
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

# Internal Imports
from config import get_gemini_model
from pdf_processor import extract_text_from_pdf
from vector_store import (
    add_cv_to_vector_store,
    query_matching_developers,
    list_developers,
    delete_developer
)
from auth import verify_token
from graph_db import GraphDB  # Import Neo4j Graph Database handler

app = FastAPI(title="SpecMatch AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Neo4j Graph Database
graph_db = GraphDB()


def extract_skills_with_gemini(cv_text: str) -> list[str]:
    """Uses Gemini to extract technical skills from CV text as a JSON array."""
    try:
        model = get_gemini_model()
        prompt = f"""
        Extract all technical skills, programming languages, frameworks, databases, and tools from the following CV text.
        Return output STRICTLY as a JSON array of strings without markdown code blocks.
        Example output: ["Python", "FastAPI", "React", "Docker"]

        CV Text:
        {cv_text}
        """
        response = model.generate_content(prompt)
        cleaned_text = response.text.strip().replace("```json", "").replace("```", "")
        skills = json.loads(cleaned_text)
        return skills if isinstance(skills, list) else []
    except Exception as e:
        print(f"[Gemini Skill Extraction Error]: {e}")
        return []


@app.get("/")
def read_root():
    return {"message": "SpecMatch AI FastAPI Backend with GraphRAG is Running Successfully!"}


@app.post("/upload-cv/")
async def upload_cv(
    developer_name: str,
    file: UploadFile = File(...),
    company_id: str = Depends(verify_token)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        contents = await file.read()
        extracted_text = extract_text_from_pdf(contents)

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")

        # 1. Dual-Write Step 1: Save Vector Embeddings to ChromaDB
        add_cv_to_vector_store(company_id, developer_name, file.filename, extracted_text)

        # 2. Dual-Write Step 2: Extract skills & Build Knowledge Graph in Neo4j
        extracted_skills = extract_skills_with_gemini(extracted_text)
        if extracted_skills:
            graph_db.add_developer_node(company_id, developer_name, extracted_skills)

        return {
            "status": "Success",
            "message": f"CV for {developer_name} uploaded successfully!",
            "extracted_skills": extracted_skills
        }
    except HTTPException:
        raise
    except RuntimeError as e:
        if "GEMINI_API_KEY" in str(e):
            raise HTTPException(
                status_code=503,
                detail="GEMINI_API_KEY is not configured. Set it in the backend environment before uploading CVs."
            )
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
        # Auto-extract inner 'data' if passed directly from /analyze-rfp/ response wrapper
        if "data" in rfp_analysis and isinstance(rfp_analysis["data"], dict):
            rfp_analysis = rfp_analysis["data"]

        tech_stack = rfp_analysis.get("technical_stack", [])
        if not tech_stack:
            raise HTTPException(status_code=400, detail="No technical stack found in incoming data.")

        # 1. Hybrid Retrieval Component A: ChromaDB Vector Search (Semantic Similarity)
        vector_context = query_matching_developers(company_id, tech_stack, n_results=5)

        # 2. Hybrid Retrieval Component B: Neo4j Graph Search (Explicit Skill Relationships)
        graph_matches = graph_db.query_matching_developers(company_id, tech_stack)
        graph_context = json.dumps(graph_matches, indent=2) if graph_matches else "No graph relationship matches found."

        # =========================================================
        # 🔍 TERMINAL DEBUG LOGS (Vector DB vs Graph DB)
        # =========================================================
        print("\n================ [DEBUG: VECTOR DB SEARCH] ================")
        print(f"[ChromaDB] Vector Store Context Retrived:\n{vector_context}")
        print("===========================================================\n")

        print("================ [DEBUG: NEO4J GRAPH DB SEARCH] ================")
        print(f"[Neo4j] Graph Knowledge Matches Retrived:\n{graph_context}")
        print("=================================================================\n")

        # 3. LLM Fusion Reasoning with Gemini
        model = get_gemini_model()
        prompt = f"""
        Compare Client RFP Requirements with Available Internal Developers profiles using BOTH Vector Context and Knowledge Graph Context.
        Return output STRICTLY in JSON format without markdown code blocks.

        Client RFP Technical Stack: {tech_stack}
        Client RFP Core Features: {rfp_analysis.get("core_features", [])}

        ---
        VECTOR STORE CONTEXT (Semantic Similarity Matches):
        {vector_context if vector_context else "No vector profiles available."}

        ---
        KNOWLEDGE GRAPH CONTEXT (Explicit Verified Skill Relationships):
        {graph_context}
        ---

        Required JSON Structure:
        {{
            "overall_match_score": 85,
            "allocated_team": [
                {{
                    "resource": "Developer Name",
                    "role": "Suggested Role",
                    "overlapping_skills": ["Skill 1"]
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
async def remove_developer(
    doc_id: str,
    developer_name: str = None,
    company_id: str = Depends(verify_token)
):
    try:
        # 1. Delete from ChromaDB
        deleted = delete_developer(company_id, doc_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Developer not found in your workspace.")

        # 2. Delete from Neo4j Knowledge Graph
        if not developer_name and "_" in doc_id:
            parts = doc_id.split("_")
            if len(parts) >= 2:
                developer_name = parts[1]

        if developer_name:
            graph_db.delete_developer_node(company_id, developer_name)

        return {"status": "Success", "message": "Developer removed from Vector DB and Knowledge Graph successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)