// src/components/ui/CustomSelect.tsx
import { useState } from 'react'

interface CustomSelectProps {
  label: string
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

export default function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOpt = options.find((o) => o.value === value)
  const isFloating = isOpen || !!selectedOpt

  return (
    <div className="relative w-full pt-2">
      {/* Penyelarasan Struktur Pembungkus */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-zinc-900 shadow-sm transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-100 dark:focus:border-teal-600"
        >
          <span className="text-sm text-zinc-900 dark:text-zinc-100">
            {selectedOpt ? selectedOpt.label : placeholder}
          </span>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform dark:text-zinc-500 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>

        <label
          className={`pointer-events-none absolute left-3 z-10 rounded-sm px-1.5 transition-all duration-200 ease-in-out ${ isFloating ? 'top-0 -translate-y-1/2 text-[10px] bg-white text-teal-600 dark:bg-[#1e1f20] dark:text-teal-400' : 'top-1/2 -translate-y-1/2 text-sm bg-transparent text-slate-500 dark:text-zinc-500' }`}
        >
          {label}
        </label>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="animate-in fade-in zoom-in-95 absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl duration-200 dark:border-zinc-800 dark:bg-[#1e1f20]">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${ value === opt.value ? 'bg-teal-50 text-teal-700 dark:bg-[#131314] dark:text-teal-400' : 'text-zinc-900 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800/80' }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
