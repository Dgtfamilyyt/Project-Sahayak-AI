import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Patient, VisitRecord, AISummaryResult } from "../types";

/**
 * Capture an HTML DOM element and save it as a high-quality PDF using html2canvas + jsPDF.
 */
export async function exportElementToPdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID '${elementId}' not found for PDF export.`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 size width in mm
    const pageHeight = 297; // A4 size height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error("HTML canvas to PDF export failed:", error);
    return false;
  }
}

export interface VisitSummaryPdfOptions {
  includeEmergencyContact?: boolean;
}

/**
 * Programmatic PDF Generator for Patient Visit Summaries
 * Works 100% offline without requiring DOM rendering.
 */
export function generateVisitSummaryPdf(
  patient: Patient,
  visit?: VisitRecord,
  options?: VisitSummaryPdfOptions
): void {
  const includeEmergency = options?.includeEmergencyContact ?? true;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const activeVisit = visit || (patient.visits.length > 0 ? patient.visits[patient.visits.length - 1] : null);

  // Header Banner
  doc.setFillColor(26, 54, 93); // #1A365D Primary Dark Teal/Navy
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SAHAYAK AI HEALTH NETWORK", 14, 14);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Rural Health Center EMR & Clinical Visit Summary Report", 14, 22);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")} | Offline Gateway`, 130, 22);

  // Patient Demographic Section
  let y = 42;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, y, 182, 34, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 182, 34, "S");

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Patient: ${patient.fullName}`, 18, y + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Patient ID: ${patient.id}`, 18, y + 16);
  doc.text(`Age / Sex: ${patient.age} yrs / ${patient.gender}`, 18, y + 22);
  doc.text(`Blood Group: ${patient.bloodGroup}`, 18, y + 28);

  doc.text(`Location: ${patient.village}, ${patient.district}`, 110, y + 16);
  doc.text(`Language: ${patient.primaryLanguage}`, 110, y + 22);
  if (includeEmergency) {
    doc.text(`Emergency: ${patient.emergencyContactName} (${patient.emergencyContactPhone})`, 110, y + 28);
  } else {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text(`Emergency: [Excluded in Privacy Config]`, 110, y + 28);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
  }

  // Health Profile Alert Flags
  y += 40;
  if (patient.knownAllergies.length > 0 || patient.chronicDiseases.length > 0) {
    doc.setFillColor(254, 242, 242); // rose-50
    doc.rect(14, y, 182, 16, "F");
    doc.setDrawColor(252, 165, 165);
    doc.rect(14, y, 182, 16, "S");

    doc.setTextColor(153, 27, 27); // rose-800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const allergiesStr = patient.knownAllergies.length > 0 ? `Allergies: ${patient.knownAllergies.join(", ")}` : "No known allergies";
    const chronicStr = patient.chronicDiseases.length > 0 ? `Chronic: ${patient.chronicDiseases.join(", ")}` : "No chronic diseases";
    doc.text(`CRITICAL FLAGS: ${allergiesStr}  |  ${chronicStr}`, 18, y + 10);
    y += 22;
  }

  // Visit Details Section
  if (activeVisit) {
    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Clinical Visit Record - ${activeVisit.date}`, 14, y);

    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Attended By Health Worker: ${activeVisit.attendedByWorker}`, 14, y);

    // Vitals Box
    y += 6;
    doc.setFillColor(240, 253, 250); // teal-50
    doc.rect(14, y, 182, 18, "F");
    doc.setDrawColor(153, 246, 228);
    doc.rect(14, y, 182, 18, "S");

    doc.setTextColor(17, 94, 89); // teal-800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("VITALS & MEASUREMENTS:", 18, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const v = activeVisit.vitals;
    doc.text(`BP: ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg`, 18, y + 13);
    doc.text(`Pulse: ${v.heartRate} bpm`, 70, y + 13);
    doc.text(`Temp: ${v.temperature}°F`, 120, y + 13);
    doc.text(`SpO2: ${v.spO2}%`, 160, y + 13);

    // Chief Complaint & Clinical Notes
    y += 24;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Chief Complaint:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const complaintLines = doc.splitTextToSize(activeVisit.chiefComplaint, 182);
    doc.text(complaintLines, 14, y + 5);

    y += 5 + complaintLines.length * 4.5 + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Clinical Notes & Diagnosis:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const notesLines = doc.splitTextToSize(activeVisit.clinicalNotes || "No detailed notes provided.", 182);
    doc.text(notesLines, 14, y + 5);

    // Prescribed Medications
    y += 5 + notesLines.length * 4.5 + 6;
    if (activeVisit.prescribedMedications.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(26, 54, 93);
      doc.text("Prescribed Medications:", 14, y);

      y += 4;
      activeVisit.prescribedMedications.forEach((med, idx) => {
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`${idx + 1}. ${med.medicineName} (${med.dosage})`, 18, y);
        doc.setFont("helvetica", "normal");
        doc.text(`Frequency: ${med.frequency}  |  Duration: ${med.durationDays} days`, 100, y);
      });
    }
  } else {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.text("No visit records available for this patient.", 14, y + 10);
  }

  // Footer Signature Block
  const pageHeight = 297;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, pageHeight - 30, 196, pageHeight - 30);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Sahayak AI EMR - Rural Offline Clinical Visit Document. Valid for official records.", 14, pageHeight - 22);
  doc.text(`Digital Verification Code: ${patient.qrCodeId}`, 14, pageHeight - 17);

  doc.setTextColor(15, 23, 42);
  doc.text("Attending Medical Officer Signature: _______________________", 110, pageHeight - 20);

  // Save File
  doc.save(`Patient_Summary_${patient.fullName.replace(/\s+/g, "_")}_${patient.id}.pdf`);
}

/**
 * Programmatic PDF Generator for AI Medical Summarizer Reports
 */
export function generateMedicalSummaryPdf(patient: Patient, summary: AISummaryResult): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header
  doc.setFillColor(15, 118, 110); // Teal-700
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("AI CLINICAL SYNTHESIS REPORT", 14, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Patient: ${patient.fullName} (${patient.id}) | ${patient.gender}, ${patient.age}y`, 14, 22);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 150, 22);

  let y = 38;

  // Synthesis Box
  doc.setFillColor(240, 253, 250);
  doc.rect(14, y, 182, 30, "F");
  doc.setDrawColor(153, 246, 228);
  doc.rect(14, y, 182, 30, "S");

  doc.setTextColor(17, 94, 89);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Concise Longitudinal Synthesis:", 18, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const synthLines = doc.splitTextToSize(summary.conciseSummary, 174);
  doc.text(synthLines, 18, y + 13);

  // Critical Risks
  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(185, 28, 28); // red-700
  doc.text("Critical Clinical Risks Detected:", 14, y);

  y += 2;
  summary.criticalRisks.forEach((risk) => {
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${risk}`, 18, y);
  });

  // Suggested Actions
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text("Suggested Follow-up Clinical Actions:", 14, y);

  y += 2;
  summary.suggestedClinicalActions.forEach((action) => {
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${action}`, 18, y);
  });

  // Save
  doc.save(`AI_Medical_Summary_${patient.fullName.replace(/\s+/g, "_")}.pdf`);
}
