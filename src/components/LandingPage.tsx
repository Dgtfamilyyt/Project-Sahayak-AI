import React, { useState } from "react";
import {
  Wifi,
  WifiOff,
  Activity,
  Sparkles,
  Cpu,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  Database,
  Layers,
  FileText,
  Users,
  Zap,
  Check,
  Server,
  RefreshCw,
  Play,
  ChevronRight,
  ExternalLink,
  Code,
  Heart,
  AlertCircle,
  FileCode2,
} from "lucide-react";

interface LandingPageProps {
  onLaunchApp: () => void;
  onNavigateTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onNavigateTab }) => {
  // Hero Visual Toggle State
  const [heroIsOffline, setHeroIsOffline] = useState(false);

  // Interactive Demo State
  const [demoStep, setDemoStep] = useState<number>(1);
  const [demoIsGenerating, setDemoIsGenerating] = useState(false);
  const [demoOutput, setDemoOutput] = useState<string | null>(null);

  const handleRunDemoStep = (step: number) => {
    setDemoStep(step);
    if (step === 1) {
      setDemoIsGenerating(true);
      setDemoOutput(null);
      setTimeout(() => {
        setDemoIsGenerating(false);
        setDemoOutput("Cloud Gemini 3.6: Patient presents with acute fever (38.9°C), productive cough for 3 days. Previous history of mild asthma. Recommended: Sputum smear, Paracetamol 500mg, hydrate.");
      }, 800);
    } else if (step === 3) {
      setDemoIsGenerating(true);
      setDemoOutput(null);
      setTimeout(() => {
        setDemoIsGenerating(false);
        setDemoOutput("On-Device LLM (Edge): Patient report processed offline. Fever 38.9°C with cough x3 days. History: Asthma. Action: Hydration, antipyretic, observe respiration.");
      }, 1000);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* SubHeader Announcement Banner */}
      <div className="bg-gradient-to-r from-teal-900/80 via-[#1A365D] to-slate-900 border-b border-teal-800/40 py-2.5 px-4 text-center text-xs font-medium text-teal-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <span className="px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 font-extrabold text-[10px] uppercase tracking-wider border border-teal-400/30">
            Google / GDG Hackathon Showcase
          </span>
          <span>Project Sahayak AI — Resilient Offline-First Healthcare Copilot</span>
          <button
            onClick={onLaunchApp}
            className="hidden md:inline-flex items-center space-x-1 font-bold text-teal-400 hover:text-white underline cursor-pointer ml-2"
          >
            <span>Launch Live App</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden border-b border-slate-800">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-teal-500/30 text-teal-300 text-xs font-extrabold tracking-wider uppercase shadow-sm">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                <span>OFFLINE-FIRST • ON-DEVICE AI</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Healthcare AI that{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-400 to-sky-400 underline decoration-teal-400/40 decoration-wavy underline-offset-8">
                  doesn't disappear
                </span>{" "}
                when the internet does.
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
                Project Sahayak AI helps rural healthcare workers organize patient information and generate structured clinical reports — online with Gemini, offline with on-device AI.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onLaunchApp}
                  className="px-7 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-teal-500/25 hover:shadow-teal-400/35 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Activity className="h-5 w-5" />
                  <span>Try Sahayak</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>

                <button
                  onClick={() => scrollToSection("demo-section")}
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm sm:text-base border border-slate-700 hover:border-slate-600 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Play className="h-4 w-4 text-teal-400 fill-teal-400" />
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-slate-400 text-xs">
                <div>
                  <p className="font-extrabold text-white text-sm sm:text-base">100% Offline</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Local SQLite & On-Device LLM</p>
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm sm:text-base">Hybrid AI</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Gemini 3.6 + Local Model</p>
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm sm:text-base">Clinical Flow</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Symptom & History Structuring</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Interactive Android Concept Visual */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm rounded-[36px] bg-slate-950 p-4 ring-1 ring-slate-800 shadow-2xl shadow-teal-950/50">
                {/* Android Phone Header Bar */}
                <div className="flex items-center justify-between px-3 pb-3 text-slate-400 text-[10px] font-mono border-b border-slate-800/80">
                  <span>SAHAYAK MOBILE EMR</span>
                  <div className="flex items-center space-x-2">
                    {/* Interactive Connectivity Toggle */}
                    <button
                      onClick={() => setHeroIsOffline(!heroIsOffline)}
                      className={`px-2 py-0.5 rounded-full font-sans text-[10px] font-bold border transition-all cursor-pointer flex items-center space-x-1 ${
                        heroIsOffline
                          ? "bg-amber-950 text-amber-300 border-amber-600/50"
                          : "bg-teal-950 text-teal-300 border-teal-600/50"
                      }`}
                      title="Click to toggle network state in visualization"
                    >
                      {heroIsOffline ? (
                        <>
                          <WifiOff className="h-3 w-3 text-amber-400" />
                          <span>OFFLINE</span>
                        </>
                      ) : (
                        <>
                          <Wifi className="h-3 w-3 text-teal-400" />
                          <span>ONLINE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Phone Body Container */}
                <div className="p-4 space-y-3 bg-slate-900 rounded-[24px] mt-3 border border-slate-800/80">
                  {/* Status Indicator Bar */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    heroIsOffline
                      ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                      : "bg-teal-950/40 border-teal-500/40 text-teal-200"
                  }`}>
                    <div className="flex items-center space-x-2">
                      {heroIsOffline ? (
                        <Cpu className="h-4 w-4 text-amber-400 animate-pulse" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-teal-400" />
                      )}
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider">
                          {heroIsOffline ? "OFFLINE • AI: On-device" : "ONLINE • AI: Gemini 3.6"}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {heroIsOffline ? "Edge Inference Running" : "Cloud Gateway Active"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {heroIsOffline ? "Local" : "Cloud"}
                    </span>
                  </div>

                  {/* Patient Info Card */}
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Patient File #R-802</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">Rampur Village</span>
                    </div>
                    <p className="text-xs font-extrabold text-white">Sunita Sharma, 34y / Female</p>
                    <p className="text-[10px] text-slate-300">
                      <strong className="text-slate-400">History:</strong> Asthma (mild), Penicillin Allergy
                    </p>
                  </div>

                  {/* Symptoms Input */}
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-left space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Entered Symptoms (Voice / Text)</span>
                    <p className="text-[11px] text-slate-200 font-mono italic">
                      "Fever for 3 days, chest tightness, dry cough in evening, difficulty breathing while walking."
                    </p>
                  </div>

                  {/* AI Generated Clinical Report Card */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-teal-500/30 text-left space-y-2">
                    <div className="flex items-center justify-between text-teal-300">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1">
                        <FileText className="h-3 w-3 text-teal-400" />
                        <span>Structured Clinical Report</span>
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400">✓ Ready</span>
                    </div>
                    <div className="space-y-1 text-[10px] text-slate-300 font-sans">
                      <p><strong className="text-slate-200">Chief Complaint:</strong> Acute pyrexia & exertional dyspnea</p>
                      <p><strong className="text-slate-200">History Cross-Check:</strong> Known asthma history noted</p>
                      <p><strong className="text-slate-200">Action:</strong> Measure SpO2, evaluate peak flow, avoid beta-blockers</p>
                    </div>
                  </div>

                  {/* Transition Callout */}
                  <div className="text-center pt-1">
                    <p className="text-[10px] text-slate-400 font-medium">
                      Toggle button above to switch between <span className="text-teal-300 font-bold">ONLINE</span> and <span className="text-amber-300 font-bold">OFFLINE</span> modes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 sm:py-24 bg-slate-950/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400">Real-World Clinical Bottlenecks</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              When connectivity becomes a clinical bottleneck.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Rural healthcare workers often work with limited connectivity, paper-heavy workflows, difficult-to-interpret medical notes, and patients who struggle to clearly describe their symptoms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">1. Difficult Documentation</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Important patient information can be difficult to organize and revisit during busy village clinic days.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">2. Unclear Symptom Descriptions</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Healthcare workers spend valuable time turning fragmented descriptions into usable notes and structured records.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <WifiOff className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">3. Unreliable Connectivity</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Cloud-only AI becomes unavailable when connectivity disappears in remote sub-centers and field visits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 sm:py-24 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">The Resilient Solution</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Meet Sahayak.</h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Sahayak combines local patient data with hybrid AI so healthcare workers can continue their workflow regardless of connectivity.
            </p>
          </div>

          {/* Workflow Diagram */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <Users className="h-5 w-5 text-teal-400 mx-auto" />
                <p className="text-xs font-bold text-white">Patient Data</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <Database className="h-5 w-5 text-sky-400 mx-auto" />
                <p className="text-xs font-bold text-white">Existing History</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <Activity className="h-5 w-5 text-amber-400 mx-auto" />
                <p className="text-xs font-bold text-white">Current Symptoms</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <Layers className="h-5 w-5 text-purple-400 mx-auto" />
                <p className="text-xs font-bold text-white">AI Context</p>
              </div>
              <div className="p-3 rounded-xl bg-teal-950/80 border border-teal-500/40 space-y-1">
                <Cpu className="h-5 w-5 text-teal-300 mx-auto" />
                <p className="text-xs font-extrabold text-teal-200">Gemini / On-device</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 space-y-1">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto" />
                <p className="text-xs font-extrabold text-emerald-200">Clinical Report</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offline AI Section (Most Important Section) */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase border border-amber-500/30">
              <Zap className="h-3.5 w-3.5" />
              <span>Core Architectural Differentiator</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              The AI works offline. <br className="hidden sm:inline" />
              <span className="text-teal-400">Not just the database.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              Same patient data. Same workflow. Different AI engine.
            </p>
          </div>

          {/* Large Comparison Component */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* ONLINE CARD */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-teal-500/40 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300">
                    <Wifi className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">ONLINE</h3>
                    <p className="text-xs text-teal-400 font-bold">Cloud Connected</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Gemini 3.6 Flash API
                </span>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Network Status:</span>
                  <span className="text-emerald-400 font-bold">Internet Available (3G/4G/Wi-Fi)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Inference Engine:</span>
                  <span className="text-teal-300 font-extrabold">Google Gemini 3.6 API</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Output:</span>
                  <span className="text-white font-bold">Comprehensive Structured Summary</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                When connected, Sahayak leverages the full power of cloud Gemini for deep clinical syntheses, multi-modal dictations, and automatic sync with regional health databases.
              </p>
            </div>

            {/* OFFLINE CARD */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500/40 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                    <WifiOff className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">OFFLINE</h3>
                    <p className="text-xs text-amber-400 font-bold">Zero Internet</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  On-Device Local LLM
                </span>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Network Status:</span>
                  <span className="text-amber-400 font-bold">Airplane Mode / No Signal</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Inference Engine:</span>
                  <span className="text-amber-300 font-extrabold">On-Device LLM (Edge Model)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Output:</span>
                  <span className="text-white font-bold">Local Structured Clinical Report</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                When signal is lost, Sahayak seamlessly routes prompt context to an on-device LLM model. Local SQLite patient data remains instantly readable and writeable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Flow (5-step timeline) */}
      <section className="py-16 sm:py-24 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-sky-400">Seamless Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">From patient to structured report.</h2>
            <p className="text-sm text-slate-300">A 5-step clinical documentation flow designed for village sub-centers.</p>
          </div>

          {/* 5 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-2xl font-black text-teal-400">01</span>
              <h3 className="text-sm font-extrabold text-white">Select Patient</h3>
              <p className="text-xs text-slate-400 font-medium">Search or scan QR ID to open local profile instantly.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-2xl font-black text-teal-400">02</span>
              <h3 className="text-sm font-extrabold text-white">Review History</h3>
              <p className="text-xs text-slate-400 font-medium">Instantly cross-check past visits, chronic diseases, and allergies.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-2xl font-black text-teal-400">03</span>
              <h3 className="text-sm font-extrabold text-white">Enter Symptoms</h3>
              <p className="text-xs text-slate-400 font-medium">Type or dictate patient descriptions in local language or English.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-2xl font-black text-teal-400">04</span>
              <h3 className="text-sm font-extrabold text-white">Generate Report</h3>
              <p className="text-xs text-slate-400 font-medium">AI structures data into standardized medical observations.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-2xl font-black text-teal-400">05</span>
              <h3 className="text-sm font-extrabold text-white">Save Locally</h3>
              <p className="text-xs text-slate-400 font-medium">Record is saved to Room/SQLite database and queued for sync.</p>
            </div>
          </div>

          {/* Sample Generated Report Preview */}
          <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase text-teal-300">Sample Generated Report Structure</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Standardized Medical Format</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Chief Complaint</span>
                <p className="text-slate-200 font-medium mt-0.5">High fever with chills & severe body ache</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Duration</span>
                <p className="text-slate-200 font-medium mt-0.5">4 days onset</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Associated Symptoms</span>
                <p className="text-slate-200 font-medium mt-0.5">Retro-orbital pain, mild nausea</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Previous Relevant History</span>
                <p className="text-slate-200 font-medium mt-0.5">Type-2 Diabetes, Hypertension</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] font-bold uppercase text-teal-400 block">Clinical Summary & Follow-up</span>
              <p className="text-slate-300 font-medium mt-1 leading-relaxed">
                Patient exhibits symptoms consistent with acute viral illness / suspected dengue endemic pattern. Check platelet counts, initiate oral rehydration, avoid NSAIDs due to bleeding risks, monitor glucose levels.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <span><strong>Disclaimer:</strong> Sahayak assists with documentation and does not diagnose or prescribe. All medical decisions remain with qualified healthcare personnel.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 sm:py-24 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">Robust Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Built for unreliable connectivity.</h2>
            <p className="text-sm text-slate-300">Clean Android & hybrid AI pipeline ensuring zero data loss.</p>
          </div>

          {/* Architecture Visualization */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 max-w-4xl mx-auto space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold text-teal-400 uppercase tracking-wider flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>System Stack Architecture</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Android Native + Hybrid LLM</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 flex items-center justify-between">
                <span>Android App Interface</span>
                <span className="text-teal-400">Jetpack Compose</span>
              </div>
              <div className="text-center text-slate-600 text-xs">↓</div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 flex items-center justify-between">
                <span>Business & State Management</span>
                <span className="text-sky-400">ViewModel + Repository</span>
              </div>
              <div className="text-center text-slate-600 text-xs">↓</div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 flex items-center justify-between">
                <span>Local Storage Engine</span>
                <span className="text-emerald-400">Room / SQLite Database</span>
              </div>
              <div className="text-center text-slate-600 text-xs">↓</div>
              <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-slate-200 space-y-2">
                <span className="font-extrabold text-teal-300 uppercase block text-[11px]">AI Manager (Hybrid Router)</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900 border border-teal-500/30">
                    <strong className="text-teal-400">ONLINE:</strong> Gemini 3.6 API
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-amber-500/30">
                    <strong className="text-amber-400">OFFLINE:</strong> On-device Local LLM
                  </div>
                </div>
              </div>
              <div className="text-center text-slate-600 text-xs">↓</div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 flex items-center justify-between">
                <span>Background Sync Engine</span>
                <span className="text-purple-400">WorkManager → Cloud Sync when online</span>
              </div>
            </div>
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {["Kotlin", "Jetpack Compose", "Room", "SQLite", "Gemini", "On-device LLM", "WorkManager"].map((tech, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 shadow-xs">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 sm:py-24 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Human-Centered Design</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Built around a real healthcare workflow.</h2>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-4xl mx-auto space-y-6 text-center">
            <p className="text-base sm:text-lg text-slate-200 font-medium italic leading-relaxed">
              "We spoke with a rural healthcare worker and used their workflow to narrow Sahayak's focus to documentation and symptom organization."
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4 border-t border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-teal-400">Workflow First</span>
                <p className="text-xs text-slate-300 font-medium">Designed directly around the natural clinician-patient consultation pattern.</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-amber-400">Low-Connectivity Resilient</span>
                <p className="text-xs text-slate-300 font-medium">Built specifically to excel in zero-signal village environments.</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-sky-400">Practical Documentation</span>
                <p className="text-xs text-slate-300 font-medium">Focused purely on saving time and eliminating paper clutter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo-section" className="py-16 sm:py-24 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">Interactive Proof</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Watch Sahayak survive airplane mode.</h2>
            <p className="text-sm text-slate-300">Interactive step-by-step test demonstrating offline resilience.</p>
          </div>

          {/* Interactive Steps Box */}
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 text-left">
            {/* Step Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleRunDemoStep(1)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  demoStep === 1 ? "bg-teal-500/20 text-teal-300 border-teal-500/50" : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                STEP 1: Online Mode
              </button>
              <button
                onClick={() => handleRunDemoStep(2)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  demoStep === 2 ? "bg-amber-500/20 text-amber-300 border-amber-500/50" : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                STEP 2: Airplane Mode ON
              </button>
              <button
                onClick={() => handleRunDemoStep(3)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  demoStep === 3 ? "bg-amber-500/20 text-amber-300 border-amber-500/50" : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                STEP 3: Offline Gen
              </button>
              <button
                onClick={() => handleRunDemoStep(4)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  demoStep === 4 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                STEP 4: Success
              </button>
            </div>

            {/* Interactive Stage Display */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-extrabold uppercase text-slate-300">
                  {demoStep === 1 && "🌐 STEP 1: Online Mode — Connected to Cloud"}
                  {demoStep === 2 && "✈️ STEP 2: Airplane Mode Activated — Internet Disconnected"}
                  {demoStep === 3 && "🤖 STEP 3: Offline Report Request — Triggering Local LLM"}
                  {demoStep === 4 && "✅ STEP 4: Report Generated & Saved to Room Database"}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  demoStep === 1 ? "bg-teal-950 text-teal-300 border border-teal-500/30" : "bg-amber-950 text-amber-300 border border-amber-500/30"
                }`}>
                  {demoStep === 1 ? "AI Engine: Gemini 3.6 API" : "AI Engine: On-Device LLM"}
                </span>
              </div>

              <div className="space-y-2 text-xs font-sans text-slate-300">
                {demoStep === 1 && (
                  <p>System is online. Clinical prompts process via Google Cloud Gemini 3.6 with maximum speed and context.</p>
                )}
                {demoStep === 2 && (
                  <p className="text-amber-300 font-medium">
                    Signal lost! Network status flips to <span className="underline font-bold">Offline Edge AI</span>. All patient records remain 100% accessible locally.
                  </p>
                )}
                {demoStep === 3 && (
                  <p className="text-teal-300 font-medium">
                    Healthcare worker taps "Generate Report". AI Manager reroutes context directly to the on-device LLM model.
                  </p>
                )}
                {demoStep === 4 && (
                  <p className="text-emerald-300 font-medium">
                    Structured clinical report successfully created offline and stored in SQLite queue. Zero data loss!
                  </p>
                )}

                {demoIsGenerating && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-teal-500/30 text-teal-300 font-mono text-[11px] flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-teal-400" />
                    <span>Inference running...</span>
                  </div>
                )}

                {demoOutput && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Generated Result:</span>
                    <p>{demoOutput}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-900 to-slate-950 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Healthcare shouldn't go offline just because the internet does.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Project Sahayak AI brings resilient AI-assisted documentation to environments where connectivity can't be guaranteed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onLaunchApp}
              className="px-8 py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-400/35 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Activity className="h-5 w-5" />
              <span>Try Sahayak</span>
              <ArrowRight className="h-5 w-5 ml-1" />
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="px-7 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base border border-slate-700 transition-all flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-teal-400 flex items-center justify-center text-[#1A365D] font-bold">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm">Project Sahayak AI</p>
              <p className="text-[11px] text-slate-500">Built by Black Matrix</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-slate-400 font-medium">
            <button onClick={() => scrollToSection("demo-section")} className="hover:text-white transition-colors cursor-pointer">
              Demo
            </button>
            <button onClick={onLaunchApp} className="hover:text-white transition-colors cursor-pointer">
              App Portal
            </button>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
