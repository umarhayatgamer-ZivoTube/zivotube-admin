"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { ShieldAlert, Search, Crown, Star, Coins, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VIPPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(u => u.isVip));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRevoke = async (id: string) => {
    if (confirm("Revoke VIP status from this user?")) {
      await updateDoc(doc(db, "users", id), { isVip: false });
      fetchUsers();
    }
  };

  const filtered = users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">VIP Members</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage premium VIP user accounts</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search VIP users..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-64 transition-all"/>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <div className="admin-card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <Crown className="text-amber-500 mb-3" size={28}/>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Total VIP Users</p>
          <p className="text-3xl font-black text-amber-700">{loading ? "..." : users.length}</p>
        </div>
        <div className="admin-card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <Star className="text-purple-500 mb-3" size={28}/>
          <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Avg. Creator Level</p>
          <p className="text-3xl font-black text-purple-700">{loading ? "..." : users.length ? (users.reduce((s, u) => s + (u.creatorLevel||0), 0) / users.length).toFixed(1) : 0}</p>
        </div>
        <div className="admin-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <Coins className="text-green-500 mb-3" size={28}/>
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Total VIP Coins</p>
          <p className="text-3xl font-black text-green-700">{loading ? "..." : users.reduce((s, u) => s + (u.totalCoins||0), 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse"/>)
        ) : filtered.length === 0 ? (
          <div className="col-span-3 admin-card border-dashed border-2 py-20 flex flex-col items-center">
            <ShieldAlert className="text-slate-300 mb-4" size={40}/>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No VIP users found</p>
          </div>
        ) : filtered.map(user => (
          <div key={user.id} className="admin-card group hover:border-amber-200 transition-all bg-gradient-to-br from-white to-amber-50/30">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden flex-shrink-0">
                {user.profilePhotoUrl
                  ? <img src={user.profilePhotoUrl} alt="" className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center font-black text-amber-600 text-xl">{user.username?.charAt(0)}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 truncate">@{user.username}</span>
                  <Crown size={12} className="text-amber-500 flex-shrink-0"/>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
              <span className="bg-amber-400 text-amber-900 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase flex-shrink-0">VIP</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-amber-100 mb-4">
              <div className="text-center">
                <p className="text-sm font-black text-slate-800">{(user.totalCoins||0).toLocaleString()}</p>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Coins</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-800">Lv.{user.creatorLevel||0}</p>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Creator</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-800">Rs.{(user.totalEarnings||0).toLocaleString()}</p>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Earned</p>
              </div>
            </div>
            <button onClick={() => handleRevoke(user.id)} className="w-full py-2 border border-red-200 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
              Revoke VIP
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

