"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy, where, increment } from "firebase/firestore";
import { CheckCircle, XCircle, Clock, Banknote, CreditCard, Landmark, Send, User, Wallet } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");

  const fetchRequests = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "withdrawals"), orderBy("timestamp", "desc")));
    setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdate = async (id: string, status: string, userId: string, amount: number) => {
    if (confirm(`Set status to ${status.toUpperCase()}?`)) {
        await updateDoc(doc(db, "withdrawals", id), { status });

        // If rejected, refund the earnings (optional based on your business logic)
        if (status === 'Rejected') {
            await updateDoc(doc(db, "users", userId), {
                totalEarnings: increment(amount)
            });
        }

        fetchRequests();
    }
  };

  const filtered = requests.filter(r => r.status === activeTab);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Treasury</h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Audit and process payout requests</p>
        </div>
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex items-center shadow-sm">
           {['Pending', 'Approved', 'Paid', 'Rejected'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                 activeTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
               )}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
           Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse border border-slate-200"></div>)
        ) : filtered.length === 0 ? (
            <div className="admin-card !bg-transparent border-dashed border-2 py-20 flex flex-col items-center">
                <Clock className="text-slate-300 mb-4" size={40} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No {activeTab.toLowerCase()} requests found</p>
            </div>
        ) : (
          filtered.map((req) => (
            <div key={req.id} className="admin-card group hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-inner">
                    <Banknote size={32} />
                </div>
                <div>
                    <p className="text-2xl font-black text-slate-900">Rs. {req.amount?.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                         <User size={12} className="text-slate-400" />
                         <span className="text-xs font-bold text-slate-500 italic">User ID: {req.userId?.substring(0, 12)}...</span>
                    </div>
                </div>
              </div>

              <div className="flex-1 space-y-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-8">
                 <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-50 text-blue-600 rounded-md">
                        {req.method === 'Bank Account' ? <Landmark size={14} /> : <CreditCard size={14} />}
                    </div>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{req.method}</span>
                 </div>
                 <p className="text-xs font-mono text-slate-400 bg-slate-50 p-2 rounded-lg break-all">{req.accountDetails}</p>
              </div>

              <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-8 min-w-[280px]">
                {activeTab === 'Pending' && (
                    <>
                        <button
                            onClick={() => handleUpdate(req.id, 'Approved', req.userId, req.amount)}
                            className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => handleUpdate(req.id, 'Rejected', req.userId, req.amount)}
                            className="flex-1 bg-red-50 text-red-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                        >
                            Reject
                        </button>
                    </>
                )}
                {activeTab === 'Approved' && (
                    <button
                        onClick={() => handleUpdate(req.id, 'Paid', req.userId, req.amount)}
                        className="w-full bg-green-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-900/20"
                    >
                        <Send size={16} /> Confirm Payment Sent
                    </button>
                )}
                {(activeTab === 'Paid' || activeTab === 'Rejected') && (
                    <div className={cn(
                        "w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center",
                        activeTab === 'Paid' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                        Status: {activeTab}
                    </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
