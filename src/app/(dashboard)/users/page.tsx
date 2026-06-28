"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from "firebase/firestore";
import { Search, Filter, MoreVertical, Ban, ShieldCheck, UserX, Wallet, History, Users as UsersIcon, Activity } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (id: string, action: string) => {
    if (action === 'ban') {
        if (confirm("Execute Ban Protocol? This node will lose all platform access.")) {
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors">Node <span className="text-[#FF2D2D]">Directory</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Manage infrastructure participants & accounts</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#FF2D2D] transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search by identity or hash..."
                    className="pl-12 pr-6 py-4 bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#242424] rounded-2xl outline-none focus:border-[#FF2D2D] w-full sm:w-96 text-sm font-bold text-slate-900 dark:text-white transition-all shadow-sm dark:shadow-2xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button className="p-4 bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#242424] rounded-2xl text-slate-500 hover:text-[#FF2D2D] dark:hover:text-white hover:border-[#FF2D2D]/50 transition-all shadow-sm">
                <Filter size={20} />
            </button>
        </div>
      </div>

      <div className="admin-card !p-0 overflow-hidden border-slate-200 dark:border-[#242424] shadow-sm dark:shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-[#090909]/50 border-b border-slate-200 dark:border-[#242424]">
              <tr>
                <th className="p-6 text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em]">Node Identity</th>
                <th className="p-6 text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em] text-center">Protocol Status</th>
                <th className="p-6 text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em]">Economic Yield</th>
                <th className="p-6 text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em]">Creator Rank</th>
                <th className="p-6 text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em]">Entry Date</th>
                <th className="p-6 text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#242424]">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="p-10 bg-slate-100/50 dark:bg-[#121212]/50"></td>
                    </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-32 text-center text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Registry Empty: No matching nodes found</td></tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#090909] to-[#1A1A1A] border border-slate-200 dark:border-[#242424] flex-shrink-0 overflow-hidden shadow-inner group-hover:border-[#FF2D2D]/30 transition-colors">
                          {user.profilePhotoUrl ? (
                            <img src={user.profilePhotoUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-700 font-black uppercase text-xl">{user.username?.charAt(0)}</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-white tracking-tight truncate">@{user.username || 'unknown'}</span>
                            {user.isVerified && <ShieldCheck size={14} className="text-blue-500 fill-blue-500/10" />}
                            {user.isVip && <div className="bg-amber-500 text-[8px] font-black text-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Elite</div>}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-600 font-bold uppercase truncate mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                        user.status === 'Banned' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        user.status === 'Dormant' ? "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700" :
                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      )}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-6">
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">{user.totalCoins?.toLocaleString() || 0} <span className="text-[9px] text-slate-500 dark:text-slate-600 uppercase ml-1">ZIVO</span></span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter mt-1">Rs. {user.totalEarnings?.toLocaleString() || 0}</span>
                        </div>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center gap-2">
                             <div className={cn("w-2 h-2 rounded-full", (user.creatorLevel || 0) > 0 ? "bg-[#FF2D2D] animate-pulse" : "bg-slate-300 dark:bg-slate-800")}></div>
                             <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Level {user.creatorLevel || 0}</span>
                        </div>
                    </td>
                    <td className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-600 tracking-widest uppercase">
                        {user.createdAt ? formatDate(user.createdAt) : 'Mainnet Genesis'}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <button className="p-3 bg-white dark:bg-[#090909] text-slate-400 dark:text-slate-500 hover:text-blue-500 hover:bg-blue-500/5 rounded-xl border border-slate-200 dark:border-[#242424] transition-all shadow-sm" title="Audit Wallet"><Wallet size={16} /></button>
                        <button className="p-3 bg-white dark:bg-[#090909] text-slate-400 dark:text-slate-500 hover:text-violet-500 hover:bg-violet-500/5 rounded-xl border border-slate-200 dark:border-[#242424] transition-all shadow-sm" title="Event Log"><History size={16} /></button>
                        <button onClick={() => handleAction(user.id, 'ban')} className="p-3 bg-white dark:bg-[#090909] text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl border border-slate-200 dark:border-[#242424] transition-all shadow-sm" title="Terminate Node"><Ban size={16} /></button>
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
