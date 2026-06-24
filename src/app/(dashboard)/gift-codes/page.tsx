"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { Gift, Plus, Trash2, X, Check, Copy, Coins } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({length: 10}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function GiftCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: generateCode(), coinsValue: "", maxUses: "100", expiresAt: "" });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "giftCodes"), orderBy("createdAt", "desc")));
      setCodes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleAdd = async () => {
    if (!form.code || !form.coinsValue) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "giftCodes"), {
        code: form.code.toUpperCase(),
        coinsValue: Number(form.coinsValue),
        maxUses: Number(form.maxUses),
        usedCount: 0,
        expiresAt: form.expiresAt || null,
        isActive: true,
        createdAt: serverTimestamp(),
      });
      setForm({ code: generateCode(), coinsValue: "", maxUses: "100", expiresAt: "" });
      setShowForm(false);
      fetchCodes();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this gift code?")) {
      await deleteDoc(doc(db, "giftCodes", id));
      fetchCodes();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gift Codes</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Generate promotional coin reward codes</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
          <Plus size={18} /> Generate Code
        </button>
      </div>

      {showForm && (
        <div className="admin-card border-2 border-red-200 bg-red-50/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-900">New Gift Code</h3>
            <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="Code" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white font-mono pr-24" />
              <button onClick={() => setForm({...form, code: generateCode()})} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-600 hover:text-red-700 uppercase bg-red-50 px-2 py-1 rounded-lg">Regen</button>
            </div>
            <input value={form.coinsValue} onChange={e => setForm({...form, coinsValue: e.target.value})} type="number" placeholder="Coins value *" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
            <input value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} type="number" placeholder="Max uses" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
            <input value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} type="date" placeholder="Expiry date" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={saving} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-red-600 transition-all disabled:opacity-50">
              <Check size={16}/> {saving ? "Creating..." : "Create Code"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl text-sm font-black text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-card !p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usage</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={6} className="p-8 animate-pulse bg-slate-50/30"></td></tr>)
            ) : codes.length === 0 ? (
              <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No gift codes yet</td></tr>
            ) : codes.map(code => {
              const usagePercent = code.maxUses ? Math.round((code.usedCount / code.maxUses) * 100) : 0;
              return (
                <tr key={code.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-sm">{code.code}</span>
                      <button onClick={() => copyCode(code.code)} className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                        {copied === code.code ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Coins size={14} className="text-amber-500"/>
                      <span className="font-black text-slate-800 text-sm">{code.coinsValue?.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{width: `${Math.min(usagePercent, 100)}%`}}/>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{code.usedCount || 0}/{code.maxUses}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    {code.expiresAt || "No expiry"}
                  </td>
                  <td className="p-4">
                    <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider", code.isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500")}>
                      {code.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(code.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={15}/>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
