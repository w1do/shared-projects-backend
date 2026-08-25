import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "../styles.css";
import { Toaster } from "@/components/ui/feedback/sonner";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: siteConfig.seo.rootTitle,
  description: siteConfig.seo.rootDescription,
  authors: [{ name: "Lovable" }],
  openGraph: {
    title: siteConfig.seo.rootTitle,
    description: siteConfig.seo.rootDescription,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteConfig.seo.rootTitle,
    description: siteConfig.seo.rootDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Script
          id="apexcharts-error-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const isApexChartsError = (msg) => msg && (
                  msg.indexOf("Cannot read properties of null (reading 'node')") !== -1 ||
                  msg.indexOf("reading 'node'") !== -1
                );
                window.addEventListener('error', (event) => {
                  if (isApexChartsError(event.message)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
                window.addEventListener('unhandledrejection', (event) => {
                  if (event.reason && isApexChartsError(event.reason.message)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
              }
            `,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
// Trigger rebuild for styles
