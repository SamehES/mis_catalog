import React, { useState, useRef } from 'react';
import { Upload, Plus, Images, X, Image as ImageIcon } from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimizer';

interface ProductFormProps {
  defaultCurrency: string;
  onAddProduct: (productData: {
    title: string;
    price: number | string;
    currency: string;
    imageData: string;
  }) => void;
  onOpenBulkUpload: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const CURRENCIES = ['₪', '$', '€', 'JD', '£', 'AED', 'SAR'];

export const ProductForm: React.FC<ProductFormProps> = ({
  defaultCurrency,
  onAddProduct,
  onOpenBulkUpload,
  showToast,
}) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency || '₪');
  const [imageData, setImageData] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }

    try {
      setIsProcessingImage(true);
      const optimized = await optimizeImage(file, 1600, 0.88);
      setImageData(optimized);
    } catch (err) {
      console.error('Image optimization error:', err);
      showToast('Unable to process this image. Please try another.', 'error');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!imageData) {
      showToast('Please upload a product image.', 'error');
      return;
    }
    if (!title.trim()) {
      showToast('Please enter a product title.', 'error');
      return;
    }
    if (price === '' || isNaN(Number(price))) {
      showToast('Please enter a valid product price.', 'error');
      return;
    }

    onAddProduct({
      title: title.trim(),
      price: Number(price),
      currency: currency || '₪',
      imageData,
    });

    // Reset inputs for continuous rapid entry
    setTitle('');
    setPrice('');
    setImageData('');
    showToast('Product added successfully!', 'success');

    // Auto focus title input
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Add Product</h2>
          <p className="text-xs text-slate-500">Fast product entry for your catalog</p>
        </div>
        <button
          type="button"
          onClick={onOpenBulkUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          title="Upload multiple product photos at once"
        >
          <Images className="w-3.5 h-3.5" />
          <span>Bulk Import</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Dropzone / Preview */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Product Image <span className="text-rose-500">*</span>
          </label>

          {imageData ? (
            <div className="relative group rounded-xl border border-slate-200 bg-slate-50 p-2 text-center overflow-hidden">
              <div className="w-full h-44 flex items-center justify-center">
                <img
                  src={imageData}
                  alt="Product preview"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => setImageData('')}
                className="absolute top-3 right-3 p-1.5 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 transition-transform active:scale-95"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              {isProcessingImage ? (
                <div className="py-4 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium text-slate-600">Processing image...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-700">
                      Click to upload image
                    </span>
                    <span className="text-xs text-slate-500"> or drag and drop</span>
                  </div>
                  <span className="text-[11px] text-slate-400">JPG, PNG or WEBP (Auto-optimized)</span>
                </div>
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
          />
        </div>

        {/* Product Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Product Title <span className="text-rose-500">*</span>
          </label>
          <input
            ref={titleInputRef}
            type="text"
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Women's Summer Dress / فستان صيفي نسائي"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
            required
          />
        </div>

        {/* Product Price & Currency */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Price <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="100"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium text-slate-800 outline-none bg-white transition-all"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Product Submit Button */}
        <button
          type="submit"
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Product</span>
        </button>
      </form>
    </div>
  );
};
