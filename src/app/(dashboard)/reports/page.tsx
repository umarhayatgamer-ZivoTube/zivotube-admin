"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { MessageSquare, Search, AlertTriangle, CheckCircle, Trash2, Eye } from "lucide-react";
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
    spam: "bg-orange-100 text-orange-700",
    inappropriate: "bg-red-100 text-red-700",
    harassment: "bg-pink-100 text-pink-700",
    misinformation: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Content Reports</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Review and action user-submitted reports</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-64 transition-all"/>
        </div>
      </div>

      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex items-center shadow-sm w-fit">
        {["pending","resolved","dismissed","all"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")}>
            {tab}
          </button>
        ))}
      </div>

      <div className="admin-card !p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Reason</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported Content</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporter</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="p-8 animate-pulse bg-slate-50/30"></td></tr>)
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-20 text-center">
                <MessageSquare className="mx-auto text-slate-300 mb-3" size={32}/>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No reports found</p>
              </td></tr>
            ) : filtered.map(report => (
              <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-orange-500"/>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase", reasonColors[report.reason] || "bg-slate-100 text-slate-600")}>
                      {report.reason || "Other"}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-xs font-bold text-slate-700 capitalize">{report.contentType || "Video"}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{report.reportedId?.substring(0,16)}...</p>
                  </div>
                </td>
                <td className="p-4 text-[10px] text-slate-400 font-mono">{report.reporterId?.substring(0,12)}...</td>
                <td className="p-4">
                  <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    report.status === "resolved" ? "bg-green-50 text-green-600" :
                    report.status === "dismissed" ? "bg-slate-100 text-slate-500" :
                    "bg-amber-50 text-amber-700"
                  )}>
                    {report.status || "Pending"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {(!report.status || report.status === "pending") && (
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleResolve(report.id)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Resolve">
                        <CheckCircle size={15}/>
                      </button>
                      <button onClick={() => handleDismiss(report.id)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="Dismiss">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

