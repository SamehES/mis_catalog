import React from 'react';
import { RefreshCw, ArrowRight, FilePlus } from 'lucide-react';

interface RestoreSessionBannerProps {
  lastUpdated: number;
  productCount: number;
  catalogTitle: string;
  onContinue: () => void;
  onStartNew: () => void;
}

export const RestoreSessionBanner: React.FC<RestoreSessionBannerProps> = ({
  lastUpdated,
  productCount,
  catalogTitle,
  onContinue,
  onStartNew,
}) => {
  const formattedTime = new Date(lastUpdated).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white p-4 border-b border-emerald-800/50 shadow-lg animate-in slide-in-from-top-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">Continue your previous catalog?</h4>
            <p className="text-xs text-slate-300">
              Found saved session: <span className="font-semibold text-emerald-300">"{catalogTitle || 'Product Catalog'}"</span> ({productCount} {productCount === 1 ? 'product' : 'products'}, saved at {formattedTime})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStartNew}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Start Fresh</span>
          </button>

          <button
            onClick={onContinue}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-400/20 transition-all active:scale-98"
          >
            <span>Continue Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
