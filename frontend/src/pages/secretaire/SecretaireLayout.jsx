import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Plus, Menu, X } from 'lucide-react';
import SecretaireSidebar from '../../components/secretaire/Secretairesidebar';

/* ════════════════════════════════════════
   HEADER
═══════════════════════════════════════ */
const TopBar = ({ onMenuToggle }) => {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0">

      {/* Gauche */}
      <div className="flex items-center gap-4">
        {/* Burger mobile */}
        <button
          className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          onClick={onMenuToggle}
        >
          <Menu size={18} />
        </button>

        {/* Date */}
        <div>
          <p className="text-[13px] font-semibold text-gray-800 leading-none">{todayLabel}</p>
          <p className="text-[10px] text-gray-400 tracking-widest uppercase font-medium mt-0.5">
            Espace Secrétaire — Oncologie
          </p>
        </div>
      </div>

      {/* Droite */}
      <div className="flex items-center gap-3">

        {/* Recherche */}
        <div className="hidden md:flex items-center gap-2 h-9 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:border-pink-300 transition-colors cursor-pointer group">
          <Search size={14} className="group-hover:text-pink-500 transition-colors" />
          <span className="text-[12px] font-medium">Rechercher…</span>
        </div>

        {/* Cloche notifications */}
        <NavLink
          to="/secretaire/notifications"
          className="relative w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200 transition-all"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white" />
        </NavLink>

        {/* Bouton action rapide */}
        <NavLink
          to="/secretaire/patients"
          className="hidden md:flex items-center gap-2 h-9 px-4 bg-black text-white rounded-xl text-[12px] font-bold hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={14} />
          Nouveau patient
        </NavLink>
      </div>
    </header>
  );
};

/* ════════════════════════════════════════
   LAYOUT PRINCIPAL
═══════════════════════════════════════ */
export default function SecretaireLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">

      {/* ── Sidebar desktop ── */}
      <div className="hidden lg:flex shrink-0">
        <SecretaireSidebar />
      </div>

      {/* ── Sidebar mobile (drawer) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <div className="relative h-full">
                <SecretaireSidebar onClose={() => setSidebarOpen(false)} />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-[-40px] w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Zone principale ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuToggle={() => setSidebarOpen(true)} />

        {/* Contenu page */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}