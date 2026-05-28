// src/components/ui/CustomSearchBar.tsx
import { useState } from 'react'

interface CustomSearchBarProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function CustomSearchBar({
  label,
  value,
  onChange,
  placeholder = '',
}: CustomSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const isFloating = isFocused || value.length > 0

  return (
    <div className="relative w-full pt-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          className="relative z-10 w-full rounded-xl border border-slate-200 bg-white py-3.5 pr-14 pl-4 text-sm text-zinc-900 shadow-sm transition-all outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-teal-600"
        />

        <label
          className={`pointer-events-none absolute left-3 z-20 rounded-sm px-1.5 transition-all duration-200 ease-in-out ${ isFloating ? 'top-0 -translate-y-1/2 text-[10px] bg-white text-teal-600 dark:bg-[#1e1f20] dark:text-teal-400' : 'top-1/2 -translate-y-1/2 text-sm bg-transparent text-slate-500 dark:text-zinc-500' }`}
        >
          {label}
        </label>
        <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-3">
          {value.length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange('')
              }}
              className="mr-1 p-1 text-slate-400 transition-colors outline-none hover:text-rose-500 dark:hover:text-rose-400"
              title="Bersihkan Pencarian"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          )}

          <div
            className={`pointer-events-none flex items-center justify-center transition-colors ${isFocused ? 'text-teal-500 dark:text-teal-400' : 'text-slate-400 dark:text-zinc-500'}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
