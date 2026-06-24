"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { LifeBuoy, Search, MessageCircle, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("open");
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "supportTickets"), orderBy("createdAt", "desc")));
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleClose = async (id: string) => {
    await updateDoc(doc(db, "supportTickets", id), { status: "closed" });
    setSelected(null);
    fetchTickets();
  };

  const handleReply = async (id: string) => {
    if (!reply.trim()) return;
    setReplying(true);
    try {
      await updateDoc(doc(db, "supportTickets", id), {
        adminReply: reply,
        status: "replied",
        repliedAt: new Date().toISOString(),
      });
      setReply("");
      setSelected(null);
      fetchTickets();
    } catch(e) { console.error(e); }
    setReplying(false);
  };

  const statusIcon = (status: string) => {
    if (status === "closed") return <XCircle size={14} className="text-slate-400"/>;
    if (status === "replied") return <CheckCircle size={14} className="text-green-500"/>;
    return <Clock size={14} className="text-amber-500"/>;
  };
  const statusColor = (status: string) => {
    if (status === "closed") return "bg-slate-100 text-slate-500";
    if (status === "replied") return "bg-green-50 text-green-600";
    return "bg-amber-50 text-amber-700";
  };

  const filtered = tickets.filter(t => {
    const matchSearch = t.subject?.toLowerCase().includes(search.toLowerCase()) || t.userId?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" || t.status === activeTab || (activeTab === "open" && !t.status);
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support Tickets</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage user help requests and inquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-64 transition-all"/>
          </div>
        </div>
      </div>

      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex items-center shadow-sm w-fit">
        {["open","replied","closed","all"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse"/>)
          ) : filtered.length === 0 ? (
            <div className="admin-card border-dashed border-2 py-20 flex flex-col items-center">
              <LifeBuoy className="text-slate-300 mb-4" size={40}/>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No tickets found</p>
            </div>
          ) : filtered.map(ticket => (
            <div key={ticket.id} onClick={() => setSelected(ticket)} className={cn("admin-card cursor-pointer hover:border-red-200 transition-all", selected?.id === ticket.id && "border-red-300 bg-red-50/30")}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {statusIcon(ticket.status)}
                    <span className="font-black text-slate-900 text-sm truncate">{ticket.subject || "No Subject"}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{ticket.message || ticket.body}</p>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase", statusColor(ticket.status || "open"))}>
                      {ticket.status || "open"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">UID: {ticket.userId?.substring(0,10)}...</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="admin-card sticky top-8">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-black text-slate-900">{selected.subject || "Ticket Details"}</h3>
              <button onClick={() => setSelected(null)} className="p-1 text-slate-400 hover:text-slate-600"><XCircle size={18}/></button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">User Message</p>
              <p className="text-sm text-slate-700">{selected.message || selected.body}</p>
            </div>
            {selected.adminReply && (
              <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-400 uppercase mb-2">Admin Reply</p>
                <p className="text-sm text-blue-700">{selected.adminReply}</p>
              </div>
            )}
            <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." rows={4} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none mb-3"/>
            <div className="flex gap-2">
              <button onClick={() => handleReply(selected.id)} disabled={replying} className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50">
                {replying ? "Sending..." : "Send Reply"}
              </button>
              <button onClick={() => handleClose(selected.id)} className="px-4 py-3 border border-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
