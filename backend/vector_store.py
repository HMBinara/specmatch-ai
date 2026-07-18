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


def add_cv_to_vector_store(developer_name: str, filename: str, text: str):
    """Add a developer's CV text into the persistent ChromaDB collection."""
    doc_id = f"{developer_name}_{filename}"

    _collection.upsert(
        ids=[doc_id],
        documents=[text],
        metadatas=[{"developer_name": developer_name, "filename": filename}]
    )
    print(f"[ChromaDB] Successfully added/updated CV for {developer_name}")


def query_matching_developers(tech_stack: list, n_results: int = 5) -> str:
    """Query ChromaDB for developers whose CVs best match the tech stack."""
    query_text = " ".join(tech_stack)

    count = _collection.count()
    if count == 0:
        return ""

    results = _collection.query(
        query_texts=[query_text],
        n_results=min(n_results, count)
    )

    context_list = []
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    for doc_text, meta in zip(documents, metadatas):
        context_list.append(
            f"Developer: {meta['developer_name']}\nSkills Context: {doc_text}"
        )

    return "\n\n---\n\n".join(context_list)