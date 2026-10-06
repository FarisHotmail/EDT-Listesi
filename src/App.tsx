import { useState, useEffect } from 'react';
import { Company, SearchFilters } from './types/company';
import { INITIAL_COMPANIES, parseCSVToCompanies } from './data/initialData';
import { Navbar } from './components/Navbar';
import { SearchPage } from './components/SearchPage';
import { TablePage } from './components/TablePage';
import { CompanyModal } from './components/CompanyModal';
import { GoogleSheetsGuideModal } from './components/GoogleSheetsGuideModal';

const STORAGE_KEY = 'company_directory_data_v1';

export default function App() {
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_COMPANIES;
  });

  const [activeTab, setActiveTab] = useState<'search' | 'table'>('search');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(() => {
    return companies.length > 0 ? companies[0] : null;
  });

  const [modalCompany, setModalCompany] = useState<Company | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sehir: '',
    ilce: '',
    tabelaUnvani: '',
    musteriUnvani: '',
    adres: '',
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
    } catch (e) {
      console.warn('Failed to save companies to localStorage', e);
    }
  }, [companies]);

  // Update selectedCompany if current becomes invalid
  useEffect(() => {
    if (!selectedCompany && companies.length > 0) {
      setSelectedCompany(companies[0]);
    }
  }, [companies, selectedCompany]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      sehir: '',
      ilce: '',
      tabelaUnvani: '',
      musteriUnvani: '',
      adres: '',
    });
  };

  const handleNavigateToCardView = (company: Company) => {
    setSelectedCompany(company);
    setActiveTab('search');
  };

  // Live import from Google Sheets published CSV URL
  const handleImportCsvUrl = async (url: string): Promise<boolean> => {
    try {
      // Ensure url is trimmed
      const targetUrl = url.trim();
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error('Ağ yanıtı başarısız');
      const csvText = await response.text();
      const parsed = parseCSVToCompanies(csvText);
      if (parsed.length > 0) {
        setCompanies(parsed);
        setSelectedCompany(parsed[0]);
        handleResetFilters();
        return true;
      }
      return false;
    } catch (err) {
      console.error('CSV fetching error:', err);
      return false;
    }
  };

  const handleResetToDefault = () => {
    setCompanies(INITIAL_COMPANIES);
    setSelectedCompany(INITIAL_COMPANIES[0]);
    handleResetFilters();
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalCompaniesCount={companies.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        {activeTab === 'search' ? (
          <SearchPage
            companies={companies}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onNavigateToTable={() => setActiveTab('table')}
          />
        ) : (
          <TablePage
            companies={companies}
            onSelectCompany={setSelectedCompany}
            onOpenModal={setModalCompany}
            onNavigateToCardView={handleNavigateToCardView}
          />
        )}
      </main>

      {/* Quick Preview Modal from Table */}
      <CompanyModal
        company={modalCompany}
        onClose={() => setModalCompany(null)}
        onGoToCardPage={(comp) => {
          setModalCompany(null);
          handleNavigateToCardView(comp);
        }}
        allCompanies={companies}
      />

      {/* Google Sheets Guide & Live Sync Modal */}
      <GoogleSheetsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onImportCsvUrl={handleImportCsvUrl}
        onResetToDefault={handleResetToDefault}
      />

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white py-5 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700">EDT Rehberi</span>
            <span>•</span>
            <span>Faris</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-400">
              {companies.length} Kayıt
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
