import React, { useState, useEffect } from "react";
import {
  Cpu,
  Server,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Play,
  Zap,
  ShieldCheck,
  X,
  Globe,
  WifiOff,
  Database,
  HelpCircle,
  Activity,
  Terminal,
} from "lucide-react";
import { OllamaConfig, AIProvider, OllamaStatusResponse } from "../types";
import { saveOllamaConfig } from "../utils/offlineStorage";
import { checkOllamaHealth, queryOllama } from "../utils/ollamaClient";

interface OllamaSettingsModalProps {
  config: OllamaConfig;
  onUpdateConfig: (newConfig: OllamaConfig) => void;
  onClose: () => void;
}

const COMMON_MODELS = [
  { name: "llama3.2", size: "3B / 1.8GB", desc: "Meta Llama 3.2 - Fast, lightweight, ideal for edge hardware" },
  { name: "mistral", size: "7B / 4.1GB", desc: "Mistral 7B - Excellent clinical reasoning and structured JSON output" },
  { name: "medllama2", size: "7B / 4.2GB", desc: "MedLlama2 - Fine-tuned for medical terminology and clinical summaries" },
  { name: "gemma2", size: "2B / 1.6GB", desc: "Google Gemma 2 - Highly efficient on modest CPUs" },
  { name: "phi3", size: "3.8B / 2.3GB", desc: "Microsoft Phi-3 Mini - High reasoning efficiency for primary health" },
  { name: "qwen2.5", size: "3B / 2.0GB", desc: "Qwen 2.5 - Multilingual performance for regional clinical notes" },
];

const PRESET_HOSTS = [
  { label: "Local Host (Default)", url: "http://localhost:11434" },
  { label: "Loopback IP", url: "http://127.0.0.1:11434" },
  { label: "Local Subnet Server", url: "http://192.168.1.100:11434" },
];

export const OllamaSettingsModal: React.FC<OllamaSettingsModalProps> = ({
  config,
  onUpdateConfig,
  onClose,
}) => {
  const [provider, setProvider] = useState<AIProvider>(config.provider);
  const [host, setHost] = useState<string>(config.host);
  const [model, setModel] = useState<string>(config.model);
  const [autoFallback, setAutoFallback] = useState<boolean>(config.autoFallback);

  const [status, setStatus] = useState<OllamaStatusResponse | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Playground Sandbox State
  const [testPrompt, setTestPrompt] = useState<string>(
    "Patient: 45 y/o female with 3-day history of high fever, dry cough, and mild shortness of breath. Vitals: BP 110/70, Temp 38.8 C, SpO2 96%. Summarize chief complaint and risk flags in JSON."
  );
  const [testOutput, setTestOutput] = useState<string>("");
  const [isTestingPrompt, setIsTestingPrompt] = useState<boolean>(false);
  const [testLatencyMs, setTestLatencyMs] = useState<number | null>(null);

  // Check Ollama status on mount
  useEffect(() => {
    checkOllamaStatus(host);
  }, []);

  const checkOllamaStatus = async (targetHost: string) => {
    setIsChecking(true);
    try {
      const data = await checkOllamaHealth(targetHost);
      setStatus(data);

      // If connected and model not in list, auto-select first available if needed
      if (data.connected && data.models.length > 0 && !data.models.includes(model)) {
        if (data.models.includes("llama3.2")) {
          setModel("llama3.2");
        } else {
          setModel(data.models[0]);
        }
      }
    } catch (err) {
      setStatus({
        connected: false,
        host: targetHost,
        models: [],
        error: "Network request failed while connecting to server backend",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = () => {
    const updated: OllamaConfig = {
      provider,
      host,
      model,
      autoFallback,
    };
    saveOllamaConfig(updated);
    onUpdateConfig(updated);
    onClose();
  };

  const handleRunPlaygroundTest = async () => {
    setIsTestingPrompt(true);
    setTestOutput("");
    setTestLatencyMs(null);

    const startTime = performance.now();
    try {
      const { response: rawText, source } = await queryOllama({
        host,
        model,
        prompt: testPrompt,
        systemPrompt: "You are a rural health clinical assistant AI. Output clean, formatted JSON.",
      });

      const endTime = performance.now();
      setTestLatencyMs(Math.round(endTime - startTime));
      setTestOutput(`[Channel: ${source === "browser" ? "Direct Browser Loopback" : "Backend Server Proxy"}]\n\n${rawText}`);
    } catch (err: any) {
      setTestOutput(`Connection Error: ${err.message}\n\nTip: If running Ollama locally, launch with: OLLAMA_ORIGINS="*" ollama serve`);
    } finally {
      setIsTestingPrompt(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#1A365D] text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-bold">
              <Cpu className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold tracking-tight">Ollama Model Integration</h3>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-teal-500/30">
                  Air-Gapped Offline LLM
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Configure local or edge LLM inference for 100% offline primary health centers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Active AI Provider Switcher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Primary AI Inference Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider("gemini")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  provider === "gemini"
                    ? "bg-teal-50 border-teal-500 text-teal-950 ring-2 ring-teal-500/20"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    <span>Google Gemini 3.6 Flash</span>
                  </div>
                  {provider === "gemini" && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
                </div>
                <p className="text-xs text-slate-500">
                  Cloud API • Multi-modal, ultra-fast clinical reasoning (requires internet).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProvider("ollama")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  provider === "ollama"
                    ? "bg-teal-50 border-teal-500 text-teal-950 ring-2 ring-teal-500/20"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <Cpu className="h-4 w-4 text-teal-600" />
                    <span>Ollama Local / Edge Model</span>
                  </div>
                  {provider === "ollama" && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
                </div>
                <p className="text-xs text-slate-500">
                  Edge / Local Server • 100% offline, privacy-first, zero cloud latency.
                </p>
              </button>
            </div>
          </div>

          {/* Ollama Connection & Server Configuration */}
          <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-800">Ollama Server Endpoint Config</h4>
              </div>
              <button
                onClick={() => checkOllamaStatus(host)}
                disabled={isChecking}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}`} />
                <span>Test Connection</span>
              </button>
            </div>

            {/* Host Input & Presets */}
            <div className="space-y-2">
              <label className="text-xs text-slate-600 font-medium">Ollama Service URL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                />
                <button
                  onClick={() => checkOllamaStatus(host)}
                  disabled={isChecking}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
                >
                  Ping
                </button>
              </div>

              {/* Host Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400">Presets:</span>
                {PRESET_HOSTS.map((preset) => (
                  <button
                    key={preset.url}
                    onClick={() => {
                      setHost(preset.url);
                      checkOllamaStatus(preset.url);
                    }}
                    className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                      host === preset.url
                        ? "bg-slate-200 border-slate-400 font-bold text-slate-900"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Connection Status Banner */}
            {status && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  status.connected
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {status.connected ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold">
                      {status.connected
                        ? `Connected to Ollama Server @ ${status.host}`
                        : "Ollama Offline or Unreachable"}
                    </span>
                    <p className="text-[11px] opacity-90">
                      {status.connected
                        ? `Detected ${status.models.length} model(s): ${status.models.join(", ")}`
                        : status.error || "Launch Ollama locally via 'ollama serve' or check port 11434."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Model Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-700 font-bold flex items-center justify-between">
                <span>Selected Ollama Model:</span>
                <span className="text-[11px] font-mono text-teal-700">active: {model}</span>
              </label>

              {status?.connected && status.models.length > 0 ? (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                >
                  {status.models.map((m) => (
                    <option key={m} value={m}>
                      {m} (Installed on Ollama Server)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. llama3.2"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    Recommended models for rural healthcare: <span className="font-mono font-bold text-slate-700">llama3.2</span>, <span className="font-mono font-bold text-slate-700">mistral</span>, <span className="font-mono font-bold text-slate-700">medllama2</span>
                  </p>
                </div>
              )}

              {/* Quick Model Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {COMMON_MODELS.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setModel(m.name)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      model === m.name
                        ? "bg-teal-50 border-teal-500 text-teal-950 font-medium"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900">{m.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{m.size}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Fallback Checkbox */}
            <div className="pt-2">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoFallback}
                  onChange={(e) => setAutoFallback(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span>Automatically fallback between Gemini Cloud and Ollama Edge if primary fails</span>
              </label>
            </div>
          </div>

          {/* Interactive Ollama Playground Diagnostic */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-teal-600" />
                <h4 className="text-sm font-bold text-slate-900">Ollama Interactive Test Playground</h4>
              </div>
              {testLatencyMs !== null && (
                <span className="text-xs font-mono bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-200">
                  Latency: {testLatencyMs} ms
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Run a test clinical inference against <span className="font-mono text-slate-800">{model}</span> at <span className="font-mono text-slate-800">{host}</span>:
            </p>

            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunPlaygroundTest}
                disabled={isTestingPrompt}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors flex items-center space-x-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isTestingPrompt ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Executing Inference...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Run Test Prompt</span>
                  </>
                )}
              </button>
            </div>

            {testOutput && (
              <div className="mt-3 p-3 rounded-xl bg-slate-900 text-teal-300 font-mono text-xs overflow-x-auto max-h-40 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Ollama Output Response:</div>
                <pre className="whitespace-pre-wrap">{testOutput}</pre>
              </div>
            )}
          </div>

          {/* Rural PHC Setup Guide Notice */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-slate-800 space-y-2 text-xs">
            <div className="flex items-center space-x-2 font-bold text-teal-950">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Deploying Ollama in Primary Health Centers (PHC)</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
              <li>Install Ollama on the health worker laptop or PHC desktop server: <span className="font-mono font-bold text-slate-800">curl -fsSL https://ollama.com/install.sh | sh</span></li>
              <li>Pull the lightweight Llama 3.2 3B clinical model: <span className="font-mono font-bold text-slate-800">ollama pull llama3.2</span></li>
              <li>For multi-room clinic networks, launch Ollama with network binding: <span className="font-mono font-bold text-slate-800">OLLAMA_HOST=0.0.0.0:11434 ollama serve</span></li>
              <li>Ensures 100% patient record confidentiality - no medical data ever leaves the local facility.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Activity className="h-4 w-4 text-teal-600" />
            <span>Active Provider: <strong className="text-slate-800 uppercase">{provider}</strong> ({provider === "ollama" ? model : "gemini-3.6-flash"})</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Apply AI Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
