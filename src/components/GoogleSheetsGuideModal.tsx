import React, { useState } from 'react';
import { 
  X, 
  Code, 
  Smartphone, 
  Globe, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

interface GoogleSheetsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCsvUrl: (url: string) => Promise<boolean>;
  onResetToDefault: () => void;
}

export const GoogleSheetsGuideModal: React.FC<GoogleSheetsGuideModalProps> = ({
  isOpen,
  onClose,
  onImportCsvUrl,
  onResetToDefault,
}) => {
  const [activeTab, setActiveTab] = useState<'formulas' | 'liveSync' | 'appsheet' | 'publish'>('formulas');
  const [sheetUrl, setSheetUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyFormula = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const handleSyncUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) return;
    setSyncStatus('loading');
    const success = await onImportCsvUrl(sheetUrl.trim());
    if (success) {
      setSyncStatus('success');
      setTimeout(() => {
        setSyncStatus('idle');
        onClose();
      }, 1500);
    } else {
      setSyncStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/40 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-lg overflow-hidden z-10 border border-zinc-200 my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">
              Google E-Tablo Kılavuzu
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              E-Tablonuzu formüllerle iki sayfaya bölme ve web sitesine bağlama yöntemleri
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'formulas'
                ? 'border-zinc-900 text-zinc-900 bg-white font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Formüllerle 2 Sayfa
          </button>
          <button
            onClick={() => setActiveTab('liveSync')}
            className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'liveSync'
                ? 'border-zinc-900 text-zinc-900 bg-white font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Canlı E-Tablo Bağlantısı
          </button>
          <button
            onClick={() => setActiveTab('appsheet')}
            className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'appsheet'
                ? 'border-zinc-900 text-zinc-900 bg-white font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Google AppSheet
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'publish'
                ? 'border-zinc-900 text-zinc-900 bg-white font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Google Sites
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-zinc-700 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'formulas' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80">
                <p className="font-semibold text-zinc-900 mb-1">
                  Google E-Tabloda 2 Sayfalı Sistem Kurulumu:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-xs text-zinc-600">
                  <li><strong>Sayfa 1 (Kart Görünümü):</strong> Kullanıcının arama yaptığı sayfa.</li>
                  <li><strong>Sayfa 2 (Tüm Liste):</strong> Veritabanı tablosunun bulunduğu sayfa.</li>
                  <li>Sayfa 1'de arama kutusuna <code>Veri &gt; Veri Doğrulama &gt; Açılır Liste</code> ekleyip Tabela veya Şehir sütununu seçin.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                  Kullanılacak Formüller
                </span>

                <div className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-xs flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 block text-[11px] font-sans">Şehir Bilgisini Getirme:</span>
                    <code>=ÇAPRAZARA(C3; 'Tüm Liste'!C:C; 'Tüm Liste'!A:A; "Bulunamadı")</code>
                  </div>
                  <button
                    onClick={() => copyFormula("=ÇAPRAZARA(C3; 'Tüm Liste'!C:C; 'Tüm Liste'!A:A; \"Bulunamadı\")", 'f1')}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {copiedFormula === 'f1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-xs flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 block text-[11px] font-sans">Müşteri Resmi Ünvanı:</span>
                    <code>=ÇAPRAZARA(C3; 'Tüm Liste'!C:C; 'Tüm Liste'!D:D; "-")</code>
                  </div>
                  <button
                    onClick={() => copyFormula("=ÇAPRAZARA(C3; 'Tüm Liste'!C:C; 'Tüm Liste'!D:D; \"-\")", 'f2')}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {copiedFormula === 'f2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-xs flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 block text-[11px] font-sans">Adres Bilgisi:</span>
                    <code>=ÇAPRAZARA(C3; 'Tüm Liste'!C:C; 'Tüm Liste'!E:E; "Yok")</code>
                  </div>
                  <button
                    onClick={() => copyFormula("=ÇAPRAZARA(C3; 'Tüm Liste'!C:C; 'Tüm Liste'!E:E; \"Yok\")", 'f3')}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {copiedFormula === 'f3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-xs flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 block text-[11px] font-sans">Şehre Göre Şubeleri Filtreleme:</span>
                    <code>=FILTER('Tüm Liste'!A2:G; 'Tüm Liste'!A2:A = C2)</code>
                  </div>
                  <button
                    onClick={() => copyFormula("=FILTER('Tüm Liste'!A2:G; 'Tüm Liste'!A2:A = C2)", 'f4')}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {copiedFormula === 'f4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'liveSync' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-600">
                Google E-Tablo'nuzu <strong>Dosya &gt; Paylaş &gt; Web'de Yayınla</strong> menüsünden <strong>CSV (.csv)</strong> biçiminde yayınlayıp linkini buraya bağlayabilirsiniz.
              </p>

              <form onSubmit={handleSyncUrl} className="space-y-2.5">
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-400 font-mono"
                />
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onResetToDefault();
                      setSheetUrl('');
                      onClose();
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-900"
                  >
                    Varsayılan Tabloya Dön
                  </button>

                  <button
                    type="submit"
                    disabled={syncStatus === 'loading' || !sheetUrl.trim()}
                    className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-medium transition-colors"
                  >
                    {syncStatus === 'loading' ? 'Yükleniyor...' : syncStatus === 'success' ? 'Yüklendi' : 'Bağla & Güncelle'}
                  </button>
                </div>

                {syncStatus === 'error' && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>CSV bağlantısı okunamadı. Lütfen herkese açık ve CSV formatında olduğundan emin olun.</span>
                  </p>
                )}
              </form>
            </div>
          )}

          {activeTab === 'appsheet' && (
            <div className="space-y-3 text-xs text-zinc-600">
              <p className="font-semibold text-zinc-900">AppSheet ile Mobil & Web Uygulaması:</p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>Google E-Tablo menüsünden <strong>Uzantılar &gt; AppSheet &gt; Uygulama oluştur</strong> seçin.</li>
                <li>AppSheet tablonuzdaki telefonları otomatik arama butonuna, adresleri Google Harita pinine çevirir.</li>
                <li>Görünümler sekmesinden 1. görünümü <strong>Card View</strong>, 2. görünümü <strong>Table View</strong> olarak ayarlayın.</li>
              </ol>
            </div>
          )}

          {activeTab === 'publish' && (
            <div className="space-y-3 text-xs text-zinc-600">
              <p className="font-semibold text-zinc-900">Google Sites ile Yayınlama:</p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li><a href="https://sites.google.com" target="_blank" rel="noreferrer" className="text-zinc-900 underline font-medium inline-flex items-center gap-1">sites.google.com <ExternalLink className="w-3 h-3" /></a> adresine gidin.</li>
                <li>Sayfalar sekmesinden "Arama" ve "Tüm Liste" sekmeleri oluşturun.</li>
                <li>Ekle sekmesinden bu web sitesini veya E-Tablonuzu gömün ve <strong>Yayınla</strong> butonuna basın.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
