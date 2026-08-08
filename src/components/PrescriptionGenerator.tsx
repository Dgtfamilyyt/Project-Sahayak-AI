import React, { useState } from "react";
import {
  Pill,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Calendar,
  AlertTriangle,
  QrCode,
  Sparkles,
  WifiOff,
  Download,
} from "lucide-react";
import { Patient, InventoryItem, PrescribedDrug, NetworkMode, PrescriptionCheckResult } from "../types";
import { offlineDrugInteractionChecker } from "../utils/offlineStorage";
import { generatePrescriptionPdf, exportElementToPdf } from "../utils/pdfExport";

interface PrescriptionGeneratorProps {
  patients: Patient[];
  inventory: InventoryItem[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  networkMode: NetworkMode;
  onSavePrescriptionToPatient: (patientId: string, drugs: PrescribedDrug[]) => void;
}

export const PrescriptionGenerator: React.FC<PrescriptionGeneratorProps> = ({
  patients,
  inventory,
  selectedPatient,
  onSelectPatient,
  networkMode,
  onSavePrescriptionToPatient,
}) => {
  const [prescribedList, setPrescribedList] = useState<PrescribedDrug[]>([
    {
      medicineId: "MED-001",
      medicineName: "Paracetamol 650mg",
      dosage: "650mg",
      frequency: "1-1-1 after food",
      durationDays: 5,
    },
    {
      medicineId: "MED-003",
      medicineName: "Metformin ER 500mg",
      dosage: "500mg",
      frequency: "1-0-1 after food",
      durationDays: 30,
    },
  ]);

  const [selectedMedId, setSelectedMedId] = useState(inventory[0]?.id || "");
  const [dosageInput, setDosageInput] = useState("500mg");
  const [frequencyInput, setFrequencyInput] = useState("1-0-1");
  const [durationInput, setDurationInput] = useState(7);

  const [isChecking, setIsChecking] = useState(false);
  const [safetyAnalysis, setSafetyAnalysis] = useState<PrescriptionCheckResult | null>(null);
  const [isFallbackUsed, setIsFallbackUsed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isOnline = networkMode === "online";

  const handleAddMedication = () => {
    const medObj = inventory.find((m) => m.id === selectedMedId);
    if (!medObj) return;

    const newItem: PrescribedDrug = {
      medicineId: medObj.id,
      medicineName: medObj.name,
      dosage: dosageInput || "1 tablet",
      frequency: frequencyInput || "1-0-1 after food",
      durationDays: Number(durationInput) || 5,
    };

    setPrescribedList((prev) => [...prev, newItem]);
    setIsSaved(false);
  };

  const handleRemoveMedication = (index: number) => {
    setPrescribedList((prev) => prev.filter((_, i) => i !== index));
    setIsSaved(false);
  };

  const handleRunSafetyCheck = async () => {
    if (!selectedPatient) return;
    setIsChecking(true);

    if (!isOnline) {
      setTimeout(() => {
        const offRes = offlineDrugInteractionChecker(prescribedList, selectedPatient.knownAllergies);
        setSafetyAnalysis(offRes);
        setIsFallbackUsed(true);
        setIsChecking(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch("/api/ai/prescription-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medications: prescribedList,
          patientAllergies: selectedPatient.knownAllergies,
          chronicConditions: selectedPatient.chronicDiseases,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setSafetyAnalysis(data.analysis);
        setIsFallbackUsed(data.isFallback);
      } else {
        const offRes = offlineDrugInteractionChecker(prescribedList, selectedPatient.knownAllergies);
        setSafetyAnalysis(offRes);
        setIsFallbackUsed(true);
      }
    } catch (err) {
      const offRes = offlineDrugInteractionChecker(prescribedList, selectedPatient.knownAllergies);
      setSafetyAnalysis(offRes);
      setIsFallbackUsed(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSavePrescription = () => {
    if (!selectedPatient || prescribedList.length === 0) return;
    onSavePrescriptionToPatient(selectedPatient.id, prescribedList);
    setIsSaved(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold border border-teal-200">
            <Pill className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Smart Prescription & Pharmacovigilance Generator</h2>
            <p className="text-xs text-slate-500">
              Generates digital prescriptions while checking for duplicate drugs, allergies, and adverse interactions.
            </p>
          </div>
        </div>

        {/* Patient Selection */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-bold text-slate-600">Patient:</label>
          <select
            value={selectedPatient?.id || ""}
            onChange={(e) => {
              const p = patients.find((pat) => pat.id === e.target.value);
              if (p) onSelectPatient(p);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-teal-500/20"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Builder + Live Safety Auditor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prescription Builder Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 no-print">
          <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Add Medication to Prescription
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Medicine from Inventory</label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
              >
                {inventory.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.genericName}) - Stock: {m.currentStock} {m.unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dosage</label>
                <input
                  type="text"
                  value={dosageInput}
                  onChange={(e) => setDosageInput(e.target.value)}
                  placeholder="500mg"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                <input
                  type="text"
                  value={frequencyInput}
                  onChange={(e) => setFrequencyInput(e.target.value)}
                  placeholder="1-0-1"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Days</label>
                <input
                  type="number"
                  value={durationInput}
                  onChange={(e) => setDurationInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>

            <button
              onClick={handleAddMedication}
              className="w-full py-2.5 rounded-xl bg-[#1A365D] text-white font-bold text-xs hover:bg-[#132A4B] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-teal-300" />
              <span>Add Drug to List</span>
            </button>
          </div>

          {/* List of Added Medications */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Current Medication List ({prescribedList.length})
            </span>

            {prescribedList.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No drugs added yet.</p>
            ) : (
              <div className="space-y-2">
                {prescribedList.map((med, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{med.medicineName}</p>
                      <p className="text-[11px] text-slate-500">
                        {med.dosage} • {med.frequency} • {med.durationDays} Days
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveMedication(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleRunSafetyCheck}
            disabled={isChecking || prescribedList.length === 0}
            className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>{isChecking ? "Auditing Drug Conflicts..." : "Run AI Pharmacovigilance Audit"}</span>
          </button>
        </div>

        {/* Right Column: Prescription Slip Preview & Pharmacovigilance Output (7 cols) */}
        <div className="lg:col-span-7 space-y-5 print:col-span-12 print:w-full">
          {/* Pharmacovigilance Safety Audit Panel */}
          {safetyAnalysis && (
            <div className={`p-4 rounded-2xl border shadow-xs space-y-3 no-print ${
              safetyAnalysis.hasWarnings ? "bg-rose-50 border-rose-300" : "bg-teal-50 border-teal-300"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className={`h-5 w-5 ${safetyAnalysis.hasWarnings ? "text-rose-600" : "text-teal-600"}`} />
                  <h4 className={`font-extrabold text-xs ${safetyAnalysis.hasWarnings ? "text-rose-900" : "text-teal-900"}`}>
                    {safetyAnalysis.hasWarnings ? "Pharmacovigilance Alert: Risks Detected!" : "Safety Clearance: No Harmful Drug Conflicts Detected"}
                  </h4>
                </div>

                {isFallbackUsed && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                    <WifiOff className="h-3 w-3" />
                    <span>Offline Drug Rules</span>
                  </span>
                )}
              </div>

              {/* Allergy Alerts */}
              {safetyAnalysis.allergyAlerts.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-200/80 text-rose-950 text-xs font-bold space-y-1">
                  <span>🚨 ALLERGY ALERT:</span>
                  {safetyAnalysis.allergyAlerts.map((a, i) => (
                    <p key={i}>• {a}</p>
                  ))}
                </div>
              )}

              {/* Drug Interactions */}
              {safetyAnalysis.drugInteractions.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-rose-900">Drug-Drug Interactions:</span>
                  {safetyAnalysis.drugInteractions.map((inter, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-rose-100 text-rose-900 font-medium">
                      <strong className="uppercase">{inter.severity}: </strong> {inter.drugs} — {inter.description}
                    </div>
                  ))}
                </div>
              )}

              {/* Dosage Guidelines */}
              {safetyAnalysis.dosageGuidance.length > 0 && (
                <div className="text-xs text-slate-800 space-y-1">
                  <span className="font-bold text-slate-900">Dosage & Timing Instructions:</span>
                  <ul className="list-disc list-inside text-slate-700">
                    {safetyAnalysis.dosageGuidance.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Printable Official Prescription Card */}
          {selectedPatient && (
            <div id="prescription-slip-card" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 print:p-0 print:border-none print:shadow-none">
              {/* Prescription Header */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-[#1A365D]">
                <div>
                  <h3 className="text-base font-extrabold text-[#1A365D] uppercase tracking-tight">
                    Primary Healthcare Centre (PHC Rampur)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Department of Health & Family Welfare, Govt. of Haryana</p>
                  <p className="text-[11px] text-slate-400">Medical Officer: Dr. A. K. Singh (M.B.B.S, M.D)</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-teal-700">Rx-SAHAYAK-{Date.now().toString().slice(-6)}</span>
                  <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Patient Info Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Patient Name</span>
                  <strong className="text-slate-900">{selectedPatient.fullName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Age / Gender</span>
                  <strong className="text-slate-900">{selectedPatient.age}y / {selectedPatient.gender}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Blood / Allergy</span>
                  <strong className="text-rose-700">{selectedPatient.bloodGroup} / {selectedPatient.knownAllergies.join(", ") || "None"}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Location</span>
                  <strong className="text-slate-900">{selectedPatient.village}</strong>
                </div>
              </div>

              {/* Rx Prescribed Medicines Table */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1 text-[#1A365D] font-extrabold text-sm">
                  <span className="text-xl">℞</span>
                  <span>Prescribed Medications</span>
                </div>

                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                      <th className="py-2">Medicine Name</th>
                      <th className="py-2">Dosage</th>
                      <th className="py-2">Frequency</th>
                      <th className="py-2 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {prescribedList.map((m, i) => (
                      <tr key={i} className="text-slate-800">
                        <td className="py-2.5 font-bold">{m.medicineName}</td>
                        <td className="py-2.5">{m.dosage}</td>
                        <td className="py-2.5">{m.frequency}</td>
                        <td className="py-2.5 text-right font-bold">{m.durationDays} Days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Follow-Up & Doctor Signature */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  <span>Follow-Up Visit Recommended in: <strong className="text-slate-900 font-bold">14 Days</strong></span>
                </div>

                <div className="text-center sm:text-right space-y-1">
                  <div className="h-8 border-b border-slate-400 w-32 inline-block"></div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold block">Authorized Digital Signature</p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 print:hidden flex-wrap gap-2">
                <button
                  onClick={handleSavePrescription}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isSaved ? "Saved to Patient Timeline ✓" : "Save Prescription to EMR"}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => generatePrescriptionPdf(selectedPatient, prescribedList)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-slate-600" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1A365D] text-white hover:bg-[#132A4B] transition-colors cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-teal-300" />
                    <span>Print Prescription Slip</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
