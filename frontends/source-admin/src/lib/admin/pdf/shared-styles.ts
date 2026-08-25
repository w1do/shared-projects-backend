import { semanticColors } from "@/lib/theme-colors";

/**
 * Shared base styles for admin PDF reports (brands / categories / products).
 * Domain modules append their own column-width and table-specific rules.
 * Colors resolve from semantic theme tokens so exports stay on-brand.
 */
export const sharedPdfReportBaseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@300;400;500;600;700&display=swap');
  .ae-pdf-report {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: ${semanticColors.foreground};
    background-color: ${semanticColors.background};
    padding: 30px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .ae-pdf-report .container { max-width: 800px; margin: 0 auto; }
  .ae-pdf-report .font-serif { font-family: 'Fraunces', Georgia, serif; }
  .ae-pdf-report .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid ${semanticColors.brandAccent};
    padding-bottom: 12px;
    margin-bottom: 20px;
    width: 100%;
    box-sizing: border-box;
  }
  .ae-pdf-report .header-left { width: 50%; text-align: left; }
  .ae-pdf-report .header-right { width: 50%; text-align: right; }
  .ae-pdf-report .brand-logo { font-size: 22px; font-weight: 700; letter-spacing: 1.5px; color: ${semanticColors.foreground}; margin: 0 0 4px 0; }
  .ae-pdf-report .report-title { font-size: 22px; font-weight: 600; color: ${semanticColors.brandAccent}; margin: 0; letter-spacing: -0.5px; line-height: 1.2; }
  .ae-pdf-report .report-subtitle { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: ${semanticColors.mutedForeground}; margin: 4px 0 0 0; }
  .ae-pdf-report .metadata-bar {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: ${semanticColors.mutedForeground};
    margin-bottom: 25px;
    padding: 8px 12px;
    background-color: ${semanticColors.inputDisabled};
    border-radius: 6px;
    border: 1px solid ${semanticColors.border};
  }
  .ae-pdf-report .stats-flex { display: flex; justify-content: space-between; margin-bottom: 25px; width: 100%; box-sizing: border-box; }
  .ae-pdf-report .stat-card {
    width: 23.5%;
    background-color: ${semanticColors.inputDisabled};
    border-radius: 8px;
    padding: 12px;
    border: 1px solid ${semanticColors.border};
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 80px;
  }
  .ae-pdf-report .stat-card.featured { background-color: ${semanticColors.accent}; border-color: ${semanticColors.brandAccentHover}; }
  .ae-pdf-report .stat-label { font-size: 8.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: ${semanticColors.mutedForeground}; margin-bottom: 4px; }
  .ae-pdf-report .stat-value { font-size: 17px; font-weight: 700; color: ${semanticColors.foreground}; line-height: 1.2; }
  .ae-pdf-report .stat-desc { font-size: 8px; color: ${semanticColors.mutedForeground}; margin-top: 4px; }
  .ae-pdf-report .section-title { font-size: 13px; font-weight: 600; color: ${semanticColors.foreground}; margin: 25px 0 12px 0; border-bottom: 1px solid ${semanticColors.border}; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.8px; }
  .ae-pdf-report .visual-section { background-color: ${semanticColors.background}; border: 1px solid ${semanticColors.border}; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
  .ae-pdf-report .data-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 25px; table-layout: fixed; }
  .ae-pdf-report .data-table th {
    background-color: ${semanticColors.inputDisabled};
    color: ${semanticColors.foreground};
    font-weight: 600;
    text-transform: uppercase;
    font-size: 8.5px;
    letter-spacing: 0.5px;
    padding: 8px 10px;
    border-bottom: 2px solid ${semanticColors.border};
    text-align: left;
  }
  .ae-pdf-report .data-table td { padding: 10px 10px; border-bottom: 1px solid ${semanticColors.muted}; vertical-align: middle; word-wrap: break-word; overflow: hidden; }
  .ae-pdf-report .data-table tr:last-child td { border-bottom: 2px solid ${semanticColors.border}; }
  .ae-pdf-report .report-footer {
    border-top: 1px solid ${semanticColors.border};
    padding-top: 12px;
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
    font-size: 8.5px;
    color: ${semanticColors.mutedForeground};
  }
  @media print {
    .ae-pdf-report { padding: 0; background-color: ${semanticColors.background}; }
    @page { size: A4 portrait; margin: 15mm 15mm; }
  }
`;
