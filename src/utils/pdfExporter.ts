import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import html2canvasPro from 'html2canvas-pro';
import { PageData } from './catalogPagination';

export async function exportCatalogToPdf(
  pages: PageData[],
  title: string,
  orientation: 'portrait' | 'landscape',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const isLandscape = orientation === 'landscape';
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = isLandscape ? 297 : 210;
  const pdfHeight = isLandscape ? 210 : 297;

  for (let i = 0; i < pages.length; i++) {
    if (onProgress) {
      onProgress(i + 1, pages.length);
    }

    const pageElement = document.getElementById(`catalog-page-${i}`);
    if (!pageElement) {
      console.warn(`Catalog page DOM element catalog-page-${i} not found.`);
      continue;
    }

    let imgData: string;

    try {
      // Primary high-fidelity rendering using browser-native SVG foreignObject canvas
      imgData = await toPng(pageElement, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#ffffff',
        style: {
          transform: 'none',
          margin: '0',
        },
      });
    } catch (toPngError) {
      console.warn('toPng rendering failed, falling back to html2canvas-pro:', toPngError);
      // Secondary fallback using html2canvas-pro (which supports oklch parsing out of the box)
      const canvas = await html2canvasPro(pageElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      imgData = canvas.toDataURL('image/png');
    }

    if (i > 0) {
      pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
    }

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  }

  const sanitizedTitle = (title || 'catalog')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_');

  pdf.save(`${sanitizedTitle}_catalog.pdf`);
}
