import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { X, Upload, Save } from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimizer';

interface ProductEditorModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const CURRENCIES = ['₪', '$', '€', 'JD', '£', 'AED', 'SAR'];

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  product,
  onClose,
  onSave,
  showToast,
}) => {
  if (!product) return null;

  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(String(product.price));
  const [currency, setCurrency] = useState(product.currency || '₪');
  const [imageData, setImageData] = useState(product.imageData);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image.', 'error');
      return;
    }
    try {
      setIsProcessing(true);
      const optimized = await optimizeImage(file, 1600, 0.88);
      setImageData(optimized);
    } catch (err) {
      showToast('Failed to optimize image.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title cannot be empty.', 'error');
      return;
    }
    if (price === '' || isNaN(Number(price))) {
      showToast('Price must be a valid number.', 'error');
      return;
    }

    onSave({
      ...product,
      title: title.trim(),
      price: Number(price),
      currency,
      imageData,
    });
    showToast('Product updated successfully.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-base font-bold">Edit Product</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Image
            </label>
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="w-20 h-20 rounded-lg bg-white border p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={imageData}
                  alt="Product preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Change Image</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageChange(f);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  JPG, PNG or WEBP
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Title
            </label>
            <input
              type="text"
              dir="auto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 outline-none"
              required
            />
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price</label>
              <input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-2 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium bg-white text-slate-800 outline-none"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
