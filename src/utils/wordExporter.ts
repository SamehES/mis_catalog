import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  ImageRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from 'docx';
import { saveAs } from 'file-saver';
import { CatalogProject } from '../types';
import { dataUrlToUint8Array } from './imageOptimizer';

export async function exportCatalogToWord(
  project: CatalogProject,
  onProgress?: (status: string) => void
): Promise<void> {
  if (onProgress) onProgress('Preparing Word document elements...');

  const { title, subtitle, settings, products } = project;
  const cols = settings.productsPerRow || 2;
  const showPrice = settings.showPrice;
  const showNumber = settings.showProductNumber;

  // Header / Document Title
  const docParagraphs: (Paragraph | Table)[] = [];

  // Main Catalog Title
  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: title || 'Product Catalog',
          bold: true,
          size: 36, // 18pt
          color: '1E293B',
          font: 'Arial',
        }),
      ],
    })
  );

  if (subtitle) {
    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: subtitle,
            size: 24, // 12pt
            color: '64748B',
            font: 'Arial',
          }),
        ],
      })
    );
  }

  // Divider paragraph
  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: '____________________________________________________________________',
          color: 'CBD5E1',
          size: 16,
        }),
      ],
    })
  );

  // Group products into rows according to cols
  const rowsCount = Math.ceil(products.length / cols);
  const tableRows: TableRow[] = [];

  const colWidthPercent = Math.floor(100 / cols);

  for (let r = 0; r < rowsCount; r++) {
    if (onProgress) {
      onProgress(`Formatting row ${r + 1} of ${rowsCount}...`);
    }

    const cells: TableCell[] = [];

    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const product = products[index];

      if (!product) {
        // Empty cell for grid alignment
        cells.push(
          new TableCell({
            children: [new Paragraph({ children: [] })],
            width: { size: colWidthPercent, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            },
          })
        );
        continue;
      }

      const cellParagraphs: Paragraph[] = [];

      // 1. Product Image
      if (product.imageData) {
        try {
          const { array, mimeType } = dataUrlToUint8Array(product.imageData);
          const imgType = mimeType.includes('png') ? 'png' : 'jpg';

          cellParagraphs.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 100, after: 100 },
              children: [
                new ImageRun({
                  data: array,
                  type: imgType,
                  transformation: {
                    width: cols === 1 ? 260 : cols === 2 ? 180 : 120,
                    height: cols === 1 ? 260 : cols === 2 ? 180 : 120,
                  },
                }),
              ],
            })
          );
        } catch (imgErr) {
          console.warn('Could not insert image in Word export:', imgErr);
        }
      }

      // 2. Product Number (Optional)
      if (showNumber) {
        cellParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 50, after: 20 },
            children: [
              new TextRun({
                text: `#${index + 1}`,
                size: 18,
                color: '94A3B8',
                bold: true,
                font: 'Arial',
              }),
            ],
          })
        );
      }

      // 3. Product Title
      cellParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 50, after: 50 },
          children: [
            new TextRun({
              text: product.title || 'Untitled Product',
              bold: true,
              size: 22, // 11pt
              color: '0F172A',
              font: 'Arial',
            }),
          ],
        })
      );

      // 4. Product Price
      if (showPrice && product.price !== undefined && product.price !== '') {
        const formattedPrice = `${product.price} ${product.currency || '₪'}`;
        cellParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 150 },
            children: [
              new TextRun({
                text: formattedPrice,
                bold: true,
                size: 24, // 12pt
                color: '059669', // Emerald green accent
                font: 'Arial',
              }),
            ],
          })
        );
      }

      cells.push(
        new TableCell({
          children: cellParagraphs,
          width: { size: colWidthPercent, type: WidthType.PERCENTAGE },
          margins: { top: 150, bottom: 150, left: 150, right: 150 },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' },
            left: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' },
            right: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' },
          },
        })
      );
    }

    tableRows.push(new TableRow({ children: cells }));
  }

  if (tableRows.length > 0) {
    const table = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
    });
    docParagraphs.push(table);
  }

  // Document setup
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: settings.orientation === 'landscape' ? 'landscape' : 'portrait',
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: title || 'Product Catalog',
                    size: 16,
                    color: '94A3B8',
                    font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${settings.footerText || 'Product Catalog'} | Page `,
                    size: 18,
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        children: docParagraphs,
      },
    ],
  });

  if (onProgress) onProgress('Compiling DOCX binary file...');

  const blob = await Packer.toBlob(doc);

  const sanitizedTitle = (title || 'catalog')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_');

  saveAs(blob, `${sanitizedTitle}_catalog.docx`);
}
