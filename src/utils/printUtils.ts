import { exportElementToPdf } from "./pdfExport";

export interface PrintOptions {
  elementId?: string;
  documentTitle?: string;
  fallbackPdf?: () => void | Promise<any>;
  onSuccess?: () => void;
  onError?: (errMessage: string) => void;
}

/**
 * Robust cross-browser and iframe-safe Print Executor.
 * Gracefully handles iframe print blocks, pop-up blocks, and triggers fallback PDF export.
 */
export async function safePrint(options: PrintOptions = {}): Promise<boolean> {
  const { elementId, documentTitle, fallbackPdf, onSuccess, onError } = options;

  if (documentTitle) {
    const originalTitle = document.title;
    document.title = documentTitle;
    setTimeout(() => {
      document.title = originalTitle;
    }, 3000);
  }

  // 1. Try standard window.print()
  try {
    const isIframe = window.self !== window.top;
    
    // Attempt standard print
    window.print();
    if (onSuccess) onSuccess();
    return true;
  } catch (err: any) {
    console.warn("Direct window.print() blocked or failed:", err);

    // 2. If window.print() failed/blocked, try targeted element printable popup
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        try {
          const printWindow = window.open("", "_blank", "width=800,height=900");
          if (printWindow) {
            printWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>${documentTitle || "Print Document"}</title>
                  <style>
                    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #0f172a; }
                    * { box-sizing: border-box; }
                    .no-print { display: none !important; }
                  </style>
                </head>
                <body>
                  ${element.outerHTML}
                  <script>
                    window.onload = function() {
                      window.print();
                      setTimeout(function() { window.close(); }, 500);
                    };
                  </script>
                </body>
              </html>
            `);
            printWindow.document.close();
            if (onSuccess) onSuccess();
            return true;
          }
        } catch (popupErr) {
          console.warn("Print popup window was also blocked:", popupErr);
        }
      }
    }

    // 3. Fallback to programmatic high-quality PDF generator
    if (fallbackPdf) {
      try {
        await fallbackPdf();
        if (onSuccess) onSuccess();
        return true;
      } catch (pdfErr: any) {
        console.error("PDF Fallback Export failed:", pdfErr);
      }
    } else if (elementId) {
      const exported = await exportElementToPdf(elementId, documentTitle || "Document_Print");
      if (exported) {
        if (onSuccess) onSuccess();
        return true;
      }
    }

    if (onError) {
      onError("Print is unavailable in this environment. A PDF copy has been requested.");
    }
    return false;
  }
}
