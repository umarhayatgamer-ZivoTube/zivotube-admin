"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { TrendingUp, Users, Video, Coins, ArrowUpRight, Eye, Heart, Share2, Activity, Zap } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#FF2D2D", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

const weeklyData = [
  { day: "Mon", users: 120, videos: 45, coins: 5000 },
  { day: "Tue", users: 210, videos: 89, coins: 12000 },
  { day: "Wed", users: 180, videos: 67, coins: 9000 },
  { day: "Thu", users: 450, videos: 230, coins: 45000 },
  { day: "Fri", users: 380, videos: 190, coins: 31000 },
  { day: "Sat", users: 590, videos: 410, coins: 68000 },
  { day: "Sun", users: 720, videos: 560, coins: 89000 },
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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Market <span className="text-[#FF2D2D]">Intelligence</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Platform Velocity & Economic Trajectory</p>
        </div>
        <div className="flex items-center gap-3 bg-[#121212] px-6 py-3 rounded-2xl border border-[#242424]">
            <Activity className="text-[#FF2D2D] animate-pulse" size={18} />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Feed Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Node Registry" value={stats.users} icon={Users} color="bg-blue-500" sub="Total verified accounts" />
        <MetricCard title="Content Volume" value={stats.videos} icon={Video} color="bg-violet-500" sub="Uploaded media units" />
        <MetricCard title="Treasury Liquidity" value={stats.coins} icon={Coins} color="bg-amber-500" sub="System-wide circulation" isCurrency />
        <MetricCard title="Settlement Log" value={stats.withdrawals} icon={TrendingUp} color="bg-[#FF2D2D]" sub="Finalized payout reqs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 admin-card h-[450px] flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={120} />
          </div>
          <div className="mb-10">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Growth Trajectory</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">7-Day velocity of users vs content</p>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF2D2D" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FF2D2D" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gVideos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: "#475569", fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: "#475569", fontWeight: 700}} />
                <Tooltip
                    contentStyle={{backgroundColor: "#121212", borderRadius: "16px", border: "1px solid #242424", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"}}
                    itemStyle={{fontSize: "10px", fontWeight: 900, textTransform: "uppercase"}}
                />
                <Area type="monotone" dataKey="users" stroke="#FF2D2D" strokeWidth={4} fill="url(#gUsers)" name="Pulse" />
                <Area type="monotone" dataKey="videos" stroke="#8b5cf6" strokeWidth={4} fill="url(#gVideos)" name="Nodes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card h-[450px] flex flex-col relative overflow-hidden group">
          <div className="mb-10">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Node Integrity</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Status breakdown across mainnet</p>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={70} outerRadius={110} paddingAngle={8} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={4} />
                  ))}
                </Pie>
                <Tooltip
                    contentStyle={{backgroundColor: "#121212", borderRadius: "16px", border: "1px solid #242424"}}
                    itemStyle={{fontSize: "10px", fontWeight: 900, color: "white"}}
                />
                <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    formatter={(v) => <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-[#090909] rounded-2xl border border-[#242424] flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Zap size={14} className="text-[#FF2D2D]" />
                <span className="text-[9px] font-black text-white uppercase">Health Factor</span>
             </div>
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, sub, isCurrency = false }: any) {
    return (
        <div className="admin-card group hover:border-[#FF2D2D]/30 transition-all relative overflow-hidden">
            <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 blur-3xl transition-all group-hover:opacity-20", color)} />
            <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className={cn(color, "p-3 rounded-2xl text-white shadow-xl shadow-black/20")}>
                        <Icon size={20} />
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-500/20">
                        Active
                    </div>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{title}</p>
                    <p className="text-3xl font-black text-white tracking-tighter">
                        {isCurrency ? "Rs." : ""}{value.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-1">{sub}</p>
                </div>
            </div>
        </div>
    );
}
