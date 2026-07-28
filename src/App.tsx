import React, { useState, useEffect } from "react";
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
import { HackathonJudgeDeck } from "./components/HackathonJudgeDeck";

import {
  Patient,
  InventoryItem,
  SyncQueueItem,
  NetworkMode,
  VisitRecord,
  PrescribedDrug,
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
} from "./utils/offlineStorage";

export default function App() {
  const [networkMode, setNetworkModeState] = useState<NetworkMode>(getNetworkMode());
  const [activeTab, setActiveTab] = useState<string>("patients");

  const [patients, setPatients] = useState<Patient[]>(() => loadLocalPatients());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadLocalInventory());
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => loadSyncQueue());

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);

  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isJudgeDeckOpen, setIsJudgeDeckOpen] = useState<boolean>(false);

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

  const handleToggleNetworkMode = () => {
    const nextMode = networkMode === "online" ? "offline" : "online";
    setNetworkModeState(nextMode);
    persistNetworkMode(nextMode);
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    const queueItem = enqueueMutation("patient", "CREATE", newPatient);
    setSyncQueue(loadSyncQueue());
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
  };

  const handleUpdateInventory = (updatedInventory: InventoryItem[]) => {
    setInventory(updatedInventory);
    enqueueMutation("inventory", "UPDATE", updatedInventory);
    setSyncQueue(loadSyncQueue());
  };

  const handleSyncNow = async () => {
    const currentQueue = loadSyncQueue();
    const pendingItems = currentQueue.filter((i) => i.status === "PENDING");

    if (pendingItems.length === 0) return;

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
      }
    } catch (err) {
      console.error("Cloud sync failed:", err);
      throw err;
    }
  };

  const handleClearQueue = () => {
    saveSyncQueue([]);
    setSyncQueue([]);
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
        onOpenJudgeDeck={() => setIsJudgeDeckOpen(true)}
      />

      {/* Main Body Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            networkMode={networkMode}
          />
        )}

        {activeTab === "translator" && (
          <MultilingualTranslator networkMode={networkMode} />
        )}

        {activeTab === "prescriptions" && (
          <PrescriptionGenerator
            patients={patients}
            inventory={inventory}
            selectedPatient={selectedPatient}
            onSelectPatient={(p) => setSelectedPatient(p)}
            networkMode={networkMode}
            onSavePrescriptionToPatient={handleSavePrescriptionToPatient}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryAssistant
            inventory={inventory}
            onUpdateInventory={handleUpdateInventory}
            networkMode={networkMode}
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
          />
        )}
      </main>

      {/* Emergency Overlay Modal */}
      {isEmergencyOpen && (
        <EmergencyMode
          patient={selectedPatient}
          onClose={() => setIsEmergencyOpen(false)}
        />
      )}

      {/* Hackathon Judge Deck Overlay Modal */}
      {isJudgeDeckOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A365D]/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <HackathonJudgeDeck onClose={() => setIsJudgeDeckOpen(false)} />
          </div>
        </div>
      )}

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
