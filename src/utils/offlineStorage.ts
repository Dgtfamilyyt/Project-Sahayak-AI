import { Patient, InventoryItem, SyncQueueItem, AISummaryResult, PrescriptionCheckResult, PrescribedDrug } from "../types";
import { INITIAL_PATIENTS, INITIAL_INVENTORY } from "../data/mockData";

const PATIENTS_KEY = "sahayak_patients_v1";
const INVENTORY_KEY = "sahayak_inventory_v1";
const QUEUE_KEY = "sahayak_sync_queue_v1";
const MODE_KEY = "sahayak_network_mode_v1";

export function loadLocalPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(PATIENTS_KEY);
    if (!raw) {
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load local patients", e);
    return INITIAL_PATIENTS;
  }
}

export function saveLocalPatients(patients: Patient[]): void {
  try {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error("Failed to save local patients", e);
  }
}

export function loadLocalInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (!raw) {
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(INITIAL_INVENTORY));
      return INITIAL_INVENTORY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load local inventory", e);
    return INITIAL_INVENTORY;
  }
}

export function saveLocalInventory(inventory: InventoryItem[]): void {
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  } catch (e) {
    console.error("Failed to save inventory", e);
  }
}

export function loadSyncQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveSyncQueue(queue: SyncQueueItem[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("Failed to save sync queue", e);
  }
}

export function enqueueMutation(entityType: SyncQueueItem["entityType"], action: SyncQueueItem["action"], data: any): SyncQueueItem {
  const queue = loadSyncQueue();
  const newItem: SyncQueueItem = {
    id: `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    entityType,
    action,
    data,
    createdAt: new Date().toISOString(),
    attempts: 0,
    status: "PENDING",
  };
  queue.push(newItem);
  saveSyncQueue(queue);
  return newItem;
}

export function getNetworkMode(): "online" | "offline" {
  const saved = localStorage.getItem(MODE_KEY);
  if (saved === "offline") return "offline";
  return "online";
}

export function setNetworkMode(mode: "online" | "offline"): void {
  localStorage.setItem(MODE_KEY, mode);
}

export function resetAllLocalData(): void {
  try {
    localStorage.clear();
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem(QUEUE_KEY, JSON.stringify([]));
    localStorage.setItem(MODE_KEY, "online");
  } catch (e) {
    console.error("Failed to reset local data", e);
  }
}

// ==========================================
// LOCAL OFFLINE HEURISTIC RULE-BASED ENGINES
// ==========================================

export function offlineMedicalSummarizer(patient: Patient, notes: string): AISummaryResult {
  const allergies = [...patient.knownAllergies];
  const chronicDiseases = [...patient.chronicDiseases];
  const previousMedications = [...patient.activeMedications];
  const criticalRisks: string[] = [];
  const suggestedClinicalActions: string[] = [];

  // Check notes & past visits for risk words
  const fullText = (notes + " " + patient.visits.map((v) => v.chiefComplaint + " " + v.clinicalNotes).join(" ")).toLowerCase();

  if (allergies.length > 0) {
    criticalRisks.push(`ALLERGY WARNING: Patient allergic to ${allergies.join(", ")}.`);
  }

  if (fullText.includes("fever") || fullText.includes("fever 102") || fullText.includes("chills")) {
    suggestedClinicalActions.push("Monitor temperature q4h and test for Malaria/Dengue rapid antigen.");
  }

  if (fullText.includes("diabetes") || fullText.includes("sugar") || chronicDiseases.some(c => c.toLowerCase().includes("diabetes"))) {
    criticalRisks.push("Diabetes Risk: Monitor blood glucose level before administering IV fluids.");
    suggestedClinicalActions.push("Check Fasting Blood Glucose & HbA1c.");
  }

  if (fullText.includes("bp") || fullText.includes("dizziness") || chronicDiseases.some(c => c.toLowerCase().includes("hypertension"))) {
    criticalRisks.push("Hypertension Flag: Check sitting & standing Blood Pressure.");
    suggestedClinicalActions.push("Maintain low-sodium diet and daily BP log.");
  }

  if (criticalRisks.length === 0) {
    criticalRisks.push("Standard triage: Monitor vitals routinely.");
  }

  if (suggestedClinicalActions.length === 0) {
    suggestedClinicalActions.push("Follow up with Primary Medical Officer in 7 days.");
    suggestedClinicalActions.push("Ensure full course completion of prescribed drugs.");
  }

  return {
    conciseSummary: `[Offline Local Engine] ${patient.fullName} (${patient.age}y ${patient.gender}) presenting with: ${notes || "Routine follow-up visit"}. Recorded ${patient.visits.length} past visits.`,
    allergies,
    chronicDiseases,
    previousMedications,
    criticalRisks,
    suggestedClinicalActions,
  };
}

export function offlineDrugInteractionChecker(medications: PrescribedDrug[], patientAllergies: string[]): PrescriptionCheckResult {
  const duplicateMedicines: string[] = [];
  const drugInteractions: PrescriptionCheckResult["drugInteractions"] = [];
  const allergyAlerts: string[] = [];
  const dosageGuidance: string[] = [];

  const medNames = medications.map((m) => m.medicineName.toLowerCase());

  // Check duplicate drugs
  const seen = new Set<string>();
  for (const name of medNames) {
    if (seen.has(name)) {
      duplicateMedicines.push(name);
    }
    seen.add(name);
  }

  // Known drug-drug interaction matrix
  const isPresent = (term: string) => medNames.some((n) => n.includes(term));

  if (isPresent("paracetamol") && isPresent("acetaminophen")) {
    duplicateMedicines.push("Paracetamol + Acetaminophen (Same active molecule)");
  }

  if (isPresent("metformin") && isPresent("contrast")) {
    drugInteractions.push({
      severity: "HIGH",
      drugs: "Metformin + Iodine Contrast",
      description: "High risk of lactic acidosis. Withhold Metformin 48h prior to contrast.",
    });
  }

  if (isPresent("aspirin") && isPresent("warfarin")) {
    drugInteractions.push({
      severity: "HIGH",
      drugs: "Aspirin + Warfarin",
      description: "Severe bleeding risk due to dual antithrombotic mechanisms.",
    });
  }

  if (isPresent("amoxicillin") || isPresent("penicillin")) {
    for (const allergy of patientAllergies) {
      if (allergy.toLowerCase().includes("penicillin") || allergy.toLowerCase().includes("beta-lactam")) {
        allergyAlerts.push(`CRITICAL ALLERGY: Patient has recorded allergy to ${allergy}! Do NOT give Beta-Lactam antibiotics.`);
      }
    }
  }

  if (isPresent("aspirin") || isPresent("ibuprofen") || isPresent("diclofenac")) {
    for (const allergy of patientAllergies) {
      if (allergy.toLowerCase().includes("aspirin") || allergy.toLowerCase().includes("nsaid")) {
        allergyAlerts.push(`CRITICAL ALLERGY: Patient has recorded allergy to ${allergy}! Avoid NSAIDs.`);
      }
    }
  }

  // Dosage tips
  if (isPresent("metformin")) {
    dosageGuidance.push("Take Metformin immediately after meals to reduce gastrointestinal upset.");
  }
  if (isPresent("paracetamol")) {
    dosageGuidance.push("Do not exceed 4000mg Paracetamol total daily dose to prevent hepatic toxicity.");
  }
  if (isPresent("amoxicillin")) {
    dosageGuidance.push("Complete full 5-7 day course of Amoxicillin even if symptoms improve early.");
  }

  const hasWarnings = duplicateMedicines.length > 0 || drugInteractions.length > 0 || allergyAlerts.length > 0;

  return {
    hasWarnings,
    duplicateMedicines,
    drugInteractions,
    allergyAlerts,
    dosageGuidance,
    followUpReminderDays: 7,
  };
}

export function offlineSymptomTranslator(text: string, sourceLang: string): { directTranslation: string; clinicalNotes: string; keywords: string[] } {
  const keywords: string[] = [];
  const lower = text.toLowerCase();

  if (lower.includes("fever") || lower.includes("காய்ச்சல்") || lower.includes("बुखार")) {
    keywords.push("Fever / Pyrexia");
  }
  if (lower.includes("cough") || lower.includes("இருமல்") || lower.includes("खांसी")) {
    keywords.push("Productive Cough");
  }
  if (lower.includes("pain") || lower.includes("வலி") || lower.includes("दर्द")) {
    keywords.push("Body Ache / Myalgia");
  }
  if (lower.includes("breath") || lower.includes("மூச்சு") || lower.includes("सांस")) {
    keywords.push("Dyspnea / Breathlessness");
  }

  return {
    directTranslation: `[Offline Translation - ${sourceLang}]: ${text}`,
    clinicalNotes: `Patient presents with chief complaints: ${keywords.join(", ") || "General malaise"}. Onset described as acute in nature.`,
    keywords: keywords.length > 0 ? keywords : ["General Symptoms"],
  };
}
