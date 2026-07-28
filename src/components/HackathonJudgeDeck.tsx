import React, { useState } from "react";
import {
  Award,
  BookOpen,
  Code2,
  Database,
  Layers,
  Terminal,
  Play,
  Clock,
  Sparkles,
  CheckCircle2,
  Copy,
  Search,
  Zap,
  Target,
  X,
  FileText,
} from "lucide-react";
import { HACKATHON_DELIVERABLES } from "../data/mockData";
import { HackathonDeliverable } from "../types";

interface HackathonJudgeDeckProps {
  onClose?: () => void;
}

export const HackathonJudgeDeck: React.FC<HackathonJudgeDeckProps> = ({ onClose }) => {
  const [selectedDeliverable, setSelectedDeliverable] = useState<HackathonDeliverable>(
    HACKATHON_DELIVERABLES[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(180); // 3-minute pitch timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const filteredDeliverables = HACKATHON_DELIVERABLES.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyContent = () => {
    navigator.clipboard.writeText(selectedDeliverable.content + (selectedDeliverable.codeOrDiagram ? "\n\n" + selectedDeliverable.codeOrDiagram : ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePitchTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(true);
    }
  };

  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-teal-500/20">
            <Award className="h-7 w-7 text-[#1A365D]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white">Project Sahayak AI — Hackathon Judge Deck</h2>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Tech for Good 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Complete Documentation & Deliverables 1-16 for Judges & Reviewers
            </p>
          </div>
        </div>

        {/* 3-Minute Pitch Timer Control */}
        <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-teal-300 font-mono font-extrabold text-sm">
            <Clock className="h-4 w-4" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          <button
            onClick={togglePitchTimer}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              isTimerRunning ? "bg-rose-600 text-white" : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            {isTimerRunning ? "Pause Pitch" : "Start 3m Pitch"}
          </button>

          <button
            onClick={() => setTimerSeconds(180)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Reset
          </button>

          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar for Deliverables */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search deliverables (e.g. UVP, Architecture, Database Schema, Demo Script, MVP Scope, Pitch)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        />
      </div>

      {/* Main Grid: Deliverables Menu + Display View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 16 Deliverables Master Menu (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950 rounded-2xl border border-slate-800 p-3 h-[600px] flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 py-2 block border-b border-slate-800">
            Hackathon Requirements (1 - 16)
          </span>

          <div className="flex-1 overflow-y-auto space-y-1.5 mt-2 pr-1">
            {filteredDeliverables.map((item) => {
              const isSelected = selectedDeliverable.id === item.id;
              return (
                <div
                  key={item.id}

                  onClick={() => setSelectedDeliverable(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate pr-2">{item.title}</span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Deliverable Document Inspector (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between h-[600px]">
          <div className="space-y-4 overflow-y-auto pr-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-amber-400">{selectedDeliverable.title}</h3>
                <span className="text-xs font-mono text-slate-500">{selectedDeliverable.category}</span>
              </div>

              <button

                onClick={handleCopyContent}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
                <span>{copied ? "Copied!" : "Copy Content"}</span>
              </button>
            </div>

            {/* Formatted Text Content */}
            <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line space-y-2">
              {selectedDeliverable.content}
            </div>

            {/* Optional ASCII / Code Diagram Box */}
            {selectedDeliverable.codeOrDiagram && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre leading-snug">
                {selectedDeliverable.codeOrDiagram}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Project Sahayak AI • UN SDG 3 Hackathon Entry</span>
            <span className="font-bold text-amber-400">Score Maximized ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};
