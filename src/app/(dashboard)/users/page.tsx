"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Search, Filter, MoreVertical, Ban, ShieldCheck, UserX, Wallet, History } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (id: string, action: string) => {
    if (action === 'ban') {
        if (confirm("Ban this user? They will lose all access.")) {
            await updateDoc(doc(db, "users", id), { status: 'Banned' });
            fetchUsers();
        }
    }
  };

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Community Directory</h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Manage users, creators, and accounts</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-full sm:w-80 text-sm transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter size={18} />
            </button>
        </div>
      </div>

      <div className="admin-card !p-0 overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Economy</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creator Lvl</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="p-8 bg-slate-50/30"></td>
                    </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No users found in database</td></tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex-shrink-0 overflow-hidden">
                          {user.profilePhotoUrl ? (
                            <img src={user.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-black uppercase">{user.username?.charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 tracking-tight">@{user.username || 'user'}</span>
                            {user.isVerified && <ShieldCheck size={14} className="text-blue-500 fill-blue-500/10" />}
                            {user.isVip && <div className="bg-amber-400 text-[8px] font-black text-amber-900 px-1 rounded uppercase">VIP</div>}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                        user.status === 'Banned' ? "bg-red-50 text-red-600" :
                        user.status === 'Dormant' ? "bg-slate-100 text-slate-500" :
                        "bg-green-50 text-green-600"
                      )}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-700">{user.totalCoins?.toLocaleString() || 0} <span className="text-[10px] text-slate-400">COINS</span></span>
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Rs. {user.totalEarnings?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                             <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Level {user.creatorLevel || 0}</span>
                        </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-400 tracking-tighter uppercase">
                        {user.createdAt ? formatDate(user.createdAt) : 'Ancient'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Wallet"><Wallet size={16} /></button>
                        <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="History"><History size={16} /></button>
                        <button onClick={() => handleAction(user.id, 'ban')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Ban User"><Ban size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
