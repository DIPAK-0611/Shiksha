import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, ShieldCheck, Settings, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', path: '/students', icon: Users },
  { name: 'Progress', path: '/progress', icon: Activity },
  { name: 'Fairness', path: '/fairness', icon: ShieldCheck },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const { profile } = useUser();
  const initials = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DM';

  return (
    <div className="w-56 bg-slate-50 border-r border-slate-300 h-screen flex flex-col sticky top-0">
      <div className="h-14 flex items-center px-4 border-b border-slate-300">
        <GraduationCap className="h-5 w-5 text-slate-700 mr-2" />
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 text-sm leading-tight">ShikshaSetu</span>
        </div>
      </div>
      
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center px-4 py-1.5 text-sm transition-colors",
              isActive 
                ? "bg-blue-100/50 text-blue-900 font-medium border-r-2 border-blue-700" 
                : "text-slate-700 hover:bg-slate-200/50"
            )}
          >
            <item.icon className="h-4 w-4 mr-2 flex-shrink-0 text-slate-500" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-3 border-t border-slate-300 bg-slate-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-6 w-6 rounded bg-slate-300 flex items-center justify-center text-slate-700 font-medium text-xs">
              {initials}
            </div>
            <div className="ml-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-[100px]">
              <p className="text-xs font-medium text-slate-800 truncate">{profile.name}</p>
              <p className="text-[10px] text-slate-500 leading-tight truncate">{profile.role}</p>
            </div>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-slate-500 hover:text-slate-800 underline pr-1"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
