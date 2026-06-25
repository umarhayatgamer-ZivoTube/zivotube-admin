"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy, increment } from "firebase/firestore";
import { CheckCircle, XCircle, Clock, Banknote, CreditCard, Landmark, Send, User, Upload, MessageSquare, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");
  
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"Approve" | "Reject" | "Paid" | "Queue" | "Review" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [processing, setProcessing] = useState(false);

  const TABS = ['Pending', 'Under Review', 'Approved', 'Paid', 'Rejected', 'Queued For Next Cycle'];

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "withdrawals"), orderBy("createdAt", "desc")));
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async () => {
    if (!selectedReq || !actionType) return;
    setProcessing(true);
    
    try {
      const updateData: any = { 
        status: actionType === "Queue" ? "Queued For Next Cycle" : actionType === "Review" ? "Under Review" : actionType,
      };
      
      if (adminNote) updateData.adminNote = adminNote;
      if (actionType === "Paid" && paymentProofUrl) updateData.paymentProofUrl = paymentProofUrl;

      await updateDoc(doc(db, "withdrawals", selectedReq.id), updateData);

      if (actionType === 'Reject' && selectedReq.coinsUsed) {
          await updateDoc(doc(db, "users", selectedReq.userId), {
              coins: increment(selectedReq.coinsUsed)
          });
      }

      setSelectedReq(null);
      setActionType(null);
      setAdminNote("");
      setPaymentProofUrl("");
      fetchRequests();
    } catch(e) {
      console.error(e);
    }
    setProcessing(false);
  };

  const filtered = requests.filter(r => (r.status || "Pending") === activeTab);

  const getQueuePosition = (id: string) => {
    const pending = requests.filter(r => r.status === 'Pending').sort((a,b) => a.createdAt?.seconds - b.createdAt?.seconds);
    const index = pending.findIndex(r => r.id === id);
    return index !== -1 ? index + 1 : null;
  };

  const openModal = (req: any, type: any) => {
    setSelectedReq(req);
    setActionType(type);
    setAdminNote(req.adminNote || "");
    setPaymentProofUrl(req.paymentProofUrl || "");
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Financial <span className="text-[#FF2D2D]">Flow</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Treasury Operations & Settlement Node</p>
        </div>
        <div className="bg-[#121212] p-1.5 rounded-2xl border border-[#242424] flex flex-wrap items-center shadow-2xl gap-1">
           {TABS.map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                 activeTab === tab ? "bg-[#FF2D2D] text-white shadow-lg shadow-red-900/40" : "text-slate-500 hover:text-slate-300"
               )}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
           Array(3).fill(0).map((_, i) => <div key={i} className="h-44 bg-[#121212] rounded-[32px] animate-pulse border border-[#242424]"></div>)
        ) : filtered.length === 0 ? (
            <div className="admin-card py-32 flex flex-col items-center border-dashed border-2 border-[#242424]">
                <Clock className="text-slate-800 mb-6" size={64} />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Clearance Signal: No {activeTab.toLowerCase()} requests detected</p>
            </div>
        ) : (
          filtered.map((req) => (
            <div key={req.id} className="admin-card group hover:border-[#FF2D2D]/30 transition-all flex flex-col xl:flex-row gap-10">
              
              {/* User & Amount Info */}
              <div className="flex items-start gap-8 xl:w-1/3 border-b xl:border-b-0 xl:border-r border-[#242424] pb-8 xl:pb-0 xl:pr-10">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner shrink-0 border border-emerald-500/20">
                    <Banknote size={40} />
                </div>
                <div className="space-y-3">
                    <p className="text-4xl font-black text-white tracking-tighter">{req.amount} <span className="text-xs text-slate-500 font-black uppercase tracking-widest">PKR</span></p>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black rounded-full border border-amber-500/20 uppercase tracking-widest">{req.coinsUsed || 0} Coins</span>
                      {req.priorityLevel === 'high' && <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[9px] font-black rounded-full border border-red-500/20 uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={10}/> Critical</span>}
                    </div>
                    <div className="pt-3">
                      <p className="font-black text-white text-sm tracking-tight">@{req.userName || "Unknown Node"}</p>
                      <p className="text-slate-500 text-[11px] font-bold mt-1 uppercase tracking-tight">{req.email}</p>
                    </div>
                    {activeTab === 'Pending' && getQueuePosition(req.id) && (
                        <div className="pt-2 text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Queue Pos: #{getQueuePosition(req.id)}
                        </div>
                    )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="xl:w-1/3 space-y-6 border-b xl:border-b-0 xl:border-r border-[#242424] pb-8 xl:pb-0 xl:pr-10">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
                          <Landmark size={18} />
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-[0.2em]">{req.method}</span>
                   </div>
                   <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 bg-[#090909] px-3 py-1 rounded-full border border-[#242424]">
                     <Clock size={12} /> {req.createdAt ? formatDate(req.createdAt.toDate()) : 'T-Minus: Unknown'}
                   </div>
                 </div>

                 <div className="bg-[#090909] rounded-2xl p-6 text-[11px] space-y-3 border border-[#242424]">
                    {req.accountTitle && <div className="flex justify-between items-center"><span className="text-slate-500 font-bold uppercase tracking-widest">Title</span> <span className="font-black text-white">{req.accountTitle}</span></div>}
                    {req.bankName && <div className="flex justify-between items-center"><span className="text-slate-500 font-bold uppercase tracking-widest">Bank</span> <span className="font-black text-white">{req.bankName}</span></div>}
                    {req.accountNumber && <div className="flex justify-between items-center"><span className="text-slate-500 font-bold uppercase tracking-widest">Identifier</span> <span className="font-mono font-black text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded">{req.accountNumber}</span></div>}
                    {req.mobileNumber && <div className="flex justify-between items-center"><span className="text-slate-500 font-bold uppercase tracking-widest">Phone</span> <span className="font-mono font-black text-white">{req.mobileNumber}</span></div>}
                 </div>
              </div>

              {/* Actions */}
              <div className="xl:w-1/3 flex flex-col justify-center gap-4">
                {activeTab === 'Pending' && (
                    <>
                        <button onClick={() => openModal(req, "Review")} className="w-full bg-[#1A1A1A] text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all border border-[#242424]">Initialize Review</button>
                        <div className="flex gap-4">
                          <button onClick={() => openModal(req, "Approve")} className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-xl">Approve</button>
                          <button onClick={() => openModal(req, "Reject")} className="flex-1 bg-[#090909] text-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20">Decline</button>
                        </div>
                    </>
                )}
                {activeTab === 'Under Review' && (
                    <>
                        <button onClick={() => openModal(req, "Approve")} className="w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Grant Approval</button>
                        <button onClick={() => openModal(req, "Reject")} className="w-full bg-[#090909] text-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20 mt-2">Terminate Request</button>
                    </>
                )}
                {activeTab === 'Approved' && (
                    <>
                        <button onClick={() => openModal(req, "Paid")} className="w-full premium-gradient text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-red-900/40">
                            <Send size={18} /> Execute Payout
                        </button>
                        <button onClick={() => openModal(req, "Queue")} className="w-full bg-[#1A1A1A] text-amber-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10 transition-all border border-amber-500/10">Queue for Batch</button>
                    </>
                )}
                {(activeTab === 'Paid' || activeTab === 'Rejected') && (
                    <div className={cn(
                        "w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-center border",
                        activeTab === 'Paid' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-red-500/5 text-red-500 border-red-500/20"
                    )}>
                        Process: {activeTab}
                    </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Modal */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#121212] rounded-[40px] border border-[#242424] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b border-[#242424] flex items-center justify-between bg-gradient-to-r from-red-500/5 to-transparent">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{actionType} Protocol</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manual Overrides & Authentication</p>
              </div>
              <button onClick={() => { setSelectedReq(null); setActionType(null); }} className="p-3 text-slate-500 hover:text-white hover:bg-[#1A1A1A] rounded-2xl transition-all"><XCircle size={24}/></button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="bg-[#090909] p-6 rounded-[24px] border border-[#242424] flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Amount</span>
                <span className="text-2xl font-black text-white">{selectedReq.amount} <span className="text-[10px] text-red-500 uppercase">PKR</span></span>
              </div>

              {actionType === "Paid" && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 block">Transaction Reference / Receipt URL</label>
                  <input
                    type="url"
                    value={paymentProofUrl}
                    onChange={(e) => setPaymentProofUrl(e.target.value)}
                    placeholder="https://tx-ref.com/..."
                    className="w-full px-6 py-5 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold outline-none focus:border-[#FF2D2D] transition-all"
                  />
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 block">Operation Log / Admin Note</label>
                <textarea 
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Record justification for this action..."
                  rows={4}
                  className="w-full px-6 py-5 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold outline-none focus:border-[#FF2D2D] transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-10 bg-[#090909]/50 border-t border-[#242424] flex gap-4">
              <button 
                onClick={handleAction}
                disabled={processing}
                className={cn("flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all disabled:opacity-50",
                  actionType === "Reject" ? "bg-red-600 hover:bg-red-500 text-white" :
                  actionType === "Paid" ? "bg-emerald-600 hover:bg-emerald-500 text-white" :
                  "bg-white hover:bg-slate-100 text-black"
                )}
              >
                {processing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                  <>Execute Protocol</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
