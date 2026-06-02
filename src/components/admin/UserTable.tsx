// src/components/admin/UserTable.tsx
import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { UserAccount } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'

type TableUser = Record<string, unknown> & {
  id?: string
  user?: UserAccount
  role?: string
  name?: string
  email?: string
}

interface UserTableProps {
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
  title: string
  onManage: (user: TableUser) => void
  onDelete: (userId: string) => void
}

function UserTableInner({ role, title, onManage, onDelete }: UserTableProps) {
  const [data, setData] = useState<TableUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const showAlert = useAlertStore((s) => s.showAlert)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: role,
    specialization: '',
    nik: '',
  })

  const fetchData = async () => {
    try {
      let endpoint = '/users'
      if (role === 'PATIENT') endpoint = '/patients'
      if (role === 'DOCTOR') endpoint = '/doctors'

      const response = await apiClient.get(endpoint)
      let result: TableUser[] = response.data.data || []

      if (endpoint === '/users') {
        result = result.filter((u) => u.role === role)
      }

      setData(result)
    } catch (error) {
      console.error(`Gagal sinkronisasi data ${role}:`, error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        let endpoint = '/users'
        if (role === 'PATIENT') endpoint = '/patients'
        if (role === 'DOCTOR') endpoint = '/doctors'

        const response = await apiClient.get(endpoint)
        let result: TableUser[] = response.data.data || []

        if (endpoint === '/users') {
          result = result.filter((u) => u.role === role)
        }

        if (!cancelled) setData(result)
      } catch (error) {
        console.error(`Gagal sinkronisasi data ${role}:`, error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [role])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      let endpoint = '/auth/register'
      if (role === 'DOCTOR') endpoint = '/doctors'
      if (role === 'PATIENT') endpoint = '/patients'

      const payload: Record<string, string> = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
      }

      if (role === 'DOCTOR') payload.specialization = formData.specialization
      if (role === 'PATIENT' && formData.nik && formData.nik.trim() !== '') {
        payload.nik = formData.nik
      }

      await apiClient.post(endpoint, payload)

      setIsModalOpen(false)
      setFormData({ name: '', email: '', password: '', role: role, specialization: '', nik: '' })
      fetchData()
      showAlert(`Berhasil mendaftarkan ${role} baru!`, 'success')
    } catch (error: unknown) {
      showAlert(
        getErrorMessage(error, 'Gagal membuat akun. Periksa data yang dimasukkan.'),
        'error'
      )
    }
  }

  const filteredData = data.filter((item) => {
    const userObj = item.user || item
    if (!searchQuery) return true

    const lowerCaseQuery = searchQuery.toLowerCase()
    const matchName = userObj.name?.toLowerCase().includes(lowerCaseQuery)
    const matchEmail = userObj.email?.toLowerCase().includes(lowerCaseQuery)

    return matchName || matchEmail
  })

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="mb-1 font-['Manrope'] text-2xl font-extrabold text-zinc-950 dark:text-zinc-100">{title}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Manajemen kredensial dan hak akses untuk unit {role}.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-teal-600 px-6 py-3 text-xs tracking-widest text-white uppercase shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-700 dark:bg-teal-600/90 dark:hover:bg-teal-600"
        >
          + Tambah {role} Baru
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-zinc-800 dark:bg-[#131314]/50">
          <input
            type="text"
            placeholder={`Cari berdasarkan nama atau email...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-72 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-100 dark:placeholder-zinc-500"
          />
        </div>

        {isModalOpen && (
          <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-300 dark:bg-[#131314]/80">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#1e1f20]">
              <div className="border-b border-slate-100 bg-slate-50/50 p-8 text-center dark:border-zinc-800 dark:bg-[#131314]/50">
                <h3 className="text-xl tracking-tighter text-zinc-900 uppercase dark:text-zinc-100">
                  Registrasi {role}
                </h3>
                <p className="mt-1 text-[10px] tracking-widest text-slate-500 uppercase dark:text-zinc-400">
                  Input Kredensial Baru
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-8">
                <div>
                  <label className="mb-2 block text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-400">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-100 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-400">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-100 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-400">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-100 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                {role === 'DOCTOR' && (
                  <div>
                    <label className="mb-2 block text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-400">
                      Spesialisasi
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-100 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                  </div>
                )}

                {role === 'PATIENT' && (
                  <div>
                    <label className="mb-2 block text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-400">
                      Nomor Induk Kependudukan (NIK) -{' '}
                      <span className="text-slate-300 dark:text-zinc-600">Opsional</span>
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-100 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs tracking-widest text-slate-500 uppercase transition-all hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-teal-600 px-4 py-3 text-xs tracking-widest text-white uppercase shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-700 dark:bg-teal-600/90 dark:hover:bg-teal-600"
                  >
                    Simpan Akun
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-500">
              <tr>
                <th className="p-6 pl-8">Identitas Pengguna</th>
                <th className="p-6">Hak Akses</th>
                <th className="p-6">Status Akun</th>
                <th className="p-6 pr-8 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="animate-pulse p-16 text-center text-xs tracking-widest text-teal-700 uppercase dark:text-teal-500"
                  >
                    Sinkronisasi Database...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-16 text-center font-medium text-slate-400 italic dark:text-slate-500"
                  >
                    {searchQuery
                      ? `Tidak ada pengguna yang cocok dengan pencarian "${searchQuery}".`
                      : `Belum ada data ${role.toLowerCase()} ditemukan.`}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const userObj = item.user || item
                  return (
                    <tr
                      key={item.id}
                      className="group transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
                    >
                      <td className="p-6 pl-8 align-top">
                        <div className="font-medium text-zinc-950 uppercase transition-colors group-hover:text-teal-600 dark:text-zinc-100 dark:group-hover:text-teal-400">
                          {userObj.name}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500">
                          {userObj.email}
                        </div>
                      </td>
                      <td className="p-6 align-top">
                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[10px] tracking-widest text-slate-600 uppercase dark:bg-slate-900/50 dark:text-slate-400">
                          {role}
                        </span>
                      </td>
                      <td className="p-6 align-top">
                        <span
                          className={`inline-flex min-w-[100px] items-center justify-center rounded-lg border px-3 py-1 text-[10px] tracking-widest uppercase transition-colors ${
                            userObj.isActive !== false
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'
                          }`}
                        >
                          {userObj.isActive !== false ? 'Aktif' : 'Blokir'}
                        </span>
                      </td>
                      <td className="p-6 pr-8 text-right align-top">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onManage(item)}
                            className="rounded-lg border border-transparent p-2 text-blue-600 transition-colors hover:border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                            title="Edit"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => item.id && onDelete(item.id)}
                            className="rounded-lg border border-transparent p-2 text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                            title="Hapus"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  )
}

export default function UserTable(props: UserTableProps) {
  return <UserTableInner key={props.role} {...props} />
}
