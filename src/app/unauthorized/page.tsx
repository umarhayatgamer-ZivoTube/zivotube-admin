'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center p-6 selection:bg-[#FF2D2D]/30">
      <div className="bg-[#121212] border border-[#242424] rounded-[40px] p-12 max-w-md w-full shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF2D2D] to-transparent opacity-50"></div>
        
        <div className="mx-auto w-24 h-24 bg-red-500/5 rounded-[32px] border border-red-500/10 flex items-center justify-center mb-8 shadow-inner">
          <ShieldAlert className="text-[#FF2D2D]" size={48} />
        </div>
        
        <h1 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">Access <span className="text-[#FF2D2D]">Blocked</span></h1>
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-10 leading-relaxed">
            Insufficient clearance detected. Your identity hash does not grant access to the ZivoTube Command Center.
        </p>

        <button
          onClick={() => router.push('/login')}
          className="w-full bg-white hover:bg-slate-100 text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group shadow-xl"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform duration-300" />
          Re-Authenticate
        </button>

        <p className="mt-8 text-[9px] font-black text-slate-700 uppercase tracking-widest">Incident logged on mainnet ledger</p>
      </div>
    </div>
  );
}
