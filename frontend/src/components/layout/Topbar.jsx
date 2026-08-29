import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export default function Topbar({ title }) {
  return (
    <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-white">{title || "Dashboard"}</h1>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search cases, IDs..." 
            className="bg-slate-800 border border-slate-700 text-sm rounded-full pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500 w-64 transition-all"
          />
        </div>
        
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>
        
        <button className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
