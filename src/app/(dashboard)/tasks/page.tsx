"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Plus, Trash2, CheckCircle, Clock, Coins, Target, Edit2, X, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", coinsReward: "", taskType: "watch_videos", category: "daily", targetCount: "1" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "tasks"), orderBy("createdAt", "desc")));
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.coinsReward) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "tasks", editingId), {
            title: form.title,
            description: form.description,
            coinsReward: Number(form.coinsReward),
            taskType: form.taskType,
            category: form.category,
            targetCount: Number(form.targetCount),
            updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "tasks"), {
            title: form.title,
            description: form.description,
            coinsReward: Number(form.coinsReward),
            taskType: form.taskType,
            category: form.category,
            targetCount: Number(form.targetCount),
            isActive: true,
            createdAt: serverTimestamp(),
        });
      }
      setForm({ title: "", description: "", coinsReward: "", taskType: "watch_videos", category: "daily", targetCount: "1" });
      setShowForm(false);
      setEditingId(null);
      fetchTasks();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const startEdit = (task: any) => {
      setForm({
          title: task.title,
          description: task.description || "",
          coinsReward: task.coinsReward?.toString() || "",
          taskType: task.taskType || "watch_videos",
          category: task.category || "daily",
          targetCount: task.targetCount?.toString() || "1"
      });
      setEditingId(task.id);
      setShowForm(true);
  };

  const handleCancel = () => {
      setForm({ title: "", description: "", coinsReward: "", taskType: "watch_videos", category: "daily", targetCount: "1" });
      setShowForm(false);
      setEditingId(null);
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
    watch_videos: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    like_videos: "bg-red-500/10 text-red-500 border-red-500/20",
    comment_videos: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    share_videos: "bg-green-500/10 text-green-500 border-green-500/20",
    follow_creator: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    upload_video: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    youtube_subscribe: "bg-red-500/10 text-red-500 border-red-500/20",
    tiktok_follow: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    instagram_follow: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    telegram_join: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    whatsapp_join: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    website_visit: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    app_rating: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Platform <span className="text-[#FF2D2D]">Task Registry</span></h1>
          <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em] mt-1">Configure user engagement missions and objective logic</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="premium-button !px-6 !py-2.5 flex items-center justify-center gap-2 !text-[9px]"
        >
          <Plus size={16} /> New Mission
        </button>
      </div>

      {showForm && (
        <div className="bg-[#121212] rounded-[32px] border border-[#242424] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h3 className="font-black text-white uppercase tracking-tight text-lg">{editingId ? "Update Registry Entry" : "Initialize New Mission"}</h3>
              <p className="text-[8px] font-bold text-[#FF2D2D] uppercase tracking-widest mt-0.5">Parameter Configuration</p>
            </div>
            <button onClick={handleCancel} className="p-2 text-slate-500 hover:text-white bg-[#090909] rounded-xl border border-[#242424] transition-all">
                <X size={18}/>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Mission Identifier</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Watch 10 Videos" className="w-full px-4 py-3 bg-[#090909] border border-[#242424] rounded-xl text-sm font-bold text-white outline-none focus:border-[#FF2D2D] transition-all" />
            </div>
            <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Yield Reward (Coins)</label>
                <input value={form.coinsReward} onChange={e => setForm({...form, coinsReward: e.target.value})} type="number" placeholder="1000" className="w-full px-4 py-3 bg-[#090909] border border-[#242424] rounded-xl text-sm font-bold text-white outline-none focus:border-[#FF2D2D] transition-all" />
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Specify mission details..." className="w-full px-4 py-3 bg-[#090909] border border-[#242424] rounded-xl text-sm font-bold text-white outline-none focus:border-[#FF2D2D] transition-all h-24 resize-none" />
            </div>
            <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Logic Protocol Type</label>
                <select value={form.taskType} onChange={e => setForm({...form, taskType: e.target.value})} className="w-full px-4 py-3 bg-[#090909] border border-[#242424] rounded-xl text-sm font-bold text-white outline-none focus:border-[#FF2D2D] transition-all appearance-none cursor-pointer">
                    <option value="watch_videos">Watch Videos</option>
                    <option value="like_videos">Like Videos</option>
                    <option value="comment_videos">Comment Videos</option>
                    <option value="share_videos">Share Videos</option>
                    <option value="follow_creator">Follow Creator</option>
                    <option value="upload_video">Upload Video</option>
                    <option value="youtube_subscribe">YouTube Subscribe</option>
                    <option value="tiktok_follow">TikTok Follow</option>
                    <option value="instagram_follow">Instagram Follow</option>
                    <option value="telegram_join">Telegram Join</option>
                    <option value="whatsapp_join">WhatsApp Channel Join</option>
                    <option value="website_visit">Website Visit</option>
                    <option value="app_rating">App Rating Prompt</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Cycle Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 bg-[#090909] border border-[#242424] rounded-xl text-sm font-bold text-white outline-none focus:border-[#FF2D2D] transition-all appearance-none cursor-pointer">
                    <option value="daily">Daily Mission</option>
                    <option value="weekly">Weekly Objective</option>
                    <option value="social">Social Connection</option>
                    <option value="onetime">One-time Milestone</option>
                </select>
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Iterations (Count)</label>
                <input value={form.targetCount} onChange={e => setForm({...form, targetCount: e.target.value})} type="number" placeholder="10" className="w-full px-4 py-3 bg-[#090909] border border-[#242424] rounded-xl text-sm font-bold text-white outline-none focus:border-[#FF2D2D] transition-all" />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button onClick={handleAdd} disabled={saving} className="premium-button !px-8 !py-3 flex items-center justify-center gap-2 !text-[10px] min-w-[160px]">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Check size={18}/> {editingId ? "Commit Update" : "Initialize Mission"}</>}
            </button>
            <button onClick={handleCancel} className="px-8 py-3 bg-[#090909] border border-[#242424] text-slate-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-64 bg-[#121212] border border-[#242424] rounded-[32px] animate-pulse" />)
        ) : tasks.length === 0 ? (
          <div className="col-span-full bg-[#121212] rounded-[40px] border-2 border-dashed border-[#242424] py-32 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-[#090909] rounded-3xl flex items-center justify-center mb-6 border border-[#242424]">
                <Target className="text-slate-700" size={40} />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Registry Empty</p>
            <p className="text-slate-600 text-[10px] font-bold uppercase mt-2">Initialize your first mission objective</p>
          </div>
        ) : tasks.map(task => (
          <div key={task.id} className="bg-[#121212] rounded-[32px] border border-[#242424] p-6 group hover:border-[#FF2D2D]/30 transition-all duration-500 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF2D2D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-start justify-between mb-6 relative z-10">
              <span className={cn(
                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                  taskTypeColors[task.taskType] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
              )}>
                {task.taskType.replace('_', ' ')}
              </span>
              <div className="flex gap-2">
                <button onClick={() => startEdit(task)} className="w-8 h-8 flex items-center justify-center bg-[#090909] border border-[#242424] text-slate-500 hover:text-blue-500 hover:border-blue-500/50 rounded-xl transition-all" title="Edit">
                  <Edit2 size={14}/>
                </button>
                <button onClick={() => handleToggle(task.id, task.isActive)} className={cn(
                    "w-8 h-8 flex items-center justify-center border rounded-xl transition-all",
                    task.isActive
                        ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                        : "bg-[#090909] text-slate-600 border-[#242424] hover:text-white"
                )} title={task.isActive ? "Deactivate" : "Activate"}>
                  <CheckCircle size={14}/>
                </button>
                <button onClick={() => handleDelete(task.id)} className="w-8 h-8 flex items-center justify-center bg-[#090909] border border-[#242424] text-slate-500 hover:text-red-500 hover:border-red-500/50 rounded-xl transition-all">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>

            <div className="relative z-10">
                <h3 className="font-black text-white text-lg mb-2 leading-tight group-hover:text-[#FF2D2D] transition-colors">{task.title}</h3>
                <p className="text-[10px] font-bold text-slate-500 mb-6 line-clamp-2 uppercase tracking-wide leading-relaxed">{task.description || "No Registry Description Available"}</p>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-[#242424] relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
                    <Coins size={14} className="text-amber-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-black text-white leading-none">{task.coinsReward?.toLocaleString()}</span>
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Yield</span>
                </div>
              </div>
              <div className="px-3 py-1 bg-[#090909] border border-[#242424] rounded-lg">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{task.targetCount || 1}x Target</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
