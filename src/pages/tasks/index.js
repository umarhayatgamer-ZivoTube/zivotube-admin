import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2 } from 'lucide-react';

export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    rewardCoins: 50,
    type: 'DAILY',
    targetCount: 1
  });

  const fetchTasks = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "tasks"));
    setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "tasks"), {
        ...newTask,
        id: Math.random().toString(36).substring(7)
    });
    setShowModal(false);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this task?")) {
        await deleteDoc(doc(db, "tasks", id));
        fetchTasks();
    }
  };

  return (
    <Layout title="Task Management">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-gray-500 font-medium">Manage daily and weekly challenges</h3>
        <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 transition shadow-md"
        >
          <Plus size={18} />
          Create Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-20 text-gray-400">Syncing tasks...</div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${task.type === 'DAILY' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {task.type}
                    </span>
                    <button onClick={() => handleDelete(task.id)} className="text-gray-300 hover:text-red-500 transition">
                        <Trash2 size={18} />
                    </button>
                </div>
                <h4 className="font-bold text-lg text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-500 mt-2">{task.description}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reward</div>
                <div className="text-orange-500 font-black text-xl">{task.rewardCoins} <span className="text-xs">COINS</span></div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <form onSubmit={handleCreate} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                <h3 className="text-2xl font-black mb-6">New Task</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-400 mb-1">Title</label>
                        <input required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-red-500" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-400 mb-1">Description</label>
                        <textarea required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-red-500" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-400 mb-1">Reward (Coins)</label>
                            <input type="number" required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-red-500" value={newTask.rewardCoins} onChange={e => setNewTask({...newTask, rewardCoins: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-400 mb-1">Type</label>
                            <select className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-red-500" value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                                <option value="DAILY">DAILY</option>
                                <option value="WEEKLY">WEEKLY</option>
                                <option value="SPECIAL">SPECIAL</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition">Cancel</button>
                    <button type="submit" className="flex-1 py-3 font-black bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition uppercase tracking-widest">Create Task</button>
                </div>
            </form>
        </div>
      )}
    </Layout>
  );
}
