"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, updateDoc, doc } from "firebase/firestore";
import { Star, Search, ShieldCheck, TrendingUp, Video, Coins, ArrowUpRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState("all");

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users"), orderBy("creatorLevel", "desc")));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCreators(all.filter(u => (u.creatorLevel || 0) > 0 || u.isCreator));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchCreators(); }, []);

  const handleVerify = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "users", id), { isVerified: !current });
    fetchCreators();
  };

  const filtered = creators.filter(c => {
    const matchSearch = c.username?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = activeLevel === "all" || String(c.creatorLevel) === activeLevel;
    return matchSearch && matchLevel;
  });

  const levelBadge = (level: number) => {
    if (level >= 5) return "bg-red-100 text-red-700 border border-red-200";
    if (level >= 3) return "bg-purple-100 text-purple-700 border border-purple-200";
    if (level >= 2) return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Creator Center</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage and monitor content creators</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creators..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-64 transition-all"/>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all","1","2","3","4","5"].map(l => (
          <button key={l} onClick={() => setActiveLevel(l)} className={cn("px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all", activeLevel === l ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50")}>
            {l === "all" ? "All Levels" : `Level ${l}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-52 bg-slate-100 rounded-3xl animate-pulse"/>)
        ) : filtered.length === 0 ? (
          <div className="col-span-3 admin-card border-dashed border-2 py-20 flex flex-col items-center">
            <Star className="text-slate-300 mb-4" size={40}/>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No creators found</p>
          </div>
        ) : filtered.map(creator => (
          <div key={creator.id} className="admin-card group hover:border-slate-300 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex-shrink-0">
                {creator.profilePhotoUrl
                  ? <img src={creator.profilePhotoUrl} alt="" className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-xl">{creator.username?.charAt(0)}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-slate-900 truncate">@{creator.username}</span>
                  {creator.isVerified && <ShieldCheck size={14} className="text-blue-500 fill-blue-100 flex-shrink-0"/>}
                </div>
                <p className="text-[11px] text-slate-400 truncate">{creator.email}</p>
                <span className={cn("mt-1.5 inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider", levelBadge(creator.creatorLevel || 0))}>
                  Level {creator.creatorLevel || 0}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5"><Video size={12}/></div>
                <p className="text-sm font-black text-slate-800">{creator.totalVideos || 0}</p>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Videos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5"><Coins size={12}/></div>
                <p className="text-sm font-black text-slate-800">{(creator.totalCoins || 0).toLocaleString()}</p>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Coins</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5"><TrendingUp size={12}/></div>
                <p className="text-sm font-black text-slate-800">Rs.{(creator.totalEarnings || 0).toLocaleString()}</p>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Earned</p>
              </div>
            </div>

            <button onClick={() => handleVerify(creator.id, creator.isVerified)} className={cn("w-full mt-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", creator.isVerified ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}>
              {creator.isVerified ? "✓ Verified" : "Mark as Verified"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
