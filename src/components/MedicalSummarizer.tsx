import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  AlertTriangle,
  Heart,
  Pill,
  CheckCircle2,
  Volume2,
  VolumeX,
  WifiOff,
  User,
  Clock,
  RefreshCw,
  Printer,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { Patient, NetworkMode, AISummaryResult } from "../types";
import { offlineMedicalSummarizer } from "../utils/offlineStorage";
import { generateMedicalSummaryPdf } from "../utils/pdfExport";
import { speakText, stopSpeaking } from "../utils/voiceUtils";

interface MedicalSummarizerProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  networkMode: NetworkMode;
}

export const MedicalSummarizer: React.FC<MedicalSummarizerProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  networkMode,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<AISummaryResult | null>(
    selectedPatient?.visits[0]?.aiSummaryCache || null
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFallbackUsed, setIsFallbackUsed] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const isOnline = networkMode === "online";

  const handleCopySummary = () => {
    if (!summaryResult || !selectedPatient) return;
    const textToCopy = `AI Medical History Summary - ${selectedPatient.fullName} (${selectedPatient.id})
Age/Gender: ${selectedPatient.age}y / ${selectedPatient.gender} | Blood: ${selectedPatient.bloodGroup} | Village: ${selectedPatient.village}
--------------------------------------------------
Synthesis: ${summaryResult.conciseSummary}
Allergies: ${summaryResult.allergies.join(", ") || "None"}
Chronic Conditions: ${summaryResult.chronicDiseases.join(", ") || "None"}
Critical Risks: ${summaryResult.criticalRisks.join(" | ")}
Suggested Actions: ${summaryResult.suggestedClinicalActions.join(" | ")}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleGenerateSummary = async () => {
    if (!selectedPatient) return;
    setIsLoading(true);

    const latestNotes = selectedPatient.visits.map((v) => `${v.date}: ${v.chiefComplaint}. ${v.clinicalNotes}`).join(" | ");

    if (!isOnline) {
      // Offline Mode Fallback
      setTimeout(() => {
        const result = offlineMedicalSummarizer(selectedPatient, latestNotes);
        setSummaryResult(result);
        setIsFallbackUsed(true);
        setIsLoading(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: selectedPatient.fullName,
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          medicalNotes: latestNotes,
          vitals: selectedPatient.visits[0]?.vitals,
          history: selectedPatient.visits.map((v) => ({ date: v.date, diagnosis: v.diagnosis })),
        }),
      });

      const data = await response.json();
      if (data.success && data.summary) {
        setSummaryResult(data.summary);
        setIsFallbackUsed(data.isFallback);
      } else {
        // Fallback if API fails
        const result = offlineMedicalSummarizer(selectedPatient, latestNotes);
        setSummaryResult(result);
        setIsFallbackUsed(true);
      }
    } catch (err) {
      console.error("AI Summarizer Error:", err);
      const result = offlineMedicalSummarizer(selectedPatient, latestNotes);
      setSummaryResult(result);
      setIsFallbackUsed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoicePlayback = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (summaryResult) {
      const speechText = `Medical Summary for ${selectedPatient?.fullName}. ${summaryResult.conciseSummary}. Critical risks: ${summaryResult.criticalRisks.join(", ")}`;
      speakText(speechText);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Patient Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold border border-teal-200">
            <Sparkles className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">AI Medical History Summarizer</h2>
            <p className="text-xs text-slate-500">
              Parses years of clinical notes into structured allergy & risk highlights in seconds.
            </p>
          </div>
        </div>

        {/* Patient Dropdown Picker */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Target Patient:</label>
          <select
            value={selectedPatient?.id || ""}
            onChange={(e) => {
              const p = patients.find((pat) => pat.id === e.target.value);
              if (p) {
                onSelectPatient(p);
                setSummaryResult(p.visits[0]?.aiSummaryCache || null);
              }
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-teal-500/20"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.id} - {p.village})
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateSummary}
            disabled={isLoading || !selectedPatient}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md shadow-teal-600/20 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Analyzing..." : "Generate AI Summary"}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedPatient ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Patient Overview Baseline (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 no-print">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="h-12 w-12 rounded-xl bg-[#1A365D] text-teal-300 flex items-center justify-center font-bold text-lg">
                {selectedPatient.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{selectedPatient.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedPatient.id}</p>
                <p className="text-xs text-slate-500">{selectedPatient.gender}, {selectedPatient.age} yrs • Blood: <strong className="text-rose-600">{selectedPatient.bloodGroup}</strong></p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Raw Clinical History ({selectedPatient.visits.length} Visits)</span>
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
                {selectedPatient.visits.map((v, i) => (
                  <div key={`${v.id || "v"}-${i}`} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <strong className="text-slate-800">{v.date}</strong>
                      <span className="text-slate-500 font-medium">{v.attendedByWorker}</span>
                    </div>
                    <p className="text-slate-700 font-semibold">{v.chiefComplaint}</p>
                    <p className="text-slate-500 text-[11px] leading-snug">{v.clinicalNotes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Structured Summary Highlights Output (8 cols) */}
          <div className="lg:col-span-8 print:col-span-12 print:w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-teal-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Clinical AI History Analysis</h3>
                {isFallbackUsed && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                    <WifiOff className="h-3 w-3" />
                    <span>Offline Engine Fallback</span>
                  </span>
                )}
              </div>

              {summaryResult && (
                <button
                  onClick={toggleVoicePlayback}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4 text-rose-600" /> : <Volume2 className="h-4 w-4 text-teal-600" />}
                  <span>{isSpeaking ? "Stop Voice" : "Audio Readout"}</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700">Synthesizing clinical notes with Gemini AI...</p>
                <p className="text-[11px] text-slate-400">Filtering allergy vectors & chronic risk parameters</p>
              </div>
            ) : summaryResult ? (
              <div className="space-y-5">
                {/* Concise Summary Box */}
                <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200/80 text-teal-950 space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800">
                    Concise Clinical Synthesis
                  </span>
                  <p className="text-xs leading-relaxed font-medium">{summaryResult.conciseSummary}</p>
                </div>

                {/* Grid: Allergies & Chronic Diseases Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Highlight 1: Allergies */}
                  <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200/80 space-y-2">
                    <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                      <span>Highlighted Allergies ({summaryResult.allergies.length})</span>
                    </div>
                    {summaryResult.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {summaryResult.allergies.map((a, i) => (
                          <span key={i} className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-200 text-rose-950 border border-rose-300">
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-rose-600/80 italic">No adverse allergies detected</p>
                    )}
                  </div>

                  {/* Highlight 2: Chronic Diseases */}
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                      <Heart className="h-4 w-4 text-amber-600" />
                      <span>Chronic Conditions ({summaryResult.chronicDiseases.length})</span>
                    </div>
                    {summaryResult.chronicDiseases.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {summaryResult.chronicDiseases.map((c, i) => (
                          <span key={i} className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-200 text-amber-950 border border-amber-300">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600/80 italic">No chronic diseases on file</p>
                    )}
                  </div>
                </div>

                {/* Highlight 3: Critical Risks & Triage Alerts */}
                <div className="p-4 rounded-xl bg-[#1A365D] text-white space-y-2">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-300" />
                    <span>Critical Clinical Risks & Warnings</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-200 list-disc list-inside">
                    {summaryResult.criticalRisks.map((risk, idx) => (
                      <li key={idx} className="leading-snug">{risk}</li>
                    ))}
                  </ul>
                </div>

                {/* Highlight 4: Suggested Clinical Next Steps */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-teal-800 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    <span>Recommended Health Worker Actions</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {summaryResult.suggestedClinicalActions.map((action, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium">
                        ✓ {action}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Print and Export Actions Bar */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between no-print flex-wrap gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                  >
                    {copiedSummary ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-600" />}
                    <span>{copiedSummary ? "Copied Summary!" : "Copy Summary Text"}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (selectedPatient && summaryResult) {
                          generateMedicalSummaryPdf(selectedPatient, summaryResult);
                        }
                      }}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200 cursor-pointer"
                    >
                      <Download className="h-4 w-4 text-slate-600" />
                      <span>Download PDF</span>
                    </button>

                    <button
                      onClick={handlePrintSummary}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1A365D] text-white hover:bg-[#132A4B] transition-colors cursor-pointer shadow-xs"
                    >
                      <Printer className="h-4 w-4 text-teal-300" />
                      <span>Print Summary Report</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-3 text-slate-400">
                <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs">Tap "Generate AI Summary" above to synthesize clinical history.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">No patient selected.</div>
      )}
    </div>
  );
};
