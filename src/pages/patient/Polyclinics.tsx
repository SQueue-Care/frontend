import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import CustomSearchBar from '../../components/ui/CustomSearchBar'
import type { Department } from '../../lib/types'
import { useDepartmentStore } from '../../store/departmentStore'
import type { PatientPortalContext } from './Portal'

const DEFAULT_HOURS = 'Senin–Jumat, 08.00–16.00 WIB'

const getQueueDensity = (activeCount = 0) => {
  const maxCapacity = 30
  const percentage = `${Math.min(Math.round((activeCount / maxCapacity) * 100), 100)}%`
  if (activeCount <= 10)
    return { status: `${activeCount} Antrean (Sepi)`, color: 'emerald', percentage }
  if (activeCount <= 18)
    return { status: `${activeCount} Antrean (Sedang)`, color: 'amber', percentage }
  return { status: `${activeCount} Antrean (Ramai)`, color: 'rose', percentage }
}

export default function PatientPolyclinics() {
  const { openBooking } = useOutletContext<PatientPortalContext>()
  const { departments, isLoading } = useDepartmentStore()
  const [searchQuery, setSearchQuery] = useState('')

  const polyclinics = useMemo(
    () =>
      departments
        .map((dept: Department & { activeQueueCount?: number }) => {
          const density = getQueueDensity(dept.activeQueueCount ?? 0)
          return {
            id: dept.id,
            code: dept.code,
            name: dept.name,
            description: dept.description ?? 'Layanan poliklinik rumah sakit.',
            hours: DEFAULT_HOURS,
            ...density,
          }
        })
        .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [departments, searchQuery]
  )

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="mb-2 text-sm font-bold text-teal-700 dark:text-teal-400">
            Informasi layanan
          </p>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Daftar poliklinik aktif beserta jam operasional standar. Status antrean diperbarui
            secara berkala dari sistem.
          </p>
        </div>
        <div className="w-full shrink-0 md:w-80">
          <CustomSearchBar
            label="Cari Poliklinik"
            placeholder="Contoh: Poli Anak..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center font-bold text-slate-500 dark:text-slate-400">
          Memuat data poliklinik...
        </div>
      ) : polyclinics.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center dark:border-zinc-800 dark:bg-[#1e1f20]">
          <p className="font-medium text-slate-500 dark:text-slate-400">
            Tidak ada poliklinik yang cocok dengan pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {polyclinics.map((poli) => (
            <article
              key={poli.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]"
            >
              <div className="border-b border-slate-100 p-6 dark:border-zinc-800">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <h2 className="font-['Manrope'] text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                    {poli.name}
                  </h2>
                  <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-black tracking-widest text-slate-600 uppercase dark:bg-zinc-900 dark:text-zinc-400">
                    {poli.code}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {poli.description}
                </p>
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-zinc-800 dark:bg-[#131314]/50">
                  <p className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-zinc-500">
                    Jam Operasional
                  </p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{poli.hours}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-zinc-800 dark:bg-[#131314]/50">
                  <p className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-zinc-500">
                    Status Antrean
                  </p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{poli.status}</p>
                </div>
              </div>
              <div className="border-t border-slate-100 p-6 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => openBooking(poli.id, poli.name)}
                  className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-700 active:scale-[0.98]"
                >
                  Ambil Antrean / Reservasi
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
