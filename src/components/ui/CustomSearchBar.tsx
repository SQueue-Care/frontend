// src/components/ui/CustomSearchBar.tsx
import React, { useState } from 'react';

interface CustomSearchBarProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function CustomSearchBar({ label, value, onChange, placeholder = "" }: CustomSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value.length > 0;

  return (
    <div className="relative w-full pt-2">
      <div className="relative">
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ""}
          className="w-full pl-3 pr-14 py-2.5 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 focus:border-teal-500 dark:focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm relative z-10"
        />
        
        <label
          className={`absolute left-3 text-xs font-bold transition-all duration-200 ease-in-out pointer-events-none px-1.5 rounded-sm z-20
            ${isFloating 
              ? 'top-0 -translate-y-1/2 text-teal-600 dark:text-teal-400 bg-white dark:bg-[#1e1f20]' 
              : 'top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-500 bg-transparent'
            }`}
        >
          {label}
        </label>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-20">
          {value.length > 0 && (
             <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange("");
                }}
                className="p-1 mr-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 outline-none transition-colors"
                title="Bersihkan Pencarian"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
          )}

          <div className={`pointer-events-none flex items-center justify-center transition-colors ${isFocused ? 'text-teal-500 dark:text-teal-400' : 'text-slate-400 dark:text-zinc-500'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

        </div>

      </div>
    </div>
  );
}