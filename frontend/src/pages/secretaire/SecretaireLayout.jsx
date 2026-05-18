import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/secretaire/Sidebar';
import Topbar from '../../components/secretaire/Topbar';
import { useSettings } from '../../context/SettingsContext';

export default function SecretaireLayout() {
  const { theme } = useSettings();

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${
      theme === 'sombre' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-5 lg:px-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}