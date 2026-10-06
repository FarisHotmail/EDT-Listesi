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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TablePageProps {
  companies: Company[];
  onSelectCompany: (company: Company) => void;
  onOpenModal: (company: Company) => void;
  onNavigateToCardView: (company: Company) => void;
}

type SortField = 'sehir' | 'ilce' | 'tabelaUnvani' | 'musteriUnvani';
type SortOrder = 'asc' | 'desc';

export const TablePage: React.FC<TablePageProps> = ({
  companies,
  onOpenModal,
  onNavigateToCardView,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [onlyWithPhone, setOnlyWithPhone] = useState(false);
  const [sortField, setSortField] = useState<SortField>('sehir');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

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
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalItems / pageSize) || 1;
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    if (pageSize === -1) return filteredAndSorted;
    const start = (effectivePage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, effectivePage, pageSize]);

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-16">
      {/* Top Header & Minimal Stats */}
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          Tüm EDT Listesi
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          {stats.total} Firma • {stats.uniqueCities} Şehir • {stats.uniqueBrands} Farklı Marka
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tabloda ara..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 focus:bg-white rounded-lg border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 transition-colors"
          />
        </div>

        {/* City Filter */}
        <div className="w-full sm:w-48">
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:bg-white outline-none focus:border-zinc-400 transition-colors cursor-pointer"
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
        <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer select-none px-1">
          <input
            type="checkbox"
            checked={onlyWithPhone}
            onChange={(e) => {
              setOnlyWithPhone(e.target.checked);
              setCurrentPage(1);
            }}
            className="w-3.5 h-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
          />
          <span>Telefonlu</span>
        </label>

        {(searchTerm || selectedCity || onlyWithPhone) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCity('');
              setOnlyWithPhone(false);
              setCurrentPage(1);
            }}
            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-500 transition-colors shrink-0"
            title="Temizle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px] select-none">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th 
                  onClick={() => handleSort('sehir')}
                  className="py-2.5 px-3 cursor-pointer hover:text-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Şehir</span>
                    {sortField === 'sehir' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-zinc-300" />
                    )}
                  </div>
                </th>
                <th className="py-2.5 px-3">İlçe</th>
                <th 
                  onClick={() => handleSort('tabelaUnvani')}
                  className="py-2.5 px-3 cursor-pointer hover:text-zinc-900 transition-colors min-w-[160px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Tabela Ünvanı</span>
                    {sortField === 'tabelaUnvani' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-zinc-300" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('musteriUnvani')}
                  className="py-2.5 px-3 cursor-pointer hover:text-zinc-900 transition-colors min-w-[180px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Müşteri Ünvanı</span>
                    {sortField === 'musteriUnvani' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-zinc-300" />
                    )}
                  </div>
                </th>
                <th className="py-2.5 px-3 min-w-[220px]">Adres</th>
                <th className="py-2.5 px-3 min-w-[110px]">İletişim 1</th>
                <th className="py-2.5 px-3 min-w-[110px]">İletişim 2</th>
                <th className="py-2.5 px-3 text-center w-24">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-zinc-400">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((comp, idx) => {
                  const globalIndex = pageSize === -1 ? idx + 1 : (effectivePage - 1) * pageSize + idx + 1;
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${comp.tabelaUnvani || comp.musteriUnvani} ${comp.adres} ${comp.sehir}`)}`;

                  return (
                    <tr 
                      key={comp.id} 
                      className="hover:bg-zinc-50/70 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center text-zinc-400 font-mono text-[11px]">
                        {globalIndex}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-zinc-900">
                        {comp.sehir}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-zinc-500">
                        {comp.ilce || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">
                        {comp.tabelaUnvani || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600 max-w-[200px] truncate" title={comp.musteriUnvani}>
                        {comp.musteriUnvani || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-500 max-w-[240px] truncate" title={comp.adres}>
                        {comp.adres}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        {comp.iletisim1 ? (
                          <a
                            href={`tel:${comp.iletisim1.replace(/[^0-9]/g, '')}`}
                            className="text-zinc-800 hover:underline"
                          >
                            {comp.iletisim1}
                          </a>
                        ) : (
                          <span className="text-zinc-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        {comp.iletisim2 ? (
                          <a
                            href={`tel:${comp.iletisim2.replace(/[^0-9]/g, '')}`}
                            className="text-zinc-800 hover:underline"
                          >
                            {comp.iletisim2}
                          </a>
                        ) : (
                          <span className="text-zinc-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onNavigateToCardView(comp)}
                            className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            title="Kartı Görüntüle"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenModal(comp)}
                            className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            title="Önizle"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
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

        {/* Minimal Table Footer */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span>
              Toplam <strong>{totalItems}</strong> kayıt
            </span>
            <div className="flex items-center gap-1">
              <span>Sayfa boyutu:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-zinc-200 rounded px-1.5 py-0.5 text-xs text-zinc-800 outline-none"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={-1}>Tümü</option>
              </select>
            </div>
          </div>

          {pageSize !== -1 && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={effectivePage === 1}
                className="p-1 rounded border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-zinc-700 font-medium">
                {effectivePage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={effectivePage === totalPages}
                className="p-1 rounded border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
