import { useEffect, useState } from 'react'
import type { AppointmentDetail } from '../../lib/types'

function computeCheckInAvailable(appointment: AppointmentDetail | null): boolean {
  if (!appointment || appointment.status !== 'CONFIRMED') return false
  const now = new Date()
  const scheduledTime = new Date(appointment.scheduledAt)
  const checkInWindowStart = new Date(scheduledTime.getTime() - 30 * 60000)
  return now >= checkInWindowStart
}

interface ReservationDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentDetail | null
  patientProfile: {
    name: string
    nik: string
    address: string
  } | null
  onCheckIn?: (appointmentId: string) => Promise<void>
}

const getAppointmentStatusStyle = (status: string) => {
  switch (status) {
    case 'BOOKED':
      return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
    case 'CONFIRMED':
      return 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/50'
    case 'COMPLETED':
    case 'CANCELLED':
      return 'bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
    default:
      return 'bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
  }
}

const getAppointmentStatusText = (status: string) => {
  switch (status) {
    case 'BOOKED':
      return 'Menunggu Konfirmasi'
    case 'CONFIRMED':
      return 'Terkonfirmasi'
    case 'COMPLETED':
      return 'Selesai'
    case 'CANCELLED':
      return 'Dibatalkan'
    default:
      return status
  }
}

export default function ReservationDetailPanel({
  isOpen,
  onClose,
  appointment,
  patientProfile,
  onCheckIn,
}: ReservationDetailPanelProps) {
  const [, setTimeTick] = useState(0)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  useEffect(() => {
    if (!appointment || appointment.status !== 'CONFIRMED') return
    const interval = setInterval(() => setTimeTick((t) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [appointment, isOpen])

  const isCheckInTime = computeCheckInAvailable(appointment)

  // ANIMATION FIX: Do not return null to allow the panel to stay in the DOM and transition properly.
  // if (!appointment) return null;

  const isCancelledOrCompleted =
    appointment?.status === 'CANCELLED' || appointment?.status === 'COMPLETED'

  const handleCheckInClick = async () => {
    if (!onCheckIn || !appointment) return
    setIsCheckingIn(true)
    try {
      await onCheckIn(appointment.id)
    } finally {
      setIsCheckingIn(false)
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-100 bg-white/40 backdrop-blur-sm transition-all duration-300 dark:bg-[#131314]/80 ${
          isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 z-110 flex w-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-500 ease-in-out sm:max-w-md dark:border-zinc-800 dark:bg-[#1e1f20] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {appointment ? (
          <>
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6 transition-colors md:p-8 dark:border-zinc-800 dark:bg-[#131314]/50">
              <div>
                <h3 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-zinc-950 transition-colors dark:text-zinc-100">
                  Detail Reservasi
                </h3>
                <p className="mt-1 font-mono text-xs font-medium tracking-widest text-slate-500 uppercase transition-colors dark:text-zinc-400">
                  ID: {appointment.id?.substring(0, 8) || 'XXX'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-all outline-none hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 dark:focus:ring-zinc-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto p-6 md:p-8">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-colors dark:border-zinc-800 dark:bg-[#131314]">
                <div>
                  <p className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:text-zinc-500">
                    Status Reservasi
                  </p>
                  <span
                    className={`inline-flex rounded-lg border px-3.5 py-1.5 text-[10px] font-black tracking-widest uppercase transition-colors ${getAppointmentStatusStyle(appointment.status)}`}
                  >
                    {getAppointmentStatusText(appointment.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="mb-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:text-zinc-500">
                    Tanggal Dibuat
                  </p>
                  <span className="text-sm font-extrabold text-zinc-900 transition-colors dark:text-zinc-100">
                    {appointment.createdAt
                      ? new Date(appointment.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-slate-100 bg-slate-50 p-5 transition-colors dark:border-zinc-800 dark:bg-[#131314]">
                <div>
                  <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Identitas Pasien
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Nama Lengkap
                      </span>
                      <span className="font-extrabold text-zinc-950 uppercase transition-colors dark:text-zinc-100">
                        {patientProfile?.name || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        NIK
                      </span>
                      <span className="font-extrabold text-zinc-950 transition-colors dark:text-zinc-100">
                        {patientProfile?.nik || 'Belum diatur'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Alamat Domisili
                      </span>
                      <span className="text-right leading-relaxed font-bold text-zinc-950 transition-colors dark:text-zinc-100">
                        {patientProfile?.address || 'Belum ada alamat terdaftar.'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Unit Layanan Medis
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Layanan
                      </span>
                      <span className="font-extrabold text-teal-700 transition-colors dark:text-teal-400">
                        {appointment?.department?.name || 'Poliklinik'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Dokter Praktik
                      </span>
                      <span className="font-extrabold text-zinc-950 uppercase transition-colors dark:text-zinc-100">
                        {appointment?.doctor?.user?.name || 'Belum ditentukan'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Jadwal Kunjungan
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Tanggal Kunjungan
                      </span>
                      <span className="font-extrabold text-zinc-950 transition-colors dark:text-zinc-100">
                        {new Date(appointment.scheduledAt).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Jam Sesi
                      </span>
                      <span className="font-extrabold text-zinc-950 transition-colors dark:text-zinc-100">
                        {new Date(appointment.scheduledAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Catatan Keluhan Utuh
                  </h4>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-zinc-800 dark:bg-[#1e1f20]">
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap text-zinc-700 transition-colors dark:text-zinc-300">
                      {appointment.notes || (
                        <span className="text-slate-400 italic dark:text-zinc-600">
                          Tidak ada catatan keluhan yang disertakan oleh pasien saat pendaftaran.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {!isCancelledOrCompleted && (
                <div className="animate-in fade-in flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm transition-colors duration-500 dark:border-amber-900/50 dark:bg-amber-900/20">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-amber-500 transition-colors dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h5 className="mb-1 text-xs font-bold text-amber-800 transition-colors dark:text-amber-300">
                      Pengingat Kehadiran
                    </h5>
                    <p className="text-xs leading-relaxed font-medium text-amber-700 transition-colors dark:text-amber-400/80">
                      Mohon hadir tepat waktu sesuai jadwal sesi Anda. Jika Anda datang terlambat
                      atau tidak datang, maka jadwal pemeriksaan akan dianggap batal secara
                      otomatis.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white p-6 transition-colors dark:border-zinc-800 dark:bg-[#1e1f20]">
              {isCheckInTime ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <button
                    onClick={handleCheckInClick}
                    disabled={isCheckingIn}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-4 text-sm font-black tracking-wide text-white uppercase shadow-lg shadow-teal-500/20 transition-all outline-none hover:bg-teal-700 focus:ring-4 focus:ring-teal-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-teal-700 dark:hover:bg-teal-600 dark:focus:ring-teal-700/30"
                  >
                    {isCheckingIn ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>{' '}
                        Memverifikasi Kehadiran...
                      </>
                    ) : (
                      'SAYA SUDAH DI KLINIK & AMBIL ANTREAN'
                    )}
                  </button>
                  <p className="mt-3 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase transition-colors dark:text-zinc-500">
                    Waktu check-in Anda telah tiba
                  </p>
                </div>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full rounded-xl border border-slate-200 bg-white py-4 font-extrabold text-slate-700 shadow-sm transition-all outline-none hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                >
                  Tutup Detail Reservasi
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </>
  )
}
