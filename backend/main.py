import json
import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel
from supabase import create_client

load_dotenv()

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

gemini_client = genai.Client(api_key=GEMINI_API_KEY)
GEMINI_MODEL = "gemini-2.5-flash"

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

SUM_INSURED_PER_CLAIM = 80000  # flat placeholder sum-insured used to derive payout from damage %

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ClaimRequest(BaseModel):
    image_url: str
    farmer_id: str
    farmer_phone: str = "Unknown"
    lat: float = 0.0
    lng: float = 0.0
    temp: float = 0.0
    weather_condition: str = "Unknown"
    farmer_score: int = 300


GEMINI_PROMPT = """You are an agricultural pathologist analyzing a crop photo for an insurance claim.
Look at the image and respond with ONLY a JSON object (no markdown fences, no extra text) with exactly these keys:
{
  "is_plant": boolean,
  "crop_type": string,
  "is_healthy": boolean,
  "disease_name": string,
  "disease_category": string,
  "damage_percentage": integer (0-100),
  "severity": one of "None", "Mild", "Moderate", "Severe", "Critical",
  "symptoms_observed": array of strings,
  "confidence_score": integer (0-100),
  "recommended_action": string,
  "summary": string (2-3 sentences)
}
If the image is not of a plant/crop at all, set is_plant to false and is_healthy to false.
"""


def parse_gemini_response(response_text):
    try:
        return json.loads(response_text)
    except (json.JSONDecodeError, TypeError):
        return {
            "is_plant": True,
            "crop_type": "Unknown Crop",
            "is_healthy": True,
            "disease_name": "Healthy",
            "disease_category": "None",
            "damage_percentage": 0,
            "severity": "None",
            "symptoms_observed": [],
            "confidence_score": 0,
            "recommended_action": "Could not analyze image. Please retake the photo.",
            "summary": "AI analysis failed to return a valid response.",
        }


@app.post("/api/analyze-crop")
async def analyze_crop(request: ClaimRequest):
    print("--------------------------------------------------")
    print(f"📩 Received Claim from {request.farmer_id} (Score: {request.farmer_score}) | Temp: {request.temp}°C")

    try:
        print("⏳ Downloading image from Supabase...")
        async with httpx.AsyncClient() as client:
            image_response = await client.get(request.image_url, timeout=15.0)
            image_bytes = image_response.content

        print("🌿 Sending to Gemini Vision...")
        gemini_response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                GEMINI_PROMPT,
            ],
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        gemini_data = parse_gemini_response(gemini_response.text)

        print("🔄 Formatting data for the app...")
        is_actually_a_plant = bool(gemini_data.get("is_plant", True))
        is_healthy = bool(gemini_data.get("is_healthy", True))

        damage_raw = gemini_data.get("damage_percentage", 0)
        damage_percentage = max(0, min(100, int(damage_raw))) if isinstance(damage_raw, (int, float)) else 0

        confidence_raw = gemini_data.get("confidence_score", 90)
        confidence_score = int(confidence_raw) if isinstance(confidence_raw, (int, float)) else 90

        symptoms = gemini_data.get("symptoms_observed", [])
        symptoms_observed = symptoms if isinstance(symptoms, list) else []

        disease_name = gemini_data.get("disease_name", "Healthy") if (not is_healthy and is_actually_a_plant) else "Healthy"

        analysis_data = {
            "crop_type": gemini_data.get("crop_type", "Analyzed Crop") if is_actually_a_plant else "Unknown Object",
            "disease_detected": not is_healthy if is_actually_a_plant else False,
            "disease_name": disease_name,
            "disease_category": gemini_data.get("disease_category", "None") if (not is_healthy and is_actually_a_plant) else "None",
            "damage_percentage": damage_percentage if (not is_healthy and is_actually_a_plant) else 0,
            "severity": gemini_data.get("severity", "None") if (not is_healthy and is_actually_a_plant) else "None",
            "symptoms_observed": symptoms_observed if is_actually_a_plant else [],
            "confidence_score": confidence_score,
            "pmfby_eligible": not is_healthy if is_actually_a_plant else False,
            "estimated_yield_loss": damage_percentage if (not is_healthy and is_actually_a_plant) else 0,
            "recommended_action": gemini_data.get("recommended_action", "Continue normal farming."),
            "urgency": "Immediate" if (not is_healthy and is_actually_a_plant) else "Monitor",
            "estimated_payout": round(SUM_INSURED_PER_CLAIM * damage_percentage / 100) if (not is_healthy and is_actually_a_plant) else 0,
            "summary": gemini_data.get("summary", "Crop appears healthy."),
        }

        # 🚨 FRAUD & PENALTY ENGINE 🚨
        print("🕵️‍♂️ Running Fraud Checks...")
        fraud_flags = []
        penalty_points = 0

        if not is_actually_a_plant:
            print("🚨 FRAUD DETECTED: Image does not contain a plant!")
            fraud_flags.append("Spoof Warning: Non-agricultural object detected. Not a valid crop.")
            analysis_data["disease_name"] = "NOT A PLANT"
            analysis_data["recommended_action"] = "Fraud Alert: You must upload a real crop image."
            penalty_points += 150

        if confidence_score < 40 and not is_healthy and is_actually_a_plant:
            fraud_flags.append("Spoof Warning: Low-confidence analysis (Photo of a screen suspected).")
            penalty_points += 50

        disease_desc = disease_name.lower()
        if ("blight" in disease_desc or "rot" in disease_desc) and request.temp > 35:
            fraud_flags.append("Weather Alert: Claimed moisture/flood damage, but climate data shows severe drought.")
            penalty_points += 100

        final_agriscore = max(0, request.farmer_score - penalty_points)
        is_trusted = final_agriscore >= 600

        if penalty_points > 0:
            waiting_days = "BLOCKED: Fraud Investigation"
            analysis_data["summary"] = f"⚠️ CLAIM REJECTED.\n\n{fraud_flags[0]}\nYour AgriScore dropped from {request.farmer_score} to {final_agriscore}."
            analysis_data["pmfby_eligible"] = False
            analysis_data["estimated_payout"] = 0
            if not is_actually_a_plant:
                analysis_data["recommended_action"] = "Fraud Alert: Submit a real crop image."
            else:
                analysis_data["recommended_action"] = "Awaiting manual physical audit by local field officer."
        else:
            waiting_days = "0 Days (Instant Auto-Payout)" if is_trusted else "5 to 7 Business Days"

        print(f"✅ Analysis Complete! New AgriScore: {final_agriscore}. Status: {waiting_days}")

        verification = {
            "waiting_period": waiting_days,
            "is_trusted_user": is_trusted,
            "weather_mismatch_flag": penalty_points > 0,
            "new_agriscore": final_agriscore,
        }

        print("💾 Persisting claim to Supabase...")
        insert_result = (
            supabase.table("claims")
            .insert(
                {
                    "farmer_id": request.farmer_id,
                    "crop": analysis_data["crop_type"],
                    "pathogen": analysis_data["disease_name"],
                    "damage_percentage": analysis_data["damage_percentage"],
                    "recommended_action": analysis_data["recommended_action"],
                    "estimated_payout": analysis_data["estimated_payout"],
                    "image_url": request.image_url,
                    "status": "analyzed",
                    "source": "backend",
                    "raw_analysis": {"analysis": analysis_data, "verification": verification, "gemini_raw": gemini_data},
                    "lat": request.lat,
                    "lng": request.lng,
                    "weather_temp": request.temp,
                    "weather_condition": request.weather_condition,
                }
            )
            .execute()
        )
        claim_id = insert_result.data[0]["id"] if insert_result.data else None
        print("--------------------------------------------------")

        return {
            "status": "success",
            "claim_id": claim_id,
            "analysis": analysis_data,
            "verification": verification,
        }

    except Exception as e:
        print("❌ Error:", e)
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
