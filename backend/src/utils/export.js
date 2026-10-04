const PDFDocument = require('pdfkit');

function escapeCsv(value) {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(columns, rows) {
  const header = columns.map((column) => escapeCsv(column.label)).join(',');
  const body = rows.map((row) => columns.map((column) => escapeCsv(row[column.key])).join(','));
  return [header, ...body].join('\n');
}

function toPdfBuffer({ title, columns, rows }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(title, { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333333');
    doc.text(columns.map((column) => column.label).join('  |  '));
    doc.moveDown(0.4);

    rows.forEach((row) => {
      const line = columns.map((column) => `${column.label}: ${row[column.key] ?? ''}`).join('   ');
      doc.text(line, { width: 520 });
      doc.moveDown(0.3);
    });

    if (!rows.length) {
      doc.text('No records for this report.');
    }

    doc.end();
  });
}

module.exports = { toCsv, toPdfBuffer };
