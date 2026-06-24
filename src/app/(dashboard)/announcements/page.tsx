"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { Megaphone, Plus, Trash2, X, Check, Globe, Users, Star } from "lucide-react";
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
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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

  const audienceIcon = (a: string) => a === "all" ? <Globe size={12}/> : a === "creators" ? <Star size={12}/> : <Users size={12}/>;
  const priorityColor = (p: string) => p === "urgent" ? "bg-red-100 text-red-700" : p === "high" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Announcements</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Broadcast messages to your community</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {showForm && (
        <div className="admin-card border-2 border-red-200 bg-red-50/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-900">Create Announcement</h3>
            <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Announcement title *" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white md:col-span-2" />
            <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Message body *" rows={4} className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white md:col-span-2 resize-none" />
            <select value={form.audience} onChange={e => setForm({...form, audience: e.target.value})} className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white">
              <option value="all">All Users</option>
              <option value="creators">Creators Only</option>
              <option value="vip">VIP Members</option>
            </select>
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white">
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={saving} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-red-600 transition-all disabled:opacity-50">
              <Check size={16}/> {saving ? "Sending..." : "Publish"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl text-sm font-black text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse"/>)
        ) : items.length === 0 ? (
          <div className="admin-card border-dashed border-2 py-20 flex flex-col items-center">
            <Megaphone className="text-slate-300 mb-4" size={40}/>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No announcements yet</p>
          </div>
        ) : items.map(item => (
          <div key={item.id} className="admin-card group hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                  <Megaphone size={18}/>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-black text-slate-900">{item.title}</h3>
                    <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase", priorityColor(item.priority))}>
                      {item.priority}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase">
                      {audienceIcon(item.audience)} {item.audience}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{item.body}</p>
                  {item.createdAt && (
                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-medium">
                      Published {formatDate(item.createdAt?.toDate?.()?.getTime() || 0)}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
