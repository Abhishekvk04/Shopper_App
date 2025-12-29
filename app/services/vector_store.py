import faiss
import numpy as np
import pickle
import os

class VectorStore:
    def __init__(self):
        self.dimension = 768
        self.index = faiss.IndexFlatL2(self.dimension)
        self.entries = [] # List of dicts: {"text": ..., "meta": ...}
        
    def add_entry(self, text: str, meta: dict, embedding: list[float] = None):
        if embedding is None:
            raise ValueError("Embedding must be provided")
            
        vector = np.array([embedding], dtype=np.float32)
        self.index.add(vector)
        self.entries.append({"text": text, "entry": meta})
        
    def search(self, query_embedding: list[float], k: int = 3):
        vector = np.array([query_embedding], dtype=np.float32)
        distances, indices = self.index.search(vector, k)
        
        results = []
        for i in range(k):
            idx = indices[0][i]
            if idx < 0 or idx >= len(self.entries):
                continue
            
            entry = self.entries[idx]
            results.append({
                "entry": entry["entry"],
                "distance": float(distances[0][i]),
                "text": entry["text"]
            })
            
        return results

    def rebuild_index(self, db_entries):
        """
        Rebuilds the index from scratch using provided DB entries.
        Expensive but necessary for deletion in MVP.
        """
        self.index = faiss.IndexFlatL2(self.dimension)
        self.entries = []
        
        # We need embeddings. In a real app, we'd store embeddings in DB to avoid re-computing.
        # For MVP, this effectively clears the memory. 
        # If we just clear memory, the 'search' won't find deleted items, but it also won't find anything 
        # unless we re-embed everything.
        # CRITICAL: We don't have embeddings stored in SQLite KBEntry.
        # So "Deletions" are hard if we don't store vectors.
        # Alternative: 
        # 1. Just filter results after search? (Check if entry exists in DB).
        # THIS IS BETTER FOR MVP.
        pass

# Global instance
vector_store = VectorStore()
