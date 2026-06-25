"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { CheckCircle, Plus, Trash2, X, Image as ImageIcon, ExternalLink, Eye, EyeOff, ShieldCheck, Banknote } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function PaymentProofsPage() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    userName: "",
    amount: "",
    method: "JazzCash",
    proofUrl: "",
    isPublic: true
  });
  const [saving, setSaving] = useState(false);

  const fetchProofs = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "payment_proofs"), orderBy("createdAt", "desc")));
      setProofs(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchProofs(); }, []);

  const handleAdd = async () => {
    if (!form.userName || !form.amount) return;
    setSaving(true);
    try {
      const name = form.userName;
      const maskedName = name.length > 2
        ? name[0] + "*".repeat(Math.min(name.length - 2, 3)) + name[name.length - 1]
        : name[0] + "*";

      await addDoc(collection(db, "payment_proofs"), {
        userName: maskedName,
        originalName: name,
        amount: Number(form.amount),
        method: form.method,
        proofUrl: form.proofUrl,
        isPublic: form.isPublic,
        createdAt: serverTimestamp(),
      });
      setForm({ userName: "", amount: "", method: "JazzCash", proofUrl: "", isPublic: true });
      setShowForm(false);
      fetchProofs();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently purge this payment record from the trust ledger?")) {
      await deleteDoc(doc(db, "payment_proofs", id));
      fetchProofs();
    }
  };

  const handleTogglePublic = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "payment_proofs", id), { isPublic: !current });
    fetchProofs();
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Trust <span className="text-[#FF2D2D]">Ledger</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Public Payment Documentation & Proof of Solvency</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="premium-button flex items-center gap-3"
        >
          <Plus size={20} /> Deploy Proof
        </button>
      </div>

      {showForm && (
        <div className="admin-card border-[#FF2D2D]/30 bg-[#FF2D2D]/5 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-10">
            <div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Archive Receipt</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Submit payment confirmation to the public node</p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-3 text-slate-500 hover:text-white hover:bg-black/20 rounded-2xl transition-all"><X size={20}/></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Identity</label>
                <input value={form.userName} onChange={e => setForm({...form, userName: e.target.value})} placeholder="Full User Name..." className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none shadow-inner" />
            </div>
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Settlement Volume</label>
                <input value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} type="number" placeholder="Amount (PKR)..." className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none shadow-inner" />
            </div>
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Gateway Protocol</label>
                <select value={form.method} onChange={e => setForm({...form, method: e.target.value})} className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none">
                    <option value="JazzCash">JazzCash</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Payoneer">Payoneer</option>
                </select>
            </div>
            <div className="lg:col-span-2 space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Artifact Hash (IMG URL)</label>
                <input value={form.proofUrl} onChange={e => setForm({...form, proofUrl: e.target.value})} placeholder="https://cloud.zivotube.com/..." className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none shadow-inner" />
            </div>
            <div className="flex items-end">
                <label className="flex items-center justify-between w-full p-4 bg-[#090909] border border-[#242424] rounded-2xl cursor-pointer hover:bg-[#121212] transition-all">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Public Visibility</span>
                    <input type="checkbox" checked={form.isPublic} onChange={e => setForm({...form, isPublic: e.target.checked})} className="w-5 h-5 accent-emerald-500" />
                </label>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button onClick={handleAdd} disabled={saving} className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FF2D2D] hover:text-white transition-all shadow-xl flex items-center justify-center gap-3">
              <CheckCircle size={16}/> {saving ? "Archiving..." : "Authorize Publication"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-10 py-4 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-[#242424] hover:bg-white/5 transition-all">Abort</button>
          </div>
        </div>
      )}

      <div className="admin-card !p-0 overflow-hidden border-[#242424] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap border-collapse">
            <thead className="bg-[#090909]/50 border-b border-[#242424]">
              <tr>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Node Identity</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Settlement</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Protocol</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Archive Date</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">Broadcasting</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {loading ? (
                Array(6).fill(0).map((_, i) => <tr key={i}><td colSpan={6} className="p-10 animate-pulse bg-[#121212]/50"></td></tr>)
              ) : proofs.length === 0 ? (
                <tr><td colSpan={6} className="p-32 text-center">
                    <Banknote className="mx-auto mb-6 text-slate-800" size={80} />
                    <p className="text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">Registry Empty: No settlement artifacts found</p>
                </td></tr>
              ) : proofs.map(proof => (
                <tr key={proof.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <div>
                            <div className="font-black text-white tracking-tight uppercase">{proof.userName}</div>
                            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">Hash: {proof.originalName}</div>
                        </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="font-black text-emerald-400 tracking-tighter text-base">
                      Rs.{proof.amount?.toLocaleString()} <span className="text-[9px] uppercase font-black text-slate-700 ml-1">PKR</span>
                    </div>
                  </td>
                  <td className="p-6 font-black text-slate-500 uppercase text-[10px] tracking-widest">{proof.method}</td>
                  <td className="p-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">{proof.createdAt ? formatDate(proof.createdAt.toDate()) : "Genesis"}</td>
                  <td className="p-6 text-center">
                    <button
                        onClick={() => handleTogglePublic(proof.id, proof.isPublic)}
                        className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                            proof.isPublic ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-slate-800 text-slate-600 border-slate-700"
                        )}
                    >
                        {proof.isPublic ? "LIVE" : "SILENT"}
                    </button>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        {proof.proofUrl && (
                            <a href={proof.proofUrl} target="_blank" rel="noreferrer" className="p-3 bg-[#090909] text-slate-500 hover:text-blue-500 border border-[#242424] rounded-xl transition-all" title="Inspect Artifact">
                                <ExternalLink size={16}/>
                            </a>
                        )}
                        <button onClick={() => handleDelete(proof.id)} className="p-3 bg-[#090909] text-slate-500 hover:text-red-500 border border-[#242424] rounded-xl transition-all" title="Purge Protocol">
                            <Trash2 size={16}/>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
