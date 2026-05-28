// src/components/ui/StatCard.tsx

interface StatCardProps {
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  description: string
}

export default function StatCard({ title, value, icon, trend, description }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl dark:border-zinc-800 dark:bg-[#1e1f20] dark:hover:border-teal-500/30">
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-xl bg-teal-50 p-3 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">{icon}</div>
        {trend && (
          <span
            className={`rounded-lg px-2 py-1 text-xs ${ trend.isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="mb-1 text-xs tracking-wider text-slate-500 uppercase dark:text-zinc-400">{title}</p>
        <h3 className="mb-1 font-['Manrope'] text-2xl text-zinc-950 dark:text-zinc-100">{value}</h3>
        <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">{description}</p>
      </div>
    </div>
  )
}
