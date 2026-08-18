# SpecMatch AI

AI-powered developer-to-RFP matching platform for enterprise delivery teams.

SpecMatch AI helps teams ingest developer CVs, analyze client RFPs, and recommend resource fitment using Gemini AI, ChromaDB vector search, and Neo4j graph-based skill matching.

## Overview

This project combines:

- React + Vite frontend for the user experience
- FastAPI backend for file processing and AI orchestration
- Firebase authentication and company-scoped access control
- ChromaDB for semantic developer search
- Neo4j for explicit skill relationship matching
- Gemini for CV skill extraction, RFP analysis, and fitment reasoning

## Key Features

- Multi-tenant workspace architecture with Firebase Auth and Firestore company scoping.
- Resume ingestion and persistent embedding storage in ChromaDB.
- Intelligent RFP analysis and parameter extraction powered by Gemini.
- Automated resource fitment matrix with critical gap analysis.
- Audit-friendly history of saved fitment sessions.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, Framer Motion, React Router
- Backend: FastAPI, Uvicorn, Python-multipart
- AI: Google Gemini Generative AI
- Vector Store: ChromaDB
- Graph Database: Neo4j
- Authentication: Firebase Auth + Firebase Admin SDK
- PDF processing: Python PDF extraction utilities

## Current Architecture

```text
Frontend (React + Vite)
    |
    | Firebase ID token
    v
FastAPI backend
    |
    +--> PDF processing
    +--> Gemini analysis
    +--> ChromaDB vector similarity search
    +--> Neo4j graph skill matching
    +--> Firebase company-scoped auth
    |
    +--> Developer records
    +--> Fitment recommendations
```

## Repository Structure

```text
specmatch-ai/
├── backend/
│   ├── app.py
│   ├── auth.py
│   ├── config.py
│   ├── firebase-service-account.json
│   ├── graph_db.py
│   ├── pdf_processor.py
│   ├── vector_store.py
│   ├── chroma_db/
│   └── tests/
├── frontend/
│   └── my-react-app/
│       ├── src/
│       ├── package.json
│       ├── vite.config.js
│       └── index.html
├── docker-compose.yml
├── requirements.txt
├── README.md
└── .gitignore
```

## Prerequisites

Before running the project, make sure you have:

- Python 3.10+
- Node.js 18+
- npm
- Docker Desktop or Docker Engine
- Git
- A Google Gemini API key
- Firebase project credentials (web config + service account)

## Environment Setup

### 1) Backend environment

Create a file named `backend/.env` with the values required by the application:

```env
GEMINI_API_KEY=your_gemini_api_key
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
```

The backend also expects a Firebase admin service account file at:

```text
backend/firebase-service-account.json
```

This file is used by `backend/auth.py` for Firebase Admin SDK initialization.

### 2) Frontend Firebase config

Update the frontend Firebase config in:

```text
frontend/my-react-app/src/firebase.js
```

with your Firebase web app settings from the Firebase console.

## Run the Project

### Option A: Local development

#### Backend

```bash
cd backend
python -m venv .venv
```

On Windows:

```bash
.venv\Scripts\activate
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

Then install the Python dependencies:

```bash
pip install -r ../requirements.txt
```

Start the API:

```bash
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

#### Frontend

```bash
cd frontend/my-react-app
npm install
npm run dev
```

The frontend dev server runs at:

```text
http://localhost:5173
```

### Option B: Docker Compose

This repository includes a `docker-compose.yml` for the application services.

```bash
docker compose up -d
```

The compose file currently includes:

- backend
- frontend
- Neo4j

Use the following values inside the compose setup if needed:

```yaml
NEO4J_AUTH=neo4j/password
```

For container-to-container communication, `NEO4J_URI` should typically be:

```text
bolt://neo4j:7687
```

## Authentication and Multi-tenancy

The backend uses Firebase user IDs as the workspace/company identifier.

- Each authenticated user is mapped to a Firebase UID
- The UID is used as the `company_id`
- ChromaDB developer vectors are filtered by `company_id`
- Neo4j developer nodes are also scoped to the same company ID
- Protected API routes depend on the Firebase Bearer token header

Example:

```http
Authorization: Bearer <firebase-id-token>
```

The app includes a testing fallback in `backend/auth.py` for local or Swagger-based testing, but real deployments should validate the actual Firebase token.

## API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend health check |

### Protected

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload-cv/` | Upload a CV PDF and index the developer |
| POST | `/analyze-rfp/` | Analyze an RFP PDF and extract project data |
| POST | `/match-resources/` | Match developers to an RFP using vector + graph retrieval |
| GET | `/developers/` | List developers for the current company/workspace |
| DELETE | `/developers/{doc_id}` | Remove a developer from the workspace |

### Request Notes

- `POST /upload-cv/` expects a `developer_name` field and a PDF file
- `POST /analyze-rfp/` expects a PDF file
- `POST /match-resources/` expects a JSON object containing project analysis data

## Important Notes

- The backend currently uses Gemini model configuration set in `backend/config.py`
- The default model is `gemini-3.1-flash-lite`
- If you use a different Gemini model, update `backend/config.py`
- Neo4j must be running before the backend starts if graph matching is enabled
- `backend/chroma_db/` is used as the persistent local vector store directory

## Future Improvements

- Add exportable reports and audit summaries
- Add role-based workspace controls
- Improve frontend filtering and analytics
- Expand graph relationships between skills and employee profiles
- Support more job description and CV formats


