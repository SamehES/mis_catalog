import React, { useState } from 'react';
import { CatalogSettings, ProductsPerRow, PageOrientation, CatalogTheme } from '../types';
import { Settings, ChevronDown, ChevronUp, Palette, LayoutGrid, RotateCw } from 'lucide-react';

interface CatalogSettingsPanelProps {
  settings: CatalogSettings;
  onUpdateSettings: (newSettings: CatalogSettings) => void;
}

const THEMES: { id: CatalogTheme; name: string; bgClass: string }[] = [
  { id: 'modern-clean', name: 'Modern Clean', bgClass: 'bg-slate-100 border-slate-300' },
  { id: 'emerald-luxury', name: 'Emerald Luxury', bgClass: 'bg-emerald-900 border-emerald-700' },
  { id: 'dark-slate', name: 'Dark Slate', bgClass: 'bg-slate-900 border-slate-700' },
  { id: 'warm-sand', name: 'Warm Sand', bgClass: 'bg-amber-100 border-amber-300' },
  { id: 'classic-navy', name: 'Classic Navy', bgClass: 'bg-blue-950 border-blue-800' },
];

export const CatalogSettingsPanel: React.FC<CatalogSettingsPanelProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof CatalogSettings, value: any) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Catalog Settings</h3>
            <p className="text-xs text-slate-500">Layout, themes, orientation & titles</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-5 pt-0 border-t border-slate-100 space-y-4">
          {/* Catalog Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catalog Title
              </label>
              <input
                type="text"
                dir="auto"
                value={settings.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Lavin Style"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                dir="auto"
                value={settings.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="e.g. Summer Collection 2026"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Products Per Row */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
              Products Per Row
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleChange('productsPerRow', num as ProductsPerRow)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    settings.productsPerRow === num
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {num} {num === 1 ? 'Column' : 'Columns'}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              Page Orientation
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['portrait', 'landscape'] as PageOrientation[]).map((orient) => (
                <button
                  key={orient}
                  type="button"
                  onClick={() => handleChange('orientation', orient)}
                  className={`py-2 text-xs font-bold capitalize rounded-xl border transition-all ${
                    settings.orientation === orient
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {orient}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={settings.showPrice}
                onChange={(e) => handleChange('showPrice', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700">Show Price</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={settings.showProductNumber}
                onChange={(e) => handleChange('showProductNumber', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700">Product Numbers</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={settings.showCoverPage}
                onChange={(e) => handleChange('showCoverPage', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700">Cover Page</span>
            </label>
          </div>

          {/* Visual Theme Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              Catalog Visual Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleChange('theme', theme.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                    settings.theme === theme.id
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full border shadow-xs ${theme.bgClass}`} />
                  <span className="truncate">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Footer Text
            </label>
            <input
              type="text"
              dir="auto"
              value={settings.footerText}
              onChange={(e) => handleChange('footerText', e.target.value)}
              placeholder="e.g. Product Catalog • All rights reserved"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
