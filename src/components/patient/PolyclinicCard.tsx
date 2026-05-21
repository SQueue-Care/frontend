// src/components/patient/PolyclinicCard.tsx
import React from 'react';

interface PolyclinicCardProps {
  name: string;
  description: string;
  status: string;
  percentage: string;
  colorClass: string;
  onClick: () => void;
}

export default function PolyclinicCard({ 
  name, 
  description, 
  status, 
  percentage, 
  colorClass, 
  onClick 
}: PolyclinicCardProps) {
  
  const colors = {
    rose: { bg: 'bg-rose-50/80 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20', text: 'text-rose-700 dark:text-rose-400', bar: 'bg-rose-500 dark:bg-rose-400', indicator: 'bg-rose-500 dark:bg-rose-400' },
    amber: { bg: 'bg-amber-50/80 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', bar: 'bg-amber-400', indicator: 'bg-amber-500 dark:bg-amber-400' },
    emerald: { bg: 'bg-emerald-50/80 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', bar: 'bg-emerald-500 dark:bg-emerald-400', indicator: 'bg-emerald-500 dark:bg-emerald-400' },
  }[colorClass as 'rose' | 'amber' | 'emerald'] || { bg: 'bg-slate-50/80 dark:bg-zinc-800/50', border: 'border-slate-100 dark:border-zinc-700', text: 'text-slate-700 dark:text-zinc-400', bar: 'bg-slate-400', indicator: 'bg-slate-400' };

  return (
    <div 
      onClick={onClick} 
      className="bg-white dark:bg-[#1e1f20] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/5 hover:border-teal-200 dark:hover:border-teal-900/50 transition-all duration-300 group cursor-pointer flex flex-col h-full relative overflow-hidden"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800/50 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold text-zinc-950 dark:text-zinc-100 font-['Manrope'] tracking-tight pt-1">
          {name}
        </h3>
      </div>
      
      <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed flex-1">
        {description}
      </p>
      
      <div className={`mt-auto mb-6 ${colors.bg} border ${colors.border} rounded-2xl p-4 transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-500 dark:text-zinc-400 tracking-widest uppercase">Kapasitas Poli</span>
          
          </div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#131314] px-2 py-1 rounded-md border border-white/50 dark:border-zinc-800 shadow-sm">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${colors.indicator}`}></span>
            <span className={`text-[9px] font-black uppercase tracking-wider ${colors.text}`}>{status}</span>
          </div>
        </div>
        
        <div className="w-full h-1.5 bg-white/60 dark:bg-zinc-800/60 rounded-full overflow-hidden shadow-inner">
          <div className={`h-full ${colors.bar} rounded-full transition-all duration-1000 ease-out`} style={{ width: percentage }} />
        </div>
      </div>

      <div className="flex justify-between items-center pt-5 border-t border-slate-100 dark:border-zinc-800 group-hover:border-teal-100 dark:group-hover:border-teal-900/50 transition-colors duration-300">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-3 py-1.5 rounded-lg">
          Buka Hari Ini
        </span>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-[#131314] text-slate-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-zinc-800 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 shadow-sm transition-all duration-300">
          <span>Ambil Antrean</span>
          <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}