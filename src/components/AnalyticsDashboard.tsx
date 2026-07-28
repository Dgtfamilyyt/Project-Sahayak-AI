import React from "react";
import {
  BarChart2,
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
  Package,
  Heart,
  CheckCircle2,
  Calendar,
  Shield,
  Printer,
} from "lucide-react";
import { Patient, InventoryItem } from "../types";

interface AnalyticsDashboardProps {
  patients: Patient[];
  inventory: InventoryItem[];
  pendingSyncCount: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  patients,
  inventory,
  pendingSyncCount,
}) => {
  const totalPatients = patients.length;
  const totalVisits = patients.reduce((sum, p) => sum + p.visits.length, 0);
  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minThreshold).length;

  const diseaseDistribution = [
    { disease: "Type 2 Diabetes Mellitus", count: 18, percentage: 32, color: "bg-teal-500" },
    { disease: "Acute Upper Respiratory Infection", count: 15, percentage: 27, color: "bg-emerald-500" },
    { disease: "Essential Stage 1 Hypertension", count: 12, percentage: 21, color: "bg-indigo-500" },
    { disease: "Acute Bronchial Asthma", count: 7, percentage: 12, color: "bg-amber-500" },
    { disease: "Monsoon Diarrhea / Gastroenteritis", count: 4, percentage: 8, color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold border border-teal-200">
            <BarChart2 className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Rural Health Intelligence & Analytics</h2>
            <p className="text-xs text-slate-500">
              Real-time disease surveillance, daily patient metrics, and community health trends.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
            <Calendar className="h-4 w-4 text-teal-600" />
            <span>PHC Center: Rampur District</span>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1A365D] text-white hover:bg-[#132A4B] transition-colors cursor-pointer shadow-xs no-print"
          >
            <Printer className="h-4 w-4 text-teal-300" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Registered Patients</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
              <Users className="h-4 w-4 text-teal-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalPatients}</div>
          <p className="text-[11px] text-teal-700 font-semibold flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>+12% new patient intake this month</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Clinical Visits</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
              <Activity className="h-4 w-4 text-teal-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalVisits}</div>
          <p className="text-[11px] text-slate-500 font-medium">Logged in offline EMR DB</p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Stock Shortage Alerts</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <Package className="h-4 w-4 text-rose-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{lowStockCount} Items</div>
          <p className="text-[11px] text-rose-600 font-semibold">Paracetamol & ORS under threshold</p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Pending Offline Sync</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingSyncCount} Records</div>
          <p className="text-[11px] text-amber-700 font-semibold">Ready to push to Cloud DB</p>
        </div>
      </div>

      {/* Main Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Disease Prevalence Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
            <Heart className="h-4 w-4 text-rose-600" />
            <span>Community Disease Prevalence Distribution</span>
          </h3>

          <div className="space-y-3 pt-2">
            {diseaseDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>{item.disease}</span>
                  <span className="font-mono text-slate-500">{item.count} Cases ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Outbreak Warning & Seasonal Advisory (5 cols) */}
        <div className="lg:col-span-5 bg-[#1A365D] text-white rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-sm">
            <Shield className="h-5 w-5 text-amber-300" />
            <span>Seasonal Epidemiological Advisory</span>
          </div>

          <div className="p-4 rounded-xl bg-[#132A4B] border border-slate-700/80 text-xs text-slate-200 space-y-2 leading-relaxed">
            <p className="font-bold text-amber-300">⚠️ Monsoon Season Diarrheal Disease Risk</p>
            <p>
              Primary healthcare data indicates a 24% spike in viral gastroenteritis across Sonipat villages over the last 14 days. Ensure ORS and Zinc sulfate sachets are pre-allocated to ASHA workers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#132A4B] border border-slate-700/80 text-xs text-slate-200 space-y-2">
            <p className="font-bold text-teal-300">✓ Non-Communicable Disease (NCD) Screening</p>
            <p>
              Diabetes and Stage 1 Hypertension represent 53% of adult clinic visits. Weekly blood pressure monitoring camps recommended at Rampur Sub-Centre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
