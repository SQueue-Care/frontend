// src/components/ui/CustomInput.tsx
import React, { useState } from 'react';

interface CustomInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'tel';
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
}

export default function CustomInput({ 
  label, 
  value, 
  onChange, 
  placeholder = "", 
  type = "text", 
  maxLength,
  multiline = false,
  rows = 2
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value.length > 0;

  return (
    <div className="relative w-full pt-2">
      <div className="relative">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={rows}
            placeholder={isFocused ? placeholder : ""}
            className="w-full px-3 py-2.5 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={maxLength}
            placeholder={isFocused ? placeholder : ""}
            className="w-full px-3 py-2.5 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-700 focus:border-teal-500 dark:focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm"
          />
        )}
        
        {/* IMPLEMENTASI FIX: top-0 -translate-y-1/2 mengunci label tepat di atas garis border */}
        <label
          className={`absolute left-3 text-xs font-bold transition-all duration-200 ease-in-out pointer-events-none px-1.5 z-10 rounded-sm
            ${isFloating 
              ? 'top-0 -translate-y-1/2 text-teal-600 dark:text-teal-400 bg-white dark:bg-[#1e1f20]' 
              : multiline
                ? 'top-3 translate-y-0 text-slate-500 dark:text-zinc-500 bg-transparent'
                : 'top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-500 bg-transparent'
            }`}
        >
          {label}
        </label>
      </div>
    </div>
  );
}