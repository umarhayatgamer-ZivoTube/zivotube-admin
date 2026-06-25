"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
    Settings, Save, Smartphone, ShieldAlert, BadgeDollarSign,
    Mail, Globe, Users, Coins, Share2, Wallet, CreditCard,
    Megaphone, Target, Zap, Box, ShoppingBag, Crown,
    Lock, BarChart3, Database, RefreshCw, Search, ChevronRight,
    PlayCircle, Gift, Sparkles, AlertCircle, Check, History
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
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
    { id: "support", label: "Support Nodes", icon: Mail },
    { id: "security", label: "Security & Access", icon: Lock },
    { id: "analytics", label: "Analytics & Intel", icon: BarChart3 },
    { id: "backup", label: "Backup & Registry", icon: Database },
];

function SettingsContent() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "app");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "app_settings", "global"));
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();

    // Listen for category changes from sidebar
    const handleCategoryChange = (e: any) => {
        if (e.detail) setActiveCategory(e.detail);
    };
    window.addEventListener('settings-category-change', handleCategoryChange);
    return () => window.removeEventListener('settings-category-change', handleCategoryChange);
  }, []);

  // Update active category when URL param changes
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) setActiveCategory(category);
  }, [searchParams]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "app_settings", "global"), settings, { merge: true });
      alert("System parameters updated successfully.");
    } catch(e) {
        console.error(e);
        alert("Error updating parameters: " + e);
    }
    setSaving(false);
  };

  const handleChange = (path: string, value: any) => {
      const keys = path.split('.');
      setSettings((prev: any) => {
          const newState = { ...prev };
          let current = newState;
          for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) current[keys[i]] = {};
              current[keys[i]] = { ...current[keys[i]] };
              current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
          return newState;
      });
  };

  const handleReset = async () => {
      if (confirm("PROTOCOL WARNING: This will overwrite ALL mainnet parameters with factory defaults. This action is irreversible. Proceed?")) {
          setSettings(DEFAULT_SETTINGS);
          setSaving(true);
          try {
            await setDoc(doc(db, "app_settings", "global"), DEFAULT_SETTINGS);
            alert("System restored to factory defaults.");
          } catch(e) { console.error(e); }
          setSaving(false);
      }
  };

  if (loading) {
    return (
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#FF2D2D] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Decrypting Mainnet Configuration...</p>
        </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Platform <span className="text-[#FF2D2D]">Configuration</span></h1>
          <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em] mt-1">Global System Governance & Operational Parameters</p>
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={handleReset}
                className="px-4 py-2 bg-[#090909] border border-red-500/20 text-red-500 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl"
                title="Reset to Factory Defaults"
            >
                Reset
            </button>
            <button
                onClick={fetchSettings}
                className="p-3 bg-[#121212] border border-[#242424] rounded-xl text-slate-500 hover:text-white transition-all shadow-xl"
                title="Refresh"
            >
                <RefreshCw size={16} className={cn(loading && "animate-spin")} />
            </button>
            <button
                onClick={handleSave}
                disabled={saving}
                className="premium-button !px-6 !py-2.5 min-w-[140px] flex items-center justify-center gap-2 !text-[9px]"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={16} /> Commit</>}
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Content Area */}
        <div className="flex-1 min-w-0">
            {/* Category: APP CONFIG */}
            {activeCategory === "app" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="App Core Architecture" subtitle="Primary identity and distribution parameters" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SettingInput label="Network Name" value={settings.app?.name} onChange={(v: string) => handleChange("app.name", v)} />
                        <SettingInput label="Branding Asset URL" value={settings.app?.logoUrl} onChange={(v: string) => handleChange("app.logoUrl", v)} />
                        <SettingInput label="Public Version String" value={settings.app?.version} onChange={(v: string) => handleChange("app.version", v)} />
                        <SettingInput label="Latest Build Code" value={settings.app?.latestVersionCode} onChange={(v: string) => handleChange("app.latestVersionCode", Number(v))} type="number" />
                        <SettingInput label="Minimum Core Version" value={settings.app?.minSupportedVersion} onChange={(v: string) => handleChange("app.minSupportedVersion", Number(v))} type="number" />
                        <SettingInput label="Repository (Play Store)" value={settings.app?.playStoreUrl} onChange={(v: string) => handleChange("app.playStoreUrl", v)} />
                        <SettingInput label="Binary Link (Direct APK)" value={settings.app?.apkUrl} onChange={(v: string) => handleChange("app.apkUrl", v)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FeatureToggle label="Force Critical Update" checked={settings.app?.forceUpdate} onChange={(v: boolean) => handleChange("app.forceUpdate", v)} />
                        <FeatureToggle label="Optional Update Banner" checked={settings.app?.optionalUpdate} onChange={(v: boolean) => handleChange("app.optionalUpdate", v)} />
                        <FeatureToggle label="Maintenance Protocol" checked={settings.app?.maintenanceMode} onChange={(v: boolean) => handleChange("app.maintenanceMode", v)} />
                        <FeatureToggle label="Registration Gate" checked={settings.app?.registrationEnabled} onChange={(v: boolean) => handleChange("app.registrationEnabled", v)} />
                        <FeatureToggle label="Show Demo Content" checked={settings.app?.showDemoContent} onChange={(v: boolean) => handleChange("app.showDemoContent", v)} />
                    </div>
                    {settings.app?.maintenanceMode && (
                        <SettingInput label="Maintenance Transmission Message" value={settings.app?.maintenanceMessage} onChange={(v: string) => handleChange("app.maintenanceMessage", v)} />
                    )}
                    <div className="pt-6 border-t border-[#242424]">
                        <button
                            onClick={() => { if(confirm("This will force-logout all active node sessions globally. Proceed?")) handleChange("app.forceLogoutAll", Date.now()) }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-xl"
                        >
                            Terminate All Global Sessions
                        </button>
                    </div>
                </div>
            )}

            {/* Category: USER CONTROLS */}
            {activeCategory === "user" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Access & Authentication" subtitle="Node verification and security protocols" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FeatureToggle label="New User Intake" checked={settings.user?.registrationEnabled} onChange={(v: boolean) => handleChange("user.registrationEnabled", v)} />
                        <FeatureToggle label="One-Device Limitation" checked={settings.user?.oneDeviceOneAccount} onChange={(v: boolean) => handleChange("user.oneDeviceOneAccount", v)} />
                        <FeatureToggle label="Multi-Account Detection" checked={settings.user?.multiAccountDetection} onChange={(v: boolean) => handleChange("user.multiAccountDetection", v)} />
                        <FeatureToggle label="Mandatory Email Hash" checked={settings.user?.emailVerification} onChange={(v: boolean) => handleChange("user.emailVerification", v)} />
                        <FeatureToggle label="Mandatory Phone Link" checked={settings.user?.phoneVerification} onChange={(v: boolean) => handleChange("user.phoneVerification", v)} />
                        <FeatureToggle label="Auto-Ban Suspicious Signatures" checked={settings.user?.autoBanSuspicious} onChange={(v: boolean) => handleChange("user.autoBanSuspicious", v)} />
                        <FeatureToggle label="Daily Login Persistence" checked={settings.user?.dailyLoginRequired} onChange={(v: boolean) => handleChange("user.dailyLoginRequired", v)} />
                    </div>
                </div>
            )}

            {/* Category: COIN ECONOMY */}
            {activeCategory === "coins" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Treasury & Monetary Logic" subtitle="Cryptographic asset generation and yield limits" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <SettingInput label="Genesis Grant (Signup)" value={settings.coins?.signupBonus} onChange={(v: string) => handleChange("coins.signupBonus", Number(v))} type="number" />
                        <SettingInput label="Uptime Yield (Check-in)" value={settings.coins?.dailyCheckIn} onChange={(v: string) => handleChange("coins.dailyCheckIn", Number(v))} type="number" />
                        <SettingInput label="Expansion Bounty (Referral)" value={settings.coins?.referralBonus} onChange={(v: string) => handleChange("coins.referralBonus", Number(v))} type="number" />
                        <SettingInput label="Talent Incentive (Creator)" value={settings.coins?.creatorBonus} onChange={(v: string) => handleChange("coins.creatorBonus", Number(v))} type="number" />
                        <SettingInput label="Max Daily Individual Yield" value={settings.coins?.dailyLimit} onChange={(v: string) => handleChange("coins.dailyLimit", Number(v))} type="number" />
                        <SettingInput label="Max Daily Ad Yield" value={settings.coins?.dailyAdLimit} onChange={(v: string) => handleChange("coins.dailyAdLimit", Number(v))} type="number" />
                        <SettingInput label="Max Daily Mission Yield" value={settings.coins?.dailyTaskLimit} onChange={(v: string) => handleChange("coins.dailyTaskLimit", Number(v))} type="number" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FeatureToggle label="Asset Acquisition Channel" checked={settings.coins?.purchaseEnabled} onChange={(v: boolean) => handleChange("coins.purchaseEnabled", v)} />
                        <FeatureToggle label="P2P Asset Transmission" checked={settings.coins?.transferEnabled} onChange={(v: boolean) => handleChange("coins.transferEnabled", v)} />
                        <FeatureToggle label="Yield Expiry Protocol" checked={settings.coins?.expiryEnabled} onChange={(v: boolean) => handleChange("coins.expiryEnabled", v)} />
                    </div>
                </div>
            )}

            {/* Category: REFERRAL SYSTEM */}
            {activeCategory === "referral" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Viral Expansion Engine" subtitle="Incentivizing network growth nodes" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInput label="Base Expansion Bounty" value={settings.referral?.bonusAmount} onChange={(v: string) => handleChange("referral.bonusAmount", Number(v))} type="number" />
                        <SettingInput label="Settlement Unlock Floor" value={settings.referral?.withdrawUnlockReq} onChange={(v: string) => handleChange("referral.withdrawUnlockReq", Number(v))} type="number" />
                        <SettingInput label="Min Active Sub-Nodes" value={settings.referral?.minActiveReferrals} onChange={(v: string) => handleChange("referral.minActiveReferrals", Number(v))} type="number" />
                        <SettingInput label="Recursive Yield Share %" value={settings.referral?.commissionPercent} onChange={(v: string) => handleChange("referral.commissionPercent", Number(v))} type="number" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FeatureToggle label="Expansion Protocol Active" checked={settings.referral?.enabled} onChange={(v: boolean) => handleChange("referral.enabled", v)} />
                        <FeatureToggle label="Anti-Fraud Shield" checked={settings.referral?.fraudProtection} onChange={(v: boolean) => handleChange("referral.fraudProtection", v)} />
                        <FeatureToggle label="Self-Referral Interdiction" checked={settings.referral?.selfReferralBlock} onChange={(v: boolean) => handleChange("referral.selfReferralBlock", v)} />
                        <FeatureToggle label="Synthetic Node Detection" checked={settings.referral?.fakeDetection} onChange={(v: boolean) => handleChange("referral.fakeDetection", v)} />
                        <FeatureToggle label="Milestone Reward Nodes" checked={settings.referral?.milestoneRewards} onChange={(v: boolean) => handleChange("referral.milestoneRewards", v)} />
                    </div>
                </div>
            )}

            {/* Category: WITHDRAWAL SYSTEM */}
            {activeCategory === "withdrawal" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Settlement & Treasury Ops" subtitle="Controlling asset redemption and liquidity" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <SettingInput label="Initial Test Liquid (PKR)" value={settings.withdrawal?.firstWithdrawalAmount} onChange={(v: string) => handleChange("withdrawal.firstWithdrawalAmount", Number(v))} type="number" />
                        <SettingInput label="Min Settlement Floor (ZIVO)" value={settings.withdrawal?.minCoins} onChange={(v: string) => handleChange("withdrawal.minCoins", Number(v))} type="number" />
                        <SettingInput label="Max Settlement Cap (ZIVO)" value={settings.withdrawal?.maxCoins} onChange={(v: string) => handleChange("withdrawal.maxCoins", Number(v))} type="number" />
                        <SettingInput label="Daily Treasury Burn Limit" value={settings.withdrawal?.dailyBudget} onChange={(v: string) => handleChange("withdrawal.dailyBudget", Number(v))} type="number" />
                        <SettingInput label="Monthly Allocation Cap" value={settings.withdrawal?.monthlyBudget} onChange={(v: string) => handleChange("withdrawal.monthlyBudget", Number(v))} type="number" />
                        <SettingInput label="Auto-Clearance Threshold" value={settings.withdrawal?.autoApproveLimit} onChange={(v: string) => handleChange("withdrawal.autoApproveLimit", Number(v))} type="number" />
                        <SettingInput label="Cycle Duration (Days)" value={settings.withdrawal?.processingDays} onChange={(v: string) => handleChange("withdrawal.processingDays", Number(v))} type="number" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FeatureToggle label="Settlement Channel Active" checked={settings.withdrawal?.enabled} onChange={(v: boolean) => handleChange("withdrawal.enabled", v)} />
                        <FeatureToggle label="Initial Liquidity Test" checked={settings.withdrawal?.firstWithdrawalEnabled} onChange={(v: boolean) => handleChange("withdrawal.firstWithdrawalEnabled", v)} />
                        <FeatureToggle label="Queue Management Node" checked={settings.withdrawal?.queueEnabled} onChange={(v: boolean) => handleChange("withdrawal.queueEnabled", v)} />
                        <FeatureToggle label="VIP Priority Routing" checked={settings.withdrawal?.priorityVip} onChange={(v: boolean) => handleChange("withdrawal.priorityVip", v)} />
                        <FeatureToggle label="Mandatory Human Review" checked={settings.withdrawal?.manualReview} onChange={(v: boolean) => handleChange("withdrawal.manualReview", v)} />
                    </div>
                </div>
            )}

            {/* Category: PAYMENT GATEWAYS */}
            {activeCategory === "payments" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Transmission Gateways" subtitle="Configuring payout rail parameters" />
                    {["jazzcash", "easypaisa", "bank", "payoneer", "paypal"].map((method) => (
                        <div key={method} className="admin-card border-[#242424] bg-[#090909] !p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{method} Rail</h4>
                                <FeatureToggle label="Status" checked={settings.payments?.[method]?.enabled} onChange={(v: boolean) => handleChange(`payments.${method}.enabled`, v)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <SettingInput label="Min Limit" value={settings.payments?.[method]?.min} onChange={(v: string) => handleChange(`payments.${method}.min`, Number(v))} type="number" />
                                <SettingInput label="Max Limit" value={settings.payments?.[method]?.max} onChange={(v: string) => handleChange(`payments.${method}.max`, Number(v))} type="number" />
                                <SettingInput label="Processing Fee" value={settings.payments?.[method]?.fee} onChange={(v: string) => handleChange(`payments.${method}.fee`, Number(v))} type="number" />
                                <SettingInput label="Latency" value={settings.payments?.[method]?.time} onChange={(v: string) => handleChange(`payments.${method}.time`, v)} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Category: AD INFRASTRUCTURE */}
            {activeCategory === "ads" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Revenue Generation Node" subtitle="Managing third-party ad networks" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <SettingInput label="Rewarded Yield (ZIVO)" value={settings.ads?.rewardedCoins} onChange={(v: string) => handleChange("ads.rewardedCoins", Number(v))} type="number" />
                        <SettingInput label="Interstitial Cycle" value={settings.ads?.interstitialFreq} onChange={(v: string) => handleChange("ads.interstitialFreq", Number(v))} type="number" />
                        <SettingInput label="Native Slot Cycle" value={settings.ads?.nativeFreq} onChange={(v: string) => handleChange("ads.nativeFreq", Number(v))} type="number" />
                        <SettingInput label="Daily Yield Cap (Ads)" value={settings.ads?.dailyRewardedLimit} onChange={(v: string) => handleChange("ads.dailyRewardedLimit", Number(v))} type="number" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FeatureToggle label="Global AdMob Uplink" checked={settings.ads?.enabled} onChange={(v: boolean) => handleChange("ads.enabled", v)} />
                        <FeatureToggle label="High-Yield Rewarded" checked={settings.ads?.rewardedEnabled} onChange={(v: boolean) => handleChange("ads.rewardedEnabled", v)} />
                        <FeatureToggle label="Interstitial Overlays" checked={settings.ads?.interstitialEnabled} onChange={(v: boolean) => handleChange("ads.interstitialEnabled", v)} />
                        <FeatureToggle label="Native Contextual" checked={settings.ads?.nativeEnabled} onChange={(v: boolean) => handleChange("ads.nativeEnabled", v)} />
                        <FeatureToggle label="Persistent Banners" checked={settings.ads?.bannerEnabled} onChange={(v: boolean) => handleChange("ads.bannerEnabled", v)} />
                        <FeatureToggle label="Open-App Interdiction" checked={settings.ads?.openAppEnabled} onChange={(v: boolean) => handleChange("ads.openAppEnabled", v)} />
                    </div>
                </div>
            )}

            {/* Category: SPONSORED ADS */}
            {activeCategory === "sponsored" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Direct Merchant Channels" subtitle="Internal product promotion parameters" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInput label="Injection Frequency" value={settings.sponsoredAds?.frequency} onChange={(v: string) => handleChange("sponsoredAds.frequency", Number(v))} type="number" />
                        <SettingInput label="Base Promotion Price" value={settings.sponsoredAds?.promotionPrice} onChange={(v: string) => handleChange("sponsoredAds.promotionPrice", Number(v))} type="number" />
                        <SettingInput label="Featured Slot Surcharge" value={settings.sponsoredAds?.featuredPrice} onChange={(v: string) => handleChange("sponsoredAds.featuredPrice", Number(v))} type="number" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FeatureToggle label="Direct Ads Active" checked={settings.sponsoredAds?.enabled} onChange={(v: boolean) => handleChange("sponsoredAds.enabled", v)} />
                        <FeatureToggle label="In-Feed Injections" checked={settings.sponsoredAds?.inFeedEnabled} onChange={(v: boolean) => handleChange("sponsoredAds.inFeedEnabled", v)} />
                        <FeatureToggle label="Mandatory HQ Approval" checked={settings.sponsoredAds?.approvalRequired} onChange={(v: boolean) => handleChange("sponsoredAds.approvalRequired", v)} />
                    </div>
                </div>
            )}

            {/* Category: ENGAGEMENT */}
            {activeCategory === "engagement" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Gamble-Fi & Retention" subtitle="Incentivizing platform uptime via games" />
                    <div className="admin-card border-[#242424] bg-[#090909] !p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Lucky Spin Terminal</h4>
                            <FeatureToggle label="Status" checked={settings.luckySpin?.enabled} onChange={(v: boolean) => handleChange("luckySpin.enabled", v)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <SettingInput label="Daily Spins" value={settings.luckySpin?.dailyLimit} onChange={(v: string) => handleChange("luckySpin.dailyLimit", Number(v))} type="number" />
                            <SettingInput label="Spin Cost" value={settings.luckySpin?.cost} onChange={(v: string) => handleChange("luckySpin.cost", Number(v))} type="number" />
                            <SettingInput label="Bonus Reward" value={settings.luckySpin?.bonusSpinReward} onChange={(v: string) => handleChange("luckySpin.bonusSpinReward", Number(v))} type="number" />
                            <SettingInput label="Cooldown (h)" value={settings.luckySpin?.cooldownHours} onChange={(v: string) => handleChange("luckySpin.cooldownHours", Number(v))} type="number" />
                        </div>
                    </div>
                    <div className="admin-card border-[#242424] bg-[#090909] !p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Mystery Box Registry</h4>
                            <FeatureToggle label="Status" checked={settings.mysteryBox?.enabled} onChange={(v: boolean) => handleChange("mysteryBox.enabled", v)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SettingInput label="Aquisition Cost" value={settings.mysteryBox?.cost} onChange={(v: string) => handleChange("mysteryBox.cost", Number(v))} type="number" />
                            <SettingInput label="Max Daily Drops" value={settings.mysteryBox?.dailyLimit} onChange={(v: string) => handleChange("mysteryBox.dailyLimit", Number(v))} type="number" />
                            <SettingInput label="Reward Variance" value={settings.mysteryBox?.rewardRange} onChange={(v: string) => handleChange("mysteryBox.rewardRange", v)} />
                        </div>
                        <div className="mt-4">
                            <FeatureToggle label="Special Loot Events Active" checked={settings.mysteryBox?.specialEvents} onChange={(v: boolean) => handleChange("mysteryBox.specialEvents", v)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Category: TASK SYSTEM */}
            {activeCategory === "tasks" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Mission Control" subtitle="Daily and periodic objective management" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInput label="Yield Multiplier (Global)" value={settings.tasks?.rewardMultiplier} onChange={(v: string) => handleChange("tasks.rewardMultiplier", Number(v))} type="number" />
                        <SettingInput label="Daily Mission Cap" value={settings.tasks?.dailyLimit} onChange={(v: string) => handleChange("tasks.dailyLimit", Number(v))} type="number" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FeatureToggle label="Daily Missions" checked={settings.tasks?.dailyEnabled} onChange={(v: boolean) => handleChange("tasks.dailyEnabled", v)} />
                        <FeatureToggle label="Quest Cycles (Weekly)" checked={settings.tasks?.weeklyEnabled} onChange={(v: boolean) => handleChange("tasks.weeklyEnabled", v)} />
                        <FeatureToggle label="Social Connectivity" checked={settings.tasks?.socialEnabled} onChange={(v: boolean) => handleChange("tasks.socialEnabled", v)} />
                        <FeatureToggle label="Creator-Specific Goals" checked={settings.tasks?.creatorEnabled} onChange={(v: boolean) => handleChange("tasks.creatorEnabled", v)} />
                        <FeatureToggle label="Evidence Approval Required" checked={settings.tasks?.approvalRequired} onChange={(v: boolean) => handleChange("tasks.approvalRequired", v)} />
                    </div>
                </div>
            )}

            {/* Category: CREATOR ECONOMY */}
            {activeCategory === "creator" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Verified Talent Program" subtitle="Governance for the ZivoTube creator class" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInput label="Node Revenue Share %" value={settings.creator?.revenueShare} onChange={(v: string) => handleChange("creator.revenueShare", Number(v))} type="number" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FeatureToggle label="Creator Portal Active" checked={settings.creator?.programEnabled} onChange={(v: boolean) => handleChange("creator.programEnabled", v)} />
                        <FeatureToggle label="Identity Verification" checked={settings.creator?.verificationEnabled} onChange={(v: boolean) => handleChange("creator.verificationEnabled", v)} />
                        <FeatureToggle label="Tiered Rank Infrastructure" checked={settings.creator?.levelsEnabled} onChange={(v: boolean) => handleChange("creator.levelsEnabled", v)} />
                        <FeatureToggle label="Live Monetization" checked={settings.creator?.monetizationEnabled} onChange={(v: boolean) => handleChange("creator.monetizationEnabled", v)} />
                        <FeatureToggle label="Intelligence Dashboard" checked={settings.creator?.analyticsEnabled} onChange={(v: boolean) => handleChange("creator.analyticsEnabled", v)} />
                    </div>
                </div>
            )}

            {/* Category: MARKETPLACE */}
            {activeCategory === "marketplace" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Creative Asset Exchange" subtitle="Controlling the template marketplace" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInput label="Platform Protocol Fee %" value={settings.marketplace?.platformCommission} onChange={(v: string) => handleChange("marketplace.platformCommission", Number(v))} type="number" />
                        <SettingInput label="Net Node Earnings %" value={settings.marketplace?.creatorShare} onChange={(v: string) => handleChange("marketplace.creatorShare", Number(v))} type="number" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FeatureToggle label="Marketplace Uplink" checked={settings.marketplace?.enabled} onChange={(v: boolean) => handleChange("marketplace.enabled", v)} />
                        <FeatureToggle label="Template Screening" checked={settings.marketplace?.approvalRequired} onChange={(v: boolean) => handleChange("marketplace.approvalRequired", v)} />
                        <FeatureToggle label="Featured Spotlights" checked={settings.marketplace?.featuredEnabled} onChange={(v: boolean) => handleChange("marketplace.featuredEnabled", v)} />
                        <FeatureToggle label="Creative Combat (Battle)" checked={settings.marketplace?.battleEnabled} onChange={(v: boolean) => handleChange("marketplace.battleEnabled", v)} />
                        <FeatureToggle label="Reputation Ranking" checked={settings.marketplace?.rankingEnabled} onChange={(v: boolean) => handleChange("marketplace.rankingEnabled", v)} />
                        <FeatureToggle label="Elite Premium Assets" checked={settings.marketplace?.premiumEnabled} onChange={(v: boolean) => handleChange("marketplace.premiumEnabled", v)} />
                    </div>
                </div>
            )}

            {/* Category: STORE */}
            {activeCategory === "store" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Direct Merchant Hub" subtitle="Inventory management for physical and digital goods" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInput label="Global Store Tax %" value={settings.store?.commission} onChange={(v: string) => handleChange("store.commission", Number(v))} type="number" />
                        <SettingInput label="Featured Slot Price" value={settings.store?.featuredPrice} onChange={(v: string) => handleChange("store.featuredPrice", Number(v))} type="number" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FeatureToggle label="Direct Merchant Portal" checked={settings.store?.enabled} onChange={(v: boolean) => handleChange("store.enabled", v)} />
                        <FeatureToggle label="Inventory Clearance" checked={settings.store?.approvalRequired} onChange={(v: boolean) => handleChange("store.approvalRequired", v)} />
                        <FeatureToggle label="Digital Node Support" checked={settings.store?.digitalSupport} onChange={(v: boolean) => handleChange("store.digitalSupport", v)} />
                        <FeatureToggle label="Physical Logistic Support" checked={settings.store?.physicalSupport} onChange={(v: boolean) => handleChange("store.physicalSupport", v)} />
                    </div>
                </div>
            )}

            {/* Category: VIP SYSTEM */}
            {activeCategory === "vip" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Elite Membership Tier" subtitle="Advanced parameters for premium network nodes" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInput label="Monthly Token Cost" value={settings.vip?.monthlyPrice} onChange={(v: string) => handleChange("vip.monthlyPrice", Number(v))} type="number" />
                        <SettingInput label="Yearly Protocol Cost" value={settings.vip?.yearlyPrice} onChange={(v: string) => handleChange("vip.yearlyPrice", Number(v))} type="number" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FeatureToggle label="Elite Tier Active" checked={settings.vip?.enabled} onChange={(v: boolean) => handleChange("vip.enabled", v)} />
                        <FeatureToggle label="2X Yield Multiplier" checked={settings.vip?.doubleCoins} onChange={(v: boolean) => handleChange("vip.doubleCoins", v)} />
                        <FeatureToggle label="Priority Treasury Routing" checked={settings.vip?.priorityWithdrawals} onChange={(v: boolean) => handleChange("vip.priorityWithdrawals", v)} />
                        <FeatureToggle label="Elite Registry Badge" checked={settings.vip?.badge} onChange={(v: boolean) => handleChange("vip.badge", v)} />
                        <FeatureToggle label="Exclusive Mission Logic" checked={settings.vip?.extraTasks} onChange={(v: boolean) => handleChange("vip.extraTasks", v)} />
                        <FeatureToggle label="Creator Pulse Boost" checked={settings.vip?.creatorBoost} onChange={(v: boolean) => handleChange("vip.creatorBoost", v)} />
                    </div>
                </div>
            )}

            {/* Category: NOTIFICATIONS */}
            {activeCategory === "notifications" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Signal Relay Center" subtitle="Managing global and individual communication nodes" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FeatureToggle label="Firebase Cloud Relay" checked={settings.notifications?.pushEnabled} onChange={(v: boolean) => handleChange("notifications.pushEnabled", v)} />
                        <FeatureToggle label="SMTP Node Relay" checked={settings.notifications?.emailEnabled} onChange={(v: boolean) => handleChange("notifications.emailEnabled", v)} />
                        <FeatureToggle label="Settlement Alerts" checked={settings.notifications?.withdrawal} onChange={(v: boolean) => handleChange("notifications.withdrawal", v)} />
                        <FeatureToggle label="Mission Updates" checked={settings.notifications?.task} onChange={(v: boolean) => handleChange("notifications.task", v)} />
                        <FeatureToggle label="Talent Alerts" checked={settings.notifications?.creator} onChange={(v: boolean) => handleChange("notifications.creator", v)} />
                        <FeatureToggle label="Network Growth Alerts" checked={settings.notifications?.referral} onChange={(v: boolean) => handleChange("notifications.referral", v)} />
                        <FeatureToggle label="Elite Protocol Alerts" checked={settings.notifications?.vip} onChange={(v: boolean) => handleChange("notifications.vip", v)} />
                    </div>
                </div>
            )}

            {/* Category: SUPPORT NODES */}
            {activeCategory === "support" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Customer Resolution Hub" subtitle="Configuring communication tunnels" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInput label="Official SMTP Node" value={settings.support?.email} onChange={(v: string) => handleChange("support.email", v)} />
                        <SettingInput label="WhatsApp Direct Tunnel" value={settings.support?.whatsapp} onChange={(v: string) => handleChange("support.whatsapp", v)} />
                        <SettingInput label="Telegram Global Node" value={settings.support?.telegram} onChange={(v: string) => handleChange("support.telegram", v)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FeatureToggle label="Ticket Registry Active" checked={settings.support?.ticketEnabled} onChange={(v: boolean) => handleChange("support.ticketEnabled", v)} />
                        <FeatureToggle label="Live Real-time Uplink" checked={settings.support?.liveChatEnabled} onChange={(v: boolean) => handleChange("support.liveChatEnabled", v)} />
                    </div>
                </div>
            )}

            {/* Category: SECURITY & ACCESS */}
            {activeCategory === "security" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Firewall & Integrity" subtitle="Hardening the Command Center protocols" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInput label="Protocol Heartbeat (Timeout)" value={settings.security?.sessionTimeout} onChange={(v: string) => handleChange("security.sessionTimeout", Number(v))} type="number" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FeatureToggle label="2FA Authentication" checked={settings.security?.twoFactor} onChange={(v: boolean) => handleChange("security.twoFactor", v)} />
                        <FeatureToggle label="IP Geolocation Filter" checked={settings.security?.ipRestrictions} onChange={(v: boolean) => handleChange("security.ipRestrictions", v)} />
                        <FeatureToggle label="Brute-Force Interdiction" checked={settings.security?.failedLoginProtection} onChange={(v: boolean) => handleChange("security.failedLoginProtection", v)} />
                        <FeatureToggle label="Admin Operational Logs" checked={settings.security?.adminLogs} onChange={(v: boolean) => handleChange("security.adminLogs", v)} />
                        <FeatureToggle label="User Activity Tracking" checked={settings.security?.userLogs} onChange={(v: boolean) => handleChange("security.userLogs", v)} />
                    </div>
                </div>
            )}

            {/* Category: ANALYTICS */}
            {activeCategory === "analytics" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Intelligence Gathering" subtitle="Enabling platform-wide data telemetry" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FeatureToggle label="Firebase Telemetry" checked={settings.analytics?.firebaseEnabled} onChange={(v: boolean) => handleChange("analytics.firebaseEnabled", v)} />
                        <FeatureToggle label="Google Data Stream" checked={settings.analytics?.googleEnabled} onChange={(v: boolean) => handleChange("analytics.googleEnabled", v)} />
                        <FeatureToggle label="Fiat Revenue Tracking" checked={settings.analytics?.revenueTracking} onChange={(v: boolean) => handleChange("analytics.revenueTracking", v)} />
                        <FeatureToggle label="Asset Flow Analysis" checked={settings.analytics?.coinTracking} onChange={(v: boolean) => handleChange("analytics.coinTracking", v)} />
                        <FeatureToggle label="Talent Velocity Telemetry" checked={settings.analytics?.creatorAnalytics} onChange={(v: boolean) => handleChange("analytics.creatorAnalytics", v)} />
                        <FeatureToggle label="Treasury Burn Telemetry" checked={settings.analytics?.withdrawalAnalytics} onChange={(v: boolean) => handleChange("analytics.withdrawalAnalytics", v)} />
                        <FeatureToggle label="Network Growth Telemetry" checked={settings.analytics?.referralAnalytics} onChange={(v: boolean) => handleChange("analytics.referralAnalytics", v)} />
                    </div>
                </div>
            )}

            {/* Category: BACKUP */}
            {activeCategory === "backup" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Registry Persistence" subtitle="Managing database snapshots and exports" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FeatureToggle label="Auto Snapshot Protocol" checked={settings.backup?.autoBackup} onChange={(v: boolean) => handleChange("backup.autoBackup", v)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-[#242424]">
                        <BackupButton label="Manual Snapshot" icon={Database} onClick={() => {}} />
                        <BackupButton label="Export Users" icon={Users} onClick={() => {}} />
                        <BackupButton label="Export Settlements" icon={Wallet} onClick={() => {}} />
                        <BackupButton label="Export History" icon={History} onClick={() => {}} />
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string, subtitle: string }) {
    return (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-500/5 to-transparent border-l-4 border-[#FF2D2D] rounded-r-xl">
            <h2 className="text-sm font-black text-white uppercase tracking-tight">{title}</h2>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
    );
}

function SettingInput({ label, value, onChange, type = "text", placeholder = "" }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                value={value ?? ""}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-[#090909] border border-[#242424] text-white rounded-xl text-[11px] font-bold focus:border-[#FF2D2D] outline-none transition-all placeholder:text-slate-800 shadow-inner"
            />
        </div>
    );
}

function FeatureToggle({ label, checked, onChange }: any) {
    return (
        <label className={cn(
            "flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all duration-300 group/item",
            checked ? "bg-[#FF2D2D]/5 border-[#FF2D2D]/20 shadow-inner" : "bg-[#090909] border-[#242424]"
        )}>
            <span className={cn("text-[9px] font-black uppercase tracking-tight transition-colors", checked ? "text-[#FF2D2D]" : "text-slate-500 group-hover/item:text-slate-300")}>{label}</span>
            <div className={cn(
                "w-8 h-4.5 rounded-full relative transition-all duration-500 p-0.5",
                checked ? "bg-[#FF2D2D]" : "bg-[#242424]"
            )}>
                <div className={cn(
                    "w-3.5 h-3.5 bg-white rounded-full transition-all duration-500 shadow-md",
                    checked ? "translate-x-3.5" : "translate-x-0"
                )} />
            </div>
            <input type="checkbox" checked={checked || false} onChange={e => e.target.checked !== undefined && onChange(e.target.checked)} className="hidden" />
        </label>
    );
}

function BackupButton({ label, icon: Icon, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 p-4 bg-[#121212] border border-[#242424] rounded-xl text-slate-400 hover:text-white hover:border-[#FF2D2D]/50 transition-all group shadow-xl"
        >
            <div className="p-2 bg-[#090909] rounded-lg border border-[#242424] group-hover:text-[#FF2D2D] transition-colors">
                <Icon size={16} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#FF2D2D] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Initializing Secure Channel...</p>
            </div>
        }>
            <SettingsContent />
        </Suspense>
    );
}

const DEFAULT_SETTINGS = {
    app: {
        name: "ZivoTube",
        version: "1.0.0",
        latestVersionCode: 1,
        minSupportedVersion: 1,
        forceUpdate: false,
        optionalUpdate: false,
        maintenanceMode: false,
        registrationEnabled: true,
        showDemoContent: true
    },
    user: { registrationEnabled: true, oneDeviceOneAccount: true, multiAccountDetection: true, emailVerification: false, phoneVerification: false, autoBanSuspicious: true, dailyLoginRequired: true },
    coins: { signupBonus: 1000, dailyCheckIn: 50, referralBonus: 500, creatorBonus: 200, dailyLimit: 5000, dailyAdLimit: 2000, dailyTaskLimit: 2000, purchaseEnabled: true, transferEnabled: true, expiryEnabled: false },
    referral: { enabled: true, bonusAmount: 500, withdrawUnlockReq: 3, minActiveReferrals: 1, commissionPercent: 10, fraudProtection: true, selfReferralBlock: true, fakeDetection: true, milestoneRewards: true },
    withdrawal: { enabled: true, firstWithdrawalEnabled: true, firstWithdrawalAmount: 100, minCoins: 5000, maxCoins: 100000, dailyBudget: 10000, monthlyBudget: 500000, autoApproveLimit: 500, processingDays: 2, queueEnabled: true, priorityVip: true, manualReview: true },
    payments: {
        jazzcash: { enabled: true, min: 100, max: 25000, fee: 0, time: "24h" },
        easypaisa: { enabled: true, min: 100, max: 25000, fee: 0, time: "24h" },
        bank: { enabled: true, min: 1000, max: 100000, fee: 50, time: "48h" },
        payoneer: { enabled: true, min: 20, max: 5000, fee: 2, time: "72h" },
        paypal: { enabled: true, min: 10, max: 1000, fee: 1, time: "72h" }
    },
    ads: { enabled: true, rewardedEnabled: true, interstitialEnabled: true, nativeEnabled: true, bannerEnabled: true, openAppEnabled: true, rewardedCoins: 100, interstitialFreq: 5, nativeFreq: 10, dailyRewardedLimit: 20 },
    sponsoredAds: { enabled: true, inFeedEnabled: true, frequency: 10, approvalRequired: true, promotionPrice: 1000, featuredPrice: 500 },
    luckySpin: { enabled: true, dailyLimit: 5, cost: 100, bonusSpinReward: 1, cooldownHours: 4 },
    mysteryBox: { enabled: true, cost: 500, dailyLimit: 3, rewardRange: "100-5000", specialEvents: true },
    giftCode: { enabled: true, expiryEnabled: true, usageLimit: 100 },
    tasks: { dailyEnabled: true, weeklyEnabled: true, socialEnabled: true, creatorEnabled: true, approvalRequired: true, rewardMultiplier: 1, dailyLimit: 10 },
    creator: { programEnabled: true, verificationEnabled: true, levelsEnabled: true, revenueShare: 70, monetizationEnabled: true, analyticsEnabled: true },
    marketplace: { enabled: true, approvalRequired: true, featuredEnabled: true, battleEnabled: true, rankingEnabled: true, premiumEnabled: true, platformCommission: 30, creatorShare: 70 },
    store: { enabled: true, approvalRequired: true, commission: 30, featuredPrice: 500, digitalSupport: true, physicalSupport: false },
    vip: { enabled: true, monthlyPrice: 9.99, yearlyPrice: 99.99, doubleCoins: true, priorityWithdrawals: true, badge: true, extraTasks: true, premiumFeatures: true, creatorBoost: true },
    notifications: { pushEnabled: true, emailEnabled: true, withdrawal: true, task: true, creator: true, referral: true, vip: true },
    support: { email: "support@zivotube.com", whatsapp: "+1234567890", telegram: "@ZivoSupport", ticketEnabled: true, liveChatEnabled: false },
    security: { adminLoginRequired: true, twoFactor: false, sessionTimeout: 60, ipRestrictions: false, failedLoginProtection: true, adminLogs: true, userLogs: true },
    analytics: { firebaseEnabled: true, googleEnabled: true, revenueTracking: true, coinTracking: true, creatorAnalytics: true, withdrawalAnalytics: true, referralAnalytics: true },
    backup: { autoBackup: true }
};
