import chromadb
import google.generativeai as genai

# Initialize Persistent ChromaDB Client
chroma_client = chromadb.PersistentClient(path="./chroma_db")
cv_collection = chroma_client.get_or_create_collection(name="employee_cvs")

def add_cv_to_vector_store(developer_name: str, filename: str, text_content: str):
    """
    Generates embedding using Gemini and stores document into ChromaDB.
    """
    embedding_response = genai.embed_content(
        model="models/text-embedding-004",
        content=text_content,
        task_type="retrieval_document"
    )
    vector = embedding_response['embedding']

    cv_collection.add(
        embeddings=[vector],
        documents=[text_content],
        metadatas=[{"developer_name": developer_name, "filename": filename}],
        ids=[f"cv_{developer_name.lower().replace(' ', '_')}_{filename}"]
    )

def query_matching_developers(tech_stack_list: list, n_results: int = 5) -> str:
    """
    Queries ChromaDB based on technical stack and returns formatted context string.
    """
    query_text = ", ".join(tech_stack_list)
    
    embedding_response = genai.embed_content(
        model="models/text-embedding-004",
        content=query_text,
        task_type="retrieval_query"
    )
    query_vector = embedding_response['embedding']

    search_results = cv_collection.query(
        query_embeddings=[query_vector],
        n_results=n_results
    )

    retrieved_developers = []
    if search_results and search_results['documents'] and len(search_results['documents'][0]) > 0:
        for i in range(len(search_results['documents'][0])):
            dev_name = search_results['metadatas'][0][i]['developer_name']
            dev_skills = search_results['documents'][0][i]
            retrieved_developers.append(f"Developer: {dev_name}\nSkills Summary: {dev_skills}\n---")

    return "\n".join(retrieved_developers)