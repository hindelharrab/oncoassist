from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from deep_translator import GoogleTranslator
import os
import time
import shutil

PDF_FOLDER = "./pdfs"
CHROMA_DIR = "./chroma_db"


def main():
    # ── 1. Charger tous les PDFs ────────────────────────────
    if not os.path.exists(PDF_FOLDER):
        print(f"❌ Dossier {PDF_FOLDER} introuvable. Créez-le et ajoutez vos PDFs.")
        return

    all_docs = []
    for filename in os.listdir(PDF_FOLDER):
        if filename.endswith(".pdf"):
            print(f"Chargement : {filename}")
            loader = PyPDFLoader(os.path.join(PDF_FOLDER, filename))
            all_docs.extend(loader.load())

    if not all_docs:
        print("❌ Aucun PDF trouvé dans ./pdfs")
        return

    print(f"Total pages chargées : {len(all_docs)}")

    # ── 2. Découper en chunks ───────────────────────────────
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )
    chunks = splitter.split_documents(all_docs)
    print(f"Total chunks créés : {len(chunks)}")

    # ── 3. Traduction en français ───────────────────────────
    translator = GoogleTranslator(source="auto", target="fr")
    print("Traduction des chunks en français...")
    translated_chunks = []
    for i, chunk in enumerate(chunks):
        try:
            translated_text = translator.translate(chunk.page_content)
            if translated_text:
                chunk.page_content = translated_text
            translated_chunks.append(chunk)
            if i % 10 == 0:
                print(f"  {i}/{len(chunks)} chunks traduits...")
            time.sleep(0.1)  # éviter de spammer Google Translate
        except Exception as e:
            print(f"  Erreur chunk {i} : {e} — chunk gardé en original")
            translated_chunks.append(chunk)

    print("✅ Traduction terminée !")

    # ── 4. Embeddings ───────────────────────────────────────
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    # ── 5. Supprimer l'ancien ChromaDB ──────────────────────
    if os.path.exists(CHROMA_DIR):
        shutil.rmtree(CHROMA_DIR)
        print("Ancien ChromaDB supprimé")

    # ── 6. Créer et persister le vectorstore ────────────────
    vectorstore = Chroma.from_documents(
        documents=translated_chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR,
    )
    # Persistance explicite (sécurité selon version de LangChain)
    try:
        vectorstore.persist()
    except Exception:
        pass  # auto-persisté dans les versions récentes

    print(f" Ingestion terminée ! ChromaDB créé dans {CHROMA_DIR}")


if __name__ == "__main__":
    main()