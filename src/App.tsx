import React, { useState, useEffect, useCallback } from "react";
import {
  Navbar,
} from "./components/Navbar";
import { PatientManager } from "./components/PatientManager";
import { MedicalSummarizer } from "./components/MedicalSummarizer";
import { MultilingualTranslator } from "./components/MultilingualTranslator";
import { PrescriptionGenerator } from "./components/PrescriptionGenerator";
import { InventoryAssistant } from "./components/InventoryAssistant";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { SyncCenter } from "./components/SyncCenter";
import { EmergencyMode } from "./components/EmergencyMode";
import { OllamaSettingsModal } from "./components/OllamaSettingsModal";
import { ToastContainer, ToastMessage } from "./components/ToastContainer";
import { PortalWrapper } from "./components/PortalWrapper";
import { LandingPage } from "./components/LandingPage";

import {
  Patient,
  InventoryItem,
  SyncQueueItem,
  NetworkMode,
  VisitRecord,
  PrescribedDrug,
  OllamaConfig,
} from "./types";
import {
  loadLocalPatients,
  saveLocalPatients,
  loadLocalInventory,
  saveLocalInventory,
  loadSyncQueue,
  saveSyncQueue,
  enqueueMutation,
  getNetworkMode,
  setNetworkMode as persistNetworkMode,
  resetAllLocalData,
  loadOllamaConfig,
} from "./utils/offlineStorage";

export default function App() {
  const [networkMode, setNetworkModeState] = useState<NetworkMode>(getNetworkMode());
  const [activeTab, setActiveTab] = useState<string>("landing");

  const [patients, setPatients] = useState<Patient[]>(() => loadLocalPatients());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadLocalInventory());
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => loadSyncQueue());
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>(() => loadOllamaConfig());

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);

  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isOllamaModalOpen, setIsOllamaModalOpen] = useState<boolean>(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    saveLocalPatients(patients);
  }, [patients]);

  useEffect(() => {
    saveLocalInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    saveSyncQueue(syncQueue);
  }, [syncQueue]);

  const handleSyncNow = useCallback(async () => {
    const currentQueue = loadSyncQueue();
    const pendingItems = currentQueue.filter((i) => i.status === "PENDING");

    if (pendingItems.length === 0) {
      addToast({
        type: "info",
        title: "All Data Synced",
        description: "No pending offline mutations to synchronize.",
      });
      return;
    }

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queuedRecords: pendingItems }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedQueue = currentQueue.map((item) => ({
          ...item,
          status: "SYNCED" as const,
        }));
        saveSyncQueue(updatedQueue);
        setSyncQueue(updatedQueue);

        // Mark patients as synced
        setPatients((prev) => prev.map((p) => ({ ...p, syncedToCloud: true })));

        addToast({
          type: "success",
          title: "Cloud Sync Complete",
          description: `Successfully synchronized ${pendingItems.length} offline record(s) to cloud database. Zero conflicts detected.`,
        });
      } else {
        throw new Error(data.message || "Cloud server responded with error");
      }
    } catch (err: any) {
      console.error("Cloud sync failed:", err);
      addToast({
        type: "error",
        title: "Cloud Sync Failed",
        description: `Unable to push ${pendingItems.length} record(s) to cloud gateway. Network error or server offline. Records stored safely in offline queue.`,
      });
      throw err;
    }
  }, [addToast]);

  const handleToggleNetworkMode = useCallback(() => {
    const nextMode = networkMode === "online" ? "offline" : "online";
    setNetworkModeState(nextMode);
    persistNetworkMode(nextMode);

    if (nextMode === "online") {
      const currentQueue = loadSyncQueue();
      const pendingCount = currentQueue.filter((i) => i.status === "PENDING").length;
      if (pendingCount > 0) {
        addToast({
          type: "info",
          title: "Reconnected to Cloud Gateway",
          description: `Online mode active. Automatically syncing ${pendingCount} pending record(s)...`,
        });
        handleSyncNow().catch(() => {});
      } else {
        addToast({
          type: "success",
          title: "Cloud Gateway Connected",
          description: "System is online. Connected to Cloud Sync target.",
        });
      }
    } else {
      addToast({
        type: "warning",
        title: "Offline Edge Mode Active",
        description: "Operating in rural edge mode. All clinical updates will be queued locally in IndexedDB.",
      });
    }
  }, [networkMode, addToast, handleSyncNow]);

  // Handle browser native offline / online detection
  useEffect(() => {
    const handleOnline = () => {
      setNetworkModeState("online");
      persistNetworkMode("online");
      const currentQueue = loadSyncQueue();
      const pendingCount = currentQueue.filter((i) => i.status === "PENDING").length;
      if (pendingCount > 0) {
        addToast({
          type: "info",
          title: "Internet Connection Restored",
          description: `Network back online. Synchronizing ${pendingCount} pending offline mutation(s)...`,
        });
        handleSyncNow().catch(() => {});
      } else {
        addToast({
          type: "info",
          title: "Network Connection Restored",
          description: "Device connected to network.",
        });
      }
    };

    const handleOffline = () => {
      setNetworkModeState("offline");
      persistNetworkMode("offline");
      addToast({
        type: "warning",
        title: "Network Connection Lost",
        description: "Switched automatically to Rural Offline Mode. Data will be saved locally.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addToast, handleSyncNow]);

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    enqueueMutation("patient", "CREATE", newPatient);
    setSyncQueue(loadSyncQueue());
    addToast({
      type: "success",
      title: "Patient Intake Registered",
      description: `${newPatient.fullName} (${newPatient.id}) saved to local EMR database.`,
    });
  };

  const handleAddVisit = (patientId: string, visit: VisitRecord) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            visits: [visit, ...p.visits],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    enqueueMutation("visit", "CREATE", visit);
    setSyncQueue(loadSyncQueue());
    addToast({
      type: "success",
      title: "Clinical Visit Logged",
      description: `New visit record saved for patient ID ${patientId}.`,
    });
  };

  const handleSavePrescriptionToPatient = (patientId: string, drugs: PrescribedDrug[]) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const updatedVisits = [...p.visits];
          if (updatedVisits[0]) {
            updatedVisits[0] = {
              ...updatedVisits[0],
              prescribedMedications: drugs,
            };
          }
          return {
            ...p,
            visits: updatedVisits,
            activeMedications: Array.from(
              new Set([...p.activeMedications, ...drugs.map((d) => d.medicineName)])
            ),
          };
        }
        return p;
      })
    );

    enqueueMutation("prescription", "CREATE", { patientId, drugs });
    setSyncQueue(loadSyncQueue());
    addToast({
      type: "success",
      title: "Prescription Order Saved",
      description: `${drugs.length} medication order(s) logged to patient record.`,
    });
  };

  const handleUpdateInventory = (updatedInventory: InventoryItem[]) => {
    setInventory(updatedInventory);
    enqueueMutation("inventory", "UPDATE", updatedInventory);
    setSyncQueue(loadSyncQueue());
    addToast({
      type: "info",
      title: "Pharmacy Inventory Updated",
      description: "Stock levels and medicine records saved locally.",
    });
  };

  const handleClearQueue = () => {
    saveSyncQueue([]);
    setSyncQueue([]);
    addToast({
      type: "info",
      title: "Sync Queue Cleared",
      description: "Pending offline mutation queue reset.",
    });
  };

  const handleResetEverything = () => {
    resetAllLocalData();
    const freshPatients = loadLocalPatients();
    const freshInventory = loadLocalInventory();
    setPatients(freshPatients);
    setInventory(freshInventory);
    setSyncQueue([]);
    setSelectedPatient(freshPatients[0] || null);
    setNetworkModeState("online");
    setIsEmergencyOpen(false);
    setActiveTab("patients");
    addToast({
      type: "info",
      title: "Demo Application Reset",
      description: "Restored application state to default seed data.",
    });
  };

  const pendingSyncCount = syncQueue.filter((i) => i.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Main Navbar Header */}
      <Navbar
        networkMode={networkMode}
        onToggleNetworkMode={handleToggleNetworkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingSyncCount={pendingSyncCount}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onResetData={handleResetEverything}
        ollamaConfig={ollamaConfig}
        onOpenOllamaModal={() => setIsOllamaModalOpen(true)}
      />

      {/* Main Body Content Area */}
      {activeTab === "landing" ? (
        <LandingPage
          onLaunchApp={() => setActiveTab("wrapper")}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === "wrapper" && (
            <PortalWrapper
              patients={patients}
              inventory={inventory}
              syncQueue={syncQueue}
              networkMode={networkMode}
              ollamaConfig={ollamaConfig}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectPatient={(p, targetTab) => {
                setSelectedPatient(p);
                setActiveTab(targetTab);
              }}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
              onToggleNetworkMode={handleToggleNetworkMode}
              onOpenOllamaModal={() => setIsOllamaModalOpen(true)}
            />
          )}

          {activeTab === "patients" && (
            <PatientManager
              patients={patients}
              onAddPatient={handleAddPatient}
              onAddVisit={handleAddVisit}
              onSelectPatientForSummary={(p) => {
                setSelectedPatient(p);
                setActiveTab("summarizer");
              }}
              onSelectPatientForPrescription={(p) => {
                setSelectedPatient(p);
                setActiveTab("prescriptions");
              }}
            />
          )}

          {activeTab === "summarizer" && (
            <MedicalSummarizer
              patients={patients}
              selectedPatient={selectedPatient}
              onSelectPatient={(p) => setSelectedPatient(p)}
              onAddVisit={handleAddVisit}
              networkMode={networkMode}
              ollamaConfig={ollamaConfig}
            />
          )}

          {activeTab === "translator" && (
            <MultilingualTranslator networkMode={networkMode} ollamaConfig={ollamaConfig} />
          )}

          {activeTab === "prescriptions" && (
            <PrescriptionGenerator
              patients={patients}
              inventory={inventory}
              selectedPatient={selectedPatient}
              onSelectPatient={(p) => setSelectedPatient(p)}
              networkMode={networkMode}
              onSavePrescriptionToPatient={handleSavePrescriptionToPatient}
              ollamaConfig={ollamaConfig}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryAssistant
              inventory={inventory}
              onUpdateInventory={handleUpdateInventory}
              networkMode={networkMode}
              ollamaConfig={ollamaConfig}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsDashboard
              patients={patients}
              inventory={inventory}
              pendingSyncCount={pendingSyncCount}
            />
          )}

          {activeTab === "sync" && (
            <SyncCenter
              queue={syncQueue}
              networkMode={networkMode}
              onSyncNow={handleSyncNow}
              onClearQueue={handleClearQueue}
              onResetAllData={handleResetEverything}
            />
          )}
        </main>
      )}

      {/* Ollama Settings Modal */}
      {isOllamaModalOpen && (
        <OllamaSettingsModal
          config={ollamaConfig}
          onUpdateConfig={(cfg) => setOllamaConfig(cfg)}
          onClose={() => setIsOllamaModalOpen(false)}
        />
      )}

      {/* Emergency Overlay Modal */}
      {isEmergencyOpen && (
        <EmergencyMode
          patient={selectedPatient}
          onClose={() => setIsEmergencyOpen(false)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="border-t border-[#1A365D] bg-[#1A365D] py-4 text-center text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold tracking-wide">Project Sahayak AI • Offline-First Healthcare Copilot</span>
          <span className="text-teal-300 font-bold bg-teal-900/40 px-2.5 py-1 rounded-full border border-teal-500/30">UN SDG 3: Good Health & Well-being</span>
        </div>
      </footer>
    </div>
  );
}
