import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvasPro from 'html2canvas-pro';
import { Loader2, FileCheck } from 'lucide-react';
import { PageData } from '../utils/catalogPagination';
import { CatalogSettings } from '../types';
import { CatalogPage } from './CatalogPage';

interface PdfExportEngineProps {
  pages: PageData[];
  settings: CatalogSettings;
  catalogTitle: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

export const PdfExportEngine: React.FC<PdfExportEngineProps> = ({
  pages,
  settings,
  catalogTitle,
  onComplete,
  onError,
}) => {
  const [exportIndex, setExportIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Preparing PDF pages...');
  const pdfRef = useRef<jsPDF | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const isLandscape = settings.orientation === 'landscape';

  const waitForNextPaint = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

  const waitForStablePage = async (targetEl: HTMLElement) => {
    if ('fonts' in document) {
      await (document as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready;
    }

    await waitForNextPaint();

    const images = Array.from(targetEl.querySelectorAll('img'));
    await Promise.all(
      images.map(async (img: HTMLImageElement) => {
        if (img.complete && img.naturalWidth > 0) {
          if (typeof img.decode === 'function') {
            try {
              await img.decode();
            } catch {
              // Ignore decode failures when the image is already present.
            }
          }
          return;
        }

        await new Promise<void>((resolve) => {
          let settled = false;
          const done = () => {
            if (!settled) {
              settled = true;
              resolve();
            }
          };

          img.onload = done;
          img.onerror = done;
          setTimeout(done, 2000);
        });
      })
    );

    await waitForNextPaint();
  };

  useEffect(() => {
    pdfRef.current = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  }, [isLandscape]);

  useEffect(() => {
    let isCancelled = false;

    async function processPage() {
      if (!pdfRef.current || pages.length === 0) return;

      const totalPages = pages.length;
      setStatusMessage(`Rendering page ${exportIndex + 1} of ${totalPages}...`);

      await waitForNextPaint();
      if (isCancelled) return;

      const targetEl = pageContainerRef.current;
      if (!targetEl) {
        console.error(`Render target not found for page index ${exportIndex}`);
        onError(`Failed to prepare page ${exportIndex + 1} for PDF export.`);
        return;
      }

      await waitForStablePage(targetEl);
      if (isCancelled) return;

      try {
        const widthPx = isLandscape ? 1123 : 794;
        const heightPx = isLandscape ? 794 : 1123;

        const canvas = await html2canvasPro(targetEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          width: widthPx,
          height: heightPx,
          windowWidth: widthPx,
          windowHeight: heightPx,
        });

        if (isCancelled) return;

        const imgData = canvas.toDataURL('image/png');
        const pdf = pdfRef.current;
        const pdfWidth = isLandscape ? 297 : 210;
        const pdfHeight = isLandscape ? 210 : 297;

        if (exportIndex > 0) {
          pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
        }

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

        if (exportIndex < totalPages - 1) {
          setExportIndex((prev) => prev + 1);
          return;
        }

        setStatusMessage('Finalizing PDF download...');
        const sanitizedTitle = (catalogTitle || 'catalog')
          .toLowerCase()
          .replace(/[^a-z0-9_-]/gi, '_');

        pdf.save(`${sanitizedTitle}_catalog.pdf`);

        setTimeout(() => {
          if (!isCancelled) {
            onComplete();
          }
        }, 400);
      } catch (err) {
        console.error(`PDF export capture error on page ${exportIndex + 1}:`, err);
        onError(`An error occurred while capturing page ${exportIndex + 1}.`);
      }
    }

    processPage();

    return () => {
      isCancelled = true;
    };
  }, [exportIndex, pages, settings, catalogTitle, isLandscape, onComplete, onError]);

  const currentPage = pages[exportIndex];
  if (!currentPage) return null;

  return (
    <>
      <div
        id="pdf-export-viewport"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isLandscape ? '1123px' : '794px',
          height: isLandscape ? '794px' : '1123px',
          zIndex: 9998,
          backgroundColor: '#ffffff',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div ref={pageContainerRef}>
          <CatalogPage
            key={`pdf-page-${exportIndex}`}
            page={currentPage}
            pageIndex={exportIndex}
            settings={settings}
            idOverride={`pdf-page-${exportIndex}`}
            exportMode
          />
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[10000] bg-slate-900/95 border border-slate-700 p-5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-4 text-white max-w-xs animate-in fade-in slide-in-from-bottom-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
          {exportIndex === pages.length - 1 ? (
            <FileCheck className="w-5 h-5 text-emerald-400 animate-bounce" />
          ) : (
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-100">{statusMessage}</h4>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Page {exportIndex + 1} of {pages.length}
          </p>
        </div>
      </div>
    </>
  );
};
