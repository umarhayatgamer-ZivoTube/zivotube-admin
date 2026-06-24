"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { Store, Plus, Trash2, X, Check, Package, Coins, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StorePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "badge", price: "", imageUrl: "" });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "storeItems"), orderBy("createdAt", "desc")));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "storeItems"), { ...form, price: Number(form.price), purchases: 0, isActive: true, createdAt: serverTimestamp() });
      setForm({ name: "", description: "", category: "badge", price: "", imageUrl: "" });
      setShowForm(false);
      fetchItems();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this store item?")) { await deleteDoc(doc(db, "storeItems", id)); fetchItems(); }
  };

  const catColors: Record<string, string> = {
    badge: "bg-blue-100 text-blue-700",
    filter: "bg-purple-100 text-purple-700",
    sticker: "bg-pink-100 text-pink-700",
    frame: "bg-green-100 text-green-700",
    effect: "bg-orange-100 text-orange-700",
  };
  const catIcons: Record<string, React.ReactNode> = {
    badge: "🏅", filter: "🎨", sticker: "✨", frame: "🖼️", effect: "⚡",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Creator Store</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage purchasable items and cosmetics</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
          <Plus size={18}/> Add Item
        </button>
      </div>

      {showForm && (
        <div className="admin-card border-2 border-red-200 bg-red-50/30">
          <div className="flex items-center justify-between mb-6"><h3 className="font-black text-slate-900">New Store Item</h3><button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18}/></button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Item name *" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white md:col-span-2"/>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white md:col-span-2"/>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white">
              <option value="badge">Badge</option><option value="filter">Filter</option><option value="sticker">Sticker</option><option value="frame">Frame</option><option value="effect">Effect</option>
            </select>
            <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price in coins *" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"/>
            <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="Image URL (optional)" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white md:col-span-2"/>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={saving} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-red-600 transition-all disabled:opacity-50"><Check size={16}/>{saving ? "Saving..." : "Add Item"}</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl text-sm font-black text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(8).fill(0).map((_, i) => <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse"/>)
        ) : items.length === 0 ? (
          <div className="col-span-4 admin-card border-dashed border-2 py-20 flex flex-col items-center">
            <Store className="text-slate-300 mb-4" size={40}/><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No store items yet</p>
          </div>
        ) : items.map(item => (
          <div key={item.id} className="admin-card group hover:border-slate-300 transition-all text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 mb-4 flex items-center justify-center text-3xl">
              {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded-2xl"/> : catIcons[item.category] || "🎁"}
            </div>
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase", catColors[item.category] || "bg-slate-100 text-slate-600")}>{item.category}</span>
            <h3 className="font-black text-slate-900 mt-2 mb-1 text-sm">{item.name}</h3>
            <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{item.description || ""}</p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <Coins size={13} className="text-amber-500"/>
                <span className="text-sm font-black text-slate-800">{item.price?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShoppingBag size={12} className="text-slate-400"/>
                <span className="text-xs text-slate-500">{item.purchases || 0}</span>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 ml-1"><Trash2 size={12}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

