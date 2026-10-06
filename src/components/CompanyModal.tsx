import React from 'react';
import { Company } from '../types/company';
import { CompanyCard } from './CompanyCard';
import { X, ArrowRight } from 'lucide-react';

interface CompanyModalProps {
  company: Company | null;
  onClose: () => void;
  onGoToCardPage: (company: Company) => void;
  allCompanies: Company[];
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  company,
  onClose,
  onGoToCardPage,
  allCompanies,
}) => {
  if (!company) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/40 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-lg overflow-hidden z-10 border border-zinc-200 my-8">
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => onGoToCardPage(company)}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium flex items-center gap-1 transition-colors"
            title="Kart Sayfasında Aç"
          >
            <span>Sayfada Aç</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-0">
          <CompanyCard
            company={company}
            onSelectCompany={(c) => onGoToCardPage(c)}
            allCompanies={allCompanies}
          />
        </div>
      </div>
    </div>
  );
};
