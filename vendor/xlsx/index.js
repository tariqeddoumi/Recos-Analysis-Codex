const zlib = require('node:zlib');

function xmlDecode(value) {
  return String(value || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function unzip(buffer) {
  const files = {};
  let offset = 0;
  while (offset < buffer.length - 30) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) {
      offset += 1;
      continue;
    }
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + fileNameLength + extraLength;
    const name = buffer.subarray(nameStart, nameStart + fileNameLength).toString('utf8');
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    if (compressedSize > 0) {
      files[name] = method === 8 ? zlib.inflateRawSync(compressed).toString('utf8') : compressed.toString('utf8');
    }
    offset = dataStart + compressedSize;
  }
  return files;
}

function parseSharedStrings(xml) {
  if (!xml) return [];
  return [...xml.matchAll(/<si[\s\S]*?<\/si>/g)].map(([si]) => xmlDecode([...si.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((match) => match[1]).join('')));
}

function columnIndex(cellReference) {
  const letters = String(cellReference || '').replace(/[^A-Z]/gi, '').toUpperCase();
  return [...letters].reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function parseSheet(xml, sharedStrings) {
  const matrix = [];
  for (const rowMatch of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const ref = /r="([^"]+)"/.exec(attrs)?.[1] || '';
      const type = /t="([^"]+)"/.exec(attrs)?.[1] || '';
      const raw = /<v[^>]*>([\s\S]*?)<\/v>/.exec(body)?.[1] || /<t[^>]*>([\s\S]*?)<\/t>/.exec(body)?.[1] || '';
      cells[columnIndex(ref)] = type === 's' ? sharedStrings[Number(raw)] || '' : xmlDecode(raw);
    }
    matrix.push(cells.map((cell) => cell || ''));
  }
  const headers = matrix.shift() || [];
  return matrix.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((header, index) => [header || `Column ${index + 1}`, row[index] || ''])));
}

function parseDelimited(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = (lines.shift() || '').split(/;|,/).map((h) => h.trim());
  return lines.map((line) => Object.fromEntries(line.split(/;|,/).map((cell, index) => [headers[index] || `Column ${index + 1}`, cell.trim()])));
}

exports.read = function read(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input || '');
  if (buffer.readUInt32LE(0) !== 0x04034b50) {
    return { SheetNames: ['Feuil1'], Sheets: { Feuil1: { rows: parseDelimited(buffer.toString('utf8')) } } };
  }
  const files = unzip(buffer);
  const sharedStrings = parseSharedStrings(files['xl/sharedStrings.xml']);
  const sheetPath = Object.keys(files).find((path) => /^xl\/worksheets\/sheet\d+\.xml$/.test(path));
  const rows = sheetPath ? parseSheet(files[sheetPath], sharedStrings) : [];
  return { SheetNames: ['Feuil1'], Sheets: { Feuil1: { rows } } };
};

exports.utils = {
  sheet_to_json(sheet) {
    return Array.isArray(sheet && sheet.rows) ? sheet.rows : [];
  },
};
