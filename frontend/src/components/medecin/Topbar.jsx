import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getInitiales } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Tableau de bord';
    if (path.includes('patients')) return 'Mes Patients';
    if (path.includes('agenda')) return 'Agenda';
    if (path.includes('alertes')) return 'Alertes';
    if (path.includes('settings')) return 'Paramètres';
    if (path.includes('dossier')) return 'Dossier Patient';
    return 'OncoAssist';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nomComplet = user ? `Dr. ${user.prenom} ${user.nom}` : 'Dr. Médecin';
  const specialite = user?.role === 'MEDECIN' ? 'Médecin Sénologue' : user?.role ?? 'Oncologue';

  return (
    <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-30">

      {/* Titre page */}
      <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">
        {getTitle()}
      </h1>

      {/* Droite */}
      <div className="flex items-center gap-6">

        {/* Barre de recherche */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-pink-100 transition-all">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un patient..."
            className="bg-transparent outline-none text-sm text-gray-600 flex-1"
          />
        </div>

        {/* Cloche notification */}
        <div className="relative">
          <button className="text-gray-500 hover:text-pink-500 transition-colors p-1">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold text-sm hover:ring-2 hover:ring-pink-200 transition-all"
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
                className="absolute right-0 top-12 bg-white shadow-xl rounded-2xl border border-gray-100 w-64 p-2 z-50 origin-top-right"
              >
                {/* Header dropdown */}
                <div className="p-4 flex flex-col items-center border-b border-gray-50 mb-1">
                  <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold text-xl mb-3">
                    {getInitiales()}
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{nomComplet}</p>
                  <p className="text-[10px] text-gray-400 font-medium mb-2">{specialite}</p>
                  <div className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-full ring-1 ring-green-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-[10px] font-bold text-green-600">En ligne</span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => { navigate('/medecin/settings'); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium"
                >
                  <Settings size={18} className="text-gray-400" />
                  <span>Paramètres</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors text-sm text-gray-600 font-medium"
                >
                  <LogOut size={18} className="text-gray-400" />
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