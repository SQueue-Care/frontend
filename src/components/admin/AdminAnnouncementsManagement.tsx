import { useEffect, useState } from 'react'
import { useAlertStore } from '../../store/alertStore'
import { useNotificationStore, type Announcement } from '../../store/notificationStore'
import CustomInput from '../ui/CustomInput'
import CustomSelect from '../ui/CustomSelect'

const CATEGORY_LABELS: Record<string, string> = {
  info: 'Informasi',
  warning: 'Penting',
  service: 'Layanan',
}

const CATEGORY_STYLES: Record<string, string> = {
  info: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  warning:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  service:
    'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
}

const TARGET_LABELS: Record<string, string> = {
  ALL: 'Semua Pengguna',
  PATIENT: 'Pasien',
  DOCTOR: 'Dokter',
  ADMIN: 'Admin',
}

const EMPTY_FORM = {
  title: '',
  body: '',
  priority: 'NORMAL' as Announcement['priority'],
  category: 'info' as Announcement['category'],
  targetRole: 'ALL' as Announcement['targetRole'],
  activeFrom: '',
  activeTo: '',
  isActive: true,
  notifyUsers: true,
}

type AnnouncementFormState = typeof EMPTY_FORM

export default function AdminAnnouncementsManagement() {
  const showAlert = useAlertStore((s) => s.showAlert)
  const { announcements, fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } =
    useNotificationStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState<AnnouncementFormState>(EMPTY_FORM)
  const [filter, setFilter] = useState<'active' | 'all'>('active')

  useEffect(() => {
    void fetchAnnouncements({ includeInactive: filter === 'all' })
  }, [fetchAnnouncements, filter])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (item: Announcement) => {
    setEditing(item)
    setForm({
      title: item.title,
      body: item.body,
      priority: item.priority,
      category: item.category,
      targetRole: item.targetRole,
      activeFrom: item.activeFrom.slice(0, 16),
      activeTo: item.activeTo ? item.activeTo.slice(0, 16) : '',
      isActive: item.isActive,
      notifyUsers: false,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      showAlert('Judul dan isi pengumuman wajib diisi.', 'warning')
      return
    }

    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      priority: form.priority,
      category: form.category.toUpperCase(),
      targetRole: form.targetRole,
      activeFrom: form.activeFrom ? new Date(form.activeFrom).toISOString() : undefined,
      activeTo: form.activeTo ? new Date(form.activeTo).toISOString() : null,
      isActive: form.isActive,
      notifyUsers: form.notifyUsers,
    }

    try {
      if (editing) {
        await updateAnnouncement(editing.id, payload)
        showAlert('Pengumuman diperbarui.', 'success')
      } else {
        await createAnnouncement(payload)
        showAlert('Pengumuman dibuat dan notifikasi dikirim.', 'success')
      }
      setShowForm(false)
      void fetchAnnouncements({ includeInactive: filter === 'all' })
    } catch {
      showAlert('Gagal menyimpan pengumuman.', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus pengumuman ini?')) return
    try {
      await deleteAnnouncement(id)
      showAlert('Pengumuman dihapus.', 'success')
    } catch {
      showAlert('Gagal menghapus pengumuman.', 'error')
    }
  }

  const displayed = filter === 'active' ? announcements.filter((a) => a.isActive) : announcements

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['active', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-xs font-black tracking-wide uppercase transition-colors ${
                filter === f
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-400'
              }`}
            >
              {f === 'active' ? 'Aktif' : 'Semua'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-black tracking-wide text-white uppercase shadow-sm transition-colors hover:bg-teal-700"
        >
          + Buat Pengumuman
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]"
        >
          <h3 className="mb-4 font-['Manrope'] text-lg font-extrabold text-zinc-900 dark:text-zinc-100 dark:text-white">
            {editing ? 'Edit Pengumuman' : 'Pengumuman Baru'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CustomInput
                label="Judul"
                value={form.title}
                onChange={(val) => setForm((f) => ({ ...f, title: val }))}
                placeholder="Contoh: Libur Nasional — Jam Operasional"
              />
            </div>
            <div className="sm:col-span-2">
              <CustomInput
                label="Isi Pengumuman"
                value={form.body}
                onChange={(val) => setForm((f) => ({ ...f, body: val }))}
                placeholder="Tuliskan detail pengumuman..."
                multiline={true}
                rows={4}
              />
            </div>
            <div>
              <CustomSelect
                label="Kategori"
                value={form.category}
                onChange={(val) =>
                  setForm((f) => ({
                    ...f,
                    category: val as Announcement['category'],
                  }))
                }
                options={[
                  { value: 'info', label: 'Informasi' },
                  { value: 'warning', label: 'Penting' },
                  { value: 'service', label: 'Layanan' },
                ]}
              />
            </div>
            <div>
              <CustomSelect
                label="Target"
                value={form.targetRole}
                onChange={(val) =>
                  setForm((f) => ({
                    ...f,
                    targetRole: val as 'ALL' | 'PATIENT' | 'DOCTOR' | 'ADMIN',
                  }))
                }
                options={[
                  { value: 'ALL', label: 'Semua Pengguna' },
                  { value: 'PATIENT', label: 'Pasien' },
                  { value: 'DOCTOR', label: 'Dokter' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
              />
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-500 dark:text-zinc-400">Aktif Dari</span>
              <input
                type="datetime-local"
                value={form.activeFrom}
                onChange={(e) => setForm((f) => ({ ...f, activeFrom: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-[#131314] dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-500 dark:text-zinc-400">Aktif Hingga (opsional)</span>
              <input
                type="datetime-local"
                value={form.activeTo}
                onChange={(e) => setForm((f) => ({ ...f, activeTo: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-[#131314] dark:text-white"
              />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Pengumuman aktif</span>
            </label>
            {!editing && (
              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.notifyUsers}
                  onChange={(e) => setForm((f) => ({ ...f, notifyUsers: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                  Kirim notifikasi ke pengguna target
                </span>
              </label>
            )}
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-black tracking-wide text-white uppercase hover:bg-teal-700"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 dark:border-zinc-800 px-5 py-2.5 text-xs font-black tracking-wide text-slate-600 dark:text-zinc-400 uppercase dark:border-zinc-700 dark:text-zinc-400"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-4">
        {displayed.length === 0 ? (
          <li className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-12 text-center dark:border-zinc-800 dark:bg-[#1e1f20]">
            <p className="text-slate-500 dark:text-zinc-400">Belum ada pengumuman.</p>
          </li>
        ) : (
          displayed.map((item) => (
            <li
              key={item.id}
              className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.info}`}
                >
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
                <span className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] px-2.5 py-1 text-[10px] font-black tracking-widest text-slate-500 dark:text-zinc-400 uppercase dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                  {TARGET_LABELS[item.targetRole]}
                </span>
                {!item.isActive && (
                  <span className="rounded-lg bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase">
                    Nonaktif
                  </span>
                )}
                <time className="ml-auto text-xs font-bold text-slate-500 dark:text-zinc-400 dark:text-slate-400">
                  {new Date(item.activeFrom).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </div>
              <h2 className="mb-2 font-['Manrope'] text-lg font-extrabold text-zinc-900 dark:text-zinc-100 dark:text-white">
                {item.title}
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-zinc-400 dark:text-slate-400">{item.body}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800 px-4 py-2 text-xs font-black tracking-wide text-slate-600 dark:text-zinc-400 uppercase hover:bg-slate-50 dark:hover:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  className="rounded-xl border border-rose-200 dark:border-rose-500/20 px-4 py-2 text-xs font-black tracking-wide text-rose-600 dark:text-rose-400 uppercase hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
