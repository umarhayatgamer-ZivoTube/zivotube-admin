"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { Users, Video, Wallet, Coins, TrendingUp, ShieldAlert, ArrowUpRight, ArrowDownRight, Clock, Database, Zap, RefreshCw } from "lucide-react";
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
  const [initializing, setInitializing] = useState(false);

  const fetchStats = async () => {
    try {
        const usersSnap = await getDocs(collection(db, "users"));
        const totalUsers = usersSnap.size;
        let coinsEconomy = 0;
        usersSnap.forEach(doc => {
            const data = doc.data();
            coinsEconomy += (data.totalCoins || 0);
        });

        const videosSnap = await getDocs(collection(db, "videos"));
        const totalVideos = videosSnap.size;

        const pendingVideosSnap = await getDocs(query(collection(db, "videos"), where("isApproved", "==", false)));

        const withdrawalsSnap = await getDocs(query(collection(db, "withdrawals"), where("status", "==", "Pending")));
        const pendingWithdrawals = withdrawalsSnap.size;

        setStats({
            totalUsers,
            activeUsers: Math.max(0, totalUsers - 2),
            totalVideos,
            pendingVideos: pendingVideosSnap.size,
            pendingWithdrawals,
            coinsEconomy
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const seedSampleData = async () => {
    if (!confirm("DEPLOYMENT WARNING: This will synchronize 80+ demo nodes (50 Videos, 10 Creators, 20 Templates) across the Mainnet. Continue?")) return;
    setInitializing(true);
    try {
        // 1. Seed 10 Premium Creators
        const creatorIds = [];
        const creatorNames = ["lodhi_elite", "umar_pro", "techno_guru", "islamic_pulse", "funny_vibes", "mindset_alpha", "gamer_zero", "edu_sync", "life_style_hub", "biz_insider"];

        for (let i = 0; i < creatorNames.length; i++) {
            const docRef = await addDoc(collection(db, "users"), {
                username: creatorNames[i],
                email: `${creatorNames[i]}@zivotube.network`,
                creatorLevel: (i % 5) + 1,
                isCreator: true,
                isVerified: true,
                followersCount: Math.floor(Math.random() * 50000),
                totalViews: Math.floor(Math.random() * 1000000),
                profilePhotoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${creatorNames[i]}`,
                totalCoins: 25000,
                status: "Active",
                createdAt: serverTimestamp(),
                role: "user"
            });
            creatorIds.push({ id: docRef.id, name: creatorNames[i] });
        }

        // 2. Seed 50+ Demo Videos
        const videoCategories = ["Trending", "Motivation", "Islamic", "Funny", "Tech", "Education", "Lifestyle", "Gaming", "Poetry", "Business"];
        const thumbUrls = [
            "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
            "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800",
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"
        ];

        for (let i = 1; i <= 50; i++) {
            const cat = videoCategories[i % videoCategories.length];
            await addDoc(collection(db, "videos"), {
                caption: `[${cat}] Next-gen node synchronization #${i}. #ZivoTube #Innovation`,
                category: cat,
                creatorId: creatorIds[i % 10].id,
                creatorUsername: creatorIds[i % 10].name,
                videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                thumbnailUrl: thumbUrls[i % thumbUrls.length],
                viewsCount: Math.floor(Math.random() * 10000),
                likesCount: Math.floor(Math.random() * 2000),
                commentsCount: Math.floor(Math.random() * 100),
                isApproved: true,
                isFeatured: i % 10 === 0,
                isDemo: true,
                isPublic: true,
                status: "approved",
                createdAt: serverTimestamp()
            });
        }

        // 3. Seed 20 Templates
        const templateCats = ["Intro", "Status", "Poetry", "Business", "Birthday", "Gaming"];
        for (let i = 1; i <= 20; i++) {
            const cat = templateCats[i % templateCats.length];
            await addDoc(collection(db, "templates"), {
                name: `${cat} Master Pack v${i}`,
                category: cat,
                creatorId: creatorIds[i % 10].id,
                creatorName: creatorIds[i % 10].name,
                price: 500 * (i % 5 + 1),
                status: "Approved",
                downloads: Math.floor(Math.random() * 500),
                rating: 4.5,
                createdAt: serverTimestamp()
            });
        }

        alert("Mainnet Fully Populated: 80+ Nodes Online.");
        fetchStats();
    } catch(e) {
        console.error(e);
        alert("Sync Failure: " + e);
    }
    setInitializing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Command <span className="text-[#FF2D2D]">Center</span></h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Platform Infrastructure • Real-time Monitoring</p>
        </div>
        <button
            onClick={seedSampleData}
            disabled={initializing}
            className="flex items-center gap-3 bg-[#1A1A1A] border border-[#242424] hover:border-[#FF2D2D]/50 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {initializing ? <RefreshCw className="animate-spin" size={16}/> : <Zap className="text-[#FF2D2D]" size={16} />}
          {initializing ? "Provisioning..." : "Seed Demo Data"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Active Pulse" value={stats.activeUsers.toLocaleString()} icon={Users} color="bg-emerald-500" />
        <StatCard title="Total Registry" value={stats.totalUsers.toLocaleString()} icon={Users} color="bg-blue-500" />
        <StatCard title="Content Nodes" value={stats.totalVideos.toLocaleString()} icon={Video} color="bg-violet-500" />
        <StatCard title="Review Queue" value={stats.pendingVideos.toString()} icon={Clock} color="bg-amber-500" />
        <StatCard title="System Yield" value={`Rs.${stats.coinsEconomy.toLocaleString()}`} icon={TrendingUp} color="bg-[#FF2D2D]" />
        <StatCard title="Liquid Assets" value={stats.coinsEconomy.toLocaleString()} icon={Wallet} color="bg-orange-500" />
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

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="admin-card group hover:border-[#FF2D2D]/50 transition-all !p-5 relative overflow-hidden">
      <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 blur-3xl", color)} />
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(color, "p-2.5 rounded-[12px] text-white shadow-lg shadow-black/20")}>
            <Icon size={18} />
          </div>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1.5">{title}</p>
          <p className="text-2xl font-black text-white tracking-tight">{value}</p>
        </div>
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
