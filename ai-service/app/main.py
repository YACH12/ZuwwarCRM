import asyncio
import json
import os
import sys
import threading
import time
from contextlib import asynccontextmanager

# La console Windows utilise cp1252 par défaut, incapable d'encoder les emojis utilisés dans
# les print() de ce service (✅, ⏳, ❌...) — on force UTF-8 avant tout print, pour tout le process.
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from dotenv import load_dotenv
load_dotenv()  # charge .env avant tout import qui lit os.getenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from kafka import KafkaConsumer, KafkaProducer as KProducer

from app.routers import lead_scoring, nlp, rag
from app.services.scoring_service import calculer_score
from app.services.vector_store_service import indexer_documentation_si_necessaire

KAFKA_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
_MAX_KAFKA_RETRIES = 5
_KAFKA_RETRY_DELAY = 5  # secondes


def demarrer_consumer():
    for tentative in range(1, _MAX_KAFKA_RETRIES + 1):
        try:
            consumer = KafkaConsumer(
                'lead-scoring',
                bootstrap_servers=KAFKA_SERVERS,
                group_id='ai-service-group',
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                auto_offset_reset='earliest',
                # Évite la négociation automatique de version, peu fiable avec ce broker
                # (confluentinc/cp-kafka 7.5) et qui échoue silencieusement (NoBrokersAvailable)
                # quand "localhost" résout en IPv6 en priorité sur cette machine.
                api_version=(2, 8, 0)
            )

            producer = KProducer(
                bootstrap_servers=KAFKA_SERVERS,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                api_version=(2, 8, 0)
            )

            print(f"✅ Kafka Consumer IA connecté ({KAFKA_SERVERS}) — Écoute le topic 'lead-scoring'...", flush=True)

            for message in consumer:
                data = message.value
                contact_id = data.get('contactId', 'Inconnu')
                print(f"📩 Message reçu pour le Contact ID : {contact_id}")

                try:
                    resultat = calculer_score(data)

                    payload = {
                        "contactId":     contact_id,
                        "scoreIA":       resultat["scoreIA"],
                        "etapeProspect": resultat["etapeProspect"],
                        "converti":      resultat["converti"]
                    }

                    producer.send(
                        'lead-scoring-result',
                        key=str(contact_id).encode(),
                        value=payload
                    )
                    producer.flush()
                    print(f"✅ Score publié — Contact {contact_id} | {resultat['scoreIA']}% | {resultat['etapeProspect']}")

                except Exception as e:
                    print(f"❌ Erreur score contact {contact_id} : {e}")

            # Si on sort de la boucle for normalement, on arrête
            break

        except Exception as e:
            print(f"❌ Kafka Consumer — tentative {tentative}/{_MAX_KAFKA_RETRIES} échouée : {e}", flush=True)
            if tentative < _MAX_KAFKA_RETRIES:
                print(f"   Nouvelle tentative dans {_KAFKA_RETRY_DELAY}s...", flush=True)
                time.sleep(_KAFKA_RETRY_DELAY)
            else:
                print("❌ Kafka Consumer abandonné après toutes les tentatives.", flush=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Démarrage du service IA...")
    thread = threading.Thread(target=demarrer_consumer, daemon=True)
    thread.start()

    # Indexation dans un thread pour ne pas bloquer l'event loop FastAPI
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, indexer_documentation_si_necessaire)
    print("✅ Documentation RAG vérifiée/indexée au démarrage")

    yield
    print("Fermeture du service IA.")


app = FastAPI(
    title="Zuwwar AI Service",
    description="Microservice Python gérant le ML, NLP et RAG pour le CRM",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lead_scoring.router)
app.include_router(nlp.router)
app.include_router(rag.router)


@app.get("/")
def root():
    return {
        "status":  "online",
        "message": "Service IA Zuwwar opérationnel",
        "modules": ["Lead Scoring (ML)", "NLP (HuggingFace)", "RAG (LangChain + Groq)", "Kafka Consumer"]
    }
