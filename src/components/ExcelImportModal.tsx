import React, { useState, useRef } from 'react';
import { Company } from '../types/company';
import { parseAndValidateExcel, downloadExcelTemplate } from '../utils/excelParser';
import { 
  X, 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ShieldCheck, 
  RotateCcw,
  Cloud
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newCompanies: Company[]) => Promise<void> | void;
  onResetToDefault: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onResetToDefault,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validCompanies, setValidCompanies] = useState<Company[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
    setValidCompanies(null);
    setIsValidating(true);

    const result = await parseAndValidateExcel(selectedFile);
    setIsValidating(false);

    if (result.success && result.companies) {
      setValidCompanies(result.companies);
      setErrorMessage(null);
    } else {
      setValidCompanies(null);
      setErrorMessage(result.error || 'Geçersiz Excel dosyası.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (validCompanies && validCompanies.length > 0) {
      setIsSaving(true);
      try {
        await onImportSuccess(validCompanies);
        handleClose();
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Veritabanına kaydedilirken hata oluştu.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleClose = () => {
    setFile(null);
    setErrorMessage(null);
    setValidCompanies(null);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={handleClose} aria-hidden="true" />

      <div className="relative bg-white rounded-[4px] max-w-xl w-full shadow-lg overflow-hidden z-10 border border-slate-300 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[3px] bg-slate-800 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Excel ile Liste Güncelle
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[2px] border border-emerald-200">
              <Cloud className="w-3 h-3 text-emerald-600" />
              <span>Bulut Senkronizasyonu Aktif</span>
            </span>
            <button
              onClick={handleClose}
              className="p-1 rounded-[3px] hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Rules & Requirements Box */}
          <div className="p-3 rounded-[3px] bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                Zorunlu Dosya Formatı & Güvenlik Kuralı:
              </span>
              <button
                type="button"
                onClick={downloadExcelTemplate}
                className="text-[11px] font-medium text-slate-700 hover:text-slate-950 underline flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Örnek Şablonu İndir (.xlsx)</span>
              </button>
            </div>

            <ul className="space-y-1 text-[11px] text-slate-600 pl-4 list-disc">
              <li>
                <strong>A1 - G1 Başlıkları:</strong> Sırasıyla <code className="bg-white px-1 py-0.2 border border-slate-200 text-slate-800 font-mono">ŞEHİR, İLÇE, TABELA ÜNVANI, MÜŞTERİ ÜNVANI, ADRES, İLETİŞİM 1, İLETİŞİM 2</code> olmalıdır.
              </li>
              <li>
                <strong>Güvenlik Hücresi:</strong> Dosyanın ilgili hücresinde şifre yazılmadığı taktirde içe aktarma engellenecektir.
              </li>
            </ul>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-[3px] p-6 text-center cursor-pointer bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-[3px] bg-slate-200/80 mx-auto flex items-center justify-center text-slate-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-xs">
                {file ? file.name : 'Excel dosyasını buraya sürükleyin veya seçin'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                .xlsx veya .xls formatı desteklenir
              </p>
            </div>
          </div>

          {/* Validation Status Feedback */}
          {isValidating && (
            <div className="p-2.5 rounded-[3px] bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-2">
              <span className="animate-spin text-slate-500">⏳</span>
              <span>Dosya formatı ve güvenlik kontrolü yapılıyor...</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-[3px] bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold block text-xs">İçe Aktarma Reddedildi:</span>
                {errorMessage}
              </div>
            </div>
          )}

          {validCompanies && (
            <div className="p-3 rounded-[3px] bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold block text-xs">Format ve Güvenlik Doğrulandı!</span>
                Güvenlik şifresi ve A1-G1 başlıkları geçerli. Toplam <strong className="text-emerald-950 font-semibold">{validCompanies.length}</strong> adet kayıt merkezi bulut veritabanına aktarılmaya hazır.
              </div>
            </div>
          )}

          {/* Revert to default option */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Varsayılan demo listesine dönmek isterseniz:</span>
            <button
              type="button"
              onClick={() => {
                onResetToDefault();
                handleClose();
              }}
              className="text-slate-700 hover:text-slate-900 underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Orijinal Listeyi Yükle</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1.5 rounded-[3px] border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            disabled={!validCompanies || validCompanies.length === 0 || isSaving}
            onClick={handleConfirmImport}
            className="px-4 py-1.5 rounded-[3px] bg-slate-800 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {isSaving ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Buluta Kaydediliyor...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Listeyi Güncelle {validCompanies ? `(${validCompanies.length} Kayıt)` : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
