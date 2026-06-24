import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { MessageCircle, CheckCircle2, Clock, X } from 'lucide-react';
import { ChatBox } from '../../components/ChatBox';

export default function SupportManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    const q = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "support_tickets", id), {
        status: newStatus,
        lastUpdate: Date.now()
    });
    fetchTickets();
  };

  return (
    <Layout title="Support Tickets">
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No support tickets found.</div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        ticket.status === 'OPEN' ? 'bg-red-100 text-red-600' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                    }`}>
                        {ticket.status}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">#{ticket.id}</span>
                </div>
                <h4 className="font-bold text-gray-900 text-lg">{ticket.subject}</h4>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{ticket.message}</p>
                <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>User: {ticket.userId}</span>
                    <span>Date: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-50 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                {ticket.status !== 'RESOLVED' && (
                    <button
                        onClick={() => handleStatus(ticket.id, 'RESOLVED')}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-green-600 hover:text-white transition"
                    >
                        <CheckCircle2 size={14} /> Resolve
                    </button>
                )}
                {ticket.status === 'OPEN' && (
                    <button
                        onClick={() => handleStatus(ticket.id, 'IN_PROGRESS')}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition"
                    >
                        <Clock size={14} /> Process
                    </button>
                )}
                <button
                  onClick={() => setActiveChat(ticket)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition"
                >
                    <MessageCircle size={14} /> Chat
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {activeChat && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
             <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-black">Chat with User</h3>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Ticket: {activeChat.subject}</p>
                </div>
                <button onClick={() => setActiveChat(null)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition">
                   <X size={20} />
                </button>
             </div>
             <div className="p-6">
                <ChatBox ticketId={activeChat.id} />
             </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
