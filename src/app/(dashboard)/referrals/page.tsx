"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { UserPlus, Search, TrendingUp, Users, Coins, X, Network, Zap, Target } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function ReferralsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, totalCoinsGiven: 0, topReferrer: "" });

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userReferrals, setUserReferrals] = useState<any[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

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

  const fetchUserReferrals = async (uid: string) => {
      setLoadingReferrals(true);
      try {
          const q = query(collection(db, "users"), where("referredBy", "==", uid), orderBy("createdAt", "desc"));
          const snap = await getDocs(q);
          setUserReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) { console.error(e); }
      setLoadingReferrals(false);
  };

  const handleViewDetails = (user: any) => {
      setSelectedUser(user);
      setUserReferrals([]);
      fetchUserReferrals(user.id);
  };

  const filtered = users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Affiliate <span className="text-[#FF2D2D]">Network</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Multi-level Node Growth & Incentive Engine</p>
        </div>
        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FF2D2D] transition-colors" size={18}/>
            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search network identity..."
                className="pl-12 pr-6 py-4 bg-[#121212] border border-[#242424] text-white rounded-2xl text-sm font-bold outline-none focus:border-[#FF2D2D] w-80 transition-all shadow-2xl"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatTile title="Active Affiliates" value={stats.total} icon={Users} color="bg-blue-500" sub="Growth Nodes" />
        <StatTile title="Distributed Yield" value={stats.totalCoinsGiven} icon={Coins} color="bg-amber-500" sub="ZIVO Rewards" isCurrency />
        <StatTile title="Alpha Referrer" value={stats.topReferrer} icon={TrendingUp} color="bg-[#FF2D2D]" sub="Primary Growth Node" isIdentity />
      </div>

      <div className="admin-card !p-0 overflow-hidden border-[#242424] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#090909]/50 border-b border-[#242424]">
              <tr>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Node Identity</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">Referrals</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Yield Earned</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Uplink Node</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Registry Date</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {loading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={6} className="p-10 animate-pulse bg-[#121212]/50"></td></tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-32 text-center">
                  <Network className="mx-auto text-slate-800 mb-6" size={64}/>
                  <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Registry Empty: No network nodes detected</p>
                </td></tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#090909] border border-[#242424] flex items-center justify-center font-black text-slate-700 text-sm group-hover:border-[#FF2D2D]/30 transition-colors">
                          {user.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-white text-sm tracking-tight">@{user.username}</p>
                          <p className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-black border border-blue-500/20">
                        {user.referralCount || 0}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Coins size={14} className="text-amber-500"/>
                        <span className="text-sm font-black text-white tracking-tighter">{(user.referralCoinsEarned || 0).toLocaleString()} <span className="text-[9px] text-slate-600 ml-1">ZIVO</span></span>
                      </div>
                    </td>
                    <td className="p-6 text-[10px] text-slate-500 font-mono font-bold">{user.referredBy ? user.referredBy.substring(0,12) : "GENESIS"}</td>
                    <td className="p-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {user.createdAt ? formatDate(user.createdAt) : "-"}
                    </td>
                    <td className="p-6 text-right">
                        <button onClick={() => handleViewDetails(user)} className="px-5 py-2.5 bg-[#090909] border border-[#242424] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#FF2D2D] hover:border-[#FF2D2D] hover:shadow-lg transition-all">Audit Network</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-[#121212] rounded-[40px] border border-[#242424] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
                <div className="p-10 border-b border-[#242424] flex items-center justify-between bg-gradient-to-r from-red-500/5 to-transparent shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Network Topology</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Downlink nodes for @{selectedUser.username}</p>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="p-3 text-slate-500 hover:text-white hover:bg-[#1A1A1A] rounded-2xl transition-all"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#090909]/30">
                    {loadingReferrals ? (
                        <div className="py-40 text-center animate-pulse flex flex-col items-center">
                            <div className="w-10 h-10 border-4 border-[#FF2D2D] border-t-transparent rounded-full animate-spin mb-6"></div>
                            <span className="font-black text-slate-700 uppercase tracking-[0.3em] text-[10px]">Scanning Uplink & Downlink Signatures...</span>
                        </div>
                    ) : userReferrals.length === 0 ? (
                        <div className="py-40 text-center border-2 border-dashed border-[#242424] rounded-[40px]">
                            <p className="text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">Isolation Warning: No connected nodes detected</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {userReferrals.map(referral => (
                                <div key={referral.id} className="p-6 bg-[#121212] border border-[#242424] rounded-3xl flex items-start gap-6 hover:border-[#FF2D2D]/20 transition-colors">
                                    <div className="w-14 h-14 rounded-2xl bg-[#090909] border border-[#242424] flex items-center justify-center font-black text-slate-700 overflow-hidden shrink-0 text-xl uppercase">
                                        {referral.profilePhotoUrl ? <img src={referral.profilePhotoUrl} className="w-full h-full object-cover" /> : referral.username?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-white text-base tracking-tight truncate">@{referral.username}</p>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase truncate mb-4">{referral.email}</p>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                                <span className="text-slate-500">Operation Sync</span>
                                                <span className="text-[#FF2D2D]">{(referral.completedTasksCount || 0) * 10}%</span>
                                            </div>
                                            <div className="h-1.5 bg-[#090909] border border-[#242424] rounded-full overflow-hidden">
                                                <div className="h-full bg-[#FF2D2D] rounded-full shadow-[0_0_10px_rgba(255,45,45,0.5)] transition-all duration-1000" style={{width: `${Math.min((referral.completedTasksCount || 0) * 10, 100)}%`}} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-5">
                                            <div className="p-2 bg-[#090909] border border-[#242424] rounded-xl text-center">
                                                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1">Streams</p>
                                                <p className="text-xs font-black text-white">{referral.watchedVideosCount || 0}</p>
                                            </div>
                                            <div className="p-2 bg-[#090909] border border-[#242424] rounded-xl text-center">
                                                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1">Missions</p>
                                                <p className="text-xs font-black text-white">{referral.completedTasksCount || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <span className={cn("px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                            referral.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            referral.status === 'Inhibited' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-slate-800 text-slate-500 border-slate-700")}>
                                            {referral.status || "IDLE"}
                                        </span>
                                        <div className="flex items-center gap-1 text-slate-700">
                                            <Target size={10} />
                                            <p className="text-[8px] font-bold uppercase">{referral.createdAt ? formatDate(referral.createdAt) : ""}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>
      )}
    </div>
  );
}

function StatTile({ title, value, icon: Icon, color, sub, isCurrency = false, isIdentity = false }: any) {
    return (
        <div className="admin-card group hover:border-[#FF2D2D]/30 transition-all relative overflow-hidden">
            <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 blur-3xl transition-all group-hover:opacity-10", color)} />
            <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className={cn(color, "p-3 rounded-2xl text-white shadow-lg shadow-black/20")}>
                        <Icon size={18} />
                    </div>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{title}</p>
                    <p className={cn("font-black text-white tracking-tighter", isIdentity ? "text-xl truncate" : "text-3xl")}>
                        {isCurrency ? "Z." : isIdentity ? "" : ""}{typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-1">{sub}</p>
                </div>
            </div>
        </div>
    );
}
