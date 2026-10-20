import os
import glob
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# Chemin absolu basé sur l'emplacement du fichier, indépendant du CWD de lancement
_FILE_DIR = os.path.dirname(os.path.abspath(__file__))
_APP_DIR  = os.path.dirname(_FILE_DIR)
_ROOT_DIR = os.path.dirname(_APP_DIR)

CHROMA_PATH    = os.path.join(_ROOT_DIR, "chroma_data")
COLLECTION_NAME = "zuwwar_documentation"
DOCS_PATH      = os.path.join(_ROOT_DIR, "knowledge")

# ── Modèle d'embedding léger, tourne en local sur CPU (~80MB) ────────────────
embedding_function = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"}
)

# ── Vector store LangChain (Chroma) persistant sur disque ────────────────────
vector_store = Chroma(
    collection_name=COLLECTION_NAME,
    embedding_function=embedding_function,
    persist_directory=CHROMA_PATH,
)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=80,
    separators=["\n\n", "\n", ". ", " "]
)


def _compter_documents() -> int:
    """Compte les documents indexés sans passer par l'API privée _collection."""
    try:
        return len(vector_store.get(include=[])["ids"])
    except Exception:
        return 0


def indexer_documentation_si_necessaire(force: bool = False):
    """
    Indexe la documentation (PDF + Markdown) au démarrage du service, si le
    vector store est vide. Ne touche JAMAIS aux données CRM
    (deals/contacts/campagnes) — uniquement la documentation statique.

    force=True (utilisé par POST /rag/index) supprime les chunks existants
    et réindexe tout depuis les fichiers sources, pour prendre en compte les
    modifications de knowledge/ sans redémarrer le service.
    """
    count = _compter_documents()
    if count > 0:
        if not force:
            print(f"ℹ️ RAG documentation déjà indexée — {count} chunks en base")
            return
        ids_existants = vector_store.get(include=[])["ids"]
        if ids_existants:
            vector_store.delete(ids=ids_existants)
        print(f"🔄 Réindexation forcée — {len(ids_existants)} anciens chunks supprimés")

    documents: list[Document] = []

    # 1. Fichiers PDF dans knowledge/
    for pdf_path in glob.glob(os.path.join(DOCS_PATH, "*.pdf")):
        try:
            loader = PyPDFLoader(pdf_path)
            pages = loader.load()
            chunks = text_splitter.split_documents(pages)
            for chunk in chunks:
                chunk.metadata["source"] = os.path.basename(pdf_path)
                chunk.metadata["type"] = "pdf"
            documents.extend(chunks)
            print(f"✅ PDF indexé : {os.path.basename(pdf_path)} — {len(chunks)} chunks")
        except Exception as e:
            print(f"❌ Erreur indexation PDF {pdf_path} : {e}")

    # 2. Fichiers Markdown dans knowledge/
    for md_path in glob.glob(os.path.join(DOCS_PATH, "*.md")):
        try:
            with open(md_path, "r", encoding="utf-8") as f:
                contenu = f.read()

            # Séparer sur les titres H2, en conservant le contenu avant le premier ##
            parties = contenu.split("## ")
            sections_texte = []

            # La première partie peut contenir un titre H1 + intro — on la garde
            intro = parties[0].strip()
            if intro:
                sections_texte.append(("intro", intro))

            for partie in parties[1:]:
                lignes = partie.split("\n", 1)
                titre = lignes[0].strip()
                texte = lignes[1].strip() if len(lignes) > 1 else ""
                if texte:
                    sections_texte.append((titre, texte))

            for titre, texte in sections_texte:
                documents.append(Document(
                    page_content=texte,
                    metadata={
                        "source": os.path.basename(md_path),
                        "type": "markdown",
                        "titre": titre
                    }
                ))

            print(f"✅ Markdown indexé : {os.path.basename(md_path)} — {len(sections_texte)} sections")
        except Exception as e:
            print(f"❌ Erreur indexation Markdown {md_path} : {e}")

    if not documents:
        print("⚠️ Aucun document de documentation trouvé dans knowledge/")
        return

    ids = [f"doc-{i}" for i in range(len(documents))]
    vector_store.add_documents(documents=documents, ids=ids)
    print(f"✅ RAG documentation indexée — {len(documents)} chunks au total")


def rechercher_documentation(question: str, top_k: int = 3) -> list[dict]:
    """Recherche sémantique UNIQUEMENT dans la documentation statique."""
    count = _compter_documents()
    if count == 0:
        return []

    resultats = vector_store.similarity_search_with_relevance_scores(
        query=question,
        k=min(top_k, count)
    )

    return [
        {
            "contenu": doc.page_content,
            "source": doc.metadata.get("source", "documentation"),
            "score_similarite": round(score, 3)
        }
        for doc, score in resultats
    ]
