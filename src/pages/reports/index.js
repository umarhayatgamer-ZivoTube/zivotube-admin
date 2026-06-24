import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { db } from '../../firebase';
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { AlertTriangle, Trash2, UserX, ExternalLink } from 'lucide-react';

export default function ReportsCenter() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDismiss = async (id) => {
    await deleteDoc(doc(db, "reports", id));
    fetchReports();
  };

  return (
    <Layout title="Reports Center">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Reason</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Target</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Reporter</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-medium">Scanning for violations...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-medium">No active reports. Community is clean!</td></tr>
            ) : (
              reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-red-50/30 transition">
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        rep.type === 'VIDEO' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                        {rep.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle size={14} />
                        <span className="font-bold text-sm">{rep.reason}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{rep.details || 'No additional details.'}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer">
                        <span className="text-xs font-mono">{rep.targetId}</span>
                        <ExternalLink size={12} />
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-500 font-medium">@{rep.reporterId}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 transition" title="Delete Content"><Trash2 size={18} /></button>
                      <button className="p-2 text-gray-400 hover:text-red-900 transition" title="Ban User"><UserX size={18} /></button>
                      <button
                        onClick={() => handleDismiss(rep.id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white transition"
                      >
                        Dismiss
                      </button>
                    </div>
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
