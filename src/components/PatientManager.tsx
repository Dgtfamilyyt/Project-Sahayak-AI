import React, { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import jsQR from "jsqr";
import {
  Search,
  UserPlus,
  QrCode,
  Calendar,
  Phone,
  MapPin,
  AlertCircle,
  Plus,
  Clock,
  Heart,
  Activity,
  ChevronRight,
  FileText,
  CheckCircle2,
  X,
  Sparkles,
  Printer,
  Copy,
  Check,
  Scan,
  Camera,
  RefreshCw,
  ShieldCheck,
  Download,
  Upload,
} from "lucide-react";
import { Patient, VisitRecord } from "../types";
import { generateVisitSummaryPdf, exportElementToPdf } from "../utils/pdfExport";

interface PatientManagerProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onAddVisit: (patientId: string, visit: VisitRecord) => void;
  onSelectPatientForSummary: (patient: Patient) => void;
  onSelectPatientForPrescription: (patient: Patient) => void;
}

export const PatientManager: React.FC<PatientManagerProps> = ({
  patients,
  onAddPatient,
  onAddVisit,
  onSelectPatientForSummary,
  onSelectPatientForPrescription,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalTab, setQrModalTab] = useState<"card" | "scan">("card");

  // PDF Export & Print Configuration States
  const [includeEmergencyContact, setIncludeEmergencyContact] = useState(true);
  const [showPrintConfigModal, setShowPrintConfigModal] = useState(false);
  const [activeExportVisit, setActiveExportVisit] = useState<VisitRecord | undefined>(undefined);

  // QR Code Scanner / ID States
  const [scanQuery, setScanQuery] = useState("");
  const [scanSuccessToast, setScanSuccessToast] = useState<string | null>(null);
  const [copiedQr, setCopiedQr] = useState(false);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // New Patient Form State
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<Patient["gender"]>("Female");
  const [village, setVillage] = useState("Rampur");
  const [district, setDistrict] = useState("Sonipat, Haryana");
  const [phone, setPhone] = useState("+91 98000 12345");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [allergiesInput, setAllergiesInput] = useState("Penicillin");
  const [chronicInput, setChronicInput] = useState("Hypertension");

  // New Visit Form State
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [bpSystolic, setBpSystolic] = useState(120);
  const [bpDiastolic, setBpDiastolic] = useState(80);
  const [pulse, setPulse] = useState(76);
  const [temp, setTemp] = useState(98.6);
  const [spO2, setSpO2] = useState(98);

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.knownAllergies.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.chronicDiseases.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPatientQrPayload = (patient: Patient) => {
    return JSON.stringify({
      system: "SahayakAI-EMR",
      id: patient.id,
      qrCodeId: patient.qrCodeId,
      fullName: patient.fullName,
      village: patient.village,
      bloodGroup: patient.bloodGroup,
      emergencyContactPhone: patient.emergencyContactPhone,
    });
  };

  const handlePerformScan = (query: string) => {
    if (!query.trim()) return;
    const match = patients.find(
      (p) =>
        p.id.toLowerCase() === query.trim().toLowerCase() ||
        p.qrCodeId.toLowerCase() === query.trim().toLowerCase() ||
        p.fullName.toLowerCase().includes(query.trim().toLowerCase()) ||
        query.includes(p.id) ||
        query.includes(p.qrCodeId)
    );

    if (match) {
      setSelectedPatient(match);
      setShowQrModal(false);
      setIsLiveCameraActive(false);
      setScanQuery("");
      setScanSuccessToast(`Patient Identified via Unique QR Scan: ${match.fullName} (${match.id})`);
      setTimeout(() => setScanSuccessToast(null), 5000);
    } else {
      alert(`No matching patient record found for QR query: "${query}"`);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            try {
              const parsed = JSON.parse(code.data);
              handlePerformScan(parsed.id || code.data);
            } catch {
              handlePerformScan(code.data);
            }
          } else {
            alert("No valid QR code detected in the uploaded image file. Try another photo.");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Live Camera Scanning Loop with jsQR
  useEffect(() => {
    if (!showQrModal || qrModalTab !== "scan" || !isLiveCameraActive) return;
    let animId: number;
    let activeStream: MediaStream | null = null;
    setCameraError(false);

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        const scanFrame = () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const canvas = canvasRef.current || document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height);
              if (code && code.data) {
                try {
                  const parsed = JSON.parse(code.data);
                  handlePerformScan(parsed.id || code.data);
                } catch {
                  handlePerformScan(code.data);
                }
                return;
              }
            }
          }
          animId = requestAnimationFrame(scanFrame);
        };

        animId = requestAnimationFrame(scanFrame);
      })
      .catch((err) => {
        console.warn("Camera permissions or device not found:", err);
        setCameraError(true);
        setIsLiveCameraActive(false);
      });

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showQrModal, qrModalTab, isLiveCameraActive]);

  const handleCopyQrCode = (patient: Patient) => {
    navigator.clipboard.writeText(patient.qrCodeId || patient.id);
    setCopiedQr(true);
    setTimeout(() => setCopiedQr(false), 2000);
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    const newId = `SHK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatient: Patient = {
      id: newId,
      qrCodeId: `QR-${newId}-${fullName.split(" ")[0].toUpperCase()}`,
      fullName,
      age: Number(age),
      gender,
      primaryLanguage: "Hindi",
      phone,
      village,
      district,
      bloodGroup,
      emergencyContactName: "Relative",
      emergencyContactPhone: phone,
      knownAllergies: allergiesInput.split(",").map((s) => s.trim()).filter(Boolean),
      chronicDiseases: chronicInput.split(",").map((s) => s.trim()).filter(Boolean),
      activeMedications: [],
      visits: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedToCloud: false,
    };

    onAddPatient(newPatient);
    setSelectedPatient(newPatient);
    setIsNewPatientModalOpen(false);
    setFullName("");
  };

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !chiefComplaint) return;

    const uniqueVisitId = `VIS-${selectedPatient.id.split("-")[2] || "1000"}-${selectedPatient.visits.length + 1}-${Date.now().toString(36)}`;

    const newVisit: VisitRecord = {
      id: uniqueVisitId,
      patientId: selectedPatient.id,
      date: new Date().toISOString().split("T")[0],
      chiefComplaint,
      clinicalNotes,
      vitals: {
        bloodPressureSystolic: Number(bpSystolic),
        bloodPressureDiastolic: Number(bpDiastolic),
        heartRate: Number(pulse),
        temperature: Number(temp),
        spO2: Number(spO2),
        weightKg: 65,
        recordedAt: new Date().toISOString(),
      },
      diagnosis: ["General Consultation"],
      prescribedMedications: [],
      followUpDays: 7,
      attendedByWorker: "ANM Worker (Rural Health Center)",
      syncedToCloud: false,
    };

    onAddVisit(selectedPatient.id, newVisit);
    setIsNewVisitModalOpen(false);
    setChiefComplaint("");
    setClinicalNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Scan Toast Alert */}
      {scanSuccessToast && (
        <div className="bg-teal-600 text-white p-3.5 rounded-2xl font-bold text-xs flex items-center justify-between shadow-md animate-fade-in border border-teal-500">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-teal-200" />
            <span>{scanSuccessToast}</span>
          </div>
          <button onClick={() => setScanSuccessToast(null)} className="text-teal-200 hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Banner / Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient by name, ID (e.g. SHK-1001), village, allergy, or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setQrModalTab("scan");
              setShowQrModal(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
          >
            <QrCode className="h-4 w-4 text-teal-600" />
            <span>Rapid QR Scanner</span>
          </button>

          <button
            onClick={() => setIsNewPatientModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>New Patient Intake</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Patient Directory + Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Directory List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[650px] no-print">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registered Patients ({filteredPatients.length})
            </span>
            <span className="text-xs text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">Offline DB</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No matching records found.</div>
            ) : (
              filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-teal-50/80 border-teal-500/60 shadow-xs"
                        : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 text-sm">{p.fullName}</h4>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {p.gender.charAt(0)}, {p.age}y
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">{p.id}</p>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {p.bloodGroup}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{p.village}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{p.visits.length} Visits</span>
                      </div>
                    </div>

                    {/* Allergies Badge */}
                    {p.knownAllergies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.knownAllergies.map((alg, i) => (
                          <span key={i} className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
                            Allergy: {alg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Patient File & Timeline (8 cols) */}
        <div className="lg:col-span-8 print:col-span-12 print:w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-xs min-h-[650px] flex flex-col justify-between">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
                <div className="flex items-start space-x-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#1A365D] text-teal-300 flex items-center justify-center text-xl font-bold shadow-md">
                    {selectedPatient.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-xl font-extrabold text-slate-900">{selectedPatient.fullName}</h2>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {selectedPatient.id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                      <span>{selectedPatient.gender}, {selectedPatient.age} Years</span>
                      <span>•</span>
                      <span>Blood: <strong className="text-rose-600">{selectedPatient.bloodGroup}</strong></span>
                      <span>•</span>
                      <span>Lang: {selectedPatient.primaryLanguage}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-teal-600" />
                      <span>{selectedPatient.village}, {selectedPatient.district}</span>
                    </p>
                  </div>
                </div>

                {/* Quick AI & EMR Actions */}
                <div className="flex flex-wrap items-center gap-2 no-print">
                  <button
                    onClick={() => {
                      setQrModalTab("card");
                      setShowQrModal(true);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer"
                  >
                    <QrCode className="h-4 w-4 text-teal-600" />
                    <span>QR Health Card</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveExportVisit(undefined);
                      setShowPrintConfigModal(true);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-slate-600" />
                    <span>Export EMR PDF</span>
                  </button>

                  <button
                    onClick={() => onSelectPatientForSummary(selectedPatient)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>AI Summarize History</span>
                  </button>

                  <button
                    onClick={() => onSelectPatientForPrescription(selectedPatient)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1A365D] text-white hover:bg-[#132A4B] transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4 text-teal-300" />
                    <span>Prescribe</span>
                  </button>
                </div>
              </div>

              {/* Patient Flags & Conditions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Allergies Card */}
                <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
                  <div className="flex items-center space-x-1.5 text-rose-800 font-bold text-xs mb-1.5">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span>Known Allergies ({selectedPatient.knownAllergies.length})</span>
                  </div>
                  {selectedPatient.knownAllergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.knownAllergies.map((a, i) => (
                        <span key={i} className="text-xs font-bold px-2 py-0.5 rounded bg-rose-200/80 text-rose-900">
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-rose-600/80 italic">No allergies recorded</p>
                  )}
                </div>

                {/* Chronic Diseases */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-xs mb-1.5">
                    <Heart className="h-4 w-4 text-amber-600" />
                    <span>Chronic Conditions ({selectedPatient.chronicDiseases.length})</span>
                  </div>
                  {selectedPatient.chronicDiseases.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.chronicDiseases.map((c, i) => (
                        <span key={i} className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600/80 italic">No chronic conditions</p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
                      <Phone className="h-4 w-4 text-slate-600" />
                      <span>Emergency Contact</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIncludeEmergencyContact(!includeEmergencyContact)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center space-x-1 ${
                        includeEmergencyContact
                          ? "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100"
                          : "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300"
                      }`}
                      title="Toggle whether emergency contact details appear in PDF/Print outputs"
                    >
                      <span>PDF/Print:</span>
                      <span className={includeEmergencyContact ? "text-teal-700 font-extrabold" : "text-slate-500 font-extrabold"}>
                        {includeEmergencyContact ? "Included ✓" : "Excluded ✗"}
                      </span>
                    </button>
                  </div>

                  <p className={`text-xs font-bold text-slate-900 ${!includeEmergencyContact ? "no-print opacity-60" : ""}`}>
                    {selectedPatient.emergencyContactName}
                  </p>
                  <p className={`text-xs font-mono text-slate-600 ${!includeEmergencyContact ? "no-print opacity-60" : ""}`}>
                    {selectedPatient.emergencyContactPhone}
                  </p>
                  {!includeEmergencyContact && (
                    <p className="text-[10px] text-amber-700 font-semibold italic mt-1 no-print">
                      🔒 Excluded from PDF export & printouts
                    </p>
                  )}
                </div>
              </div>

              {/* Visit History Timeline */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <span>Clinical Visit Timeline ({selectedPatient.visits.length})</span>
                  </h3>

                  <button
                    onClick={() => setIsNewVisitModalOpen(true)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Clinical Visit</span>
                  </button>
                </div>

                {selectedPatient.visits.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs">
                    No visit history recorded yet. Tap "Log Clinical Visit" to add notes and vitals.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedPatient.visits.map((visit, idx) => (
                      <div key={`${visit.id || "vis"}-${idx}`} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                              {visit.date}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">by {visit.attendedByWorker}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setActiveExportVisit(visit);
                                setShowPrintConfigModal(true);
                              }}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                              title="Configure & Download Visit PDF Report"
                            >
                              <Download className="h-3.5 w-3.5 text-teal-600" />
                              <span>Visit PDF</span>
                            </button>

                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                              {visit.syncedToCloud ? "Synced to Cloud" : "Offline Queued"}
                            </span>
                          </div>
                        </div>

                        {/* Complaint & Notes */}
                        <div>
                          <p className="text-xs font-bold text-slate-800">Chief Complaint:</p>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">{visit.chiefComplaint}</p>
                        </div>

                        {visit.clinicalNotes && (
                          <div className="p-2.5 rounded-lg bg-white border border-slate-100 text-xs text-slate-700 leading-relaxed">
                            <strong className="text-slate-900">Clinical Notes: </strong>
                            {visit.clinicalNotes}
                          </div>
                        )}

                        {/* Vitals Ribbon */}
                        <div className="flex flex-wrap items-center gap-3 text-xs bg-white p-2.5 rounded-lg border border-slate-200/80">
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3.5 w-3.5 text-rose-500" />
                            <span className="text-slate-500">BP:</span>
                            <strong className="text-slate-900">{visit.vitals.bloodPressureSystolic}/{visit.vitals.bloodPressureDiastolic} mmHg</strong>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3.5 w-3.5 text-rose-500" />
                            <span className="text-slate-500">Pulse:</span>
                            <strong className="text-slate-900">{visit.vitals.heartRate} bpm</strong>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-500">Temp:</span>
                            <strong className="text-slate-900">{visit.vitals.temperature}°F</strong>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-500">SpO2:</span>
                            <strong className="text-slate-900">{visit.vitals.spO2}%</strong>
                          </div>
                        </div>

                        {/* Prescribed Meds */}
                        {visit.prescribedMedications.length > 0 && (
                          <div>
                            <span className="text-xs font-bold text-slate-700">Prescribed: </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {visit.prescribedMedications.map((m, idx) => (
                                <span key={idx} className="text-xs font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                                  {m.medicineName} {m.dosage} ({m.frequency})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
              Select a patient from the list or register a new patient.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: New Patient Intake */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                <span>New Patient Registration (Offline-First)</span>
              </h3>
              <button onClick={() => setIsNewPatientModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Devi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-bold text-rose-700"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-rose-700 mb-1">Known Allergies (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, Aspirin"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-rose-200 bg-rose-50/50 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-800 mb-1">Chronic Diseases (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Type 2 Diabetes, Asthma, Hypertension"
                  value={chronicInput}
                  onChange={(e) => setChronicInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-amber-50/50 text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewPatientModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Log Clinical Visit */}
      {isNewVisitModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                Log Clinical Visit: {selectedPatient.fullName}
              </h3>
              <button onClick={() => setIsNewVisitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVisit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High fever for 2 days, body ache, productive cough"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Notes & Observations</label>
                <textarea
                  rows={3}
                  placeholder="Clinical examination findings, chest auscultation, rapid diagnostic test results..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              {/* Vitals Grid */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-xs block">Recorded Vitals</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500">BP Sys/Dia</label>
                    <div className="flex items-center space-x-1">
                      <input type="number" value={bpSystolic} onChange={(e) => setBpSystolic(Number(e.target.value))} className="w-12 px-1 py-1 rounded border text-xs text-center" />
                      <span>/</span>
                      <input type="number" value={bpDiastolic} onChange={(e) => setBpDiastolic(Number(e.target.value))} className="w-12 px-1 py-1 rounded border text-xs text-center" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Pulse (bpm)</label>
                    <input type="number" value={pulse} onChange={(e) => setPulse(Number(e.target.value))} className="w-full px-2 py-1 rounded border text-xs text-center" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Temp (°F)</label>
                    <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full px-2 py-1 rounded border text-xs text-center" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">SpO2 (%)</label>
                    <input type="number" value={spO2} onChange={(e) => setSpO2(Number(e.target.value))} className="w-full px-2 py-1 rounded border text-xs text-center" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewVisitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  Save Visit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QR Health ID Card & Rapid Scanner Studio */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            {/* Modal Header & Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <QrCode className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Patient Digital QR Studio</h3>
                  <p className="text-[11px] text-slate-500">Unique Health ID & Rapid EMR Scanner</p>
                </div>
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setQrModalTab("card")}
                className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  qrModalTab === "card"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-teal-600" />
                <span>QR Health Card</span>
              </button>

              <button
                onClick={() => setQrModalTab("scan")}
                className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  qrModalTab === "scan"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Scan className="h-3.5 w-3.5 text-teal-600" />
                <span>Rapid QR Scanner</span>
              </button>
            </div>

            {/* TAB 1: Digital Health ID Card */}
            {qrModalTab === "card" && (
              <div className="space-y-4">
                {/* Patient Selector for Card view */}
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-500 font-semibold">Selected Profile:</span>
                  <select
                    value={selectedPatient?.id || ""}
                    onChange={(e) => {
                      const found = patients.find((p) => p.id === e.target.value);
                      if (found) setSelectedPatient(found);
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.id})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPatient ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1A365D] to-[#0F2342] text-white space-y-4 shadow-lg border border-slate-700 relative overflow-hidden print:p-0">
                    {/* Background Emblem Watermark */}
                    <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-white">
                      <ShieldCheck className="h-44 w-44" />
                    </div>

                    {/* Card Top Header */}
                    <div className="flex items-start justify-between border-b border-slate-700/80 pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 block">
                          NATIONAL HEALTH AUTHORITY
                        </span>
                        <h4 className="text-xs font-bold text-slate-200">Sahayak Digital EMR Health Pass</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                        OFFICIAL ID
                      </span>
                    </div>

                    {/* Card Body: QR SVG + Details */}
                    <div className="flex items-center space-x-4">
                      {/* High Resolution SVG QR Code */}
                      <div className="p-2.5 bg-white rounded-xl shadow-md border border-slate-200 shrink-0">
                        <QRCodeSVG
                          value={getPatientQrPayload(selectedPatient)}
                          size={110}
                          level="H"
                          includeMargin={false}
                          fgColor="#1A365D"
                        />
                      </div>

                      {/* Patient Key Information */}
                      <div className="space-y-1 min-w-0 flex-1 text-xs">
                        <h3 className="font-black text-white text-base truncate">{selectedPatient.fullName}</h3>
                        <p className="font-mono text-xs font-extrabold text-teal-300">{selectedPatient.id}</p>
                        <p className="text-[11px] text-slate-300 truncate">
                          {selectedPatient.gender}, {selectedPatient.age} yrs • <strong className="text-amber-300">{selectedPatient.bloodGroup}</strong>
                        </p>
                        <p className="text-[11px] text-slate-300 truncate">
                          Village: {selectedPatient.village}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          Emergency: {selectedPatient.emergencyContactPhone}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[10px] text-slate-300">
                      <span>Unique QR Payload: <strong className="font-mono text-teal-300">{selectedPatient.qrCodeId}</strong></span>
                      <span className="text-teal-300 font-bold">Offline Verified ✓</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">Select a patient to generate their unique QR card.</p>
                )}

                {/* Actions Row */}
                {selectedPatient && (
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => handleCopyQrCode(selectedPatient)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-slate-200"
                    >
                      {copiedQr ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-600" />}
                      <span>{copiedQr ? "Copied ID!" : "Copy QR ID"}</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#1A365D] text-white font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-[#132A4B] transition-colors cursor-pointer shadow-xs"
                    >
                      <Printer className="h-4 w-4 text-teal-300" />
                      <span>Print Health Card</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Rapid QR Scanner */}
            {qrModalTab === "scan" && (
              <div className="space-y-4">
                {/* Camera View Box */}
                <div className="relative rounded-2xl bg-slate-950 p-4 border-2 border-slate-800 text-center space-y-3 overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span className="flex items-center space-x-1.5">
                      <Camera className="h-4 w-4 text-teal-400" />
                      <span>Scanner Stream</span>
                    </span>

                    <button
                      onClick={() => setIsLiveCameraActive(!isLiveCameraActive)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isLiveCameraActive
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30"
                      }`}
                    >
                      {isLiveCameraActive ? "Stop Camera" : "Enable Camera Feed"}
                    </button>
                  </div>

                  {/* Video Viewport or Scanning Animation */}
                  <div className="relative h-44 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-2 overflow-hidden">
                    {/* Hidden Canvas for Frame Decoding */}
                    <canvas ref={canvasRef} className="hidden" />

                    {isLiveCameraActive ? (
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                        <Scan className="h-10 w-10 text-slate-600 animate-pulse" />
                        <p className="text-xs text-slate-300 font-medium">Camera is currently paused</p>
                        <p className="text-[10px] text-slate-500 max-w-xs">
                          Click "Enable Camera Feed" to use your device webcam, or upload a QR image below.
                        </p>
                      </div>
                    )}

                    {/* Scanning Laser Overlay when camera or scan active */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_10px_#2dd4bf] animate-bounce top-1/3 pointer-events-none"></div>

                    {/* Corner Reticles */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-teal-400 pointer-events-none"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-teal-400 pointer-events-none"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-teal-400 pointer-events-none"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-teal-400 pointer-events-none"></div>
                  </div>

                  {cameraError && (
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 text-left">
                      💡 <strong>Camera Notice:</strong> Webcam access unavailable or blocked in iframe. You can upload a QR image photo or select a registered profile below!
                    </div>
                  )}

                  {/* Alternative Scanner Controls: File Upload & String Search */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-xs text-slate-300 hover:text-white font-bold cursor-pointer transition-colors">
                      <Upload className="h-4 w-4 text-teal-400" />
                      <span>Upload QR Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="flex space-x-1">
                      <input
                        type="text"
                        placeholder="Scan string/ID..."
                        value={scanQuery}
                        onChange={(e) => setScanQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handlePerformScan(scanQuery);
                        }}
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                      />
                      <button
                        onClick={() => handlePerformScan(scanQuery)}
                        className="px-3 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors cursor-pointer shrink-0"
                      >
                        Find
                      </button>
                    </div>
                  </div>
                </div>

                {/* One-Click Rapid Simulation Shortcuts */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    One-Click Test Scan Simulation (Registered Patients)
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {patients.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePerformScan(p.id)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-left flex items-center justify-between transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2">
                          <QrCode className="h-4 w-4 text-teal-600 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{p.fullName}</p>
                            <p className="text-[10px] font-mono text-slate-500">{p.id} • {p.village}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                          Simulate Scan
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Close CTA */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close QR Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF & Print Flow Privacy Configuration Modal */}
      {showPrintConfigModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">PDF & Print Configuration</h3>
                  <p className="text-xs text-slate-500">Configure layout privacy prior to exporting</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Target Summary Info */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">Target Patient: {selectedPatient.fullName} ({selectedPatient.id})</p>
                <p className="text-slate-600">
                  Document Scope: {activeExportVisit ? `Clinical Visit Record (${activeExportVisit.date})` : `Full EMR History (${selectedPatient.visits.length} Visits)`}
                </p>
              </div>

              {/* Privacy Toggle Switch */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeEmergencyContact}
                      onChange={(e) => setIncludeEmergencyContact(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-900">Include Emergency Contact Details</span>
                  </label>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    includeEmergencyContact ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                  }`}>
                    {includeEmergencyContact ? "Included" : "Excluded"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pl-6">
                  When enabled, emergency contact details (<strong>{selectedPatient.emergencyContactName}</strong> - {selectedPatient.emergencyContactPhone}) will be printed on the output PDF. Turn off to protect contact privacy when sharing reports with third parties.
                </p>
              </div>

              {/* Privacy Status Banner */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-2 text-[11px] text-amber-900">
                <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {includeEmergencyContact
                    ? "Emergency contact info will be visibly printed on the document."
                    : "Emergency contact info will be replaced with '[Excluded in Privacy Config]' in the PDF."}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowPrintConfigModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  generateVisitSummaryPdf(selectedPatient, activeExportVisit, { includeEmergencyContact });
                  setShowPrintConfigModal(false);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Generate PDF</span>
              </button>

              <button
                onClick={() => {
                  setShowPrintConfigModal(false);
                  window.print();
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1A365D] text-white hover:bg-[#132A4B] transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4 text-teal-300" />
                <span>Print Direct</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
