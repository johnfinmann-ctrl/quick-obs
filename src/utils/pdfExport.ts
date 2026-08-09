/**
 * Genererer en simpel, lokal PDF af tekstindholdet (linjebrudt).
 * Ingen serverkald - koerer helt i browseren via jsPDF, som er bundlet
 * med appen paa build-tidspunktet (ikke et eksternt runtime-kald).
 * jsPDF hentes via dynamisk import, saa det tunge PDF-bibliotek kun
 * indlaeses, naar brugeren rent faktisk trykker paa "Lav PDF".
 */
export async function generatePdf(title: string, text: string): Promise<Blob> {
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

  return doc.output("blob");
}
