import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Send, Bell } from 'lucide-react';

export default function PushNotifications() {
  const [msg, setMsg] = useState({ title: '', body: '', target: 'All' });
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    // FCM Logic would go here
    await new Promise(r => setTimeout(r, 1500));
    alert("Notification queued for delivery!");
    setMsg({ title: '', body: '', target: 'All' });
    setSending(false);
  };

  return (
    <Layout title="Push Notifications">
      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-black mb-6 text-gray-900">Blast Announcement</h3>
            <form onSubmit={handleSend} className="space-y-6">
                <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">Message Title</label>
                    <input required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500" value={msg.title} onChange={e => setMsg({...msg, title: e.target.value})} placeholder="e.g. New Rewards Added!" />
                </div>
                <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">Message Body</label>
                    <textarea required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 h-32" value={msg.body} onChange={e => setMsg({...msg, body: e.target.value})} placeholder="Write your message here..." />
                </div>
                <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">Target Audience</label>
                    <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500" value={msg.target} onChange={e => setMsg({...msg, target: e.target.value})}>
                        <option value="All">All Users</option>
                        <option value="VIP">VIP Only</option>
                        <option value="Active">Active Last 24h</option>
                        <option value="Dormant">Dormant Users</option>
                    </select>
                </div>
                <button
                    disabled={sending}
                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                    <Send size={18} />
                    {sending ? 'Broadcasting...' : 'Send Notification'}
                </button>
            </form>
        </div>

        <div className="flex flex-col gap-6">
            <div className="bg-slate-900 p-8 rounded-3xl text-white">
                <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-4">Preview on Device</h4>
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center"><Bell size={12} /></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">ZivoTube • Just now</span>
                    </div>
                    <p className="font-bold text-sm">{msg.title || 'Notification Title'}</p>
                    <p className="text-xs text-slate-400 mt-1">{msg.body || 'Your message preview will appear here as you type.'}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100">
                <h4 className="font-black text-gray-900 mb-4 uppercase text-xs tracking-widest">Recent Broadcasts</h4>
                <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="font-bold text-xs">Weekend Bonus!</p>
                        <p className="text-[10px] text-gray-500">Sent to All Users • 2 days ago</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="font-bold text-xs">Maintenance Complete</p>
                        <p className="text-[10px] text-gray-500">Sent to All Users • 1 week ago</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
}
