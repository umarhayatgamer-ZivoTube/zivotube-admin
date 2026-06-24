import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Tag, Star } from 'lucide-react';

export default function TemplateManagement() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTask] = useState({
    title: '',
    creatorUsername: 'Admin',
    priceCoins: 500,
    category: 'STATUS',
    isPremium: false
  });

  const fetchTemplates = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "templates"));
    setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "templates"), {
        ...newTemplate,
        createdAt: Date.now()
    });
    setShowModal(false);
    fetchTemplates();
  };

  const handleDelete = async (id) => {
    if (confirm("Remove this template from marketplace?")) {
        await deleteDoc(doc(db, "templates", id));
        fetchTemplates();
    }
  };

  return (
    <Layout title="Template Management">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-gray-500 font-medium">Manage marketplace templates and packs</h3>
        <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 transition shadow-md"
        >
          <Plus size={18} />
          Add Template
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-4 text-center py-20 text-gray-400">Loading marketplace...</div>
        ) : (
          templates.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group">
              <div className="aspect-video bg-slate-100 relative">
                {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Tag size={40} /></div>
                )}
                {item.isPremium && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 uppercase">
                        <Star size={10} fill="currentColor" /> VIP
                    </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-red-500 transition">{item.title}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{item.category}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                    <div className="text-orange-500 font-black text-sm">{item.priceCoins === 0 ? 'FREE' : `${item.priceCoins} COINS`}</div>
                    <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500 transition">
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <form onSubmit={handleCreate} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                <h3 className="text-2xl font-black mb-6 text-gray-900">New Template</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-400 mb-1">Title</label>
                        <input required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-red-500" value={newTemplate.title} onChange={e => setNewTask({...newTemplate, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-400 mb-1">Price (Coins)</label>
                            <input type="number" required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-red-500" value={newTemplate.priceCoins} onChange={e => setNewTask({...newTemplate, priceCoins: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-400 mb-1">Category</label>
                            <select className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-red-500" value={newTemplate.category} onChange={e => setNewTask({...newTemplate, category: e.target.value})}>
                                <option value="INTRO">INTRO</option>
                                <option value="OUTRO">OUTRO</option>
                                <option value="STATUS">STATUS</option>
                                <option value="POETRY">POETRY</option>
                                <option value="BUSINESS">BUSINESS</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <input type="checkbox" className="w-5 h-5 accent-amber-500" checked={newTemplate.isPremium} onChange={e => setNewTask({...newTemplate, isPremium: e.target.checked})} />
                        <label className="text-sm font-bold text-amber-900">Premium / VIP Only</label>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition">Cancel</button>
                    <button type="submit" className="flex-1 py-3 font-black bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition uppercase tracking-widest">Publish</button>
                </div>
            </form>
        </div>
      )}
    </Layout>
  );
}
