import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { Star, CheckCircle2, XCircle } from 'lucide-react';

export default function CreatorManagement() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCreators = async () => {
    setLoading(true);
    // Find users who have at least Level 1 or are verified
    const q = query(collection(db, "users"), where("creatorLevel", ">=", 1));
    const snap = await getDocs(q);
    setCreators(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const toggleMonetization = async (id, current) => {
    await updateDoc(doc(db, "users", id), { isMonetized: !current });
    fetchCreators();
  };

  const toggleVerification = async (id, current) => {
    await updateDoc(doc(db, "users", id), { isVerified: !current });
    fetchCreators();
  };

  return (
    <Layout title="Creator Center">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Creator</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Level</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Monetized</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Verified</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-medium">Fetching top talent...</td></tr>
            ) : creators.length === 0 ? (
              <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-medium">No creators found above Level 1 yet.</td></tr>
            ) : (
              creators.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                            {c.profilePhotoUrl && <img src={c.profilePhotoUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">@{c.username}</div>
                            <div className="text-xs text-gray-400">{c.followers} Followers • {c.validViews} Views</div>
                        </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black">Lvl {c.creatorLevel}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => toggleMonetization(c.id, c.isMonetized)}>
                        {c.isMonetized ? <CheckCircle2 className="text-green-500 mx-auto" /> : <XCircle className="text-gray-300 mx-auto" />}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => toggleVerification(c.id, c.isVerified)}>
                        {c.isVerified ? <Star className="text-amber-400 fill-amber-400 mx-auto" /> : <Star className="text-gray-300 mx-auto" />}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-xs font-bold text-blue-600 hover:underline">View Analytics</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
