"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { MessageSquare, Search, AlertTriangle, CheckCircle, Trash2, Eye, ShieldAlert, Filter, XCircle } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc")));
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const handleResolve = async (id: string) => {
    await updateDoc(doc(db, "reports", id), { status: "resolved" });
    fetchReports();
  };

  const handleDismiss = async (id: string) => {
    await updateDoc(doc(db, "reports", id), { status: "dismissed" });
    fetchReports();
  };

  const filtered = reports.filter(r => {
    const matchSearch = r.reason?.toLowerCase().includes(search.toLowerCase()) || r.reportedId?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" || r.status === activeTab || (!r.status && activeTab === "pending");
    return matchSearch && matchTab;
  });

  const reasonColors: Record<string, string> = {
    spam: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    inappropriate: "bg-red-500/10 text-red-400 border-red-500/20",
    harassment: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    misinformation: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Incident <span className="text-[#FF2D2D]">Reports</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Community Trust & Content Integrity Enforcement</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FF2D2D] transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search report hash..."
                    className="pl-12 pr-6 py-4 bg-[#121212] border border-[#242424] rounded-2xl outline-none focus:border-[#FF2D2D] w-full sm:w-80 text-sm font-bold text-white transition-all shadow-2xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="bg-[#121212] p-1.5 rounded-[20px] border border-[#242424] flex items-center shadow-2xl w-fit">
        {["pending","resolved","dismissed","all"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                activeTab === tab ? "bg-[#FF2D2D] text-white shadow-lg shadow-red-900/40" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="admin-card !p-0 overflow-hidden border-[#242424] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#090909]/50 border-b border-[#242424]">
              <tr>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Signal Reason</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Target Node</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Reporter ID</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {loading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="p-10 animate-pulse bg-[#121212]/50"></td></tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-32 text-center">
                  <ShieldAlert className="mx-auto text-slate-800 mb-6" size={64}/>
                  <p className="text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">Zero Interference: No active incidents reported</p>
                </td></tr>
              ) : (
                filtered.map(report => (
                  <tr key={report.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
                            <AlertTriangle size={16}/>
                        </div>
                        <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", reasonColors[report.reason] || "bg-slate-800 text-slate-400 border-slate-700")}>
                          {report.reason || "General Violation"}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <p className="text-xs font-black text-white tracking-tight uppercase">{report.contentType || "Video Unit"}</p>
                        <p className="text-[10px] text-slate-600 font-mono font-bold mt-1 tracking-tighter">{report.reportedId}</p>
                      </div>
                    </td>
                    <td className="p-6 text-[10px] text-slate-500 font-mono font-bold tracking-tight">{report.reporterId}</td>
                    <td className="p-6 text-center">
                      <span className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                        report.status === "resolved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        report.status === "dismissed" ? "bg-slate-800 text-slate-500 border-slate-700" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>
                        {report.status || "Analyzing"}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      {(!report.status || report.status === "pending") && (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => handleResolve(report.id)} className="p-3 bg-[#090909] text-slate-500 hover:text-emerald-500 border border-[#242424] rounded-xl transition-all" title="Resolve Protocol">
                            <CheckCircle size={16}/>
                          </button>
                          <button onClick={() => handleDismiss(report.id)} className="p-3 bg-[#090909] text-slate-500 hover:text-red-500 border border-[#242424] rounded-xl transition-all" title="Dismiss Signal">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
