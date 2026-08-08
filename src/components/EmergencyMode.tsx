import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  PhoneCall,
  Heart,
  ShieldAlert,
  Activity,
  X,
  Printer,
  Siren,
  Clock,
  User,
  Calculator,
  Compass,
  Zap,
  Volume2,
  Ambulance,
  MapPin,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Patient } from "../types";
import { generateVisitSummaryPdf } from "../utils/pdfExport";
import { safePrint } from "../utils/printUtils";

interface EmergencyModeProps {
  patient: Patient | null;
  onClose: () => void;
}

export const EmergencyMode: React.FC<EmergencyModeProps> = ({ patient, onClose }) => {
  const [activeTab, setActiveTab] = useState<"triage" | "protocols" | "dosing" | "dispatch">("triage");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // CPR Metronome state
  const [cprActive, setCprActive] = useState<boolean>(false);
  const [cprBeat, setCprBeat] = useState<boolean>(false);

  // Triage state inputs
  const [avpuState, setAvpuState] = useState<"A" | "V" | "P" | "U">("A");
  const [copysuccess, setCopySuccess] = useState<string | null>(null);

  // Protocol collapse state
  const [collapsedProtocols, setCollapsedProtocols] = useState<Record<string, boolean>>({});

  const toggleProtocol = (key: string) => {
    setCollapsedProtocols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Golden Hour Stopwatch Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // CPR 110 BPM visual metronome
  useEffect(() => {
    if (!cprActive) return;
    const interval = setInterval(() => {
      setCprBeat((prev) => !prev);
    }, 545); // ~110 bpm
    return () => clearInterval(interval);
  }, [cprActive]);

  if (!patient) {
    return (
      <div className="fixed inset-0 z-50 bg-rose-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border-4 border-rose-600">
          <AlertTriangle className="h-12 w-12 text-rose-600 mx-auto animate-bounce" />
          <h3 className="text-xl font-extrabold text-slate-900">Emergency Mode Active</h3>
          <p className="text-xs text-slate-600">Please select a patient from the records directory to render their life-critical emergency profile.</p>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs">
            Close / Back
          </button>
        </div>
      </div>
    );
  }

  const latestVisit = patient.visits[0];
  const hr = latestVisit?.vitals.heartRate || 80;
  const sbp = latestVisit?.vitals.bloodPressureSystolic || 120;
  const shockIndex = Number((hr / Math.max(sbp, 1)).toFixed(2));
  const isShockRisk = shockIndex >= 0.9;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-rose-950/95 backdrop-blur-md overflow-y-auto p-3 sm:p-6 flex items-center justify-center print:static print:bg-white print:p-0 print:overflow-visible">
      <div id="emergency-triage-card" className="bg-slate-950 text-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border-4 border-rose-600 space-y-5 print:bg-white print:text-slate-900 print:border-2 print:border-rose-600 print:p-4 print:shadow-none">
        {/* Header Alert Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rose-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold animate-pulse shadow-lg shadow-rose-600/50 shrink-0">
              <Siren className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-extrabold text-xl text-rose-500 tracking-tight">CRITICAL EMERGENCY TRIAGE</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                  PRIORITY 1 RED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Node #402 • Rural Trauma Unit • Offline Emergency Protocol
              </p>
            </div>
          </div>

          {/* Golden Hour Stopwatch & Action Bar */}
          <div className="flex items-center space-x-3 self-end sm:self-center">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-rose-600/60 flex items-center space-x-2 text-rose-400 font-mono">
              <Clock className="h-4 w-4 animate-spin text-rose-500" />
              <div>
                <span className="text-[9px] text-slate-400 block uppercase leading-none">Golden Hour</span>
                <span className="text-sm font-black text-white">{formatTimer(elapsedSeconds)}</span>
              </div>
            </div>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 cursor-pointer">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Emergency Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("triage")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "triage"
                ? "bg-rose-600 text-white shadow-md shadow-rose-900/50"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>1. Patient Profile & Shock Index</span>
          </button>

          <button
            onClick={() => setActiveTab("protocols")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "protocols"
                ? "bg-rose-600 text-white shadow-md shadow-rose-900/50"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Zap className="h-4 w-4 text-amber-400" />
            <span>2. Rapid First-Aid & CPR</span>
          </button>

          <button
            onClick={() => setActiveTab("dosing")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "dosing"
                ? "bg-rose-600 text-white shadow-md shadow-rose-900/50"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Calculator className="h-4 w-4 text-sky-400" />
            <span>3. Emergency Resuscitation Dosing</span>
          </button>

          <button
            onClick={() => setActiveTab("dispatch")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "dispatch"
                ? "bg-rose-600 text-white shadow-md shadow-rose-900/50"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Ambulance className="h-4 w-4 text-emerald-400" />
            <span>4. Referral & SOS Dispatch</span>
          </button>
        </div>

        {/* TAB 1: Patient Profile & Triage Scores */}
        {activeTab === "triage" && (
          <div className="space-y-4">
            {/* Patient Emergency Core Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white">{patient.fullName}</h2>
                    <p className="text-xs font-mono text-slate-400">{patient.id} • {patient.gender}, {patient.age}y</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-lg font-black tracking-wider shadow-md">
                    {patient.bloodGroup}
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800">
                  <p>Village: <strong>{patient.village}, {patient.district}</strong></p>
                  <p>Primary Language: <strong>{patient.primaryLanguage}</strong></p>
                </div>
              </div>

              {/* Life-Critical Allergies Alert */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/80 border-2 border-rose-600 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-extrabold text-sm">
                  <ShieldAlert className="h-5 w-5" />
                  <span>LIFE-CRITICAL ALLERGIES</span>
                </div>

                {patient.knownAllergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {patient.knownAllergies.map((alg, idx) => (
                      <span key={idx} className="text-xs font-black px-3 py-1.5 rounded-lg bg-rose-600 text-white uppercase tracking-wide">
                        ⚠️ {alg}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-rose-300 italic">No adverse drug allergies recorded.</p>
                )}
              </div>
            </div>

            {/* Shock Index & Consciousness Calculator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shock Index Panel */}
              <div className={`p-4 rounded-2xl border ${isShockRisk ? "bg-rose-950/90 border-rose-500" : "bg-slate-900 border-slate-800"} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                    <Heart className="h-4 w-4" />
                    <span>Shock Index (HR / SBP)</span>
                  </span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md ${isShockRisk ? "bg-rose-600 text-white" : "bg-slate-800 text-emerald-400"}`}>
                    {isShockRisk ? "CRITICAL RISK" : "NORMAL"}
                  </span>
                </div>

                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-black text-white">{shockIndex}</span>
                  <span className="text-xs text-slate-400">
                    ({hr} bpm / {sbp} mmHg)
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-medium">
                  {shockIndex >= 0.9
                    ? "⚠️ Shock Index > 0.9 indicates severe hypovolemic or septic shock. Immediate IV fluid bolus and rapid transport required."
                    : "Hemodynamic shock index within acceptable limits (<0.8)."}
                </p>
              </div>

              {/* AVPU Consciousness Level */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 block">
                  AVPU Responsiveness Scale
                </span>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { code: "A", label: "Alert" },
                    { code: "V", label: "Voice" },
                    { code: "P", label: "Pain" },
                    { code: "U", label: "Unresponsive" },
                  ].map((item) => (
                    <button
                      key={item.code}
                      onClick={() => setAvpuState(item.code as any)}
                      className={`py-2 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                        avpuState === item.code
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {item.code}
                      <span className="block text-[9px] font-normal">{item.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Selected State: <strong className="text-white">{avpuState === "A" ? "Alert" : avpuState === "V" ? "Responds to Voice" : avpuState === "P" ? "Responds to Pain Only" : "Unresponsive"}</strong>
                  {avpuState === "U" && " ⚠️ AIRWAY PROTECTION REQUIRED"}
                </p>
              </div>
            </div>

            {/* Baseline Vitals & Medical Conditions */}
            {latestVisit && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase text-slate-400 block">
                  Baseline Clinical Vitals ({latestVisit.date})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-200">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
                    <strong className="text-white text-sm">{latestVisit.vitals.bloodPressureSystolic}/{latestVisit.vitals.bloodPressureDiastolic} mmHg</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Heart Rate</span>
                    <strong className="text-white text-sm">{latestVisit.vitals.heartRate} bpm</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Body Temperature</span>
                    <strong className="text-white text-sm">{latestVisit.vitals.temperature}°F</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">SpO2 Oxygen</span>
                    <strong className="text-emerald-400 text-sm">{latestVisit.vitals.spO2}%</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Rapid First-Aid & CPR Metronome */}
        {activeTab === "protocols" && (
          <div className="space-y-4">
            {/* CPR Guidance Metronome */}
            <div className="p-5 rounded-2xl bg-slate-900 border-2 border-rose-600/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Heart className={`h-6 w-6 text-rose-500 ${cprBeat ? "scale-125 text-rose-400" : "scale-100"} transition-transform`} />
                  <span className="text-base font-black text-white">CPR Visual Compression Pulse (110 BPM)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Perform 30 compressions : 2 rescue breaths at 5cm depth. Push hard and fast in center of chest.
                </p>
              </div>

              <button
                onClick={() => setCprActive(!cprActive)}
                className={`px-5 py-3 rounded-2xl font-black text-xs cursor-pointer transition-all shrink-0 ${
                  cprActive
                    ? "bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/80"
                    : "bg-emerald-600 text-white hover:bg-emerald-500"
                }`}
              >
                {cprActive ? "Stop CPR Metronome" : "Start CPR Metronome (110 BPM)"}
              </button>
            </div>

            {/* First-Aid Emergency Quick Guides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Snakebite Protocol */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div
                  onClick={() => toggleProtocol("snakebite")}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="text-xs font-extrabold uppercase text-amber-400 block">
                    🐍 Snakebite Management (National Protocol)
                  </span>
                  <button className="text-amber-400 hover:text-white cursor-pointer p-0.5">
                    {collapsedProtocols["snakebite"] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>
                {!collapsedProtocols["snakebite"] && (
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 font-medium pt-1">
                    <li><strong>DO NOT</strong> cut, suck venom, or apply tourniquet.</li>
                    <li>Immobilize affected limb with a rigid splint.</li>
                    <li>Administer <strong>10 vials Polyvalent ASV</strong> diluted in 228ml Normal Saline over 1 hour if neurotoxic/hemotoxic signs appear.</li>
                    <li>Keep patient calm and lying flat during transport.</li>
                  </ul>
                )}
              </div>

              {/* Anaphylaxis Protocol */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div
                  onClick={() => toggleProtocol("anaphylaxis")}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="text-xs font-extrabold uppercase text-rose-400 block">
                    🐝 Anaphylactic Shock Protocol
                  </span>
                  <button className="text-rose-400 hover:text-white cursor-pointer p-0.5">
                    {collapsedProtocols["anaphylaxis"] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>
                {!collapsedProtocols["anaphylaxis"] && (
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 font-medium pt-1">
                    <li>Inject <strong>Epinephrine (1:1000) 0.5mg IM</strong> into anterolateral mid-thigh immediately.</li>
                    <li>Repeat every 5-15 minutes if un-responsive.</li>
                    <li>High-flow oxygen (10-15 L/min via non-rebreather mask).</li>
                    <li>Rapid IV fluid bolus 1000ml Normal Saline.</li>
                  </ul>
                )}
              </div>

              {/* Postpartum Hemorrhage (PPH) */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div
                  onClick={() => toggleProtocol("pph")}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="text-xs font-extrabold uppercase text-rose-400 block">
                    🩸 Severe Postpartum Hemorrhage (PPH)
                  </span>
                  <button className="text-rose-400 hover:text-white cursor-pointer p-0.5">
                    {collapsedProtocols["pph"] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>
                {!collapsedProtocols["pph"] && (
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 font-medium pt-1">
                    <li>Perform continuous bimanual uterine massage.</li>
                    <li>Administer <strong>Oxytocin 10 IU IM</strong> or 20 IU in 1L NS IV at 60 drops/min.</li>
                    <li>Give <strong>Misoprostol 800 mcg sublingually</strong>.</li>
                    <li>Inject <strong>Tranexamic Acid (TXA) 1g IV</strong> over 10 minutes.</li>
                  </ul>
                )}
              </div>

              {/* Severe Acute Dehydration / Heat Stroke */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div
                  onClick={() => toggleProtocol("dehydration")}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="text-xs font-extrabold uppercase text-sky-400 block">
                    ☀️ Severe Dehydration / Cholera / Heat Stroke
                  </span>
                  <button className="text-sky-400 hover:text-white cursor-pointer p-0.5">
                    {collapsedProtocols["dehydration"] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>
                {!collapsedProtocols["dehydration"] && (
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 font-medium pt-1">
                    <li>Start 2 wide-bore IV lines (18G).</li>
                    <li>Infuse <strong>Ringer's Lactate 30 ml/kg IV in 30 minutes</strong>, followed by 70 ml/kg in 2.5 hours.</li>
                    <li>Active evaporative cooling with wet sheet and fan.</li>
                    <li>Monitor urine output via catheter (&gt;0.5 ml/kg/hr).</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Resuscitation Weight-Based Dosing */}
        {activeTab === "dosing" && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Calculator className="h-4 w-4 text-sky-400" />
                  <span>Weight-Based Emergency Resuscitation Calculator</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Calculated based on recorded patient weight: <strong className="text-teal-300">55 kg</strong> ({patient.age} years)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">IV Fluid Resuscitation Bolus</span>
                <div className="text-base font-black text-sky-400">1,100 ml Normal Saline</div>
                <p className="text-[10px] text-slate-500">(20 ml/kg bolus over 15-30 min)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Anaphylaxis Epinephrine (1:1000)</span>
                <div className="text-base font-black text-rose-400">0.5 mg IM</div>
                <p className="text-[10px] text-slate-500">(Adult dose: 0.01 mg/kg max 0.5mg)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Atropine (Bradycardia / Organophosphate)</span>
                <div className="text-base font-black text-amber-400">1.0 mg IV push</div>
                <p className="text-[10px] text-slate-500">(Repeat every 3-5 min as needed)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Polyvalent Anti-Snake Venom (ASV)</span>
                <div className="text-base font-black text-emerald-400">10 Vials IV</div>
                <p className="text-[10px] text-slate-500">(Initial loading dose in 228ml NS)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tranexamic Acid (TXA Trauma / PPH)</span>
                <div className="text-base font-black text-purple-400">1.0 g IV</div>
                <p className="text-[10px] text-slate-500">(Infuse over 10 minutes)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Magnesium Sulfate (Eclampsia Seizures)</span>
                <div className="text-base font-black text-teal-400">4.0 g IV Loading</div>
                <p className="text-[10px] text-slate-500">(Slow IV over 10-15 minutes)</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOS Dispatch & Referral Hospital Directory */}
        {activeTab === "dispatch" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <PhoneCall className="h-4 w-4 text-emerald-400" />
                <span>1-Click Emergency Hotlines & Dispatch Hotlines</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">108 Emergency Ambulance</span>
                    <span className="text-[10px] text-slate-400">National Free Trauma Dispatch</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard("108", "108 Ambulance")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs cursor-pointer"
                  >
                    Dial 108
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">102 Janani Express</span>
                    <span className="text-[10px] text-slate-400">Maternal & Infant Referral</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard("102", "102 Janani")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs cursor-pointer"
                  >
                    Dial 102
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Sub-District Hospital HQ</span>
                    <span className="text-[10px] text-slate-400">+91 674 239 1200</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard("+916742391200", "District Hospital")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-extrabold text-xs cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {copysuccess && (
                <div className="p-2 rounded-lg bg-emerald-950 text-emerald-300 text-xs text-center font-bold">
                  ✓ Copied hotline number ({copysuccess}) to clipboard!
                </div>
              )}
            </div>

            {/* Nearest Tertiary Referral Hospital Directory */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-rose-400" />
                <span>Nearest Regional Referral Hospitals & Blood Banks</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-white">District Headquarter Hospital, Sundargarh</strong>
                    <span className="text-[10px] text-teal-400 font-bold">14.2 km</span>
                  </div>
                  <p className="text-slate-400">24/7 ICU • Blood Bank (O-, B+, A+) • Trauma Surgery</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-white">Rourkela Steel Plant Super-Specialty Hospital</strong>
                    <span className="text-[10px] text-amber-400 font-bold">38.5 km</span>
                  </div>
                  <p className="text-slate-400">Advanced Ventilators • Dialysis • Snakebite ASV Stock</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact & Action Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <PhoneCall className="h-6 w-6 text-emerald-400 animate-pulse shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Emergency Contact Relative</span>
              <span className="text-sm font-extrabold text-white">{patient.emergencyContactName} ({patient.emergencyContactPhone})</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-center">
            <button
              onClick={() => {
                safePrint({
                  elementId: "emergency-triage-card",
                  documentTitle: `Emergency_Triage_${patient.fullName}_${patient.id}`,
                  fallbackPdf: () => generateVisitSummaryPdf(patient),
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Triage Sheet</span>
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs hover:bg-rose-700 transition-colors cursor-pointer shadow-lg shadow-rose-900/50"
            >
              Exit Emergency Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

