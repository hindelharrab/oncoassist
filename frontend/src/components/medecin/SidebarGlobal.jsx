import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  FolderOpen,
  ClipboardList,
  Settings,
  LogOut
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, children, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl mx-2 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 font-semibold border-l-2 border-pink-400'
          : 'text-gray-500 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:text-pink-500 dark:hover:text-pink-400'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={18} className={isActive ? 'text-pink-500' : 'text-gray-400 dark:text-gray-500'} />
        <span className="flex-1">{children}</span>
        {badge && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

const GroupLabel = ({ children }) => (
  <p className="px-4 mt-6 mb-2 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
    {children}
  </p>
);

export default function SidebarGlobal() {
  const { logout } = useAuth();

  return (
    <nav className="flex flex-col space-y-1">

      <GroupLabel>Vue Générale</GroupLabel>
      <NavItem to="/medecin/dashboard" icon={LayoutDashboard}>Tableau de bord</NavItem>
      <NavItem to="/medecin/patients" icon={Users}>Mes Patients</NavItem>
      <NavItem to="/medecin/agenda" icon={Calendar}>Agenda</NavItem>

      <GroupLabel>Clinique</GroupLabel>
      <NavItem to="/medecin/alertes" icon={Bell} badge="3">Alertes</NavItem>
      {/* On utilise /medecin/dossiers pour éviter que ça se coche en même temps que /medecin/patients */}
      <NavItem to="/medecin/dossiers" icon={FolderOpen}>Dossiers médicaux</NavItem>

      <GroupLabel>Compte</GroupLabel>
      <NavItem to="/medecin/settings" icon={Settings}>Paramètres</NavItem>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:text-pink-500 dark:hover:text-pink-400 transition-all duration-200 text-sm mt-4"
      >
        <LogOut size={18} className="text-gray-400 dark:text-gray-500" />
        <span className="font-medium">Déconnexion</span>
      </button>

    </nav>
  );
}
