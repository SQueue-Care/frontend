import { useEffect, useState } from 'react'
import { useNotificationStore } from '../../store/notificationStore'

const CATEGORY_STYLES: Record<string, string> = {
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  service:
    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
}

const CATEGORY_LABELS: Record<string, string> = {
  info: 'Informasi',
  warning: 'Penting',
  service: 'Layanan',
}

export default function PatientAnnouncements() {
  const { announcements, fetchAnnouncements } = useNotificationStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void fetchAnnouncements().finally(() => setIsLoading(false))
  }, [fetchAnnouncements])

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Pengumuman resmi fasilitas kesehatan terbaru.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-[#1e1f20]">
          <p className="text-slate-500 dark:text-zinc-400">Belum ada pengumuman aktif.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {announcements.map((item) => (
            <li
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.info}`}
                >
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
                <time className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {new Date(item.activeFrom).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </div>
              <h2 className="mb-2 font-['Manrope'] text-lg font-extrabold text-zinc-900 dark:text-white">
                {item.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
