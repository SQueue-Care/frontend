import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';

export default function AdminUserManagement() {
  const { users, fetchUsers, updateUser, deleteUser, isLoading: isUserLoading } = useUserStore();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUser(userId, { isActive: !currentStatus });
    } catch (err) {
      alert("Gagal mengubah status pengguna.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini secara permanen?")) {
      try {
        await deleteUser(userId);
      } catch (err) {
        alert("Gagal menghapus pengguna.");
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await useUserStore.getState().createUser(newUser);
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', password: '' });
      alert("Pengguna berhasil didaftarkan.");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mendaftarkan pengguna.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(lowerQuery) ||
      u.email.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm font-medium">Kelola peran, status, dan akses seluruh akun sistem RS Ethereal.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Pencarian */}
          <div className="flex-1 md:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama atau Email..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-zinc-900 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all placeholder:text-slate-400" 
            />
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Pengguna
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama & Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isUserLoading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium italic">Mengambil data pengguna...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium italic">{users.length === 0 ? "Tidak ada pengguna ditemukan." : "Pengguna tidak ditemukan."}</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleStatus(u.id, u.isActive)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        u.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus Pengguna"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-extrabold text-zinc-900 text-lg">Daftarkan Pengguna Biasa</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Akun baru akan mendapatkan peran default (Pasien).</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                <input type="text" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 transition-all outline-none" placeholder="Masukkan nama lengkap" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Alamat Email</label>
                <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 transition-all outline-none" placeholder="email@contoh.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Kata Sandi</label>
                <input type="password" required minLength={8} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 transition-all outline-none" placeholder="Minimal 8 karakter" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? 'Memproses...' : 'Daftarkan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

