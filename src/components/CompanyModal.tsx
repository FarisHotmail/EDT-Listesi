import React from 'react';
import { Company } from '../types/company';
import { CompanyCard } from './CompanyCard';
import { X, ArrowRight } from 'lucide-react';

interface CompanyModalProps {
  company: Company | null;
  onClose: () => void;
  onGoToCardPage: (company: Company) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  company,
  onClose,
  onGoToCardPage,
}) => {
  if (!company) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      
      <div className="relative bg-white rounded-[4px] max-w-2xl w-full shadow-lg overflow-hidden z-10 border border-slate-300 my-8">
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
          <button
            onClick={() => onGoToCardPage(company)}
            className="px-2.5 py-1 rounded-[3px] bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium flex items-center gap-1 transition-colors border border-slate-200"
            title="Kart Sayfasında Aç"
          >
            <span>Sayfada Aç</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-[3px] hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-0">
          <CompanyCard
            company={company}
          />
        </div>
      </div>
    </div>
  );
};
