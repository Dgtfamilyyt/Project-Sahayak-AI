import React, { useState } from "react";
import {
  Languages,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  FileCheck,
  HelpCircle,
  Stethoscope,
  Sparkles,
  WifiOff,
  Printer,
  Copy,
  Check,
} from "lucide-react";
import { NetworkMode, TranslationResult } from "../types";
import { offlineSymptomTranslator } from "../utils/offlineStorage";
import { speakText, stopSpeaking } from "../utils/voiceUtils";

interface MultilingualTranslatorProps {
  networkMode: NetworkMode;
}

export const MultilingualTranslator: React.FC<MultilingualTranslatorProps> = ({ networkMode }) => {
  const [sourceLanguage, setSourceLanguage] = useState("Hindi");
  const [targetLanguage, setTargetLanguage] = useState("English (Doctor Notes)");
  const [patientInput, setPatientInput] = useState(
    "मुझे पिछले दो दिनों से तेज बुखार है, ठंड लग रही है और सिर में बहुत तेज दर्द हो रहा है।"
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>({
    directTranslation: "I have had high fever for the last two days, feeling cold with severe headache.",
    clinicalNotes: "Acute onset febrile illness (duration: 2 days) associated with rigor/chills and severe cephalalgia (headache).",
    detectedMedicalKeywords: ["High Fever", "Chills / Rigors", "Cephalalgia (Headache)"],
    suggestedDoctorQuestions: [
      "Are you experiencing any nausea, vomiting, or retro-orbital eye pain?",
      "Have you noticed any skin rash or joint stiffness?",
      "Is there anyone else in your household with similar febrile symptoms?",
    ],
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFallbackUsed, setIsFallbackUsed] = useState(false);

  const isOnline = networkMode === "online";

  const handleCopyTranslation = () => {
    if (!translationResult) return;
    const textToCopy = `Clinical Symptom Translation (${sourceLanguage} -> English)
--------------------------------------------------
Patient Narrative: ${patientInput}
English Translation: ${translationResult.directTranslation}
Structured Clinical Notes: ${translationResult.clinicalNotes}
Keywords: ${translationResult.detectedMedicalKeywords.join(", ")}
Suggested Follow-up Questions:
${translationResult.suggestedDoctorQuestions.map((q) => `- ${q}`).join("\n")}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handlePrintTranslation = () => {
    window.print();
  };

  const languagesList = [
    { name: "Hindi", code: "hi-IN", sample: "मुझे दो दिन से बुखार है" },
    { name: "Tamil", code: "ta-IN", sample: "எனக்கு இரண்டு நாட்களாக காய்ச்சல் உள்ளது" },
    { name: "Telugu", code: "te-IN", sample: "నాకు రెండు రోజులుగా జ్వరం ఉంది" },
    { name: "Marathi", code: "mr-IN", sample: "मला दोन दिवसांपासून ताप आहे" },
    { name: "Bengali", code: "bn-IN", sample: "আমার দুই দিন ধরে জ্বর হয়েছে" },
    { name: "English", code: "en-US", sample: "I have had a fever for two days" },
  ];

  const handleTranslate = async () => {
    if (!patientInput) return;
    setIsTranslating(true);

    if (!isOnline) {
      setTimeout(() => {
        const offRes = offlineSymptomTranslator(patientInput, sourceLanguage);
        setTranslationResult({
          directTranslation: offRes.directTranslation,
          clinicalNotes: offRes.clinicalNotes,
          detectedMedicalKeywords: offRes.keywords,
          suggestedDoctorQuestions: [
            "How long have you had these symptoms?",
            "Have you taken any over-the-counter fever medication?",
          ],
        });
        setIsFallbackUsed(true);
        setIsTranslating(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speechOrText: patientInput,
          sourceLanguage,
          targetLanguage,
        }),
      });

      const data = await response.json();
      if (data.success && data.translation) {
        setTranslationResult(data.translation);
        setIsFallbackUsed(data.isFallback);
      } else {
        const offRes = offlineSymptomTranslator(patientInput, sourceLanguage);
        setTranslationResult({
          directTranslation: offRes.directTranslation,
          clinicalNotes: offRes.clinicalNotes,
          detectedMedicalKeywords: offRes.keywords,
          suggestedDoctorQuestions: ["Is there any shortness of breath or chest tightness?"],
        });
        setIsFallbackUsed(true);
      }
    } catch (err) {
      const offRes = offlineSymptomTranslator(patientInput, sourceLanguage);
      setTranslationResult({
        directTranslation: offRes.directTranslation,
        clinicalNotes: offRes.clinicalNotes,
        detectedMedicalKeywords: offRes.keywords,
        suggestedDoctorQuestions: ["Please ask the patient to describe pain severity on 1-10 scale."],
      });
      setIsFallbackUsed(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleMicToggle = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Simulated voice recognition snippet fill
      setTimeout(() => {
        if (sourceLanguage === "Tamil") {
          setPatientInput("மூச்சுத் திணறல் மற்றும் இரவில் கடுமையான இருமல் உள்ளது.");
        } else if (sourceLanguage === "Telugu") {
          setPatientInput("నాకు గుండెలో మంట మరియు తలతిరగడం ఉంది.");
        } else {
          setPatientInput("मुझे छाती में भारीपन और सांस लेने में तकलीफ हो रही है।");
        }
        setIsRecording(false);
      }, 2500);
    }
  };

  const toggleSpeakTranslation = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (translationResult) {
      const selectedLangObj = languagesList.find((l) => l.name === sourceLanguage);
      speakText(translationResult.directTranslation, selectedLangObj?.code || "en-US");
      setIsSpeaking(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold border border-teal-200">
            <Languages className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Multilingual Symptom Translator</h2>
            <p className="text-xs text-slate-500">
              Converts patient regional speech & native text into standardized English clinical notes for doctors.
            </p>
          </div>
        </div>

        {/* Language Selectors */}
        <div className="flex items-center space-x-2">
          <select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-teal-500/20"
          >
            {languagesList.map((l) => (
              <option key={l.name} value={l.name}>
                {l.name} Patient Speech
              </option>
            ))}
          </select>
          <span className="text-xs font-bold text-slate-400">➔</span>
          <span className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            English Notes
          </span>
        </div>
      </div>

      {/* Grid: Input Speech Studio + Output Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Recording & Input Box (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Patient Audio / Regional Text ({sourceLanguage})
            </span>
            {isRecording && (
              <span className="text-xs font-bold text-rose-600 animate-pulse flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                <span>Listening...</span>
              </span>
            )}
          </div>

          {/* Quick Language Sample Chips */}
          <div className="flex flex-wrap gap-1.5">
            {languagesList.map((lang) => (
              <button
                key={lang.name}
                onClick={() => {
                  setSourceLanguage(lang.name);
                  setPatientInput(lang.sample);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  sourceLanguage === lang.name
                    ? "bg-[#1A365D] text-white font-bold border-[#1A365D]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {lang.name} Sample
              </button>
            ))}
          </div>

          {/* Input Textarea */}
          <div className="relative">
            <textarea
              rows={6}
              value={patientInput}
              onChange={(e) => setPatientInput(e.target.value)}
              placeholder="Type patient's description or click the microphone to speak..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none bg-white"
            />

            {/* Mic Floating Action */}
            <button
              onClick={handleMicToggle}
              className={`absolute right-3 bottom-3 p-3 rounded-full shadow-md transition-all cursor-pointer ${
                isRecording
                  ? "bg-rose-600 text-white animate-bounce"
                  : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
              }`}
              title="Click to toggle mic recording simulation"
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-teal-600" />}
            </button>
          </div>

          {/* Translate CTA */}
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !patientInput}
            className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>{isTranslating ? "Translating Patient Narrative..." : "Translate to Clinical Notes"}</span>
          </button>
        </div>

        {/* Right Column: Output Clinical Translation & Medical Notes (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-teal-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Standardized Clinical Notes (Doctor View)</h3>
              {isFallbackUsed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                  <WifiOff className="h-3 w-3" />
                  <span>Offline Local Engine</span>
                </span>
              )}
            </div>

            {translationResult && (
              <button
                onClick={toggleSpeakTranslation}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
              >
                {isSpeaking ? <VolumeX className="h-4 w-4 text-rose-600" /> : <Volume2 className="h-4 w-4 text-teal-600" />}
                <span>{isSpeaking ? "Stop" : "Read Aloud"}</span>
              </button>
            )}
          </div>

          {isTranslating ? (
            <div className="py-20 text-center space-y-3">
              <Sparkles className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">Converting native language into clinical medical English...</p>
            </div>
          ) : translationResult ? (
            <div className="space-y-4 text-xs">
              {/* Direct Translation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">
                  Verbatim English Translation
                </span>
                <p className="text-slate-900 font-medium italic leading-relaxed">
                  "{translationResult.directTranslation}"
                </p>
              </div>

              {/* Formatted Clinical Notes */}
              <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200/80 space-y-1">
                <span className="font-extrabold uppercase text-[10px] tracking-wider text-teal-800 flex items-center space-x-1">
                  <FileCheck className="h-3.5 w-3.5 text-teal-600" />
                  <span>Structured Clinical Notes for EMR</span>
                </span>
                <p className="text-slate-900 font-semibold leading-relaxed">
                  {translationResult.clinicalNotes}
                </p>
              </div>

              {/* Detected Medical Keywords */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-700 text-xs block">Extracted Medical Keywords</span>
                <div className="flex flex-wrap gap-1.5">
                  {translationResult.detectedMedicalKeywords.map((kw, idx) => (
                    <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded-md bg-teal-100 text-teal-900 border border-teal-300">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Diagnostic Follow-up Questions for Doctor */}
              <div className="p-4 rounded-xl bg-[#1A365D] text-white space-y-2">
                <span className="font-bold text-amber-300 text-xs flex items-center space-x-1.5">
                  <HelpCircle className="h-4 w-4 text-amber-300" />
                  <span>Suggested Clinical Follow-up Questions to Ask Patient</span>
                </span>
                <ul className="space-y-1.5 text-xs text-slate-200 list-disc list-inside">
                  {translationResult.suggestedDoctorQuestions.map((q, i) => (
                    <li key={i} className="leading-snug">{q}</li>
                  ))}
                </ul>
              </div>

              {/* Print and Copy Actions Bar */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between no-print">
                <button
                  onClick={handleCopyTranslation}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                >
                  {copiedNotes ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-600" />}
                  <span>{copiedNotes ? "Copied Notes!" : "Copy Translation Notes"}</span>
                </button>

                <button
                  onClick={handlePrintTranslation}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1A365D] text-white hover:bg-[#132A4B] transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="h-4 w-4 text-teal-300" />
                  <span>Print Clinical Notes</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              Input patient narrative and click "Translate to Clinical Notes".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
