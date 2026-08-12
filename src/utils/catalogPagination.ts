import { Product, CatalogSettings } from '../types';

export interface PageData {
  pageNumber: number;
  totalPages: number;
  isCoverPage?: boolean;
  products: Product[];
}

/**
 * Calculates max products allowed per page based on layout options
 */
export function getProductsPerPage(settings: CatalogSettings): number {
  const { productsPerRow, orientation } = settings;

  if (orientation === 'landscape') {
    switch (productsPerRow) {
      case 1:
        return 2;
      case 2:
        return 4; // 2x2
      case 3:
        return 6; // 3x2
      default:
        return 4;
    }
  } else {
    // Portrait
    switch (productsPerRow) {
      case 1:
        return 3;
      case 2:
        return 6; // 2x3
      case 3:
        return 9; // 3x3
      default:
        return 6;
    }
  }
}

/**
 * Paginates product list into array of PageData objects
 */
export function paginateProducts(products: Product[], settings: CatalogSettings): PageData[] {
  const perPage = getProductsPerPage(settings);
  const pages: PageData[] = [];

  // Optional cover page
  if (settings.showCoverPage) {
    pages.push({
      pageNumber: 1,
      totalPages: 1, // updated at end
      isCoverPage: true,
      products: [],
    });
  }

  if (products.length === 0 && !settings.showCoverPage) {
    pages.push({
      pageNumber: 1,
      totalPages: 1,
      isCoverPage: false,
      products: [],
    });
    return pages;
  }

  const startPageNum = settings.showCoverPage ? 2 : 1;
  const totalContentPages = Math.ceil(products.length / perPage) || 1;

  for (let i = 0; i < totalContentPages; i++) {
    const slice = products.slice(i * perPage, (i + 1) * perPage);
    pages.push({
      pageNumber: startPageNum + i,
      totalPages: 1, // updated below
      isCoverPage: false,
      products: slice,
    });
  }

  const grandTotalPages = pages.length;
  return pages.map((page) => ({
    ...page,
    totalPages: grandTotalPages,
  }));
}
