import React, { useState, useMemo } from 'react';
import { Company } from '../types/company';
import { 
  Search, 
  Phone, 
  ExternalLink, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Building2, 
  RotateCcw,
  FileSpreadsheet
} from 'lucide-react';

interface TablePageProps {
  companies: Company[];
  onSelectCompany: (company: Company) => void;
  onOpenModal: (company: Company) => void;
  onNavigateToCardView: (company: Company) => void;
  onOpenExcelImport?: () => void;
}

type SortField = 'sehir' | 'ilce' | 'tabelaUnvani' | 'musteriUnvani';
type SortOrder = 'asc' | 'desc';

export const TablePage: React.FC<TablePageProps> = ({
  companies,
  onOpenModal,
  onNavigateToCardView,
  onOpenExcelImport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [onlyWithPhone, setOnlyWithPhone] = useState(false);
  const [sortField, setSortField] = useState<SortField>('sehir');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Unique cities with counts
  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    companies.forEach((c) => {
      const city = c.sehir.trim();
      if (city) counts.set(city, (counts.get(city) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], 'tr'));
  }, [companies]);

  // Statistics
  const stats = useMemo(() => {
    const total = companies.length;
    const uniqueCities = new Set(companies.map((c) => c.sehir).filter(Boolean)).size;
    const withPhoneCount = companies.filter((c) => c.iletisim1 || c.iletisim2).length;
    const uniqueBrands = new Set(companies.map((c) => c.tabelaUnvani).filter(Boolean)).size;
    return {
      total,
      uniqueCities,
      withPhoneCount,
      uniqueBrands,
    };
  }, [companies]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...companies];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.sehir.toLowerCase().includes(q) ||
          c.ilce.toLowerCase().includes(q) ||
          c.tabelaUnvani.toLowerCase().includes(q) ||
          c.musteriUnvani.toLowerCase().includes(q) ||
          c.adres.toLowerCase().includes(q) ||
          c.iletisim1.includes(q) ||
          c.iletisim2.includes(q)
      );
    }

    if (selectedCity) {
      result = result.filter((c) => c.sehir.toLowerCase() === selectedCity.toLowerCase());
    }

    if (onlyWithPhone) {
      result = result.filter((c) => c.iletisim1 || c.iletisim2);
    }

    result.sort((a, b) => {
      const valA = (a[sortField] || '').toLocaleLowerCase('tr');
      const valB = (b[sortField] || '').toLocaleLowerCase('tr');
      return sortOrder === 'asc' ? valA.localeCompare(valB, 'tr') : valB.localeCompare(valA, 'tr');
    });

    return result;
  }, [companies, searchTerm, selectedCity, onlyWithPhone, sortField, sortOrder]);

  const totalItems = filteredAndSorted.length;

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-16">
      {/* Top Header & Stats */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tüm EDT Listesi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {stats.total} Firma • {stats.uniqueCities} Şehir • {stats.uniqueBrands} Farklı Marka
          </p>
        </div>

        {onOpenExcelImport && (
          <button
            type="button"
            onClick={onOpenExcelImport}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium transition-colors shadow-2xs"
            title="Excel Dosyası ile Listeyi Güncelle"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span>Excel ile Güncelle</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-[4px] border border-slate-300 shadow-2xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tabloda ara..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50/60 focus:bg-white rounded-[3px] border border-slate-300 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600/20 transition-colors"
          />
        </div>

        {/* City Filter */}
        <div className="w-full sm:w-48">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-slate-50/60 border border-slate-300 rounded-[3px] px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600/20 transition-colors cursor-pointer"
          >
            <option value="">Tüm Şehirler ({cities.length})</option>
            {cities.map(([city, count]) => (
              <option key={city} value={city}>
                {city} ({count})
              </option>
            ))}
          </select>
        </div>

        {/* Phone Only Checkbox */}
        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none px-1">
          <input
            type="checkbox"
            checked={onlyWithPhone}
            onChange={(e) => setOnlyWithPhone(e.target.checked)}
            className="w-3.5 h-3.5 rounded-[2px] border-slate-300 text-slate-800 focus:ring-slate-400"
          />
          <span>Telefonlu</span>
        </label>

        {(searchTerm || selectedCity || onlyWithPhone) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCity('');
              setOnlyWithPhone(false);
            }}
            className="p-1.5 rounded-[3px] border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
            title="Temizle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Table - Showing ALL rows without pagination */}
      <div className="bg-white rounded-[4px] border border-slate-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold uppercase tracking-wider text-[11px] select-none">
                <th className="py-2.5 px-3 w-10 text-center text-slate-500">#</th>
                <th 
                  onClick={() => handleSort('sehir')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Şehir</span>
                    {sortField === 'sehir' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-slate-900" /> : <ArrowDown className="w-3 h-3 text-slate-900" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="py-2.5 px-3">İlçe</th>
                <th 
                  onClick={() => handleSort('tabelaUnvani')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors min-w-[160px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Tabela Ünvanı</span>
                    {sortField === 'tabelaUnvani' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-slate-900" /> : <ArrowDown className="w-3 h-3 text-slate-900" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('musteriUnvani')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors min-w-[180px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Müşteri Ünvanı</span>
                    {sortField === 'musteriUnvani' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-slate-900" /> : <ArrowDown className="w-3 h-3 text-slate-900" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="py-2.5 px-3 min-w-[220px]">Adres</th>
                <th className="py-2.5 px-3 min-w-[110px]">İletişim 1</th>
                <th className="py-2.5 px-3 min-w-[110px]">İletişim 2</th>
                <th className="py-2.5 px-3 text-center w-24">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((comp, idx) => {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${comp.tabelaUnvani || comp.musteriUnvani} ${comp.adres} ${comp.sehir}`)}`;

                  return (
                    <tr 
                      key={comp.id} 
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-900">
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-slate-100 border border-slate-200 text-slate-800 text-[11px]">
                          {comp.sehir}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                        {comp.ilce || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {comp.tabelaUnvani || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-[200px] truncate" title={comp.musteriUnvani}>
                        {comp.musteriUnvani || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-[240px] truncate" title={comp.adres}>
                        {comp.adres}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        {comp.iletisim1 ? (
                          <a
                            href={`tel:${comp.iletisim1.replace(/[^0-9]/g, '')}`}
                            className="text-slate-800 hover:text-slate-950 hover:underline"
                          >
                            {comp.iletisim1}
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        {comp.iletisim2 ? (
                          <a
                            href={`tel:${comp.iletisim2.replace(/[^0-9]/g, '')}`}
                            className="text-slate-800 hover:text-slate-950 hover:underline"
                          >
                            {comp.iletisim2}
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onNavigateToCardView(comp)}
                            className="p-1 rounded-[3px] border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Kartı Görüntüle"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenModal(comp)}
                            className="p-1 rounded-[3px] border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Önizle"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-[3px] border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Harita"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Minimal Table Footer - Direct single-page status */}
        <div className="p-3 bg-slate-50 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
          <span>
            Toplam <strong className="text-slate-900">{totalItems}</strong> kayıt tek sayfada listeleniyor
          </span>
          <span className="text-[11px] text-slate-400">
            Tüm liste kesintisiz görünüm
          </span>
        </div>
      </div>
    </div>
  );
};
