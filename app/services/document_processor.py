import pypdf
import io
from app.services.ai import get_embedding
from app.services.vector_store import vector_store
from app.db.models import KBEntry, Business
from sqlalchemy.orm import Session

def process_file_upload(file_content: bytes, filename: str, db: Session, current_user: Business):
    """
    Processes an uploaded file (PDF or TXT).
    Extracts text -> Chunks -> Embeds -> Stores in DB & VectorStore.
    """
    text = ""
    if filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_content)
    else:
        # Assume text
        text = file_content.decode("utf-8", errors="ignore")
        
    chunks = chunk_text(text)
    
    # Store chunks
    business = current_user
    if not business:
        return 0

    count = 0
    for chunk in chunks:
        if not chunk.strip():
            continue
            
        # We store the chunk as "Answer" (Knowledge)
        # The "Question" is vague for raw text. 
        # Strategy: We index the text itself. When user asks question, we find similar text chunk.
        # But VectorStore expects (Question, Answer). 
        # Actually, for RAG (Retrieval Augmented Generation), we just need to retrieve the chunk.
        # So we can set Question = "Document Chunk" or just first few words.
        # Better: Index the CHUNK CONTENT. 
        
        # For our current vector_store.add_entry(text, meta, emb):
        # We index 'text' (the key used for search).
        # We search with 'query'.
        # So we should index the CHUNK TEXT.
        
        emb = get_embedding(chunk)
        
        # Add to DB (so it persists)
        new_entry = KBEntry(
            business_id=business.id,
            question=f"SOURCE: {filename}", # Meta info
            answer=chunk, # The actual content
            source="document",
            confidence=1.0
        )
        db.add(new_entry)
        count += 1
        
        # Add to Vector Store
        vector_store.add_entry(chunk, {"answer": chunk}, emb)
        
    db.commit()
    return count

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_file = io.BytesIO(file_content)
        reader = pypdf.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"PDF Parse Error: {e}")
        return ""

def chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    """
    Simple chunking by characters. 
    In prod, use recursive splitter or token-based.
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        # Try to find a period or newline to break strictly
        chunk = text[start:end]
        chunks.append(chunk)
        start = end
    return chunks
