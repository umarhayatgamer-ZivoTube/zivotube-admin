"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Plus, Trash2, CheckCircle, Clock, Coins, Target, Edit2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", coinsReward: "", taskType: "watch", targetCount: "1" });
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "tasks"));
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.coinsReward) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "tasks"), {
        title: form.title,
        description: form.description,
        coinsReward: Number(form.coinsReward),
        taskType: form.taskType,
        targetCount: Number(form.targetCount),
        isActive: true,
        createdAt: serverTimestamp(),
      });
      setForm({ title: "", description: "", coinsReward: "", taskType: "watch", targetCount: "1" });
      setShowForm(false);
      fetchTasks();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this task?")) {
      await deleteDoc(doc(db, "tasks", id));
      fetchTasks();
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "tasks", id), { isActive: !current });
    fetchTasks();
  };

  const taskTypeColors: Record<string, string> = {
    watch: "bg-blue-100 text-blue-700",
    upload: "bg-purple-100 text-purple-700",
    referral: "bg-green-100 text-green-700",
    daily: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Task Manager</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Create and manage user engagement tasks</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
        >
          <Plus size={18} /> Add Task
        </button>
      </div>

      {showForm && (
        <div className="admin-card border-2 border-red-200 bg-red-50/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-900">New Task</h3>
            <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title *" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
            <input value={form.coinsReward} onChange={e => setForm({...form, coinsReward: e.target.value})} type="number" placeholder="Coins reward *" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white md:col-span-2" />
            <select value={form.taskType} onChange={e => setForm({...form, taskType: e.target.value})} className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white">
              <option value="watch">Watch Videos</option>
              <option value="upload">Upload Videos</option>
              <option value="referral">Referral</option>
              <option value="daily">Daily Login</option>
            </select>
            <input value={form.targetCount} onChange={e => setForm({...form, targetCount: e.target.value})} type="number" placeholder="Target count" className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={saving} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-red-600 transition-all disabled:opacity-50">
              <Check size={16}/> {saving ? "Saving..." : "Create Task"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl text-sm font-black text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse" />)
        ) : tasks.length === 0 ? (
          <div className="col-span-3 admin-card border-dashed border-2 py-20 flex flex-col items-center">
            <Target className="text-slate-300 mb-4" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No tasks created yet</p>
          </div>
        ) : tasks.map(task => (
          <div key={task.id} className="admin-card group hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between mb-4">
              <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider", taskTypeColors[task.taskType] || "bg-slate-100 text-slate-600")}>
                {task.taskType}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleToggle(task.id, task.isActive)} className={cn("p-1.5 rounded-lg transition-all", task.isActive ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-slate-400 bg-slate-50 hover:bg-slate-100")} title={task.isActive ? "Deactivate" : "Activate"}>
                  <CheckCircle size={14}/>
                </button>
                <button onClick={() => handleDelete(task.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
            <h3 className="font-black text-slate-900 mb-1 leading-tight">{task.title}</h3>
            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.description || "No description"}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Coins size={14} className="text-amber-500" />
                <span className="text-sm font-black text-slate-800">{task.coinsReward?.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 uppercase">coins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target size={12} className="text-slate-400"/>
                <span className="text-xs text-slate-500">{task.targetCount || 1}x target</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
