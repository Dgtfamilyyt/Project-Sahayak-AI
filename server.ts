import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// 2. AI Patient Medical History Summarizer Endpoint
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { patientName, age, gender, medicalNotes, vitals, history } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key not configured on server",
        isFallback: true,
      });
    }

    const prompt = `You are Project Sahayak AI, an expert clinical assistant for primary healthcare centers in rural India.
Analyze the following patient clinical notes, vitals, and historical visits. Provide a structured medical summary in JSON format.

Patient: ${patientName} (${age} y/o ${gender})
Vitals: ${JSON.stringify(vitals || {})}
Recent Clinical Notes: ${medicalNotes || "None"}
Past History: ${JSON.stringify(history || [])}

Provide the following exact JSON structure:
{
  "conciseSummary": "Brief 2-3 sentence overview of patient status and chief complaint",
  "allergies": ["list of detected or suspected allergies"],
  "chronicDiseases": ["list of chronic conditions e.g. Hypertension, Diabetes Type 2"],
  "previousMedications": ["list of active or past medications"],
  "criticalRisks": ["high priority medical warnings or urgent triage flags"],
  "suggestedClinicalActions": ["2-3 practical next steps for the community health worker/doctor"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conciseSummary: { type: Type.STRING },
            allergies: { type: Type.ARRAY, items: { type: Type.STRING } },
            chronicDiseases: { type: Type.ARRAY, items: { type: Type.STRING } },
            previousMedications: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedClinicalActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["conciseSummary", "allergies", "chronicDiseases", "previousMedications", "criticalRisks", "suggestedClinicalActions"],
        },
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json({ success: true, summary: data, isFallback: false });
  } catch (err: any) {
    console.error("Error in AI Summarize:", err);
    res.status(500).json({ error: err.message || "Failed to generate summary", isFallback: true });
  }
});

// 3. Multilingual Symptom Translator Endpoint
app.post("/api/ai/translate", async (req, res) => {
  try {
    const { speechOrText, sourceLanguage, targetLanguage } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key not configured", isFallback: true });
    }

    const prompt = `You are a medical speech and text translator for rural clinics in India.
Convert the patient's narrative/symptom description into clean, standardized English clinical medical notes, while also providing a verbatim natural translation.

Source Language: ${sourceLanguage || "Hindi/Tamil/Auto-detect"}
Target Language for Doctor: ${targetLanguage || "English"}
Patient Narrative: "${speechOrText}"

Return JSON with:
{
  "directTranslation": "Accurate natural translation into doctor's language",
  "clinicalNotes": "Structured clinical symptoms summary (Chief Complaints, Duration, Severity, Associated Symptoms)",
  "detectedMedicalKeywords": ["list of key symptoms e.g. Fever, Dyspnea, Joint Pain"],
  "suggestedDoctorQuestions": ["3 relevant diagnostic follow-up questions for doctor to ask"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            directTranslation: { type: Type.STRING },
            clinicalNotes: { type: Type.STRING },
            detectedMedicalKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedDoctorQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["directTranslation", "clinicalNotes", "detectedMedicalKeywords", "suggestedDoctorQuestions"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json({ success: true, translation: result, isFallback: false });
  } catch (err: any) {
    console.error("Error in AI Translate:", err);
    res.status(500).json({ error: err.message, isFallback: true });
  }
});

// 4. Smart Prescription Generator & Drug Interaction Checker
app.post("/api/ai/prescription-check", async (req, res) => {
  try {
    const { medications, patientAllergies, chronicConditions } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key not configured", isFallback: true });
    }

    const prompt = `You are a clinical pharmacology AI assistant for primary care clinics.
Evaluate the following prescribed medications for a patient with known allergies and chronic conditions.

Medications Prescribed: ${JSON.stringify(medications)}
Patient Known Allergies: ${JSON.stringify(patientAllergies || [])}
Chronic Conditions: ${JSON.stringify(chronicConditions || [])}

Analyze and return JSON:
{
  "hasWarnings": boolean,
  "duplicateMedicines": ["list of duplicate active ingredients or overlapping drug classes"],
  "drugInteractions": [
    {
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "drugs": "Drug A + Drug B",
      "description": "Explanation of interaction risk and recommendation"
    }
  ],
  "allergyAlerts": ["warnings if prescribed drug conflicts with patient allergies"],
  "dosageGuidance": ["key dietary or timing advice e.g., take after food, space out by 2 hrs"],
  "followUpReminderDays": number (recommended follow-up interval in days)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json({ success: true, analysis: result, isFallback: false });
  } catch (err: any) {
    console.error("Error in Prescription Check:", err);
    res.status(500).json({ error: err.message, isFallback: true });
  }
});

// 5. Medicine Inventory Stock Predictor
app.post("/api/ai/inventory-predict", async (req, res) => {
  try {
    const { inventoryItems, dailyConsumptionRates } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key not configured", isFallback: true });
    }

    const prompt = `Analyze clinic medicine inventory stock levels, expiration dates, and consumption rates.
Current Inventory: ${JSON.stringify(inventoryItems)}
Average Daily Usage: ${JSON.stringify(dailyConsumptionRates || {})}

Provide predictive stocking insights in JSON:
{
  "criticalShortages": [
    {
      "medicineId": "string",
      "medicineName": "string",
      "daysRemaining": number,
      "urgency": "HIGH" | "MEDIUM" | "LOW",
      "recommendedReorderQty": number
    }
  ],
  "expiryRisk": [
    {
      "medicineName": "string",
      "quantityAtRisk": number,
      "expiryDate": "YYYY-MM-DD",
      "recommendation": "string"
    }
  ],
  "overallStockHealthScore": number (0 to 100),
  "insightsSummary": "2-3 sentence executive recommendation for clinic administrator"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json({ success: true, forecast: result, isFallback: false });
  } catch (err: any) {
    console.error("Error in Inventory Predict:", err);
    res.status(500).json({ error: err.message, isFallback: true });
  }
});

// 6. Offline Queue Sync Endpoint
app.post("/api/sync", async (req, res) => {
  try {
    const { queuedRecords } = req.body;
    console.log(`Received ${queuedRecords?.length || 0} offline records for cloud synchronization.`);
    // Simulate cloud persistence merge
    res.json({
      success: true,
      syncedCount: queuedRecords?.length || 0,
      timestamp: new Date().toISOString(),
      message: "Successfully synchronized offline records to cloud database.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Project Sahayak AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

main();
