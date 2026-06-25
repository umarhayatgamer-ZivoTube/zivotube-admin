"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, ArrowRight, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (userDoc.exists() && userDoc.data().role === 'admin') {
        router.push("/dashboard");
      } else {
        await auth.signOut();
        setError("Access denied. You do not have admin permissions.");
      }
    } catch (err: any) {
      setError(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (userDoc.exists() && userDoc.data().role === 'admin') {
        router.push("/dashboard");
      } else {
        await auth.signOut();
        setError("Access denied. You do not have admin permissions.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] flex items-center justify-center p-6 selection:bg-[#FF2D2D]/30">
      <div className="w-full max-w-[440px]">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-[#FF2D2D] rounded-[22px] flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-red-900/50 mb-6">Z</div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Welcome <span className="text-[#FF2D2D]">Back</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Admin Control Terminal</p>
        </div>

        <div className="admin-card !p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF2D2D] to-transparent opacity-50"></div>

            <div className="space-y-4 mb-8">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-[#242424] disabled:opacity-50 shadow-xl"
                >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                    Continue with Google
                </button>
                <button className="w-full flex items-center justify-center gap-3 bg-[#090909] hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-[#242424]">
                    <ShieldCheck size={18} className="text-[#FF2D2D]" />
                    Identity Key Login
                </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-[#242424] flex-1"></div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">or transmission channel</span>
                <div className="h-px bg-[#242424] flex-1"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#FF2D2D] transition-colors" size={18} />
                        <input
                            required
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-[#090909] border border-[#242424] text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-[#FF2D2D] transition-all font-bold text-sm placeholder:text-slate-800 shadow-inner"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#FF2D2D] transition-colors" size={18} />
                        <input
                            required
                            type="password"
                            placeholder="Encryption Password"
                            className="w-full bg-[#090909] border border-[#242424] text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-[#FF2D2D] transition-all font-bold text-sm placeholder:text-slate-800 shadow-inner"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/5 border border-red-500/10 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                        <ShieldAlert size={18} />
                        {error}
                    </div>
                )}

                <button
                    disabled={loading}
                    className="w-full premium-button py-4"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                    ) : (
                        <>Authenticate</>
                    )}
                </button>
            </form>
        </div>

        <p className="mt-10 text-center text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">
            Authorized Personnel Only • Registry v2.0.4
        </p>
      </div>
    </div>
  );
}
