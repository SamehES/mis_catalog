import React, { useState } from 'react';
import { X, Upload, Check, Trash2, Images } from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimizer';

interface DraftItem {
  id: string;
  file: File;
  previewUrl: string;
  imageData?: string;
  title: string;
  price: string;
  status: 'pending' | 'processing' | 'done' | 'error';
}

interface BulkUploadModalProps {
  defaultCurrency: string;
  isOpen: boolean;
  onClose: () => void;
  onAddBulkProducts: (
    items: { title: string; price: number | string; currency: string; imageData: string }[]
  ) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  defaultCurrency,
  isOpen,
  onClose,
  onAddBulkProducts,
  showToast,
}) => {
  if (!isOpen) return null;

  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [defaultPrice, setDefaultPrice] = useState('100');

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;

    const newDrafts: DraftItem[] = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file, idx) => {
        // Clean title suggestion from filename
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return {
          id: `draft_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          title: cleanName,
          price: defaultPrice,
          status: 'pending',
        };
      });

    setDrafts((prev) => [...prev, ...newDrafts]);
  };

  const handleRemoveDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateDraft = (id: string, key: 'title' | 'price', value: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [key]: value } : d))
    );
  };

  const handleProcessAndImport = async () => {
    if (drafts.length === 0) {
      showToast('Please select images first.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const readyProducts: {
        title: string;
        price: number | string;
        currency: string;
        imageData: string;
      }[] = [];

      for (let i = 0; i < drafts.length; i++) {
        const item = drafts[i];
        const optimizedData = await optimizeImage(item.file, 1600, 0.88);
        readyProducts.push({
          title: item.title || `Product ${i + 1}`,
          price: Number(item.price) || 0,
          currency: defaultCurrency || '₪',
          imageData: optimizedData,
        });
      }

      onAddBulkProducts(readyProducts);
      showToast(`Successfully added ${readyProducts.length} products!`, 'success');
      onClose();
      setDrafts([]);
    } catch (err) {
      console.error('Bulk upload error:', err);
      showToast('Error processing bulk images.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Images className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">Bulk Image Import</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* File Picker / Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50 hover:bg-emerald-50/20 transition-colors">
            <input
              type="file"
              id="bulk-file-input"
              multiple
              accept="image/*"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <label
              htmlFor="bulk-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                Select multiple product photos at once
              </span>
              <span className="text-xs text-slate-500">
                Titles will be auto-generated from file names
              </span>
            </label>
          </div>

          {/* Quick Default Price Fill */}
          {drafts.length > 0 && (
            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl">
              <span className="text-xs font-semibold text-slate-700">
                {drafts.length} images selected
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Set default price for all:</span>
                <input
                  type="number"
                  value={defaultPrice}
                  onChange={(e) => {
                    setDefaultPrice(e.target.value);
                    setDrafts((prev) =>
                      prev.map((d) => ({ ...d, price: e.target.value }))
                    );
                  }}
                  className="w-20 px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>
            </div>
          )}

          {/* Draft List Table */}
          {drafts.length > 0 && (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {drafts.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80"
                >
                  <span className="text-xs font-bold text-slate-400 w-6 shrink-0">
                    #{idx + 1}
                  </span>

                  <img
                    src={item.previewUrl}
                    alt="Preview"
                    className="w-12 h-12 object-contain rounded-lg border bg-slate-50 shrink-0"
                  />

                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      dir="auto"
                      value={item.title}
                      onChange={(e) => handleUpdateDraft(item.id, 'title', e.target.value)}
                      placeholder="Product Title"
                      className="col-span-2 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleUpdateDraft(item.id, 'price', e.target.value)}
                        placeholder="Price"
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 outline-none"
                      />
                      <span className="text-xs font-semibold text-slate-500">
                        {defaultCurrency}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveDraft(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleProcessAndImport}
            disabled={isProcessing || drafts.length === 0}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Optimizing & Importing...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Import {drafts.length} Products</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
