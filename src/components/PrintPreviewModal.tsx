import React from 'react';
import { PageData } from '../utils/catalogPagination';
import { CatalogSettings } from '../types';
import { CatalogPage } from './CatalogPage';
import { X, Printer, FileDown } from 'lucide-react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  pages: PageData[];
  settings: CatalogSettings;
  catalogTitle: string;
  onClose: () => void;
  onExportPdf: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  pages,
  settings,
  catalogTitle,
  onClose,
  onExportPdf,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Printer className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-base font-bold">{catalogTitle || 'Product Catalog'}</h3>
            <p className="text-xs text-slate-400">Print & Page Inspector • {pages.length} Pages</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              window.print();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Browser Print</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onExportPdf();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pages View Container */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 flex flex-col items-center">
        {pages.map((page, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Page {idx + 1} of {pages.length}
            </span>
            <div className="shadow-2xl rounded-sm overflow-hidden bg-white">
              <CatalogPage page={page} pageIndex={idx} settings={settings} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
