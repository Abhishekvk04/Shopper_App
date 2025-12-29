from google import genai
from google.genai import types
import os
from app.core.config import settings

# Load API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

def get_embedding(text: str) -> list[float]:
    """
    Get embedding for text using Gemini.
    """
    if not client:
        # Mock embedding for testing without key
        import random
        return [random.random() for _ in range(768)]
        
    try:
        response = client.models.embed_content(
            model="text-embedding-004",
            contents=text,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY"
            )
        )
        # The new SDK returns an object with embeddings list
        return response.embeddings[0].values
    except Exception as e:
        print(f"Embedding Error: {e}")
        # Fallback Mock
        import random
        return [random.random() for _ in range(768)]

def generate_answer(context: str, query: str) -> tuple[str, float]:
    """
    Generate answer using Gemini based on context.
    Returns (answer, confidence_score).
    """
    if not client:
        return "This is a mock AI response because no API key is set.", 0.9

    try:
        prompt = f"""
You are a helpful assistant for a local business.

Guidelines:
1. Answer the user's question based ONLY on the Context provided below.
2. **CRITICAL**: Do NOT use outside knowledge or guess. If the answer is NOT in the context, say "I don't know".
3. **VERIFICATION**: The Context contains verified answers from the owner. Trust the context.
4. If the user says "Hello", "Thank you", "Bye", etc., REPLY POLITELY and set Confidence to 1.0. 

Context:
{context}

User Question: {query}

Format your response as:
Confidence: [0.0 to 1.0]
Answer: [Your answer]
        """
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        text = response.text.strip()
        
        # Parse response
        lines = text.split('\n')
        confidence = 0.0
        answer = ""
        
        for line in lines:
            if line.startswith("Confidence:"):
                try:
                    confidence = float(line.split(":")[1].strip())
                except:
                    confidence = 0.5
            elif line.startswith("Answer:"):
                answer = line.split(":", 1)[1].strip()
            else:
                answer += " " + line
                
        return answer.strip(), confidence
    except Exception as e:
        print(f"Generation Error: {e}")
        return "I'm having trouble connecting to my brain right now.", 0.0
