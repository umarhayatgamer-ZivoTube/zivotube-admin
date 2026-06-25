"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ShieldAlert, Search, Crown, Check, X, Edit2, Zap, Award, Target, Star, Plus } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function VIPPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"plans" | "users">("plans");
  const [search, setSearch] = useState("");

  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, "vip_plans")),
        getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")))
      ]);
      setPlans(plansSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(u => u.isVip));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "vip_plans", editingPlan.id), {
        ...editingPlan,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setEditingPlan(null);
      fetchData();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleTogglePlan = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "vip_plans", id), { isActive: !current });
    fetchData();
  };

  const handleRevoke = async (id: string) => {
    if (confirm("Revoke Elite protocol for this node? Membership privileges will be terminated immediately.")) {
      await updateDoc(doc(db, "users", id), { isVip: false });
      fetchData();
    }
  };

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Elite <span className="text-[#FF2D2D]">System</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Premium Member Infrastructure & Tier Management</p>
        </div>
        <div className="bg-[#121212] p-1.5 rounded-[20px] border border-[#242424] flex items-center shadow-2xl overflow-hidden">
           <button
                onClick={() => setActiveTab("plans")}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    activeTab === "plans" ? "bg-[#FF2D2D] text-white shadow-lg shadow-red-900/40" : "text-slate-500 hover:text-slate-300"
                )}
            >
                Tier Config
            </button>
           <button
                onClick={() => setActiveTab("users")}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    activeTab === "users" ? "bg-[#FF2D2D] text-white shadow-lg shadow-red-900/40" : "text-slate-500 hover:text-slate-300"
                )}
            >
                Elite Nodes
            </button>
        </div>
      </div>

      {activeTab === "plans" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
             Array(2).fill(0).map((_, i) => <div key={i} className="h-96 bg-[#121212] rounded-[40px] animate-pulse border border-[#242424]"></div>)
          ) : plans.length === 0 ? (
             <div className="col-span-full admin-card border-dashed border-2 border-[#242424] py-40 flex flex-col items-center">
                <ShieldAlert className="text-slate-800 mb-6" size={80}/>
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-center">Protocol Empty: No Elite Tiers defined in system</p>
                <button onClick={() => setEditingPlan({ id: "monthly", title: "Elite Monthly", price: 9.99, durationDays: 30, isActive: true, benefits: { hasBadge: true, doubleCoins: true, extraTasks: true, priorityWithdrawal: true, higherUpload: true, creatorTools: false } })} className="premium-button flex items-center gap-3"><Plus size={18}/> Initialize Core Tiers</button>
             </div>
          ) : plans.map((plan) => (
             <div key={plan.id} className="admin-card group hover:border-[#FF2D2D]/30 transition-all flex flex-col">
               <div className="flex items-center justify-between mb-8 border-b border-[#242424] pb-8">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[20px] bg-[#090909] border border-[#242424] flex items-center justify-center text-amber-500 shadow-inner group-hover:border-[#FF2D2D]/30 transition-colors">
                        <Crown size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{plan.title}</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{plan.durationDays} Day Cycle</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-black text-white tracking-tighter">${plan.price}</p>
                    <button
                        onClick={() => handleTogglePlan(plan.id, plan.isActive)}
                        className={cn(
                            "mt-3 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                            plan.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-500 border-slate-700"
                        )}
                    >
                      {plan.isActive ? "Operational" : "Offline"}
                    </button>
                 </div>
               </div>

               <div className="flex-1 space-y-6 mb-10">
                 <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">Payload Multipliers</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {Object.entries(plan.benefits || {}).map(([key, value]) => (
                     <div key={key} className="flex items-center gap-3 bg-[#090909] border border-[#242424] p-3 rounded-xl">
                       <div className={cn("w-2 h-2 rounded-full", value ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500/30")} />
                       <span className={cn("text-[11px] font-black uppercase tracking-tight", value ? "text-slate-300" : "text-slate-700 line-through")}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                     </div>
                   ))}
                 </div>
               </div>

               <button onClick={() => setEditingPlan(plan)} className="w-full py-4 bg-[#121212] border border-[#242424] rounded-2xl font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                 <Edit2 size={16} /> Re-Configure Parameters
               </button>
             </div>
          ))}
        </div>
      )}

      {activeTab === "users" && (
        <>
          <div className="flex items-center justify-between mb-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FF2D2D] transition-colors" size={18}/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search elite nodes..."
                className="pl-12 pr-6 py-4 bg-[#121212] border border-[#242424] text-white rounded-2xl text-sm font-bold outline-none focus:border-[#FF2D2D] w-full sm:w-96 transition-all shadow-2xl"
              />
            </div>
            <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
               <Crown size={16} /> Total Elite Registry: {users.length}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="h-48 bg-[#121212] rounded-[40px] animate-pulse border border-[#242424]"/>)
            ) : filteredUsers.length === 0 ? (
              <div className="col-span-full admin-card border-dashed border-2 border-[#242424] py-40 flex flex-col items-center">
                <Target className="text-slate-800 mb-6" size={80}/>
                <p className="text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">Registry Null: No active Elite nodes detected</p>
              </div>
            ) : filteredUsers.map(user => (
              <div key={user.id} className="admin-card group hover:border-[#FF2D2D]/30 transition-all">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-amber-500/5 to-orange-500/10 border border-amber-500/20 flex-shrink-0 flex items-center justify-center text-amber-500 shadow-inner group-hover:border-amber-500/50 transition-colors">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-lg tracking-tight truncate">@{user.username || 'node'}</span>
                      <Crown size={16} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"/>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase truncate mt-0.5">{user.email}</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-black text-[9px] font-black rounded uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">PROTOCOL: ELITE</div>
                  </div>
                </div>
                <button
                    onClick={() => handleRevoke(user.id)}
                    className="w-full py-4 bg-[#090909] border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  Decommission Elite Access
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#121212] rounded-[40px] border border-[#242424] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-[#242424] flex items-center justify-between bg-gradient-to-r from-[#FF2D2D]/5 to-transparent shrink-0">
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-4"><Zap className="text-[#FF2D2D]"/> Tier Re-Configuration</h3>
              <button onClick={() => setEditingPlan(null)} className="p-3 text-slate-500 hover:text-white hover:bg-[#1A1A1A] rounded-2xl transition-all"><X size={24}/></button>
            </div>
            
            <div className="p-10 overflow-y-auto custom-scrollbar bg-[#090909]/30 space-y-10">
               <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Plan Identifier</label>
                   <input value={editingPlan.title} onChange={e => setEditingPlan({...editingPlan, title: e.target.value})} className="w-full px-6 py-5 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-black focus:border-[#FF2D2D] outline-none shadow-inner uppercase tracking-tighter" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Value (USD)</label>
                   <input value={editingPlan.price} type="number" onChange={e => setEditingPlan({...editingPlan, price: Number(e.target.value)})} className="w-full px-6 py-5 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-black focus:border-[#FF2D2D] outline-none shadow-inner" />
                 </div>
               </div>

               <div>
                 <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-6 border-b border-[#242424] pb-4">Toggle Tier Multipliers</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {['hasBadge', 'doubleCoins', 'extraTasks', 'priorityWithdrawal', 'higherUpload', 'creatorTools'].map((benefit) => (
                      <label key={benefit} className={cn(
                        "flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all duration-300",
                        editingPlan.benefits?.[benefit] ? "bg-[#FF2D2D]/5 border-[#FF2D2D]/20 shadow-inner" : "bg-[#090909] border-[#242424]"
                      )}>
                        <span className={cn("text-xs font-black uppercase tracking-tight", editingPlan.benefits?.[benefit] ? "text-[#FF2D2D]" : "text-slate-500")}>{benefit.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <input 
                           type="checkbox" 
                           checked={editingPlan.benefits?.[benefit] || false}
                           onChange={e => setEditingPlan({
                              ...editingPlan, 
                              benefits: { ...editingPlan.benefits, [benefit]: e.target.checked }
                           })}
                           className="w-5 h-5 accent-[#FF2D2D]"
                        />
                      </label>
                   ))}
                 </div>
               </div>
            </div>

            <div className="p-10 bg-[#090909]/50 border-t border-[#242424] flex gap-4 shrink-0">
              <button onClick={() => setEditingPlan(null)} className="flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500 border border-[#242424] hover:bg-white/5 transition-all">Cancel Operation</button>
              <button onClick={handleSavePlan} disabled={saving} className="flex-[2] premium-button flex justify-center items-center gap-3">
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Check size={18}/> Commit Plan to Mainnet</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
