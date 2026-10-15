import * as XLSX from 'xlsx';
import { Company } from '../types/company';

export interface ExcelValidationResult {
  success: boolean;
  error?: string;
  companies?: Company[];
  count?: number;
}

const EXPECTED_HEADERS = [
  'ŞEHİR',
  'İLÇE',
  'TABELA ÜNVANI',
  'MÜŞTERİ ÜNVANI',
  'ADRES',
  'İLETİŞİM 1',
  'İLETİŞİM 2'
];

const SECURITY_CELL_ADDRESS = 'J1';
const EXPECTED_SECURITY_TOKEN = 'ENLOG';

/**
 * Normalizes text for comparison (Turkish upper case, trimmed)
 */
function normalizeHeader(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim().toLocaleUpperCase('tr');
}

/**
 * Parses and validates an uploaded Excel file (.xlsx, .xls)
 */
export async function parseAndValidateExcel(file: File): Promise<ExcelValidationResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        success: false,
        error: 'Excel dosyasında herhangi bir çalışma sayfası bulunamadı.'
      };
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      return {
        success: false,
        error: 'Çalışma sayfası açılamadı.'
      };
    }

    // 1. GÜVENLİK KONTROLÜ (J1 hücresinde ENLOG kontrolü)
    const securityCell = worksheet[SECURITY_CELL_ADDRESS];
    const securityVal = securityCell ? String(securityCell.v ?? '').trim() : '';

    if (securityVal !== EXPECTED_SECURITY_TOKEN) {
      return {
        success: false,
        error: 'Güvenlik Doğrulaması Başarısız: Dosyanın ilgili hücresinde geçerli güvenlik şifresi bulunamadı.'
      };
    }

    // Convert sheet to 2D array of raw values
    const sheetData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false
    });

    if (sheetData.length === 0) {
      return {
        success: false,
        error: 'Excel dosyası boş veya başlık satırı okunamadı.'
      };
    }

    // 2. BAŞLIK FORMAT KONTROLÜ (A1'den G1'e kadar)
    const headerRow = sheetData[0];
    for (let colIdx = 0; colIdx < EXPECTED_HEADERS.length; colIdx++) {
      const expected = EXPECTED_HEADERS[colIdx];
      const actual = normalizeHeader(headerRow[colIdx]);

      if (actual !== expected) {
        const colLetter = String.fromCharCode(65 + colIdx); // A, B, C...
        return {
          success: false,
          error: `Başlık Formatı Geçersiz: ${colLetter}1 hücresi '${expected}' olmalıdır. Bulunan değer: '${actual || 'Boş'}'.`
        };
      }
    }

    // 3. VERİ SATIRLARINI OKUMA (Satır 2 ve sonrası)
    const parsedCompanies: Company[] = [];

    for (let rowIdx = 1; rowIdx < sheetData.length; rowIdx++) {
      const row = sheetData[rowIdx];
      if (!row || row.length === 0) continue;

      const sehir = String(row[0] || '').trim();
      const ilce = String(row[1] || '').trim();
      const tabelaUnvani = String(row[2] || '').trim();
      const musteriUnvani = String(row[3] || '').trim();
      const adres = String(row[4] || '').trim();
      const iletisim1 = String(row[5] || '').trim();
      const iletisim2 = String(row[6] || '').trim();

      // En az bir ana bilgi dolu olmalı (boş satırları atla)
      if (sehir || tabelaUnvani || musteriUnvani || adres || iletisim1) {
        parsedCompanies.push({
          id: `imp-${Date.now()}-${rowIdx}-${Math.random().toString(36).substring(2, 6)}`,
          sehir,
          ilce,
          tabelaUnvani,
          musteriUnvani,
          adres,
          iletisim1,
          iletisim2,
        });
      }
    }

    if (parsedCompanies.length === 0) {
      return {
        success: false,
        error: 'Excel dosyasında aktarılabilecek geçerli veri satırı bulunamadı.'
      };
    }

    return {
      success: true,
      companies: parsedCompanies,
      count: parsedCompanies.length
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return {
      success: false,
      error: `Excel dosyası okunurken hata oluştu: ${message}`
    };
  }
}

/**
 * Generates and downloads a valid template Excel file with J1='ENLOG'
 */
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // Header row + example rows
  const wsData = [
    [
      'ŞEHİR',
      'İLÇE',
      'TABELA ÜNVANI',
      'MÜŞTERİ ÜNVANI',
      'ADRES',
      'İLETİŞİM 1',
      'İLETİŞİM 2',
      '', // H
      '', // I
      'ENLOG' // J1: Security Token
    ],
    [
      'ADANA',
      'SEYHAN',
      'ÖRNEK RESTAURANT',
      'ÖRNEK GIDA TİC. LTD. ŞTİ.',
      'ATATÜRK CAD. NO:10',
      '0532 111 22 33',
      ''
    ],
    [
      'MERSİN',
      'YENİŞEHİR',
      'ÖRNEK CAFE',
      'ÖRNEK KAFE İŞL. A.Ş.',
      'ÜNİVERSİTE CAD. NO:25',
      '0533 444 55 66',
      ''
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths for neat appearance
  ws['!cols'] = [
    { wch: 15 }, // ŞEHİR
    { wch: 15 }, // İLÇE
    { wch: 25 }, // TABELA ÜNVANI
    { wch: 35 }, // MÜŞTERİ ÜNVANI
    { wch: 40 }, // ADRES
    { wch: 18 }, // İLETİŞİM 1
    { wch: 18 }, // İLETİŞİM 2
    { wch: 5 },  // H
    { wch: 5 },  // I
    { wch: 12 }  // J (ENLOG)
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'EDT_Listesi');
  XLSX.writeFile(wb, 'EDT_Listesi_Sablonu.xlsx');
}
