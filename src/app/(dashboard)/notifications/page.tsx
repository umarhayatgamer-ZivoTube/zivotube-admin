"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { Bell, Plus, Trash2, X, Check, Send, ShieldAlert, Target, Zap } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", type: "info", targetUserId: "" });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "notifications"), orderBy("createdAt", "desc")));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSend = async () => {
    if (!form.title || !form.body) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "notifications"), {
        ...form,
        read: false,
        createdAt: serverTimestamp(),
      });
      setForm({ title: "", body: "", type: "info", targetUserId: "" });
      setShowForm(false);
      fetchItems();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Execute deletion protocol for this notification node?")) {
      await deleteDoc(doc(db, "notifications", id));
      fetchItems();
    }
  };

  const typeColor: Record<string, string> = {
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    promo: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  const typeDot: Record<string, string> = {
    info: "bg-blue-500", success: "bg-emerald-500", warning: "bg-amber-500", promo: "bg-purple-500",
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Signal <span className="text-[#FF2D2D]">Relay</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Targeted Push Transmissions & System Alerts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="premium-button flex items-center gap-3">
          <Plus size={20}/> Broadcast Signal
        </button>
      </div>

      {showForm && (
        <div className="admin-card border-[#FF2D2D]/30 bg-[#FF2D2D]/5 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-10">
            <div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">New Transmission</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configure push notification payload</p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-3 text-slate-500 hover:text-white hover:bg-black/20 rounded-2xl transition-all"><X size={20}/></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Payload Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Alert title..." className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none shadow-inner" />
            </div>
            <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Message Body</label>
                <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Signal content..." rows={4} className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none resize-none shadow-inner" />
            </div>
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Signal Protocol</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none">
                    <option value="info">Information</option>
                    <option value="success">Success Node</option>
                    <option value="warning">System Warning</option>
                    <option value="promo">Promotional Yield</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Node ID (Optional)</label>
                <input value={form.targetUserId} onChange={e => setForm({...form, targetUserId: e.target.value})} placeholder="Leave blank for Global Broadcast" className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none shadow-inner" />
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button onClick={handleSend} disabled={saving} className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FF2D2D] hover:text-white transition-all shadow-xl flex items-center justify-center gap-3">
              <Send size={16}/> {saving ? "Transmitting..." : "Initialize Relay"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-10 py-4 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-[#242424] hover:bg-white/5 transition-all">Abort</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-28 bg-[#121212] rounded-[24px] animate-pulse border border-[#242424]"/>)
        ) : items.length === 0 ? (
          <div className="admin-card border-dashed border-2 border-[#242424] py-32 flex flex-col items-center bg-transparent">
            <Bell className="text-slate-800 mb-6" size={64}/>
            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Registry Empty: No active transmissions found</p>
          </div>
        ) : items.map(item => (
          <div key={item.id} className="admin-card group hover:border-[#FF2D2D]/30 transition-all flex items-center gap-6 relative overflow-hidden">
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", typeDot[item.type] || "bg-slate-400")}/>
            <div className="w-12 h-12 rounded-2xl bg-[#090909] border border-[#242424] flex items-center justify-center shrink-0 shadow-inner">
                <Bell size={20} className={cn("transition-colors", item.read ? "text-slate-700" : "text-[#FF2D2D]")} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <p className="font-black text-white text-base tracking-tight uppercase">{item.title}</p>
                <span className={cn("px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border", typeColor[item.type] || "bg-slate-800 text-slate-500 border-slate-700")}>{item.type}</span>
                {item.targetUserId ? (
                    <span className="flex items-center gap-1.5 text-[8px] bg-[#090909] text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-black uppercase tracking-widest">
                        <Target size={10} /> Targeted Node
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-[8px] bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full border border-red-500/20 font-black uppercase tracking-widest">
                        <Zap size={10} /> Global Relay
                    </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-3xl leading-relaxed">{item.body}</p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest tabular-nums hidden md:block">
                    {item.createdAt ? formatDate(item.createdAt.toDate()) : 'Genesis'}
                </span>
                <button onClick={() => handleDelete(item.id)} className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/20">
                    <Trash2 size={16}/>
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
