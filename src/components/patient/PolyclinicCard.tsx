// src/components/patient/PolyclinicCard.tsx

interface PolyclinicCardProps {
  name: string
  description: string
  status: string
  percentage: string
  colorClass: string
  onClick: () => void
}

export default function PolyclinicCard({
  name,
  description,
  status,
  percentage,
  colorClass,
  onClick,
}: PolyclinicCardProps) {
  const colors = {
    rose: {
      bg: 'bg-rose-50/80 dark:bg-rose-500/10',
      border: 'border-rose-100 dark:border-rose-500/20',
      text: 'text-rose-700 dark:text-rose-400',
      bar: 'bg-rose-500 dark:bg-rose-400',
      indicator: 'bg-rose-500 dark:bg-rose-400',
    },
    amber: {
      bg: 'bg-amber-50/80 dark:bg-amber-500/10',
      border: 'border-amber-100 dark:border-amber-500/20',
      text: 'text-amber-700 dark:text-amber-400',
      bar: 'bg-amber-400',
      indicator: 'bg-amber-500 dark:bg-amber-400',
    },
    emerald: {
      bg: 'bg-emerald-50/80 dark:bg-emerald-500/10',
      border: 'border-emerald-100 dark:border-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      bar: 'bg-emerald-500 dark:bg-emerald-400',
      indicator: 'bg-emerald-500 dark:bg-emerald-400',
    },
  }[colorClass as 'rose' | 'amber' | 'emerald'] || {
    bg: 'bg-slate-50/80 dark:bg-zinc-800/50',
    border: 'border-slate-100 dark:border-zinc-700',
    text: 'text-slate-700 dark:text-zinc-400',
    bar: 'bg-slate-400',
    indicator: 'bg-slate-400',
  }

  return (
    <div
      onClick={onClick}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 md:p-8 dark:border-zinc-800 dark:bg-[#1e1f20] dark:hover:border-teal-900/50"
    >
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-600 transition-colors duration-300 group-hover:bg-teal-600 group-hover:text-white dark:border-teal-800/50 dark:bg-teal-900/30 dark:text-teal-400">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="pt-1 font-['Manrope'] text-xl font-extrabold tracking-tight text-zinc-950 md:text-2xl dark:text-zinc-100">
          {name}
        </h3>
      </div>

      <p className="mb-6 flex-1 text-xs leading-relaxed text-slate-500 md:text-sm dark:text-zinc-400">
        {description}
      </p>

      <div
        className={`mt-auto mb-6 ${colors.bg} border ${colors.border} rounded-2xl p-4 transition-colors duration-300`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase dark:text-zinc-400">
              Kapasitas Poli
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-white/50 bg-white px-2 py-1 shadow-sm dark:border-zinc-800 dark:bg-[#131314]">
            <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${colors.indicator}`}></span>
            <span className={`text-[9px] font-black tracking-wider uppercase ${colors.text}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/60 shadow-inner dark:bg-zinc-800/60">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: percentage }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-5 transition-colors duration-300 group-hover:border-teal-100 dark:border-zinc-800 dark:group-hover:border-teal-900/50">
        <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold tracking-widest text-emerald-700 uppercase dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
          Buka Hari Ini
        </span>

        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black tracking-widest text-slate-400 uppercase shadow-sm transition-all duration-300 group-hover:border-teal-600 group-hover:bg-teal-600 group-hover:text-white dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-500">
          <span>Ambil Antrean</span>
          <svg
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  )
}
