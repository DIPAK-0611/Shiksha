import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const getTitleFromPath = (path: string) => {
  if (path.startsWith('/students/')) return 'Student Profile';
  const name = path.substring(1);
  return name.charAt(0).toUpperCase() + name.slice(1) || 'Dashboard';
};

export function Topbar() {
  const location = useLocation();
  const title = getTitleFromPath(location.pathname);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>
        <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
}
