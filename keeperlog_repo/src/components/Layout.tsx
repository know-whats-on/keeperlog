import React from 'react';
import { NavLink, Outlet } from 'react-router';
import { Home, Plus, BookOpen, Settings, Download, List, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { Toaster } from 'sonner@2.0.3';
import { useOnlineStatus } from '../lib/storage';

export function Layout() {
  const isOnline = useOnlineStatus();

  return (
    <div className="flex flex-col h-screen bg-stone-950 text-stone-100 font-sans selection:bg-emerald-500/30">
      <header className="bg-stone-950 border-b border-stone-800 p-4 z-10 sticky top-0">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-stone-200">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <h1 className="text-lg font-bold tracking-tight">KeeperLog</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
               <div className="flex items-center gap-1.5 bg-stone-800 px-2 py-1 rounded-full border border-stone-700">
                 <WifiOff className="h-3 w-3 text-stone-400" />
                 <span className="text-[10px] font-medium text-stone-400">Offline</span>
               </div>
            )}
            <div className={`h-2 w-2 rounded-full animate-pulse ${isOnline ? 'bg-emerald-500' : 'bg-stone-500'}`} title={isOnline ? "Online" : "Offline"} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-12">
        <div className="max-w-xl mx-auto">
          <Outlet />
        </div>
      </main>

      <nav className="bg-stone-900/95 backdrop-blur-md border-t border-stone-800 safe-area-bottom z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-20 px-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-emerald-400" : "text-stone-500 hover:text-stone-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Home className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Home</span>
              </>
            )}
          </NavLink>
          
          <NavLink
            to="/logs"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-emerald-400" : "text-stone-500 hover:text-stone-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                <List className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Logs</span>
              </>
            )}
          </NavLink>
          
          <NavLink
            to="/add"
            className="flex flex-col items-center justify-center -mt-8"
          >
            <div className="bg-emerald-600 h-14 w-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/50 border-4 border-stone-950 active:scale-95 transition-transform">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <span className="text-[10px] font-medium text-stone-400 mt-1">Capture</span>
          </NavLink>
          
          <NavLink
            to="/export"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-emerald-400" : "text-stone-500 hover:text-stone-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Download className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Export</span>
              </>
            )}
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-emerald-400" : "text-stone-500 hover:text-stone-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Settings className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Settings</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
