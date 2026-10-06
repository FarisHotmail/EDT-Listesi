import React, { useState } from 'react';
import { Company } from '../types/company';
import { 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  Share2, 
  Navigation, 
  MessageCircle
} from 'lucide-react';

interface CompanyCardProps {
  company: Company;
  onViewAllFromCity?: (city: string) => void;
  onSelectCompany?: (company: Company) => void;
  allCompanies?: Company[];
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onViewAllFromCity,
  onSelectCompany,
  allCompanies = []
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = async () => {
    const shareText = `${company.tabelaUnvani || company.musteriUnvani} - ${company.sehir}\nAdres: ${company.adres}\nİletişim: ${company.iletisim1 || '-'}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: company.tabelaUnvani || company.musteriUnvani,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        copyToClipboard(shareText, 'share');
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } else {
      copyToClipboard(shareText, 'share');
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const mapsSearchQuery = encodeURIComponent(
    `${company.tabelaUnvani || company.musteriUnvani} ${company.adres} ${company.sehir}`
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsSearchQuery}`;

  const cleanPhone1 = company.iletisim1.replace(/[^0-9]/g, '');
  const cleanPhone2 = company.iletisim2.replace(/[^0-9]/g, '');

  const formatWhatsAppUrl = (phoneStr: string) => {
    let clean = phoneStr.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = clean.substring(1);
    if (!clean.startsWith('90')) clean = '90' + clean;
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      {/* Minimal Header */}
      <div className="p-6 sm:p-7 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-800">
              {company.sehir || 'Şehir Yok'}
            </span>
            {company.ilce && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium text-zinc-500 bg-zinc-50 border border-zinc-200">
                {company.ilce}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            {company.tabelaUnvani || company.musteriUnvani || 'Firma Ünvanı Belirtilmemiş'}
          </h2>
          {company.musteriUnvani && company.musteriUnvani !== company.tabelaUnvani && (
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">
              {company.musteriUnvani}
            </p>
          )}
        </div>

        {/* Minimal Action Buttons */}
        <div className="flex items-center gap-1.5 self-start">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Paylaş veya Kopyala"
          >
            {shareSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-zinc-500" />}
            <span>{shareSuccess ? 'Kopyalandı' : 'Paylaş'}</span>
          </button>
        </div>
      </div>

      {/* Details Sections */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* Adres */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              Adres
            </span>
            {company.adres && (
              <button
                onClick={() => copyToClipboard(company.adres, 'adres')}
                className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-normal transition-colors"
              >
                {copiedField === 'adres' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-sm sm:text-base text-zinc-800 font-normal leading-relaxed">
            {company.adres || 'Adres bilgisi mevcut değil.'}
          </p>

          <div className="pt-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Google Haritalar'da Aç</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="pt-5 border-t border-zinc-100">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            İletişim Numaraları
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* İletişim 1 */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-0.5">İletişim 1</span>
                <span className="text-sm font-semibold font-mono text-zinc-900">
                  {company.iletisim1 || <span className="font-sans font-normal text-zinc-400 text-xs">Yok</span>}
                </span>
              </div>
              {company.iletisim1 && (
                <div className="mt-3 pt-2.5 border-t border-zinc-200/60 flex items-center gap-2">
                  <a
                    href={`tel:${cleanPhone1}`}
                    className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
                  >
                    Ara
                  </a>
                  <a
                    href={formatWhatsAppUrl(company.iletisim1)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            {/* İletişim 2 */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-0.5">İletişim 2</span>
                <span className="text-sm font-semibold font-mono text-zinc-900">
                  {company.iletisim2 || <span className="font-sans font-normal text-zinc-400 text-xs">Yok</span>}
                </span>
              </div>
              {company.iletisim2 && (
                <div className="mt-3 pt-2.5 border-t border-zinc-200/60 flex items-center gap-2">
                  <a
                    href={`tel:${cleanPhone2}`}
                    className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
                  >
                    Ara
                  </a>
                  <a
                    href={formatWhatsAppUrl(company.iletisim2)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
