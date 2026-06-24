"use client";

import { useState } from "react";
import { Settings, Save, Shield, Coins, Video, Bell, Globe, Key } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "general", label: "General", icon: Globe },
  { id: "economy", label: "Economy", icon: Coins },
  { id: "content", label: "Content", icon: Video },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const [active, setActive] = useState("general");
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    appName: "ZivoTube",
    appTagline: "Watch. Earn. Grow.",
    maintenanceMode: false,
    signupEnabled: true,
    coinValuePKR: 0.01,
    minWithdrawalAmount: 500,
    referralBonus: 100,
    watchRewardCoins: 5,
    maxUploadSizeMB: 500,
    autoApproveVideos: false,
    moderationEnabled: true,
    loginNotifications: true,
    withdrawalNotifications: true,
    reportNotifications: true,
    adminEmail: "admin@zivotube.com",
    twoFactorEnabled: false,
    sessionTimeoutMinutes: 60,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={cn("relative w-12 h-6 rounded-full transition-all", value ? "bg-red-500" : "bg-slate-200")}>
      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all", value ? "left-7" : "left-1")}/>
    </button>
  );

  const Field = ({ label, children, desc }: { label: string; children: React.ReactNode; desc?: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Configure platform behavior and policies</p>
        </div>
        <button onClick={handleSave} className={cn("flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg", saved ? "bg-green-600 text-white shadow-green-900/20" : "bg-red-600 text-white hover:bg-red-700 shadow-red-900/20")}>
          <Save size={16}/> {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <nav className="space-y-1 sticky top-8">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all", active === s.id ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-slate-500 hover:bg-slate-100")}>
                <s.icon size={16}/> {s.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 admin-card">
          {active === "general" && (
            <div>
              <h3 className="font-black text-slate-900 mb-6 pb-3 border-b border-slate-100">General Settings</h3>
              <Field label="App Name" desc="Display name across the platform">
                <input value={config.appName} onChange={e => setConfig({...config, appName: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-48"/>
              </Field>
              <Field label="App Tagline" desc="Shown on login and splash screens">
                <input value={config.appTagline} onChange={e => setConfig({...config, appTagline: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-48"/>
              </Field>
              <Field label="Maintenance Mode" desc="Temporarily disable app access for users">
                <Toggle value={config.maintenanceMode} onChange={v => setConfig({...config, maintenanceMode: v})}/>
              </Field>
              <Field label="New Sign-ups" desc="Allow new user registrations">
                <Toggle value={config.signupEnabled} onChange={v => setConfig({...config, signupEnabled: v})}/>
              </Field>
              <Field label="Admin Email">
                <input value={config.adminEmail} onChange={e => setConfig({...config, adminEmail: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-56"/>
              </Field>
            </div>
          )}

          {active === "economy" && (
            <div>
              <h3 className="font-black text-slate-900 mb-6 pb-3 border-b border-slate-100">Economy Settings</h3>
              <Field label="Coin Value (PKR)" desc="1 coin = this many PKR">
                <input type="number" value={config.coinValuePKR} onChange={e => setConfig({...config, coinValuePKR: Number(e.target.value)})} step="0.001" className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-32"/>
              </Field>
              <Field label="Min Withdrawal (PKR)" desc="Minimum amount users can withdraw">
                <input type="number" value={config.minWithdrawalAmount} onChange={e => setConfig({...config, minWithdrawalAmount: Number(e.target.value)})} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-32"/>
              </Field>
              <Field label="Referral Bonus (Coins)" desc="Coins given per successful referral">
                <input type="number" value={config.referralBonus} onChange={e => setConfig({...config, referralBonus: Number(e.target.value)})} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-32"/>
              </Field>
              <Field label="Watch Reward (Coins)" desc="Coins earned per video watched">
                <input type="number" value={config.watchRewardCoins} onChange={e => setConfig({...config, watchRewardCoins: Number(e.target.value)})} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-32"/>
              </Field>
            </div>
          )}

          {active === "content" && (
            <div>
              <h3 className="font-black text-slate-900 mb-6 pb-3 border-b border-slate-100">Content Settings</h3>
              <Field label="Max Upload Size (MB)" desc="Maximum video file size">
                <input type="number" value={config.maxUploadSizeMB} onChange={e => setConfig({...config, maxUploadSizeMB: Number(e.target.value)})} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-32"/>
              </Field>
              <Field label="Auto-Approve Videos" desc="Skip manual review for new uploads">
                <Toggle value={config.autoApproveVideos} onChange={v => setConfig({...config, autoApproveVideos: v})}/>
              </Field>
              <Field label="Moderation Enabled" desc="Enable AI content moderation">
                <Toggle value={config.moderationEnabled} onChange={v => setConfig({...config, moderationEnabled: v})}/>
              </Field>
            </div>
          )}

          {active === "security" && (
            <div>
              <h3 className="font-black text-slate-900 mb-6 pb-3 border-b border-slate-100">Security Settings</h3>
              <Field label="Two-Factor Authentication" desc="Require 2FA for admin login">
                <Toggle value={config.twoFactorEnabled} onChange={v => setConfig({...config, twoFactorEnabled: v})}/>
              </Field>
              <Field label="Session Timeout (minutes)" desc="Auto-logout after inactivity">
                <input type="number" value={config.sessionTimeoutMinutes} onChange={e => setConfig({...config, sessionTimeoutMinutes: Number(e.target.value)})} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-32"/>
              </Field>
              <Field label="Generate API Key" desc="Rotate admin panel API secret">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-black hover:bg-red-600 transition-all">
                  <Key size={12}/> Rotate Key
                </button>
              </Field>
            </div>
          )}

          {active === "notifications" && (
            <div>
              <h3 className="font-black text-slate-900 mb-6 pb-3 border-b border-slate-100">Notification Settings</h3>
              <Field label="Login Alerts" desc="Notify on admin login events">
                <Toggle value={config.loginNotifications} onChange={v => setConfig({...config, loginNotifications: v})}/>
              </Field>
              <Field label="Withdrawal Alerts" desc="Notify on new withdrawal requests">
                <Toggle value={config.withdrawalNotifications} onChange={v => setConfig({...config, withdrawalNotifications: v})}/>
              </Field>
              <Field label="Report Alerts" desc="Notify on new content reports">
                <Toggle value={config.reportNotifications} onChange={v => setConfig({...config, reportNotifications: v})}/>
              </Field>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
