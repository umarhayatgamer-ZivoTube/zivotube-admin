"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { Megaphone, Plus, Trash2, X, Check, Globe, Users, Star, Send, ShieldAlert, Clock } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function AnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "all", priority: "normal" });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "announcements"), orderBy("createdAt", "desc")));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.body) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "announcements"), { ...form, createdAt: serverTimestamp() });
      setForm({ title: "", body: "", audience: "all", priority: "normal" });
      setShowForm(false);
      fetchItems();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this announcement?")) {
      await deleteDoc(doc(db, "announcements", id));
      fetchItems();
    }
  };

  const priorityColor = (p: string) => p === "urgent" ? "bg-red-500/10 text-red-500 border-red-500/20" : p === "high" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Broadcast <span className="text-[#FF2D2D]">Center</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Global Messaging & Community Alerts Node</p>
        </div>
        <button onClick={() => setShowForm(true)} className="premium-button flex items-center gap-3">
          <Plus size={20} /> Deploy Alert
        </button>
      </div>

      {showForm && (
        <div className="admin-card border-[#FF2D2D]/30 bg-[#FF2D2D]/5 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-10">
            <div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Construct Alert</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configure parameters for global transmission</p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-3 text-slate-500 hover:text-white hover:bg-black/20 rounded-2xl transition-all"><X size={20}/></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Transmission Subject</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Announcement title..." className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none" />
            </div>
            <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Payload Content</label>
                <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Broadcast message details..." rows={5} className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none resize-none" />
            </div>
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Audience</label>
                <select value={form.audience} onChange={e => setForm({...form, audience: e.target.value})} className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none">
                    <option value="all">All Network Nodes</option>
                    <option value="creators">Verified Creators Only</option>
                    <option value="vip">Elite VIP Members</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Priority Protocol</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none">
                    <option value="normal">Standard Priority</option>
                    <option value="high">High Velocity</option>
                    <option value="urgent">Critical Override</option>
                </select>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button onClick={handleAdd} disabled={saving} className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FF2D2D] hover:text-white transition-all shadow-xl flex items-center justify-center gap-3">
              <Send size={16}/> {saving ? "Transmitting..." : "Initialize Broadcast"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-10 py-4 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-[#242424] hover:bg-white/5 transition-all">Abort</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-[#121212] rounded-[32px] animate-pulse border border-[#242424]"/>)
        ) : items.length === 0 ? (
          <div className="admin-card border-dashed border-2 border-[#242424] py-32 flex flex-col items-center">
            <Megaphone className="text-slate-800 mb-6" size={64}/>
            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">No active broadcasts in history</p>
          </div>
        ) : items.map(item => (
          <div key={item.id} className="admin-card group hover:border-[#FF2D2D]/30 transition-all">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-6 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-[#090909] border border-[#242424] flex items-center justify-center text-[#FF2D2D] shrink-0 mt-1 shadow-inner">
                  <Megaphone size={22}/>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-black text-white tracking-tight">{item.title}</h3>
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border", priorityColor(item.priority))}>
                      {item.priority}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#090909] text-slate-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-[#242424]">
                      {item.audience} Target
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-4xl">{item.body}</p>
                  {item.createdAt && (
                    <div className="flex items-center gap-2 mt-4">
                        <Clock size={12} className="text-slate-600" />
                        <p className="text-[9px] text-slate-600 uppercase tracking-widest font-black">
                            Broadcast Timestamp: {formatDate(item.createdAt?.toDate?.()?.getTime() || 0)}
                        </p>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-3 text-slate-700 hover:text-[#FF2D2D] hover:bg-red-500/5 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
