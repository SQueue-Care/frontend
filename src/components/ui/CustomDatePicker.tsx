// src/components/ui/CustomDatePicker.tsx
import { useState } from 'react'

interface CustomDatePickerProps {
  label: string
  value: string
  onChange: (val: string) => void
}

export default function CustomDatePicker({ label, value, onChange }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
  const isFloating = isOpen || !!value

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()

  const handleDateSelect = (day: number) => {
    const newDate = new Date(Date.UTC(viewDate.getFullYear(), viewDate.getMonth(), day))
    onChange(newDate.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const changeMonth = (offset: number) =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1))
  const changeYear = (offset: number) =>
    setViewDate(new Date(viewDate.getFullYear() + offset, viewDate.getMonth(), 1))

  const displayValue = value
    ? new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <div className="relative w-full pt-2">
      {/* Penyelarasan Struktur Pembungkus */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm text-zinc-900 shadow-sm transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-100 dark:focus:border-teal-600"
        >
          <span className="text-sm text-zinc-900 dark:text-zinc-100">
            {displayValue}
          </span>
          <svg
            className="h-4 w-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
          <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-1.5 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl duration-200 sm:right-auto sm:left-0 dark:border-zinc-800 dark:bg-[#1e1f20]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => changeYear(-1)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  title="Tahun Sebelumnya"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    ></path>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  title="Bulan Sebelumnya"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="text-sm tracking-widest text-zinc-900 uppercase dark:text-zinc-100">
                {viewDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  title="Bulan Selanjutnya"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => changeYear(1)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  title="Tahun Selanjutnya"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] text-slate-400 dark:text-zinc-600"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = new Date(Date.UTC(viewDate.getFullYear(), viewDate.getMonth(), day))
                  .toISOString()
                  .split('T')[0]
                const isSelected = value === dateStr
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`flex aspect-square w-full items-center justify-center rounded-lg text-sm transition-all outline-none ${ isSelected ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20' : 'text-zinc-900 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800' }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
