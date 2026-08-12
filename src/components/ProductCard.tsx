import React from 'react';
import { Product, CatalogSettings } from '../types';
import { ArabicBidiText } from './ArabicBidiText';

interface ProductCardProps {
  product: Product;
  index: number;
  settings: CatalogSettings;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index, settings }) => {
  const { productsPerRow, showPrice, showProductNumber } = settings;

  // Grid sizing tweaks
  const imageAspect = productsPerRow === 1 ? 'h-64' : productsPerRow === 2 ? 'h-48' : 'h-36';

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
      {/* Product Number Badge */}
      {showProductNumber && (
        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
          #{index + 1}
        </span>
      )}

      {/* Product Image Container */}
      <div className={`w-full ${imageAspect} rounded-lg bg-slate-50 border border-slate-100 p-2 flex items-center justify-center overflow-hidden mb-2.5`}>
        {product.imageData ? (
          <img
            src={product.imageData}
            alt={product.title}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          <span className="text-xs text-slate-400 font-medium">No Image</span>
        )}
      </div>

      {/* Product Information */}
      <div className="space-y-1 text-center">
        <h4
          className="text-xs font-bold text-slate-900 leading-normal min-h-[1.75rem] w-full"
          title={product.title}
        >
          <ArabicBidiText text={product.title || 'منتج بدون عنوان'} />
        </h4>

        {showPrice && product.price !== undefined && product.price !== '' && (
          <div className="text-xs font-black text-emerald-700 pt-0.5">
            <ArabicBidiText text={`${product.price} ${product.currency || '₪'}`} />
          </div>
        )}
      </div>
    </div>
  );
};
