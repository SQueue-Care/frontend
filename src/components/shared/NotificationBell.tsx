import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  notificationsPagePath,
  useNotificationStore,
  type AppNotification,
} from '../../store/notificationStore'

const TYPE_LABELS: Record<string, string> = {
  GLOBAL: 'Pengumuman',
  QUEUE_STATUS: 'Antrean',
  BILLING: 'Tagihan',
  SYSTEM: 'Sistem',
}

const TYPE_COLORS: Record<string, string> = {
  GLOBAL: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  QUEUE_STATUS:
    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
  BILLING:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  SYSTEM:
    'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

function NotificationItemHeader({ item }: { item: AppNotification }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{item.title}</p>
      <span
        className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase ${TYPE_COLORS[item.type] ?? TYPE_COLORS.SYSTEM}`}
      >
        {TYPE_LABELS[item.type] ?? item.type}
      </span>
    </div>
  )
}

function NotificationItem({
  item,
  onClick,
}: {
  item: AppNotification
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50 ${
        item.isRead
          ? 'border-transparent bg-transparent'
          : 'border-teal-100 bg-teal-50/50 dark:border-teal-500/20 dark:bg-teal-500/5'
      }`}
    >
      <NotificationItemHeader item={item} />
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
        {item.message}
      </p>
      <p className="mt-1.5 text-[10px] font-bold text-slate-400 dark:text-zinc-500">
        {formatRelativeTime(item.createdAt)}
      </p>
    </button>
  )
}

interface NotificationBellProps {
  pollIntervalMs?: number
}

export default function NotificationBell({ pollIntervalMs = 30_000 }: NotificationBellProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead } =
    useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void fetchNotifications()
    const interval = setInterval(() => void fetchNotifications(), pollIntervalMs)
    return () => clearInterval(interval)
  }, [fetchNotifications, pollIntervalMs])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = async (item: AppNotification) => {
    if (!item.isRead) await markRead(item.id)
    setIsOpen(false)
    if (item.link) {
      navigate(item.link)
    } else if (user?.role) {
      navigate(notificationsPagePath(user.role))
    }
  }

  const fullPagePath = user?.role ? notificationsPagePath(user.role) : '/portal/notifications'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="relative flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 shadow-sm transition-all hover:bg-slate-100 hover:text-teal-600 focus:outline-none dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-teal-400"
        title="Notifikasi"
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ''}`}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="animate-in fade-in zoom-in-95 absolute top-full right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#1e1f20] sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-zinc-800">
            <h3 className="font-['Manrope'] text-sm font-extrabold text-zinc-900 dark:text-white">
              Notifikasi
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500 dark:text-zinc-400">
                Belum ada notifikasi.
              </p>
            ) : (
              <div className="space-y-1">
                {notifications.slice(0, 8).map((item) => (
                  <NotificationItem
                    key={item.id}
                    item={item}
                    onClick={() => void handleItemClick(item)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-2 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                navigate(fullPagePath)
              }}
              className="w-full rounded-xl py-2.5 text-center text-xs font-black tracking-wide text-teal-600 uppercase transition-colors hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-500/10"
            >
              Lihat Semua
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
