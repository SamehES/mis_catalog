export interface Product {
  id: string;
  title: string;
  price: number | string;
  currency: string;
  imageData: string; // Base64 data URL
  order: number;
  createdAt: number;
}

export type ProductsPerRow = 1 | 2 | 3;
export type PageOrientation = 'portrait' | 'landscape';
export type CatalogTheme = 'modern-clean' | 'dark-slate' | 'emerald-luxury' | 'warm-sand' | 'classic-navy';

export interface CatalogSettings {
  title: string;
  subtitle: string;
  productsPerRow: ProductsPerRow;
  showPrice: boolean;
  showProductNumber: boolean;
  orientation: PageOrientation;
  defaultCurrency: string;
  theme: CatalogTheme;
  showCoverPage: boolean;
  footerText: string;
}

export interface CatalogProject {
  version: number;
  id: string;
  name: string;
  title: string;
  subtitle: string;
  createdAt: number;
  updatedAt: number;
  settings: CatalogSettings;
  products: Product[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}
