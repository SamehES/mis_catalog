import { CatalogProject, CatalogSettings, Product } from '../types';

export const CURRENT_PROJECT_VERSION = 1;

export function createInitialProject(): CatalogProject {
  const timestamp = Date.now();
  return {
    version: CURRENT_PROJECT_VERSION,
    id: `project_${timestamp}`,
    name: 'Untitled Catalog',
    title: 'Product Catalog',
    subtitle: 'Featured Collection',
    createdAt: timestamp,
    updatedAt: timestamp,
    settings: {
      title: 'Product Catalog',
      subtitle: 'Featured Collection',
      productsPerRow: 2,
      showPrice: true,
      showProductNumber: false,
      orientation: 'portrait',
      defaultCurrency: '₪',
      theme: 'modern-clean',
      showCoverPage: false,
      footerText: 'Product Catalog • Created with Product Catalog Builder',
    },
    products: [],
  };
}

/**
 * Downloads project file as .catalog (JSON format)
 */
export function exportProjectFile(project: CatalogProject): void {
  const updatedProject: CatalogProject = {
    ...project,
    updatedAt: Date.now(),
  };

  const jsonString = JSON.stringify(updatedProject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const sanitizedTitle = (project.title || 'catalog')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_');
  const filename = `${sanitizedTitle}_project.catalog`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and migrates project data from uploaded file
 */
export function validateAndMigrateProject(data: any): CatalogProject {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid catalog project file format.');
  }

  // Version check & defaults migration
  const version = typeof data.version === 'number' ? data.version : 1;
  const products: Product[] = Array.isArray(data.products)
    ? data.products.map((p: any, idx: number) => ({
        id: p.id || `prod_${Date.now()}_${idx}`,
        title: String(p.title || ''),
        price: p.price !== undefined ? p.price : 0,
        currency: p.currency || data.settings?.defaultCurrency || '₪',
        imageData: p.imageData || p.image || '',
        order: typeof p.order === 'number' ? p.order : idx,
        createdAt: p.createdAt || Date.now(),
      }))
    : [];

  const rawSettings = data.settings || {};
  const settings: CatalogSettings = {
    title: data.title || rawSettings.title || 'Product Catalog',
    subtitle: data.subtitle || rawSettings.subtitle || '',
    productsPerRow: (rawSettings.productsPerRow === 1 || rawSettings.productsPerRow === 3) ? rawSettings.productsPerRow : 2,
    showPrice: rawSettings.showPrice !== undefined ? Boolean(rawSettings.showPrice) : true,
    showProductNumber: Boolean(rawSettings.showProductNumber),
    orientation: rawSettings.orientation === 'landscape' ? 'landscape' : 'portrait',
    defaultCurrency: rawSettings.defaultCurrency || '₪',
    theme: rawSettings.theme || 'modern-clean',
    showCoverPage: Boolean(rawSettings.showCoverPage),
    footerText: rawSettings.footerText || 'Product Catalog',
  };

  return {
    version,
    id: data.id || `project_${Date.now()}`,
    name: data.name || data.title || 'Loaded Catalog',
    title: settings.title,
    subtitle: settings.subtitle,
    createdAt: data.createdAt || Date.now(),
    updatedAt: Date.now(),
    settings,
    products,
  };
}

/**
 * Imports project from user selected File
 */
export function importProjectFile(file: File): Promise<CatalogProject> {
  return new Promise((resolve, reject) => {
    const fileNameLower = file.name.toLowerCase();

    if (fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc')) {
      reject(
        new Error(
          'The selected file is a Word document (.docx). "Open Project" is only for saved catalog project files (.catalog or .json).'
        )
      );
      return;
    }

    if (fileNameLower.endsWith('.pdf')) {
      reject(
        new Error(
          'The selected file is a PDF document. "Open Project" is only for saved catalog project files (.catalog or .json).'
        )
      );
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read project file.'));
    reader.onload = (e) => {
      try {
        const content = (e.target?.result as string) || '';

        // Check binary magic signatures (e.g. PK zip/docx header or %PDF header)
        if (content.startsWith('PK\x03\x04') || content.startsWith('PK')) {
          reject(
            new Error(
              'This file is a compressed archive or Word document. Please select a saved .catalog or .json project file.'
            )
          );
          return;
        }

        if (content.startsWith('%PDF')) {
          reject(
            new Error(
              'This file is a PDF document. Please select a saved .catalog or .json project file.'
            )
          );
          return;
        }

        const parsed = JSON.parse(content);
        const project = validateAndMigrateProject(parsed);
        resolve(project);
      } catch (err: any) {
        if (err instanceof SyntaxError) {
          reject(
            new Error(
              'Invalid project file format. The file is not a valid .catalog or .json project.'
            )
          );
        } else {
          reject(new Error(err.message || 'Corrupted or invalid catalog project file.'));
        }
      }
    };
    reader.readAsText(file);
  });
}
