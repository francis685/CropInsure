from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import google.generativeai as genai
import httpx
import base64
import json

# 🚨 PUT YOUR BRAND NEW GEMINI API KEY HERE 🚨
genai.configure(api_key="AIzaSyBTqTaNzSxhG-l6D_3TqwbCkDQJ1vsir0A")

app = FastAPI()

# Allow your React Native app to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClaimRequest(BaseModel):
    image_url: str
    farmer_phone: str = "Unknown"

@app.get("/")
def read_root():
    return {"status": "CropInsure API is LIVE 🚀"}

@app.post("/api/analyze-crop")
async def analyze_crop(request: ClaimRequest):
    print("--------------------------------------------------")
    print(f"📩 Received Image URL from App: {request.image_url}")
    
    try:
        # 1. Download the image from your Supabase URL
        print("⏳ Downloading image from Supabase...")
        async with httpx.AsyncClient() as client:
            response = await client.get(request.image_url, timeout=15.0)
            img_data = base64.b64encode(response.content).decode()

        # 2. Ask Gemini to analyze it
        print("🧠 Sending to Gemini Vision AI...")
        
        # 🟢 THE FIX: Using the correct, supported multimodal model
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = """
        You are an expert agricultural scientist analyzing crop damage in India.
        Respond ONLY with a valid JSON object in this exact format:
        {
            "crop_type": "name of the crop",
            "disease_detected": true or false,
            "disease_name": "exact disease name or Healthy",
            "disease_category": "Fungal/Bacterial/Viral/Pest/Weather/Healthy",
            "damage_percentage": 65,
            "severity": "None", "Mild", "Moderate", "Severe", or "Critical",
            "symptoms_observed": ["symptom 1", "symptom 2"],
            "confidence_score": 95,
            "pmfby_eligible": true or false,
            "estimated_yield_loss": 40,
            "recommended_action": "short treatment advice",
            "urgency": "Immediate",
            "estimated_payout": 35000,
            "summary": "2 sentence summary"
        }
        """
        image_part = {"inline_data": {"mime_type": "image/jpeg", "data": img_data}}
        
        # 🟢 THE FIX: Forcing strict JSON output natively
        gemini_response = model.generate_content(
            [prompt, image_part],
            generation_config={"response_mime_type": "application/json"}
        )

        # 3. Clean up the response and send it back to the app
        text = gemini_response.text.strip()
        analysis_data = json.loads(text)
        
        print("✅ Gemini Analysis Complete! Sending back to app.")
        print("--------------------------------------------------")

        return {
            "status": "success",
            "analysis": analysis_data
        }

    except Exception as e:
        print("❌ Error:", e)
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)