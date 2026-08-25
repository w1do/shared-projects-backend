import { sharedPdfReportBaseStyles } from "@/lib/admin/pdf/shared-styles";

const brandsPdfColumnStyles = `
  .ae-pdf-report .col-rank { width: 6%; text-align: center; }
  .ae-pdf-report .col-name { width: 26%; }
  .ae-pdf-report .col-origin { width: 18%; }
  .ae-pdf-report .col-status { width: 12%; text-align: center; }
  .ae-pdf-report .col-share { width: 13%; text-align: right; }
  .ae-pdf-report .col-revenue { width: 15%; text-align: right; }
  .ae-pdf-report .col-trend { width: 10%; text-align: center; }
`;

export const pdfReportStyles = `${sharedPdfReportBaseStyles}${brandsPdfColumnStyles}`;
