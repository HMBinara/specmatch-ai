# SpecMatch AI

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb?style=flat-square)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)](https://fastapi.tiangolo.com)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square)](https://ai.google.dev)
[![Vector Store](https://img.shields.io/badge/Vector%20Store-ChromaDB-2ecc71?style=flat-square)](https://www.trychroma.com)
[![Auth](https://img.shields.io/badge/Auth-Firebase%20Auth-ffca28?style=flat-square)](https://firebase.google.com)

SpecMatch AI is an AI-driven multi-tenant spec and talent matchmaker built for enterprise delivery teams. It ingests developer CVs, analyzes RFPs with Gemini, and produces a fitment matrix that highlights match scores, critical skill gaps, and recommended team allocation in a workspace-scoped environment.

## Key Features

- Multi-tenant workspace architecture with Firebase Auth and Firestore company scoping.
- Resume ingestion and persistent embedding storage in ChromaDB.
- Intelligent RFP analysis and parameter extraction powered by Gemini.
- Automated resource fitment matrix with critical gap analysis.
- Audit-friendly history of saved fitment sessions.

## Tech Stack

- Frontend: React.js, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios, React Router.
- Backend: FastAPI, Python 3.10+, PyMuPDF for PDF extraction, Gemini SDK, Firebase Admin SDK.
- Database and vector storage: Firebase Firestore for workspace metadata and ChromaDB for developer embeddings.
- Authentication and security: Firebase Auth with Bearer token verification through Firebase Admin SDK.
- AI and LLM integration: Google Gemini for generation and embeddings.

> Current backend model configuration uses `gemini-3.1-flash-lite` for generation and `gemini-embedding-001` for embeddings. If you want to use another Gemini Flash model, update `backend/config.py`.

## System Architecture

```text
			 +-----------------------------+
			 |         React Frontend      |
			 |  React Router + Tailwind    |
			 |  Framer Motion + Axios      |
			 +--------------+--------------+
					  |
					  | Firebase ID token
					  v
			 +--------------+--------------+
			 |         FastAPI Backend     |
			 |  /upload-cv/                |
			 |  /analyze-rfp/              |
			 |  /match-resources/          |
			 |  /developers/               |
			 +------+------------+---------+
				 |            |
		     PDF text  |            | Workspace metadata
				 v            v
		   +-----------+---+   +----+------------------+
		   |   Gemini AI   |   | Firebase Firestore   |
		   | generation +  |   | company profiles     |
		   | embeddings    |   | history records      |
		   +-----------+---+   +----------------------+
				 |
				 v
		   +-----------+--------------------------------+
		   | ChromaDB persistent vector store          |
		   | company_id scoped developer embeddings    |
		   +-------------------------------------------+
```

## Multi-Tenancy and Security

Every authenticated user is mapped to a Firebase UID, and that UID is used as the workspace `company_id` throughout the backend.

- Firestore stores workspace-level records under `companies/{uid}`.
- Developer embeddings in ChromaDB are written with `company_id` metadata.
- Search and delete operations always filter by `company_id` before returning data.
- The backend verifies Firebase ID tokens on every protected API request through the `Authorization: Bearer <token>` header.

This design prevents cross-tenant visibility into CV vectors, developer lists, and fitment history.

## Repository Structure

```text
specmatch-ai/
|-- backend/
|   |-- app.py
|   |-- auth.py
|   |-- config.py
|   |-- pdf_processor.py
|   |-- vector_store.py
|   |-- firebase-service-account.json
|   |-- chroma_db/
|   `-- uploads/
|-- frontend/
|   `-- my-react-app/
|       |-- src/
|       |   |-- App.jsx
|       |   |-- api.js
|       |   |-- firebase.js
|       |   |-- context/
|       |   `-- pages/
|       `-- package.json
|-- requirements.txt
`-- README.md
```

## Local Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Git

### Clone the repository

```bash
git clone <repository-url>
cd specmatch-ai
```

### Backend setup

The backend app lives in `backend/`, while the shared Python dependency list is in the repository root `requirements.txt`.

```bash
cd backend
```

```bash
python -m venv venv
```

Activate the virtual environment:

```bash
venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r ..\requirements.txt
```

Configure backend secrets and credentials:

- Add `GEMINI_API_KEY` to `backend/.env`.
- Place your Firebase Admin service account file at `backend/firebase-service-account.json`.

Run the backend API:

```bash
python -m uvicorn app:app --reload
```

The backend runs on `http://127.0.0.1:8000` by default.

### Frontend setup

The React app lives in `frontend/my-react-app/`.

```bash
cd frontend/my-react-app
npm install
```

Firebase web configuration is currently defined in `src/firebase.js`. If you are connecting a different Firebase project, update that file with your own Firebase web app values.

Start the frontend dev server:

```bash
npm run dev
```

The Vite app runs on `http://localhost:5173` by default.

## API Endpoints Summary

All protected endpoints require a Firebase ID token in the `Authorization` header:

```text
Authorization: Bearer <firebase-id-token>
```

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/` | Health check / backend status | No |
| POST | `/upload-cv/` | Upload and index a developer CV PDF | Yes |
| POST | `/analyze-rfp/` | Extract RFP structure and requirements from a PDF | Yes |
| POST | `/match-resources/` | Generate fitment score, team allocation, and gaps | Yes |
| GET | `/developers/` | List company-scoped indexed developers | Yes |
| DELETE | `/developers/{doc_id}` | Delete a developer record from the current workspace | Yes |

### Request Notes

- `/upload-cv/` expects a `developer_name` query parameter plus a PDF file upload.
- `/analyze-rfp/` expects a PDF file upload and returns structured JSON with `project_name`, `technical_stack`, `core_features`, and `estimated_team_size`.
- `/match-resources/` expects the JSON output from `/analyze-rfp/` and returns `overall_match_score`, `allocated_team`, `critical_skills_gap`, and `hiring_recommendation`.

## Future Enhancements

- Exportable PDF audit reports for client-facing delivery packs.
- Automated candidate outreach workflows based on gap analysis.
- Saved prompt templates and reusable RFP parsing profiles.
- Role-based workspace administration and team-level permissions.
- Enhanced analytics for historical match accuracy and delivery outcomes.

## License

No license has been declared in this repository yet. Add one before distributing the project publicly.
