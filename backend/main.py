import os
import io
import math
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
import openai
import qrcode

load_dotenv()

OPENAI_API_KEY = os.getenv(
    "OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv(
    "VITE_SUPABASE_PUBLISHABLE_KEY")

if not (OPENAI_API_KEY and SUPABASE_URL and SUPABASE_ANON_KEY):
    # We keep app booting; raise on usage if missing
    pass

openai.api_key = OPENAI_API_KEY
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY) if (
    SUPABASE_URL and SUPABASE_ANON_KEY) else None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmbeddingIn(BaseModel):
    user_id: str
    hobbies: str
    about: Optional[str] = None


class ComputeIn(BaseModel):
    user_id: str
    event_id: str


class RecomputeIn(BaseModel):
    event_id: str


def cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


@app.post("/api/embedding")
def embedding(payload: EmbeddingIn):
    if not (openai.api_key and supabase):
        raise HTTPException(
            status_code=500, detail="Server not configured for OpenAI/Supabase")

    text = f"Hobbies: {payload.hobbies}\nAbout: {payload.about or ''}".strip()

    try:
        resp = openai.Embedding.create(
            model="text-embedding-3-small", input=text)
        vector = resp["data"][0]["embedding"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI error: {e}")

    upd = supabase.table("profiles").update(
        {"embedding": vector}).eq("id", payload.user_id).execute()
    if getattr(upd, "error", None):
        raise HTTPException(status_code=500, detail=str(upd.error))
    return {"success": True, "embedding": vector}


@app.post("/api/matches/compute")
def matches_compute(payload: ComputeIn):
    if not supabase:
        raise HTTPException(
            status_code=500, detail="Server not configured for Supabase")

    # Fetch attendees
    attendees = supabase.table("event_attendees").select(
        "user_id").eq("event_id", payload.event_id).execute()
    user_ids = [row["user_id"]
                for row in getattr(attendees, "data", []) if row.get("user_id")]
    other_ids = [uid for uid in user_ids if uid != payload.user_id]

    # Load profiles
    me_res = supabase.table("profiles").select(
        "*").eq("id", payload.user_id).single().execute()
    me = getattr(me_res, "data", None)
    if not me:
        raise HTTPException(status_code=404, detail="User profile not found")

    others = []
    if other_ids:
        others_res = supabase.table("profiles").select(
            "*").in_("id", other_ids).execute()
        others = getattr(others_res, "data", [])

    def parse_vec(v):
        if v is None:
            return None
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                import json
                return json.loads(v)
            except Exception:
                return None
        return None

    me_vec = parse_vec(me.get("embedding"))
    if me_vec is None:
        raise HTTPException(
            status_code=400, detail="User embedding missing. Generate first.")

    scored = []
    for p in others:
        vec = parse_vec(p.get("embedding"))
        if not vec:
            continue
        sim = cosine_similarity(me_vec, vec)
        scored.append({"profile": p, "similarity": sim})
    scored.sort(key=lambda x: x["similarity"], reverse=True)
    top = scored[:5]

    matches_out = []
    for item in top:
        other = item["profile"]
        hobbies_self = me.get("hobbies") or []
        hobbies_other = other.get("hobbies") or []
        overlap = [h for h in hobbies_self if h in hobbies_other][:4]
        why = f"You share interests in {', '.join(overlap)}" if overlap else "Complementary roles and interests."
        deeper = "Discuss projects and collaboration opportunities."
        ins = supabase.table("matches").insert({
            "user_id": payload.user_id,
            "match_user_id": other.get("id"),
            "event_id": payload.event_id,
            "why_meet": why,
            "things_in_common": ", ".join(overlap),
            "dive_deeper": deeper,
        }).execute()
        if getattr(ins, "error", None):
            # we continue but don't collect if failed
            continue
        matches_out.append({
            "match_user_id": other.get("id"),
            "similarity": item["similarity"],
            "why_meet": why,
            "things_in_common": ", ".join(overlap),
            "dive_deeper": deeper,
        })

    return {"matches": matches_out}


@app.post("/api/matches/recompute")
def matches_recompute(payload: RecomputeIn):
    if not supabase:
        raise HTTPException(
            status_code=500, detail="Server not configured for Supabase")
    attendees = supabase.table("event_attendees").select(
        "user_id").eq("event_id", payload.event_id).execute()
    user_ids = [row["user_id"]
                for row in getattr(attendees, "data", []) if row.get("user_id")]
    total = 0
    for uid in user_ids:
        res = matches_compute(
            ComputeIn(user_id=uid, event_id=payload.event_id))
        total += len(res.get("matches", []))
    return {"recomputed": total}


@app.post("/api/event/{event_id}/qr")
def event_qr(event_id: str):
    if not supabase:
        raise HTTPException(
            status_code=500, detail="Server not configured for Supabase")
    ev = supabase.table("events").select("id, code").eq(
        "id", event_id).single().execute()
    event = getattr(ev, "data", None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    join_url = f"/join-event?code={event['code']}"
    img = qrcode.make(join_url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    path = f"events/{event_id}.png"
    upload = supabase.storage.from_("qr_codes").upload(path, buf.read(), {
        "contentType": "image/png",
        "upsert": True,
    })
    if getattr(upload, "error", None):
        raise HTTPException(status_code=500, detail=str(upload.error))
    pub = supabase.storage.from_("qr_codes").get_public_url(path)
    qr_url = pub.get("publicURL") or pub.get("publicUrl")
    supabase.table("events").update(
        {"qr_url": qr_url}).eq("id", event_id).execute()
    return {"qr_url": qr_url}


@app.post("/api/recap/{event_id}/{user_id}")
def recap(event_id: str, user_id: str):
    if not supabase:
        raise HTTPException(
            status_code=500, detail="Server not configured for Supabase")
    # very simple PNG with text
    from PIL import Image, ImageDraw, ImageFont

    img = Image.new('RGB', (800, 1200), color=(15, 23, 42))
    draw = ImageDraw.Draw(img)
    draw.text((40, 70), "Event Recap", fill=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)

    path = f"recaps/{event_id}/{user_id}.png"
    upload = supabase.storage.from_("recaps").upload(path, buf.read(), {
        "contentType": "image/png",
        "upsert": True,
    })
    if getattr(upload, "error", None):
        raise HTTPException(status_code=500, detail=str(upload.error))
    pub = supabase.storage.from_("recaps").get_public_url(path)
    recap_url = pub.get("publicURL") or pub.get("publicUrl")
    supabase.table("recaps").update({"recap_url": recap_url}).eq(
        "event_id", event_id).eq("user_id", user_id).execute()
    return {"recap_url": recap_url}
