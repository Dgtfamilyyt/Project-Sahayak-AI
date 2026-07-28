export type NetworkMode = "online" | "offline";

export interface Vitals {
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number; // in Celsius or Fahrenheit
  spO2: number;
  weightKg: number;
  recordedAt: string;
}

export interface VisitRecord {
  id: string;
  patientId: string;
  date: string;
  chiefComplaint: string;
  clinicalNotes: string;
  vitals: Vitals;
  diagnosis: string[];
  prescribedMedications: PrescribedDrug[];
  followUpDays?: number;
  attendedByWorker: string;
  syncedToCloud: boolean;
  aiSummaryCache?: AISummaryResult;
}

export interface Patient {
  id: string; // e.g. SHK-2026-0891
  qrCodeId: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  primaryLanguage: string;
  phone: string;
  village: string;
  district: string;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  knownAllergies: string[];
  chronicDiseases: string[];
  activeMedications: string[];
  visits: VisitRecord[];
  createdAt: string;
  updatedAt: string;
  syncedToCloud: boolean;
}

export interface PrescribedDrug {
  medicineId: string;
  medicineName: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "1-0-1 after meals"
  durationDays: number;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  genericName: string;
  category: "Antibiotic" | "Analgesic" | "Antidiabetic" | "Antihypertensive" | "Vaccine" | "Emergency" | "General";
  currentStock: number;
  unit: string; // "tablets", "vials", "strip", "bottles"
  minThreshold: number;
  dailyBurnRate: number; // estimated units used per day
  expiryDate: string; // YYYY-MM-DD
  batchNumber: string;
  unitCostInr: number;
  lastRestocked: string;
}

export interface DrugInteraction {
  severity: "HIGH" | "MEDIUM" | "LOW";
  drugs: string;
  description: string;
}

export interface PrescriptionCheckResult {
  hasWarnings: boolean;
  duplicateMedicines: string[];
  drugInteractions: DrugInteraction[];
  allergyAlerts: string[];
  dosageGuidance: string[];
  followUpReminderDays?: number;
}

export interface AISummaryResult {
  conciseSummary: string;
  allergies: string[];
  chronicDiseases: string[];
  previousMedications: string[];
  criticalRisks: string[];
  suggestedClinicalActions: string[];
}

export interface TranslationResult {
  directTranslation: string;
  clinicalNotes: string;
  detectedMedicalKeywords: string[];
  suggestedDoctorQuestions: string[];
}

export interface SyncQueueItem {
  id: string;
  entityType: "patient" | "visit" | "prescription" | "inventory";
  action: "CREATE" | "UPDATE" | "DELETE";
  data: any;
  createdAt: string;
  attempts: number;
  status: "PENDING" | "SYNCED" | "FAILED";
}

export interface HackathonDeliverable {
  id: number;
  title: string;
  category: string;
  content: string;
  codeOrDiagram?: string;
}
