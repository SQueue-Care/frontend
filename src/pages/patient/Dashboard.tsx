import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import LiveQueueTracker from '../../components/patient/LiveQueueTracker'
import PolyclinicCard from '../../components/patient/PolyclinicCard'
import CustomSearchBar from '../../components/ui/CustomSearchBar'
import type { Department } from '../../lib/types'
import { useDepartmentStore } from '../../store/departmentStore'
import type { PatientPortalContext } from './Portal'

const getQueueDensity = (activeCount = 0) => {
  const maxCapacity = 30
  const percentage = `${Math.min(Math.round((activeCount / maxCapacity) * 100), 100)}%`
  if (activeCount <= 10)
    return { status: `${activeCount} Antrean (Sepi)`, color: 'emerald', percentage }
  if (activeCount <= 18)
    return { status: `${activeCount} Antrean (Sedang)`, color: 'amber', percentage }
  return { status: `${activeCount} Antrean (Ramai)`, color: 'rose', percentage }
}

export default function PatientDashboard() {
  const { openBooking, activeQueueId, setActiveQueueOverride } =
    useOutletContext<PatientPortalContext>()
  const { departments, isLoading: isDeptLoading } = useDepartmentStore()
  const [searchQuery, setSearchQuery] = useState('')

  const polyclinics = useMemo(
    () =>
      departments
        .map((dept: Department & { activeQueueCount?: number }) => {
          const density = getQueueDensity(dept.activeQueueCount ?? 0)
          return {
            id: dept.id,
            name: dept.name,
            description: dept.description ?? 'Tidak ada deskripsi.',
            ...density,
          }
        })
        .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [departments, searchQuery]
  )

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-xl">
          <h1 className="mb-2.5 font-['Manrope'] text-3xl font-extrabold tracking-tighter text-zinc-950 transition-colors md:text-4xl dark:text-white">
            Pilih Layanan Poliklinik
          </h1>
          <p className="text-base leading-relaxed text-slate-600 transition-colors dark:text-slate-400">
            Cek status keramaian poli secara{' '}
            <span className="font-semibold text-teal-700 dark:text-teal-400">real-time</span>{' '}
            sebelum mengambil nomor antrean.
          </p>
        </div>
        <div className="w-full shrink-0 md:w-80">
          <CustomSearchBar
            label="Cari Layanan Medis"
            placeholder="Contoh: Poli Gigi..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      <LiveQueueTracker
        queueId={activeQueueId}
        onCancelSuccess={() => setActiveQueueOverride(null)}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isDeptLoading ? (
          <div className="col-span-full py-10 text-center font-bold text-slate-500 transition-colors dark:text-slate-400">
            Memuat data layanan poliklinik...
          </div>
        ) : polyclinics.length > 0 ? (
          polyclinics.map((poli, index) => (
            <div
              key={poli.id}
              className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
            >
              <PolyclinicCard
                name={poli.name}
                description={poli.description}
                status={poli.status}
                percentage={poli.percentage}
                colorClass={poli.color}
                onClick={() => openBooking(poli.id, poli.name)}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-[#1e1f20] dark:text-zinc-500">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Layanan tidak ditemukan
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Kami tidak menemukan poliklinik dengan kata kunci "{searchQuery}".
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
