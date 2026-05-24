import { create } from 'zustand'
import apiClient from '../lib/apiClient'

export type NotificationType = 'GLOBAL' | 'QUEUE_STATUS' | 'BILLING' | 'SYSTEM'

export interface AppNotification {
  id: string
  userId: string | null
  role: string | null
  type: NotificationType
  title: string
  message: string
  link: string | null
  readAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  isRead: boolean
}

export interface Announcement {
  id: string
  title: string
  body: string
  priority: 'LOW' | 'NORMAL' | 'HIGH'
  category: 'info' | 'warning' | 'service'
  targetRole: 'ALL' | 'PATIENT' | 'DOCTOR' | 'ADMIN'
  activeFrom: string
  activeTo: string | null
  isActive: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export interface AnnouncementInput {
  title: string
  body: string
  priority?: Announcement['priority']
  category?: string
  targetRole?: Announcement['targetRole']
  activeFrom?: string
  activeTo?: string | null
  isActive?: boolean
  notifyUsers?: boolean
}

interface NotificationStore {
  notifications: AppNotification[]
  unreadCount: number
  announcements: Announcement[]
  isLoading: boolean
  fetchNotifications: (opts?: { unreadOnly?: boolean }) => Promise<void>
  fetchAnnouncements: (opts?: { includeInactive?: boolean }) => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  createAnnouncement: (payload: AnnouncementInput) => Promise<Announcement>
  updateAnnouncement: (id: string, payload: Partial<AnnouncementInput>) => Promise<Announcement>
  deleteAnnouncement: (id: string) => Promise<void>
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  announcements: [],
  isLoading: false,

  fetchNotifications: async (opts) => {
    set({ isLoading: true })
    try {
      const params = opts?.unreadOnly ? { unreadOnly: 'true' } : {}
      const res = await apiClient.get('/notifications', { params })
      const data = res.data.data as { items: AppNotification[]; unreadCount: number }
      set({ notifications: data.items, unreadCount: data.unreadCount })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAnnouncements: async (opts) => {
    const params = opts?.includeInactive ? { includeInactive: 'true' } : {}
    const res = await apiClient.get('/announcements', { params })
    set({ announcements: res.data.data as Announcement[] })
  },

  markRead: async (id) => {
    await apiClient.patch(`/notifications/${id}/read`)
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllRead: async () => {
    await apiClient.patch('/notifications/read-all')
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    }))
  },

  createAnnouncement: async (payload) => {
    const res = await apiClient.post('/announcements', payload)
    const created = res.data.data as Announcement
    set((state) => ({ announcements: [created, ...state.announcements] }))
    return created
  },

  updateAnnouncement: async (id, payload) => {
    const res = await apiClient.patch(`/announcements/${id}`, payload)
    const updated = res.data.data as Announcement
    set((state) => ({
      announcements: state.announcements.map((a) => (a.id === id ? updated : a)),
    }))
    return updated
  },

  deleteAnnouncement: async (id) => {
    await apiClient.delete(`/announcements/${id}`)
    set((state) => ({
      announcements: state.announcements.filter((a) => a.id !== id),
    }))
  },
}))

export function notificationsPagePath(role: string): string {
  if (role === 'DOCTOR') return '/doctor/notifications'
  if (role === 'ADMIN') return '/admin/notifications'
  return '/portal/notifications'
}
