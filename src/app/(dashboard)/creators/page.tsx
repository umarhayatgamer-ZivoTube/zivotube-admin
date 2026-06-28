"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, updateDoc, doc } from "firebase/firestore";
import { Star, Search, ShieldCheck, TrendingUp, Video, Coins, ArrowUpRight, Award, Zap } from "lucide-react";
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
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setCreators(all.filter((u: any) => (u.creatorLevel || 0) > 0 || u.isCreator));
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
    if (level >= 5) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (level >= 3) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (level >= 2) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors">Creator <span className="text-[#FF2D2D]">Center</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Verified Talent & Content Engine Management</p>
        </div>
        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#FF2D2D] transition-colors" size={18}/>
            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search creator database..."
                className="pl-12 pr-6 py-4 bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#242424] text-slate-900 dark:text-white rounded-2xl text-sm font-bold outline-none focus:border-[#FF2D2D] w-80 transition-all shadow-sm dark:shadow-2xl"
            />
        </div>
      </div>

      <div className="flex gap-3 flex-wrap bg-white dark:bg-[#121212] p-2 rounded-[24px] border border-slate-200 dark:border-[#242424] w-fit shadow-sm dark:shadow-xl">
        {["all","1","2","3","4","5"].map(l => (
          <button
            key={l}
            onClick={() => setActiveLevel(l)}
            className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                activeLevel === l ? "bg-[#FF2D2D] text-white shadow-lg shadow-red-900/40" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {l === "all" ? "Mainnet" : `Level ${l}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-64 bg-slate-100 dark:bg-[#121212] rounded-[40px] animate-pulse border border-slate-200 dark:border-[#242424]"/>)
        ) : filtered.length === 0 ? (
          <div className="col-span-full admin-card border-dashed border-2 border-slate-200 dark:border-[#242424] py-40 flex flex-col items-center">
            <Award className="text-slate-300 dark:text-slate-800 mb-6" size={80}/>
            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">No creator signatures detected in this sector</p>
          </div>
        ) : filtered.map(creator => (
          <div key={creator.id} className="admin-card group hover:border-[#FF2D2D]/30 transition-all flex flex-col justify-between">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#090909] to-[#121212] border border-slate-200 dark:border-[#242424] overflow-hidden flex-shrink-0 shadow-inner group-hover:border-[#FF2D2D]/50 transition-colors">
                {creator.profilePhotoUrl
                  ? <img src={creator.profilePhotoUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                  : <div className="w-full h-full flex items-center justify-center font-black text-slate-400 dark:text-slate-700 text-2xl uppercase">{creator.username?.charAt(0)}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight truncate">@{creator.username}</span>
                  {creator.isVerified && <ShieldCheck size={16} className="text-blue-500 fill-blue-500/10 flex-shrink-0"/>}
                </div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight truncate">{creator.email}</p>
                <div className={cn("mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", levelBadge(creator.creatorLevel || 0))}>
                  <Zap size={10} /> Tier {creator.creatorLevel || 0}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200 dark:border-[#242424]">
              <div className="text-center group/stat">
                <div className="flex items-center justify-center gap-1 text-slate-400 dark:text-slate-600 mb-1 group-hover/stat:text-violet-500 transition-colors"><Video size={14}/></div>
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{creator.totalVideos || 0}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-600 uppercase font-black tracking-widest">Nodes</p>
              </div>
              <div className="text-center group/stat border-x border-slate-200 dark:border-[#242424]">
                <div className="flex items-center justify-center gap-1 text-slate-400 dark:text-slate-600 mb-1 group-hover/stat:text-amber-500 transition-colors"><Coins size={14}/></div>
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{(creator.totalCoins || 0).toLocaleString()}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-600 uppercase font-black tracking-widest">Yield</p>
              </div>
              <div className="text-center group/stat">
                <div className="flex items-center justify-center gap-1 text-slate-400 dark:text-slate-600 mb-1 group-hover/stat:text-[#FF2D2D] transition-colors"><TrendingUp size={14}/></div>
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">Rs.{(creator.totalEarnings || 0).toLocaleString()}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-600 uppercase font-black tracking-widest">Revenue</p>
              </div>
            </div>

            <button
                onClick={() => handleVerify(creator.id, creator.isVerified)}
                className={cn(
                    "w-full mt-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                    creator.isVerified
                        ? "bg-blue-500/5 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white"
                        : "bg-slate-100 dark:bg-[#090909] text-slate-500 border border-slate-200 dark:border-[#242424] hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-black"
                )}
            >
              {creator.isVerified ? "De-Authorize Node" : "Authorize Creator"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
