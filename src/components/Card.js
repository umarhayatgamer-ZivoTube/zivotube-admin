import React from 'react';
import { Users, Video, Wallet, Coins, TrendingUp } from 'lucide-react';

export const Card = ({ title, value, icon, color = "bg-red-500" }) => {
  const getIcon = () => {
    switch (icon) {
      case 'users': return <Users size={24} />;
      case 'video': return <Video size={24} />;
      case 'wallet': return <Wallet size={24} />;
      case 'coins': return <Coins size={24} />;
      case 'revenue': return <TrendingUp size={24} />;
      default: return <Users size={24} />;
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-lg text-white`}>
          {getIcon()}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};
