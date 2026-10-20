FROM python:3.12-slim

WORKDIR /app

# Dépendances système nécessaires à certains packages ML (build de wheels natives)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Dossiers attendus au runtime (voir scoring_service.py / vector_store_service.py) :
#   /app/models     -> super_modele_crm.pkl (modèle de lead scoring)
#   /app/knowledge  -> documents source pour l'indexation RAG
#   /app/chroma_data -> persistance du vector store Chroma
# Montés en volumes depuis docker-compose plutôt que copiés dans l'image.
RUN mkdir -p /app/models /app/knowledge /app/chroma_data

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]