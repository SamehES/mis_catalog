import React, { useEffect, useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvasPro from 'html2canvas-pro';
import { PageData } from '../utils/catalogPagination';
import { CatalogSettings } from '../types';
import { CatalogPage } from './CatalogPage';
import { Loader2, FileCheck } from 'lucide-react';

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
  const [statusMessage, setStatusMessage] = useState('جاري تجهيز الصفحات...');
  const pdfRef = useRef<jsPDF | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const isLandscape = settings.orientation === 'landscape';

  // Initialize jsPDF instance when component mounts
  useEffect(() => {
    pdfRef.current = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  }, [isLandscape]);

  // Process current page sequentially when exportIndex updates
  useEffect(() => {
    let isCancelled = false;

    async function processPage() {
      if (!pdfRef.current || pages.length === 0) return;

      const totalPages = pages.length;
      setStatusMessage(`جاري معالجة الصفحة ${exportIndex + 1} من ${totalPages}...`);

      // 1. Give React DOM time to paint the new page into the viewport
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (isCancelled) return;

      const targetEl = pageContainerRef.current || document.getElementById('active-pdf-page');
      if (!targetEl) {
        console.error(`Render target active-pdf-page not found for index ${exportIndex}`);
        onError(`تعذر العثور على الصفحة ${exportIndex + 1}`);
        return;
      }

      // 2. Wait for all product images on the page to be fully loaded
      const images = Array.from(targetEl.querySelectorAll('img'));
      await Promise.all(
        images.map(
          (img: HTMLImageElement) =>
            new Promise((resolve) => {
              if (img.complete && img.naturalWidth > 0) {
                resolve(true);
              } else {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(true);
                setTimeout(() => resolve(true), 1500);
              }
            })
        )
      );

      if (isCancelled) return;

      // 3. Capture high-DPI canvas
      try {
        const widthPx = isLandscape ? 1123 : 794;
        const heightPx = isLandscape ? 794 : 1123;

        const canvas = await html2canvasPro(targetEl, {
          scale: 2, // High resolution rendering
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

        // 4. Progress to next page or conclude PDF export
        if (exportIndex < totalPages - 1) {
          setExportIndex((prev) => prev + 1);
        } else {
          setStatusMessage('جاري إنهاء وتحميل ملف الـ PDF...');
          const sanitizedTitle = (catalogTitle || 'catalog')
            .toLowerCase()
            .replace(/[^a-z0-9_-]/gi, '_');

          pdf.save(`${sanitizedTitle}_catalog.pdf`);

          setTimeout(() => {
            if (!isCancelled) {
              onComplete();
            }
          }, 400);
        }
      } catch (err: any) {
        console.error(`PDF export capture error on page ${exportIndex + 1}:`, err);
        onError(`حدث خطأ أثناء تصوير الصفحة ${exportIndex + 1}`);
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
      {/* 1. Visible, pristine viewport container for active page capture (no dark overlays in front) */}
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
        <div ref={pageContainerRef} id="active-pdf-page">
          <CatalogPage
            page={currentPage}
            pageIndex={exportIndex}
            settings={settings}
            idOverride="active-pdf-page"
          />
        </div>
      </div>

      {/* 2. Floating status dialog positioned in bottom-right corner out of the way of top-left canvas */}
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
            صفحة {exportIndex + 1} من {pages.length}
          </p>
        </div>
      </div>
    </>
  );
};
