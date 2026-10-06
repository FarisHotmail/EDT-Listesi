import React from 'react';
import { 
  Building2, 
  Search, 
  Table 
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'search' | 'table';
  onTabChange: (tab: 'search' | 'table') => void;
  totalCompaniesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  totalCompaniesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          {/* Brand */}
          <div 
            onClick={() => onTabChange('search')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base text-zinc-900 tracking-tight">
                EDT Rehberi
              </span>
            </div>
          </div>

          {/* Minimal 2-Page Tabs Switcher */}
          <nav className="flex items-center p-0.5 bg-zinc-100 rounded-lg border border-zinc-200/80">
            <button
              onClick={() => onTabChange('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Şirket Kartı</span>
            </button>

            <button
              onClick={() => onTabChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'table'
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tüm Liste</span>
              <span className="ml-1 text-[11px] text-zinc-400 font-mono">
                {totalCompaniesCount}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
