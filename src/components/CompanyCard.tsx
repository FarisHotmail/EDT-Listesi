import React, { useState } from 'react';
import { Company } from '../types/company';
import { 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  Share2, 
  FileText, 
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

  const handleDownloadVCard = () => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${company.tabelaUnvani || company.musteriUnvani}`,
      `ORG:${company.musteriUnvani || company.tabelaUnvani}`,
      `ADR;TYPE=WORK:;;${company.adres};${company.ilce || ''};${company.sehir};;Türkiye`,
      company.iletisim1 ? `TEL;TYPE=WORK,VOICE:${company.iletisim1.replace(/\s+/g, '')}` : '',
      company.iletisim2 ? `TEL;TYPE=CELL,VOICE:${company.iletisim2.replace(/\s+/g, '')}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(company.tabelaUnvani || 'sirket').replace(/[^a-zA-Z0-9]/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="w-full bg-white rounded-[4px] border border-slate-300 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-[2px] text-xs font-semibold bg-slate-200/80 text-slate-800 border border-slate-300/80">
              {company.sehir || 'Şehir Yok'}
            </span>
            {company.ilce && (
              <span className="px-2 py-0.5 rounded-[2px] text-xs font-medium text-slate-600 bg-white border border-slate-300">
                {company.ilce}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {company.tabelaUnvani || company.musteriUnvani || 'Firma Ünvanı Belirtilmemiş'}
          </h2>
          {company.musteriUnvani && company.musteriUnvani !== company.tabelaUnvani && (
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              {company.musteriUnvani}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-start">
          <button
            onClick={handleShare}
            className="px-2.5 py-1.5 rounded-[3px] border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Paylaş veya Kopyala"
          >
            {shareSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{shareSuccess ? 'Kopyalandı' : 'Paylaş'}</span>
          </button>
          <button
            onClick={handleDownloadVCard}
            className="px-2.5 py-1.5 rounded-[3px] border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
            title="vCard Kartvizit İndir"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>vCard</span>
          </button>
        </div>
      </div>

      {/* Details Sections */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Adres */}
        <div className="p-4 rounded-[4px] bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Adres
            </span>
            {company.adres && (
              <button
                onClick={() => copyToClipboard(company.adres, 'adres')}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-normal transition-colors"
              >
                {copiedField === 'adres' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Kopyalandı</span>
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
          <p className="text-sm text-slate-800 leading-relaxed font-normal">
            {company.adres || 'Adres bilgisi mevcut değil.'}
          </p>

          <div className="pt-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 hover:text-slate-950 underline underline-offset-2 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-slate-600" />
              <span>Google Haritalar'da Aç</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            İletişim Numaraları
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* İletişim 1 */}
            <div className="p-3.5 rounded-[4px] bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">İletişim 1</span>
                <span className="text-sm font-semibold font-mono text-slate-900">
                  {company.iletisim1 || <span className="font-sans font-normal text-slate-400 text-xs">Yok</span>}
                </span>
              </div>
              {company.iletisim1 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center gap-2">
                  <a
                    href={`tel:${cleanPhone1}`}
                    className="flex-1 text-center py-1.5 px-2.5 rounded-[3px] bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition-colors shadow-2xs"
                  >
                    Ara
                  </a>
                  <a
                    href={formatWhatsAppUrl(company.iletisim1)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-[3px] border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            {/* İletişim 2 */}
            <div className="p-3.5 rounded-[4px] bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">İletişim 2</span>
                <span className="text-sm font-semibold font-mono text-slate-900">
                  {company.iletisim2 || <span className="font-sans font-normal text-slate-400 text-xs">Yok</span>}
                </span>
              </div>
              {company.iletisim2 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center gap-2">
                  <a
                    href={`tel:${cleanPhone2}`}
                    className="flex-1 text-center py-1.5 px-2.5 rounded-[3px] bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition-colors shadow-2xs"
                  >
                    Ara
                  </a>
                  <a
                    href={formatWhatsAppUrl(company.iletisim2)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-[3px] border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
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
