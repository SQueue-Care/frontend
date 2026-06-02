import { useEffect, useState } from 'react'
import DoctorNotesDisplay from '../shared/DoctorNotesDisplay'
import { usePatientStore } from '../../store/patientStore'
import CustomSearchBar from '../ui/CustomSearchBar'

export default function DoctorPatientHistorySearch() {
  const { patients, pagination, isLoading, medicalProfile, fetchPatients, fetchMedicalProfile } =
    usePatientStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPatients({ page, pageSize: 10, search: search.trim() || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchPatients, page, search])

  const handleSelect = async (patientId: string) => {
    setSelectedId(patientId)
    await fetchMedicalProfile(patientId)
  }

  const patient = medicalProfile?.patient
  const history = medicalProfile?.medicalHistory ?? []

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div>
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 transition-colors dark:text-zinc-100">Riwayat Pasien</h1>
        <p className="text-slate-600 transition-colors dark:text-zinc-300">Cari pasien dan lihat kunjungan selesai beserta catatan dokter.</p>
      </div>

      <div className="w-full max-w-xl">
        <CustomSearchBar
          label="Cari Pasien"
          value={search}
          onChange={(val) => { setSearch(val); setPage(1) }}
          placeholder="Nama, email, NIK, atau nomor BPJS..."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 transition-colors dark:border-zinc-800 bg-white transition-colors dark:bg-[#1e1f20] shadow-sm lg:col-span-1">
          {isLoading && !patients.length ? (
            <div className="flex justify-center py-12">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : patients.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500 transition-colors dark:text-zinc-400">Tidak ada pasien.</p>
          ) : (
            <ul className="divide-y divide-slate-100 transition-colors dark:divide-zinc-800">
              {patients.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(p.id)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 ${selectedId === p.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                  >
                    <p className="text-zinc-900 transition-colors dark:text-zinc-100">{p.user.name}</p>
                    <p className="text-xs text-slate-500 transition-colors dark:text-zinc-400">{p.nik || p.user.email}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 border-t border-slate-100 transition-colors dark:border-zinc-800 py-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs disabled:opacity-40"
              >
                ←
              </button>
              <span className="text-xs text-slate-500 transition-colors dark:text-zinc-400">{page}/{pagination.totalPages}</span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {!selectedId ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 transition-colors dark:border-zinc-800 bg-slate-50 transition-colors dark:bg-[#131314] text-sm text-slate-500 transition-colors dark:text-zinc-400">
              Pilih pasien untuk melihat riwayat
            </div>
          ) : isLoading && !patient ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : patient ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 transition-colors dark:border-zinc-800 bg-white transition-colors dark:bg-[#1e1f20] p-5 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 transition-colors dark:text-zinc-100">{patient.user.name}</h2>
                <p className="text-sm text-slate-500 transition-colors dark:text-zinc-400">
                  {patient.bpjsNumber ? `BPJS: ${patient.bpjsNumber}` : 'Pasien umum'}
                  {patient.allergies && ` · Alergi: ${patient.allergies}`}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 transition-colors dark:border-zinc-800 bg-white transition-colors dark:bg-[#1e1f20] p-5 shadow-sm">
                <h3 className="mb-3 text-zinc-900 transition-colors dark:text-zinc-100">Kunjungan Selesai ({history.length})</h3>
                {history.length === 0 ? (
                  <p className="text-sm italic text-slate-500 transition-colors dark:text-zinc-400">Belum ada riwayat kunjungan selesai.</p>
                ) : (
                  <ul className="space-y-4">
                    {history.map((visit) => (
                      <li key={visit.id} className="rounded-xl border border-slate-100 transition-colors dark:border-zinc-800 bg-slate-50/80 transition-colors dark:bg-[#131314]/80 p-4">
                        <div className="mb-2 flex justify-between gap-2">
                          <div>
                            <p className="text-sm text-indigo-700 transition-colors dark:text-indigo-400">{visit.department?.name}</p>
                            <p className="text-xs text-slate-500 transition-colors dark:text-zinc-400">
                              {new Date(visit.queueDate).toLocaleDateString('id-ID')} · #{visit.queueNumber}
                            </p>
                          </div>
                          {visit.doctor?.user?.name && (
                            <span className="text-xs text-slate-600 transition-colors dark:text-zinc-300">{visit.doctor.user.name}</span>
                          )}
                        </div>
                        <DoctorNotesDisplay doctorNotes={visit.doctorNotes} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
