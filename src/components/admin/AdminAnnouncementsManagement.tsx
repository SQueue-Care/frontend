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
  info: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
  warning: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  service: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400',
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
    <div className="animate-in fade-in space-y-8 duration-500">
      
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">Pusat Informasi</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Kelola pengumuman, pemberitahuan layanan, dan informasi operasional.
          </p>
        </div>
        
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 rounded-xl bg-teal-600 px-6 py-3 text-xs font-bold tracking-wide text-white uppercase shadow-md shadow-teal-600/20 transition-all hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-lg dark:bg-teal-500 dark:text-zinc-900 dark:shadow-teal-900/40 dark:hover:bg-teal-400"
        >
          + Buat Pengumuman
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 pt-24 backdrop-blur-sm dark:bg-[#131314]/80">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl dark:border dark:border-zinc-800 dark:bg-[#1e1f20]">
            <form onSubmit={(e) => void handleSubmit(e)}>
              <h3 className="mb-6 font-['Manrope'] text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {editing ? 'Edit Pengumuman' : 'Pengumuman Baru'}
              </h3>
              
              <div className="grid gap-5 sm:grid-cols-2">
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
                    placeholder="Pilih kategori"
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
                    placeholder="Pilih target"
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
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Aktif Dari</span>
                  <input
                    type="datetime-local"
                    value={form.activeFrom}
                    onChange={(e) => setForm((f) => ({ ...f, activeFrom: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-800 dark:bg-[#131314] dark:text-white dark:focus:border-teal-500 dark:[color-scheme:dark]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Aktif Hingga <span className="normal-case opacity-60">(opsional)</span></span>
                  <input
                    type="datetime-local"
                    value={form.activeTo}
                    onChange={(e) => setForm((f) => ({ ...f, activeTo: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-800 dark:bg-[#131314] dark:text-white dark:focus:border-teal-500 dark:[color-scheme:dark]"
                  />
                </label>
                
                <div className="sm:col-span-2 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-zinc-800/50 dark:bg-[#131314]/50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600 dark:border-zinc-700 dark:bg-[#1e1f20] dark:checked:bg-teal-500 accent-teal-600 transition-colors"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Pengumuman berstatus aktif</span>
                  </label>
                  {!editing && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.notifyUsers}
                        onChange={(e) => setForm((f) => ({ ...f, notifyUsers: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600 dark:border-zinc-700 dark:bg-[#1e1f20] dark:checked:bg-teal-500 accent-teal-600 transition-colors"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                        Kirim notifikasi lonceng ke pengguna target
                      </span>
                    </label>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:bg-[#1e1f20] dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-all hover:bg-teal-700 dark:bg-teal-500 dark:text-zinc-900 dark:hover:bg-teal-400 shadow-md shadow-teal-600/20 dark:shadow-teal-900/40"
                >
                  Simpan Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-zinc-800">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/80 p-1 dark:border-zinc-800 dark:bg-[#131314]">
          {(['active', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                filter === f
                  ? 'bg-white text-teal-700 shadow-sm dark:bg-[#1e1f20] dark:text-teal-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {f === 'active' ? 'Aktif' : 'Semua'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {displayed.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-zinc-800 dark:bg-[#131314]">
            <svg className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Belum ada pengumuman dalam kategori ini.</p>
          </div>
        ) : (
          displayed.map((item) => (
            <article
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl dark:border-zinc-800 dark:bg-[#1e1f20] dark:hover:border-teal-800/50"
            >
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase ${CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.info}`}
                  >
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                  <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-400">
                    Target: {TARGET_LABELS[item.targetRole]}
                  </span>
                  {!item.isActive && (
                    <span className="inline-flex items-center rounded-lg bg-rose-50 px-2.5 py-1 text-[10px] font-bold tracking-widest text-rose-600 uppercase dark:bg-rose-500/10 dark:text-rose-400">
                      Nonaktif
                    </span>
                  )}
                </div>
                
                <h2 className="mb-3 font-['Manrope'] text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </h2>
                <p className="mb-6 text-sm font-medium leading-relaxed text-slate-600 dark:text-zinc-400">
                  {item.body}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5 dark:border-zinc-800/80">
                <time className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                  {new Date(item.activeFrom).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-lg bg-slate-50 px-4 py-2 text-[10px] font-bold tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    className="rounded-lg bg-rose-50 px-4 py-2 text-[10px] font-bold tracking-widest text-rose-600 uppercase transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}