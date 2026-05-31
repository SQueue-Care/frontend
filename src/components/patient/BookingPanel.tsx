// src/components/patient/BookingPanel.tsx
import { useEffect, useMemo, useState } from 'react'
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

const generateNextDays = (daysCount: number) => {
  const dates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push(date)
  }
  return dates
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
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [notes, setNotes] = useState<string>('')
  const [queueResult, setQueueResult] = useState<BookingResult | null>(null)

  const availableDates = useMemo(() => generateNextDays(14), [])

  const isTodayBooking = useMemo(() => {
    if (!selectedDate) return false
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return selectedDate.split('T')[0] === today
  }, [selectedDate])

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

  useEffect(() => {
    if (isOpen && selectedDept) {
      fetchDoctorsByDepartment(selectedDept.id)
    }
  }, [isOpen, selectedDept, fetchDoctorsByDepartment])

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      const [year, month, day] = selectedDate.split('-').map(Number)
      const localDateObj = new Date(year, month - 1, day)

      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      const dayOfWeek = days[localDateObj.getDay()]
      fetchSchedulesByDoctor(selectedDoctorId, dayOfWeek, selectedDate)
      if (selectedDept) {
        fetchDepartmentAvailability(selectedDept.id, selectedDate, selectedDoctorId)
      }
    }
  }, [
    selectedDoctorId,
    selectedDate,
    selectedDept,
    fetchSchedulesByDoctor,
    fetchDepartmentAvailability,
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
    })
  }, [
    step,
    isTodayBooking,
    selectedDept?.id,
    selectedDoctorId,
    selectedScheduleId,
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
    clearWaitTime()
    resetBookingState()
    onClose()
  }

  const getSelectedDoctorName = () => {
    const doc = departmentDoctors.find((d) => d.id === selectedDoctorId)
    return doc ? doc.user.name.toUpperCase() : '-'
  }

  const getSelectedScheduleDetail = () => {
    const sched = doctorSchedules.find((s) => s.id === selectedScheduleId)
    if (!sched || !selectedDate) return '-'
    const formattedDate = new Date(selectedDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return `${formattedDate} | ${sched.startTime} - ${sched.endTime}`
  }

  const handleConfirmBooking = async () => {
    if (!selectedDept || !selectedDoctorId || !selectedScheduleId || !selectedDate) return
    try {
      const result = await submitBooking({
        departmentId: selectedDept.id,
        doctorId: selectedDoctorId,
        scheduleId: selectedScheduleId,
        date: `${selectedDate}T12:00:00.000Z`,
        notes: notes,
      })
      setQueueResult(result)
      onNext()

      if (onBookingSuccess && result.id) {
        onBookingSuccess(result.id, result.isAppointment)
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(
        err,
        'Terjadi kesalahan saat mendaftar. Silakan coba lagi atau pilih waktu lain.',
      )
      showAlert(msg, 'error')
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-80 bg-white/40 backdrop-blur-sm transition-all duration-300 dark:bg-[#131314]/80 ${isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'}`}
        onClick={step === 3 ? handleClose : undefined}
      />

      <div
        className={`fixed inset-y-0 right-0 z-90 flex w-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-500 ease-in-out sm:max-w-md md:w-[500px] dark:border-zinc-800 dark:bg-[#1e1f20] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header Panel */}
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6 transition-colors md:p-8 dark:border-zinc-800 dark:bg-[#131314]/50">
          <div>
            <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-zinc-950 transition-colors dark:text-zinc-100">
              Reservasi Antrean
            </h2>
            <p className="mt-0.5 text-sm text-teal-600 transition-colors dark:text-teal-400">
              {selectedDept?.name || 'Poliklinik'}
            </p>
          </div>
          {step !== 3 && (
            <button
              onClick={handleClose}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 dark:focus:ring-zinc-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {step < 3 && (
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-8 py-4 text-[10px] tracking-widest uppercase transition-colors dark:border-zinc-800 dark:bg-[#1e1f20]">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${step >= 1 ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400 dark:bg-[#131314] dark:text-zinc-600'}`}
              >
                1
              </div>
              <span
                className={`transition-colors ${step >= 1 ? 'text-zinc-900 dark:text-zinc-100' : 'text-slate-400 dark:text-zinc-600'}`}
              >
                Jadwal
              </span>
            </div>
            <div className="mx-4 h-px flex-1 bg-slate-200 transition-colors dark:bg-zinc-800" />
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${step >= 2 ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400 dark:bg-[#131314] dark:text-zinc-600'}`}
              >
                2
              </div>
              <span
                className={`transition-colors ${step >= 2 ? 'text-zinc-900 dark:text-zinc-100' : 'text-slate-400 dark:text-zinc-600'}`}
              >
                Konfirmasi
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 scrollbar-none overflow-y-auto p-6 [-ms-overflow-style:none] md:p-8 [&::-webkit-scrollbar]:hidden">
          {/* STEP 1: PILIH DOKTER, TANGGAL, & JADWAL */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-300">
              <section>
                <label className="mb-3 block text-[10px] tracking-widest text-slate-400 uppercase transition-colors dark:text-zinc-500">
                  Pilih Dokter Spesialis
                </label>
                {isLoadingDoctors ? (
                  <div className="animate-pulse rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center text-sm text-slate-400 transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Memuat daftar dokter...
                  </div>
                ) : departmentDoctors.length === 0 ? (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500 transition-colors dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-400">
                    Belum ada dokter di poliklinik ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {departmentDoctors.map((doc) => {
                      const isSelected = selectedDoctorId === doc.id
                      return (
                        <button
                          key={doc.id}
                          onClick={() => {
                            setSelectedDoctorId(doc.id)
                            setSelectedScheduleId(null)
                          }}
                          className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300 outline-none ${isSelected ? 'border-teal-500 bg-teal-50/50 shadow-sm dark:bg-teal-900/20' : 'border-slate-100 bg-white hover:border-teal-200 dark:border-zinc-800 dark:bg-[#131314] dark:hover:border-teal-900/50'}`}
                        >
                          {isSelected && (
                            <div className="animate-in slide-in-from-left-1 absolute top-0 left-0 h-full w-1.5 bg-teal-500" />
                          )}
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg transition-colors ${isSelected ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600 dark:bg-[#1e1f20] dark:text-zinc-500 dark:group-hover:bg-teal-900/40 dark:group-hover:text-teal-400'}`}
                          >
                            {doc.user.name.charAt(0)}
                          </div>
                          <div>
                            <div
                              className={`text-sm uppercase transition-colors ${isSelected ? 'text-teal-800 dark:text-teal-400' : 'text-zinc-900 dark:text-zinc-100'}`}
                            >
                              {doc.user.name}
                            </div>
                            <div className="mt-0.5 text-xs font-medium text-slate-500 transition-colors dark:text-zinc-400">
                              {doc.specialization}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>

              {selectedDoctorId && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <label className="mb-3 block text-[10px] tracking-widest text-slate-400 uppercase transition-colors dark:text-zinc-500">
                    Pilih Tanggal Kunjungan
                  </label>
                  <div className="flex snap-x scrollbar-none gap-3 overflow-x-auto px-1 pt-1 pb-4 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {availableDates.map((date) => {
                      const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                        .toISOString()
                        .split('T')[0]
                      const isSelected = selectedDate === dateString
                      const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' })
                      const dateNum = date.getDate()
                      const monthName = date.toLocaleDateString('id-ID', { month: 'short' })

                      return (
                        <button
                          key={dateString}
                          onClick={() => {
                            setSelectedDate(dateString)
                            setSelectedScheduleId(null)
                          }}
                          className={`flex w-20 shrink-0 snap-center flex-col items-center justify-center gap-1 rounded-2xl border-2 py-3 transition-all duration-300 outline-none ${isSelected ? 'scale-105 border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'border-slate-100 bg-white text-zinc-600 hover:border-teal-200 hover:bg-teal-50 dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-400 dark:hover:border-teal-900/50 dark:hover:bg-teal-900/20'}`}
                        >
                          <span
                            className={`text-[10px] tracking-wider uppercase transition-colors ${isSelected ? 'text-teal-100' : 'text-slate-400 dark:text-zinc-500'}`}
                          >
                            {dayName}
                          </span>
                          <span
                            className={`text-2xl transition-colors ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}
                          >
                            {dateNum}
                          </span>
                          <span
                            className={`text-[10px] uppercase transition-colors ${isSelected ? 'text-teal-100' : 'text-slate-400 dark:text-zinc-500'}`}
                          >
                            {monthName}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              {selectedDoctorId && selectedDate && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  {departmentAvailability && (
                    <div
                      className={`mb-4 rounded-2xl border p-3 text-center text-xs ${ departmentAvailability.quota.isFull ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400' : 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800/50 dark:bg-teal-900/20 dark:text-teal-400' }`}
                    >
                      Kuota poli hari ini: {departmentAvailability.quota.remaining}/
                      {departmentAvailability.quota.total} tersisa
                    </div>
                  )}
                  <label className="mb-3 block text-[10px] tracking-widest text-slate-400 uppercase transition-colors dark:text-zinc-500">
                    Pilih Sesi Waktu
                  </label>
                  {isLoadingSchedules ? (
                    <div className="animate-pulse rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center text-sm text-slate-400 transition-colors dark:border-zinc-800 dark:text-zinc-500">
                      Sinkronisasi jadwal...
                    </div>
                  ) : doctorSchedules.length === 0 ? (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500 transition-colors dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-400">
                      Tidak ada sesi praktik pada tanggal yang dipilih.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {doctorSchedules.map((sched) => {
                        const dayNames: Record<string, string> = {
                          MONDAY: 'Senin',
                          TUESDAY: 'Selasa',
                          WEDNESDAY: 'Rabu',
                          THURSDAY: 'Kamis',
                          FRIDAY: 'Jumat',
                          SATURDAY: 'Sabtu',
                          SUNDAY: 'Minggu',
                        }
                        const dayNameIndo = dayNames[sched.dayOfWeek] || sched.dayOfWeek
                        const isSelected = selectedScheduleId === sched.id
                        const isFull =
                          sched.isFull ||
                          departmentAvailability?.quota.isFull ||
                          (sched.remaining !== undefined && sched.remaining <= 0)
                        const remaining = sched.remaining ?? sched.capacity

                        return (
                          <button
                            key={sched.id}
                            type="button"
                            disabled={isFull}
                            onClick={() => !isFull && setSelectedScheduleId(sched.id)}
                            className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-4 transition-all duration-300 outline-none ${ isFull ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-60 dark:border-zinc-800 dark:bg-[#131314]' : isSelected ? 'scale-[1.02] border-teal-500 bg-teal-50/50 shadow-sm dark:bg-teal-900/20' : 'border-slate-100 bg-white hover:border-teal-200 hover:bg-slate-50 dark:border-zinc-800 dark:bg-[#131314] dark:hover:border-teal-900/50 dark:hover:bg-zinc-800/80' }`}
                          >
                            <span
                              className={`text-[10px] tracking-wider uppercase transition-colors ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-zinc-500'}`}
                            >
                              {dayNameIndo}
                            </span>
                            <span
                              className={`text-base transition-colors ${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300'}`}
                            >
                              {sched.startTime} - {sched.endTime}
                            </span>
                            <div
                              className={`mt-1 rounded-full border px-2.5 py-0.5 text-[10px] transition-colors ${ isFull ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/50 dark:bg-rose-900/30 dark:text-rose-400' : isSelected ? 'border-teal-200 bg-teal-100 text-teal-700 dark:border-teal-800/50 dark:bg-teal-900/40 dark:text-teal-400' : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-zinc-700 dark:bg-[#1e1f20] dark:text-zinc-400' }`}
                            >
                              {isFull ? 'Penuh' : `Tersisa: ${remaining}/${sched.capacity}`}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </section>
              )}

              {selectedScheduleId && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <label className="mb-3 block text-[10px] tracking-widest text-slate-400 uppercase transition-colors dark:text-zinc-500">
                    Keluhan atau Catatan Medis
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan gejala yang dialami..."
                    rows={3}
                    className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition-all placeholder:text-slate-400 hover:border-teal-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:hover:border-teal-900/50"
                  />
                </section>
              )}
            </div>
          )}

          {/* STEP 2: KONFIRMASI */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
              <div className="space-y-6 rounded-3xl border border-slate-100 bg-slate-50 p-5 transition-colors dark:border-zinc-800 dark:bg-[#131314]">
                <div>
                  <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] tracking-widest text-slate-400 uppercase transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Informasi Pasien
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Nama
                      </span>
                      <span className="text-zinc-950 uppercase transition-colors dark:text-zinc-100">
                        {patientProfile?.name || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        NIK
                      </span>
                      <span className="text-zinc-950 transition-colors dark:text-zinc-100">
                        {patientProfile?.nik || 'Belum diatur'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Tgl Lahir
                      </span>
                      <span className="text-zinc-950 transition-colors dark:text-zinc-100">
                        {patientProfile?.birthDate
                          ? new Date(patientProfile.birthDate).toLocaleDateString('id-ID')
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] tracking-widest text-slate-400 uppercase transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Detail Kunjungan
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Layanan
                      </span>
                      <span className="text-teal-700 transition-colors dark:text-teal-400">
                        {selectedDept?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Dokter
                      </span>
                      <span className="text-zinc-950 uppercase transition-colors dark:text-zinc-100">
                        {getSelectedDoctorName()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Jadwal
                      </span>
                      <span className="text-right text-zinc-950 transition-colors dark:text-zinc-100">
                        {getSelectedScheduleDetail()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] tracking-widest text-slate-400 uppercase transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Catatan Keluhan Awal
                  </h4>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-zinc-800 dark:bg-[#1e1f20]">
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap text-zinc-700 transition-colors dark:text-zinc-300">
                      {notes.trim() || (
                        <span className="text-slate-400 italic dark:text-zinc-600">
                          Tidak ada catatan keluhan tambahan.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {isTodayBooking && (
                <div className="space-y-2">
                  {isLoadingEstimate && (
                    <p className="text-center text-xs tracking-widest text-teal-700 uppercase dark:text-teal-500">
                      Menghitung estimasi tunggu...
                    </p>
                  )}
                  {previewEstimate && !isLoadingEstimate && (
                    <WaitTimeEstimateCard estimate={previewEstimate} variant="prominent" />
                  )}
                </div>
              )}

              <p className="text-center text-[10px] leading-relaxed tracking-wide text-slate-500 uppercase italic transition-colors dark:text-zinc-500">
                *Data di atas akan masuk ke dalam rekam medis sistem.
              </p>
            </div>
          )}

          {/* STEP 3: TIKET BERHASIL */}
          {step === 3 && queueResult && (
            <div className="animate-in zoom-in-95 flex flex-col items-center justify-center py-6 text-center duration-500">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 shadow-sm transition-colors dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <svg
                  className="h-10 w-10 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="font-['Manrope'] text-2xl tracking-tight text-zinc-950 transition-colors dark:text-zinc-100">
                Reservasi Berhasil!
              </h3>
              <p className="mt-2 mb-8 text-sm font-medium text-slate-500 transition-colors dark:text-zinc-400">
                {queueResult.isAppointment
                  ? 'Jadwal kunjungan Anda telah dikonfirmasi.'
                  : 'Nomor antrean Anda telah diterbitkan secara digital.'}
              </p>

              <div className="mb-6 w-full rounded-3xl border-2 border-slate-200 bg-slate-50 p-8 shadow-sm transition-colors dark:border-zinc-800 dark:bg-[#131314]">
                <span className="text-[10px] tracking-widest text-slate-400 uppercase transition-colors dark:text-zinc-500">
                  Nomor Urut Pendaftaran
                </span>
                <div className="my-2 font-mono text-6xl tracking-tighter text-teal-600 transition-colors dark:text-teal-400">
                  {queueResult.queueNumber}
                </div>
              </div>

              {successEstimate && (
                <WaitTimeEstimateCard estimate={successEstimate} variant="prominent" />
              )}
            </div>
          )}
        </div>

        {/* Footer Aksi */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/50 p-6 transition-colors dark:border-zinc-800 dark:bg-[#131314]/50">
          {step === 1 && (
            <button
              onClick={onNext}
              disabled={!selectedDoctorId || !selectedDate || !selectedScheduleId}
              className="w-full rounded-xl bg-teal-600 py-4 text-white shadow-lg shadow-teal-600/20 transition-all outline-none hover:bg-teal-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none dark:bg-teal-700 dark:hover:bg-teal-600"
            >
              Lanjutkan Konfirmasi
            </button>
          )}
          {step === 2 && (
            <div className="flex w-full flex-col gap-3">
              {hasActiveQueue && (
                <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs text-rose-700 transition-colors dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                  Peringatan: Anda tidak dapat melanjutkan karena saat ini Anda sedang dalam
                  antrean.
                </div>
              )}

              <div className="flex w-full gap-3">
                <button
                  onClick={onPrev}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-4 text-slate-600 shadow-sm transition-colors outline-none hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Kembali
                </button>

                <button
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting || hasActiveQueue}
                  className={`flex flex-2 items-center justify-center gap-2 rounded-xl py-4 transition-all outline-none ${ hasActiveQueue ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 shadow-none dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-600' : 'bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 active:scale-95 disabled:opacity-50 dark:bg-teal-700 dark:hover:bg-teal-600' }`}
                >
                  {isSubmitting ? (
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
                      </svg>
                      Memproses...
                    </>
                  ) : hasActiveQueue ? (
                    'Anda Sudah Dalam Antrean'
                  ) : (
                    'Konfirmasi Registrasi'
                  )}
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <button
              onClick={handleClose}
              className="w-full rounded-xl border-2 border-teal-600 bg-white py-4 text-teal-700 shadow-sm transition-colors outline-none hover:bg-teal-50 dark:bg-[#1e1f20] dark:text-teal-400 dark:hover:bg-teal-900/20"
            >
              Selesai & Tutup
            </button>
          )}
        </div>
      </div>
    </>
  )
}
