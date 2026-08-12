import React, { useState } from 'react';
import { Product } from '../types';
import { Search, Edit2, Copy, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDuplicateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onReorderProducts: (newProducts: Product[]) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onEditProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onReorderProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Filter list for search without altering underlying catalog array
  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.price).includes(searchTerm)
  );

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= products.length) return;

    const newOrderList = [...products];
    const temp = newOrderList[index];
    newOrderList[index] = newOrderList[targetIdx];
    newOrderList[targetIdx] = temp;

    // Update internal order prop
    const reordered = newOrderList.map((item, idx) => ({ ...item, order: idx }));
    onReorderProducts(reordered);
  };

  // Drag and Drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const newOrderList = [...products];
    const draggedItem = newOrderList[draggedIdx];
    newOrderList.splice(draggedIdx, 1);
    newOrderList.splice(idx, 0, draggedItem);

    setDraggedIdx(idx);
    const reordered = newOrderList.map((item, i) => ({ ...item, order: i }));
    onReorderProducts(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            Catalog Items
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {products.length}
            </span>
          </h3>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title or price..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400 outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
          <p className="text-xs font-medium">
            {products.length === 0
              ? 'No products added yet. Use the form above to add your first product.'
              : 'No products match your search query.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filteredProducts.map((product) => {
            const realIndex = products.findIndex((p) => p.id === product.id);

            return (
              <div
                key={product.id}
                draggable={!searchTerm} // Disable drag if list is filtered
                onDragStart={() => handleDragStart(realIndex)}
                onDragOver={(e) => handleDragOver(e, realIndex)}
                onDragEnd={handleDragEnd}
                className={`group flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                  draggedIdx === realIndex
                    ? 'border-emerald-500 bg-emerald-50/50 opacity-60'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                {/* Drag handle */}
                <div
                  className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-400 p-1"
                  title="Drag to reorder product"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Number Badge */}
                <span className="text-[11px] font-bold text-slate-400 w-5 text-center shrink-0">
                  #{realIndex + 1}
                </span>

                {/* Product Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.imageData}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>

                {/* Title & Price */}
                <div className="min-w-0 flex-1">
                  <h4
                    dir="auto"
                    className="text-xs font-bold text-slate-800 truncate"
                    title={product.title}
                  >
                    {product.title}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                    {product.price} {product.currency || '₪'}
                  </p>
                </div>

                {/* Quick Reorder Up/Down */}
                {!searchTerm && (
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      disabled={realIndex === 0}
                      onClick={() => handleMove(realIndex, 'up')}
                      className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={realIndex === products.length - 1}
                      onClick={() => handleMove(realIndex, 'down')}
                      className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="Edit product"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDuplicateProduct(product)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Duplicate product"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(product.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h4 className="text-base font-bold text-slate-900 mb-2">Delete product?</h4>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to delete this product from the catalog? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
