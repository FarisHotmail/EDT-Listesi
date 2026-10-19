import React, { useState, useMemo } from 'react';
import { Company, SearchFilters } from '../types/company';
import { CompanyCard } from './CompanyCard';
import { 
  Search, 
  RotateCcw, 
  ChevronRight,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';

interface SearchPageProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
  onNavigateToTable: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  companies,
  selectedCompany,
  onSelectCompany,
  filters,
  onFilterChange,
  onResetFilters,
  onNavigateToTable
}) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Cities with counts
  const citiesWithCount = useMemo(() => {
    const counts = new Map<string, number>();
    companies.forEach((c) => {
      const city = c.sehir.trim();
      if (city) counts.set(city, (counts.get(city) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [companies]);

  // Unique brands
  const brandNames = useMemo(() => {
    const counts = new Map<string, number>();
    companies.forEach((c) => {
      const brand = c.tabelaUnvani.trim();
      if (brand) counts.set(brand, (counts.get(brand) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'tr'));
  }, [companies]);

  // Unique legal names
  const legalNames = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.musteriUnvani) set.add(c.musteriUnvani.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [companies]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((comp) => {
      if (filters.query) {
        const q = filters.query.toLowerCase().trim();
        const inCity = comp.sehir.toLowerCase().includes(q);
        const inDistrict = comp.ilce.toLowerCase().includes(q);
        const inTabela = comp.tabelaUnvani.toLowerCase().includes(q);
        const inMusteri = comp.musteriUnvani.toLowerCase().includes(q);
        const inAdres = comp.adres.toLowerCase().includes(q);
        const inPhone = comp.iletisim1.includes(q) || comp.iletisim2.includes(q);
        if (!(inCity || inDistrict || inTabela || inMusteri || inAdres || inPhone)) {
          return false;
        }
      }

      if (filters.sehir && comp.sehir.toLowerCase() !== filters.sehir.toLowerCase()) {
        return false;
      }

      if (filters.ilce && comp.ilce.toLowerCase() !== filters.ilce.toLowerCase()) {
        return false;
      }

      if (filters.tabelaUnvani && comp.tabelaUnvani.toLowerCase() !== filters.tabelaUnvani.toLowerCase()) {
        return false;
      }

      if (filters.musteriUnvani && comp.musteriUnvani.toLowerCase() !== filters.musteriUnvani.toLowerCase()) {
        return false;
      }

      if (filters.adres && !comp.adres.toLowerCase().includes(filters.adres.toLowerCase().trim())) {
        return false;
      }

      return true;
    });
  }, [companies, filters]);

  const activeFiltersCount = [
    Boolean(filters.query),
    Boolean(filters.sehir),
    Boolean(filters.ilce),
    Boolean(filters.tabelaUnvani),
    Boolean(filters.musteriUnvani),
    Boolean(filters.adres),
  ].filter(Boolean).length;

  const activeDetailedFiltersCount = [
    Boolean(filters.sehir),
    Boolean(filters.ilce),
    Boolean(filters.tabelaUnvani),
    Boolean(filters.musteriUnvani),
    Boolean(filters.adres),
  ].filter(Boolean).length;

  const displayedCompany = useMemo(() => {
    if (selectedCompany && filteredCompanies.some((c) => c.id === selectedCompany.id)) {
      return selectedCompany;
    }
    return filteredCompanies.length > 0 ? filteredCompanies[0] : null;
  }, [selectedCompany, filteredCompanies]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          EDT Rehberi • Faris
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Şehir, tabela ünvanı, müşteri ünvanı veya adres seçerek firma kartına ulaşın.
        </p>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-[4px] p-3.5 sm:p-5 border border-slate-300 shadow-2xs space-y-3 sm:space-y-3.5">
        {/* Global Fast Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onFilterChange({ query: e.target.value })}
            placeholder="Arama yapın... (Örn: Adana, Tavuk Dünyası, Kebo, Çukurova)"
            className="w-full pl-9 pr-14 py-2 bg-slate-50/60 focus:bg-white rounded-[3px] border border-slate-300 focus:border-slate-600 focus:ring-1 focus:ring-slate-600/20 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-colors"
          />
          {filters.query && (
            <button
              onClick={() => onFilterChange({ query: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-700"
            >
              Temizle
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle Accordion (Visible only on mobile) */}
        <div className="sm:hidden flex items-center justify-between pt-0.5">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-slate-300 hover:bg-slate-100 bg-slate-50/80 text-slate-800 text-xs font-medium transition-colors shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Filtreleme Seçenekleri</span>
            {activeDetailedFiltersCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">
                {activeDetailedFiltersCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                isMobileFilterOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Temizle</span>
            </button>
          )}
        </div>

        {/* 4 Selectors Grid: Collapsible on Mobile, Always visible on Desktop */}
        <div
          className={`${
            isMobileFilterOpen ? 'grid' : 'hidden'
          } sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200`}
        >
          {/* 1. Şehir */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Şehir
            </label>
            <div className="relative">
              <select
                value={filters.sehir}
                onChange={(e) => onFilterChange({ sehir: e.target.value, ilce: '' })}
                className="w-full appearance-none bg-slate-50/60 border border-slate-300 rounded-[3px] px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-600 focus:ring-1 focus:ring-slate-600/20 outline-none transition-colors cursor-pointer pr-7"
              >
                <option value="">Tüm Şehirler ({citiesWithCount.length})</option>
                {citiesWithCount.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 2. Tabela Ünvanı */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Tabela Ünvanı
            </label>
            <div className="relative">
              <select
                value={filters.tabelaUnvani}
                onChange={(e) => onFilterChange({ tabelaUnvani: e.target.value })}
                className="w-full appearance-none bg-slate-50/60 border border-slate-300 rounded-[3px] px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-600 focus:ring-1 focus:ring-slate-600/20 outline-none transition-colors cursor-pointer truncate pr-7"
              >
                <option value="">Tüm Tabela Ünvanları ({brandNames.length})</option>
                {brandNames.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} ({b.count})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 3. Müşteri Ünvanı */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Müşteri Ünvanı
            </label>
            <div className="relative">
              <select
                value={filters.musteriUnvani}
                onChange={(e) => onFilterChange({ musteriUnvani: e.target.value })}
                className="w-full appearance-none bg-slate-50/60 border border-slate-300 rounded-[3px] px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-600 focus:ring-1 focus:ring-slate-600/20 outline-none transition-colors cursor-pointer truncate pr-7"
              >
                <option value="">Tüm Müşteri Ünvanları ({legalNames.length})</option>
                {legalNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 4. Adres */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Adres / Mahalle
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.adres}
                onChange={(e) => onFilterChange({ adres: e.target.value })}
                placeholder="Örn: Toros Cad, AVM..."
                className="w-full bg-slate-50/60 border border-slate-300 rounded-[3px] px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-600 focus:ring-1 focus:ring-slate-600/20 outline-none transition-colors"
              />
              {filters.adres && (
                <button
                  onClick={() => onFilterChange({ adres: '' })}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reset Filters when active (Visible on Desktop) */}
        {activeFiltersCount > 0 && (
          <div className="hidden sm:flex pt-2 border-t border-slate-200 justify-end">
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Filtreleri Temizle</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="text-slate-600">
          Toplam <strong className="text-slate-900">{filteredCompanies.length}</strong> kayıt bulundu
          {filters.sehir && ` (${filters.sehir})`}
        </span>

        <button
          onClick={onNavigateToTable}
          className="text-slate-700 hover:text-slate-950 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>Tüm Tabloyu Gör (Sayfa 2)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-[4px] p-8 text-center border border-slate-300 space-y-3">
          <p className="text-sm font-medium text-slate-800">Seçilen kriterlere uygun firma bulunamadı.</p>
          <button
            onClick={onResetFilters}
            className="px-3.5 py-1.5 rounded-[3px] bg-slate-800 text-white text-xs font-medium hover:bg-slate-900 transition-colors"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: If multiple results, show selector list */}
          {filteredCompanies.length > 1 && (
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <span>Eşleşen Firmalar ({filteredCompanies.length})</span>
                <span className="font-normal capitalize text-slate-400">Seçmek için tıklayın</span>
              </div>

              <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
                {filteredCompanies.map((comp) => {
                  const isSelected = displayedCompany?.id === comp.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => onSelectCompany(comp)}
                      className={`w-full text-left p-3 rounded-[3px] border transition-colors text-xs flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-100/90 text-slate-950 border-slate-600 shadow-2xs font-medium ring-1 ring-slate-600/20'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-[2px] border ${
                            isSelected 
                              ? 'bg-slate-200 border-slate-300 text-slate-800' 
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            {comp.sehir}
                          </span>
                          {comp.ilce && (
                            <span className="text-[10px] text-slate-500">
                              {comp.ilce}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold truncate text-slate-900">
                          {comp.tabelaUnvani || comp.musteriUnvani}
                        </p>
                        <p className="text-[11px] truncate mt-0.5 text-slate-500">
                          {comp.adres}
                        </p>
                      </div>

                      <span className={`text-xs shrink-0 ${isSelected ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>
                        →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Column: The Company Card */}
          <div className={filteredCompanies.length > 1 ? 'lg:col-span-7' : 'lg:col-span-12 max-w-3xl mx-auto w-full'}>
            {displayedCompany && (
              <CompanyCard
                company={displayedCompany}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
