import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";

/**
 * DestinyScoreExport
 * 
 * Generates a styled one-page PDF report with:
 * - Destiny Score (large, centered)
 * - Radar chart of all 15 axes
 * - Streak info
 * - Date and user name
 */

interface AxisWithValue {
  axisName: string | null;
  leftLabel: string;
  rightLabel: string;
  value: number;
}

function drawRadarChart(
  canvas: HTMLCanvasElement,
  axes: AxisWithValue[],
  destinyScore: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 80;
  const numAxes = axes.length;

  // White background for print-friendly PDF
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Draw concentric rings
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];
  for (const ring of rings) {
    ctx.beginPath();
    ctx.strokeStyle = "#CCCCCC";
    ctx.lineWidth = 1;
    for (let i = 0; i <= numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * ring;
      const y = centerY + Math.sin(angle) * radius * ring;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Ring label
    if (ring < 1.0) {
      ctx.fillStyle = "#999999";
      ctx.font = "10px sans-serif";
      ctx.fillText(`${Math.round(ring * 100)}`, centerX + 4, centerY - radius * ring - 2);
    }
  }

  // Draw axis lines
  for (let i = 0; i < numAxes; i++) {
    const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius
    );
    ctx.strokeStyle = "#DDDDDD";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw data polygon (filled)
  ctx.beginPath();
  for (let i = 0; i < numAxes; i++) {
    const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    const value = axes[i].value / 100;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(1, 217, 141, 0.2)";
  ctx.fill();
  ctx.strokeStyle = "#01D98D";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw data points
  for (let i = 0; i < numAxes; i++) {
    const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    const value = axes[i].value / 100;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#01D98D";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw axis labels
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < numAxes; i++) {
    const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    const labelRadius = radius + 40;
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;

    const shortName = axes[i].axisName
      ? axes[i].axisName!.replace("The ", "").replace(" Axis", "")
      : `Axis ${i}`;

    ctx.fillStyle = "#333333";
    ctx.fillText(shortName, x, y);

    // Value below name
    ctx.fillStyle = "#01D98D";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(`${axes[i].value}`, x, y + 14);
    ctx.font = "11px sans-serif";
  }

  // Center score
  ctx.fillStyle = "#01D98D";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${destinyScore}%`, centerX, centerY - 8);
  ctx.fillStyle = "#666666";
  ctx.font = "12px sans-serif";
  ctx.fillText("DESTINY SCORE", centerX, centerY + 16);
}

export function DestinyScoreExport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const axesQuery = trpc.sliders.listAxes.useQuery();
  const latestStatesQuery = trpc.sliders.getLatestStates.useQuery();
  const destinyScoreQuery = trpc.sliders.getDestinyScore.useQuery();
  const cyclesQuery = trpc.dailyCycle.getHistory.useQuery({ days: 7 });

  const generatePDF = useCallback(async () => {
    if (!axesQuery.data || !latestStatesQuery.data || !canvasRef.current) return;
    setIsGenerating(true);

    try {
      const axes = axesQuery.data;
      const latestStates = latestStatesQuery.data;
      const destinyScore = destinyScoreQuery.data?.score ?? 50;

      // Build axis-value map from latest states
      const stateMap = new Map<number, number>();
      for (const state of latestStates) {
        stateMap.set(state.axisId, state.value);
      }

      // Merge axes with their current values
      const axesWithValues: AxisWithValue[] = axes.map((axis) => ({
        axisName: axis.axisName,
        leftLabel: axis.leftLabel,
        rightLabel: axis.rightLabel,
        value: stateMap.get(axis.id) ?? 50,
      }));

      // Calculate streak from cycles
      const cycles = cyclesQuery.data || [];
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0];
        const hasCycle = cycles.some((c: any) => {
          const cycleDate = new Date(c.date || c.createdAt).toISOString().split("T")[0];
          return cycleDate === dateStr;
        });
        if (hasCycle) streak++;
        else if (i > 0) break;
      }

      // Draw radar chart on canvas
      const canvas = canvasRef.current;
      canvas.width = 700;
      canvas.height = 700;
      drawRadarChart(canvas, axesWithValues, destinyScore);

      // Generate PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // White background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Header — darker green for readability on white
      pdf.setTextColor(1, 140, 90);
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.text("DESTINY HACKING", pageWidth / 2, 25, { align: "center" });

      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        language === "pt" ? "Relatório da Pontuação do Destino" : "Destiny Score Report",
        pageWidth / 2, 33,
        { align: "center" }
      );

      // Divider
      pdf.setDrawColor(1, 140, 90);
      pdf.setLineWidth(0.5);
      pdf.line(pageWidth / 2 - 30, 37, pageWidth / 2 + 30, 37);

      // User info and date
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      const userName = user?.name || (language === "pt" ? "Capitão" : "Captain");
      const dateStr = new Date().toLocaleDateString(language === "pt" ? "pt-PT" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      pdf.text(`${userName}  •  ${dateStr}`, pageWidth / 2, 43, { align: "center" });

      // Destiny Score large
      pdf.setTextColor(1, 180, 110);
      pdf.setFontSize(48);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${destinyScore}%`, pageWidth / 2, 60, { align: "center" });

      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      const streakLabel = language === "pt" ? `Sequência: ${streak} dias` : `Streak: ${streak} days`;
      pdf.text(streakLabel, pageWidth / 2, 66, { align: "center" });

      // Radar chart image
      const chartDataUrl = canvas.toDataURL("image/png");
      const chartSize = 110;
      pdf.addImage(
        chartDataUrl,
        "PNG",
        (pageWidth - chartSize) / 2,
        70,
        chartSize,
        chartSize
      );

      // Axis table
      const tableY = 185;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(1, 140, 90);
      pdf.text(language === "pt" ? "OS 15 EIXOS DA VONTADE LIVRE" : "THE 15 AXES OF FREE WILL", pageWidth / 2, tableY, { align: "center" });

      // Table headers
      const colX = [15, 55, 115, 155];
      const headerY = tableY + 8;
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text("#", colX[0], headerY);
      pdf.text(language === "pt" ? "EIXO" : "AXIS", colX[1], headerY);
      pdf.text(language === "pt" ? "ESPECTRO" : "SPECTRUM", colX[2], headerY);
      pdf.text(language === "pt" ? "VALOR" : "VALUE", colX[3], headerY);

      // Divider under headers
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(colX[0], headerY + 2, pageWidth - 15, headerY + 2);

      // Table rows
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      axesWithValues.forEach((axis, i) => {
        const rowY = headerY + 6 + i * 5.2;
        const value = axis.value;

        // Row number
        pdf.setTextColor(150, 150, 150);
        pdf.text(`${i}`, colX[0], rowY);

        // Axis name
        pdf.setTextColor(30, 30, 30);
        const name = axis.axisName || `Axis ${i}`;
        pdf.text(name.length > 22 ? name.substring(0, 22) + "…" : name, colX[1], rowY);

        // Spectrum
        pdf.setTextColor(80, 80, 80);
        const spectrum = `${axis.leftLabel} ↔ ${axis.rightLabel}`;
        pdf.text(spectrum.length > 25 ? spectrum.substring(0, 25) + "…" : spectrum, colX[2], rowY);

        // Value with color coding
        if (value >= 70) pdf.setTextColor(1, 140, 90);
        else if (value >= 40) pdf.setTextColor(180, 150, 0);
        else pdf.setTextColor(200, 50, 50);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${value}`, colX[3], rowY);
        pdf.setFont("helvetica", "normal");

        // Mini bar
        const barX = colX[3] + 12;
        const barWidth = 30;
        const barHeight = 2;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(barX, rowY - 2, barWidth, barHeight, "F");
        if (value >= 70) pdf.setFillColor(1, 217, 141);
        else if (value >= 40) pdf.setFillColor(255, 215, 0);
        else pdf.setFillColor(200, 50, 50);
        pdf.rect(barX, rowY - 2, barWidth * (value / 100), barHeight, "F");
      });

      // Footer
      pdf.setTextColor(120, 120, 120);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "italic");
      pdf.text(
        language === "pt"
          ? "\"Sou o mestre do meu destino, sou o capitão da minha alma.\" — Invictus"
          : "\"I am the master of my fate, I am the captain of my soul.\" — Invictus",
        pageWidth / 2,
        pageHeight - 12,
        { align: "center" }
      );

      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "normal");
      pdf.text("Destiny Hacking • destinyhack.manus.space", pageWidth / 2, pageHeight - 7, { align: "center" });

      // Save
      const filename = `destiny-score-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [axesQuery.data, latestStatesQuery.data, destinyScoreQuery.data, cyclesQuery.data, user, language]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <Button
        onClick={generatePDF}
        disabled={isGenerating || !axesQuery.data || !latestStatesQuery.data}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {t("Export PDF", "Exportar PDF")}
      </Button>
    </>
  );
}
