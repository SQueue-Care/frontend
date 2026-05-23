// src/components/ui/CustomSelect.tsx
import React, { useState } from 'react';

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

export default function CustomSelect({ value, onChange, options, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOpt = options.find((o) => o.value === value);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 focus:border-teal-500 dark:focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 rounded-lg text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none transition-all flex justify-between items-center shadow-sm"
      >
        <span className={selectedOpt ? '' : 'text-slate-400 dark:text-zinc-600'}>
          {selectedOpt ? selectedOpt.label : placeholder}
        </span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                  value === opt.value
                    ? 'bg-teal-50 dark:bg-[#131314] text-teal-700 dark:text-teal-400'
                    : 'text-zinc-900 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}