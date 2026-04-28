import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SidebarGlobal from './SidebarGlobal';
import SidebarPatient from './SidebarPatient';

export default function Sidebar({ patientSelectionne, setPatientSelectionne }) {
  const { user, logout, getInitiales } = useAuth();

  return (
    <aside className="w-64 bg-white h-screen flex flex-col border-r border-gray-100 flex-shrink-0">

      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <img src="/favicon.svg" alt="OncoAssist" className="w-8 h-8" />
        <div className="flex flex-col leading-none">
          <span className="text-gray-400 font-bold text-[10px] tracking-widest uppercase">ONCO</span>
          <div className="h-[1px] bg-pink-400 w-full my-0.5"></div>
          <span className="text-gray-900 font-black text-lg tracking-tighter uppercase">ASSIST</span>
        </div>
      </div>

      {/* Contenu switchable */}
      <div className="flex-1 overflow-y-auto py-2">
        <AnimatePresence mode="wait">
          {!patientSelectionne ? (
            <motion.div
              key="global"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SidebarGlobal />
            </motion.div>
          ) : (
            <motion.div
              key="patient"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SidebarPatient
                patient={patientSelectionne}
                onRetour={() => setPatientSelectionne(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profil médecin */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
            <span className="text-pink-500 font-bold text-sm">
              {getInitiales()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">
              {user ? `Dr. ${user.prenom} ${user.nom}` : 'Dr. Médecin'}
            </p>
            <p className="text-[10px] text-gray-400 truncate">
              {user?.role === 'MEDECIN' ? 'Médecin' : user?.role ?? 'Sénologue'}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-pink-500 transition-colors"
            title="Se déconnecter"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

    </aside>
  );
}