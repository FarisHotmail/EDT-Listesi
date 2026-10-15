import React from 'react';
import { 
  Building2, 
  Search, 
  Table,
  FileSpreadsheet
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'search' | 'table';
  onTabChange: (tab: 'search' | 'table') => void;
  totalCompaniesCount: number;
  onOpenExcelImport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  totalCompaniesCount,
  onOpenExcelImport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          {/* Brand */}
          <div 
            onClick={() => onTabChange('search')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 rounded-[4px] bg-slate-800 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                EDT Rehberi • Faris
              </span>
            </div>
          </div>

          {/* 2-Page Tabs Switcher */}
          <nav className="flex items-center p-1 bg-slate-100 rounded-[4px] border border-slate-200">
            <button
              onClick={() => onTabChange('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-white text-slate-900 font-semibold border border-slate-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Şirket Kartı</span>
            </button>

            <button
              onClick={() => onTabChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-medium transition-colors ${
                activeTab === 'table'
                  ? 'bg-white text-slate-900 font-semibold border border-slate-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tüm Liste</span>
              <span className="ml-1 text-[11px] text-slate-500 font-mono">
                {totalCompaniesCount}
              </span>
            </button>
          </nav>

          {/* Excel Import Button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onOpenExcelImport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-medium transition-colors shadow-2xs"
              title="Excel Dosyası ile Listeyi Güncelle"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Excel ile Güncelle</span>
              <span className="sm:hidden">Excel</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
