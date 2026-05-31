import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import QueueVisitFlow from '../../components/patient/QueueVisitFlow'
import QueueWaitTimePanel from '../../components/patient/QueueWaitTimePanel'
import { DoctorNotesSection } from '../../components/shared/DoctorNotesDisplay'
import { useQueueLiveEstimate } from '../../hooks/useQueueLiveEstimate'
import apiClient from '../../lib/apiClient'
import { buildWaitTimeContext, canShowWaitCountdown, formatSessionTimeLabel } from '../../lib/waitTimeEstimate'
import { useAlertStore } from '../../store/alertStore'
import { useQueueStore } from '../../store/queueStore'
import type { Queue } from '../../lib/types'

const POLL_INTERVAL_MS = 7000

const STATUS_STYLE: Record<string, string> = {
  WAITING:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  CALLED:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  IN_PROGRESS:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  DONE: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  SKIPPED:
    'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  CANCELLED:
    'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
}

const STATUS_LABEL: Record<string, string> = {
  WAITING: 'Menunggu',
  CALLED: 'Giliran Anda',
  IN_PROGRESS: 'Diperiksa',
  DONE: 'Selesai',
  SKIPPED: 'Dilewati',
  CANCELLED: 'Dibatalkan',
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 font-medium text-slate-500 dark:text-zinc-400">{label}</span>
      <span className="text-right text-zinc-950 dark:text-zinc-100">{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:text-zinc-500">
        {title}
      </h4>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

export default function PatientQueueDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const showAlert = useAlertStore((s) => s.showAlert)
  const markVisitStage = useQueueStore((s) => s.markVisitStage)
  const [queue, setQueue] = useState<Queue | null>(null)
  const [loadedId, setLoadedId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)
  const [isPharmacyCompleting, setIsPharmacyCompleting] = useState(false)
  const prevStatusRef = useRef<string | null>(null)
  const prevStageRef = useRef<string | null>(null)

  const isLoading = id !== loadedId && id !== errorId
  const error = id === errorId ? 'Gagal memuat detail kunjungan. Silakan coba lagi.' : null
  const isLive = queue != null && !['DONE', 'CANCELLED'].includes(queue.status)
  const { liveEstimate, isLoading: isLoadingEstimate } = useQueueLiveEstimate(queue)
  const showWaitPanel =
    queue != null && (canShowWaitCountdown(queue, liveEstimate) || isLoadingEstimate)

  const reloadQueue = useCallback(async () => {
    if (!id) return null
    const res = await apiClient.get(`/queues/${id}`)
    const data = res.data.data as Queue
    setQueue(data)
    setLoadedId(id)
    return data
  }, [id])

  const applyQueueUpdate = useCallback(
    (data: Queue, fromPoll = false) => {
      if (fromPoll && prevStatusRef.current && prevStatusRef.current !== data.status) {
        showAlert(
          `Status antrean diperbarui: ${STATUS_LABEL[data.status] ?? data.status}`,
          data.status === 'CALLED' ? 'success' : 'info'
        )
      }
      if (
        fromPoll &&
        prevStageRef.current &&
        data.currentVisitStage &&
        prevStageRef.current !== data.currentVisitStage
      ) {
        showAlert('Tahap kunjungan Anda telah diperbarui.', 'info')
      }
      prevStatusRef.current = data.status
      prevStageRef.current = data.currentVisitStage ?? null
      setQueue(data)
    },
    [showAlert]
  )

  useEffect(() => {
    if (!id) return
    let cancelled = false
    apiClient
      .get(`/queues/${id}`)
      .then((res) => {
        if (!cancelled) {
          const data = res.data.data as Queue
          prevStatusRef.current = data.status
          prevStageRef.current = data.currentVisitStage ?? null
          setQueue(data)
          setLoadedId(id)
        }
      })
      .catch(() => {
        if (!cancelled) setErrorId(id)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!id || !queue || !isLive) return

    const interval = setInterval(async () => {
      try {
        const res = await apiClient.get(`/queues/${id}`)
        applyQueueUpdate(res.data.data as Queue, true)
      } catch {
        /* polling errors are silent */
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [id, queue, isLive, applyQueueUpdate])

  const handlePharmacyComplete = async () => {
    if (!id) return
    setIsPharmacyCompleting(true)
    try {
      const updated = await markVisitStage(id, 'PHARMACY_COMPLETE')
      if (updated) setQueue(updated)
      else await reloadQueue()
    } finally {
      setIsPharmacyCompleting(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-700 ease-out">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/portal/queues')}
          className="mt-1 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs tracking-wide text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
        <div>
          <h1 className="font-['Manrope'] text-3xl font-extrabold tracking-tighter text-zinc-950 dark:text-white">
            Detail Kunjungan
          </h1>
          {queue && (
            <p className="mt-1 font-mono text-xs font-medium tracking-widest text-slate-400 uppercase dark:text-zinc-500">
              ID: {queue.id.substring(0, 8)}
              {isLive && (
                <span className="ml-3 inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-16 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
            <p className="text-xs tracking-widest text-teal-700 uppercase dark:text-teal-500">
              Memuat detail...
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-900/50 dark:bg-red-900/10">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => navigate('/portal/queues')}
            className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Kembali ke Riwayat
          </button>
        </div>
      )}

      {/* Content */}
      {!isLoading && queue && (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Queue number + status card */}
          <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20] lg:col-span-3">
            <div>
              <p className="mb-2 text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-500">
                Nomor Urut Antrean
              </p>
              <span className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 font-mono text-4xl text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-100">
                {queue.queueNumber}
              </span>
            </div>
            <div className="text-right">
              <p className="mb-2 text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-500">
                Status
              </p>
              <span
                className={`inline-flex rounded-xl border px-5 py-2.5 text-[11px] tracking-widest uppercase ${STATUS_STYLE[queue.status] ?? 'border-slate-200 bg-slate-50 text-slate-500'}`}
              >
                {STATUS_LABEL[queue.status] ?? queue.status}
              </span>
            </div>
          </div>

          {showWaitPanel && queue && (
            <div className="lg:col-span-3">
              {isLoadingEstimate && !buildWaitTimeContext(queue, liveEstimate) ? (
                <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-6 text-center dark:border-teal-900/40 dark:bg-teal-500/10">
                  <p className="text-xs tracking-widest text-teal-700 uppercase dark:text-teal-400">
                    Menghitung prediksi waktu tunggu...
                  </p>
                </div>
              ) : (
                <QueueWaitTimePanel queue={queue} liveEstimate={liveEstimate} variant="prominent" />
              )}
            </div>
          )}

          <QueueVisitFlow
            status={queue.status}
            doctorNotes={queue.doctorNotes}
            visitFlow={queue.visitFlow}
            nextDestination={queue.nextDestination}
            onPharmacyComplete={handlePharmacyComplete}
            isPharmacyCompleting={isPharmacyCompleting}
            className="lg:col-span-3"
          />

          {/* Identitas Pasien */}
          <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
            <Section title="Identitas Pasien">
              <DetailRow label="Nama Lengkap" value={queue.patient?.user?.name || '-'} />
              <DetailRow label="NIK" value={queue.patient?.nik || 'Belum diatur'} />
              <DetailRow label="No. BPJS" value={queue.patient?.bpjsNumber || '-'} />
            </Section>
          </div>

          {/* Unit Layanan Medis */}
          <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
            <Section title="Unit Layanan Medis">
              <DetailRow
                label="Layanan"
                value={
                  <span className="text-teal-700 dark:text-teal-400">
                    {queue.department?.name || 'Poliklinik'}
                  </span>
                }
              />
              <DetailRow
                label="Dokter Praktik"
                value={
                  <span className="uppercase">{queue.doctor?.user?.name || 'Belum ditentukan'}</span>
                }
              />
            </Section>
          </div>

          {/* Waktu Kunjungan */}
          <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
            <Section title="Waktu Kunjungan">
              <DetailRow
                label="Tanggal"
                value={new Date(queue.queueDate).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              />
              <DetailRow
                label="Jam Sesi"
                value={formatSessionTimeLabel(queue)}
              />
              <DetailRow
                label="Didaftarkan"
                value={
                  queue.createdAt ? new Date(queue.createdAt).toLocaleDateString('id-ID') : '-'
                }
              />
            </Section>
          </div>

          {/* Catatan Keluhan */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20] lg:col-span-3">
            <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:text-zinc-500">
              Catatan Keluhan Awal Pasien
            </h4>
            <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
              {queue.notes || (
                <span className="text-slate-400 italic dark:text-zinc-600">
                  Tidak ada catatan keluhan tertulis saat pendaftaran.
                </span>
              )}
            </p>
          </div>

          {queue.status === 'DONE' && (
            <DoctorNotesSection doctorNotes={queue.doctorNotes} variant="page" />
          )}
        </div>
      )}
    </div>
  )
}
