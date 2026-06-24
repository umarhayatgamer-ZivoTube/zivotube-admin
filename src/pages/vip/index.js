import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { ShieldCheck, UserMinus } from 'lucide-react';

export default function VipManagement() {
  const [vips, setVips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVips = async () => {
    setLoading(true);
    const q = query(collection(db, "users"), where("isVip", "==", true));
    const snap = await getDocs(q);
    setVips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchVips();
  }, []);

  const removeVip = async (id) => {
    if (confirm("Revoke VIP status from this user?")) {
        await updateDoc(doc(db, "users", id), { isVip: false });
        fetchVips();
    }
  };

  return (
    <Layout title="VIP & Memberships">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-20 text-gray-400 font-medium">Scanning for VIPs...</div>
        ) : vips.length === 0 ? (
          <div className="col-span-3 text-center py-20 text-gray-400 font-medium">No active VIP members.</div>
        ) : (
          vips.map((vip) => (
            <div key={vip.id} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-amber-100 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden border-4 border-amber-400">
                    {vip.profilePhotoUrl && <img src={vip.profilePhotoUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-1 rounded-full border-2 border-white">
                    <ShieldCheck size={16} />
                </div>
              </div>
              <h4 className="font-bold text-gray-900">@{vip.username}</h4>
              <p className="text-xs text-gray-500 mb-6">{vip.email}</p>

              <div className="w-full grid grid-cols-2 gap-2 mb-6">
                <div className="bg-amber-50 p-2 rounded-xl">
                    <p className="text-[10px] font-bold text-amber-600 uppercase">Tier</p>
                    <p className="font-black text-amber-900">{vip.userLevel}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Joined VIP</p>
                    <p className="font-black text-slate-900">New</p>
                </div>
              </div>

              <button
                onClick={() => removeVip(vip.id)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition"
              >
                <UserMinus size={14} /> Revoke VIP Status
              </button>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
