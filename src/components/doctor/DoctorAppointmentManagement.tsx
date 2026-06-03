// src/components/DoctorAppointmentManagement.tsx
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { Fragment, useEffect, useState } from 'react'
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
    <div className="animate-in fade-in duration-700 ease-out space-y-6">
      <div>
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100 tracking-tight">
          Jadwal Reservasi Pasien
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          Kelola dan perbarui status reservasi pasien yang terjadwal dengan Anda.
        </p>
      </div>

      {/* AREA PANEL KONTROL FILTER (Kini terpisah dari tabel) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
      </div>

      {/* TABEL DATA RESERVASI */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
        {isLoadingAppointments ? (
          <p className="p-16 text-center text-xs tracking-widest text-teal-700 uppercase dark:text-teal-500 animate-pulse">
            Menyinkronkan data reservasi...
          </p>
        ) : filteredAppointments.length === 0 ? (
          <p className="p-16 text-center font-medium text-slate-400 italic dark:text-slate-500">
            {searchQuery
              ? `Tidak ada reservasi yang cocok dengan pencarian "${searchQuery}"`
              : 'Belum ada data reservasi yang sesuai dengan kriteria filter.'}
          </p>
        ) : (
          <div className="no-scrollbar overflow-x-auto relative">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-500">
                <tr>
                  <th className="p-6 pl-8">Nama Pasien</th>
                  <th className="p-6">Tanggal</th>
                  <th className="p-6">Waktu</th>
                  <th className="p-6">No. Identitas</th>
                  <th className="p-6">Keluhan</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 pr-8 text-right sticky right-0 z-20 bg-slate-50/95 dark:bg-[#131314]/95 backdrop-blur-sm border-l border-slate-100 dark:border-zinc-800/50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.2)]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm dark:divide-zinc-800">
                {filteredAppointments.map((apt, index) => {
                  const statusClasses: Record<string, string> = {
                    BOOKED:
                      'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
                    CONFIRMED:
                      'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
                    CANCELLED:
                      'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
                    COMPLETED:
                      'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
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
                      style={{ zIndex: filteredAppointments.length - index }}
                      className="group relative transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
                    >
                      <td className="p-6 pl-8 align-top">
                        <div className="font-medium text-zinc-950 dark:text-white uppercase transition-colors group-hover:text-teal-600">
                          {apt.patient?.user?.name || '-'}
                        </div>
                      </td>
                      <td className="p-6 align-top">
                        <div className="text-slate-700 dark:text-slate-300">
                          {new Date(apt.scheduledAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="p-6 align-top">
                        <div className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[10px] tracking-widest text-slate-600 uppercase dark:bg-slate-900/50 dark:text-slate-400">
                          {new Date(apt.scheduledAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="p-6 align-top">
                        <div className="font-mono text-xs text-slate-400 dark:text-zinc-500">
                          {apt.patient?.nik || '-'}
                        </div>
                      </td>
                      <td className="p-6 align-top max-w-[200px]">
                        <div className="truncate text-xs text-slate-600 dark:text-zinc-300">
                          {apt.notes || '-'}
                        </div>
                      </td>
                      <td className="p-6 align-top">
                        <span
                          className={`inline-flex min-w-[120px] items-center justify-center rounded-lg border px-3.5 py-1.5 text-[10px] tracking-widest uppercase transition-colors ${
                            statusClasses[apt.status] ||
                            'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          {statusLabel[apt.status] || apt.status}
                        </span>
                      </td>

                      {/* KOLOM AKSI (DROPDOWN HEADLESS UI) */}
                      <td
                        className="p-6 pr-8 text-right align-top sticky right-0 bg-white group-hover:bg-slate-50/80 dark:bg-[#1e1f20] dark:group-hover:bg-[#252628] border-l border-slate-100 dark:border-zinc-800/50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.2)] transition-colors focus-within:z-50 group-hover:z-50"
                      >
                        <div className="flex items-center justify-end">
                          {apt.status === 'BOOKED' ? (
                            <Menu as="div" className="relative inline-block text-left">
                              <div>
                                <MenuButton className="flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 focus:outline-none transition-colors">
                                  <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                                </MenuButton>
                              </div>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <MenuItems className="absolute right-0 mt-2 w-max min-w-[140px] origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-[#1e1f20] dark:ring-white/10 z-50 divide-y divide-slate-100 dark:divide-zinc-800">
                                  <div className="py-1">
                                    <MenuItem>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleUpdateAppointmentStatus(apt.id, 'CONFIRMED')}
                                          className={`${
                                            active
                                              ? 'bg-slate-50 text-emerald-600 dark:bg-zinc-800 dark:text-emerald-400'
                                              : 'text-slate-700 dark:text-zinc-300'
                                          } group flex w-full items-center px-4 py-2.5 text-sm transition-colors`}
                                        >
                                          Konfirmasi
                                        </button>
                                      )}
                                    </MenuItem>
                                    <MenuItem>
                                      {({ active }) => (
                                        <button
                                          onClick={() => {
                                            setSelectedCancelAptId(apt.id)
                                            setIsCancelModalOpen(true)
                                          }}
                                          className={`${
                                            active
                                              ? 'bg-slate-50 text-rose-600 dark:bg-zinc-800 dark:text-rose-400'
                                              : 'text-slate-700 dark:text-zinc-300'
                                          } group flex w-full items-center px-4 py-2.5 text-sm transition-colors`}
                                        >
                                          Batalkan
                                        </button>
                                      )}
                                    </MenuItem>
                                  </div>
                                </MenuItems>
                              </Transition>
                            </Menu>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-zinc-500 italic px-2">Tidak ada aksi</span>
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
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-[#131314]/80 p-4 backdrop-blur-sm duration-300">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] shadow-2xl">
            <div className="border-b border-slate-100 dark:border-zinc-800 bg-rose-50/30 dark:bg-rose-500/5 p-6">
              <h3 className="text-lg tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">
                Konfirmasi Pembatalan
              </h3>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                Berikan alasan medis atau operasional terkait pembatalan ini.
              </p>
            </div>
            <form onSubmit={handleDoctorCancelAppointment}>
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-[10px] tracking-widest text-slate-400 dark:text-zinc-500 uppercase">
                    Alasan Catatan Pembatalan
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Contoh: Harus menghadiri operasi darurat / Pasien dirujuk ke faskes lain."
                    className="w-full resize-none rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] px-4 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] p-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelModalOpen(false)
                    setSelectedCancelAptId(null)
                    setCancellationReason('')
                  }}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800 px-4 py-2.5 text-xs tracking-widest text-slate-600 dark:text-zinc-300 uppercase transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs tracking-widest text-white uppercase shadow-lg shadow-rose-600/10 transition-colors hover:bg-rose-700"
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