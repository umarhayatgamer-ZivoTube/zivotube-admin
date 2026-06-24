import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save } from 'lucide-react';

export default function AppSettings() {
  const [settings, setSettings] = useState({
    minWithdrawalBronze: 500,
    coinValuePkr: 0.1,
    adIntervalSeconds: 30,
    maintenanceMode: false,
    appVersion: '1.0.0'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const docSnap = await getDoc(doc(db, "app_config", "main"));
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await setDoc(doc(db, "app_config", "main"), settings);
    alert("Settings saved successfully!");
    setLoading(false);
  };

  return (
    <Layout title="App Settings">
      <div className="max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-black mb-8 text-gray-900 border-b pb-4">Global Configuration</h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Min Withdrawal (Bronze)</label>
              <input type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition" value={settings.minWithdrawalBronze} onChange={e => setSettings({...settings, minWithdrawalBronze: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Coin Value (PKR)</label>
              <input type="number" step="0.01" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition" value={settings.coinValuePkr} onChange={e => setSettings({...settings, coinValuePkr: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Ad Interval (Seconds)</label>
            <input type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition" value={settings.adIntervalSeconds} onChange={e => setSettings({...settings, adIntervalSeconds: parseInt(e.target.value)})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
            <div>
                <p className="font-bold text-red-900 text-sm">Maintenance Mode</p>
                <p className="text-xs text-red-700">Prevent users from accessing the app</p>
            </div>
            <button
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`w-14 h-8 rounded-full transition relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="pt-6 border-t">
            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
