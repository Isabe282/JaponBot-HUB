from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, Any
import httpx
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JAPON_API_URL = os.environ['JAPON_BOT_API_URL'].rstrip('/')
JAPON_API_KEY = os.environ['JAPON_BOT_API_KEY']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']

# In-memory token store (simple session)
SESSIONS = set()

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- Auth ----------
class LoginRequest(BaseModel):
    password: str


def verify_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    token = authorization.split(" ", 1)[1]
    if token not in SESSIONS:
        raise HTTPException(status_code=401, detail="Token inválido")
    return token


@api_router.post("/auth/login")
async def login(body: LoginRequest):
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    token = secrets.token_urlsafe(32)
    SESSIONS.add(token)
    return {"token": token}


@api_router.post("/auth/logout")
async def logout(token: str = Depends(verify_token)):
    SESSIONS.discard(token)
    return {"ok": True}


# ---------- Japon Bot Proxy ----------
async def japon_request(method: str, path: str, json_body: Optional[dict] = None) -> Any:
    url = f"{JAPON_API_URL}{path}"
    headers = {"x-api-key": JAPON_API_KEY, "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=20.0) as http_client:
            resp = await http_client.request(method, url, headers=headers, json=json_body)
    except httpx.RequestError as exc:
        logger.error(f"Upstream request error: {exc}")
        raise HTTPException(status_code=502, detail=f"Error conectando con Japon Bot API: {exc}")

    if resp.status_code >= 400:
        try:
            detail = resp.json()
        except Exception:
            detail = resp.text or "Error en API externa"
        raise HTTPException(status_code=resp.status_code, detail=detail)

    try:
        return resp.json()
    except Exception:
        return {"raw": resp.text}


@api_router.get("/servidores")
async def get_servidores(_: str = Depends(verify_token)):
    return await japon_request("GET", "/servidores")


@api_router.get("/estadisticas/{servidor_id}")
async def get_estadisticas(servidor_id: str, _: str = Depends(verify_token)):
    return await japon_request("GET", f"/estadisticas/{servidor_id}")


@api_router.get("/tickets/{servidor_id}")
async def get_tickets(servidor_id: str, _: str = Depends(verify_token)):
    return await japon_request("GET", f"/tickets/{servidor_id}")


@api_router.get("/transcript/{ticket_id}")
async def get_transcript(ticket_id: str, _: str = Depends(verify_token)):
    return await japon_request("GET", f"/transcript/{ticket_id}")


class CerrarTicketBody(BaseModel):
    servidorId: str
    canalId: str


@api_router.post("/cerrar-ticket")
async def cerrar_ticket(body: CerrarTicketBody, _: str = Depends(verify_token)):
    return await japon_request("POST", "/cerrar-ticket", json_body=body.model_dump())


class ConfigurarServidorBody(BaseModel):
    servidorId: Optional[str] = None
    categoriaTickets: str
    rolStaff: str
    canalLogs: str
    nombreServidor: str


@api_router.post("/configurar-servidor")
async def configurar_servidor(body: ConfigurarServidorBody, _: str = Depends(verify_token)):
    return await japon_request("POST", "/configurar-servidor", json_body=body.model_dump())


@api_router.get("/")
async def root():
    return {"message": "Japon Bot Dashboard API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
