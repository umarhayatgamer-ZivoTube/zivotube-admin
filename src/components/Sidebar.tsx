"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Video, Wallet, CheckSquare,
  Settings, UserPlus, Star, Layout as LayoutIcon,
  Store, Megaphone, ShieldAlert, LifeBuoy, Bell,
  MessageSquare, Gift, BarChart3, LogOut, Coins, CheckCircle,
  ChevronLeft, ChevronRight, ChevronDown, Smartphone, Share2,
  CreditCard, Target, Zap, PlayCircle, Crown, Box, ShoppingBag,
  Globe, Lock, Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { useSidebar } from "@/context/SidebarContext";

const settingFeatures = [
    { id: "app", label: "App Config", icon: Smartphone },
    { id: "user", label: "User Controls", icon: Users },
    { id: "coins", label: "Coin Economy", icon: Coins },
    { id: "referral", label: "Referral System", icon: Share2 },
    { id: "withdrawal", label: "Withdrawal System", icon: Wallet },
    { id: "payments", label: "Payment Gateways", icon: CreditCard },
    { id: "ads", label: "Ad Infrastructure", icon: Megaphone },
    { id: "sponsored", label: "Sponsored Ads", icon: Target },
    { id: "engagement", label: "Lucky Spin & Boxes", icon: Zap },
    { id: "tasks", label: "Mission System", icon: PlayCircle },
    { id: "creator", label: "Creator Economy", icon: Crown },
    { id: "marketplace", label: "Marketplace", icon: Box },
    { id: "store", label: "Creator Store", icon: ShoppingBag },
    { id: "notifications", label: "Notifications", icon: Globe },
    { id: "support", label: "Support Nodes", icon: LifeBuoy },
    { id: "security", label: "Security & Access", icon: Lock },
    { id: "analytics", label: "Analytics & Intel", icon: BarChart3 },
    { id: "backup", label: "Backup & Registry", icon: Database },
];

const menuItems = [
  { group: "General", items: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ]},
  { group: "Content", items: [
    { name: "Videos", href: "/videos", icon: Video },
    { name: "Demo Content", href: "/demo-content", icon: LayoutIcon },
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
    { name: "Coin Management", href: "/wallets", icon: Coins },
    { name: "Payment Proofs", href: "/payment-proofs", icon: CheckCircle },
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
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar, isMobileOpen, toggleMobile } = useSidebar();
  const [isSettingsOpen, setIsSettingsOpen] = useState(pathname.startsWith("/settings"));

  useEffect(() => {
    if (pathname.startsWith("/settings")) {
      setIsSettingsOpen(true);
    }
  }, [pathname]);

  const handleSignOut = async () => {
    await auth.signOut();
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    if (isCollapsed) {
      toggleSidebar();
      setIsSettingsOpen(true);
      router.push("/settings");
    } else {
      setIsSettingsOpen(!isSettingsOpen);
      if (!pathname.startsWith("/settings")) {
        router.push("/settings");
      }
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#090909] transition-colors duration-300">
      {/* Sidebar Header */}
      <div className={cn(
        "p-6 flex items-center justify-between transition-all duration-300",
        isCollapsed ? "px-4 justify-center" : "px-6"
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2D2D] to-[#8B0000] border border-white/10 shadow-lg flex items-center justify-center text-white font-black text-xl">
            Z
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight transition-colors">ZivoTube</span>
              <span className="text-[8px] font-bold text-[#FF2D2D] uppercase tracking-widest mt-1">Command Center</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-6 scrollbar-hide overflow-x-hidden">
        {menuItems.map((group) => (
          <div key={group.group}>
            {!isCollapsed && (
              <h3 className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-4 truncate animate-in fade-in duration-500">
                {group.group}
              </h3>
            )}
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : ""}
                    className={cn(
                      "flex items-center rounded-2xl text-xs font-bold transition-all duration-300 group relative overflow-hidden",
                      isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3",
                      isActive
                        ? "bg-gradient-to-r from-[#FF2D2D] to-[#cc2424] text-white shadow-xl shadow-red-900/30"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#121212] hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    )}

                    <item.icon size={18} className={cn(
                      "transition-all duration-300 shrink-0",
                      isActive ? "text-white scale-110" : "text-slate-400 dark:text-slate-500 group-hover:text-[#FF2D2D] group-hover:scale-110"
                    )} />

                    {!isCollapsed && (
                      <span className="truncate whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                        {item.name}
                      </span>
                    )}

                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-2 py-1 bg-white dark:bg-[#1A1A1A] text-slate-900 dark:text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-slate-200 dark:border-[#242424] shadow-lg">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Configuration Section (Settings with Sub-items) */}
        <div>
          {!isCollapsed && (
            <h3 className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-4 truncate animate-in fade-in duration-500">
              Configuration
            </h3>
          )}
          <div className="space-y-1.5">
            <button
              onClick={handleSettingsClick}
              title={isCollapsed ? "Settings" : ""}
              className={cn(
                "w-full flex items-center rounded-2xl text-xs font-bold transition-all duration-300 group relative overflow-hidden",
                isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3",
                pathname.startsWith("/settings")
                  ? "bg-gradient-to-r from-[#FF2D2D] to-[#cc2424] text-white shadow-xl shadow-red-900/30"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#121212] hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {pathname.startsWith("/settings") && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              )}
              <Settings size={18} className={cn(
                "transition-all duration-300 shrink-0",
                pathname.startsWith("/settings") ? "text-white scale-110" : "text-slate-400 dark:text-slate-500 group-hover:text-[#FF2D2D] group-hover:scale-110"
              )} />
              {!isCollapsed && (
                <>
                  <span className="truncate whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">Settings</span>
                  <div className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-[7px] text-black font-black rounded animate-pulse">NEW</div>
                  <ChevronDown size={14} className={cn("ml-auto transition-transform duration-300", isSettingsOpen && "rotate-180")} />
                </>
              )}
            </button>

            {/* Sub-items for Settings */}
            {!isCollapsed && isSettingsOpen && (
              <div className="pl-6 space-y-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                {settingFeatures.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                        router.push(`/settings?category=${feature.id}`);
                        window.dispatchEvent(new CustomEvent('settings-category-change', { detail: feature.id }));
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-bold transition-all duration-200",
                      "text-slate-400 dark:text-slate-500 hover:text-[#FF2D2D] hover:bg-slate-50 dark:hover:bg-white/5 group/sub"
                    )}
                  >
                    <feature.icon size={14} className="shrink-0 group-hover/sub:scale-110 transition-transform" />
                    <span className="truncate">{feature.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Footer */}
      <div className={cn("p-4 border-t border-slate-200 dark:border-[#242424] bg-white dark:bg-[#090909]", isCollapsed && "px-2")}>
        <button 
          onClick={handleSignOut}
          className={cn(
            "flex items-center w-full rounded-2xl text-xs font-bold text-slate-500 hover:bg-red-500/10 hover:text-[#FF2D2D] transition-all group relative overflow-hidden",
            isCollapsed ? "justify-center p-3" : "px-4 py-4 gap-3"
          )}
        >
          <LogOut size={18} className="shrink-0 transition-transform group-hover:translate-x-1" />
          {!isCollapsed && (
            <span className="truncate whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
              Terminate Session
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className={cn(
        "hidden lg:flex flex-col h-screen bg-white dark:bg-[#090909] text-slate-400 border-r border-slate-200 dark:border-[#242424] transition-all duration-300 ease-in-out fixed left-0 top-0 z-40",
        isCollapsed ? "w-[72px]" : "w-[240px]"
      )}>
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-10 w-6 h-6 bg-white dark:bg-[#242424] border border-slate-200 dark:border-[#333] rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:bg-[#FF2D2D] hover:text-white transition-colors z-50 shadow-md"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        {sidebarContent}
      </div>

      <div className={cn(
        "hidden lg:block transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-[72px]" : "w-[240px]"
      )} />

      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleMobile}
      />
      <div className={cn(
        "lg:hidden fixed inset-y-0 left-0 w-72 bg-[#090909] border-r border-[#242424] z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </div>
    </>
  );
};
