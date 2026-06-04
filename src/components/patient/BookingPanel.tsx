import { useEffect, useMemo, useRef, useState } from 'react'
import {
  formatBookingDateLabel,
  formatScheduleTimeRange,
  getDayOfWeekFromDateKey,
  isScheduleAvailable,
  pickFirstAvailableSchedule,
  toDateKey,
} from '../../lib/bookingFlow'
import { getErrorMessage } from '../../lib/errors'
import { toQueueWaitDisplay } from '../../lib/waitTimeEstimate'
import { useAlertStore } from '../../store/alertStore'
import { useAuthStore } from '../../store/authStore'
import { useBookingStore } from '../../store/bookingStore'
import { usePredictionStore } from '../../store/predictionStore'
import WaitTimeEstimateCard from './WaitTimeEstimateCard'

type BookingResult = {
  id?: string
  queueNumber?: string
  estimatedWaitTime?: number
  waitKategori?: string | null
  waitingAhead?: number
  waitSource?: string
  isAppointment: boolean
}

interface BookingPanelProps {
  isOpen: boolean
  onClose: () => void
  step: number
  selectedDept: { id: string; name: string } | null
  patientProfile: {
    name: string
    nik: string
    birthDate: string
  } | null
  onNext: () => void
  onPrev: () => void
  onBookingSuccess?: (id: string, isAppointment: boolean) => void
  hasActiveQueue?: boolean
}

const BOOKING_STEPS = [
  { id: 1, label: 'Dokter & jadwal' },
  { id: 2, label: 'Periksa data' },
  { id: 3, label: 'Selesai' },
]

function generateNextDays(daysCount: number) {
  const dates: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push(date)
  }
  return dates
}

function StepHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      {description && (
        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">{description}</p>
      )}
    </div>
  )
}

export default function BookingPanel({
  isOpen,
  onClose,
  step,
  selectedDept,
  patientProfile,
  onNext,
  onPrev,
  onBookingSuccess,
  hasActiveQueue,
}: BookingPanelProps) {
  const {
    departmentDoctors,
    doctorSchedules,
    departmentAvailability,
    isLoadingDoctors,
    isLoadingSchedules,
    isSubmitting,
    fetchDoctorsByDepartment,
    fetchSchedulesByDoctor,
    fetchDepartmentAvailability,
    resolveFirstAvailableSlot,
    submitBooking,
    resetBookingState,
  } = useBookingStore()
  const showAlert = useAlertStore((state) => state.showAlert)
  const patientId = useAuthStore((state) => state.user?.patient?.id)
  const {
    waitTimeEstimate,
    isLoading: isLoadingEstimate,
    fetchWaitTime,
    clearWaitTime,
  } = usePredictionStore()

  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [queueResult, setQueueResult] = useState<BookingResult | null>(null)
  const [isResolvingSlot, setIsResolvingSlot] = useState(false)
  const skipScheduleFetchRef = useRef(false)

  const availableDates = useMemo(() => generateNextDays(14), [])
  const dateKeys = useMemo(() => availableDates.map(toDateKey), [availableDates])

  const isTodayBooking = useMemo(() => {
    if (!selectedDate) return false
    return selectedDate === toDateKey(new Date())
  }, [selectedDate])

  const selectedDoctor = departmentDoctors.find((d) => d.id === selectedDoctorId)
  const selectedSchedule = doctorSchedules.find((s) => s.id === selectedScheduleId)

  const previewEstimate = waitTimeEstimate ? toQueueWaitDisplay(waitTimeEstimate) : null
  const successEstimate =
    queueResult && !queueResult.isAppointment && (queueResult.estimatedWaitTime ?? 0) > 0
      ? {
          minutes: queueResult.estimatedWaitTime!,
          kategori: queueResult.waitKategori,
          waitingAhead: queueResult.waitingAhead,
          source: queueResult.waitSource,
        }
      : null

  const isScheduleStepLoading = isResolvingSlot || isLoadingSchedules

  useEffect(() => {
    if (isOpen && selectedDept) {
      fetchDoctorsByDepartment(selectedDept.id)
    }
  }, [isOpen, selectedDept, fetchDoctorsByDepartment])

  useEffect(() => {
    if (!selectedDoctorId || !selectedDate || !selectedDept) return
    if (skipScheduleFetchRef.current) {
      skipScheduleFetchRef.current = false
      return
    }

    const dayOfWeek = getDayOfWeekFromDateKey(selectedDate)
    void fetchSchedulesByDoctor(selectedDoctorId, dayOfWeek, selectedDate)
    void fetchDepartmentAvailability(selectedDept.id, selectedDate, selectedDoctorId)
  }, [
    selectedDoctorId,
    selectedDate,
    selectedDept,
    fetchSchedulesByDoctor,
    fetchDepartmentAvailability,
  ])

  useEffect(() => {
    if (isResolvingSlot || isLoadingSchedules || !selectedDoctorId || !selectedDate) return

    const current = selectedScheduleId
      ? doctorSchedules.find((schedule) => schedule.id === selectedScheduleId)
      : null
    if (current && isScheduleAvailable(current, departmentAvailability)) return

    const picked = pickFirstAvailableSchedule(doctorSchedules, departmentAvailability)
    setSelectedScheduleId(picked?.id ?? null)
  }, [
    doctorSchedules,
    departmentAvailability,
    isLoadingSchedules,
    isResolvingSlot,
    selectedDoctorId,
    selectedDate,
    selectedScheduleId,
  ])

  useEffect(() => {
    if (step !== 2 || !isTodayBooking || !selectedDept?.id || !selectedDoctorId) {
      clearWaitTime()
      return
    }

    void fetchWaitTime({
      departmentId: selectedDept.id,
      doctorId: selectedDoctorId,
      patientId,
      scheduleId: selectedScheduleId ?? undefined,
      queueDate: selectedDate,
    })
  }, [
    step,
    isTodayBooking,
    selectedDept?.id,
    selectedDoctorId,
    selectedScheduleId,
    selectedDate,
    patientId,
    fetchWaitTime,
    clearWaitTime,
  ])

  const handleClose = () => {
    setSelectedDoctorId(null)
    setSelectedDate('')
    setSelectedScheduleId(null)
    setNotes('')
    setQueueResult(null)
    setIsResolvingSlot(false)
    clearWaitTime()
    resetBookingState()
    onClose()
  }

  const handleSelectDoctor = async (doctorId: string) => {
    if (!selectedDept || doctorId === selectedDoctorId) return

    setSelectedDoctorId(doctorId)
    setSelectedScheduleId(null)
    setSelectedDate('')
    setIsResolvingSlot(true)

    try {
      const result = await resolveFirstAvailableSlot(doctorId, selectedDept.id, dateKeys)
      if (result) {
        skipScheduleFetchRef.current = true
        setSelectedDate(result.date)
        setSelectedScheduleId(result.scheduleId)
      }
    } finally {
      setIsResolvingSlot(false)
    }
  }

  const handleSelectDate = (dateKey: string) => {
    setSelectedDate(dateKey)
    setSelectedScheduleId(null)
  }

  const handleConfirmBooking = async () => {
    if (!selectedDept || !selectedDoctorId || !selectedScheduleId || !selectedDate) return
    try {
      const result = await submitBooking({
        departmentId: selectedDept.id,
        doctorId: selectedDoctorId,
        scheduleId: selectedScheduleId,
        date: `${selectedDate}T12:00:00.000Z`,
        notes,
      })
      setQueueResult(result)
      onNext()

      if (onBookingSuccess && result.id) {
        onBookingSuccess(result.id, result.isAppointment)
      }
    } catch (err: unknown) {
      showAlert(
        getErrorMessage(err, 'Gagal mendaftar. Silakan coba lagi atau pilih jadwal lain.'),
        'error',
      )
    }
  }

  const canContinueStep1 = Boolean(selectedDoctorId && selectedDate && selectedScheduleId)

  return (
    <>
      <div
        className={`fixed inset-0 z-80 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'}`}
        onClick={step === 3 ? handleClose : undefined}
      />

      <div
        className={`fixed inset-y-0 right-0 z-90 flex w-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-500 ease-in-out sm:max-w-lg dark:border-zinc-800 dark:bg-[#1e1f20] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-5 py-5 dark:border-zinc-800 dark:bg-[#131314]/50 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-['Manrope'] text-xl font-bold text-zinc-950 sm:text-2xl dark:text-zinc-100">
                Ambil Antrean
              </h2>
              <p className="mt-1 text-sm text-teal-700 dark:text-teal-400">
                {selectedDept?.name ?? 'Poliklinik'}
              </p>
            </div>
            {step !== 3 && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-100 dark:border-zinc-700 dark:bg-[#1e1f20] dark:hover:bg-zinc-800"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {step < 3 && (
            <div className="mt-5 flex items-center gap-2">
              {BOOKING_STEPS.slice(0, 2).map((item, index) => {
                const active = step >= item.id
                return (
                  <div key={item.id} className="flex min-w-0 flex-1 items-center gap-2">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        active
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500'
                      }`}
                    >
                      {item.id}
                    </div>
                    <span
                      className={`truncate text-sm font-medium ${
                        active ? 'text-zinc-900 dark:text-zinc-100' : 'text-slate-400 dark:text-zinc-500'
                      }`}
                    >
                      {item.label}
                    </span>
                    {index === 0 && <div className="mx-1 h-px flex-1 bg-slate-200 dark:bg-zinc-700" />}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          {step === 1 && (
            <div className="space-y-8">
              <section>
                <StepHeader
                  title="1. Pilih dokter"
                  description="Setelah memilih dokter, tanggal dan jam praktik pertama yang tersedia akan dipilih otomatis."
                />
                {isLoadingDoctors ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-zinc-700">
                    Memuat daftar dokter...
                  </p>
                ) : departmentDoctors.length === 0 ? (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-zinc-800 dark:bg-[#131314]">
                    Belum ada dokter di poliklinik ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {departmentDoctors.map((doc) => {
                      const isSelected = selectedDoctorId === doc.id
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => void handleSelectDoctor(doc.id)}
                          className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                            isSelected
                              ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-900/20'
                              : 'border-slate-200 bg-white hover:border-teal-200 dark:border-zinc-800 dark:bg-[#131314]'
                          }`}
                        >
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${
                              isSelected
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {doc.user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                              {doc.user.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">{doc.specialization}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>

              {selectedDoctorId && (
                <section>
                  <StepHeader
                    title="2. Pilih tanggal"
                    description="Geser untuk melihat tanggal lain jika jadwal pilihan penuh."
                  />
                  <div className="flex snap-x gap-2 overflow-x-auto pb-2">
                    {availableDates.map((date) => {
                      const dateKey = toDateKey(date)
                      const isSelected = selectedDate === dateKey
                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() => handleSelectDate(dateKey)}
                          className={`flex w-[4.75rem] shrink-0 snap-center flex-col items-center rounded-2xl border-2 py-3 transition-all ${
                            isSelected
                              ? 'border-teal-500 bg-teal-600 text-white shadow-md'
                              : 'border-slate-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-[#131314]'
                          }`}
                        >
                          <span className={`text-xs ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                            {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                          </span>
                          <span className="text-2xl font-bold tabular-nums">{date.getDate()}</span>
                          <span className={`text-xs ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                            {date.toLocaleDateString('id-ID', { month: 'short' })}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              {selectedDoctorId && selectedDate && (
                <section>
                  <StepHeader title="3. Pilih jam praktik" />
                  {departmentAvailability && (
                    <p
                      className={`mb-3 rounded-xl border px-4 py-3 text-sm ${
                        departmentAvailability.quota.isFull
                          ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-500/10 dark:text-rose-300'
                          : 'border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-900/40 dark:bg-teal-500/10 dark:text-teal-200'
                      }`}
                    >
                      Kuota poli: {departmentAvailability.quota.remaining} dari{' '}
                      {departmentAvailability.quota.total} slot masih tersedia
                    </p>
                  )}
                  {isScheduleStepLoading ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                      Mencari jadwal tersedia...
                    </p>
                  ) : doctorSchedules.length === 0 ? (
                    <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-zinc-800 dark:bg-[#131314]">
                      Tidak ada jadwal dokter pada tanggal ini. Silakan pilih tanggal lain.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {doctorSchedules.map((sched) => {
                        const isSelected = selectedScheduleId === sched.id
                        const isFull = !isScheduleAvailable(sched, departmentAvailability)
                        const remaining = sched.remaining ?? sched.capacity
                        return (
                          <button
                            key={sched.id}
                            type="button"
                            disabled={isFull}
                            onClick={() => !isFull && setSelectedScheduleId(sched.id)}
                            className={`rounded-2xl border-2 p-4 text-left transition-all ${
                              isFull
                                ? 'cursor-not-allowed border-slate-100 opacity-60 dark:border-zinc-800'
                                : isSelected
                                  ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-900/20'
                                  : 'border-slate-200 bg-white hover:border-teal-200 dark:border-zinc-800 dark:bg-[#131314]'
                            }`}
                          >
                            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                              {formatScheduleTimeRange(sched)}
                            </p>
                            <p
                              className={`mt-1 text-sm ${
                                isFull ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-zinc-400'
                              }`}
                            >
                              {isFull ? 'Penuh' : `Tersisa ${remaining} slot`}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </section>
              )}

              {selectedDoctor && selectedDate && selectedSchedule && (
                <section className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 dark:border-teal-900/40 dark:bg-teal-500/10">
                  <p className="text-sm font-semibold text-teal-900 dark:text-teal-200">Ringkasan pilihan</p>
                  <ul className="mt-2 space-y-1 text-sm text-teal-950 dark:text-teal-100">
                    <li>Dokter: {selectedDoctor.user.name}</li>
                    <li>Tanggal: {formatBookingDateLabel(selectedDate)}</li>
                    <li>Jam: {formatScheduleTimeRange(selectedSchedule)}</li>
                  </ul>
                </section>
              )}

              {selectedDoctorId && (
                <section>
                  <StepHeader
                    title="4. Keluhan (opsional)"
                    description="Tuliskan gejala utama agar dokter lebih siap saat pemeriksaan."
                  />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: demam 2 hari, batuk berdahak..."
                    rows={4}
                    className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-100"
                  />
                </section>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <StepHeader
                title="Periksa data pendaftaran"
                description="Pastikan informasi di bawah sudah benar sebelum menyelesaikan pendaftaran."
              />

              <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-zinc-800 dark:bg-[#131314]">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-300">Data pasien</p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Nama</dt>
                      <dd className="text-right font-medium text-zinc-900 dark:text-zinc-100">
                        {patientProfile?.name ?? '-'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">NIK</dt>
                      <dd className="text-right text-zinc-900 dark:text-zinc-100">
                        {patientProfile?.nik || 'Belum diatur'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="border-t border-slate-200 pt-4 dark:border-zinc-700">
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-300">Jadwal kunjungan</p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Poliklinik</dt>
                      <dd className="text-right font-medium text-teal-800 dark:text-teal-300">
                        {selectedDept?.name}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Dokter</dt>
                      <dd className="text-right font-medium text-zinc-900 dark:text-zinc-100">
                        {selectedDoctor?.user.name ?? '-'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Tanggal</dt>
                      <dd className="text-right text-zinc-900 dark:text-zinc-100">
                        {selectedDate ? formatBookingDateLabel(selectedDate) : '-'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Jam</dt>
                      <dd className="text-right text-zinc-900 dark:text-zinc-100">
                        {selectedSchedule ? formatScheduleTimeRange(selectedSchedule) : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {notes.trim() && (
                  <div className="border-t border-slate-200 pt-4 dark:border-zinc-700">
                    <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-300">Keluhan</p>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{notes.trim()}</p>
                  </div>
                )}
              </div>

              {isTodayBooking && (
                <div>
                  {isLoadingEstimate && (
                    <p className="text-center text-sm text-teal-700 dark:text-teal-400">
                      Menghitung perkiraan waktu tunggu...
                    </p>
                  )}
                  {previewEstimate && !isLoadingEstimate && (
                    <WaitTimeEstimateCard estimate={previewEstimate} variant="prominent" />
                  )}
                </div>
              )}

              {!isTodayBooking && (
                <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/40 dark:bg-sky-500/10 dark:text-sky-200">
                  Kunjungan di hari lain akan disimpan sebagai reservasi. Anda perlu check-in pada hari
                  H untuk masuk antrean.
                </p>
              )}
            </div>
          )}

          {step === 3 && queueResult && (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-['Manrope'] text-2xl font-bold text-zinc-950 dark:text-zinc-100">
                Pendaftaran berhasil
              </h3>
              <p className="mt-2 max-w-sm text-base text-slate-600 dark:text-zinc-400">
                {queueResult.isAppointment
                  ? 'Reservasi Anda tercatat. Jangan lupa check-in pada hari kunjungan.'
                  : 'Nomor antrean Anda sudah aktif. Silakan menunggu di ruang tunggu.'}
              </p>

              <div className="mt-8 w-full rounded-2xl border-2 border-teal-200 bg-teal-50/50 p-6 dark:border-teal-900/40 dark:bg-teal-500/10">
                <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">Nomor antrean Anda</p>
                <p className="mt-2 font-mono text-6xl font-bold tabular-nums text-teal-700 dark:text-teal-400">
                  {queueResult.queueNumber}
                </p>
              </div>

              {successEstimate && (
                <div className="mt-4 w-full">
                  <WaitTimeEstimateCard estimate={successEstimate} variant="prominent" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white p-5 dark:border-zinc-800 dark:bg-[#1e1f20] sm:px-6">
          {step === 1 && (
            <button
              type="button"
              onClick={onNext}
              disabled={!canContinueStep1 || isScheduleStepLoading}
              className="min-h-12 w-full rounded-xl bg-teal-600 text-base font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-700"
            >
              Lanjut periksa data
            </button>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {hasActiveQueue && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-500/10 dark:text-rose-300">
                  Anda masih punya antrean aktif. Selesaikan atau batalkan antrean tersebut terlebih
                  dahulu.
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={isSubmitting}
                  className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-white text-base font-medium text-slate-700 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-300"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirmBooking()}
                  disabled={isSubmitting || hasActiveQueue}
                  className="min-h-12 flex-[1.4] rounded-xl bg-teal-600 text-base font-semibold text-white hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-700"
                >
                  {isSubmitting ? 'Memproses...' : hasActiveQueue ? 'Antrean masih aktif' : 'Daftar sekarang'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleClose}
              className="min-h-12 w-full rounded-xl border-2 border-teal-600 bg-white text-base font-semibold text-teal-700 dark:bg-[#1e1f20] dark:text-teal-400"
            >
              Selesai
            </button>
          )}
        </div>
      </div>
    </>
  )
}
