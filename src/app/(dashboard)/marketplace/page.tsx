"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, serverTimestamp, orderBy, query, deleteDoc } from "firebase/firestore";
import { Layout, Check, X, Star, Download, Trash2, Eye, TrendingUp, Award, Box, Image as ImageIcon, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");

  const TABS = ['Pending', 'Approved', 'Rejected'];

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "templates"), orderBy("createdAt", "desc")));
      setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleAction = async (id: string, status: string) => {
    await updateDoc(doc(db, "templates", id), { 
        status, 
        updatedAt: serverTimestamp() 
    });
    fetchTemplates();
  };

  const handleToggleFlag = async (id: string, field: 'isFeatured' | 'isTrending', current: boolean) => {
    await updateDoc(doc(db, "templates", id), { [field]: !current });
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if(confirm("Permanently delete this digital asset?")) {
        await deleteDoc(doc(db, "templates", id));
        fetchTemplates();
    }
  }

  const filtered = templates.filter(t => (t.status || "Pending") === activeTab);

  const catColors: Record<string, string> = { 
    intro: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    outro: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    thumbnail: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    overlay: "bg-orange-500/10 text-orange-400 border-orange-500/20"
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Asset <span className="text-[#FF2D2D]">Forge</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Template Marketplace & Creative Inventory Control</p>
        </div>
        <div className="bg-[#121212] p-1.5 rounded-2xl border border-[#242424] flex items-center shadow-2xl">
           {TABS.map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                 activeTab === tab ? "bg-[#FF2D2D] text-white shadow-lg shadow-red-900/40" : "text-slate-500 hover:text-slate-300"
               )}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-[450px] bg-[#121212] rounded-[32px] animate-pulse border border-[#242424]"/>)
        ) : filtered.length === 0 ? (
          <div className="col-span-full admin-card border-dashed border-2 border-[#242424] py-40 flex flex-col items-center">
            <Layout className="text-slate-800 mb-6" size={80}/>
            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Registry Empty: No {activeTab.toLowerCase()} assets found</p>
          </div>
        ) : filtered.map(t => (
          <div key={t.id} className="admin-card group hover:border-[#FF2D2D]/30 transition-all flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
               <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", catColors[t.category?.toLowerCase()] || "bg-slate-800 text-slate-500 border-slate-700")}>
                  {t.category || "General"}
               </span>
               <div className="flex gap-2">
                   {t.isTrending && <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-500/20 flex items-center gap-1.5"><TrendingUp size={12}/> Trending</span>}
                   {t.isFeatured && <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-500/20 flex items-center gap-1.5"><Award size={12}/> Featured</span>}
               </div>
            </div>

            <div className="w-full h-48 bg-[#090909] rounded-2xl mb-6 overflow-hidden border border-[#242424] shadow-inner relative group-hover:border-[#FF2D2D]/20 transition-colors">
               {t.thumbnailUrl ? <img src={t.thumbnailUrl} alt={t.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-slate-800"><ImageIcon size={48}/></div>}
            </div>
            
            <div className="mb-6 flex-1">
                <h3 className="font-black text-white text-xl tracking-tight line-clamp-1">{t.name || t.title}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Node Origin: @{t.creatorName || "SYSTEM"}</p>
                <div className="flex items-center gap-2 mt-4">
                   <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20"><Coins size={14}/></div>
                   <span className="font-black text-white text-base tracking-tighter">
                       {t.price === 0 || !t.price ? "OPEN SOURCE" : `${t.price.toLocaleString()} ZIVO`}
                   </span>
                </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-[#090909] rounded-2xl mb-8 border border-[#242424]">
                <div className="text-center flex-1 border-r border-[#242424]">
                    <p className="text-slate-600 font-black uppercase tracking-widest text-[8px] mb-1.5 flex items-center justify-center gap-1.5"><Download size={10}/> Pulls</p>
                    <p className="font-black text-white text-sm">{t.downloads || 0}</p>
                </div>
                <div className="text-center flex-1 border-r border-[#242424]">
                    <p className="text-slate-600 font-black uppercase tracking-widest text-[8px] mb-1.5 flex items-center justify-center gap-1.5"><Star size={10}/> Rating</p>
                    <p className="font-black text-white text-sm">{t.rating || 0.0}</p>
                </div>
                <div className="text-center flex-1">
                    <p className="text-slate-600 font-black uppercase tracking-widest text-[8px] mb-1.5">Net Yield</p>
                    <p className="font-black text-emerald-500 text-sm">{(t.totalEarned || 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
                {activeTab === 'Pending' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleAction(t.id, 'Approved')} className="bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all shadow-xl">Authorize</button>
                        <button onClick={() => handleAction(t.id, 'Rejected')} className="bg-[#090909] text-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20 hover:bg-red-600 hover:text-white transition-all">Reject</button>
                    </div>
                )}
                {activeTab === 'Approved' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleToggleFlag(t.id, 'isFeatured', t.isFeatured)} className={cn("py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border", t.isFeatured ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-[#090909] text-slate-500 border-[#242424] hover:text-amber-500")}>
                                {t.isFeatured ? "Un-Feature" : "Mark Featured"}
                            </button>
                            <button onClick={() => handleToggleFlag(t.id, 'isTrending', t.isTrending)} className={cn("py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border", t.isTrending ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-[#090909] text-slate-500 border-[#242424] hover:text-red-500")}>
                                {t.isTrending ? "Reset Trend" : "Set Trending"}
                            </button>
                        </div>
                        <button onClick={() => handleAction(t.id, 'Rejected')} className="w-full mt-2 bg-[#090909] text-slate-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-[#242424] hover:text-red-500 hover:border-red-500/30 transition-all">Revoke Authorization</button>
                    </>
                )}
                {activeTab === 'Rejected' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleAction(t.id, 'Approved')} className="bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all">Restore</button>
                        <button onClick={() => handleDelete(t.id)} className="bg-[#090909] text-slate-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-[#242424] hover:text-red-500 hover:border-red-500/30 transition-all">Purge</button>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
