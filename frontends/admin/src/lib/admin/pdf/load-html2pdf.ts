export interface Html2PdfInstance {
  set: (options: unknown) => Html2PdfInstance;
  from: (element: HTMLElement) => Html2PdfInstance;
  save: () => Promise<void>;
}

export type Html2PdfFunction = (element?: HTMLElement, options?: unknown) => Html2PdfInstance;

const html2PdfCdnUrl =
  "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

/**
 * Loads the html2pdf bundle from CDN once and caches it on the window object.
 * Mirrors the proven loading strategy used by the brands report exporter.
 */
export function loadHtml2Pdf(): Promise<Html2PdfFunction> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("html2pdf can only be loaded in a browser environment"));
      return;
    }

    const win = window as unknown as { html2pdf?: Html2PdfFunction };
    if (win.html2pdf) {
      resolve(win.html2pdf);
      return;
    }

    const script = document.createElement("script");
    script.src = html2PdfCdnUrl;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (win.html2pdf) {
        resolve(win.html2pdf);
      } else {
        reject(new Error("html2pdf failed to initialize from CDN"));
      }
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

/**
 * Renders a full HTML document string into a PDF using an isolated, visually
 * hidden iframe. The iframe prevents the report CSS from leaking into the admin
 * UI and gives fonts/SVGs time to paint before rasterization.
 */
export async function renderHtmlToPdf(htmlContent: string, filename: string) {
  const html2pdf = await loadHtml2Pdf();

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "800px";
  iframe.style.height = "1200px";
  iframe.style.zIndex = "-9999";
  iframe.style.opacity = "0.01";
  iframe.style.border = "none";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  const pdfOptions = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  // Wait for iframe fonts and SVGs to load and paint before rasterizing.
  setTimeout(async () => {
    try {
      await html2pdf().set(pdfOptions).from(iframeDoc.body).save();
    } catch (err) {
      console.error("Failed to generate PDF inside iframe:", err);
    } finally {
      document.body.removeChild(iframe);
    }
  }, 800);
}
