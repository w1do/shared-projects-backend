import { sharedPdfReportBaseStyles } from "@/lib/admin/pdf/shared-styles";
import { semanticColors } from "@/lib/theme-colors";

const productsPdfColumnStyles = `
  .ae-pdf-report .col-sku { width: 15%; font-family: monospace; font-size: 10px; color: ${semanticColors.mutedForeground}; }
  .ae-pdf-report .col-name { width: 32%; }
  .ae-pdf-report .col-brand { width: 15%; }
  .ae-pdf-report .col-category { width: 13%; }
  .ae-pdf-report .col-stock { width: 12%; text-align: center; }
  .ae-pdf-report .col-price { width: 10%; text-align: right; }
  .ae-pdf-report .col-revenue { width: 13%; text-align: right; }
`;

export const pdfReportStyles = `${sharedPdfReportBaseStyles}${productsPdfColumnStyles}`;
