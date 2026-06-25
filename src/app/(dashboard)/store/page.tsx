"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, serverTimestamp, orderBy, query, deleteDoc } from "firebase/firestore";
import { Store, Check, X, ShoppingBag, Coins, Star, Trash2, Eye, Award, TrendingUp, Package, Box } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreatorStorePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");

  const TABS = ['Pending', 'Approved', 'Rejected'];
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "store_items"), orderBy("createdAt", "desc")));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAction = async (id: string, status: string) => {
    await updateDoc(doc(db, "store_items", id), { 
        status, 
        updatedAt: serverTimestamp() 
    });
    fetchItems();
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "store_items", id), { isFeatured: !current });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
      if(confirm("Terminate this product node from the ecosystem?")) {
          await deleteDoc(doc(db, "store_items", id));
          fetchItems();
      }
  }

  const filtered = items.filter(item => (item.status || "Pending") === activeTab);

  const catColors: Record<string, string> = {
    intro: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    outro: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    preset: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    sound: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    sticker: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    font: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    effect: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Creative <span className="text-[#FF2D2D]">Vault</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Digital Product Inventory & Merchant Control</p>
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
          Array(6).fill(0).map((_, i) => <div key={i} className="h-[480px] bg-[#121212] rounded-[40px] animate-pulse border border-[#242424]"/>)
        ) : filtered.length === 0 ? (
          <div className="col-span-full admin-card border-dashed border-2 border-[#242424] py-40 flex flex-col items-center">
            <Package className="text-slate-800 mb-6" size={80}/>
            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Registry Empty: No {activeTab.toLowerCase()} merchant items</p>
          </div>
        ) : filtered.map(item => (
          <div key={item.id} className="admin-card group hover:border-[#FF2D2D]/30 transition-all flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
               <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", catColors[item.category?.toLowerCase()] || "bg-slate-800 text-slate-500 border-slate-700")}>
                  {item.category || "Plugin"}
               </span>
               {item.isFeatured && <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-500/20 flex items-center gap-1.5"><Award size={12}/> Verified</span>}
            </div>

            <div className="flex gap-6 mb-8">
                <div className="w-24 h-24 bg-[#090909] border border-[#242424] rounded-2xl flex-shrink-0 overflow-hidden shadow-inner group-hover:border-[#FF2D2D]/30 transition-colors">
                   {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-slate-800"><Box size={32}/></div>}
                </div>
                <div className="min-w-0">
                   <h3 className="font-black text-white text-lg leading-tight line-clamp-2 tracking-tight">{item.title}</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Merchant: @{item.creatorName || "unknown"}</p>
                   <div className="flex items-center gap-2 mt-4">
                       <Coins size={14} className="text-amber-500" />
                       <span className="font-black text-white text-base tracking-tighter">{item.price?.toLocaleString()} <span className="text-[9px] text-slate-600 uppercase ml-1">ZIVO</span></span>
                   </div>
                </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-[#090909] rounded-2xl mb-8 border border-[#242424]">
                <div className="text-center flex-1 border-r border-[#242424]">
                    <p className="text-slate-600 font-black uppercase tracking-widest text-[8px] mb-1.5">Sales</p>
                    <p className="font-black text-white text-sm">{item.salesCount || 0}</p>
                </div>
                <div className="text-center flex-1 border-r border-[#242424]">
                    <p className="text-slate-600 font-black uppercase tracking-widest text-[8px] mb-1.5">Network %</p>
                    <p className="font-black text-blue-500 text-sm">{item.commissionRate || 30}%</p>
                </div>
                <div className="text-center flex-1">
                    <p className="text-slate-600 font-black uppercase tracking-widest text-[8px] mb-1.5">Net Yield</p>
                    <p className="font-black text-emerald-500 text-sm">{(item.totalEarned || 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
                {activeTab === 'Pending' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleAction(item.id, 'Approved')} className="bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all shadow-xl">Authorize</button>
                        <button onClick={() => handleAction(item.id, 'Rejected')} className="bg-[#090909] text-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20 hover:bg-red-600 hover:text-white transition-all">Reject</button>
                    </div>
                )}
                {activeTab === 'Approved' && (
                    <>
                        <button onClick={() => handleToggleFeatured(item.id, item.isFeatured)} className={cn("py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border", item.isFeatured ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-[#090909] text-slate-500 border-[#242424] hover:text-amber-500")}>
                            {item.isFeatured ? "Un-Feature Asset" : "Feature on Storefront"}
                        </button>
                        <button onClick={() => handleAction(item.id, 'Rejected')} className="w-full bg-[#090909] text-slate-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-[#242424] hover:text-red-500 hover:border-red-500/30 transition-all mt-2">Revoke Authorization</button>
                    </>
                )}
                {activeTab === 'Rejected' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleAction(item.id, 'Approved')} className="bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all">Restore</button>
                        <button onClick={() => handleDelete(item.id)} className="bg-[#090909] text-slate-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-[#242424] hover:text-red-500 hover:border-red-500/30 transition-all">Purge</button>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
