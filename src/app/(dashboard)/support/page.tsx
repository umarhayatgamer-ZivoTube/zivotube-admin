"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { LifeBuoy, Search, MessageCircle, CheckCircle, Clock, XCircle, FileText, Send, RotateCcw, ShieldCheck, Filter } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("open");
  const [selected, setSelected] = useState<any>(null);
  
  const [reply, setReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "support_tickets"), orderBy("createdAt", "desc")));
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleAction = async (id: string, actionType: 'reply' | 'note' | 'close' | 'reopen') => {
    setProcessing(true);
    try {
      const updateData: any = { updatedAt: serverTimestamp() };

      if (actionType === 'reply') {
          if (!reply.trim()) return;
          updateData.adminReply = reply;
          updateData.status = "replied";
          updateData.repliedAt = serverTimestamp();
      } else if (actionType === 'note') {
          if (!internalNote.trim()) return;
          updateData.internalNote = internalNote;
      } else if (actionType === 'close') {
          updateData.status = "closed";
      } else if (actionType === 'reopen') {
          updateData.status = "open";
      }

      await updateDoc(doc(db, "support_tickets", id), updateData);
      
      if (actionType === 'reply') setReply("");
      if (actionType === 'note') setInternalNote("");
      
      if (actionType === 'close') setSelected(null);
      else {
          setSelected((prev: any) => ({ ...prev, ...updateData, status: updateData.status || prev.status }));
      }
      fetchTickets();
    } catch(e) { console.error(e); }
    setProcessing(false);
  };

  const statusIcon = (status: string) => {
    if (status === "closed") return <XCircle size={14} className="text-slate-500"/>;
    if (status === "replied") return <CheckCircle size={14} className="text-emerald-500"/>;
    return <Clock size={14} className="text-amber-500"/>;
  };
  
  const statusColor = (status: string) => {
    if (status === "closed") return "bg-slate-800 text-slate-500 border-slate-700";
    if (status === "replied") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  const filtered = tickets.filter(t => {
    const matchSearch = t.subject?.toLowerCase().includes(search.toLowerCase()) || t.userId?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" || t.status === activeTab || (activeTab === "open" && (!t.status || t.status === 'open'));
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Support <span className="text-[#FF2D2D]">Link</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Bi-Directional Communication & Resolution Terminal</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FF2D2D] transition-colors" size={18}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search communication logs..." className="w-full sm:w-80 pl-12 pr-6 py-4 bg-[#121212] border border-[#242424] text-white rounded-2xl text-sm font-bold outline-none focus:border-[#FF2D2D] transition-all shadow-2xl"/>
          </div>
          <div className="bg-[#121212] p-1.5 rounded-[20px] border border-[#242424] flex items-center shadow-2xl w-full sm:w-auto overflow-hidden">
            {["open","replied","closed","all"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                    "flex-1 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    activeTab === tab ? "bg-[#FF2D2D] text-white shadow-lg shadow-red-900/40" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Ticket List */}
        <div className="w-full lg:w-1/2 xl:w-5/12 space-y-6">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="h-32 bg-[#121212] rounded-[32px] animate-pulse border border-[#242424]"/>)
          ) : filtered.length === 0 ? (
            <div className="admin-card border-dashed border-2 border-[#242424] py-32 flex flex-col items-center">
              <LifeBuoy className="text-slate-800 mx-auto mb-6" size={64}/>
              <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">No active signals in this frequency</p>
            </div>
          ) : filtered.map(ticket => (
            <div key={ticket.id} onClick={() => { setSelected(ticket); setReply(""); setInternalNote(ticket.internalNote || ""); }} className={cn("admin-card cursor-pointer group relative overflow-hidden", selected?.id === ticket.id ? "border-[#FF2D2D]/50 ring-1 ring-[#FF2D2D]/20 bg-[#FF2D2D]/5" : "hover:border-[#FF2D2D]/30")}>
              <div className="flex items-start justify-between gap-6 mb-4">
                <div className="flex items-center gap-3">
                    {statusIcon(ticket.status || 'open')}
                    <span className={cn("px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border", statusColor(ticket.status || "open"))}>
                      {ticket.status || "open"}
                    </span>
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{ticket.createdAt ? formatDate(ticket.createdAt.toDate()) : ''}</span>
              </div>
              <h3 className="font-black text-white text-base tracking-tight line-clamp-1 mb-2">{(ticket.subject || "No Subject").toUpperCase()}</h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{ticket.message || ticket.body}</p>
              <div className="mt-6 pt-6 border-t border-[#242424] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#FF2D2D]"/>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sender: {ticket.userEmail || ticket.userId?.substring(0,10)}</span>
                  </div>
                  {ticket.internalNote && <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20"><FileText size={12}/></div>}
              </div>
            </div>
          ))}
        </div>

        {/* Ticket Details Panel */}
        <div className="w-full lg:w-1/2 xl:w-7/12 sticky top-10">
            {selected ? (
                <div className="admin-card !p-0 overflow-hidden flex flex-col border-[#242424] shadow-2xl">
                    <div className="p-10 border-b border-[#242424] flex items-start justify-between bg-gradient-to-r from-[#FF2D2D]/5 to-transparent">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", statusColor(selected.status || "open"))}>
                                    {selected.status || "open"}
                                </span>
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{selected.ticketId || selected.id}</span>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{selected.subject || "Incoming Transmission"}</h2>
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2">Source Origin: {selected.userEmail || selected.userId}</p>
                        </div>
                        <button onClick={() => setSelected(null)} className="p-3 text-slate-500 hover:text-white hover:bg-[#1A1A1A] rounded-2xl transition-all"><XCircle size={24}/></button>
                    </div>

                    <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#090909]/30">
                        {/* Original Message */}
                        <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 ml-1">Payload Content</p>
                            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 text-sm text-slate-300 font-medium leading-relaxed whitespace-pre-wrap shadow-inner">
                                {selected.message || selected.body}
                            </div>
                        </div>

                        {/* Admin Reply */}
                        {selected.adminReply && (
                            <div>
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 ml-1">Terminal Response</p>
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-sm text-emerald-400 font-medium leading-relaxed whitespace-pre-wrap shadow-inner">
                                    {selected.adminReply}
                                </div>
                            </div>
                        )}

                        {/* Reply Form */}
                        {(selected.status === 'open' || selected.status === 'replied') && (
                            <div className="space-y-4 pt-10 border-t border-[#242424]">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">Construct Response</p>
                                <textarea 
                                    value={reply} 
                                    onChange={e => setReply(e.target.value)} 
                                    placeholder="Input transmission details..."
                                    rows={5}
                                    className="w-full px-6 py-5 bg-[#090909] border border-[#242424] text-white rounded-2xl text-sm font-bold outline-none focus:border-[#FF2D2D] transition-all resize-none shadow-inner"
                                />
                                <button onClick={() => handleAction(selected.id, 'reply')} disabled={processing || !reply.trim()} className="w-full premium-button flex items-center justify-center gap-3">
                                    {processing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Send size={16}/> Dispatch Signal</>}
                                </button>
                            </div>
                        )}

                        {/* Internal Note */}
                        <div className="space-y-4 pt-10 border-t border-[#242424]">
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] ml-1 flex items-center gap-2"><ShieldCheck size={14}/> Staff Encryption Layer</p>
                            <textarea 
                                value={internalNote} 
                                onChange={e => setInternalNote(e.target.value)} 
                                placeholder="Add private operational notes..."
                                rows={3}
                                className="w-full px-6 py-5 bg-[#090909] border border-amber-500/20 text-white rounded-2xl text-sm font-bold outline-none focus:border-amber-500 transition-all resize-none shadow-inner"
                            />
                            <button onClick={() => handleAction(selected.id, 'note')} disabled={processing || !internalNote.trim()} className="w-full bg-amber-500/5 text-amber-500 border border-amber-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all disabled:opacity-50">
                                Save Local Metadata
                            </button>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-10 bg-[#090909]/50 border-t border-[#242424]">
                        {selected.status !== 'closed' ? (
                            <button onClick={() => handleAction(selected.id, 'close')} disabled={processing} className="w-full bg-[#1A1A1A] text-slate-500 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-[#242424] hover:bg-[#FF2D2D] hover:text-white transition-all flex items-center justify-center gap-3">
                                <XCircle size={18}/> Decommission Ticket
                            </button>
                        ) : (
                            <button onClick={() => handleAction(selected.id, 'reopen')} disabled={processing} className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FF2D2D] hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl">
                                <RotateCcw size={18}/> Re-Initialize Signal
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="admin-card py-48 flex flex-col items-center justify-center text-center border-dashed border-2 border-[#242424] bg-transparent shadow-none">
                    <div className="w-20 h-20 rounded-3xl bg-[#121212] border border-[#242424] flex items-center justify-center mb-8 text-slate-800">
                        <MessageCircle size={40}/>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No Active Stream</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Select a transmission from the log to initialize uplink</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
