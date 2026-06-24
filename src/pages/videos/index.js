import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function VideoManagement() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "videos"));
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleApprove = async (id) => {
    if (confirm("Approve this video for public feed?")) {
      await updateDoc(doc(db, "videos", id), { isApproved: true });
      fetchVideos();
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to permanently DELETE this video?")) {
      await deleteDoc(doc(db, "videos", id));
      fetchVideos();
    }
  };

  const filteredVideos = videos.filter(v => {
    if (filter === 'Pending') return v.isApproved === false;
    if (filter === 'Approved') return v.isApproved === true;
    return true;
  });

  return (
    <Layout title="Video Management">
      <div className="mb-8 flex items-center gap-4">
        {['All', 'Pending', 'Approved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              filter === f ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f} Videos ({videos.filter(v => f === 'All' ? true : f === 'Pending' ? !v.isApproved : v.isApproved).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-20 text-gray-400">Loading gallery...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 group transition hover:shadow-md">
              <div className="aspect-[9/16] bg-slate-900 relative">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold uppercase tracking-widest text-xs">No Preview</div>
                )}
                <div className="absolute top-3 left-3">
                   <span className={`text-[10px] px-2.5 py-1 rounded-lg uppercase font-black tracking-wider ${video.isApproved ? 'bg-green-500 text-white' : 'bg-yellow-400 text-slate-900'}`}>
                    {video.isApproved ? 'Live' : 'Pending'}
                  </span>
                </div>
                {video.isPromoted && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">Promoted</div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 line-clamp-1 group-hover:text-red-500 transition">{video.caption || 'No Caption'}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200"></div>
                  <span className="text-xs font-medium text-gray-500 italic">@{video.creatorUsername}</span>
                </div>

                <div className="mt-5 flex gap-2">
                  {!video.isApproved && (
                    <button
                      onClick={() => handleApprove(video.id)}
                      className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition shadow-sm"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && filteredVideos.length === 0 && <div className="text-center py-20 text-gray-400 font-medium">No videos match your filter.</div>}
    </Layout>
  );
}
