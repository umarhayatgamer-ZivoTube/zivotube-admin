import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    activeUsers: 0,
    dormantUsers: 0,
    videos: 0,
    pendingVideos: 0,
    withdrawals: 0,
    coins: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const videosSnap = await getDocs(collection(db, "videos"));
      const pendingVideosSnap = await getDocs(query(collection(db, "videos"), where("isApproved", "==", false)));
      const withdrawSnap = await getDocs(query(collection(db, "withdrawals"), where("status", "==", "Pending")));

      let totalCoins = 0;
      let dormant = 0;
      let active = 0;

      usersSnap.forEach(doc => {
        const data = doc.data();
        totalCoins += (data.totalCoins || 0);
        if (data.status === 'Dormant') dormant++;
        else active++;
      });

      setStats({
        users: usersSnap.size,
        activeUsers: active,
        dormantUsers: dormant,
        videos: videosSnap.size,
        pendingVideos: pendingVideosSnap.size,
        withdrawals: withdrawSnap.size,
        coins: totalCoins,
        revenue: 0 // Placeholder
      });
    };

    fetchStats();
  }, []);

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card title="Total Users" value={stats.users.toLocaleString()} icon="users" color="bg-blue-500" />
        <Card title="Active Users" value={stats.activeUsers.toLocaleString()} icon="users" color="bg-green-500" />
        <Card title="Dormant Users" value={stats.dormantUsers.toLocaleString()} icon="users" color="bg-gray-500" />
        <Card title="Total Videos" value={stats.videos.toLocaleString()} icon="video" color="bg-purple-500" />
        <Card title="Pending Videos" value={stats.pendingVideos.toLocaleString()} icon="video" color="bg-yellow-500" />
        <Card title="Pending Payouts" value={stats.withdrawals.toLocaleString()} icon="wallet" color="bg-red-500" />
        <Card title="Coins Economy" value={stats.coins.toLocaleString()} icon="coins" color="bg-orange-500" />
        <Card title="Platform Revenue" value={`$${stats.revenue}`} icon="revenue" color="bg-emerald-500" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-6">User Activity Growth</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Mon', users: 400 },
              { name: 'Tue', users: 300 },
              { name: 'Wed', users: 200 },
              { name: 'Thu', users: 278 },
              { name: 'Fri', users: 189 },
              { name: 'Sat', users: 239 },
              { name: 'Sun', users: 349 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
