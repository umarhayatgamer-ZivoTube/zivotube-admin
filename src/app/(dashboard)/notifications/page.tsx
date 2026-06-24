"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { Bell, Plus, Trash2, X, Check, Send } from "lucide-react";
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
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
    if (confirm("Delete this notification?")) {
      await deleteDoc(doc(db, "notifications", id));
      fetchItems();
    }
  };

  const typeColor: Record<string, string> = {
    info: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    promo: "bg-purple-100 text-purple-700",
  };
  const typeDot: Record<string, string> = {
    info: "bg-blue-500", success: "bg-green-500", warning: "bg-amber-500", promo: "bg-purple-500",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Push Notifications</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Send targeted notifications to users</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
          <Plus size={18}/> Send Notification
        </button>
      </div>

      {showForm && (
        <div className="admin-card border-2 border-red-200 bg-red-50/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-900">New Notification</h3>
            <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Notification title *" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white md:col-span-2"/>
            <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Message *" rows={3} className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white md:col-span-2 resize-none"/>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white">
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="promo">Promo</option>
            </select>
            <input value={form.targetUserId} onChange={e => setForm({...form, targetUserId: e.target.value})} placeholder="Target User ID (blank = broadcast)" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"/>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSend} disabled={saving} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-red-600 transition-all disabled:opacity-50">
              <Send size={16}/> {saving ? "Sending..." : "Send Now"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl text-sm font-black text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"/>)
        ) : items.length === 0 ? (
          <div className="admin-card border-dashed border-2 py-20 flex flex-col items-center">
            <Bell className="text-slate-300 mb-4" size={40}/>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No notifications sent yet</p>
          </div>
        ) : items.map(item => (
          <div key={item.id} className="admin-card group hover:border-slate-300 transition-all flex items-center gap-4">
            <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", typeDot[item.type] || "bg-slate-400")}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="font-black text-slate-900 text-sm">{item.title}</p>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase", typeColor[item.type] || "bg-slate-100 text-slate-600")}>{item.type}</span>
                {item.targetUserId && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">@{item.targetUserId.substring(0,8)}...</span>}
                {!item.targetUserId && <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">Broadcast</span>}
              </div>
              <p className="text-xs text-slate-500 truncate">{item.body}</p>
            </div>
            <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0">
              <Trash2 size={15}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
