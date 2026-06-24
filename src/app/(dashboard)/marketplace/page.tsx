"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { Layout, Plus, Trash2, X, Check, Eye, Star, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "intro", price: "0", thumbnailUrl: "" });
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "templates"), orderBy("createdAt", "desc")));
      setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleAdd = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "templates"), { ...form, price: Number(form.price), downloads: 0, rating: 0, isActive: true, createdAt: serverTimestamp() });
      setForm({ name: "", description: "", category: "intro", price: "0", thumbnailUrl: "" });
      setShowForm(false);
      fetchTemplates();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this template?")) { await deleteDoc(doc(db, "templates", id)); fetchTemplates(); }
  };

  const catColors: Record<string, string> = { intro: "bg-blue-100 text-blue-700", outro: "bg-purple-100 text-purple-700", thumbnail: "bg-green-100 text-green-700", overlay: "bg-orange-100 text-orange-700" };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Template Marketplace</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage creator video templates and overlays</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
          <Plus size={18}/> Add Template
        </button>
      </div>

      {showForm && (
        <div className="admin-card border-2 border-red-200 bg-red-50/30">
          <div className="flex items-center justify-between mb-6"><h3 className="font-black text-slate-900">New Template</h3><button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18}/></button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Template name *" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white md:col-span-2"/>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white md:col-span-2"/>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white">
              <option value="intro">Intro</option><option value="outro">Outro</option><option value="thumbnail">Thumbnail</option><option value="overlay">Overlay</option>
            </select>
            <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price (coins, 0=free)" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"/>
            <input value={form.thumbnailUrl} onChange={e => setForm({...form, thumbnailUrl: e.target.value})} placeholder="Thumbnail URL (optional)" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white md:col-span-2"/>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={saving} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-red-600 transition-all disabled:opacity-50"><Check size={16}/>{saving ? "Saving..." : "Add Template"}</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl text-sm font-black text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-52 bg-slate-100 rounded-3xl animate-pulse"/>)
        ) : templates.length === 0 ? (
          <div className="col-span-3 admin-card border-dashed border-2 py-20 flex flex-col items-center">
            <Layout className="text-slate-300 mb-4" size={40}/><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No templates yet</p>
          </div>
        ) : templates.map(t => (
          <div key={t.id} className="admin-card group hover:border-slate-300 transition-all overflow-hidden">
            <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-4 flex items-center justify-center">
              {t.thumbnailUrl ? <img src={t.thumbnailUrl} alt="" className="w-full h-full object-cover rounded-xl"/> : <Layout className="text-slate-300" size={32}/>}
            </div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-black text-slate-900 text-sm leading-tight">{t.name}</h3>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex-shrink-0 ml-2", catColors[t.category] || "bg-slate-100 text-slate-600")}>{t.category}</span>
            </div>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{t.description || "No description"}</p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Download size={11}/>{t.downloads || 0}</span>
                <span className="flex items-center gap-1"><Star size={11}/>{t.rating || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">{t.price === 0 ? "Free" : `${t.price} coins`}</span>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={13}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
