"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp, query, orderBy, limit, where } from "firebase/firestore";
import { Wallet, Search, Coins, ArrowUpRight, ArrowDownRight, History, Check, X, ShieldCheck, Zap, Database } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function WalletsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionType, setTransactionType] = useState<"add" | "deduct">("add");
  const [transactionReason, setTransactionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users"), orderBy("coins", "desc"), limit(50)));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const fetchUserTransactions = async (uid: string) => {
    setLoadingTransactions(true);
    try {
        const q = query(collection(db, "coin_transactions"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(20));
        const snap = await getDocs(q);
        setUserTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) { console.error(e); }
    setLoadingTransactions(false);
  };

  const handleOpenManage = (user: any) => {
    setSelectedUser(user);
    setUserTransactions([]);
    fetchUserTransactions(user.id);
  };

  const handleTransaction = async () => {
    if (!selectedUser || !transactionAmount || !transactionReason) return;
    setProcessing(true);
    const amount = Number(transactionAmount);
    
    try {
      const newBalance = transactionType === "add" 
        ? (selectedUser.coins || 0) + amount 
        : Math.max(0, (selectedUser.coins || 0) - amount);

      await updateDoc(doc(db, "users", selectedUser.id), {
        coins: newBalance
      });

      await addDoc(collection(db, "coin_transactions"), {
        userId: selectedUser.id,
        userEmail: selectedUser.email,
        amount: transactionType === "add" ? amount : -amount,
        type: transactionType === "add" ? "admin_bonus" : "admin_deduction",
        reason: transactionReason,
        createdAt: serverTimestamp(),
      });

      setSelectedUser(null);
      setTransactionAmount("");
      setTransactionReason("");
      fetchUsers();
    } catch(e) { console.error(e); }
    setProcessing(false);
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Treasury <span className="text-[#FF2D2D]">Ledger</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Manage user assets & cryptographic balances</p>
        </div>
        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FF2D2D] transition-colors" size={18} />
            <input
                type="text"
                placeholder="Search node identity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-[#121212] border border-[#242424] rounded-2xl outline-none focus:border-[#FF2D2D] w-full sm:w-96 text-sm font-bold text-white transition-all shadow-2xl"
            />
        </div>
      </div>

      <div className="admin-card !p-0 overflow-hidden border-[#242424] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap border-collapse">
            <thead className="bg-[#090909]/50 border-b border-[#242424]">
              <tr>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Node Identity</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Current Balance</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Yield Earned</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Asset Purchases</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {loading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="p-10 animate-pulse bg-[#121212]/50"></td></tr>)
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="p-32 text-center text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">No wallet signatures found in this sector</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#090909] border border-[#242424] flex items-center justify-center font-black text-slate-700 text-sm">
                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div className="font-black text-white text-sm tracking-tight">@{user.username || user.displayName || "unknown"}</div>
                            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-0.5">{user.email}</div>
                        </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 font-black text-white text-base tracking-tighter">
                      <Coins size={14} className="text-amber-500" />
                      {(user.coins || 0).toLocaleString()} <span className="text-[9px] text-slate-600 uppercase ml-1">ZIVO</span>
                    </div>
                  </td>
                  <td className="p-6 font-bold text-emerald-500 text-sm">{(user.earnedCoins || 0).toLocaleString()}</td>
                  <td className="p-6 font-bold text-blue-500 text-sm">{(user.purchasedCoins || 0).toLocaleString()}</td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => handleOpenManage(user)}
                      className="px-5 py-2.5 bg-[#090909] border border-[#242424] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#FF2D2D] hover:border-[#FF2D2D] transition-all"
                    >
                      Audit Node
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#121212] rounded-[40px] border border-[#242424] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-[#242424] flex items-center justify-between bg-gradient-to-r from-red-500/5 to-transparent shrink-0">
              <div>
                 <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Wallet Audit</h3>
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Deep inspection of @{selectedUser.username || "target node"}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-3 text-slate-500 hover:text-white hover:bg-[#1A1A1A] rounded-2xl transition-all"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-[#090909]/30">
              <div className="bg-[#090909] rounded-3xl p-8 border border-[#242424] flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#FF2D2D]/10 flex items-center justify-center text-[#FF2D2D] border border-[#FF2D2D]/20">
                        <Database size={32} />
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1.5">Network Identity</div>
                      <div className="font-black text-white text-lg tracking-tight">{selectedUser.email}</div>
                      <div className="text-[10px] text-slate-700 font-mono font-bold mt-1 uppercase">Node Hash: {selectedUser.id}</div>
                    </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1.5">Liquid Assets</div>
                  <div className="font-black text-white text-3xl tracking-tighter flex items-center justify-end gap-3">
                    <Coins size={24} className="text-amber-500" />
                    {(selectedUser.coins || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Transaction History */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 ml-1">
                        <History size={18} className="text-slate-600"/>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Transaction Ledger</h4>
                    </div>
                    <div className="space-y-3">
                        {loadingTransactions ? (
                            <div className="py-20 text-center animate-pulse flex flex-col items-center">
                                <div className="w-8 h-8 border-2 border-[#FF2D2D] border-t-transparent rounded-full animate-spin mb-4"></div>
                                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Scanning Blockchain...</span>
                            </div>
                        ) : userTransactions.length === 0 ? (
                            <div className="py-20 text-center border border-dashed border-[#242424] rounded-3xl">
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Zero Operations Recorded</p>
                            </div>
                        ) : userTransactions.map(t => (
                            <div key={t.id} className="p-5 bg-[#121212] border border-[#242424] rounded-2xl flex justify-between items-center group/item hover:border-[#FF2D2D]/20 transition-all">
                                <div>
                                    <p className="font-black text-white text-sm tracking-tight line-clamp-1">{(t.reason || t.type).toUpperCase()}</p>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 tracking-widest">{t.createdAt ? formatDate(t.createdAt.toDate()) : 'Genesis'}</p>
                                </div>
                                <div className={cn("font-black text-base tracking-tighter", t.amount > 0 ? "text-emerald-500" : "text-red-500")}>
                                    {t.amount > 0 ? "+" : ""}{t.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Adjust Balance Form */}
                <div className="space-y-8 bg-[#121212] p-8 rounded-[32px] border border-[#242424] shadow-2xl h-fit">
                  <div className="flex items-center gap-3 ml-1">
                      <Zap size={18} className="text-[#FF2D2D]"/>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Admin Intervention</h4>
                  </div>

                  <div className="flex bg-[#090909] p-1.5 rounded-2xl border border-[#242424]">
                    <button
                      onClick={() => setTransactionType("add")}
                      className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300", transactionType === "add" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/40" : "text-slate-600 hover:text-slate-400")}
                    >
                      Credit Node
                    </button>
                    <button
                      onClick={() => setTransactionType("deduct")}
                      className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300", transactionType === "deduct" ? "bg-red-500 text-white shadow-lg shadow-red-900/40" : "text-slate-600 hover:text-slate-400")}
                    >
                      Burn Asset
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Asset Volume</label>
                      <input
                        type="number"
                        value={transactionAmount}
                        onChange={(e) => setTransactionAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-base font-black focus:border-[#FF2D2D] outline-none shadow-inner tracking-tighter"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Operational Justification</label>
                      <input
                        type="text"
                        value={transactionReason}
                        onChange={(e) => setTransactionReason(e.target.value)}
                        placeholder="Define reason for correction..."
                        className="w-full px-6 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleTransaction}
                    disabled={processing || !transactionAmount || !transactionReason}
                    className={cn("w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 shadow-2xl",
                      transactionType === "add" ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20" : "bg-red-600 hover:bg-red-500 text-white shadow-red-900/20"
                    )}
                  >
                    {processing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                      <><Check size={18} /> Execute Protocol</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
