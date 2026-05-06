// src/components/StatCard.tsx

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  description: string;
}

export default function StatCard({ title, value, icon, trend, description }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
            trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">{value}</h3>
        <p className="text-slate-400 text-[11px] font-medium">{description}</p>
      </div>
    </div>
  );
}