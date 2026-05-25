# OncoBot - Microservice RAG

Assistant conversationnel de la clinique OncoAssist, base sur RAG
(Retrieval-Augmented Generation) pour repondre aux questions generales
sur le cancer du sein.

## Architecture RAG

1. **Ingestion** (`ingest.py`) : charge les PDFs, decoupe en chunks,
   traduit en francais, genere les embeddings, stocke dans ChromaDB.
2. **Retrieval** (`main.py`) : recherche les 3 chunks les plus pertinents
   par similarite semantique.
3. **Augmentation** : injecte le contexte recupere dans le prompt.
4. **Generation** : Llama-3.3-70b via Groq genere la reponse.

## Stack technique

- FastAPI + Uvicorn (API REST)
- LangChain (orchestration RAG)
- ChromaDB (vectorstore local persistant)
- HuggingFace embeddings (multilingue FR/EN)
- Groq + Llama-3.3-70b (LLM de generation)

## Installation

```bash
pip install -r requirements.txt
cp .env.example .env
# editez .env et ajoutez votre cle Groq
```

## Utilisation

```bash
# 1. Placez vos PDFs dans le dossier ./pdfs
# 2. Lancez l'ingestion (a faire une seule fois ou apres ajout de PDFs)
python ingest.py

# 3. Lancez le serveur (port 8002 pour ne pas entrer en conflit
#    avec les autres microservices 8000 / 8001)
venv\Scripts\activate   
uvicorn main:app --reload --port 8002
```

## Endpoints

- `POST /chat` : envoyer une question (avec historique optionnel)
- `GET /health` : verifier que le service tourne

### Exemple de requete

```json
POST /chat
{
  "message": "Qu'est-ce qu'une mammographie ?",
  "history": [
    {"role": "user", "content": "Bonjour"},
    {"role": "assistant", "content": "Bonjour, comment puis-je vous aider ?"}
  ]
}
```

### Reponse

```json
{
  "response": "Une mammographie est un examen radiographique...",
  "sources": [
    {"source": "guide_cancer.pdf", "page": 12, "extrait": "..."}
  ]
}
```

## Securite

- La cle API Groq est dans `.env` (jamais commitee, voir `.gitignore`).
- Le system prompt interdit le diagnostic et l'interpretation de resultats.
- Les sources sont affichees pour l'explicabilite (RAG explicable).