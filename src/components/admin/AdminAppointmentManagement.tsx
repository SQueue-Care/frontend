// src/components/AdminAppointmentManagement.tsx
import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { AppointmentDetail, AppointmentStatusPayload, Department } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'
import { useDepartmentStore } from '../../store/departmentStore'

// Impor komponen Custom UI
import CustomSearchBar from '../ui/CustomSearchBar'
import CustomSelect from '../ui/CustomSelect'

export default function AdminAppointmentManagement() {
  const { departments } = useDepartmentStore()
  const showAlert = useAlertStore((s) => s.showAlert)

  const [appointments, setAppointments] = useState<AppointmentDetail[]>([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true)

  // State untuk Filter & Search
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState('')
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')

  // State untuk Modal Detail
  const [isAptDetailModalOpen, setIsAptDetailModalOpen] = useState(false)
  const [selectedAptDetail, setSelectedAptDetail] = useState<AppointmentDetail | null>(null)

  // Ambil Data Reservasi
  const fetchAppointments = async () => {
    try {
      const response = await apiClient.get('/appointments')
      setAppointments(response.data.data || [])
    } catch (error: unknown) {
      console.error('Gagal memuat appointments:', error)
      setAppointments([])
    } finally {
      setIsLoadingAppointments(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const response = await apiClient.get('/appointments')
        if (!cancelled) setAppointments(response.data.data || [])
      } catch (error: unknown) {
        console.error('Gagal memuat appointments:', error)
        if (!cancelled) setAppointments([])
      } finally {
        if (!cancelled) setIsLoadingAppointments(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Fungsi Pembaruan Status & Catatan Pembatalan
  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const payload: AppointmentStatusPayload = { status: newStatus }

      if (newStatus === 'CANCELLED') {
        const reason = prompt('Masukkan alasan pembatalan reservasi pasien:')
        if (reason === null) return
        if (reason.trim() === '') {
          showAlert('Alasan pembatalan wajib diisi secara jelas.', 'warning')
          return
        }
        payload.cancellationReason = reason
      }

      await apiClient.patch(`/appointments/${appointmentId}`, payload)
      void fetchAppointments()
      showAlert(`Status reservasi berhasil diperbarui menjadi ${newStatus}.`, 'success')
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal mengubah status appointment.'), 'error')
    }
  }

  // Logika Penyaringan Data
  const filteredAppointments = appointments.filter((apt) => {
    const matchDept = !selectedDepartmentFilter || apt.department?.id === selectedDepartmentFilter
    const matchStatus = !selectedStatusFilter || apt.status === selectedStatusFilter
    const matchSearch =
      !appointmentSearchQuery ||
      apt.patient?.user?.name?.toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
      apt.patient?.nik?.includes(appointmentSearchQuery)
    return matchDept && matchStatus && matchSearch
  })

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="mb-1 font-['Manrope'] text-2xl font-extrabold text-zinc-950 dark:text-zinc-100">
          Daftar Reservasi Pasien
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          Kelola dan perbarui status reservasi pasien di seluruh sistem RS Ethereal.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
        {/* AREA FILTER & SEARCH */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="w-full md:w-72">
            <CustomSearchBar
              label="Cari Reservasi"
              value={appointmentSearchQuery}
              onChange={(val) => setAppointmentSearchQuery(val)}
              placeholder="Cari nama pasien atau NIK..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px] flex-1">
              <CustomSelect
                label="Filter Departemen"
                value={selectedDepartmentFilter}
                onChange={(val) => setSelectedDepartmentFilter(val)}
                options={[
                  { value: '', label: 'Semua Departemen' },
                  ...departments.map((dept: Department) => ({ value: dept.id, label: dept.name })),
                ]}
                placeholder="Semua Departemen"
              />
            </div>

            <div className="min-w-[200px] flex-1">
              <CustomSelect
                label="Status Reservasi"
                value={selectedStatusFilter}
                onChange={(val) => setSelectedStatusFilter(val)}
                options={[
                  { value: '', label: 'Semua Status' },
                  { value: 'BOOKED', label: 'Menunggu Konfirmasi' },
                  { value: 'CONFIRMED', label: 'Terkonfirmasi' },
                  { value: 'COMPLETED', label: 'Selesai' },
                  { value: 'CANCELLED', label: 'Dibatalkan' },
                ]}
                placeholder="Semua Status"
              />
            </div>
          </div>
        </div>

        {/* TABEL DATA */}
        {isLoadingAppointments ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 dark:text-zinc-400 italic">
            {appointmentSearchQuery
              ? `Tidak ada reservasi yang cocok dengan pencarian "${appointmentSearchQuery}"`
              : 'Belum ada data reservasi yang sesuai dengan kriteria filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] text-[10px] font-black tracking-widest text-slate-500 dark:text-zinc-400 uppercase">
                <tr>
                  <th className="p-5 pl-8">Nama Pasien</th>
                  <th className="p-5">Dokter</th>
                  <th className="p-5">Tanggal</th>
                  <th className="p-5">Waktu</th>
                  <th className="p-5">No. Identitas</th>
                  <th className="p-5">Departemen</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 pr-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {filteredAppointments.map((apt) => {
                  const statusClasses: Record<string, string> = {
                    BOOKED: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
                    CONFIRMED: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
                    CANCELLED: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
                    COMPLETED: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
                  }
                  const statusLabel: Record<string, string> = {
                    BOOKED: 'Menunggu Konfirmasi',
                    CONFIRMED: 'Terkonfirmasi',
                    CANCELLED: 'Dibatalkan',
                    COMPLETED: 'Selesai',
                  }

                  return (
                    <tr
                      key={apt.id}
                      onClick={() => {
                        setSelectedAptDetail(apt)
                        setIsAptDetailModalOpen(true)
                      }}
                      className="group cursor-pointer transition-colors hover:bg-slate-50/50 dark:hover:bg-[#131314]/50"
                    >
                      <td className="p-5 pl-8">
                        <div className="font-extrabold text-zinc-950 dark:text-zinc-100 uppercase transition-colors group-hover:text-teal-600">
                          {apt.patient?.user?.name || '-'}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700 dark:text-slate-300">
                          {apt.doctor?.user?.name || '-'}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700 dark:text-slate-300">
                          {new Date(apt.scheduledAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 px-2 py-1 font-mono text-[11px] font-black tracking-widest text-slate-600 dark:text-zinc-400">
                          {new Date(apt.scheduledAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="font-mono text-xs font-bold text-slate-400 dark:text-zinc-500">
                          {apt.patient?.nik || '-'}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700 dark:text-slate-300">
                          {apt.department?.name || '-'}
                        </div>
                      </td>
                      <td className="p-5">
                        <span
                          className={`rounded-lg border px-3 py-1 text-[10px] font-black tracking-widest uppercase ${statusClasses[apt.status] || 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] text-slate-600 dark:text-zinc-400'}`}
                        >
                          {statusLabel[apt.status] || apt.status}
                        </span>
                      </td>
                      <td className="p-5 pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {apt.status === 'BOOKED' && (
                            <>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(apt.id, 'CONFIRMED')}
                                className="rounded-lg border border-transparent p-1.5 text-emerald-600 dark:text-emerald-400 transition-colors hover:border-emerald-200 hover:bg-emerald-50 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300"
                                title="Konfirmasi"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(apt.id, 'CANCELLED')}
                                className="rounded-lg border border-transparent p-1.5 text-rose-600 dark:text-rose-400 transition-colors hover:border-rose-200 hover:bg-rose-50 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300"
                                title="Batalkan"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CARD DETAIL RESERVASI MODAL */}
      {isAptDetailModalOpen && selectedAptDetail && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-[#131314]/80 p-4 backdrop-blur-sm duration-300">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#131314]/50 p-6">
              <div>
                <h3 className="text-lg font-black tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">
                  Detail Reservasi
                </h3>
                <p className="mt-0.5 font-mono text-xs font-bold text-teal-600">
                  ID: {selectedAptDetail.id?.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAptDetailModalOpen(false)
                  setSelectedAptDetail(null)
                }}
                className="rounded-xl p-2 text-slate-400 dark:text-zinc-500 transition-all hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
              {/* Informasi Pasien */}
              <div className="space-y-2">
                <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase">
                  Informasi Pasien
                </p>
                <div className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] p-4">
                  <div className="text-base font-extrabold text-zinc-950 dark:text-zinc-100 uppercase">
                    {selectedAptDetail.patient?.user?.name || '-'}
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
                    NIK:{' '}
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {selectedAptDetail.patient?.nik || '-'}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                    BPJS:{' '}
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {selectedAptDetail.patient?.bpjsNumber || 'Tidak Ada (Mandiri)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Sesi Medis */}
              <div className="space-y-2">
                <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase">
                  Alokasi Medis
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] p-3">
                    <span className="mb-1 block text-[9px] font-black tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                      Dokter Spesialis
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedAptDetail.doctor?.user?.name || '-'}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] p-3">
                    <span className="mb-1 block text-[9px] font-black tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                      Poliklinik
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedAptDetail.department?.name || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Waktu Kunjungan */}
              <div className="space-y-2">
                <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase">
                  Waktu Kunjungan
                </p>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] p-4">
                  <div>
                    <span className="mb-0.5 block text-[9px] font-black tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                      Tanggal
                    </span>
                    <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100">
                      {new Date(selectedAptDetail.scheduledAt).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="mb-0.5 block text-[9px] font-black tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                      Jam Sesi
                    </span>
                    <span className="font-mono text-xs font-bold tracking-wider text-teal-600">
                      {new Date(selectedAptDetail.scheduledAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      WIB
                    </span>
                  </div>
                </div>
              </div>

              {/* Otorisasi Konfirmasi & Pembatalan */}
              <div className="space-y-2">
                <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase">
                  Otorisasi Konfirmasi
                </p>
                {['CONFIRMED', 'COMPLETED'].includes(selectedAptDetail.status) ? (
                  <div className="rounded-xl border border-teal-100 dark:border-teal-500/20 bg-teal-50/50 dark:bg-teal-500/5 p-4">
                    <span className="mb-1 block text-[9px] font-black tracking-wider text-teal-600/70 dark:text-teal-400/70 uppercase">
                      Dikonfirmasi Oleh
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase">
                        {selectedAptDetail.confirmedBy?.name ||
                          selectedAptDetail.doctor?.user?.name ||
                          'Administrator'}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[9px] font-black tracking-widest text-white uppercase ${
                          (selectedAptDetail.confirmedBy?.role || 'DOCTOR') === 'DOCTOR'
                            ? 'bg-purple-600'
                            : 'bg-teal-600'
                        }`}
                      >
                        {selectedAptDetail.confirmedBy?.role || 'DOCTOR'}
                      </span>
                    </div>
                  </div>
                ) : selectedAptDetail.status === 'CANCELLED' ? (
                  <div className="space-y-2 rounded-xl border border-rose-100 dark:border-rose-500/20 bg-rose-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-tight text-rose-600 dark:text-rose-400 uppercase">
                        Reservasi Dibatalkan
                      </span>
                      <span className="rounded bg-rose-600 px-2 py-0.5 font-mono text-[9px] font-black tracking-widest text-white uppercase">
                        {selectedAptDetail.cancelledBy?.role || 'SYSTEM/ADMIN'}
                      </span>
                    </div>
                    {selectedAptDetail.cancellationReason ? (
                      <div className="rounded-lg border-t border-rose-200/40 dark:border-rose-500/20 bg-white/50 dark:bg-[#131314]/50 p-2 pt-2 text-xs font-medium text-rose-700 dark:text-rose-400">
                        <span className="mb-1 block text-[9px] font-black tracking-wider text-rose-500/80 uppercase">
                          Alasan Pembatalan:
                        </span>
                        "{selectedAptDetail.cancellationReason}"
                      </div>
                    ) : (
                      <div className="border-t border-rose-200/40 dark:border-rose-500/20 pt-2 text-xs text-rose-400 italic">
                        Tidak ada catatan alasan tertulis dari operator.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-100 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-4">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Menunggu tindakan konfirmasi berkas oleh Admin atau Dokter terkait.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] p-6">
              <button
                onClick={() => {
                  setIsAptDetailModalOpen(false)
                  setSelectedAptDetail(null)
                }}
                className="rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-black tracking-widest text-white uppercase transition-all hover:bg-zinc-800"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}