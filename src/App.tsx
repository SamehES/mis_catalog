/**
 * Product Catalog Builder
 * Professional web tool to create, edit, live preview in A4, and export product catalogs to PDF and Word.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CatalogProject, Product, CatalogSettings, ToastMessage } from './types';
import {
  createInitialProject,
  exportProjectFile,
  importProjectFile,
} from './utils/projectSerializer';
import { saveProjectToDB, loadProjectFromDB, clearProjectDB } from './utils/projectStorage';
import { paginateProducts } from './utils/catalogPagination';
import { exportCatalogToPdf } from './utils/pdfExporter';
import { exportCatalogToWord } from './utils/wordExporter';

import { HeaderToolbar } from './components/HeaderToolbar';
import { ProductForm } from './components/ProductForm';
import { ProductList } from './components/ProductList';
import { CatalogSettingsPanel } from './components/CatalogSettingsPanel';
import { CatalogPreview } from './components/CatalogPreview';
import { Toast } from './components/Toast';
import { ProductEditorModal } from './components/ProductEditorModal';
import { BulkUploadModal } from './components/BulkUploadModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { RestoreSessionBanner } from './components/RestoreSessionBanner';
import { PdfExportEngine } from './components/PdfExportEngine';

export default function App() {
  const [project, setProject] = useState<CatalogProject>(createInitialProject);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [restoreCandidate, setRestoreCandidate] = useState<CatalogProject | null>(null);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isPdfExportActive, setIsPdfExportActive] = useState(false);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      text,
      type,
    });
  }, []);

  // 1. Initial Load: Check for previous session in IndexedDB
  useEffect(() => {
    async function checkSavedSession() {
      const saved = await loadProjectFromDB();
      if (saved && saved.products && saved.products.length > 0) {
        setRestoreCandidate(saved);
        setShowRestoreBanner(true);
      }
    }
    checkSavedSession();
  }, []);

  // 2. Autosave: Continuously sync changes to IndexedDB
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (project.products.length > 0 || project.title !== 'Product Catalog') {
      setIsAutosaving(true);
      timer = setTimeout(async () => {
        await saveProjectToDB(project);
        setIsAutosaving(false);
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [project]);

  // Compute current paginated A4 pages for live preview and exports
  const pages = useMemo(() => {
    return paginateProducts(project.products, project.settings);
  }, [project.products, project.settings]);

  // Handle restoring saved session
  const handleContinueSession = () => {
    if (restoreCandidate) {
      setProject(restoreCandidate);
      showToast('Previous catalog session restored.', 'success');
    }
    setShowRestoreBanner(false);
  };

  const handleStartFreshSession = () => {
    clearProjectDB();
    setProject(createInitialProject());
    setShowRestoreBanner(false);
    showToast('Started new catalog project.', 'info');
  };

  // Product CRUD
  const handleAddProduct = (productData: {
    title: string;
    price: number | string;
    currency: string;
    imageData: string;
  }) => {
    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: productData.title,
      price: productData.price,
      currency: productData.currency,
      imageData: productData.imageData,
      order: project.products.length,
      createdAt: Date.now(),
    };

    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      products: [...prev.products, newProduct],
    }));
  };

  const handleAddBulkProducts = (
    items: { title: string; price: number | string; currency: string; imageData: string }[]
  ) => {
    const newProducts: Product[] = items.map((item, idx) => ({
      id: `prod_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      title: item.title,
      price: item.price,
      currency: item.currency,
      imageData: item.imageData,
      order: project.products.length + idx,
      createdAt: Date.now(),
    }));

    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      products: [...prev.products, ...newProducts],
    }));
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      products: prev.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    }));
  };

  const handleDeleteProduct = (productId: string) => {
    setProject((prev) => {
      const filtered = prev.products.filter((p) => p.id !== productId);
      const reindexed = filtered.map((item, idx) => ({ ...item, order: idx }));
      return {
        ...prev,
        updatedAt: Date.now(),
        products: reindexed,
      };
    });
    showToast('Product deleted.', 'info');
  };

  const handleDuplicateProduct = (targetProduct: Product) => {
    const duplicate: Product = {
      ...targetProduct,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${targetProduct.title} (Copy)`,
      order: project.products.length,
      createdAt: Date.now(),
    };

    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      products: [...prev.products, duplicate],
    }));
    showToast('Product duplicated.', 'success');
  };

  const handleReorderProducts = (reordered: Product[]) => {
    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      products: reordered,
    }));
  };

  const handleUpdateSettings = (newSettings: CatalogSettings) => {
    setProject((prev) => ({
      ...prev,
      title: newSettings.title,
      subtitle: newSettings.subtitle,
      settings: newSettings,
      updatedAt: Date.now(),
    }));
  };

  // File Toolbar Actions
  const handleNewProject = () => {
    if (project.products.length > 0) {
      if (!window.confirm('Start a new project? Unsaved changes in your workspace may be cleared.')) {
        return;
      }
    }
    clearProjectDB();
    setProject(createInitialProject());
    showToast('New project created.', 'info');
  };

  const handleSaveProject = () => {
    exportProjectFile(project);
    showToast('Project file (.catalog) downloaded!', 'success');
  };

  const handleOpenProjectFile = async (file: File) => {
    try {
      const loadedProject = await importProjectFile(file);
      setProject(loadedProject);
      await saveProjectToDB(loadedProject);
      showToast(`Loaded "${loadedProject.title}" with ${loadedProject.products.length} products!`, 'success');
    } catch (err: any) {
      console.error('Import project error:', err);
      showToast(err.message || 'Failed to open project file.', 'error');
    }
  };

  // PDF Export
  const handleExportPdf = async () => {
    if (project.products.length === 0) {
      showToast('Please add products before exporting PDF.', 'error');
      return;
    }
    setIsPdfExportActive(true);
  };

  // Word Export
  const handleExportWord = async () => {
    if (project.products.length === 0) {
      showToast('Please add products before exporting Word document.', 'error');
      return;
    }

    try {
      setIsExporting('Building Microsoft Word document...');
      showToast('Generating Word document...', 'info');

      await exportCatalogToWord(project, (status) => {
        setIsExporting(status);
      });

      showToast('Word document created successfully!', 'success');
    } catch (err) {
      console.error('Word export error:', err);
      showToast('Could not generate Word document.', 'error');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header Bar */}
      <HeaderToolbar
        catalogTitle={project.title}
        totalProducts={project.products.length}
        totalPages={pages.length}
        isAutosaving={isAutosaving}
        onNewProject={handleNewProject}
        onOpenProjectFile={handleOpenProjectFile}
        onSaveProject={handleSaveProject}
        onExportPdf={handleExportPdf}
        onExportWord={handleExportWord}
        onOpenPrintPreview={() => setIsPrintPreviewOpen(true)}
      />

      {/* Restore Session Banner if previous session detected */}
      {showRestoreBanner && restoreCandidate && (
        <RestoreSessionBanner
          lastUpdated={restoreCandidate.updatedAt}
          productCount={restoreCandidate.products.length}
          catalogTitle={restoreCandidate.title}
          onContinue={handleContinueSession}
          onStartNew={handleStartFreshSession}
        />
      )}

      {/* Export Loading Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-white">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <h4 className="text-sm font-bold text-slate-100">{isExporting}</h4>
              <p className="text-xs text-slate-400 mt-1">
                Optimizing images and document layout
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout (Two-Column Desktop, Stacked Mobile) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Product Form (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add Product Form */}
          <ProductForm
            defaultCurrency={project.settings.defaultCurrency}
            onAddProduct={handleAddProduct}
            onOpenBulkUpload={() => setIsBulkOpen(true)}
            showToast={showToast}
          />

          {/* Product List */}
          <ProductList
            products={project.products}
            onEditProduct={(prod) => setEditingProduct(prod)}
            onDuplicateProduct={handleDuplicateProduct}
            onDeleteProduct={handleDeleteProduct}
            onReorderProducts={handleReorderProducts}
          />

          {/* Catalog Settings */}
          <CatalogSettingsPanel
            settings={project.settings}
            onUpdateSettings={handleUpdateSettings}
          />
        </div>

        {/* RIGHT COLUMN: Live A4 Catalog Preview (7 cols on desktop) */}
        <div className="lg:col-span-7 sticky top-20">
          <CatalogPreview
            pages={pages}
            settings={project.settings}
            onOpenPrintPreview={() => setIsPrintPreviewOpen(true)}
          />
        </div>
      </main>

      {/* Modals & Toasts */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {editingProduct && (
        <ProductEditorModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
          showToast={showToast}
        />
      )}

      <BulkUploadModal
        defaultCurrency={project.settings.defaultCurrency}
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onAddBulkProducts={handleAddBulkProducts}
        showToast={showToast}
      />

      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        pages={pages}
        settings={project.settings}
        catalogTitle={project.title}
        onClose={() => setIsPrintPreviewOpen(false)}
        onExportPdf={handleExportPdf}
      />

      {/* Sequential Multi-Page PDF Export Engine */}
      {isPdfExportActive && (
        <PdfExportEngine
          pages={pages}
          settings={project.settings}
          catalogTitle={project.title}
          onComplete={() => {
            setIsPdfExportActive(false);
            showToast('PDF created successfully!', 'success');
          }}
          onError={(err) => {
            setIsPdfExportActive(false);
            showToast(err || 'Failed to generate PDF.', 'error');
          }}
        />
      )}
    </div>
  );
}
