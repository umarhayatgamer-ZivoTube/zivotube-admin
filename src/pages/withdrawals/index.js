import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "withdrawals"));
    setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleStatus = async (id, newStatus) => {
    if (confirm(`Change status to ${newStatus}?`)) {
      await updateDoc(doc(db, "withdrawals", id), { status: newStatus });
      fetchWithdrawals();
    }
  };

  return (
    <Layout title="Withdrawal Requests">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Method & Details</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center text-gray-400">Fetching requests...</td></tr>
            ) : (
              withdrawals.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-black text-green-600 text-lg">Rs. {req.amount?.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{req.method}</div>
                    <div className="text-xs font-mono text-gray-500 mt-0.5">{req.accountDetails}</div>
                  </td>
                  <td className="p-4 text-xs text-gray-500">
                    {req.timestamp ? new Date(req.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      req.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                      req.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {req.status === 'Pending' && (
                        <>
                          <button onClick={() => handleStatus(req.id, 'Approved')} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition shadow-sm">Approve</button>
                          <button onClick={() => handleStatus(req.id, 'Rejected')} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition">Reject</button>
                        </>
                      )}
                      {req.status === 'Approved' && (
                        <button onClick={() => handleStatus(req.id, 'Paid')} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition shadow-sm uppercase tracking-widest">Mark as Paid</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!loading && withdrawals.length === 0 && (
              <tr><td colSpan="5" className="p-20 text-center text-gray-400">No payout requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
