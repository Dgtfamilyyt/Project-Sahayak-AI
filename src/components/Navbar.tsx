import React from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Users,
  FileText,
  Languages,
  Pill,
  Package,
  BarChart2,
  Database,
  Activity,
  RotateCcw,
  Cpu,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { NetworkMode, OllamaConfig } from "../types";

interface NavbarProps {
  networkMode: NetworkMode;
  onToggleNetworkMode: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingSyncCount: number;
  onOpenEmergency: () => void;
  onResetData?: () => void;
  ollamaConfig?: OllamaConfig;
  onOpenOllamaModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  networkMode,
  onToggleNetworkMode,
  activeTab,
  setActiveTab,
  pendingSyncCount,
  onOpenEmergency,
  onResetData,
  ollamaConfig,
  onOpenOllamaModal,
}) => {
  const isOnline = networkMode === "online";

  const navItems = [
    { id: "landing", label: "Product Landing Page", icon: Sparkles },
    { id: "wrapper", label: "Hub Overview", icon: LayoutGrid },
    { id: "patients", label: "Patient Records", icon: Users },
    { id: "summarizer", label: "AI Summarizer", icon: FileText },
    { id: "translator", label: "Multilingual Voice", icon: Languages },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "inventory", label: "Inventory AI", icon: Package },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "sync", label: "Sync Center", icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1A365D] border-b border-teal-900/40 text-white shadow-xl">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("wrapper")}>
            <div className="h-10 w-10 rounded-xl bg-teal-400 flex items-center justify-center text-[#1A365D] font-bold shadow-md shadow-teal-400/20">
              <Activity className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">Project Sahayak AI</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  SDG 3 Copilot
                </span>
              </div>
              <p className="text-xs text-teal-100/70 font-medium hidden sm:block">
                Offline-First AI Healthcare for Rural Clinics
              </p>
            </div>
          </div>

          {/* Controls & Badges */}
          <div className="flex items-center space-x-2.5">
            {/* AI Provider / Ollama Integration Toggle Pill */}
            {onOpenOllamaModal && (
              <button
                onClick={onOpenOllamaModal}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                  ollamaConfig?.provider === "ollama"
                    ? "bg-teal-500/20 text-teal-200 border-teal-400/50 hover:bg-teal-500/30"
                    : "bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700"
                }`}
                title="Click to configure Ollama Local LLM / Gemini AI Engine"
              >
                {ollamaConfig?.provider === "ollama" ? (
                  <>
                    <Cpu className="h-4 w-4 text-teal-300 animate-pulse" />
                    <span className="hidden lg:inline">Ollama ({ollamaConfig.model})</span>
                    <span className="lg:hidden">Ollama</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span className="hidden lg:inline">Gemini 3.6 API</span>
                    <span className="lg:hidden font-semibold">Gemini</span>
                  </>
                )}
              </button>
            )}

            {/* Online / Offline Network Toggle */}
            <button
              onClick={onToggleNetworkMode}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isOnline
                  ? "bg-teal-900/60 text-teal-200 border-teal-400/40 hover:bg-teal-900/80"
                  : "bg-amber-900/60 text-amber-200 border-amber-400/50 hover:bg-amber-900/80"
              }`}
              title="Click to simulate offline / online network toggle"
            >
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-teal-300" />
                  <span className="hidden sm:inline">Cloud Connected</span>
                  <span className="sm:hidden">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-amber-300 animate-bounce" />
                  <span className="hidden sm:inline">Offline Edge AI</span>
                  <span className="sm:hidden">Offline</span>
                </>
              )}
            </button>

            {/* Pending Sync Count Badge */}
            <div
              onClick={() => setActiveTab("sync")}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#132A4B] text-slate-200 border border-slate-700/80 cursor-pointer hover:bg-[#1A365D] transition-colors"
              title="Click to view Sync Center"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${pendingSyncCount > 0 ? "text-amber-400 animate-spin" : "text-teal-300"}`} />
              <span className="font-bold">{pendingSyncCount}</span>
            </div>

            {/* Reset Data Button */}
            {onResetData && (
              <button
                onClick={onResetData}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
                title="Reset local demo data & restore defaults"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden xl:inline">Reset</span>
              </button>
            )}

            {/* Emergency Mode Button - Static and moved to far right */}
            <button
              onClick={onOpenEmergency}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer shadow-md shadow-red-600/30 shrink-0"
              title="Open Emergency Triage Mode"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>EMERGENCY</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1.5 overflow-x-auto py-2.5 scrollbar-none border-t border-teal-900/30">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-teal-400 text-[#1A365D] font-extrabold shadow-md shadow-teal-400/20"
                    : "text-slate-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.id === "sync" && pendingSyncCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-[#1A365D] font-extrabold">
                    {pendingSyncCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
