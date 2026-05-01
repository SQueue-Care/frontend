// src/components/PolyclinicCard.tsx

interface PolyclinicCardProps {
  name: string;
  description: string;
  status: string; // Misal: "Sangat Ramai", "Normal", "Sepi"
  percentage: string; // Misal: "90%", "50%", "15%"
  colorClass: string; // Misal: "rose", "amber", "emerald"
  onClick: () => void;
}

export default function PolyclinicCard({ 
  name, 
  description, 
  status, 
  percentage, 
  colorClass, 
  onClick 
}: PolyclinicCardProps) {
  
  // Mapping warna dinamis berdasarkan prop colorClass
  const colors = {
    rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', bar: 'bg-rose-500', shadow: 'shadow-rose-500/40' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', bar: 'bg-amber-400', shadow: 'shadow-amber-400/40' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  }[colorClass as 'rose' | 'amber' | 'emerald'] || { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', bar: 'bg-slate-500', shadow: '' };

  return (
    <div onClick={onClick} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-900/5 hover:border-teal-100 transition-all duration-300 group cursor-pointer flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
        <h3 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tight">{name}</h3>
      </div>
      <p className="text-sm text-slate-600 mb-8 leading-relaxed">{description}</p>
      
      <div className={`mt-auto mb-8 ${colors.bg} border ${colors.border} rounded-2xl p-5`}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Tingkat Antrean (AI)</span>
          <span className={`text-xs font-bold ${colors.text} bg-white px-2.5 py-1 rounded-full shadow-sm`}>{status}</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div className={`h-full ${colors.bar} rounded-full ${colors.shadow}`} style={{ width: percentage }} />
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-lg">Buka Hari Ini</span>
        <span className="text-sm font-bold text-teal-600 group-hover:translate-x-1.5 transition-transform duration-300">Ambil Antrean →</span>
      </div>
    </div>
  );
}