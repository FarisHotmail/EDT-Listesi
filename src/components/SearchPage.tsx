import React, { useMemo } from 'react';
import { Company, SearchFilters } from '../types/company';
import { CompanyCard } from './CompanyCard';
import { 
  Search, 
  RotateCcw, 
  ChevronRight,
  ChevronDown
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

  const displayedCompany = useMemo(() => {
    if (selectedCompany && filteredCompanies.some((c) => c.id === selectedCompany.id)) {
      return selectedCompany;
    }
    return filteredCompanies.length > 0 ? filteredCompanies[0] : null;
  }, [selectedCompany, filteredCompanies]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Minimal Header */}
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          EDT Rehberi
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Şehir, tabela ünvanı, müşteri ünvanı veya adres seçerek firma kartına ulaşın.
        </p>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
        {/* Global Fast Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onFilterChange({ query: e.target.value })}
            placeholder="Arama yapın... (Örn: Adana, Tavuk Dünyası, Kebo, Çukurova)"
            className="w-full pl-10 pr-16 py-2.5 bg-zinc-50 focus:bg-white rounded-xl border border-zinc-200 focus:border-zinc-400 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none transition-colors"
          />
          {filters.query && (
            <button
              onClick={() => onFilterChange({ query: '' })}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-zinc-400 hover:text-zinc-600"
            >
              Temizle
            </button>
          )}
        </div>

        {/* 4 Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Şehir */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
              Şehir
            </label>
            <div className="relative">
              <select
                value={filters.sehir}
                onChange={(e) => onFilterChange({ sehir: e.target.value, ilce: '' })}
                className="w-full appearance-none bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 focus:bg-white focus:border-zinc-400 outline-none transition-colors cursor-pointer pr-8"
              >
                <option value="">Tüm Şehirler ({citiesWithCount.length})</option>
                {citiesWithCount.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-zinc-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 2. Tabela Ünvanı */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
              Tabela Ünvanı
            </label>
            <div className="relative">
              <select
                value={filters.tabelaUnvani}
                onChange={(e) => onFilterChange({ tabelaUnvani: e.target.value })}
                className="w-full appearance-none bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 focus:bg-white focus:border-zinc-400 outline-none transition-colors cursor-pointer truncate pr-8"
              >
                <option value="">Tüm Tabela Ünvanları ({brandNames.length})</option>
                {brandNames.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} ({b.count})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-zinc-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 3. Müşteri Ünvanı */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
              Müşteri Ünvanı
            </label>
            <div className="relative">
              <select
                value={filters.musteriUnvani}
                onChange={(e) => onFilterChange({ musteriUnvani: e.target.value })}
                className="w-full appearance-none bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 focus:bg-white focus:border-zinc-400 outline-none transition-colors cursor-pointer truncate pr-8"
              >
                <option value="">Tüm Müşteri Ünvanları ({legalNames.length})</option>
                {legalNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-zinc-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 4. Adres */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
              Adres / Mahalle
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.adres}
                onChange={(e) => onFilterChange({ adres: e.target.value })}
                placeholder="Örn: Toros Cad, AVM..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 focus:bg-white focus:border-zinc-400 outline-none transition-colors"
              />
              {filters.adres && (
                <button
                  onClick={() => onFilterChange({ adres: '' })}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reset Filters when active */}
        {activeFiltersCount > 0 && (
          <div className="pt-2 border-t border-zinc-100 flex justify-end">
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Filtreleri Temizle</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="text-zinc-500">
          Toplam <strong className="text-zinc-900">{filteredCompanies.length}</strong> kayıt bulundu
          {filters.sehir && ` (${filters.sehir})`}
        </span>

        <button
          onClick={onNavigateToTable}
          className="text-zinc-600 hover:text-zinc-900 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>Tüm Tabloyu Gör (Sayfa 2)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-zinc-200 space-y-3">
          <p className="text-sm font-medium text-zinc-800">Seçilen kriterlere uygun firma bulunamadı.</p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: If multiple results, show minimalist selector list */}
          {filteredCompanies.length > 1 && (
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <span>Eşleşen Firmalar ({filteredCompanies.length})</span>
                <span className="font-normal capitalize text-zinc-400">Seçmek için tıklayın</span>
              </div>

              <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
                {filteredCompanies.map((comp) => {
                  const isSelected = displayedCompany?.id === comp.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => onSelectCompany(comp)}
                      className={`w-full text-left p-3 rounded-xl border transition-colors text-xs flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                          : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {comp.sehir}
                          </span>
                          {comp.ilce && (
                            <span className={`text-[10px] ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                              {comp.ilce}
                            </span>
                          )}
                        </div>
                        <p className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                          {comp.tabelaUnvani || comp.musteriUnvani}
                        </p>
                        <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {comp.adres}
                        </p>
                      </div>

                      <span className={`text-xs shrink-0 ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
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
                onViewAllFromCity={(city) => onFilterChange({ sehir: city })}
                onSelectCompany={onSelectCompany}
                allCompanies={companies}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
