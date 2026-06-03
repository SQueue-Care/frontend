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
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">
          Riwayat Pasien
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          Cari pasien dan lihat kunjungan selesai beserta catatan rekam medis dokter.
        </p>
      </div>

      {/* WADAH PENCARIAN: Lebar dikunci menggunakan grid yang sama dengan kolom kiri */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CustomSearchBar
            label="Pencarian Direktori"
            value={search}
            onChange={(val) => { setSearch(val); setPage(1) }}
            placeholder="Nama, email, NIK, BPJS..."
          />
        </div>
      </div>

      {/* WADAH UTAMA: Kartu kiri dan kanan kini berada dalam satu baris grid agar sejajar di atas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* PANEL KIRI: DAFTAR PASIEN */}
        <div className="flex max-h-[650px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20] lg:col-span-1">
          <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-zinc-800 dark:bg-[#131314]/80">
            <h2 className="font-['Manrope'] text-base font-bold text-zinc-900 dark:text-zinc-100">Daftar Pasien</h2>
            <p className="text-[10px] tracking-widest text-slate-400 dark:text-zinc-500 uppercase">
              {pagination?.total ? `${pagination.total} Terdaftar` : 'Hasil Pencarian'}
            </p>
          </div>

          <div className="no-scrollbar relative flex-1 overflow-y-auto">
            {isLoading && !patients.length ? (
              <div className="flex h-full items-center justify-center py-12">
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-slate-100 border-b-indigo-600 dark:border-zinc-800 dark:border-b-indigo-500" />
              </div>
            ) : patients.length === 0 ? (
              <p className="py-12 text-center text-sm font-medium italic text-slate-500 dark:text-zinc-400">
                Tidak ada pasien ditemukan.
              </p>
            ) : (
              <ul className={`divide-y divide-slate-100 transition-opacity duration-300 dark:divide-zinc-800 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {patients.map((p) => {
                  const isSelected = selectedId === p.id
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(p.id)}
                        className={`group relative flex w-full flex-col items-start px-5 py-4 text-left transition-all hover:bg-indigo-50/50 dark:hover:bg-[#252628] ${
                          isSelected ? 'bg-indigo-50/80 dark:bg-indigo-500/10' : ''
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute bottom-0 left-0 top-0 w-1 bg-indigo-600 dark:bg-indigo-500" />
                        )}
                        <p className={`font-medium transition-colors ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                          {p.user.name}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-zinc-500">
                          {p.nik || p.user.email}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* PAGINASI */}
          {pagination && pagination.totalPages > 1 && (
            <div className="shrink-0 border-t border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-zinc-800 dark:bg-[#131314]/50">
              <div className="flex items-center justify-between">
                <button
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-[#1e1f20] dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Prev
                </button>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  disabled={page >= pagination.totalPages || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-[#1e1f20] dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PANEL KANAN: DETAIL & RIWAYAT */}
        <div className="lg:col-span-2">
          {!selectedId ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-zinc-800 dark:bg-[#131314]">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                </svg>
              </div>
              <h3 className="font-['Manrope'] text-lg font-bold text-zinc-900 dark:text-zinc-100">Jelajahi Rekam Medis</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">
                Pilih pasien dari daftar di sebelah kiri untuk melihat detail kunjungan.
              </p>
            </div>
          ) : isLoading && !patient ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#1e1f20]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-b-indigo-600 dark:border-zinc-800 dark:border-b-indigo-500" />
            </div>
          ) : patient ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
              
              {/* HEADER INFO PASIEN */}
              <div className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-zinc-800 dark:bg-[#131314]/50">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                      {patient.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-['Manrope'] text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                        {patient.user.name}
                      </h2>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
                        <span>NIK: {patient.nik || '-'}</span>
                        <span className="text-slate-300 dark:text-zinc-600">|</span>
                        <span>BPJS: {patient.bpjsNumber || 'Mandiri'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* PERINGATAN ALERGI */}
              {patient.allergies && (
                <div className="flex items-start gap-3 border-b border-slate-100 bg-rose-50 px-6 py-4 dark:border-zinc-800 dark:bg-rose-500/5">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-rose-700 uppercase dark:text-rose-400">Peringatan Alergi</p>
                    <p className="text-sm font-medium text-rose-900 dark:text-rose-300">{patient.allergies}</p>
                  </div>
                </div>
              )}

              {/* DAFTAR RIWAYAT KUNJUNGAN */}
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
                  <div>
                    <h3 className="font-['Manrope'] text-lg font-bold text-zinc-900 dark:text-zinc-100">Kunjungan Selesai</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Arsip rekam medis pasien</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {history.length} Kunjungan
                  </span>
                </div>

                {history.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center dark:border-zinc-800 dark:bg-[#131314]">
                    <p className="text-sm font-medium italic text-slate-500 dark:text-zinc-400">
                      Belum ada riwayat kunjungan medis yang tercatat.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-5">
                    {history.map((visit) => (
                      <li key={visit.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm dark:border-zinc-800 dark:bg-[#131314]/50">
                        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center dark:border-zinc-800/80 dark:bg-[#18181b]">
                          <div>
                            <p className="font-bold text-indigo-700 dark:text-indigo-400">
                              {visit.department?.name || 'Poliklinik Umum'}
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                              {new Date(visit.queueDate).toLocaleDateString('id-ID', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                              })} · Antrean #{visit.queueNumber}
                            </p>
                          </div>
                          {visit.doctor?.user?.name && (
                            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold tracking-widest text-slate-600 uppercase dark:border-zinc-700 dark:bg-[#1e1f20] dark:text-zinc-300">
                              Dr. {visit.doctor.user.name}
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <DoctorNotesDisplay doctorNotes={visit.doctorNotes} />
                        </div>
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