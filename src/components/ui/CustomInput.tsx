// src/components/ui/CustomInput.tsx
import { useState } from 'react'

interface CustomInputProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'tel'
  maxLength?: number
  multiline?: boolean
  rows?: number
}

export default function CustomInput({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  maxLength,
  multiline = false,
  rows = 2,
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const isFloating = isFocused || value.length > 0

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
            placeholder={isFocused ? placeholder : ''}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-900 shadow-sm transition-all outline-none placeholder:text-slate-400 dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-100 dark:placeholder:text-zinc-600"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={maxLength}
            placeholder={isFocused ? placeholder : ''}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-900 shadow-sm transition-all outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-[#1e1f20] dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-teal-600"
          />
        )}

        {/* IMPLEMENTASI FIX: top-0 -translate-y-1/2 mengunci label tepat di atas garis border */}
        <label
          className={`pointer-events-none absolute left-3 z-10 rounded-sm px-1.5 text-xs font-bold transition-all duration-200 ease-in-out ${
            isFloating
              ? 'top-0 -translate-y-1/2 bg-white text-teal-600 dark:bg-[#1e1f20] dark:text-teal-400'
              : multiline
                ? 'top-3 translate-y-0 bg-transparent text-slate-500 dark:text-zinc-500'
                : 'top-1/2 -translate-y-1/2 bg-transparent text-slate-500 dark:text-zinc-500'
          }`}
        >
          {label}
        </label>
      </div>
    </div>
  )
}
