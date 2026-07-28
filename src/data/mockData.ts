import { Patient, InventoryItem, HackathonDeliverable } from "../types";

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "SHK-2026-1001",
    qrCodeId: "QR-SHK-1001-RAMESH",
    fullName: "Ramesh Kumar",
    age: 52,
    gender: "Male",
    primaryLanguage: "Hindi",
    phone: "+91 98765 43210",
    village: "Rampur",
    district: "Sonipat, Haryana",
    bloodGroup: "O+",
    emergencyContactName: "Sita Devi (Wife)",
    emergencyContactPhone: "+91 98765 43211",
    knownAllergies: ["Penicillin", "Sulfa Drugs"],
    chronicDiseases: ["Type 2 Diabetes Mellitus", "Hypertension"],
    activeMedications: ["Metformin 500mg (BD)", "Amlodipine 5mg (OD)"],
    createdAt: "2026-01-15T09:30:00Z",
    updatedAt: "2026-07-20T11:15:00Z",
    syncedToCloud: true,
    visits: [
      {
        id: "VIS-1001-1",
        patientId: "SHK-2026-1001",
        date: "2026-07-20",
        chiefComplaint: "Dizziness and increased thirst for 3 days, mild headache",
        clinicalNotes: "Patient reports missed Metformin doses over past week. Fasting blood sugar elevated. BP mildly high. Advised lifestyle changes and strictly regular medication.",
        vitals: {
          bloodPressureSystolic: 148,
          bloodPressureDiastolic: 92,
          heartRate: 84,
          temperature: 98.4,
          spO2: 97,
          weightKg: 74,
          recordedAt: "2026-07-20T11:00:00Z",
        },
        diagnosis: ["Uncontrolled Type 2 Diabetes", "Stage 1 Essential Hypertension"],
        prescribedMedications: [
          { medicineId: "MED-003", medicineName: "Metformin ER", dosage: "500mg", frequency: "1-0-1 after food", durationDays: 30 },
          { medicineId: "MED-004", medicineName: "Amlodipine", dosage: "5mg", frequency: "1-0-0 in morning", durationDays: 30 },
        ],
        followUpDays: 14,
        attendedByWorker: "ANM Sunita Verma (PHC Rampur)",
        syncedToCloud: true,
        aiSummaryCache: {
          conciseSummary: "52 y/o diabetic & hypertensive male presenting with dizziness due to medication non-compliance. Known Penicillin allergy.",
          allergies: ["Penicillin", "Sulfa Drugs"],
          chronicDiseases: ["Type 2 Diabetes", "Hypertension"],
          previousMedications: ["Metformin 500mg", "Amlodipine 5mg"],
          criticalRisks: ["Allergy Alert: Avoid Penicillin antibiotics", "Hypertensive crisis risk if BP > 160"],
          suggestedClinicalActions: ["Recheck Fasting Blood Glucose in 14 days", "Educate on glycemic compliance"],
        },
      },
    ],
  },
  {
    id: "SHK-2026-1002",
    qrCodeId: "QR-SHK-1002-PRIYA",
    fullName: "Priya Sharma",
    age: 28,
    gender: "Female",
    primaryLanguage: "Hindi",
    phone: "+91 98123 76543",
    village: "Kheri",
    district: "Sonipat, Haryana",
    bloodGroup: "B+",
    emergencyContactName: "Rajesh Sharma (Husband)",
    emergencyContactPhone: "+91 98123 76544",
    knownAllergies: ["Aspirin", "NSAIDs"],
    chronicDiseases: ["Iron Deficiency Anemia (Mild)"],
    activeMedications: ["Ferrous Sulfate + Folic Acid"],
    createdAt: "2026-03-10T10:00:00Z",
    updatedAt: "2026-07-25T14:20:00Z",
    syncedToCloud: true,
    visits: [
      {
        id: "VIS-1002-1",
        patientId: "SHK-2026-1002",
        date: "2026-07-25",
        chiefComplaint: "High fever (102°F) with body ache, chills, and productive cough for 2 days",
        clinicalNotes: "Acute onset febrile illness. Chest clear on auscultation. Dengue/Malaria rapid test negative. Prescribed Paracetamol and Hydration. Strict instruction to avoid NSAIDs due to allergy.",
        vitals: {
          bloodPressureSystolic: 118,
          bloodPressureDiastolic: 76,
          heartRate: 98,
          temperature: 102.1,
          spO2: 98,
          weightKg: 52,
          recordedAt: "2026-07-25T14:15:00Z",
        },
        diagnosis: ["Acute Upper Respiratory Tract Infection", "Mild Dehydration"],
        prescribedMedications: [
          { medicineId: "MED-001", medicineName: "Paracetamol", dosage: "650mg", frequency: "1-1-1 after food", durationDays: 5 },
          { medicineId: "MED-005", medicineName: "ORS Packets", dosage: "1 sachet in 1L water", frequency: "Sip throughout day", durationDays: 3 },
        ],
        followUpDays: 3,
        attendedByWorker: "Dr. A. K. Singh (Medical Officer)",
        syncedToCloud: true,
      },
    ],
  },
  {
    id: "SHK-2026-1003",
    qrCodeId: "QR-SHK-1003-ARUN",
    fullName: "Arun Murugan",
    age: 44,
    gender: "Male",
    primaryLanguage: "Tamil",
    phone: "+91 94432 10987",
    village: "Pattukkottai",
    district: "Thanjavur, Tamil Nadu",
    bloodGroup: "A+",
    emergencyContactName: "Kavitha (Sister)",
    emergencyContactPhone: "+91 94432 10988",
    knownAllergies: [],
    chronicDiseases: ["Bronchial Asthma"],
    activeMedications: ["Salbutamol Inhaler (PRN)"],
    createdAt: "2026-05-02T08:00:00Z",
    updatedAt: "2026-07-26T16:00:00Z",
    syncedToCloud: false,
    visits: [
      {
        id: "VIS-1003-1",
        patientId: "SHK-2026-1003",
        date: "2026-07-26",
        chiefComplaint: "மூச்சுத் திணறல் மற்றும் இரவில் கடுமையான இருமல் (Shortness of breath and severe night cough)",
        clinicalNotes: "Asthma exacerbation due to seasonal agricultural grain dust exposure. SpO2 94% on room air. Administered nebulization.",
        vitals: {
          bloodPressureSystolic: 124,
          bloodPressureDiastolic: 80,
          heartRate: 92,
          temperature: 98.6,
          spO2: 94,
          weightKg: 68,
          recordedAt: "2026-07-26T15:45:00Z",
        },
        diagnosis: ["Acute Asthmatic Exacerbation"],
        prescribedMedications: [
          { medicineId: "MED-007", medicineName: "Salbutamol Inhaler", dosage: "100mcg", frequency: "2 puffs 4-6 hourly", durationDays: 14 },
          { medicineId: "MED-008", medicineName: "Cetirizine", dosage: "10mg", frequency: "0-0-1 at bedtime", durationDays: 7 },
        ],
        followUpDays: 7,
        attendedByWorker: "ANM Selvi (PHC Center)",
        syncedToCloud: false,
      },
    ],
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "MED-001",
    name: "Paracetamol 650mg",
    genericName: "Acetaminophen",
    category: "Analgesic",
    currentStock: 120,
    unit: "tablets",
    minThreshold: 300,
    dailyBurnRate: 35, // will run out in ~3.4 days!
    expiryDate: "2026-11-30",
    batchNumber: "PCM-2026-B89",
    unitCostInr: 2.5,
    lastRestocked: "2026-06-01",
  },
  {
    id: "MED-002",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin Trihydrate",
    category: "Antibiotic",
    currentStock: 45,
    unit: "capsules",
    minThreshold: 100,
    dailyBurnRate: 12, // runs out in ~3.7 days
    expiryDate: "2026-08-15", // WARNING: Expiry approaching!
    batchNumber: "AMX-2025-C12",
    unitCostInr: 7.0,
    lastRestocked: "2026-05-10",
  },
  {
    id: "MED-003",
    name: "Metformin ER 500mg",
    genericName: "Metformin Hydrochloride",
    category: "Antidiabetic",
    currentStock: 450,
    unit: "tablets",
    minThreshold: 200,
    dailyBurnRate: 20,
    expiryDate: "2027-05-20",
    batchNumber: "MTF-2026-A01",
    unitCostInr: 3.2,
    lastRestocked: "2026-07-01",
  },
  {
    id: "MED-004",
    name: "Amlodipine 5mg",
    genericName: "Amlodipine Besylate",
    category: "Antihypertensive",
    currentStock: 320,
    unit: "tablets",
    minThreshold: 150,
    dailyBurnRate: 15,
    expiryDate: "2027-09-10",
    batchNumber: "AML-2026-X44",
    unitCostInr: 2.1,
    lastRestocked: "2026-06-15",
  },
  {
    id: "MED-005",
    name: "ORS Electrolyte Sachets",
    genericName: "Oral Rehydration Salts (WHO formula)",
    category: "General",
    currentStock: 85,
    unit: "sachets",
    minThreshold: 200,
    dailyBurnRate: 25, // CRITICAL: monsoon diarrhea wave!
    expiryDate: "2028-01-01",
    batchNumber: "ORS-2026-W09",
    unitCostInr: 5.0,
    lastRestocked: "2026-04-20",
  },
  {
    id: "MED-006",
    name: "Anti-Rabies Vaccine (ARV)",
    genericName: "Purified Vero Cell Rabies Vaccine",
    category: "Vaccine",
    currentStock: 8,
    unit: "vials",
    minThreshold: 15,
    dailyBurnRate: 2,
    expiryDate: "2026-09-30",
    batchNumber: "ARV-2026-R11",
    unitCostInr: 350.0,
    lastRestocked: "2026-06-28",
  },
  {
    id: "MED-007",
    name: "Salbutamol Inhaler 100mcg",
    genericName: "Salbutamol Sulfate Inhaler",
    category: "Emergency",
    currentStock: 18,
    unit: "inhalers",
    minThreshold: 20,
    dailyBurnRate: 2,
    expiryDate: "2027-03-15",
    batchNumber: "SLB-2026-I02",
    unitCostInr: 140.0,
    lastRestocked: "2026-05-30",
  },
  {
    id: "MED-008",
    name: "Cetirizine 10mg",
    genericName: "Cetirizine Dihydrochloride",
    category: "General",
    currentStock: 210,
    unit: "tablets",
    minThreshold: 100,
    dailyBurnRate: 10,
    expiryDate: "2027-11-12",
    batchNumber: "CTZ-2026-P05",
    unitCostInr: 1.8,
    lastRestocked: "2026-06-10",
  },
];

export const HACKATHON_DELIVERABLES: HackathonDeliverable[] = [
  {
    id: 1,
    title: "1. Unique Value Proposition (UVP)",
    category: "Strategy & Pitch",
    content: `Project Sahayak AI isn't just another conversational chatbot; it is an Offline-First Edge AI Clinical Co-Pilot engineered explicitly for extreme low-bandwidth & zero-connectivity rural clinics (Primary Health Centres / Sub-Centres in India & Global South).

Key Differentiators:
1. Zero-Cloud Dependency Mode: Local rule-based NLP + compressed vector indices operate fully offline inside the browser/device when cellular networks drop.
2. Multilingual Voice-to-Clinical Notes: Converts rural dialect patient audio (Hindi, Tamil, Telugu, Marathi, Bengali) directly into standardized ICD-style medical English notes.
3. Automated Pharmacovigilance: Local real-time drug-drug interaction & duplicate therapy warning system preventing lethal errors at the village level.
4. Smart Stockout & Expiry Analytics: Uses local time-series burn-rate forecasting to alert health workers 7 days BEFORE critical lifesaving drugs run out.
5. Instant Emergency QR Triage: One-click offline emergency card rendering life-critical allergies and blood group even without internet.`,
  },
  {
    id: 2,
    title: "2. Software Architecture Diagram",
    category: "Architecture",
    content: `[Layer 1: Client / Edge Tier (Rural Tablet / Browser)]
  ├── React 19 SPA + Tailwind CSS + Lucide Icons + Motion
  ├── Offline Engine: IndexedDB Local Storage + Sync Queue Manager
  ├── Local Edge AI: Heuristic Medical Rule Engines (Drug Interaction, Allergy Matcher, Expiry Burn Rate)
  └── Web Speech API & Camera QR Scanner

[Layer 2: Hybrid Offline-Online Gateway]
  ├── Connectivity Detector (Navigator Online Event + Ping Monitor)
  └── Offline Mutation Queue (Stores CRUD operations with SHA-256 hashes)

[Layer 3: Cloud Server Tier (Render / Cloud Run)]
  ├── Express.js + Node.js API Gateway
  ├── Server-Side @google/genai SDK (Gemini 3.6 Flash & Gemini 3.1 Pro)
  └── Automated JSON Schema Validators

[Layer 4: Data & Cloud Sync Tier]
  ├── Local Offline Cache: IndexedDB / LocalStorage Schema
  └── Cloud DB: Firebase Firestore / PostgreSQL Cloud Sync Target`,
    codeOrDiagram: `
+-------------------------------------------------------------------------+
|                  RURAL EDGE CLINIC DEVICE (OFFLINE-FIRST)                |
|  +---------------------+   +---------------------+  +-----------------+  |
|  | Patient Record UI   |   | AI Summary / Trans  |  | Emergency Mode  |  |
|  +----------+----------+   +----------+----------+  +--------+--------+  |
|             |                         |                      |           |
|  +----------v-------------------------v----------------------v--------+  |
|  |            Local State Engine & IndexedDB Persistence              |  |
|  |  - Offline Patient History    - Offline Pharmacovigilance Rules    |  |
|  |  - Offline Queue Mutations    - Local Inventory Predictive Engine  |  |
|  +------------------------------------+-------------------------------+  |
+---------------------------------------|---------------------------------+
                                        | (When Internet Available)
                                        v
+-------------------------------------------------------------------------+
|                       CLOUD SERVER TIER (ONLINE)                        |
|  +-----------------------------+     +-------------------------------+  |
|  | Express Node API Gateway    |     | Google Gemini 3.6 Flash API   |  |
|  | - /api/ai/summarize         |     | - Clinical Summaries          |  |
|  | - /api/ai/translate         |<--->| - Symptom Translation         |  |
|  | - /api/ai/prescription-check|     | - Drug Interaction Analysis   |  |
|  | - /api/sync                 |     | - Predictive Inventory AI     |  |
|  +-----------------------------+     +-------------------------------+  |
|                                |                                        |
|  +-----------------------------v-------------------------------------+  |
|  |             Firebase Firestore / Cloud SQL Sync Target             |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+`,
  },
  {
    id: 3,
    title: "3. Database Schema",
    category: "Database",
    content: `Firestore / SQLite Relational Schema:

TABLE Patients (
  id VARCHAR(50) PRIMARY KEY, -- e.g. SHK-2026-1001
  qr_code_id VARCHAR(100) UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(20) NOT NULL,
  primary_language VARCHAR(50),
  phone VARCHAR(20),
  village VARCHAR(100),
  district VARCHAR(100),
  blood_group VARCHAR(10),
  emergency_contact_name VARCHAR(150),
  emergency_contact_phone VARCHAR(20),
  known_allergies JSONB, -- Array of allergy strings
  chronic_diseases JSONB, -- Array of chronic condition strings
  active_medications JSONB, -- Array of drug strings
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  synced_to_cloud BOOLEAN DEFAULT FALSE
);

TABLE Visits (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) REFERENCES Patients(id),
  date DATE NOT NULL,
  chief_complaint TEXT,
  clinical_notes TEXT,
  vitals JSONB, -- {bp_sys, bp_dia, heart_rate, temp, spo2, weight}
  diagnosis JSONB, -- Array of ICD diagnosis strings
  prescribed_medications JSONB, -- Array of PrescribedDrug objects
  follow_up_days INT,
  attended_by_worker VARCHAR(150),
  synced_to_cloud BOOLEAN DEFAULT FALSE
);

TABLE Inventory (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  generic_name VARCHAR(150),
  category VARCHAR(50),
  current_stock INT NOT NULL,
  unit VARCHAR(20),
  min_threshold INT NOT NULL,
  daily_burn_rate FLOAT NOT NULL,
  expiry_date DATE NOT NULL,
  batch_number VARCHAR(50),
  unit_cost_inr FLOAT,
  last_restocked TIMESTAMP
);

TABLE SyncQueue (
  id VARCHAR(50) PRIMARY KEY,
  entity_type VARCHAR(30),
  action VARCHAR(10), -- CREATE, UPDATE, DELETE
  payload JSONB,
  created_at TIMESTAMP,
  attempts INT DEFAULT 0,
  status VARCHAR(20) -- PENDING, SYNCED, FAILED
);`,
  },
  {
    id: 4,
    title: "4. Complete Folder Structure",
    category: "Code Base",
    content: `project-sahayak-ai/
├── .env.example              # Gemini & App URL variables
├── metadata.json             # App capabilities & permissions
├── package.json              # Full-stack dependencies & scripts
├── server.ts                 # Express API + Gemini 3.6 Flash + Vite middleware
├── vite.config.ts            # Vite bundler configuration
├── tsconfig.json             # TypeScript compiler settings
├── src/
│   ├── main.tsx              # React mounting entry point
│   ├── App.tsx               # Primary layout, tab routing & global network state
│   ├── index.css             # Tailwind CSS styling directives
│   ├── types.ts              # Global TypeScript interfaces & schemas
│   ├── data/
│   │   └── mockData.ts       # Rural clinic datasets & hackathon pitch documentation
│   ├── utils/
│   │   ├── offlineStorage.ts # LocalStorage state persistence & offline AI rule engine
│   │   └── voiceUtils.ts     # Speech Synthesis & Web Speech API handlers
│   └── components/
│       ├── Navbar.tsx        # Network status pill, Quick Sync, Emergency button
│       ├── PatientManager.tsx# Patient directory, QR generator & scan simulator
│       ├── MedicalSummarizer.tsx# Gemini AI medical summarizer & offline fallback
│       ├── MultilingualTranslator.tsx# Voice/Text symptom translator (Hindi/Tamil/etc)
│       ├── PrescriptionGenerator.tsx# Smart prescription builder & drug interaction check
│       ├── InventoryAssistant.tsx# Stock monitoring & AI stockout prediction
│       ├── EmergencyMode.tsx # 1-Click emergency red-alert card & triage protocol
│       ├── AnalyticsDashboard.tsx# Clinic daily metrics, disease trends, stock alerts
│       ├── SyncCenter.tsx    # Offline queue monitor & cloud sync status
│       └── HackathonJudgeDeck.tsx# Complete 16-deliverable Judge Deck & pitch viewer`,
  },
  {
    id: 5,
    title: "5. API Endpoints Specification",
    category: "Backend API",
    content: `1. GET /api/health
   Response: { status: "ok", timestamp: ISO, geminiConfigured: boolean }

2. POST /api/ai/summarize
   Request: { patientName, age, gender, medicalNotes, vitals, history }
   Response: { success: true, summary: AISummaryResult, isFallback: boolean }

3. POST /api/ai/translate
   Request: { speechOrText, sourceLanguage, targetLanguage }
   Response: { success: true, translation: TranslationResult, isFallback: boolean }

4. POST /api/ai/prescription-check
   Request: { medications: PrescribedDrug[], patientAllergies: string[], chronicConditions: string[] }
   Response: { success: true, analysis: PrescriptionCheckResult, isFallback: boolean }

5. POST /api/ai/inventory-predict
   Request: { inventoryItems: InventoryItem[], dailyConsumptionRates: object }
   Response: { success: true, forecast: InventoryForecastResult, isFallback: boolean }

6. POST /api/sync
   Request: { queuedRecords: SyncQueueItem[] }
   Response: { success: true, syncedCount: number, timestamp: ISO, message: string }`,
  },
  {
    id: 6,
    title: "6. Screen-by-Screen UI Design",
    category: "UI/UX",
    content: `Screen 1: Patient Record Directory & QR Identification
- High-contrast search bar with filter tags (Allergies, Village, Chronic Conditions).
- Patient cards with QR badge, blood group pill, and last visit date.
- Floating intake modal with voice-to-text notes and auto QR code generator.

Screen 2: AI Medical History Summarizer
- Side-by-side view: Raw clinical visit history vs. Gemini AI Structured Summary.
- Highlight cards with color coding:
  * Red: Critical Risks & Allergies
  * Amber: Chronic Conditions & Active Meds
  * Green: Suggested Clinical Next Steps

Screen 3: Multilingual Symptom Translator
- Large micro-button for rural speech recording.
- Source language picker (Hindi, Tamil, Telugu, Marathi, Bengali).
- Real-time text output: Direct translation + Structured Doctor Notes + Audio Playback.

Screen 4: Smart Prescription Generator & Pharmacovigilance
- Drug selection combobox with stock indicator.
- Live drug interaction banner (e.g. Warning: Metformin + Iodine Contrast hazard).
- One-click print/export digital prescription card with QR verification.

Screen 5: Medicine Inventory & Predictive Restock
- Stock gauge bars with low-stock warnings (< 7 days burn rate).
- Expiry risk timeline highlighting batches expiring within 30 days.
- One-click "Generate District Restock Requisition".

Screen 6: Emergency Red-Alert Mode
- Fullscreen high-priority alert card in bold medical crimson.
- Displays vital allergies, emergency phone dialer, active meds, and resuscitation steps.

Screen 7: Analytics & Disease Surveillance
- Stat cards: Daily Patients, Unsynced Queue Items, Stock Alerts.
- Disease prevalence breakdown chart & medicine burn trends.

Screen 8: Sync Center & Hackathon Judge Deck
- Queue status, cloud sync logs, and interactive 16-part pitch deck for hackathon reviewers.`,
  },
  {
    id: 7,
    title: "7. User Flow",
    category: "Workflow",
    content: `User Role: Accredited Social Health Activist (ASHA) / Auxiliary Nurse Midwife (ANM) / PHC Medical Officer

Step 1 [Patient Intake & ID]:
  - ANM opens app -> Scans patient's physical QR card or searches name -> Patient record loads in < 100ms.

Step 2 [Symptom Capture]:
  - Patient speaks in local language (e.g., Hindi/Tamil) -> ANM uses Multilingual Translator -> App converts speech to English clinical notes.

Step 3 [AI History Review]:
  - ANM taps "Summarize Medical History" -> App passes records to Gemini API (or Offline Rule Engine if offline) -> Displays allergy warnings & critical risks.

Step 4 [Prescription & Safety Check]:
  - Doctor adds medicines -> Sahayak AI checks for duplicate drugs and harmful interactions -> Displays safety clearance green badge.

Step 5 [Record Save & Offline Queueing]:
  - Record saved to device storage -> If network is down, added to Sync Queue with pending status -> When connection restores, background auto-sync pushes data to Cloud DB.`,
  },
  {
    id: 8,
    title: "8. AI Workflow Architecture",
    category: "AI Engine",
    content: `1. Input Ingestion Pipeline:
   - Text inputs or audio transcripts cleaned and normalized.
   - Context enriched with patient demographic, allergy list, and past visit objects.

2. Dual AI Execution Router:
   ├── IF Network == ONLINE:
   │     Calls server Express route -> Invokes Gemini 3.6 Flash via @google/genai SDK
   │     Strict JSON Schema enforcement via responseSchema parameter
   └── IF Network == OFFLINE:
         Routes to Edge Rule Engine
         Applies regex symptom parser, fuzzy drug interaction database, and statistical time-series burn rate math.

3. Output Sanitization & Caching:
   - Results cached in local storage per visit record ID.
   - Clinical warnings highlighted in high-contrast visual badges.`,
  },
  {
    id: 9,
    title: "9. Offline Synchronization Strategy",
    category: "Engineering",
    content: `Synchronization Architecture:
1. Eventual Consistency Model: Clinic operations (patient registration, visit logs, prescriptions) are treated as immutable append-only events locally.
2. Mutation Queue: Every offline edit creates an item in SyncQueue with a unique UUID, ISO timestamp, payload, and status.
3. Network Ping Listener: Automatically monitors window navigator.onLine and fires HTTP health pings to /api/health every 15 seconds.
4. Conflict Resolution Strategy: "Last-Write-Wins with Field-Level Merge":
   - Patient master records merge non-overlapping fields.
   - Visit records are append-only (guaranteeing zero data loss).
5. Queue Drainer: When back online, the app processes queued mutations in topological timestamp order, sending batch POST requests to /api/sync.`,
  },
  {
    id: 10,
    title: "10. Demo Script for Judges",
    category: "Pitch & Demo",
    content: `[0:00 - 0:30] The Problem Scene:
"Judges, imagine a primary health center in rural Sonipat. 20 patients waiting outside, no internet, paper records flying around, and an ANM nurse trying to treat a patient who speaks Tamil. Cloud-based AI bots are useless here. Enter Project Sahayak AI."

[0:30 - 1:15] Offline Capability & Medical History Summarization:
"Watch this: I turn on Offline Mode. I open Ramesh Kumar's profile. Sahayak AI instantly scans 3 years of notes and highlights in RED: Penicillin Allergy & Uncontrolled Diabetes. No internet needed!"

[1:15 - 2:00] Multilingual Voice & Smart Prescription Safety:
"Now, the patient speaks in Tamil about breathlessness. Sahayak AI translates it into English clinical notes. Next, when prescribing Paracetamol and Metformin, our offline pharmacovigilance engine checks for drug conflicts and duplicate medicines."

[2:00 - 2:30] Inventory Prediction & Emergency Mode:
"In our Inventory Assistant, AI predicts that ORS sachets will run out in 3 days due to monsoon usage. And with 1-click Emergency Mode, ambulance responders see life-critical allergy data instantly."

[2:30 - 3:00] Cloud Sync & Impact:
"When internet returns, Sahayak AI automatically syncs all offline records to the cloud with 100% data integrity. Sahayak AI empowers 1.3 million rural health workers across India and the Global South. Thank you!"`,
  },
  {
    id: 11,
    title: "11. Five Impressive Features for Demo",
    category: "Key Highlights",
    content: `1. Offline Edge AI Fallback: Works 100% seamlessly whether connected or completely offline with automatic sync queueing.
2. Multilingual Voice-to-Clinical Notes Translator: Converts patient regional speech (Hindi, Tamil, etc.) into structured doctor notes.
3. Pharmacovigilance Drug Interaction Engine: Live detection of duplicate active ingredients, allergy alerts, and adverse drug reactions.
4. AI Inventory Shortage & Expiry Predictor: Time-series calculation of daily burn rates warning of stockouts BEFORE they happen.
5. 1-Click Red Alert Emergency Summary: Renders instant critical allergy, blood group, and vital medication cards for urgent triage.`,
  },
  {
    id: 12,
    title: "12. 24-Hour Hackathon MVP Scope",
    category: "Execution Scope",
    content: `What We Built in 24 Hours:
✔ Full-Stack React + Express + Node.js Application
✔ Integrated Gemini 3.6 Flash Server-Side API Pipeline
✔ Offline-First LocalStorage / IndexedDB Sync Queue Architecture
✔ QR Code Generator & Scanner Simulation
✔ Multilingual Voice & Text Translation Interface
✔ Pharmacovigilance & Drug Interaction Safety Checker
✔ Predictive Inventory Burn Rate Engine
✔ 1-Click Red Alert Emergency Mode
✔ Real-time Cloud Synchronization Gateway`,
  },
  {
    id: 13,
    title: "13. Future Roadmap",
    category: "Roadmap",
    content: `Phase 1 (Months 1-3): Pilot rollout across 50 Primary Healthcare Centers in Haryana and Tamil Nadu with ABDM (Ayushman Bharat Digital Mission) Health ID integration.
Phase 2 (Months 4-6): On-device quantized SLM (Small Language Model e.g. Gemma 2B via WebGPU / ONNX Runtime) running directly inside rural tablets without any cloud roundtrips.
Phase 3 (Months 7-12): WhatsApp & SMS offline bot interface for rural patients to receive follow-up reminders in their native language.
Phase 4 (Year 2): Global South expansion (Sub-Saharan Africa, South Asia) partnering with WHO & UNICEF digital health initiatives.`,
  },
  {
    id: 14,
    title: "14. Judges' 3-Minute Presentation Pitch Script",
    category: "Pitch & Demo",
    content: `Hook:
"Over 60% of rural healthcare centers in developing nations operate with zero or intermittent internet. Today's cloud-dependent AI tools leave these frontline heroes stranded."

Solution:
"Project Sahayak AI is the world's first Offline-First AI Co-Pilot built specifically for primary health workers. It gives every village nurse the power of an expert clinical assistant in their pocket."

Technology Stack:
"Powered by React, Express, Gemini 3.6 Flash API when online, and a resilient offline rule & mutation queue engine when offline."

Call to Action:
"By bridging the rural connectivity gap with resilient AI, Project Sahayak AI brings UN SDG 3 - Good Health and Well-being to the last mile."`,
  },
  {
    id: 15,
    title: "15. Technical Innovations",
    category: "Innovation",
    content: `1. Hybrid Edge-Cloud AI Routing: Seamlessly switches between Gemini 3.6 Flash and local rule-based heuristic engines based on live connection health.
2. Zero-Loss Mutation Queueing: Sha256-hashed state sync queue that guarantees eventual consistency without duplication.
3. On-Device Pharmacovigilance Matrix: Local O(1) hash table lookup for high-risk drug interactions operating instantly in offline mode.
4. Voice-to-Structured Clinical Schema: Automated extraction of chief complaints, severity, and duration directly from informal regional conversations.`,
  },
  {
    id: 16,
    title: "16. Suggestions to Maximize Hackathon Score",
    category: "Hackathon Strategy",
    content: `1. High Impact Focus (UN SDG 3): Clearly demonstrate how Sahayak AI directly reduces maternal and child mortality in disconnected regions.
2. Show, Don't Tell Offline Mode: Live toggle the "Offline Mode" switch right in front of the judges to prove it works without internet!
3. Edge Case Handling: Demonstrate real-time drug interaction warning when prescribing conflicting meds.
4. Clear Architecture: Showcase the clean separation between Express API Gateway, Gemini SDK, LocalStorage, and Sync Queue.
5. High UI Polish: High-contrast, clean typography, intuitive pills, responsive layout, and dark/light accessible contrast.`,
  },
];
