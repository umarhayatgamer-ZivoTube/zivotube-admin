"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { Trash2, Eye, ExternalLink, Clock, Star } from "lucide-react";
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

  if (loading) {
    return (
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[9/16] bg-slate-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Content Moderation</h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Review uploads</p>
        </div>
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center shadow-sm">
           {['Pending', 'Approved', 'All'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                 filter === f ? "bg-red-500 text-white shadow-md" : "text-slate-400"
               )}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-32 text-center">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No videos found</p>
          </div>
        ) : (
          filtered.map((video) => (
            <div key={video.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm flex flex-col">
              <div className="aspect-[9/16] bg-slate-950 relative">
                {video.thumbnailUrl && (
                  <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a href={video.videoUrl} target="_blank" rel="noreferrer" className="p-3 bg-white rounded-full text-black">
                        <ExternalLink size={20} />
                    </a>
                </div>

                <div className="absolute top-4 left-4">
                   <span className={cn(
                     "px-2 py-1 rounded text-[10px] font-bold uppercase",
                     video.isApproved ? "bg-green-500 text-white" : "bg-yellow-400 text-black"
                   )}>
                    {video.isApproved ? 'Live' : 'New'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">@{video.creatorUsername || 'User'}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{video.caption}</p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {!video.isApproved ? (
                    <button
                      onClick={() => handleApprove(video.id)}
                      className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-[10px] font-bold uppercase"
                    >
                      Approve
                    </button>
                  ) : (
                    <div className="flex-1 bg-green-50 text-green-600 py-2 rounded-xl text-[10px] font-bold uppercase text-center">
                        Approved
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:text-red-500"
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
