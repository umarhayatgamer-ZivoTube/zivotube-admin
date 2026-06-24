import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Users, Video, Wallet, CheckSquare,
  Settings, UserPlus, Star, Layout as LayoutIcon,
  Store, Megaphone, ShieldAlert, LifeBuoy, Bell, MessageSquare
} from 'lucide-react';

export const Layout = ({ children, title }) => {
  const menuItems = [
    { name: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'User Management', href: '/users', icon: <Users size={20} /> },
    { name: 'Video Management', href: '/videos', icon: <Video size={20} /> },
    { name: 'Withdrawals', href: '/withdrawals', icon: <Wallet size={20} /> },
    { name: 'Task Management', href: '/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Referral System', href: '/referrals', icon: <UserPlus size={20} /> },
    { name: 'Creator Center', href: '/creators', icon: <Star size={20} /> },
    { name: 'Marketplace', href: '/marketplace', icon: <LayoutIcon size={20} /> },
    { name: 'Store Management', href: '/store', icon: <Store size={20} /> },
    { name: 'Promotion Center', href: '/promotions', icon: <Megaphone size={20} /> },
    { name: 'VIP & Memberships', href: '/vip', icon: <ShieldAlert size={20} /> },
    { name: 'Support Tickets', href: '/support', icon: <LifeBuoy size={20} /> },
    { name: 'Reports Center', href: '/reports', icon: <ShieldAlert size={20} /> },
    { name: 'Notifications', href: '/notifications', icon: <Bell size={20} /> },
    { name: 'Announcements', href: '/announcements', icon: <MessageSquare size={20} /> },
    { name: 'App Settings', href: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8 text-red-500">ZivoTube Admin</h1>
        <nav>
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg mb-1 transition">
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Admin</span>
            <div className="w-8 h-8 bg-red-500 rounded-full"></div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
