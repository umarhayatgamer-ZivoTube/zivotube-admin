"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { Gift, Plus, Trash2, X, Check, Copy, Coins, Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react";
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
  
  const [viewRedeemedCode, setViewRedeemedCode] = useState<any | null>(null);
  const [redeemedUsers, setRedeemedUsers] = useState<any[]>([]);
  const [loadingRedeemed, setLoadingRedeemed] = useState(false);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "gift_codes"), orderBy("createdAt", "desc")));
      setCodes(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleAdd = async () => {
    if (!form.code || !form.coinsValue) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "gift_codes"), {
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
    if (confirm("Execute deletion protocol for this gift code?")) {
      await deleteDoc(doc(db, "gift_codes", id));
      fetchCodes();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "gift_codes", id), {
      isActive: !currentStatus
    });
    fetchCodes();
  };

  const fetchRedeemedUsers = async (codeId: string) => {
    setLoadingRedeemed(true);
    try {
      const snap = await getDocs(collection(db, `gift_codes/${codeId}/redeemed_users`));
      setRedeemedUsers(snap.docs.map(d => d.data()));
    } catch(e) { console.error(e); }
    setLoadingRedeemed(false);
  };

  const openRedeemedModal = (code: any) => {
    setViewRedeemedCode(code);
    fetchRedeemedUsers(code.id);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Reward <span className="text-[#FF2D2D]">Tokens</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Promotional Asset Generation & Distribution</p>
        </div>
        <button onClick={() => setShowForm(true)} className="premium-button flex items-center gap-3">
          <Plus size={20} /> Generate Hash
        </button>
      </div>

      {showForm && (
        <div className="admin-card border-[#FF2D2D]/30 bg-[#FF2D2D]/5 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-10">
            <div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Construct Token</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configure promotional reward parameters</p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-3 text-slate-500 hover:text-white hover:bg-black/20 rounded-2xl transition-all"><X size={20}/></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2 relative">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Code</label>
                <div className="relative">
                    <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="CODE-000" className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-black focus:border-[#FF2D2D] outline-none font-mono tracking-widest" />
                    <button onClick={() => setForm({...form, code: generateCode()})} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-[#FF2D2D] transition-colors"><RefreshCw size={14}/></button>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">ZIVO Value</label>
                <input value={form.coinsValue} onChange={e => setForm({...form, coinsValue: e.target.value})} type="number" placeholder="Coins..." className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Max Capacity</label>
                <input value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} type="number" placeholder="Uses..." className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiry Horizon</label>
                <input value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} type="date" className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none [color-scheme:dark]" />
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button onClick={handleAdd} disabled={saving} className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FF2D2D] hover:text-white transition-all shadow-xl flex items-center justify-center gap-3">
              <Check size={16}/> {saving ? "Generating..." : "Authorize Reward Node"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-10 py-4 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-[#242424] hover:bg-white/5 transition-all">Abort</button>
          </div>
        </div>
      )}

      <div className="admin-card !p-0 overflow-hidden border-[#242424] shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-[#090909]/50 border-b border-[#242424]">
                <tr>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Hash Registry</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Payload Value</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Transmission Status</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Life-Cycle</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Protocol State</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] text-right">Operations</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
                {loading ? (
                    Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={6} className="p-10 animate-pulse bg-[#121212]/50"></td></tr>)
                ) : codes.length === 0 ? (
                    <tr><td colSpan={6} className="p-32 text-center text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">No active reward hashes in registry</td></tr>
                ) : codes.map(code => {
                    const usagePercent = code.maxUses ? Math.round((code.usedCount / code.maxUses) * 100) : 0;
                    return (
                        <tr key={code.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#090909] border border-[#242424] text-[#FF2D2D] rounded-xl shadow-inner group-hover:border-[#FF2D2D]/30 transition-colors"><Gift size={18}/></div>
                                <span className="font-mono font-black text-white text-sm tracking-widest">{code.code}</span>
                                <button onClick={() => copyCode(code.code)} className="p-2 bg-[#090909] text-slate-600 hover:text-white border border-[#242424] rounded-lg transition-all active:scale-90">
                                    {copied === code.code ? <Check size={12} className="text-emerald-500"/> : <Copy size={12}/>}
                                </button>
                            </div>
                        </td>
                        <td className="p-6">
                            <div className="flex items-center gap-2">
                                <Coins size={14} className="text-amber-500"/>
                                <span className="font-black text-white text-sm tracking-tighter">{code.coinsValue?.toLocaleString()} <span className="text-[9px] text-slate-600 uppercase ml-1">ZIVO</span></span>
                            </div>
                        </td>
                        <td className="p-6">
                            <div className="flex items-center gap-4 min-w-[160px]">
                                <div className="flex-1 h-1.5 bg-[#090909] border border-[#242424] rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all duration-1000", usagePercent >= 100 ? "bg-red-500" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]")} style={{width: `${Math.min(usagePercent, 100)}%`}}/>
                                </div>
                                <span className="text-[10px] font-black text-slate-500 tabular-nums">{code.usedCount || 0}/{code.maxUses}</span>
                            </div>
                        </td>
                        <td className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {code.expiresAt ? formatDate(new Date(code.expiresAt).getTime()) : "Perpetual Asset"}
                        </td>
                        <td className="p-6">
                            <button
                                onClick={() => handleToggleActive(code.id, code.isActive)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
                                    code.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-500 border-slate-700"
                                )}
                            >
                            {code.isActive ? <><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Active</> : <><XCircle size={10}/> Disabled</>}
                            </button>
                        </td>
                        <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <button onClick={() => openRedeemedModal(code)} className="p-2.5 bg-[#090909] text-slate-500 hover:text-blue-500 border border-[#242424] rounded-xl transition-all" title="View Trace Log">
                                    <Eye size={16}/>
                                </button>
                                <button onClick={() => handleDelete(code.id)} className="p-2.5 bg-[#090909] text-slate-500 hover:text-red-500 border border-[#242424] rounded-xl transition-all" title="Purge Record">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
        </div>
      </div>

      {/* Redeemed Users Modal */}
      {viewRedeemedCode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#121212] rounded-[40px] border border-[#242424] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[85vh]">
            <div className="p-10 border-b border-[#242424] flex items-center justify-between bg-gradient-to-r from-red-500/5 to-transparent shrink-0">
              <div>
                 <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Trace Log</h3>
                 <p className="text-slate-500 text-[10px] font-mono mt-1 uppercase tracking-widest">Target Hash: {viewRedeemedCode.code}</p>
              </div>
              <button onClick={() => setViewRedeemedCode(null)} className="p-3 text-slate-500 hover:text-white hover:bg-[#1A1A1A] rounded-2xl transition-all"><X size={24}/></button>
            </div>
            
            <div className="p-10 overflow-y-auto custom-scrollbar bg-[#090909]/30">
                {loadingRedeemed ? (
                    <div className="py-20 text-center animate-pulse flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-[#FF2D2D] border-t-transparent rounded-full animate-spin mb-6"></div>
                        <span className="font-black text-slate-700 uppercase tracking-[0.3em] text-[10px]">Scanning Blockchain Ledger...</span>
                    </div>
                ) : redeemedUsers.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-[#242424] rounded-[40px]">
                        <p className="text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">No redemptions logged for this hash</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {redeemedUsers.map((user, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-[#121212] p-5 rounded-2xl border border-[#242424] hover:border-[#FF2D2D]/20 transition-colors">
                                <div>
                                    <div className="font-black text-sm text-white tracking-tight">{user.userEmail || user.userId}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{user.redeemedAt ? formatDate(user.redeemedAt.toDate()) : 'Genesis Time'}</div>
                                </div>
                                <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest">+{viewRedeemedCode.coinsValue} ZIVO</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
