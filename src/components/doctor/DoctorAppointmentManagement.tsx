// src/components/DoctorAppointmentManagement.tsx
import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { AppointmentDetail, AppointmentStatusPayload } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'
import { useAuthStore } from '../../store/authStore'

export default function DoctorAppointmentManagement() {
  const user = useAuthStore((state) => state.user)

  const [appointments, setAppointments] = useState<AppointmentDetail[]>([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')

  // State Modal Pembatalan
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedCancelAptId, setSelectedCancelAptId] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  const doctorId = user?.doctor?.id ?? (user?.role === 'DOCTOR' ? user.id : null)
  const showAlert = useAlertStore((s) => s.showAlert)

  const fetchAppointments = async () => {
    if (!doctorId) return
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/appointments`)
      setAppointments(response.data.data || [])
    } catch (error: unknown) {
      console.error('Gagal memuat appointments:', error)
      setAppointments([])
    } finally {
      setIsLoadingAppointments(false)
    }
  }

  useEffect(() => {
    if (!doctorId) return
    let cancelled = false
    void (async () => {
      try {
        const response = await apiClient.get(`/doctors/${doctorId}/appointments`)
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
  }, [doctorId])

  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const payload: AppointmentStatusPayload = { status: newStatus }
      await apiClient.patch(`/appointments/${appointmentId}`, payload)
      void fetchAppointments()
      showAlert('Status reservasi berhasil diperbarui!', 'success')
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal mengubah status appointment.'), 'error')
    }
  }

  const handleDoctorCancelAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCancelAptId) return
    if (cancellationReason.trim() === '') {
      showAlert('Alasan pembatalan wajib diisi secara spesifik.', 'warning')
      return
    }

    try {
      const payload = {
        status: 'CANCELLED',
        cancellationReason: cancellationReason,
      }
      await apiClient.patch(`/appointments/${selectedCancelAptId}`, payload)

      setIsCancelModalOpen(false)
      setSelectedCancelAptId(null)
      setCancellationReason('')

      fetchAppointments()
      showAlert('Reservasi berhasil dibatalkan dan catatan telah disimpan.', 'success')
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal memproses pembatalan.'), 'error')
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchStatus = !selectedStatusFilter || apt.status === selectedStatusFilter
    const matchSearch =
      !searchQuery ||
      apt.patient?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patient?.nik?.includes(searchQuery)
    return matchStatus && matchSearch
  })

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950">
          Jadwal Reservasi Pasien
        </h1>
        <p className="text-slate-600">
          Kelola dan perbarui status reservasi pasien yang terjadwal dengan Anda.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* AREA PANEL KONTROL */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Cari nama atau NIK pasien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>

          <div className="relative w-full min-w-[240px] md:w-auto">
            <label className="absolute -top-2.5 left-3 z-10 bg-white px-1.5 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              Status Sesi
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="relative z-0 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-semibold text-zinc-700 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none md:min-w-[240px]"
            >
              <option value="">Semua Status</option>
              <option value="BOOKED">Menunggu Konfirmasi</option>
              <option value="CONFIRMED">Terkonfirmasi</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center px-4 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* TABEL */}
        {isLoadingAppointments ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 italic">
            Tidak ada jadwal reservasi yang sesuai kriteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                <tr>
                  <th className="p-5 pl-8">Nama Pasien</th>
                  <th className="p-5">Tanggal</th>
                  <th className="p-5">Waktu</th>
                  <th className="p-5">No. Identitas</th>
                  <th className="p-5">Keluhan</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 pr-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm font-medium text-zinc-900">
                {filteredAppointments.map((apt) => {
                  const statusClasses: Record<string, string> = {
                    BOOKED: 'bg-amber-50 text-amber-600 border-amber-200',
                    CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-200',
                    CANCELLED: 'bg-rose-50 text-rose-600 border-rose-200',
                    COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                  }
                  const statusLabel: Record<string, string> = {
                    BOOKED: 'Menunggu Konfirmasi',
                    CONFIRMED: 'Terkonfirmasi',
                    CANCELLED: 'Dibatalkan',
                    COMPLETED: 'Selesai',
                  }

                  return (
                    <tr key={apt.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="p-5 pl-8 font-extrabold text-zinc-950 uppercase transition-colors group-hover:text-indigo-600">
                        {apt.patient?.user?.name || '-'}
                      </td>
                      <td className="p-5 font-bold text-slate-700">
                        {new Date(apt.scheduledAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                        })}
                      </td>
                      <td className="p-5">
                        <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-[11px] font-black tracking-widest text-slate-600">
                          {new Date(apt.scheduledAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="p-5 font-mono text-xs font-bold text-slate-400">
                        {apt.patient?.nik || '-'}
                      </td>
                      <td className="max-w-xs truncate p-5 text-xs text-slate-600">
                        {apt.notes || '-'}
                      </td>
                      <td className="p-5">
                        <span
                          className={`rounded-lg border px-3 py-1 text-[10px] font-black tracking-widest uppercase ${statusClasses[apt.status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}
                        >
                          {statusLabel[apt.status] || apt.status}
                        </span>
                      </td>
                      <td className="p-5 pr-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {apt.status === 'BOOKED' && (
                            <>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(apt.id, 'CONFIRMED')}
                                className="rounded-lg border border-transparent p-1.5 text-emerald-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
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
                                onClick={() => {
                                  setSelectedCancelAptId(apt.id)
                                  setIsCancelModalOpen(true)
                                }}
                                className="rounded-lg border border-transparent p-1.5 text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
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

      {/* MODAL INPUT CATATAN PEMBATALAN */}
      {isCancelModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-70 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-300">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 bg-rose-50/30 p-6">
              <h3 className="text-lg font-black tracking-tighter text-zinc-900 uppercase">
                Konfirmasi Pembatalan
              </h3>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Berikan alasan medis atau operasional terkait pembatalan ini.
              </p>
            </div>
            <form onSubmit={handleDoctorCancelAppointment}>
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Alasan Catatan Pembatalan
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Contoh: Harus menghadiri operasi darurat / Pasien dirujuk ke faskes lain."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-zinc-800 transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelModalOpen(false)
                    setSelectedCancelAptId(null)
                    setCancellationReason('')
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-100"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-rose-600/10 transition-colors hover:bg-rose-700"
                >
                  Konfirmasi Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
