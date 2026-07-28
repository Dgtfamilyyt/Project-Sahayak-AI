import React from "react";
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
} from "lucide-react";
import { Patient } from "../types";

interface EmergencyModeProps {
  patient: Patient | null;
  onClose: () => void;
}

export const EmergencyMode: React.FC<EmergencyModeProps> = ({ patient, onClose }) => {
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

  return (
    <div className="fixed inset-0 z-50 bg-rose-950/95 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex items-center justify-center print:static print:bg-white print:p-0 print:overflow-visible">
      <div className="bg-slate-950 text-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border-4 border-rose-600 space-y-6 print:bg-white print:text-slate-900 print:border-2 print:border-rose-600 print:p-4 print:shadow-none">
        {/* Header Alert Ribbon */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-800">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold animate-pulse shadow-lg shadow-rose-600/50">
              <Siren className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl text-rose-500 tracking-tight">CRITICAL EMERGENCY PROFILE</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                  PRIORITY 1 TRIAGE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">1-Click Emergency Summary • Offline Verified</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Patient Emergency Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Core Identity */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
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
              <p>Primary Lang: <strong>{patient.primaryLanguage}</strong></p>
            </div>
          </div>

          {/* Life-Critical Allergies Alert */}
          <div className="p-5 rounded-2xl bg-rose-950/80 border-2 border-rose-600 space-y-2">
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

        {/* Active Medications & Chronic Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Medications */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-amber-400 block">Active Regular Medications</span>
            {patient.activeMedications.length > 0 ? (
              <ul className="space-y-1 text-xs text-slate-200">
                {patient.activeMedications.map((m, i) => (
                  <li key={i} className="font-semibold">✓ {m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No active regular meds</p>
            )}
          </div>

          {/* Chronic Conditions */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-amber-400 block">Chronic Medical Conditions</span>
            {patient.chronicDiseases.length > 0 ? (
              <ul className="space-y-1 text-xs text-slate-200">
                {patient.chronicDiseases.map((c, i) => (
                  <li key={i} className="font-semibold">✓ {c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No chronic conditions listed</p>
            )}
          </div>
        </div>

        {/* Baseline Vitals & Last Recorded Visit */}
        {latestVisit && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Last Recorded Baseline Vitals ({latestVisit.date})
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

        {/* Emergency Contact & Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <PhoneCall className="h-6 w-6 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Emergency Contact Relative</span>
              <span className="text-sm font-extrabold text-white">{patient.emergencyContactName} ({patient.emergencyContactPhone})</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button

              onClick={() => window.print()}
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
