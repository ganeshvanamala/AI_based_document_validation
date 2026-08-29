import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus, History, Users, Settings, Shield } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen hidden md:flex sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <Shield className="text-navy-500 w-8 h-8" />
        <span className="text-xl font-bold text-white tracking-wide">IdentityGuard <span className="text-navy-500">AI</span></span>
      </div>
      
      <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Navigation</h3>
          <nav className="space-y-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem to="/screening/new" icon={<FilePlus size={20} />} label="New Screening" />
            <NavItem to="/history" icon={<History size={20} />} label="Screening History" />
            <NavItem to="/identities" icon={<Users size={20} />} label="Identity Records" />
          </nav>
        </div>
        
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">System</h3>
          <nav className="space-y-1">
            <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
          </nav>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
            SO
          </div>
          <div>
            <div className="text-sm font-medium text-white">Security Officer</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Online
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          isActive 
            ? 'bg-navy-900/50 text-navy-500 font-medium border border-navy-500/20' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
