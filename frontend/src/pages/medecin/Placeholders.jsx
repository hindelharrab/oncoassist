import { motion } from 'framer-motion';
import { Calendar, Bell, Settings } from 'lucide-react';

const PlaceholderPage = ({ title, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="h-full flex items-center justify-center p-6"
  >
    <div className="bg-white rounded-[2rem] p-12 shadow-xl border border-gray-100 max-w-md w-full flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center text-pink-500 mb-6 shadow-inner ring-1 ring-pink-100">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight">
        {title}
      </h2>
      <p className="text-gray-400 font-medium mb-8">
        Cette section est en cours de développement. Revenez bientôt pour découvrir de nouvelles fonctionnalités.
      </p>
      <div className="flex gap-2">
        <div className="w-2 h-2 bg-pink-200 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-150"></div>
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-300"></div>
      </div>
    </div>
  </motion.div>
);

export const AgendaPage    = () => <PlaceholderPage title="Agenda"      icon={Calendar} />;
export const AlertesPage   = () => <PlaceholderPage title="Alertes"     icon={Bell}     />;
export const SettingsPage  = () => <PlaceholderPage title="Paramètres"  icon={Settings} />;