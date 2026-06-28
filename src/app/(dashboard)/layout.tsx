"use client";

import { Sidebar } from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu } from "lucide-react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { toggleMobile } = useSidebar();

  return (
    <div className="flex h-screen bg-white dark:bg-[#090909] overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar takes its fixed width */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Dark Premium Header */}
        <header className="h-16 bg-white dark:bg-[#090909] border-b border-slate-200 dark:border-[#242424] flex items-center justify-between px-4 sm:px-6 z-20 flex-shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Menu Button - Visible on lg and below */}
            <button
              onClick={toggleMobile}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95"
              aria-label="Toggle Menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-black text-white text-base sm:text-lg tracking-tighter uppercase leading-none">Command Center</h2>
                <div className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[8px] font-black text-red-500 tracking-tighter">
                  V1.0.6
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <p className="text-[7px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-widest">Mainnet Infrastructure v2.0</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <ThemeToggle />
            <div className="h-8 w-px bg-slate-200 dark:bg-[#242424] hidden sm:block" />
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none uppercase tracking-wider">Super Admin</p>
              <p className="text-[8px] text-red-500 font-bold mt-0.5 uppercase tracking-tight">Access Level: 0</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 border border-white/10 shadow-lg flex items-center justify-center text-white font-black text-sm">
              SA
            </div>
          </div>
        </header>

        {/* Page Content with scroll */}
        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 dark:bg-[#090909] transition-colors duration-300">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </AuthGuard>
  );
}
