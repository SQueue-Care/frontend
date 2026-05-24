import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PatientQueues from './Queues'
import PatientReservations from './Reservations'

type VisitTab = 'queues' | 'reservations'

export default function PatientVisitHistory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: VisitTab =
    tabParam === 'reservations' || tabParam === 'queues' ? tabParam : 'queues'

  useEffect(() => {
    if (!tabParam) {
      setSearchParams({ tab: 'queues' }, { replace: true })
    }
  }, [tabParam, setSearchParams])

  const setTab = (tab: VisitTab) => {
    setSearchParams({ tab }, { replace: true })
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-700 ease-out">
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Arsip reservasi dan antrean kunjungan Anda dalam satu tempat.
        </p>
      </div>

      <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50/80 p-1 dark:border-zinc-800 dark:bg-[#131314]">
        <button
          type="button"
          onClick={() => setTab('queues')}
          className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === 'queues'
              ? 'bg-white text-teal-700 shadow-sm dark:bg-[#1e1f20] dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Riwayat Antrean
        </button>
        <button
          type="button"
          onClick={() => setTab('reservations')}
          className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === 'reservations'
              ? 'bg-white text-teal-700 shadow-sm dark:bg-[#1e1f20] dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Jadwal Reservasi
        </button>
      </div>

      {activeTab === 'queues' ? <PatientQueues embedded /> : <PatientReservations embedded />}
    </div>
  )
}
