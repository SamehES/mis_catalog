import React, { useState } from 'react';
import { PageData } from '../utils/catalogPagination';
import { CatalogSettings } from '../types';
import { CatalogPage } from './CatalogPage';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, FileText } from 'lucide-react';

interface CatalogPreviewProps {
  pages: PageData[];
  settings: CatalogSettings;
  onOpenPrintPreview: () => void;
}

export const CatalogPreview: React.FC<CatalogPreviewProps> = ({
  pages,
  settings,
  onOpenPrintPreview,
}) => {
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [zoomScale, setZoomScale] = useState<number>(0.7); // 70% scale by default for optimal side-by-side fit

  const activePage = pages[currentPageIdx] || pages[0];

  const handleZoom = (delta: number) => {
    setZoomScale((prev) => Math.min(Math.max(0.4, prev + delta), 1.2));
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full min-h-[680px]">
      {/* Top Preview Control Bar */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">Live A4 Catalog Preview</span>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
          </span>
        </div>

        {/* Page Navigation & Scale Controls */}
        <div className="flex items-center gap-3">
          {/* Page Navigator */}
          {pages.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
              <button
                disabled={currentPageIdx === 0}
                onClick={() => setCurrentPageIdx((p) => Math.max(0, p - 1))}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-200 min-w-[3.5rem] text-center">
                {currentPageIdx + 1} / {pages.length}
              </span>
              <button
                disabled={currentPageIdx === pages.length - 1}
                onClick={() => setCurrentPageIdx((p) => Math.min(pages.length - 1, p + 1))}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-semibold text-slate-300 w-10 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Print Preview */}
          <button
            onClick={onOpenPrintPreview}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 transition-colors"
            title="Open Fullscreen Page Inspector"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 bg-slate-950 p-6 overflow-auto flex items-center justify-center">
        {pages.length === 0 || !activePage ? (
          <div className="text-slate-500 text-xs font-medium py-12">No products added</div>
        ) : (
          <div
            className="transition-transform duration-200 origin-top flex justify-center"
            style={{ transform: `scale(${zoomScale})` }}
          >
            <CatalogPage page={activePage} pageIndex={currentPageIdx} settings={settings} />
          </div>
        )}
      </div>

      {/* Page Thumbnails Selector Bar at Bottom */}
      {pages.length > 1 && (
        <div className="bg-slate-950 border-t border-slate-800 p-3 overflow-x-auto flex items-center justify-center gap-3">
          {pages.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPageIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                currentPageIdx === idx
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Page {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
