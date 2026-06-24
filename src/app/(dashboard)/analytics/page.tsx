"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { TrendingUp, Users, Video, Coins, ArrowUpRight, Eye, Heart, Share2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

const weeklyData = [
  { day: "Mon", users: 0, videos: 0, coins: 0 },
  { day: "Tue", users: 0, videos: 0, coins: 0 },
  { day: "Wed", users: 0, videos: 0, coins: 0 },
  { day: "Thu", users: 0, videos: 0, coins: 0 },
  { day: "Fri", users: 0, videos: 0, coins: 0 },
  { day: "Sat", users: 0, videos: 0, coins: 0 },
  { day: "Sun", users: 0, videos: 0, coins: 0 },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ users: 0, videos: 0, coins: 0, withdrawals: 0 });
  const [loading, setLoading] = useState(true);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const videosSnap = await getDocs(collection(db, "videos"));
        const wSnap = await getDocs(collection(db, "withdrawals"));
        let coins = 0;
        let statusMap: Record<string, number> = { Active: 0, Banned: 0, Dormant: 0 };
        usersSnap.forEach(d => {
          const data = d.data();
          coins += (data.totalCoins || 0);
          const s = data.status || "Active";
          statusMap[s] = (statusMap[s] || 0) + 1;
        });
        setStats({ users: usersSnap.size, videos: videosSnap.size, coins, withdrawals: wSnap.size });
        setPieData(Object.entries(statusMap).map(([name, value]) => ({ name, value })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const metricCards = [
    { title: "Total Users", value: stats.users.toLocaleString(), icon: Users, color: "bg-blue-600", sub: "Registered accounts" },
    { title: "Total Videos", value: stats.videos.toLocaleString(), icon: Video, color: "bg-purple-600", sub: "Uploaded content" },
    { title: "Total Coins", value: stats.coins.toLocaleString(), icon: Coins, color: "bg-amber-500", sub: "Economy circulation" },
    { title: "Total Withdrawals", value: stats.withdrawals.toLocaleString(), icon: TrendingUp, color: "bg-green-600", sub: "Payout requests" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics Hub</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Platform performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card) => (
          <div key={card.title} className="admin-card group hover:border-red-200 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.color} p-3 rounded-xl text-white shadow-lg`}>
                <card.icon size={22} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-green-50 text-green-600 uppercase tracking-wider">
                <ArrowUpRight size={12} /> Live
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
            <p className="text-2xl font-black text-slate-900">{loading ? "..." : card.value}</p>
            <p className="text-[10px] text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 admin-card h-[380px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Weekly Growth</h3>
          <p className="text-xs text-slate-400 mb-6">User & video activity trends</p>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gVideos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: "#94a3b8"}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: "#94a3b8"}} />
                <Tooltip contentStyle={{borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"}} />
                <Area type="monotone" dataKey="users" stroke="#ef4444" strokeWidth={3} fill="url(#gUsers)" name="Users" />
                <Area type="monotone" dataKey="videos" stroke="#8b5cf6" strokeWidth={3} fill="url(#gVideos)" name="Videos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card h-[380px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-1">User Status</h3>
          <p className="text-xs text-slate-400 mb-6">Account health breakdown</p>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
