export interface PdfImage {
  dataUrl: string;
  label: string;
}

/**
 * Genererer en simpel, lokal PDF af tekstindholdet (linjebrudt), med
 * valgfri indlejrede billeder (kun foto - video/lyd kan ikke indlejres i
 * en PDF og deles i stedet som separate filer, se ExportBar). Ingen
 * serverkald - koerer helt i browseren via jsPDF, som er bundlet med
 * appen paa build-tidspunktet (ikke et eksternt runtime-kald). jsPDF
 * hentes via dynamisk import, saa det tunge bibliotek kun indlaeses,
 * naar brugeren rent faktisk trykker paa "Lav PDF".
 */
export async function generatePdf(title: string, text: string, images: PdfImage[] = []): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, marginX, y);
  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = doc.internal.pageSize.getWidth() - marginX * 2;

  const paragraphs = text.split("\n");
  for (const paragraph of paragraphs) {
    const wrapped = doc.splitTextToSize(paragraph.length ? paragraph : " ", maxWidth);
    for (const line of wrapped) {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 50;
      }
      doc.text(line, marginX, y);
      y += 14;
    }
  }

  if (images.length > 0) {
    doc.addPage();
    y = 50;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Vedhaeftede billeder", marginX, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    for (const image of images) {
      try {
        const dims = await getImageDimensions(image.dataUrl);
        const scale = Math.min(1, maxWidth / dims.width);
        const w = dims.width * scale;
        const h = dims.height * scale;
        if (y + h + 20 > pageHeight - 30) {
          doc.addPage();
          y = 50;
        }
        doc.text(image.label, marginX, y);
        y += 12;
        doc.addImage(image.dataUrl, "JPEG", marginX, y, w, h);
        y += h + 20;
      } catch {
        doc.text(`${image.label} (kunne ikke indlejres)`, marginX, y);
        y += 16;
      }
    }
  }

  return doc.output("blob");
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}
