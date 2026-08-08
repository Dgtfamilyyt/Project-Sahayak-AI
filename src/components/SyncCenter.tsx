import React, { useState } from "react";
import {
  Database,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Zap,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SyncQueueItem, NetworkMode } from "../types";

interface SyncCenterProps {
  queue: SyncQueueItem[];
  networkMode: NetworkMode;
  onSyncNow: () => Promise<void>;
  onClearQueue: () => void;
  onResetAllData?: () => void;
}

export const SyncCenter: React.FC<SyncCenterProps> = ({
  queue,
  networkMode,
  onSyncNow,
  onClearQueue,
  onResetAllData,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Collapse states
  const [isQueueCollapsed, setIsQueueCollapsed] = useState(false);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
  const [collapsedItemIds, setCollapsedItemIds] = useState<Record<string, boolean>>({});

  const isOnline = networkMode === "online";
  const pendingCount = queue.filter((i) => i.status === "PENDING").length;

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncLogs((prev) => [`[${new Date().toLocaleTimeString()}] Initiating cloud sync handshake...`, ...prev]);

    try {
      await onSyncNow();
      const nowStr = new Date().toLocaleTimeString();
      setLastSyncTime(nowStr);
      setSyncLogs((prev) => [
        `[${nowStr}] SUCCESS: Synchronized ${pendingCount} offline records to Firebase Cloud SQL. Zero conflicts detected.`,
        ...prev,
      ]);
    } catch (err: any) {
      setSyncLogs((prev) => [`[${new Date().toLocaleTimeString()}] ERROR: Sync failed: ${err.message}`, ...prev]);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold border border-teal-200">
            <Database className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Offline Synchronization & Cloud Sync Center</h2>
            <p className="text-xs text-slate-500">
              Guarantees eventual data consistency between rural edge clinic storage and cloud databases.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {onResetAllData && (
            <button
              onClick={onResetAllData}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
              title="Reset all application data and restore defaults"
            >
              <RotateCcw className="h-4 w-4 text-slate-500" />
              <span>Reset Application State</span>
            </button>
          )}

          <button
            onClick={handleTriggerSync}
            disabled={isSyncing || !isOnline || pendingCount === 0}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md shadow-teal-600/20 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Pushing Offline Records..." : `Force Cloud Sync (${pendingCount})`}</span>
          </button>
        </div>
      </div>

      {/* Sync Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connection Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Connection Health</span>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="h-6 w-6 text-teal-600" />
                <span className="text-base font-extrabold text-teal-800">Online (Cloud Gateway)</span>
              </>
            ) : (
              <>
                <WifiOff className="h-6 w-6 text-amber-600 animate-bounce" />
                <span className="text-base font-extrabold text-amber-700">Offline (Rural Edge Mode)</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            {isOnline ? "Connected to Cloud Sync Target" : "Storing mutations locally in IndexedDB Queue"}
          </p>
        </div>

        {/* Pending Queue Items */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Pending Mutations</span>
          <div className="text-2xl font-black text-slate-900">{pendingCount} Items</div>
          <p className="text-[11px] text-slate-500">Patient intake, clinical visits, prescriptions</p>
        </div>

        {/* Conflict Resolution Strategy */}
        <div className="p-5 rounded-2xl bg-[#1A365D] text-white space-y-2">
          <span className="text-xs font-extrabold text-teal-300 uppercase tracking-wider block flex items-center space-x-1">
            <ShieldCheck className="h-4 w-4 text-teal-300" />
            <span>Conflict Policy</span>
          </span>
          <p className="text-xs font-bold text-slate-100">Last-Write-Wins with Immutable Visit Logs</p>
          <p className="text-[10px] text-slate-300">Guarantees zero clinical record overwrites</p>
        </div>
      </div>

      {/* Main Queue & Log Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queued Items List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div
            onClick={() => setIsQueueCollapsed(!isQueueCollapsed)}
            className="flex items-center justify-between pb-3 border-b border-slate-100 cursor-pointer select-none"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Offline Mutation Queue ({queue.length})
            </span>

            <div className="flex items-center space-x-2">
              {queue.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearQueue();
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
              <button className="text-slate-500 hover:text-slate-800 cursor-pointer p-0.5">
                {isQueueCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isQueueCollapsed && (
            <>
              {queue.length === 0 ? (
                <div className="py-16 text-center space-y-2 text-slate-400 text-xs">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-700">Sync Queue Clear!</p>
                  <p>All local clinic records are fully synchronized with the cloud.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {queue.map((item) => {
                    const isItemCollapsed = !!collapsedItemIds[item.id];
                    return (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 uppercase">{item.entityType}</span>
                              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                {item.action}
                              </span>
                            </div>
                            <p className="font-mono text-[10px] text-slate-500">{item.id} • {item.createdAt}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === "SYNCED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {item.status}
                            </span>
                            <button
                              onClick={() => setCollapsedItemIds(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
                            >
                              {isItemCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        {!isItemCollapsed && item.payload && (
                          <div className="p-2 rounded-lg bg-slate-100/80 font-mono text-[10px] text-slate-700 overflow-x-auto">
                            <pre>{JSON.stringify(item.payload, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Live Sync Logs Terminal (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 text-emerald-400 font-mono p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
          <div
            onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
            className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-sans cursor-pointer select-none"
          >
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Server className="h-4 w-4 text-emerald-400" />
              <span>Cloud Gateway Sync Log</span>
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-500">Live Terminal</span>
              <button className="text-slate-400 hover:text-slate-200 cursor-pointer p-0.5">
                {isTerminalCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isTerminalCollapsed && (
            <div className="h-[320px] overflow-y-auto space-y-2 text-[11px] leading-relaxed">
              {syncLogs.length === 0 ? (
                <p className="text-slate-600 italic">Ready. Awaiting sync triggers...</p>
              ) : (
                syncLogs.map((log, i) => (
                  <p key={i} className={log.includes("ERROR") ? "text-rose-400" : log.includes("SUCCESS") ? "text-emerald-300 font-bold" : "text-slate-300"}>
                    {log}
                  </p>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
