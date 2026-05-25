from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="OncoBot RAG Service")

# ── CORS : autoriser Flutter / React ────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Embeddings multilingue FR/EN ────────────────────────────
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

# ── Vectorstore ChromaDB persistant ─────────────────────────
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings,
)

# ── Client Groq ─────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY manquante. Créez un fichier .env avec GROQ_API_KEY=..."
    )
groq_client = Groq(api_key=GROQ_API_KEY)

# ── System prompt médical ────────────────────────────────────
SYSTEM_PROMPT = """Tu es OncoBot, un assistant de la clinique OncoAssist.
Tu réponds uniquement aux questions générales sur le cancer du sein.
Tu NE poses JAMAIS de diagnostic.
Tu NE commentes JAMAIS les résultats médicaux d'une patiente.
Si la question dépasse ton rôle, dis : "Veuillez consulter votre médecin."
Réponds TOUJOURS de façon simple, bienveillante et COURTE (3 lignes max).
Utilise un langage accessible, jamais de jargon médical complexe.
Tu t'adresses à des patientes, pas à des médecins."""

# ── Mots-clés de suivi conversationnel (pas besoin de RAG) ──
SUIVI_KEYWORDS = [
    "tu as dit", "vous avez dit", "résume", "simplifie", "reformule",
    "répète", "explique mieux", "plus simple", "ce que tu", "ce que vous",
    "la même chose", "donner", "information que", "simplifie moi",
    "résumé", "redis", "rappelle", "c'était quoi", "c etait quoi",
    "simpleur", "simple pour moi", "que tu as", "que vous avez",
]


def _is_suivi(message: str) -> bool:
    """Détecte si la question est une reformulation/suivi sans besoin de RAG."""
    msg = message.lower()
    return any(k in msg for k in SUIVI_KEYWORDS)


# ── Modèles de requête ───────────────────────────────────────
class Message(BaseModel):
    role: str       # "user" ou "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []   # historique optionnel multi-tour


# ── Endpoint chat ────────────────────────────────────────────
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # ── Décider si on fait du RAG ou pas ──────────────
        if _is_suivi(request.message):
            # Question de suivi conversationnel → pas de RAG
            # Le bot utilise uniquement l'historique pour répondre
            augmented_message = request.message

        else:
            # Question médicale directe → RAG complet
            # 1. RETRIEVAL : documents pertinents par similarité
            relevant_docs = vectorstore.similarity_search(
                request.message, k=3
            )
            context = "\n".join(
                [doc.page_content for doc in relevant_docs]
            )

            # 2. AUGMENTATION : injecter le contexte dans la question
            augmented_message = f"""Contexte médical (sources officielles) :
{context}

Question de la patiente : {request.message}"""

        # 3. GENERATION : construire les messages avec historique
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in request.history:
            messages.append({"role": m.role, "content": m.content})
        messages.append({"role": "user", "content": augmented_message})

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
        )

        return {
            "response": response.choices[0].message.content,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erreur OncoBot : {str(e)}"
        )


# ── Endpoint health ──────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok"}


# ── Lancement direct ─────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)