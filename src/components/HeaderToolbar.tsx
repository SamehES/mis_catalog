import React, { useRef } from 'react';
import {
  FilePlus,
  FolderOpen,
  Save,
  FileText,
  FileDown,
  Printer,
  Sparkles,
  Layers,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

interface HeaderToolbarProps {
  catalogTitle: string;
  totalProducts: number;
  totalPages: number;
  isAutosaving: boolean;
  onNewProject: () => void;
  onOpenProjectFile: (file: File) => void;
  onSaveProject: () => void;
  onExportPdf: () => void;
  onExportWord: () => void;
  onOpenPrintPreview: () => void;
}

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  catalogTitle,
  totalProducts,
  totalPages,
  isAutosaving,
  onNewProject,
  onOpenProjectFile,
  onSaveProject,
  onExportPdf,
  onExportWord,
  onOpenPrintPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenProjectFile(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 leading-tight flex items-center gap-2">
                {catalogTitle || 'Product Catalog Builder'}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Layers className="w-3.5 h-3.5" />
                  {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'} ({totalPages} {totalPages === 1 ? 'Page' : 'Pages'})
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5">
                  {isAutosaving ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                      <span className="text-amber-300">Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span className="text-slate-300">Saved</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* File Operations */}
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Start a fresh catalog project"
          >
            <FilePlus className="w-3.5 h-3.5 text-slate-400" />
            <span>New</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Open an existing .catalog project file"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Project</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".catalog,.json"
            className="hidden"
          />

          <button
            onClick={onSaveProject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Download project source file to continue editing anytime"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Project</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          {/* Export Options */}
          <button
            onClick={onOpenPrintPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Inspect full catalog print pages"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            <span>Preview</span>
          </button>

          <button
            onClick={onExportWord}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors"
            title="Export catalog as editable Microsoft Word .docx"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Word</span>
          </button>

          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
            title="Export printable A4 PDF catalog document"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
