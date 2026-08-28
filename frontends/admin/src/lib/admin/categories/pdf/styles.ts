import { sharedPdfReportBaseStyles } from "@/lib/admin/pdf/shared-styles";
import { semanticColors } from "@/lib/theme-colors";

const categoryPdfColumnStyles = `
  .ae-pdf-report .col-rank { width: 6%; text-align: center; }
  .ae-pdf-report .col-name { width: 28%; }
  .ae-pdf-report .col-parent { width: 17%; }
  .ae-pdf-report .col-status { width: 12%; text-align: center; }
  .ae-pdf-report .col-children { width: 14%; text-align: center; }
  .ae-pdf-report .cat-slug { font-size: 9px; color: ${semanticColors.mutedForeground}; margin-top: 1px; }
`;

export const categoryPdfReportStyles = `${sharedPdfReportBaseStyles}${categoryPdfColumnStyles}`;
