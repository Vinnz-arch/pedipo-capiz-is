import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export interface ExportableOpportunity {
  id?: number | string;
  project_name: string;
  category?: { name: string } | null;
  municipality?: { name: string } | null;
  location?: string;
  roi_estimate?: number | string;
  land_area?: number | string;
  key_incentives?: string;
  incentive_package?: string;
  description?: string;
  status?: string;
}

interface CatalogExportOptions {
  category?: string;
  search?: string;
}

/**
 * Exports multiple investment opportunities into an official multi-page PEDIPO Catalog PDF.
 */
export const exportOpportunitiesToPdf = (
  opportunities: ExportableOpportunity[],
  options?: CatalogExportOptions
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Header Banner
  doc.setFillColor(0, 43, 102); // #002B66 Capiz Navy
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("REPUBLIC OF THE PHILIPPINES • PROVINCE OF CAPIZ", margin, 9);

  doc.setFontSize(14);
  doc.text("PROVINCIAL ECONOMIC DEVELOPMENT & INVESTMENT PROMOTION OFFICE", margin, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text("Capiz Provincial Capitol, Roxas City, Capiz 5800 | pedipo@capiz.gov.ph", margin, 22);

  // 2. Title Section
  let currentY = 36;
  doc.setTextColor(0, 43, 102);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PRIORITY INVESTMENT OPPORTUNITIES CATALOG", margin, currentY);

  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const filterSummary = [
    `Generated: ${dateFormatted}`,
    options?.category && options.category !== "All" ? `Category: ${options.category}` : null,
    options?.search ? `Search: "${options.search}"` : null,
  ].filter(Boolean).join("  |  ");

  doc.text(filterSummary, margin, currentY);

  // 3. Summary Metric Cards
  currentY += 6;
  const cardWidth = (pageWidth - margin * 2 - 8) / 3;
  const cardHeight = 16;

  // Calculate Metrics
  const totalCount = opportunities.length;
  const uniqueSectors = new Set(opportunities.map((o) => o.category?.name).filter(Boolean)).size;

  const totalArea = opportunities
    .map((o) => parseFloat(String(o.land_area || 0)))
    .filter((v) => !isNaN(v) && v > 0)
    .reduce((a, b) => a + b, 0);

  const metrics = [
    { label: "LISTED OPPORTUNITIES", value: `${totalCount} Projects` },
    { label: "PRIORITY SECTORS", value: `${uniqueSectors || 4} Sectors` },
    { label: "TOTAL DESIGNATED LAND", value: totalArea > 0 ? `${totalArea.toFixed(1)} Hectares` : "Strategic Lots" },
  ];

  metrics.forEach((m, idx) => {
    const cardX = margin + idx * (cardWidth + 4);
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cardX + 3, currentY + 5);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 43, 102);
    doc.text(m.value, cardX + 3, currentY + 12);
  });

  currentY += cardHeight + 6;

  // 4. Structured Data Table
  const tableData = opportunities.map((opp, idx) => {
    const location = opp.municipality?.name || opp.location || "Capiz, Region VI";
    const category = opp.category?.name || "General";
    const area = opp.land_area ? `${opp.land_area} Ha` : "Designated Lot";
    const desc = opp.description
      ? opp.description.length > 220
        ? `${opp.description.substring(0, 220)}...`
        : opp.description
      : "High-priority investment opportunity designated by PEDIPO Capiz.";

    return [
      String(idx + 1),
      `${opp.project_name}\n[${category}]`,
      location,
      area,
      desc,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["#", "Project & Sector", "Location", "Land Area", "Key Incentives & Project Scope"]],
    body: tableData,
    margin: { left: margin, right: margin, bottom: 20 },
    theme: "grid",
    headStyles: {
      fillColor: [0, 43, 102],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 3,
      valign: "top",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 48, fontStyle: "bold" },
      2: { cellWidth: 28 },
      3: { cellWidth: 22, halign: "center", fontStyle: "bold", textColor: [0, 43, 102] },
      4: { cellWidth: "auto" },
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageCount = (doc.internal as any).getNumberOfPages();
      const currentPage = data.pageNumber;

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text(
        "PEDIPO Capiz Economic Dashboard • Official Investment Portfolio • All rights reserved.",
        margin,
        pageHeight - 7
      );

      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageWidth - margin - 15,
        pageHeight - 7
      );
    },
  });

  // Save PDF
  const filename = `Capiz_Investment_Opportunities_Catalog_${now.toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
};

/**
 * Exports a single investment opportunity into an official 1-page Project Fact Sheet PDF.
 */
export const exportSingleOpportunityPdf = (opp: ExportableOpportunity) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;

  // Header Banner
  doc.setFillColor(0, 43, 102); // #002B66
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("REPUBLIC OF THE PHILIPPINES • PROVINCE OF CAPIZ", margin, 10);

  doc.setFontSize(13);
  doc.text("PROVINCIAL ECONOMIC DEVELOPMENT & INVESTMENT PROMOTION OFFICE", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text("INVESTMENT OPPORTUNITY FACT SHEET & BRIEFING PROFILE", margin, 25);

  let currentY = 44;

  // Category Tag & Location
  const categoryName = opp.category?.name || "Priority Sector";
  const location = opp.municipality?.name || opp.location || "Roxas City, Capiz";

  doc.setFillColor(239, 246, 255); // Blue 50
  doc.setDrawColor(191, 219, 254); // Blue 200
  doc.roundedRect(margin, currentY, 35, 7, 1.5, 1.5, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 82, 204);
  doc.text(categoryName.toUpperCase(), margin + 3, currentY + 4.8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Location: ${location}, Capiz`, margin + 40, currentY + 5);

  // Project Title
  currentY += 14;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 43, 102);
  doc.text(opp.project_name, margin, currentY);

  // Metrics Highlight Box
  currentY += 7;
  const metricsBoxWidth = pageWidth - margin * 2;
  const metricsBoxHeight = 22;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, metricsBoxWidth, metricsBoxHeight, 2, 2, "FD");

  const colWidth = metricsBoxWidth / 3;

  // Metric 1: Sector
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("INDUSTRY SECTOR", margin + 6, currentY + 7);
  doc.setFontSize(12);
  doc.setTextColor(0, 43, 102);
  doc.text(categoryName.toUpperCase(), margin + 6, currentY + 16);

  // Metric 2: Land Area
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("DESIGNATED LAND AREA", margin + colWidth + 6, currentY + 7);
  doc.setFontSize(14);
  doc.setTextColor(0, 43, 102);
  doc.text(opp.land_area ? `${opp.land_area} Hectares` : "Strategic Lot", margin + colWidth + 6, currentY + 16);

  // Metric 3: Status
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("INVESTMENT READINESS", margin + colWidth * 2 + 6, currentY + 7);
  doc.setFontSize(12);
  doc.setTextColor(22, 163, 74); // Green
  doc.text("OPEN FOR INQUIRIES", margin + colWidth * 2 + 6, currentY + 15);

  // Project Scope / Description
  currentY += metricsBoxHeight + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 43, 102);
  doc.text("PROJECT SCOPE & OBJECTIVES", margin, currentY);

  currentY += 4;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  const fullDescription =
    opp.description ||
    "This initiative represents an officially recognized investment priority designated by the Provincial Economic Development and Investment Promotion Office (PEDIPO) of Capiz. Interested private sector developers, venture consortiums, and co-financing institutions may contact the PEDIPO secretariat to obtain masterplanning blueprints and schedule formal technical meetings.";

  const splitDescription = doc.splitTextToSize(fullDescription, pageWidth - margin * 2);
  doc.text(splitDescription, margin, currentY + 3);

  // Contact / Facilitation Banner at Bottom
  const bannerY = pageHeight - 45;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, bannerY, pageWidth - margin * 2, 24, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 43, 102);
  doc.text("DIRECT FACILITATION & INQUIRY CHANNELS", margin + 6, bannerY + 7);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Provincial Economic Development and Investment Promotion Office (PEDIPO)\nCapiz Provincial Capitol, Roxas City, Capiz 5800\nEmail: pedipo@capiz.gov.ph | investment@capiz.gov.ph",
    margin + 6,
    bannerY + 13
  );

  // Bottom Footer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Official Investment Fact Sheet • Generated on ${new Date().toLocaleDateString()} via PEDIPO Capiz IS`,
    margin,
    pageHeight - 10
  );

  const safeTitle = opp.project_name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);
  doc.save(`Capiz_Investment_${safeTitle}.pdf`);
};
