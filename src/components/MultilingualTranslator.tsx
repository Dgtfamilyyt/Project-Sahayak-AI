import React, { useState, useRef, useEffect } from "react";
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
  AlertCircle,
  RotateCcw,
  Zap,
  Cpu,
} from "lucide-react";
import { NetworkMode, TranslationResult, OllamaConfig } from "../types";
import { offlineSymptomTranslator } from "../utils/offlineStorage";
import { speakText, stopSpeaking } from "../utils/voiceUtils";
import { translateSymptomsWithOllama } from "../utils/ollamaClient";

interface MultilingualTranslatorProps {
  networkMode: NetworkMode;
  ollamaConfig?: OllamaConfig;
}

interface ClinicalPreset {
  id: string;
  language: string;
  code: string;
  label: string;
  category: string;
  narrative: string;
  directTranslation: string;
  clinicalNotes: string;
  detectedMedicalKeywords: string[];
  suggestedDoctorQuestions: string[];
}

const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    id: "hindi-fever",
    language: "Hindi",
    code: "hi-IN",
    label: "High Fever, Chills & Severe Headache",
    category: "Febrile Illness",
    narrative: "मुझे पिछले दो दिनों से बहुत तेज़ बुखार है, साथ ही ठंड लग रही है और सिर में भयंकर दर्द हो रहा है। रात में बहुत पसीना भी आ रहा है।",
    directTranslation: "I have had a very high fever for the last two days, along with chills and a severe headache. I am also sweating heavily at night.",
    clinicalNotes: "Acute onset high-grade febrile illness (duration: 2 days) associated with rigors/chills, severe cephalalgia, and nocturnal diaphoresis.",
    detectedMedicalKeywords: ["High Fever (Pyrexia)", "Chills & Rigors", "Cephalalgia", "Night Sweats"],
    suggestedDoctorQuestions: [
      "Have you noticed any retro-orbital eye pain or joint stiffness?",
      "Is there any nausea, rash, or dark-colored urine?",
      "Are there standing water pools or mosquitoes near your home?",
    ],
  },
  {
    id: "tamil-respiratory",
    language: "Tamil",
    code: "ta-IN",
    label: "Severe Cough & Shortness of Breath",
    category: "Respiratory",
    narrative: "மூச்சுத் திணறல் மற்றும் இரவில் கடுமையான இருமல் உள்ளது. நெஞ்சில் பாரமாகவும் சளி அதிகமாகவும் உள்ளது.",
    directTranslation: "I have shortness of breath and a severe cough at night. My chest feels heavy and there is a lot of phlegm.",
    clinicalNotes: "Acute respiratory distress featuring nocturnal dyspnea, heavy chest pressure, and productive cough with purulent sputum.",
    detectedMedicalKeywords: ["Dyspnea / Breathlessness", "Nocturnal Cough", "Chest Pressure", "Phlegm Production"],
    suggestedDoctorQuestions: [
      "Are you experiencing wheezing or a whistling sound while breathing?",
      "How long have you had phlegm and what color is it?",
      "Do you have a history of asthma or tuberculosis exposure?",
    ],
  },
  {
    id: "telugu-gi",
    language: "Telugu",
    code: "te-IN",
    label: "Abdominal Pain & Persistent Vomiting",
    category: "Gastrointestinal",
    narrative: "నాకు రెండు రోజులుగా కడుపులో తీవ్రమైన నొప్పి ఉంది మరియు వికారంతో తరచుగా వాంతులు అవుతున్నాయి. ఏమీ తినలేకపోతున్నాను.",
    directTranslation: "I have had severe abdominal pain for two days and frequent vomiting with nausea. I cannot eat anything.",
    clinicalNotes: "Acute gastroenteritis clinical picture: severe epigastric/abdominal pain, persistent emesis, nausea, and inability to tolerate oral intake.",
    detectedMedicalKeywords: ["Severe Abdominal Pain", "Emesis / Vomiting", "Nausea", "Anorexia / Oral Intolerance"],
    suggestedDoctorQuestions: [
      "Where exactly in your abdomen is the pain most severe?",
      "Have you passed loose watery stools or noticed high fever?",
      "When was the last time you were able to retain oral fluids?",
    ],
  },
  {
    id: "marathi-myalgia",
    language: "Marathi",
    code: "mr-IN",
    label: "Severe Joint Pain & Burning Fever",
    category: "Systemic / Viral",
    narrative: "माझ्या अंगात आणि सांध्यांमध्ये खूप तीव्र वेदना होत आहेत. खूप थकवा जाणवत आहे आणि तापाने शरीर तापले आहे.",
    directTranslation: "I have severe pain in my body and joints with extreme fatigue, and my body is burning with fever.",
    clinicalNotes: "Systemic viral prodrome presenting with generalized severe arthralgia/myalgia, marked fatigue (asthenia), and elevated body temperature.",
    detectedMedicalKeywords: ["Arthralgia / Joint Pain", "Severe Myalgia", "Asthenia / Fatigue", "Febrile State"],
    suggestedDoctorQuestions: [
      "Do you have swelling in your small finger joints or knees?",
      "Is there any skin rash behind your ears or on your torso?",
      "Have you been able to stand and walk without support?",
    ],
  },
  {
    id: "bengali-cardiac",
    language: "Bengali",
    code: "bn-IN",
    label: "Chest Pressure & Exertional Dizziness",
    category: "Cardiovascular Risk",
    narrative: "আমার বুকে হালকা চাপ অনুভব হচ্ছে এবং মাথা ঘুরছে। একটু হাঁটলেই হাঁপিয়ে উঠছি এবং শরীর কাঁপছে।",
    directTranslation: "I am feeling mild pressure in my chest and dizziness. I get breathless even after walking a short distance and my body is shivering.",
    clinicalNotes: "Acute exertional angina equivalent: retrosternal chest oppression, exertional dyspnea, presyncope/dizziness, and peripheral tremors.",
    detectedMedicalKeywords: ["Chest Oppression", "Exertional Dyspnea", "Presyncope / Dizziness", "Shivering"],
    suggestedDoctorQuestions: [
      "Does the chest pressure radiate to your left arm, jaw, or shoulder?",
      "Do you have a personal history of high blood pressure or diabetes?",
      "Are you sweating profusely right now?",
    ],
  },
  {
    id: "english-diabetic",
    language: "English",
    code: "en-US",
    label: "Foot Numbness & Frequent Night Urination",
    category: "Metabolic / Chronic",
    narrative: "I have been feeling a burning sensation and numbness in both my feet for two weeks, along with extreme fatigue and waking up 4 times to urinate at night.",
    directTranslation: "I have been feeling a burning sensation and numbness in both my feet for two weeks, along with extreme fatigue and waking up 4 times to urinate at night.",
    clinicalNotes: "Symmetrical peripheral neuropathy pattern (burning paresthesia in bilateral lower extremities) accompanied by symptomatic polyuria/nocturia and malaise.",
    detectedMedicalKeywords: ["Peripheral Neuropathy", "Lower Extremity Paresthesia", "Nocturia / Polyuria", "Chronic Malaise"],
    suggestedDoctorQuestions: [
      "When was your last HbA1c or Fasting Blood Glucose check?",
      "Do you have any open sores, blisters, or slow-healing cuts on your feet?",
      "Are you currently taking any anti-diabetic medications?",
    ],
  },
];

export const MultilingualTranslator: React.FC<MultilingualTranslatorProps> = ({
  networkMode,
  ollamaConfig,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("hindi-fever");
  const [sourceLanguage, setSourceLanguage] = useState<string>("Hindi");
  const [targetLanguage] = useState<string>("English (Doctor Notes)");
  const [patientInput, setPatientInput] = useState<string>(CLINICAL_PRESETS[0].narrative);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [copiedNotes, setCopiedNotes] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isFallbackUsed, setIsFallbackUsed] = useState<boolean>(false);
  const [engineUsedInfo, setEngineUsedInfo] = useState<{
    type: "gemini" | "ollama" | "offline_rules";
    model?: string;
  } | null>(null);

  // Default initial working state populated from preset[0]
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>({
    directTranslation: CLINICAL_PRESETS[0].directTranslation,
    clinicalNotes: CLINICAL_PRESETS[0].clinicalNotes,
    detectedMedicalKeywords: CLINICAL_PRESETS[0].detectedMedicalKeywords,
    suggestedDoctorQuestions: CLINICAL_PRESETS[0].suggestedDoctorQuestions,
  });

  const isOnline = networkMode === "online";
  const isOllamaActive = ollamaConfig?.provider === "ollama";

  // Select working preset and auto-populate
  const handleSelectPreset = (preset: ClinicalPreset) => {
    setSelectedPresetId(preset.id);
    setSourceLanguage(preset.language);
    setPatientInput(preset.narrative);
    setMicError(null);

    // Populate working state instantly for smooth preview
    setTranslationResult({
      directTranslation: preset.directTranslation,
      clinicalNotes: preset.clinicalNotes,
      detectedMedicalKeywords: preset.detectedMedicalKeywords,
      suggestedDoctorQuestions: preset.suggestedDoctorQuestions,
    });
    setIsFallbackUsed(false);
    setEngineUsedInfo(null);
  };

  const handleClearInput = () => {
    setPatientInput("");
    setSelectedPresetId("");
    setTranslationResult(null);
    setMicError(null);
    setEngineUsedInfo(null);
  };

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

  const handleTranslate = async () => {
    if (!patientInput.trim()) return;
    setIsTranslating(true);

    const isExplicitOllama = ollamaConfig?.provider === "ollama";
    const useLocalOllama = !isOnline || isExplicitOllama;

    if (useLocalOllama) {
      // Use local Ollama executor (Direct Browser Fetch -> Backend Proxy -> Offline Rules)
      const { result, engineUsed, modelUsed } = await translateSymptomsWithOllama(
        patientInput,
        sourceLanguage,
        ollamaConfig
      );

      setTranslationResult(result);
      if (engineUsed === "offline_rules") {
        setIsFallbackUsed(true);
        setEngineUsedInfo({ type: "offline_rules" });
      } else {
        setIsFallbackUsed(false);
        setEngineUsedInfo({
          type: "ollama",
          model: modelUsed || ollamaConfig?.model || "llama3.2",
        });
      }
      setIsTranslating(false);
      return;
    }

    // Standard Gemini Online Flow with fallback to Ollama
    try {
      const response = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speechOrText: patientInput,
          sourceLanguage,
          targetLanguage,
          provider: "gemini",
          ollamaHost: ollamaConfig?.host || "http://localhost:11434",
          ollamaModel: ollamaConfig?.model || "llama3.2",
        }),
      });

      const data = await response.json();
      if (data.success && data.translation) {
        setTranslationResult(data.translation);
        setIsFallbackUsed(Boolean(data.isFallback));
        setEngineUsedInfo({
          type: "gemini",
          model: "gemini-3.6-flash",
        });
      } else {
        // Fallback to Ollama or offline rules
        const { result, engineUsed, modelUsed } = await translateSymptomsWithOllama(
          patientInput,
          sourceLanguage,
          ollamaConfig
        );
        setTranslationResult(result);
        setIsFallbackUsed(true);
        setEngineUsedInfo({
          type: engineUsed === "offline_rules" ? "offline_rules" : "ollama",
          model: modelUsed || ollamaConfig?.model || "llama3.2",
        });
      }
    } catch (err) {
      // Network failure -> Fallback to Ollama or offline rules
      const { result, engineUsed, modelUsed } = await translateSymptomsWithOllama(
        patientInput,
        sourceLanguage,
        ollamaConfig
      );
      setTranslationResult(result);
      setIsFallbackUsed(true);
      setEngineUsedInfo({
        type: engineUsed === "offline_rules" ? "offline_rules" : "ollama",
        model: modelUsed || ollamaConfig?.model || "llama3.2",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handleMicToggle = () => {
    setMicError(null);
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError("Speech Recognition API unavailable in iframe environment. Simulating live dictation...");
      setIsRecording(true);
      setTimeout(() => {
        const preset = CLINICAL_PRESETS.find((p) => p.language === sourceLanguage) || CLINICAL_PRESETS[0];
        setPatientInput(preset.narrative);
        setSelectedPresetId(preset.id);
        setIsRecording(false);
      }, 2000);
      return;
    }

    try {
      const preset = CLINICAL_PRESETS.find((p) => p.language === sourceLanguage);
      const recognition = new SpeechRecognition();
      recognition.lang = preset?.code || "hi-IN";
      recognition.continuous = true;
      recognition.interimResults = true;

      let finalTranscript = "";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
        const currentSpeech = (finalTranscript + interimTranscript).trim();
        if (currentSpeech) {
          setPatientInput(currentSpeech);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setMicError(`Microphone issue: ${event.error}. You can select any working clinical sample below.`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setMicError("Microphone access permission required. Please select a working sample below.");
      setIsRecording(false);
    }
  };

  const toggleSpeakTranslation = () => {
    if (!translationResult) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(translationResult.clinicalNotes, "en-US");
      setIsSpeaking(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1A365D] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Languages className="h-6 w-6 text-teal-400" />
            <h2 className="text-xl font-extrabold tracking-tight">Multilingual Clinical Translator</h2>
            <span className="bg-teal-500/20 text-teal-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-teal-500/40">
              Voice & Regional Text AI
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Converts patient narratives in Indic languages (Hindi, Tamil, Telugu, Marathi, Bengali) into standardized English clinical EMR notes.
          </p>
        </div>

        {/* Selected Language Indicator */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 shrink-0">
          <span className="text-xs font-semibold text-slate-300">Source:</span>
          <select
            value={sourceLanguage}
            onChange={(e) => {
              const lang = e.target.value;
              setSourceLanguage(lang);
              const matchingPreset = CLINICAL_PRESETS.find((p) => p.language === lang);
              if (matchingPreset) {
                handleSelectPreset(matchingPreset);
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-600 text-xs font-bold text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/30"
          >
            {CLINICAL_PRESETS.map((p) => (
              <option key={p.id} value={p.language}>
                {p.language} Patient Voice
              </option>
            ))}
          </select>
          <span className="text-xs font-bold text-slate-400">➔</span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40">
            English Notes
          </span>
        </div>
      </div>

      {/* Interactive Clinical Working Presets Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Select Working Clinical Case Scenarios
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Click any scenario to test instant translation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {CLINICAL_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-teal-50 border-teal-500 text-teal-950 ring-2 ring-teal-500/20 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/80 text-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {preset.language}
                    </span>
                    <span className="text-[10px] font-mono text-teal-700 font-semibold">{preset.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{preset.label}</h4>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 font-mono">
                  "{preset.narrative}"
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Input Speech Studio + Output Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Recording & Input Box (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Patient Audio / Regional Text ({sourceLanguage})
              </span>
              {isRecording ? (
                <span className="text-xs font-bold text-rose-600 animate-pulse flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                  <span>Listening ({sourceLanguage})...</span>
                </span>
              ) : (
                <span className="text-[11px] font-bold text-teal-700 flex items-center space-x-1">
                  <Mic className="h-3.5 w-3.5 text-teal-600" />
                  <span>Microphone Ready</span>
                </span>
              )}
            </div>

            {/* Mic Alert / Status Notification */}
            {micError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{micError}</span>
              </div>
            )}

            {/* Input Textarea */}
            <div className="relative">
              <textarea
                rows={7}
                value={patientInput}
                onChange={(e) => {
                  setPatientInput(e.target.value);
                  setSelectedPresetId("");
                }}
                placeholder={`Speak in ${sourceLanguage} using the microphone or type patient symptoms here...`}
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none bg-white font-sans"
              />

              {/* Mic Floating Action */}
              <button
                type="button"
                onClick={handleMicToggle}
                className={`absolute right-3 bottom-3 p-3 rounded-full shadow-md transition-all cursor-pointer ${
                  isRecording
                    ? "bg-rose-600 text-white animate-bounce ring-4 ring-rose-200"
                    : "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/30"
                }`}
                title={isRecording ? "Stop speech recording" : `Click to record live speech in ${sourceLanguage}`}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleClearInput}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear Narrative</span>
              </button>
              <span className="text-[11px] text-slate-400 font-mono">
                {patientInput.length} characters
              </span>
            </div>

            {/* Translate CTA */}
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating || !patientInput.trim()}
              className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{isTranslating ? "Translating Patient Narrative..." : "Translate to Clinical Notes"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Output Clinical Translation & Medical Notes (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-teal-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Standardized Clinical Notes (Doctor View)</h3>
              {engineUsedInfo?.type === "ollama" && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 flex items-center space-x-1">
                  <Cpu className="h-3 w-3 text-purple-600" />
                  <span>Local Ollama AI ({engineUsedInfo.model || "llama3.2"})</span>
                </span>
              )}
              {engineUsedInfo?.type === "gemini" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 flex items-center space-x-1">
                  <Sparkles className="h-3 w-3 text-teal-600" />
                  <span>Gemini AI</span>
                </span>
              )}
              {(isFallbackUsed || engineUsedInfo?.type === "offline_rules") && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                  <WifiOff className="h-3 w-3 text-amber-600" />
                  <span>Offline Clinical Rules</span>
                </span>
              )}
            </div>

            {translationResult && (
              <button
                type="button"
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
              <p className="text-xs font-bold text-slate-700">Converting native language narrative into clinical medical English...</p>
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
                  <span>Suggested Clinical Follow-up Questions for Doctor</span>
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
                  type="button"
                  onClick={handleCopyTranslation}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                >
                  {copiedNotes ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-600" />}
                  <span>{copiedNotes ? "Copied Notes!" : "Copy Translation Notes"}</span>
                </button>

                <button
                  type="button"
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
              Select a working clinical scenario above or input patient narrative to generate medical notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
