import { useState, useEffect } from 'react';
import { Company, SearchFilters } from './types/company';
import { INITIAL_COMPANIES } from './data/initialData';
import { Navbar } from './components/Navbar';
import { SearchPage } from './components/SearchPage';
import { TablePage } from './components/TablePage';
import { CompanyModal } from './components/CompanyModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { subscribeToCompanies, saveCompaniesToFirestore } from './firebase/companyService';
import { CheckCircle2, Cloud } from 'lucide-react';

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
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sehir: '',
    ilce: '',
    tabelaUnvani: '',
    musteriUnvani: '',
    adres: '',
  });

  // Subscribe to real-time Firestore database updates across all computers
  useEffect(() => {
    const unsubscribe = subscribeToCompanies(
      (firestoreCompanies, updatedAt) => {
        if (firestoreCompanies && firestoreCompanies.length > 0) {
          setCompanies(firestoreCompanies);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreCompanies));
          } catch {
            // ignore
          }
          if (updatedAt) {
            setLastSyncTime(new Date(updatedAt).toLocaleTimeString('tr-TR'));
          }
        }
      },
      (err) => {
        console.warn('Real-time sync notice:', err.message);
      }
    );

    return () => unsubscribe();
  }, []);

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

  const handleExcelImportSuccess = async (newCompanies: Company[]) => {
    // 1. Save to central Firestore Cloud Database so all users/computers see it
    const success = await saveCompaniesToFirestore(newCompanies);

    // 2. Update local state & localStorage
    setCompanies(newCompanies);
    setSelectedCompany(newCompanies[0]);
    handleResetFilters();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCompanies));
    } catch {
      // ignore
    }

    if (success) {
      setToastMessage(`Bulut veritabanına kaydedildi: ${newCompanies.length} kayıt tüm kullanıcılarda güncellendi.`);
    } else {
      setToastMessage(`Yerel liste güncellendi: ${newCompanies.length} kayıt yüklendi.`);
    }

    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleResetToDefault = async () => {
    await saveCompaniesToFirestore(INITIAL_COMPANIES);
    setCompanies(INITIAL_COMPANIES);
    setSelectedCompany(INITIAL_COMPANIES[0]);
    handleResetFilters();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setToastMessage('Varsayılan liste geri yüklendi ve buluta aktarıldı.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 antialiased">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalCompaniesCount={companies.length}
        onOpenExcelImport={() => setIsExcelModalOpen(true)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-[3px] text-xs font-medium shadow-md flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

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
            onOpenExcelImport={() => setIsExcelModalOpen(true)}
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
      />

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportSuccess={handleExcelImportSuccess}
        onResetToDefault={handleResetToDefault}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">EDT Rehberi • Faris</span>
            {lastSyncTime && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <Cloud className="w-3 h-3 text-emerald-600" />
                <span>Canlı Senkron: {lastSyncTime}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 underline font-medium transition-colors"
            >
              Excel ile Listeyi Güncelle
            </button>
            <span>•</span>
            <span className="text-slate-400">
              {companies.length} Kayıt
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
