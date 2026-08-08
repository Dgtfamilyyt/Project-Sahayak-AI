import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { Activity, Heart, Thermometer, Droplets, Weight, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Patient, VisitRecord } from "../types";

interface VitalsTrendChartProps {
  patient: Patient;
}

type MetricType = "bp" | "heartRate" | "spO2" | "temperature" | "weight";

export const VitalsTrendChart: React.FC<VitalsTrendChartProps> = ({ patient }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("bp");

  // Sort visits chronologically (oldest to newest for trend display)
  const sortedVisits = [...patient.visits].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sortedVisits.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
        <Activity className="h-8 w-8 text-slate-400 mx-auto" />
        <p className="text-xs font-bold text-slate-700">No Vital Records Available</p>
        <p className="text-[11px] text-slate-500">Log a clinical visit to track blood pressure, heart rate, and temperature trends.</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = sortedVisits.map((v, index) => ({
    visitIndex: index + 1,
    date: v.date,
    attendedBy: v.attendedByWorker,
    systolic: v.vitals?.bloodPressureSystolic || 0,
    diastolic: v.vitals?.bloodPressureDiastolic || 0,
    heartRate: v.vitals?.heartRate || 0,
    spO2: v.vitals?.spO2 || 0,
    temperature: v.vitals?.temperature || 0,
    weight: v.vitals?.weightKg || 0,
    chiefComplaint: v.chiefComplaint,
  }));

  const latestVisit = sortedVisits[sortedVisits.length - 1];
  const previousVisit = sortedVisits.length > 1 ? sortedVisits[sortedVisits.length - 2] : null;

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 z-50 max-w-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-extrabold text-teal-300">{data.date}</span>
            <span className="text-[10px] text-slate-400">Visit #{data.visitIndex}</span>
          </div>
          <p className="text-[11px] text-slate-300 truncate">By: {data.attendedBy}</p>
          <div className="space-y-1 pt-1 font-mono text-[11px]">
            <p className="text-rose-300">
              BP: <strong className="text-white">{data.systolic}/{data.diastolic}</strong> mmHg
            </p>
            <p className="text-emerald-300">
              Heart Rate: <strong className="text-white">{data.heartRate}</strong> bpm
            </p>
            <p className="text-amber-300">
              SpO2: <strong className="text-white">{data.spO2}</strong>%
            </p>
            <p className="text-cyan-300">
              Temp: <strong className="text-white">{data.temperature}</strong> °F
            </p>
            {data.weight > 0 && (
              <p className="text-purple-300">
                Weight: <strong className="text-white">{data.weight}</strong> kg
              </p>
            )}
          </div>
          {data.chiefComplaint && (
            <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800 line-clamp-2">
              "{data.chiefComplaint}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Helper function to render delta status
  const renderDelta = (current: number, previous: number | null, unit: string, isLowerBetter = false) => {
    if (previous === null || previous === undefined) {
      return <span className="text-[10px] text-slate-400 flex items-center font-normal"><Minus className="h-3 w-3 mr-0.5" /> First Record</span>;
    }
    const diff = current - previous;
    if (diff === 0) {
      return <span className="text-[10px] text-slate-500 font-bold flex items-center"><Minus className="h-3 w-3 mr-0.5" /> Stable</span>;
    }
    const isPositiveOutcome = isLowerBetter ? diff < 0 : diff > 0;
    const Icon = diff > 0 ? TrendingUp : TrendingDown;
    return (
      <span className={`text-[10px] font-bold flex items-center ${isPositiveOutcome ? "text-emerald-600" : "text-rose-600"}`}>
        <Icon className="h-3 w-3 mr-0.5" />
        {diff > 0 ? `+${diff}` : diff} {unit}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
      {/* Header & Metric Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
            <Activity className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <span>Vital Signs Trend Analytics</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {sortedVisits.length} {sortedVisits.length === 1 ? "Visit" : "Visits"}
              </span>
            </h3>
            <p className="text-xs text-slate-500">Longitudinal clinical vitals over patient timeline</p>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setSelectedMetric("bp")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === "bp"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Blood Pressure
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric("heartRate")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === "heartRate"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pulse
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric("spO2")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === "spO2"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            SpO2
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric("temperature")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === "temperature"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Temp
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric("weight")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === "weight"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Weight
          </button>
        </div>
      </div>

      {/* Snapshot Metric Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* BP */}
        <div
          onClick={() => setSelectedMetric("bp")}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedMetric === "bp"
              ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-300"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100/80"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
            <span className="flex items-center"><Activity className="h-3.5 w-3.5 text-rose-600 mr-1" /> BP (mmHg)</span>
          </div>
          <p className="text-base font-extrabold text-slate-900 font-mono">
            {latestVisit.vitals.bloodPressureSystolic}/{latestVisit.vitals.bloodPressureDiastolic}
          </p>
          <div className="mt-1">
            {renderDelta(
              latestVisit.vitals.bloodPressureSystolic,
              previousVisit?.vitals?.bloodPressureSystolic ?? null,
              "sys",
              true
            )}
          </div>
        </div>

        {/* Pulse */}
        <div
          onClick={() => setSelectedMetric("heartRate")}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedMetric === "heartRate"
              ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100/80"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
            <span className="flex items-center"><Heart className="h-3.5 w-3.5 text-emerald-600 mr-1" /> Heart Rate</span>
          </div>
          <p className="text-base font-extrabold text-slate-900 font-mono">
            {latestVisit.vitals.heartRate} <span className="text-xs font-normal text-slate-500">bpm</span>
          </p>
          <div className="mt-1">
            {renderDelta(
              latestVisit.vitals.heartRate,
              previousVisit?.vitals?.heartRate ?? null,
              "bpm"
            )}
          </div>
        </div>

        {/* SpO2 */}
        <div
          onClick={() => setSelectedMetric("spO2")}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedMetric === "spO2"
              ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100/80"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
            <span className="flex items-center"><Droplets className="h-3.5 w-3.5 text-amber-600 mr-1" /> Oxygen (SpO2)</span>
          </div>
          <p className="text-base font-extrabold text-slate-900 font-mono">
            {latestVisit.vitals.spO2}<span className="text-xs font-normal text-slate-500">%</span>
          </p>
          <div className="mt-1">
            {renderDelta(
              latestVisit.vitals.spO2,
              previousVisit?.vitals?.spO2 ?? null,
              "%"
            )}
          </div>
        </div>

        {/* Temperature */}
        <div
          onClick={() => setSelectedMetric("temperature")}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedMetric === "temperature"
              ? "bg-cyan-50/70 border-cyan-300 ring-1 ring-cyan-300"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100/80"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
            <span className="flex items-center"><Thermometer className="h-3.5 w-3.5 text-cyan-600 mr-1" /> Temperature</span>
          </div>
          <p className="text-base font-extrabold text-slate-900 font-mono">
            {latestVisit.vitals.temperature}<span className="text-xs font-normal text-slate-500">°F</span>
          </p>
          <div className="mt-1">
            {renderDelta(
              latestVisit.vitals.temperature,
              previousVisit?.vitals?.temperature ?? null,
              "°F",
              true
            )}
          </div>
        </div>

        {/* Weight */}
        <div
          onClick={() => setSelectedMetric("weight")}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedMetric === "weight"
              ? "bg-purple-50/70 border-purple-300 ring-1 ring-purple-300"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100/80"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
            <span className="flex items-center"><Weight className="h-3.5 w-3.5 text-purple-600 mr-1" /> Body Weight</span>
          </div>
          <p className="text-base font-extrabold text-slate-900 font-mono">
            {latestVisit.vitals.weightKg || "--"}<span className="text-xs font-normal text-slate-500">kg</span>
          </p>
          <div className="mt-1">
            {renderDelta(
              latestVisit.vitals.weightKg,
              previousVisit?.vitals?.weightKg ?? null,
              "kg"
            )}
          </div>
        </div>
      </div>

      {/* Main Recharts Line Chart Visualization */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1">
          <span className="font-extrabold text-slate-800 uppercase tracking-wide text-[11px]">
            {selectedMetric === "bp" && "Blood Pressure (Systolic vs Diastolic)"}
            {selectedMetric === "heartRate" && "Heart Rate / Pulse (bpm)"}
            {selectedMetric === "spO2" && "Oxygen Saturation SpO2 (%)"}
            {selectedMetric === "temperature" && "Body Temperature (°F)"}
            {selectedMetric === "weight" && "Body Weight (kg)"}
          </span>
          <span className="text-[11px] text-slate-500 flex items-center">
            <Info className="h-3 w-3 mr-1 text-slate-400" />
            Hover data points for clinical visit details
          </span>
        </div>

        <div className="h-[260px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                domain={
                  selectedMetric === "bp"
                    ? [40, 200]
                    : selectedMetric === "spO2"
                    ? [80, 100]
                    : selectedMetric === "temperature"
                    ? [95, 105]
                    : ["auto", "auto"]
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "10px", fontSize: "12px", fontWeight: "bold" }}
              />

              {/* Reference Lines for Normal Limits */}
              {selectedMetric === "bp" && (
                <>
                  <ReferenceLine y={120} label={{ value: "Target Sys (120)", fill: "#e11d48", fontSize: 10, position: "insideTopRight" }} stroke="#f43f5e" strokeDasharray="4 4" opacity={0.6} />
                  <ReferenceLine y={80} label={{ value: "Target Dia (80)", fill: "#2563eb", fontSize: 10, position: "insideBottomRight" }} stroke="#3b82f6" strokeDasharray="4 4" opacity={0.6} />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic (mmHg)"
                    stroke="#e11d48"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#e11d48", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic (mmHg)"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                  />
                </>
              )}

              {selectedMetric === "heartRate" && (
                <>
                  <ReferenceLine y={60} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
                  <ReferenceLine y={100} label={{ value: "Upper Normal (100)", fill: "#059669", fontSize: 10 }} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart Rate (bpm)"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#059669", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7 }}
                  />
                </>
              )}

              {selectedMetric === "spO2" && (
                <>
                  <ReferenceLine y={95} label={{ value: "Target (>= 95%)", fill: "#d97706", fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.7} />
                  <Line
                    type="monotone"
                    dataKey="spO2"
                    name="Oxygen Saturation (%)"
                    stroke="#d97706"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#d97706", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7 }}
                  />
                </>
              )}

              {selectedMetric === "temperature" && (
                <>
                  <ReferenceLine y={98.6} label={{ value: "Normal (98.6°F)", fill: "#0891b2", fontSize: 10 }} stroke="#06b6d4" strokeDasharray="3 3" opacity={0.7} />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Body Temp (°F)"
                    stroke="#0891b2"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#0891b2", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7 }}
                  />
                </>
              )}

              {selectedMetric === "weight" && (
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 7 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
