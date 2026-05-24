// src/components/DoctorAppointmentManagement.tsx
import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { AppointmentDetail, AppointmentStatusPayload } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'
import { useAuthStore } from '../../store/authStore'
import CustomSearchBar from '../ui/CustomSearchBar'
import CustomSelect from '../ui/CustomSelect'

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
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 transition-colors dark:text-zinc-100 ">
          Jadwal Reservasi Pasien
        </h1>
        <p className="text-slate-600 transition-colors dark:text-zinc-300 ">
          Kelola dan perbarui status reservasi pasien yang terjadwal dengan Anda.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 transition-colors dark:border-zinc-800 bg-white transition-colors dark:bg-[#1e1f20] p-6 shadow-sm">
        {/* AREA PANEL KONTROL */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="w-full md:w-72">
            <CustomSearchBar
              label="Cari Pasien"
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              placeholder="Cari nama atau NIK pasien..."
            />
          </div>

          <div className="w-full min-w-[240px] md:w-auto">
            <CustomSelect
              label="Status Sesi"
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

        {/* TABEL */}
        {isLoadingAppointments ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 transition-colors dark:text-zinc-400 italic">
            Tidak ada jadwal reservasi yang sesuai kriteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-slate-100 transition-colors dark:border-zinc-800 bg-slate-50 transition-colors dark:bg-[#131314] text-[10px] font-black tracking-widest text-slate-500 transition-colors dark:text-zinc-400 uppercase">
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
              <tbody className="divide-y divide-slate-100 transition-colors dark:divide-zinc-800 bg-white transition-colors dark:bg-[#1e1f20] text-sm font-medium text-zinc-900 transition-colors dark:text-zinc-100 ">
                {filteredAppointments.map((apt) => {
                  const statusClasses: Record<string, string> = {
                    BOOKED: 'bg-amber-50 transition-colors dark:bg-amber-500/10 text-amber-600 transition-colors dark:text-amber-400 border-amber-200 transition-colors dark:border-amber-500/20 ',
                    CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-200',
                    CANCELLED: 'bg-rose-50 transition-colors dark:bg-rose-500/10 text-rose-600 transition-colors dark:text-rose-400 border-rose-200 transition-colors dark:border-rose-500/20 ',
                    COMPLETED: 'bg-emerald-50 transition-colors dark:bg-emerald-500/10 text-emerald-600 transition-colors dark:text-emerald-400 border-emerald-200 transition-colors dark:border-emerald-500/20 ',
                  }
                  const statusLabel: Record<string, string> = {
                    BOOKED: 'Menunggu Konfirmasi',
                    CONFIRMED: 'Terkonfirmasi',
                    CANCELLED: 'Dibatalkan',
                    COMPLETED: 'Selesai',
                  }

                  return (
                    <tr key={apt.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="p-5 pl-8 font-extrabold text-zinc-950 transition-colors dark:text-zinc-100 uppercase transition-colors group-hover:text-indigo-600">
                        {apt.patient?.user?.name || '-'}
                      </td>
                      <td className="p-5 font-bold text-slate-700 transition-colors dark:text-zinc-300 ">
                        {new Date(apt.scheduledAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                        })}
                      </td>
                      <td className="p-5">
                        <span className="rounded-md border border-slate-200 transition-colors dark:border-zinc-800 bg-slate-100 transition-colors dark:bg-[#1e1f20] px-2 py-1 font-mono text-[11px] font-black tracking-widest text-slate-600 transition-colors dark:text-zinc-300 ">
                          {new Date(apt.scheduledAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="p-5 font-mono text-xs font-bold text-slate-400 transition-colors dark:text-zinc-500 ">
                        {apt.patient?.nik || '-'}
                      </td>
                      <td className="max-w-xs truncate p-5 text-xs text-slate-600 transition-colors dark:text-zinc-300 ">
                        {apt.notes || '-'}
                      </td>
                      <td className="p-5">
                        <span
                          className={`rounded-lg border px-3 py-1 text-[10px] font-black tracking-widest uppercase ${statusClasses[apt.status] || 'border-slate-200 transition-colors dark:border-zinc-800 bg-slate-50 transition-colors dark:bg-[#131314] text-slate-600 transition-colors dark:text-zinc-300 '}`}
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
                                className="rounded-lg border border-transparent p-1.5 text-emerald-600 transition-colors dark:text-emerald-400 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
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
                                className="rounded-lg border border-transparent p-1.5 text-rose-600 transition-colors dark:text-rose-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
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
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 transition-colors dark:border-zinc-800 bg-white transition-colors dark:bg-[#1e1f20] shadow-2xl">
            <div className="border-b border-slate-100 transition-colors dark:border-zinc-800 bg-rose-50/30 p-6">
              <h3 className="text-lg font-black tracking-tighter text-zinc-900 transition-colors dark:text-zinc-100 uppercase">
                Konfirmasi Pembatalan
              </h3>
              <p className="mt-0.5 text-xs font-medium text-slate-500 transition-colors dark:text-zinc-400 ">
                Berikan alasan medis atau operasional terkait pembatalan ini.
              </p>
            </div>
            <form onSubmit={handleDoctorCancelAppointment}>
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-[10px] font-black tracking-widest text-slate-400 transition-colors dark:text-zinc-500 uppercase">
                    Alasan Catatan Pembatalan
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Contoh: Harus menghadiri operasi darurat / Pasien dirujuk ke faskes lain."
                    className="w-full resize-none rounded-xl border border-slate-200 transition-colors dark:border-zinc-800 bg-slate-50 transition-colors dark:bg-[#131314] px-4 py-3 text-sm font-medium text-zinc-800 transition-colors dark:text-zinc-200 transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 transition-colors dark:border-zinc-800 bg-slate-50 transition-colors dark:bg-[#131314] p-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelModalOpen(false)
                    setSelectedCancelAptId(null)
                    setCancellationReason('')
                  }}
                  className="rounded-xl border border-slate-200 transition-colors dark:border-zinc-800 px-4 py-2.5 text-xs font-semibold tracking-widest text-slate-600 transition-colors dark:text-zinc-300 uppercase transition-colors hover:bg-slate-100 transition-colors dark:hover:bg-zinc-800 "
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
