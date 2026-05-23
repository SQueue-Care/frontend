// src/components/StatCard.tsx

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
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-xl bg-teal-50 p-3 text-teal-600">{icon}</div>
        {trend && (
          <span
            className={`rounded-lg px-2 py-1 text-xs font-bold ${
              trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">{title}</p>
        <h3 className="mb-1 font-['Manrope'] text-2xl font-extrabold text-zinc-950">{value}</h3>
        <p className="text-[11px] font-medium text-slate-400">{description}</p>
      </div>
    </div>
  )
}
