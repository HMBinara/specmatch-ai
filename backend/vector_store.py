import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings
import google.generativeai as genai
from config import get_gemini_api_key

genai.configure(api_key=get_gemini_api_key())


class GeminiEmbeddingFunction(EmbeddingFunction):
    """Uses Gemini's embedding API instead of downloading a local ONNX model."""
    def __call__(self, input: Documents) -> Embeddings:
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=input,
            task_type="retrieval_document"
        )
        return result["embedding"]


_client = chromadb.PersistentClient(path="./chroma_db")
_collection = _client.get_or_create_collection(
    name="developer_cvs",
    embedding_function=GeminiEmbeddingFunction(),
    metadata={"hnsw:space": "cosine"}
)


def add_cv_to_vector_store(company_id: str, developer_name: str, filename: str, text: str):
    """Add a developer's CV text into the persistent ChromaDB collection, scoped to a company."""
    # company_id prefix guarantees no cross-company ID collisions
    doc_id = f"{company_id}_{developer_name}_{filename}"

    _collection.upsert(
        ids=[doc_id],
        documents=[text],
        metadatas=[{
            "company_id": company_id,
            "developer_name": developer_name,
            "filename": filename
        }]
    )
    print(f"[ChromaDB] Added/updated CV for {developer_name} (company: {company_id})")


def query_matching_developers(company_id: str, tech_stack: list, n_results: int = 5) -> str:
    """Query ChromaDB for developers matching the tech stack, scoped to a company only."""
    query_text = " ".join(tech_stack)

    # Count only this company's documents before querying
    company_count = _collection.count(where={"company_id": company_id}) if hasattr(_collection, "count") else None

    results = _collection.query(
        query_texts=[query_text],
        n_results=n_results,
        where={"company_id": company_id}   # <-- ISOLATION filter, critical line
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    if not documents:
        return ""

    context_list = []
    for doc_text, meta in zip(documents, metadatas):
        context_list.append(
            f"Developer: {meta['developer_name']}\nSkills Context: {doc_text}"
        )

    return "\n\n---\n\n".join(context_list)

def list_developers(company_id: str) -> list[dict]:
    """Return all developers currently stored for this company."""
    results = _collection.get(
        where={"company_id": company_id},
        include=["metadatas"]
    )

    ids = results.get("ids", [])
    metadatas = results.get("metadatas", [])

    developers = []
    for doc_id, meta in zip(ids, metadatas):
        developers.append({
            "id": doc_id,
            "developer_name": meta.get("developer_name", "Unknown"),
            "filename": meta.get("filename", "unknown.pdf"),
        })
    return developers


def delete_developer(company_id: str, doc_id: str) -> bool:
    """Delete a specific developer's CV, scoped to the company (safety check)."""
    existing = _collection.get(ids=[doc_id], include=["metadatas"])
    metadatas = existing.get("metadatas", [])

    if not metadatas or metadatas[0].get("company_id") != company_id:
        return False  # Doesn't exist or belongs to another company

    _collection.delete(ids=[doc_id])
    return True