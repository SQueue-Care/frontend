import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore, type AppNotification } from '../../store/notificationStore'

const TYPE_LABELS: Record<string, string> = {
  GLOBAL: 'Pengumuman',
  QUEUE_STATUS: 'Antrean',
  BILLING: 'Tagihan',
  SYSTEM: 'Sistem',
}

function NotificationCard({
  item,
  onOpen,
}: {
  item: AppNotification
  onOpen: (item: AppNotification) => void
}) {
  return (
    <li
      className={`rounded-3xl border bg-white p-5 shadow-sm transition-colors dark:bg-[#1e1f20] ${
        item.isRead
          ? 'border-slate-200 dark:border-zinc-800'
          : 'border-teal-200 bg-teal-50/30 dark:border-teal-500/30 dark:bg-teal-500/5'
      }`}
    >
      <button type="button" onClick={() => onOpen(item)} className="w-full text-left">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            {TYPE_LABELS[item.type] ?? item.type}
          </span>
          {!item.isRead && (
            <span className="rounded-lg bg-teal-100 px-2 py-0.5 text-[10px] font-black text-teal-700 dark:bg-teal-500/20 dark:text-teal-400">
              Baru
            </span>
          )}
          <time className="ml-auto text-xs font-bold text-slate-400 dark:text-zinc-500">
            {new Date(item.createdAt).toLocaleString('id-ID')}
          </time>
        </div>
        <h2 className="mb-1 font-['Manrope'] text-base font-extrabold text-zinc-900 dark:text-white">
          {item.title}
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">{item.message}</p>
      </button>
    </li>
  )
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead, isLoading } =
    useNotificationStore()

  useEffect(() => {
    void fetchNotifications()
  }, [fetchNotifications])

  const handleOpen = async (item: AppNotification) => {
    if (!item.isRead) await markRead(item.id)
    if (item.link) navigate(item.link)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
        </p>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-black tracking-wide text-teal-700 uppercase transition-colors hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400"
          >
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {isLoading && notifications.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-[#1e1f20]">
          <p className="font-medium text-slate-500 dark:text-zinc-400">Belum ada notifikasi.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((item) => (
            <NotificationCard key={item.id} item={item} onOpen={(i) => void handleOpen(i)} />
          ))}
        </ul>
      )}
    </div>
  )
}
