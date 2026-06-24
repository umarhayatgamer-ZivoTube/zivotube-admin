"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { CheckCircle, XCircle, Trash2, Eye, ExternalLink, Play, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(query(collection(db, "videos"), orderBy("createdAt", "desc")));
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "videos", id), { isApproved: true });
      fetchVideos();
    } catch (error) {
      console.error("Error approving video:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this video permanently?")) {
      try {
        await deleteDoc(doc(db, "videos", id));
        fetchVideos();
      } catch (error) {
        console.error("Error deleting video:", error);
      }
    }
  };

  const filtered = videos.filter(v => {
    if (filter === 'Pending') return v.isApproved === false;
    if (filter === 'Approved') return v.isApproved === true;
    return true;
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Content Moderation</h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Review and approve community uploads</p>
        </div>
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center shadow-sm">
           {['Pending', 'Approved', 'All'].map((f) => {
             const count = videos.filter(v => f === 'All' ? true : f === 'Pending' ? !v.isApproved : v.isApproved).length;
             return (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={cn(
                   "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                   filter === f ? "bg-red-500 text-white shadow-md shadow-red-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                 )}
               >
                 {f} ({count})
               </button>
             );
           })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[9/16] bg-slate-100 rounded-3xl animate-pulse"></div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-32 text-center">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-slate-300" size={32} />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No pending videos to review</p>
          </div>
        ) : (
          filtered.map((video) => {
            return (
              <div key={video.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="aspect-[9/16] bg-slate-950 relative overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-800 font-black italic tracking-tighter uppercase text-lg">No Preview</div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                          <button className="flex-1 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                              <Eye size={14} /> Preview
                          </button>
                          <a href={video.videoUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors">
                              <ExternalLink size={14} />
                          </a>
                      </div>
                  </div>

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                     <span className={cn(
                       "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg",
                       video.isApproved ? "bg-green-500 text-white" : "bg-yellow-400 text-slate-900"
                     )}>
                      {video.isApproved ? 'Live' : 'New'}
                    </span>
                    {video.isPromoted && (
                      <span className="bg-red-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                          <Star size={10} fill="currentColor" /> Promoted
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1 mb-1">{video.caption || 'No Caption'}</h4>
                      <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                          <span className="text-[11px] font-bold text-slate-400 italic">@{video.creatorUsername}</span>
                      </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    {!video.isApproved ? (
                      <button
                        onClick={() => handleApprove(video.id)}
                        className="flex-[2] bg-slate-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-md shadow-slate-200"
                      >
                        Verify Content
                      </button>
                    ) : (
                      <div className="flex-[2] bg-green-50 text-green-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                          Approved ✓
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="flex-1 bg-slate-50 text-slate-400 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
