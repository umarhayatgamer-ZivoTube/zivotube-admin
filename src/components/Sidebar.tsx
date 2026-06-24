"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Video, Wallet, CheckSquare,
  Settings, UserPlus, Star, Layout as LayoutIcon,
  Store, Megaphone, ShieldAlert, LifeBuoy, Bell,
  MessageSquare, Gift, BarChart3, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { group: "General", items: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ]},
  { group: "Content", items: [
    { name: "Videos", href: "/videos", icon: Video },
    { name: "Templates", href: "/marketplace", icon: LayoutIcon },
    { name: "Store", href: "/store", icon: Store },
  ]},
  { group: "Users", items: [
    { name: "User Management", href: "/users", icon: Users },
    { name: "Creator Center", href: "/creators", icon: Star },
    { name: "Referrals", href: "/referrals", icon: UserPlus },
    { name: "VIP System", href: "/vip", icon: ShieldAlert },
  ]},
  { group: "Financial", items: [
    { name: "Withdrawals", href: "/withdrawals", icon: Wallet },
  ]},
  { group: "Engagement", items: [
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Gift Codes", href: "/gift-codes", icon: Gift },
    { name: "Announcements", href: "/announcements", icon: Megaphone },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ]},
  { group: "Support", items: [
    { name: "Tickets", href: "/support", icon: LifeBuoy },
    { name: "Reports", href: "/reports", icon: MessageSquare },
  ]},
  { group: "Configuration", items: [
    { name: "Settings", href: "/settings", icon: Settings },
  ]}
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">Z</div>
          <span className="text-xl font-bold text-white tracking-tight">ZivoTube <span className="text-red-500">HQ</span></span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-hide">
        {menuItems.map((group) => (
          <div key={group.group}>
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{group.group}</h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                      isActive
                        ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                        : "hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon size={18} className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-red-400")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-colors">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
