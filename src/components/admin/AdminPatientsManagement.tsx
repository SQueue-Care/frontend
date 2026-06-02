import { useEffect, useState } from 'react'
import DoctorNotesDisplay from '../shared/DoctorNotesDisplay'
import { usePatientStore } from '../../store/patientStore'

import CustomSearchBar from '../ui/CustomSearchBar'

export default function AdminPatientsManagement() {
  const { patients, pagination, isLoading, medicalProfile, fetchPatients, fetchMedicalProfile } =
    usePatientStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPatients({ page, pageSize: 12, search: search.trim() || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchPatients, page, search])

  const handleSelect = async (patientId: string) => {
    setSelectedId(patientId)
    await fetchMedicalProfile(patientId)
  }

  const selectedPatient = medicalProfile?.patient

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div>
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">Data Pasien</h1>
        <p className="text-slate-600 dark:text-zinc-400">Cari pasien terdaftar dan lihat profil serta ringkasan kunjungan.</p>
      </div>

      <div className="w-full sm:w-96">
        <CustomSearchBar
          label="Pencarian"
          value={search}
          onChange={(val) => { setSearch(val); setPage(1) }}
          placeholder="Cari nama, email, NIK, atau BPJS..."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] shadow-sm">
            {isLoading && patients.length === 0 ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
              </div>
            ) : patients.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-500 dark:text-zinc-400">Tidak ada pasien ditemukan.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                {patients.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(p.id)}
                      className={`w-full px-5 py-4 text-left transition-colors hover:bg-teal-50/50 ${ selectedId === p.id ? 'bg-teal-50 dark:bg-teal-500/10' : '' }`}
                    >
                      <p className="text-zinc-900 dark:text-zinc-100">{p.user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{p.user.email}</p>
                      {p.bpjsNumber && (
                        <span className="mt-1 inline-block rounded bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-700 dark:text-blue-400">
                          BPJS
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-3 flex justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                {pagination.page}/{pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {!selectedId ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] p-8 text-center text-sm text-slate-500 dark:text-zinc-400">
              Pilih pasien dari daftar untuk melihat profil
            </div>
          ) : isLoading && !selectedPatient ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#1e1f20]">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
            </div>
          ) : selectedPatient ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
                <h2 className="font-['Manrope'] text-xl font-bold text-zinc-900 dark:text-zinc-100">{selectedPatient.user.name}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500 dark:text-zinc-400">Email</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">{selectedPatient.user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-zinc-400">Telepon</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">{selectedPatient.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-zinc-400">NIK</dt>
                    <dd className="font-medium">{selectedPatient.nik || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-zinc-400">BPJS</dt>
                    <dd className="font-medium">{selectedPatient.bpjsNumber || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-zinc-400">Golongan Darah</dt>
                    <dd className="font-medium">{selectedPatient.bloodType || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-zinc-400">Alergi</dt>
                    <dd className="font-medium">{selectedPatient.allergies || '—'}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
                <h3 className="mb-4 text-zinc-900 dark:text-zinc-100">Riwayat Kunjungan Selesai</h3>
                {!medicalProfile?.medicalHistory?.length ? (
                  <p className="text-sm text-slate-500 dark:text-zinc-400 italic">Belum ada kunjungan selesai.</p>
                ) : (
                  <ul className="space-y-3">
                    {medicalProfile.medicalHistory.map((visit) => (
                      <li key={visit.id} className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] p-4">
                        <div className="mb-2 flex justify-between gap-2">
                          <div>
                            <p className="text-sm text-teal-700 dark:text-teal-400">{visit.department?.name}</p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              {new Date(visit.queueDate).toLocaleDateString('id-ID')} · #{visit.queueNumber}
                            </p>
                          </div>
                          {visit.doctor?.user?.name && (
                            <span className="text-xs text-slate-600 dark:text-zinc-400">{visit.doctor.user.name}</span>
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
