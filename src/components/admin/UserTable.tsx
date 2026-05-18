// src/components/UserTable.tsx
import { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';

export default function UserTable({
  role,
  title,
  onManage,
  onDelete
}: {
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN',
  title: string,
  onManage: (user: any) => void,
  onDelete: (userId: string) => void
}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: role, specialization: '', nik: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '/users';
      if (role === 'PATIENT') endpoint = '/patients';
      if (role === 'DOCTOR') endpoint = '/doctors';
      
      const response = await apiClient.get(endpoint);
      let result = response.data.data || [];
      
      if (endpoint === '/users') {
        result = result.filter((u: any) => u.role === role);
      }
      
      setData(result);
    } catch (error) {
      console.error(`Gagal sinkronisasi data ${role}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setFormData({ name: '', email: '', password: '', role: role, specialization: '', nik: '' });
    setSearchQuery(''); 
  }, [role]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let endpoint = '/auth/register'; 
      if (role === 'DOCTOR') endpoint = '/doctors';
      if (role === 'PATIENT') endpoint = '/patients';

      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role
      };

      if (role === 'DOCTOR') payload.specialization = formData.specialization;
      if (role === 'PATIENT' && formData.nik && formData.nik.trim() !== '') {
        payload.nik = formData.nik;
      }

      await apiClient.post(endpoint, payload);
      
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: role, specialization: '', nik: '' });
      fetchData(); 
      alert(`Berhasil mendaftarkan ${role} baru!`);
    } catch (error: any) {
      const backendResponse = error.response?.data;
      const specificError = backendResponse?.message || backendResponse?.error || "Validasi payload gagal.";
      console.error("Detail Penolakan 400 Bad Request:", backendResponse);
      alert("Gagal membuat akun: " + (typeof specificError === 'object' ? JSON.stringify(specificError) : specificError));
    }
  };

  const filteredData = data.filter((item: any) => {
    const userObj = item.user || item;
    if (!searchQuery) return true;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    const matchName = userObj.name?.toLowerCase().includes(lowerCaseQuery);
    const matchEmail = userObj.email?.toLowerCase().includes(lowerCaseQuery);
    
    return matchName || matchEmail;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">{title}</h2>
          <p className="text-slate-500 text-sm font-medium">Manajemen kredensial dan hak akses untuk unit {role}.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-teal-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
        >
          + Tambah {role} Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <input 
            type="text" 
            placeholder={`Cari berdasarkan nama atau email...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-72 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 text-center">
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">Registrasi {role}</h3>
                <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest">Input Kredensial Baru</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                  <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Email</label>
                  <input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kata Sandi</label>
                  <input type="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>

                {role === 'DOCTOR' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Spesialisasi</label>
                    <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
                  </div>
                )}

                {role === 'PATIENT' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Nomor Induk Kependudukan (NIK) - <span className="text-slate-300">Opsional</span>
                    </label>
                    <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">Batal</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">Simpan Akun</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-5 pl-8">Identitas Pengguna</th>
              <th className="p-5">Hak Akses</th>
              <th className="p-5">Status Akun</th>
              <th className="p-5 text-right pr-8">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-slate-400 animate-pulse font-bold">Sinkronisasi Database...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-400 italic">
                  {searchQuery ? `Tidak ada pengguna yang cocok dengan pencarian "${searchQuery}".` : `Belum ada data ${role.toLowerCase()} ditemukan.`}
                </td>
              </tr>
            ) : (
              filteredData.map((item: any) => {
                const userObj = item.user || item; 
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5 pl-8">
                      <div className="font-extrabold text-zinc-950 uppercase group-hover:text-teal-600 transition-colors">{userObj.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{userObj.email}</div>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                        {role}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase border tracking-widest ${
                        userObj.isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {userObj.isActive !== false ? 'Aktif' : 'Blokir'}
                      </span>
                    </td>
                    <td className="p-5 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onManage(item)} className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => onDelete(item.id)} className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Hapus">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}