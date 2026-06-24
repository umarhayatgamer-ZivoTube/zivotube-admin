import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0">
           <h2 className="font-bold text-slate-800 text-lg uppercase tracking-wider">Command Center</h2>
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <p className="text-xs font-bold text-slate-900 leading-none">Super Admin</p>
                 <p className="text-[10px] text-slate-400 font-medium mt-1">zivotube-admin@internal.com</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
                 SA
              </div>
           </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
