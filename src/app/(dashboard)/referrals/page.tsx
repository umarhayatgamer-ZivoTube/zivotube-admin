"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { UserPlus, Search, TrendingUp, Users, Coins } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function ReferralsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, totalCoinsGiven: 0, topReferrer: "" });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, "users"), orderBy("referralCount", "desc")));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(u => (u.referralCount || 0) > 0 || u.referredBy);
        setUsers(all);
        const totalCoins = all.reduce((sum, u) => sum + (u.referralCoinsEarned || 0), 0);
        setStats({ total: all.length, totalCoinsGiven: totalCoins, topReferrer: all[0]?.username || "-" });
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Referral Program</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Track user referrals and rewards</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-64 transition-all"/>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-600 rounded-xl text-white"><Users size={20}/></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Referrers</p>
          </div>
          <p className="text-3xl font-black text-slate-900">{loading ? "..." : stats.total.toLocaleString()}</p>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-amber-500 rounded-xl text-white"><Coins size={20}/></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Coins Given</p>
          </div>
          <p className="text-3xl font-black text-slate-900">{loading ? "..." : stats.totalCoinsGiven.toLocaleString()}</p>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-600 rounded-xl text-white"><TrendingUp size={20}/></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top Referrer</p>
          </div>
          <p className="text-3xl font-black text-slate-900">{loading ? "..." : `@${stats.topReferrer}`}</p>
        </div>
      </div>

      <div className="admin-card !p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Referrals</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coins Earned</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referred By</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="p-8 animate-pulse bg-slate-50/30"></td></tr>)
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-20 text-center">
                <UserPlus className="mx-auto text-slate-300 mb-3" size={32}/>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No referral data found</p>
              </td></tr>
            ) : filtered.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-400">
                      {user.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">@{user.username}</p>
                      <p className="text-[10px] text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-black">
                    {user.referralCount || 0}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <Coins size={13} className="text-amber-500"/>
                    <span className="text-sm font-black text-slate-800">{(user.referralCoinsEarned || 0).toLocaleString()}</span>
                  </div>
                </td>
                <td className="p-4 text-xs text-slate-500 font-mono">{user.referredBy ? user.referredBy.substring(0,12)+"..." : "-"}</td>
                <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                  {user.createdAt ? formatDate(user.createdAt) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

