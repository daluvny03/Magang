import XLSX from 'xlsx';

const normalizeHeader = (header) => {
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
};

const normalizeRow = (row) => {
  return Object.entries(row).reduce((result, [key, value]) => {
    result[normalizeHeader(key)] = value;
    return result;
  }, {});
};

export const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, {
    type: 'buffer'
  });

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error(
      'Excel workbook does not contain any sheet'
    );
  }

  const worksheet = workbook.Sheets[sheetName];

  const rawRows = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false
  });

  const rows = rawRows.map(normalizeRow);

  return {
    sheetName,
    rows
  };
};