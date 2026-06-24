import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Megaphone, Trash2, Calendar } from 'lucide-react';

export default function AnnouncementCenter() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newMsg, setNewMsg] = useState({ title: '', content: '', priority: 'Normal' });

  const fetchAnnouncements = async () => {
    setLoading(true);
    const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "announcements"), {
        ...newMsg,
        timestamp: Date.now()
    });
    setShowModal(false);
    setNewMsg({ title: '', content: '', priority: 'Normal' });
    fetchAnnouncements();
  };

  const handleDelete = async (id) => {
    if (confirm("Remove this announcement?")) {
        await deleteDoc(doc(db, "announcements", id));
        fetchAnnouncements();
    }
  };

  return (
    <Layout title="Announcement Center">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-gray-500 font-medium">Post news and updates directly to the app home screen</h3>
        <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 transition shadow-md"
        >
          <Megaphone size={18} />
          Post Update
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Fetching news...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium bg-white p-20 rounded-3xl border border-dashed">No announcements posted yet.</div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                        item.priority === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                        {item.priority}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                        <Calendar size={12} />
                        {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                </div>
                <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                <p className="text-gray-500 text-sm mt-2">{item.content}</p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500 transition p-2">
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <form onSubmit={handleCreate} className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                <h3 className="text-2xl font-black mb-6 text-gray-900">Post Announcement</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-400 mb-1">Title</label>
                        <input required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-red-500" value={newMsg.title} onChange={e => setNewMsg({...newMsg, title: e.target.value})} placeholder="Maintenance Schedule" />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-400 mb-1">Content</label>
                        <textarea required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-red-500 h-32" value={newMsg.content} onChange={e => setNewMsg({...newMsg, content: e.target.value})} placeholder="ZivoTube will be down for 2 hours tonight..." />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-400 mb-1">Priority</label>
                        <div className="flex gap-2">
                            {['Normal', 'Urgent'].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setNewMsg({...newMsg, priority: p})}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${newMsg.priority === p ? 'bg-slate-900 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition">Discard</button>
                    <button type="submit" className="flex-1 py-3 font-black bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition uppercase tracking-widest flex items-center justify-center gap-2">
                        <Megaphone size={18} /> Post Now
                    </button>
                </div>
            </form>
        </div>
      )}
    </Layout>
  );
}
