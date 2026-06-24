"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { Users, Video, Wallet, Coins, TrendingUp, ShieldAlert, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line
} from 'recharts';
import { cn, formatCurrency } from "@/lib/utils";

const chartData = [
  { name: 'Mon', users: 400, videos: 240 },
  { name: 'Tue', users: 300, videos: 139 },
  { name: 'Wed', users: 200, videos: 980 },
  { name: 'Thu', users: 278, videos: 390 },
  { name: 'Fri', users: 189, videos: 480 },
  { name: 'Sat', users: 239, videos: 380 },
  { name: 'Sun', users: 349, videos: 430 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalVideos: 0,
    pendingVideos: 0,
    pendingWithdrawals: 0,
    coinsEconomy: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
        try {
            // Count users and calculate economy
            const usersSnap = await getDocs(collection(db, "users"));
            const totalUsers = usersSnap.size;
            let coinsEconomy = 0;
            usersSnap.forEach(doc => {
                const data = doc.data();
                coinsEconomy += (data.totalCoins || 0);
            });

            // Count videos
            const videosSnap = await getDocs(collection(db, "videos"));
            const totalVideos = videosSnap.size;

            // Count pending withdrawals
            const withdrawalsSnap = await getDocs(query(collection(db, "withdrawals"), where("status", "==", "Pending")));
            const pendingWithdrawals = withdrawalsSnap.size;

            setStats({
                totalUsers,
                activeUsers: Math.floor(totalUsers * 0.8), // Placeholder for active users
                totalVideos,
                pendingVideos: 0, 
                pendingWithdrawals,
                coinsEconomy
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 text-sm font-medium">Real-time platform health and economic metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Community" value={stats.totalUsers.toLocaleString()} icon={Users} color="bg-blue-600" trend="+12%" isPositive={true} />
        <StatCard title="Live Content" value={stats.totalVideos.toLocaleString()} icon={Video} color="bg-purple-600" trend="+5%" isPositive={true} />
        <StatCard title="Payout Queue" value={stats.pendingWithdrawals.toString()} icon={Wallet} color="bg-red-600" trend="-2" isPositive={false} />
        <StatCard title="Economy (Coins)" value={stats.coinsEconomy.toLocaleString()} icon={Coins} color="bg-amber-500" trend="+240k" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 admin-card h-[450px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Growth Analytics</h3>
                    <p className="text-xs font-medium text-slate-400">User vs Video activity this week</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-2 outline-none">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <Tooltip
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        />
                        <Area type="monotone" dataKey="users" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                        <Area type="monotone" dataKey="videos" stroke="#8b5cf6" strokeWidth={3} fillOpacity={0} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="admin-card h-[450px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Alerts</h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                <AlertItem type="report" title="Video Reported" desc="Inappropriate content in #VID-902" time="2m ago" />
                <AlertItem type="withdrawal" title="Big Payout" desc="User @umar requested 5,000 PKR" time="15m ago" />
                <AlertItem type="creator" title="New Creator" desc="@lodhi reached Level 2" time="1h ago" />
                <AlertItem type="system" title="Server Load" desc="DB spike detected in 'videos' collection" time="3h ago" />
                <AlertItem type="report" title="User Reported" desc="Spam behavior detected by @bot123" time="5h ago" />
            </div>
            <button className="w-full mt-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition">View All Activity</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend, isPositive }: any) {
  return (
    <div className="admin-card group hover:border-red-200 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(color, "p-3 rounded-xl text-white shadow-lg")}>
          <Icon size={24} />
        </div>
        <div className={cn(
            "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
            isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function AlertItem({ type, title, desc, time }: any) {
    const getIconColor = () => {
        if (type === 'report') return 'bg-orange-100 text-orange-600';
        if (type === 'withdrawal') return 'bg-green-100 text-green-600';
        if (type === 'creator') return 'bg-purple-100 text-purple-600';
        return 'bg-blue-100 text-blue-600';
    };

    return (
        <div className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
            <div className={cn("w-2 h-2 mt-2 rounded-full", getIconColor().split(' ')[1].replace('text', 'bg'))}></div>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <span className="text-[10px] font-medium text-slate-400">{time}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{desc}</p>
            </div>
        </div>
    );
}
