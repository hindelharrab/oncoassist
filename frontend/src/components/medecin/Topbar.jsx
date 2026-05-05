import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ recherche, setRecherche }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getInitiales } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Résultat analyse critique', time: '10 min', unread: true },
    { id: 2, title: 'Questionnaire post-op', time: '2 h', unread: true },
    { id: 3, title: 'Nouveau document patient', time: '5 h', unread: false },
    { id: 4, title: 'Rendez-vous annulé', time: '1 j', unread: false },
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nomComplet = user ? `Dr. ${user.prenom} ${user.nom}` : 'Dr. Médecin';
  const specialite = user?.role === 'MEDECIN' ? 'Médecin Sénologue' : user?.role ?? 'Oncologue';

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 h-16 flex items-center justify-between sticky top-0 z-30 transition-colors">

      {/* Titre page */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
          {location.pathname.includes('patients') ? 'Mes Patientes' : 
            location.pathname.includes('dossiers') ? 'Dossiers médicaux' :
            location.pathname.includes('dashboard') ? 'Tableau de Bord' : 
            location.pathname.includes('agenda') ? 'Agenda' :
            location.pathname.includes('alertes') ? 'Alertes' :
            location.pathname.includes('questionnaires') ? 'Questionnaires' :
            location.pathname.includes('settings') ? 'Paramètres' : 
            location.pathname.includes('dossier') ? 'Dossier Patient' : 'OncoAssist'}
        </h1>
      </div>

      {/* Droite */}
      <div className="flex items-center gap-6">

        {/* Barre de recherche */}
        <div className="hidden md:flex items-center gap-2 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-700/50 rounded-lg px-3 py-1.5 w-64 focus-within:border-pink-300 dark:focus-within:border-pink-500 transition-all shadow-sm">
          <Search size={14} className="text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une patiente..."
            className="bg-transparent outline-none text-xs font-semibold text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 flex-1"
          />
        </div>

        {/* Cloche notification */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="text-gray-500 hover:text-pink-500 transition-colors p-1"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 top-12 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800 w-80 p-2 z-50 origin-top-right text-gray-900 dark:text-white"
              >
                <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between mb-2">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-900 dark:text-white">Notifications</h3>
                  <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-[9px] px-2 py-0.5 rounded-full font-black">{unreadCount} NON LUES</span>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-1">
                  {notifications.map((notif) => (
                    <button 
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all group flex items-start gap-3 ${notif.unread ? 'bg-pink-50/30 dark:bg-pink-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${notif.unread ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                      <div>
                        <p className={`text-xs font-bold leading-tight mb-1 ${notif.unread ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 font-medium'}`}>{notif.title}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold">{notif.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                  <button 
                    onClick={() => { navigate('/medecin/alertes'); setShowNotifDropdown(false); }}
                    className="w-full py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/10 rounded-xl transition-all"
                  >
                    Voir toutes les alertes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center text-pink-500 dark:text-pink-400 font-bold text-sm hover:ring-2 hover:ring-pink-200 dark:hover:ring-pink-800 transition-all"
          >
            {getInitiales()}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800 w-64 p-2 z-50 origin-top-right scale-100"
              >
                {/* Header dropdown */}
                <div className="p-4 flex flex-col items-center border-b border-gray-50 dark:border-gray-800 mb-1">
                  <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center text-pink-500 dark:text-pink-400 font-bold text-xl mb-3">
                    {getInitiales()}
                  </div>
                  <p className="font-bold text-gray-800 dark:text-white text-base">{nomComplet}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mb-2">{specialite}</p>
                  <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/10 px-2.5 py-0.5 rounded-full ring-1 ring-green-100 dark:ring-green-900/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-[11px] font-bold text-green-600 dark:text-green-400">En ligne</span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => { navigate('/medecin/settings'); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-400 font-medium"
                >
                  <Settings size={18} className="text-gray-400 dark:text-gray-500" />
                  <span>Paramètres</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm text-gray-600 dark:text-gray-400 font-medium"
                >
                  <LogOut size={18} className="text-gray-400 dark:text-gray-500" />
                  <span>Se déconnecter</span>
                </button>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
