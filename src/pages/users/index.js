import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Banned' ? 'Active' : 'Banned';
    if (confirm(`Are you sure you want to ${newStatus === 'Banned' ? 'BAN' : 'UNBAN'} this user?`)) {
      await updateDoc(doc(db, "users", id), { status: newStatus });
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="User Management">
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search by username or email..."
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredUsers.length} users
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Coins</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Earnings</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Level</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="6" className="p-20 text-center text-gray-400">Loading your community...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="6" className="p-20 text-center text-gray-400">No users found.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 overflow-hidden flex-shrink-0">
                        {user.profilePhotoUrl ? (
                          <img src={user.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-red-500 font-bold">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">@{user.username || 'user'}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-orange-500">{user.totalCoins?.toLocaleString() || 0}</td>
                  <td className="p-4 font-mono font-bold text-green-600">Rs. {user.totalEarnings?.toLocaleString() || 0}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold">
                      {user.userLevel || 'Bronze'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      user.status === 'Banned' ? 'bg-red-100 text-red-600' :
                      user.status === 'Dormant' ? 'bg-gray-100 text-gray-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleStatus(user.id, user.status || 'Active')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        user.status === 'Banned' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      {user.status === 'Banned' ? 'Unban' : 'Ban User'}
                    </button>
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
