import React, { useState, useRef, useEffect } from "react";
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
  Cpu,
  Mic,
  MicOff,
  Radio,
  X,
  Save,
  Plus,
  Languages,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Patient, NetworkMode, AISummaryResult, OllamaConfig, VisitRecord } from "../types";
import { offlineMedicalSummarizer } from "../utils/offlineStorage";
import { generateMedicalSummaryPdf } from "../utils/pdfExport";
import { safePrint } from "../utils/printUtils";
import { speakText, stopSpeaking } from "../utils/voiceUtils";
import { summarizePatientWithOllama } from "../utils/ollamaClient";

interface MedicalSummarizerProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onAddVisit?: (patientId: string, visit: VisitRecord) => void;
  networkMode: NetworkMode;
  ollamaConfig?: OllamaConfig;
}

export const MedicalSummarizer: React.FC<MedicalSummarizerProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onAddVisit,
  networkMode,
  ollamaConfig,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<AISummaryResult | null>(
    selectedPatient?.visits[0]?.aiSummaryCache || null
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFallbackUsed, setIsFallbackUsed] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Speech Recognition Voice Note State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [recognitionLang, setRecognitionLang] = useState("en-US");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [chiefComplaintInput, setChiefComplaintInput] = useState("Voice Clinical Dictation");
  const recognitionRef = useRef<any>(null);

  // Collapsible sections state
  const [isSynthesisCollapsed, setIsSynthesisCollapsed] = useState(false);
  const [isHighlightsCollapsed, setIsHighlightsCollapsed] = useState(false);
  const [isRisksCollapsed, setIsRisksCollapsed] = useState(false);
  const [isActionsCollapsed, setIsActionsCollapsed] = useState(false);

  const isOnline = networkMode === "online";
  const isOllamaActive = ollamaConfig?.provider === "ollama";

  const isSpeechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startRecording = () => {
    setSpeechError(null);
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechError("Speech Recognition API is not supported in this browser. Please type notes manually.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = recognitionLang;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let currentFinal = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript + " ";
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(currentInterim);
        if (currentFinal) {
          setVoiceTranscript((prev) => (prev ? prev + " " + currentFinal : currentFinal).trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setSpeechError(`Speech error (${event.error}). Please verify microphone permissions.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimTranscript("");
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error("Failed to start Speech Recognition:", err);
      setSpeechError(err.message || "Failed to start microphone.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    setInterimTranscript("");
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSaveVoiceNoteToRecord = (autoSummarize: boolean = true) => {
    if (!selectedPatient || !voiceTranscript.trim()) return;

    const newVisit: VisitRecord = {
      id: `v-voice-${Date.now()}`,
      patientId: selectedPatient.id,
      date: new Date().toISOString().split("T")[0],
      chiefComplaint: chiefComplaintInput || "Voice Recorded Clinical Note",
      clinicalNotes: voiceTranscript.trim(),
      attendedByWorker: "CHW Dictation",
      diagnosis: ["Voice Clinical Observation"],
      prescribedMedications: [],
      syncedToCloud: false,
      vitals: selectedPatient.visits[0]?.vitals || {
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 72,
        temperature: 98.6,
        spO2: 98,
        weightKg: 60,
        recordedAt: new Date().toISOString(),
      },
    };

    if (onAddVisit) {
      onAddVisit(selectedPatient.id, newVisit);
    } else {
      selectedPatient.visits.unshift(newVisit);
    }

    setIsVoiceModalOpen(false);
    stopRecording();

    if (autoSummarize) {
      setTimeout(() => {
        handleGenerateSummary();
      }, 350);
    }
  };

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
    if (!selectedPatient) return;
    safePrint({
      elementId: "medical-summary-report-card",
      documentTitle: `AI_Medical_Summary_${selectedPatient.fullName}`,
      fallbackPdf: () => summaryResult && generateMedicalSummaryPdf(selectedPatient, summaryResult),
    });
  };

  const handleGenerateSummary = async () => {
    if (!selectedPatient) return;
    setIsLoading(true);

    const latestNotes = selectedPatient.visits.map((v) => `${v.date}: ${v.chiefComplaint}. ${v.clinicalNotes}`).join(" | ");

    const isExplicitOllama = ollamaConfig?.provider === "ollama";
    const useLocalOllama = !isOnline || isExplicitOllama;

    if (useLocalOllama) {
      const { result, engineUsed } = await summarizePatientWithOllama(selectedPatient, latestNotes, ollamaConfig);
      setSummaryResult(result);
      setIsFallbackUsed(engineUsed === "offline_rules");
      setIsLoading(false);
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
          provider: "gemini",
          ollamaHost: ollamaConfig?.host || "http://localhost:11434",
          ollamaModel: ollamaConfig?.model || "llama3.2",
        }),
      });

      const data = await response.json();
      if (data.success && data.summary) {
        setSummaryResult(data.summary);
        setIsFallbackUsed(data.isFallback);
      } else {
        const { result, engineUsed } = await summarizePatientWithOllama(selectedPatient, latestNotes, ollamaConfig);
        setSummaryResult(result);
        setIsFallbackUsed(engineUsed === "offline_rules");
      }
    } catch (err) {
      console.error("AI Summarizer Error:", err);
      const { result, engineUsed } = await summarizePatientWithOllama(selectedPatient, latestNotes, ollamaConfig);
      setSummaryResult(result);
      setIsFallbackUsed(engineUsed === "offline_rules");
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
        <div className="flex flex-wrap items-center space-x-3 gap-y-2">
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

          {/* Record Voice Note Button */}
          <button
            onClick={() => {
              setIsVoiceModalOpen(true);
              setVoiceTranscript("");
              setSpeechError(null);
            }}
            disabled={!selectedPatient}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
              isRecording
                ? "bg-rose-600 text-white border-rose-600 shadow-rose-600/30 animate-pulse"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200/80"
            }`}
            title="Dictate clinical observations directly into visit record"
          >
            <Mic className={`h-4 w-4 ${isRecording ? "text-white animate-bounce" : "text-rose-600"}`} />
            <span>{isRecording ? "Recording..." : "Record Voice Note"}</span>
          </button>

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
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-slate-700 block">Raw Clinical History ({selectedPatient.visits.length} Visits)</span>
                <button
                  onClick={() => {
                    setIsVoiceModalOpen(true);
                    setVoiceTranscript("");
                    setSpeechError(null);
                  }}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200/80 cursor-pointer transition-colors"
                >
                  <Mic className="h-3 w-3 text-rose-600" />
                  <span>+ Voice Note</span>
                </button>
              </div>
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
              <div id="medical-summary-report-card" className="space-y-5">
                {/* Concise Summary Box */}
                <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200/80 text-teal-950 space-y-1">
                  <div
                    onClick={() => setIsSynthesisCollapsed(!isSynthesisCollapsed)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800">
                      Concise Clinical Synthesis
                    </span>
                    <button className="text-teal-700 hover:text-teal-900 cursor-pointer p-0.5">
                      {isSynthesisCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isSynthesisCollapsed && (
                    <p className="text-xs leading-relaxed font-medium pt-1">{summaryResult.conciseSummary}</p>
                  )}
                </div>

                {/* Grid: Allergies & Chronic Diseases Highlights */}
                <div className="space-y-2">
                  <div
                    onClick={() => setIsHighlightsCollapsed(!isHighlightsCollapsed)}
                    className="flex items-center justify-between cursor-pointer select-none py-1 border-b border-slate-200"
                  >
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Allergies & Chronic Condition Highlights
                    </span>
                    <button className="text-slate-600 hover:text-slate-900 cursor-pointer p-0.5">
                      {isHighlightsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                  </div>

                  {!isHighlightsCollapsed && (
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
                  )}
                </div>

                {/* Highlight 3: Critical Risks & Triage Alerts */}
                <div className="p-4 rounded-xl bg-[#1A365D] text-white space-y-2">
                  <div
                    onClick={() => setIsRisksCollapsed(!isRisksCollapsed)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                      <AlertTriangle className="h-4 w-4 text-amber-300" />
                      <span>Critical Clinical Risks & Warnings ({summaryResult.criticalRisks.length})</span>
                    </div>
                    <button className="text-amber-300 hover:text-white cursor-pointer p-0.5">
                      {isRisksCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isRisksCollapsed && (
                    <ul className="space-y-1 text-xs text-slate-200 list-disc list-inside pt-1">
                      {summaryResult.criticalRisks.map((risk, idx) => (
                        <li key={idx} className="leading-snug">{risk}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Highlight 4: Suggested Clinical Next Steps */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div
                    onClick={() => setIsActionsCollapsed(!isActionsCollapsed)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-2 text-teal-800 font-bold text-xs">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      <span>Recommended Health Worker Actions ({summaryResult.suggestedClinicalActions.length})</span>
                    </div>
                    <button className="text-teal-800 hover:text-teal-950 cursor-pointer p-0.5">
                      {isActionsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isActionsCollapsed && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {summaryResult.suggestedClinicalActions.map((action, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium">
                          ✓ {action}
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* Dictate Clinical Voice Note Modal */}
      {isVoiceModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-[#1A365D]/80 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto no-print">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700 font-bold">
                  <Mic className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Dictate Clinical Voice Note</h3>
                  <p className="text-xs text-slate-500">Transcribes speech directly into {selectedPatient.fullName}'s visit history</p>
                </div>
              </div>

              <button
                onClick={() => {
                  stopRecording();
                  setIsVoiceModalOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Speech Support Warning */}
            {!isSpeechSupported && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Browser SpeechRecognition API is not detected in this browser. You can type or edit clinical notes manually in the text area below.
                </span>
              </div>
            )}

            {speechError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{speechError}</span>
                </div>
                <button
                  onClick={() => setSpeechError(null)}
                  className="text-rose-600 font-bold hover:underline ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Controls: Record Toggle & Language Selector */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Languages className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Recognition Language:</span>
                  <select
                    value={recognitionLang}
                    onChange={(e) => setRecognitionLang(e.target.value)}
                    disabled={isRecording}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-IN">English (India)</option>
                    <option value="hi-IN">Hindi (हिंदी)</option>
                    <option value="bn-IN">Bengali (বাংলা)</option>
                    <option value="ta-IN">Tamil (தமிழ்)</option>
                    <option value="te-IN">Telugu (తెలుగు)</option>
                    <option value="mr-IN">Marathi (मराठी)</option>
                  </select>
                </div>

                {/* Big Mic Toggle Button */}
                <button
                  onClick={toggleRecording}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md ${
                    isRecording
                      ? "bg-rose-600 text-white hover:bg-rose-700 animate-pulse shadow-rose-600/30"
                      : "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 text-white" />
                      <span>Stop Dictation</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 text-white" />
                      <span>Start Dictation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Visual Recording Waves Feedback */}
              {isRecording && (
                <div className="flex items-center space-x-2 pt-1 text-xs text-rose-600 font-bold">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <span>Listening live... speak clearly into your microphone</span>
                </div>
              )}
            </div>

            {/* Note Complaint & Transcribed Output Area */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observation / Complaint Title:</label>
                <input
                  type="text"
                  value={chiefComplaintInput}
                  onChange={(e) => setChiefComplaintInput(e.target.value)}
                  placeholder="e.g. Fever, Persistent Cough, Joint Pain"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Transcribed Clinical Notes:</label>
                  {voiceTranscript && (
                    <button
                      onClick={() => setVoiceTranscript("")}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear Text
                    </button>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={5}
                    value={voiceTranscript + (interimTranscript ? (voiceTranscript ? " " : "") + interimTranscript : "")}
                    onChange={(e) => setVoiceTranscript(e.target.value)}
                    placeholder="Transcribed voice text will appear here automatically as you speak. You can also edit or type notes directly..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                  />
                  {interimTranscript && (
                    <div className="absolute bottom-2 right-2 text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded border border-rose-300 animate-pulse">
                      Processing live speech...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  stopRecording();
                  setIsVoiceModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer border border-slate-200"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSaveVoiceNoteToRecord(false)}
                  disabled={!voiceTranscript.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4 text-teal-300" />
                  <span>Save to Record</span>
                </button>

                <button
                  onClick={() => handleSaveVoiceNoteToRecord(true)}
                  disabled={!voiceTranscript.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-all shadow-md shadow-teal-600/20 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-white" />
                  <span>Save & Re-Generate AI Summary</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
