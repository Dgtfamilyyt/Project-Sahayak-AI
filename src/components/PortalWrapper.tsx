import React, { useState } from "react";
import {
  Users,
  FileText,
  Languages,
  Pill,
  Package,
  BarChart2,
  Database,
  AlertTriangle,
  Activity,
  Wifi,
  WifiOff,
  Cpu,
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HeartPulse,
  TrendingUp,
  MapPin,
  UserCheck,
  Plus,
  QrCode,
  Volume2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Patient, InventoryItem, SyncQueueItem, NetworkMode, OllamaConfig } from "../types";

interface PortalWrapperProps {
  patients: Patient[];
  inventory: InventoryItem[];
  syncQueue: SyncQueueItem[];
  networkMode: NetworkMode;
  ollamaConfig?: OllamaConfig;
  onNavigate: (tab: string) => void;
  onSelectPatient: (patient: Patient, targetTab: string) => void;
  onOpenEmergency: () => void;
  onToggleNetworkMode: () => void;
  onOpenOllamaModal?: () => void;
}

export const PortalWrapper: React.FC<PortalWrapperProps> = ({
  patients,
  inventory,
  syncQueue,
  networkMode,
  ollamaConfig,
  onNavigate,
  onSelectPatient,
  onOpenEmergency,
  onToggleNetworkMode,
  onOpenOllamaModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModulesCollapsed, setIsModulesCollapsed] = useState(false);
  const [isPatientsCollapsed, setIsPatientsCollapsed] = useState(false);

  const pendingSyncCount = syncQueue.filter((q) => q.status === "PENDING").length;
  const isOnline = networkMode === "online";

  // Low stock inventory count
  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minThreshold).length;

  // Filter patients for quick search
  const filteredPatients = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.village.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patients.slice(0, 4);

  const modules = [
    {
      id: "patients",
      title: "Patient Records & EMR",
      description: "Manage patient histories, vitals timeline, QR Health Pass, and offline clinical notes.",
      icon: Users,
      color: "bg-teal-500",
      lightBg: "bg-teal-50/80 hover:bg-teal-100/80 border-teal-200",
      iconColor: "text-teal-700",
      badge: `${patients.length} Registered`,
    },
    {
      id: "summarizer",
      title: "AI Medical Summarizer",
      description: "Transcribe voice consultations, generate ICD-11 codes, and extract clinical summaries.",
      icon: FileText,
      color: "bg-sky-500",
      lightBg: "bg-sky-50/80 hover:bg-sky-100/80 border-sky-200",
      iconColor: "text-sky-700",
      badge: "Voice & AI",
    },
    {
      id: "translator",
      title: "Multilingual Voice AI",
      description: "Translate real-time clinical conversations across 10 Indian regional languages.",
      icon: Languages,
      color: "bg-indigo-500",
      lightBg: "bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-200",
      iconColor: "text-indigo-700",
      badge: "10 Languages",
    },
    {
      id: "prescriptions",
      title: "Smart Prescriptions",
      description: "Generate Rx slips with automated drug-drug interaction safety checks and stock checks.",
      icon: Pill,
      color: "bg-emerald-500",
      lightBg: "bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200",
      iconColor: "text-emerald-700",
      badge: "Safety Engine",
    },
    {
      id: "inventory",
      title: "Pharmacy & Stock AI",
      description: "Monitor rural medicine inventory, stockout alerts, and automated replenishment logic.",
      icon: Package,
      color: "bg-amber-500",
      lightBg: "bg-amber-50/80 hover:bg-amber-100/80 border-amber-200",
      iconColor: "text-amber-700",
      badge: lowStockCount > 0 ? `${lowStockCount} Low Stock` : "Stock Healthy",
    },
    {
      id: "analytics",
      title: "SDG 3 Analytics Hub",
      description: "Track disease prevalence, maternal health indicators, and regional morbidity trends.",
      icon: BarChart2,
      color: "bg-purple-500",
      lightBg: "bg-purple-50/80 hover:bg-purple-100/80 border-purple-200",
      iconColor: "text-purple-700",
      badge: "SDG Metrics",
    },
    {
      id: "sync",
      title: "Offline Sync Center",
      description: "Inspect queued mutations, manage offline local cache, and sync to central cloud database.",
      icon: Database,
      color: "bg-blue-500",
      lightBg: "bg-blue-50/80 hover:bg-blue-100/80 border-blue-200",
      iconColor: "text-blue-700",
      badge: pendingSyncCount > 0 ? `${pendingSyncCount} Pending` : "Fully Synced",
    },
    {
      id: "emergency",
      title: "Emergency Red Triage",
      description: "Instant critical care protocol, trauma vitals monitoring, and emergency referral sheet.",
      icon: AlertTriangle,
      color: "bg-rose-500",
      lightBg: "bg-rose-50/80 hover:bg-rose-100/80 border-rose-200",
      iconColor: "text-rose-700",
      badge: "Red Alert",
      isAction: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Node Hub Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A365D] via-[#132A4B] to-[#0F2342] p-6 sm:p-8 text-white shadow-xl border border-teal-900/50">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-400/20 border border-teal-400/30 text-teal-300 text-xs font-bold tracking-wide">
              <MapPin className="h-3.5 w-3.5 text-teal-300" />
              <span>Node #402 • Sundargarh Sub-Health Centre, Odisha</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Community Health Worker Command Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Welcome back, <span className="text-teal-300 font-bold">CHW Ananya Sharma</span>.
              Project Sahayak AI operates uninterrupted offline to deliver rapid, AI-guided clinical intake, multilingual voice translation, and conflict-free cloud sync.
            </p>

            {/* Quick Search Bar */}
            <div className="pt-2">
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick Search Patient Name, ID, or Village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 text-white placeholder-slate-400 text-xs font-medium border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400/80 transition-all"
                />
              </div>
            </div>
          </div>

          {/* System Readiness Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 space-y-3 min-w-[280px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                <span>Edge System Status</span>
              </span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                Operational
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  {isOnline ? (
                    <Wifi className="h-3.5 w-3.5 text-teal-400" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  <span>Network Link</span>
                </span>
                <button
                  onClick={onToggleNetworkMode}
                  className={`font-bold px-2 py-0.5 rounded-lg text-[11px] cursor-pointer transition-colors ${
                    isOnline ? "bg-teal-500/20 text-teal-200" : "bg-amber-500/20 text-amber-200"
                  }`}
                >
                  {isOnline ? "Cloud Online" : "Rural Offline Edge"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  <Database className="h-3.5 w-3.5 text-sky-400" />
                  <span>Sync Queue</span>
                </span>
                <span className="font-bold text-white">
                  {pendingSyncCount > 0 ? `${pendingSyncCount} Pending` : "100% Synced"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  {ollamaConfig?.provider === "ollama" ? (
                    <Cpu className="h-3.5 w-3.5 text-teal-300" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  )}
                  <span>AI Engine</span>
                </span>
                <button
                  onClick={onOpenOllamaModal}
                  className="font-bold text-teal-300 hover:underline text-[11px] cursor-pointer"
                >
                  {ollamaConfig?.provider === "ollama" ? `Ollama (${ollamaConfig.model})` : "Gemini 3.6 API"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-teal-100 text-teal-700 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Registered Patients
            </span>
            <div className="text-lg font-black text-slate-900">{patients.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className={`p-3 rounded-xl shrink-0 ${pendingSyncCount > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Offline Sync Queue
            </span>
            <div className="text-lg font-black text-slate-900">{pendingSyncCount} Pending</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className={`p-3 rounded-xl shrink-0 ${lowStockCount > 0 ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700"}`}>
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Low Stock Alert
            </span>
            <div className="text-lg font-black text-slate-900">
              {lowStockCount > 0 ? `${lowStockCount} Items Low` : "Stock OK"}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
            <Languages className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Voice AI Dialects
            </span>
            <div className="text-lg font-black text-slate-900">10 Languages</div>
          </div>
        </div>
      </div>

      {/* Direct Module Launcher Grid */}
      <div className="space-y-3">
        <div
          onClick={() => setIsModulesCollapsed(!isModulesCollapsed)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Activity className="h-4 w-4 text-teal-600" />
            <span>Clinical Modules & AI Copilots</span>
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Click any module to launch</span>
            <button className="text-slate-600 hover:text-slate-900 p-0.5 cursor-pointer">
              {isModulesCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {!isModulesCollapsed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    if (mod.isAction) {
                      onOpenEmergency();
                    } else {
                      onNavigate(mod.id);
                    }
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group ${mod.lightBg}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl text-white ${mod.color} shadow-xs`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/80 text-slate-700 border border-slate-200">
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors flex items-center space-x-1">
                        <span>{mod.title}</span>
                      </h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 line-clamp-2">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs font-extrabold text-slate-700 group-hover:text-teal-700">
                    <span>Open Module</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Patient Directory Quick Access Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div
          onClick={() => setIsPatientsCollapsed(!isPatientsCollapsed)}
          className="flex items-center justify-between border-b border-slate-100 pb-3 cursor-pointer select-none"
        >
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-teal-600" />
              <span>Recent Patient Directory</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click a patient to open directly in Patient Manager, Voice Summarizer, or Prescriptions.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("patients");
              }}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({patients.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button className="text-slate-600 hover:text-slate-900 p-0.5 cursor-pointer">
              {isPatientsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {!isPatientsCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredPatients.map((p) => {
              const latestVisit = p.visits[0];
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{p.fullName}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {p.id} • {p.age}y/{p.gender}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {p.village}
                    </span>
                  </div>

                  {latestVisit && (
                    <div className="p-2 rounded-lg bg-white border border-slate-200/60 text-[11px] space-y-0.5">
                      <span className="text-[10px] font-bold text-teal-700 uppercase">Latest Complaint</span>
                      <p className="text-slate-700 line-clamp-1 font-medium">{latestVisit.chiefComplaint}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-1.5 pt-1">
                    <button
                      onClick={() => onSelectPatient(p, "patients")}
                      className="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-[#1A365D] text-white hover:bg-[#132A4B] transition-colors cursor-pointer"
                    >
                      EMR File
                    </button>
                    <button
                      onClick={() => onSelectPatient(p, "summarizer")}
                      className="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-sky-100 text-sky-800 hover:bg-sky-200 transition-colors cursor-pointer"
                    >
                      AI Summary
                    </button>
                    <button
                      onClick={() => onSelectPatient(p, "prescriptions")}
                      className="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                    >
                      Rx Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
