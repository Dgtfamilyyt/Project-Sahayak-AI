import { OllamaConfig, OllamaStatusResponse, TranslationResult, AISummaryResult, PrescriptionCheckResult, Patient, InventoryItem, PrescribedDrug } from "../types";
import { offlineSymptomTranslator, offlineMedicalSummarizer, offlineDrugInteractionChecker } from "./offlineStorage";

/**
 * Normalizes host URL to prevent trailing slashes
 */
export function normalizeOllamaHost(host?: string): string {
  const raw = host || "http://localhost:11434";
  return raw.replace(/\/$/, "");
}

/**
 * Checks Ollama server health via direct browser call, then falls back to server backend
 */
export async function checkOllamaHealth(hostUrl?: string): Promise<OllamaStatusResponse & { source?: "browser" | "backend" }> {
  const cleanHost = normalizeOllamaHost(hostUrl);

  // 1. Direct Browser Attempt (Fastest if local CORS is enabled on user's machine)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const directRes = await fetch(`${cleanHost}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (directRes.ok) {
      const data = await directRes.json();
      const modelsList = (data.models || []).map((m: any) => m.name || m.model);
      return {
        connected: true,
        host: cleanHost,
        models: modelsList.length > 0 ? modelsList : ["llama3.2"],
        source: "browser",
      };
    }
  } catch (err) {
    // Direct browser check failed (CORS or server unreachable directly from browser)
  }

  // 2. Backend Proxy Attempt (Server-side fetch)
  try {
    const res = await fetch("/api/ollama/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: cleanHost }),
    });
    const data: OllamaStatusResponse = await res.json();
    return {
      ...data,
      source: "backend",
    };
  } catch (err: any) {
    return {
      connected: false,
      host: cleanHost,
      models: [],
      error: `Could not reach Ollama at ${cleanHost}. Launch 'ollama serve' or enable OLLAMA_ORIGINS="*"`,
    };
  }
}

/**
 * Executes an Ollama completion request with dual-channel fallback:
 * Direct Browser Fetch -> Backend Proxy -> Throws for offline rules fallback
 */
export async function queryOllama(options: {
  host?: string;
  model?: string;
  prompt: string;
  systemPrompt?: string;
  formatJson?: boolean;
}): Promise<{ response: string; source: "browser" | "backend" }> {
  const cleanHost = normalizeOllamaHost(options.host);
  const targetModel = options.model || "llama3.2";
  const system = options.systemPrompt || "You are Project Sahayak AI, an expert medical clinical assistant.";

  const requestBody = {
    model: targetModel,
    prompt: options.prompt,
    system,
    stream: false,
    format: options.formatJson !== false ? "json" : undefined,
    options: {
      temperature: 0.1,
    },
  };

  // 1. First Attempt: Direct Browser Fetch (Local Loopback / Direct CORS)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for local inference

    const directRes = await fetch(`${cleanHost}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(requestBody),
    });
    clearTimeout(timeoutId);

    if (directRes.ok) {
      const data = await directRes.json();
      if (data.response) {
        return { response: data.response, source: "browser" };
      }
    }
  } catch (directErr) {
    // Direct browser call failed (e.g., CORS policy or container isolation)
  }

  // 2. Second Attempt: Backend Proxy (/api/ollama/generate)
  const proxyRes = await fetch("/api/ollama/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: cleanHost,
      model: targetModel,
      prompt: options.prompt,
      systemPrompt: system,
    }),
  });

  if (!proxyRes.ok) {
    throw new Error(`Ollama Proxy HTTP ${proxyRes.status}`);
  }

  const proxyData = await proxyRes.json();
  if (proxyData.success && proxyData.response) {
    return { response: proxyData.response, source: "backend" };
  }

  throw new Error(proxyData.error || "Ollama generation returned empty response");
}

/**
 * Helper to safely extract JSON from LLM string output
 */
export function parseJSONResponse<T>(rawText: string, fallbackDefault: T): T {
  try {
    // Clean code blocks if present (```json ... ```)
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.warn("Failed to parse JSON from Ollama response, using fallback format:", rawText);
    return fallbackDefault;
  }
}

/**
 * Multilingual Symptom Translation via Ollama or Rule Fallback
 */
export async function translateSymptomsWithOllama(
  patientInput: string,
  sourceLanguage: string,
  ollamaConfig?: OllamaConfig
): Promise<{ result: TranslationResult; engineUsed: "ollama_browser" | "ollama_backend" | "offline_rules"; modelUsed?: string }> {
  const host = ollamaConfig?.host || "http://localhost:11434";
  const model = ollamaConfig?.model || "llama3.2";

  const prompt = `Convert the following patient symptom narrative into clean English clinical notes and direct translation.
Source Language: ${sourceLanguage}
Patient Narrative: "${patientInput}"

Return strictly valid JSON in this structure:
{
  "directTranslation": "Accurate English translation of the patient narrative",
  "clinicalNotes": "Structured clinical symptoms summary for EMR (Chief Complaints, Severity, Duration)",
  "detectedMedicalKeywords": ["Array of detected symptoms e.g. High Fever, Cephalalgia"],
  "suggestedDoctorQuestions": ["3 relevant diagnostic questions for the doctor to ask"]
}`;

  try {
    const { response: rawOutput, source } = await queryOllama({
      host,
      model,
      prompt,
      systemPrompt: "You are a clinical multilingual translator for primary healthcare centers. Output JSON only.",
      formatJson: true,
    });

    const fallbackRuleObj = offlineSymptomTranslator(patientInput, sourceLanguage);
    const parsed = parseJSONResponse<TranslationResult>(rawOutput, {
      directTranslation: fallbackRuleObj.directTranslation,
      clinicalNotes: fallbackRuleObj.clinicalNotes,
      detectedMedicalKeywords: fallbackRuleObj.keywords,
      suggestedDoctorQuestions: [
        "How long have you experienced these specific symptoms?",
        "Have you taken any over-the-counter fever or pain medication?",
      ],
    });

    return {
      result: parsed,
      engineUsed: source === "browser" ? "ollama_browser" : "ollama_backend",
      modelUsed: model,
    };
  } catch (err) {
    // Fallback to offline rule engine
    const ruleRes = offlineSymptomTranslator(patientInput, sourceLanguage);
    return {
      result: {
        directTranslation: ruleRes.directTranslation,
        clinicalNotes: ruleRes.clinicalNotes,
        detectedMedicalKeywords: ruleRes.keywords,
        suggestedDoctorQuestions: [
          "How many days have you been experiencing these chief symptoms?",
          "Are you able to eat and drink normally?",
        ],
      },
      engineUsed: "offline_rules",
    };
  }
}

/**
 * AI Patient Summarizer via Ollama or Rule Fallback
 */
export async function summarizePatientWithOllama(
  patient: Patient,
  medicalNotes: string,
  ollamaConfig?: OllamaConfig
): Promise<{ result: AISummaryResult; engineUsed: "ollama_browser" | "ollama_backend" | "offline_rules"; modelUsed?: string }> {
  const host = ollamaConfig?.host || "http://localhost:11434";
  const model = ollamaConfig?.model || "llama3.2";

  const prompt = `Analyze patient clinical records and vitals to output a structured medical summary in JSON.
Patient Name: ${patient.fullName} (${patient.age} y/o ${patient.gender})
Known Allergies: ${patient.knownAllergies.join(", ") || "None"}
Chronic Conditions: ${patient.chronicDiseases.join(", ") || "None"}
Notes: ${medicalNotes}

Return strictly valid JSON:
{
  "conciseSummary": "Brief 2 sentence overview of patient status",
  "allergies": ["detected or reported allergies"],
  "chronicDiseases": ["chronic illnesses e.g. Hypertension"],
  "previousMedications": ["active or past medications"],
  "criticalRisks": ["high priority medical warnings or triage flags"],
  "suggestedClinicalActions": ["2-3 practical next steps for healthcare worker"]
}`;

  try {
    const { response: rawOutput, source } = await queryOllama({
      host,
      model,
      prompt,
      systemPrompt: "You are an expert clinical summarizer AI for primary health centers. Output strictly valid JSON.",
      formatJson: true,
    });

    const ruleRes = offlineMedicalSummarizer(patient, medicalNotes);
    const parsed = parseJSONResponse<AISummaryResult>(rawOutput, ruleRes);

    return {
      result: parsed,
      engineUsed: source === "browser" ? "ollama_browser" : "ollama_backend",
      modelUsed: model,
    };
  } catch (err) {
    const ruleRes = offlineMedicalSummarizer(patient, medicalNotes);
    return {
      result: ruleRes,
      engineUsed: "offline_rules",
    };
  }
}
