"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { Trash2, Eye, ExternalLink, Clock, Star, ShieldCheck, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(query(collection(db, "videos"), orderBy("createdAt", "desc")));
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
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

  if (loading) {
    return (
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-[9/16] bg-[#121212] rounded-[32px] border border-[#242424]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Content <span className="text-[#FF2D2D]">Moderation</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Quality Assurance & Community Safety Node</p>
        </div>

        <div className="bg-[#121212] p-1.5 rounded-2xl border border-[#242424] flex items-center shadow-2xl">
           {['Pending', 'Approved', 'All'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                 filter === f ? "bg-[#FF2D2D] text-white shadow-lg shadow-red-900/40" : "text-slate-500 hover:text-slate-300"
               )}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {filtered.length === 0 ? (
          <div className="col-span-full py-40 text-center border-2 border-dashed border-[#242424] rounded-[40px]">
             <div className="w-16 h-16 bg-[#121212] rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-700 border border-[#242424]">
                <PlayCircle size={32} />
             </div>
             <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Clearance Signal: No content awaiting review</p>
          </div>
        ) : (
          filtered.map((video) => (
            <div key={video.id} className="group bg-[#121212] rounded-[32px] overflow-hidden border border-[#242424] hover:border-[#FF2D2D]/30 shadow-2xl transition-all duration-500 flex flex-col">
              <div className="aspect-[9/16] bg-black relative overflow-hidden">
                {video.thumbnailUrl && (
                  <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a href={video.videoUrl} target="_blank" rel="noreferrer" className="p-4 bg-white rounded-full text-black hover:scale-110 transition-transform shadow-xl">
                        <ExternalLink size={24} />
                    </a>
                </div>

                <div className="absolute top-5 left-5">
                   <span className={cn(
                     "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg",
                     video.isApproved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                   )}>
                    {video.isApproved ? 'Node: Live' : 'Node: Review'}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[#FF2D2D]" />
                        <h4 className="font-black text-white text-sm tracking-tight truncate">@{video.creatorUsername || 'User'}</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{video.caption}</p>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {!video.isApproved ? (
                    <button
                      onClick={() => handleApprove(video.id)}
                      className="flex-1 bg-white text-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF2D2D] hover:text-white transition-all shadow-lg"
                    >
                      Authorize
                    </button>
                  ) : (
                    <div className="flex-1 bg-emerald-500/10 text-emerald-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-emerald-500/20">
                        Operational
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-3 bg-[#090909] text-slate-600 rounded-2xl border border-[#242424] hover:text-[#FF2D2D] hover:border-[#FF2D2D]/50 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
