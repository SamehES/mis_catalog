import React from 'react';
import { PageData } from '../utils/catalogPagination';
import { CatalogSettings } from '../types';
import { ProductCard } from './ProductCard';
import { ArabicBidiText } from './ArabicBidiText';
import { Sparkles } from 'lucide-react';

interface CatalogPageProps {
  page: PageData;
  pageIndex: number;
  settings: CatalogSettings;
  idOverride?: string;
  exportMode?: boolean;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  page,
  pageIndex,
  settings,
  idOverride,
  exportMode = false,
}) => {
  const { orientation, productsPerRow, theme, title, subtitle, footerText } = settings;
  const isLandscape = orientation === 'landscape';

  // Theme styling map
  const themeStyles = {
    'modern-clean': {
      bg: 'bg-white',
      headerBg: 'bg-slate-900 text-white',
      accentText: 'text-emerald-600',
      border: 'border-slate-200',
    },
    'emerald-luxury': {
      bg: 'bg-emerald-950/5 text-slate-900',
      headerBg: 'bg-emerald-950 text-emerald-50',
      accentText: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    'dark-slate': {
      bg: 'bg-slate-900 text-slate-100',
      headerBg: 'bg-slate-950 text-slate-100',
      accentText: 'text-emerald-400',
      border: 'border-slate-800',
    },
    'warm-sand': {
      bg: 'bg-amber-50/40 text-stone-900',
      headerBg: 'bg-stone-900 text-amber-50',
      accentText: 'text-amber-800',
      border: 'border-amber-200',
    },
    'classic-navy': {
      bg: 'bg-blue-50/30 text-slate-900',
      headerBg: 'bg-blue-950 text-blue-50',
      accentText: 'text-blue-700',
      border: 'border-blue-200',
    },
  }[theme || 'modern-clean'];

  const gridColsClass =
    productsPerRow === 1 ? 'grid-cols-1' : productsPerRow === 2 ? 'grid-cols-2' : 'grid-cols-3';

  // Fixed A4 scale dimensions for pixel-perfect print preview
  const pageDimensionStyle = isLandscape
    ? { width: '1123px', height: '794px' } // A4 Landscape at 96 DPI
    : { width: '794px', height: '1123px' }; // A4 Portrait at 96 DPI

  if (page.isCoverPage) {
    return (
      <div
        id={idOverride || `catalog-page-${pageIndex}`}
        style={pageDimensionStyle}
        className={`relative ${themeStyles.bg} border ${themeStyles.border} p-16 flex flex-col items-center justify-between overflow-hidden select-none ${
          exportMode ? '' : 'shadow-2xl mx-auto my-6'
        }`}
      >
        <div className="w-full flex justify-between items-center text-xs font-semibold uppercase tracking-widest opacity-60">
          <span>{new Date().toLocaleDateString()}</span>
          <span>Catalog Collection</span>
        </div>

        <div className="text-center my-auto space-y-6 max-w-lg">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black leading-tight">
            <ArabicBidiText text={title || 'شركة مجد الدين للمعدات الصناعية'} />
          </h1>
          {subtitle && (
            <p className="text-lg font-medium opacity-80 leading-relaxed">
              <ArabicBidiText text={subtitle} />
            </p>
          )}
        </div>

        <div className="w-full border-t border-slate-200/40 pt-6 flex justify-between items-center text-xs opacity-70">
          <span>
            <ArabicBidiText text={footerText || 'شركة مجد الدين للمعدات الصناعية'} />
          </span>
          <span>Page {page.pageNumber} of {page.totalPages}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id={idOverride || `catalog-page-${pageIndex}`}
      style={pageDimensionStyle}
      className={`relative ${themeStyles.bg} border ${themeStyles.border} p-8 flex flex-col justify-between overflow-hidden select-none ${
        exportMode ? '' : 'shadow-2xl mx-auto my-6'
      }`}
    >
      {/* Catalog Header */}
      <div className={`w-full ${themeStyles.headerBg} rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between mb-6`}>
        <div className="min-w-0 pr-4">
          <h2 className="text-base font-bold leading-snug">
            <ArabicBidiText text={title || 'شركة مجد الدين للمعدات الصناعية'} />
          </h2>
          {subtitle && (
            <p className="text-xs opacity-80 mt-0.5">
              <ArabicBidiText text={subtitle} />
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs">
            Page {page.pageNumber} / {page.totalPages}
          </span>
        </div>
      </div>

      {/* Product Grid */}
      <div className={`grid ${gridColsClass} gap-4 my-auto flex-1 auto-rows-fr`}>
        {page.products.map((product, idx) => {
          // Calculate global index
          const globalIndex = pageIndex * 6 + idx;
          return (
            <ProductCard
              key={product.id}
              product={product}
              index={globalIndex}
              settings={settings}
            />
          );
        })}
      </div>

      {/* Catalog Footer */}
      <div className="w-full border-t border-slate-200/50 pt-4 mt-6 flex items-center justify-between text-xs font-medium opacity-70">
        <span>
          <ArabicBidiText text={footerText || 'شركة مجد الدين للمعدات الصناعية'} />
        </span>
        <span>
          Page {page.pageNumber} of {page.totalPages}
        </span>
      </div>
    </div>
  );
};
