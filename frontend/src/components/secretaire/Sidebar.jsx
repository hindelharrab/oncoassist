import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope,
  CalendarDays, Printer, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/secretaire/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/secretaire/patients',  icon: Users,           label: 'Patients' },
  { to: '/secretaire/medecins',  icon: Stethoscope,     label: 'Médecins' },
  { to: '/secretaire/planning',  icon: CalendarDays,    label: 'Planning & RDV' },
  { to: '/secretaire/print',     icon: Printer,         label: 'Imprimer dossier' },
  { to: '/secretaire/settings',  icon: Settings,        label: 'Paramètres' },
];

const NavItem = ({ to, icon: Icon, label, badge, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150 ${
        isActive
          ? 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white'
          : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-white'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-3.5">
          <Icon
            size={17}
            strokeWidth={isActive ? 2.3 : 1.8}
            className={`shrink-0 transition-colors duration-150 ${
              isActive
                ? 'text-pink-500'
                : 'group-hover:text-gray-700 dark:group-hover:text-white'
            }`}
          />
          <span className={`text-[13.5px] tracking-wide ${
            isActive
              ? 'font-bold text-gray-900 dark:text-white'
              : 'font-medium'
          }`}>
            {label}
          </span>
        </div>
        {badge && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

export default function SecretaireSidebar({ onClose }) {
  const navigate          = useNavigate();
  const { user, logout, getPhotoUrl } = useAuth();

  const photoUrl  = getPhotoUrl();
  const initiales =
    `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`
      .toUpperCase() || 'S';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[272px] h-full bg-white dark:bg-slate-950 border-r border-gray-100 dark:border-slate-800 flex flex-col select-none">

      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 cursor-pointer"
        onClick={() => {
          navigate('/secretaire/dashboard');
          onClose?.();
        }}
      >
        <div className="relative w-9 h-9 shrink-0">
          <svg width="36" height="36" viewBox="0 0 100 100"
            fill="none">
            <path
              d="M50 20C35 20 25 35 25 50C25 65 35 80 50 95C65 80 75 65 75 50C75 35 65 20 50 20Z"
              stroke="#EC4899" strokeWidth="8"
            />
            <path d="M35 88L50 68L65 88"
              stroke="#EC4899" strokeWidth="8" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-bold text-[9px] tracking-[0.4em] uppercase leading-none">
            ONCO
          </span>
          <div className="h-[2px] bg-pink-500 my-1 w-full" />
          <span className="text-gray-900 dark:text-white font-black text-[17px] tracking-tighter uppercase leading-none">
            ASSIST
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 dark:bg-slate-800 mb-3" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-4 pb-2.5">
          Menu
        </p>
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.to} {...item} onClick={onClose}
          />
        ))}
      </nav>

      <div className="w-full h-px bg-gray-100 dark:bg-slate-800 mt-3" />

      {/* Profil */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">

          {/* Photo ou initiales */}
          <div className="w-9 h-9 rounded-xl shrink-0 overflow-hidden">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profil"
                className="w-full h-full object-cover"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling
                    ?.style.setProperty('display', 'flex');
                }}
              />
            ) : null}
            <div
              className="w-9 h-9 rounded-xl bg-pink-500 items-center justify-center text-white text-[11px] font-black"
              style={{ display: photoUrl ? 'none' : 'flex' }}
            >
              {initiales}
            </div>
          </div>

          {/* Nom / rôle */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate leading-none">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              Secrétaire médicale
            </p>
          </div>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-colors shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}