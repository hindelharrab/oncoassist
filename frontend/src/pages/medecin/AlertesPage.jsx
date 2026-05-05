import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Clock, 
  Search, 
  Filter,
  MoreHorizontal,
  ChevronRight,
  ExternalLink,
  Archive,
  Eye
} from 'lucide-react';

const AlertesPage = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'critical',
      title: 'Résultat d\'analyse critique',
      patient: 'Houda El Amrani',
      message: 'Le rapport de biopsie (ID: #4582) indique une progression nécessitant une revue immédiate et ajustement du traitement.',
      time: 'Il y a 10 minutes',
      unread: true
    },
    {
      id: 2,
      type: 'warning',
      title: 'Questionnaire post-opératoire alertant',
      patient: 'Karima Mansouri',
      message: 'La patiente signale une douleur inhabituelle (échelle 8/10) après sa séance de kinésithérapie.',
      time: 'Il y a 2 heures',
      unread: true
    },
    {
      id: 3,
      type: 'info',
      title: 'Rapport d\'imagerie importé',
      patient: 'Sara Berrada',
      message: 'Un nouvel examen IRM a été importé automatiquement depuis le centre de radiologie partenaire.',
      time: 'Il y a 5 heures',
      unread: false
    },
    {
      id: 4,
      type: 'success',
      title: 'Validation RCP obtenue',
      patient: 'Salma Tazi',
      message: 'Le plan de traitement personnalisé a été validé lors de la Réunion de Concertation Pluridisciplinaire.',
      time: 'Hier, 16:45',
      unread: false
    }
  ]);

  const markAsRead = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, unread: false } : a));
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'unread' ? alert.unread : true;
    const matchesSearch = alert.patient.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         alert.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = alerts.filter(a => a.unread).length;

  return (
    <div className="h-full flex flex-col font-inter bg-white dark:bg-gray-950 p-2 lg:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full overflow-hidden">
        
        {/* Professional Medical Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Bell size={24} className="text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                Centre de Notifications
                {unreadCount > 0 && (
                  <span className="bg-black dark:bg-white text-white dark:text-black text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{unreadCount} nouveaux</span>
                )}
              </h1>
              <p className="text-gray-400 dark:text-gray-500 text-[11px] font-medium mt-0.5 uppercase tracking-widest">Surveillance des dossiers et événements cliniques</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text"
                placeholder="Rechercher une alerte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-lg text-xs font-medium focus:bg-white focus:border-gray-200 transition-all outline-none w-64"
              />
            </div>
          </div>
        </div>

        {/* Categories Filters bar */}
        <div className="px-8 py-3 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded transition-all ${filter === 'all' ? 'text-gray-900 dark:text-white underline' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Toutes
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded transition-all ${filter === 'unread' ? 'text-gray-900 dark:text-white underline' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Non lues
            </button>
          </div>
        </div>

        {/* Professional Alert List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
          {filteredAlerts.length > 0 ? (
            <div className="grid grid-cols-1 gap-px bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
              <AnimatePresence>
                {filteredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`bg-white dark:bg-gray-900 group relative flex items-start gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all ${alert.unread ? 'border-l-4 border-l-black dark:border-l-white ml-[-4px]' : ''}`}
                  >
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                      alert.type === 'critical' ? 'bg-rose-50 text-rose-600' :
                      alert.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                      alert.type === 'info' ? 'bg-sky-50 text-sky-600' : 
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {alert.type === 'critical' && <AlertCircle size={20} />}
                      {alert.type === 'warning' && <Bell size={20} />}
                      {alert.type === 'info' && <Info size={20} />}
                      {alert.type === 'success' && <CheckCircle2 size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <h3 className={`text-sm font-bold tracking-tight ${alert.unread ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            {alert.title}
                          </h3>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400">{alert.time}</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <p className={`text-[13px] leading-relaxed max-w-2xl ${alert.unread ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}>
                          Patiente : <span className={`font-bold ${alert.unread ? 'text-gray-900 dark:text-white underline' : ''}`}>{alert.patient}</span> — {alert.message}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex items-center gap-1.5 text-[10px] font-bold text-sky-600 uppercase tracking-wider hover:underline">
                            <Eye size={12} /> Réviser Dossier
                          </button>
                          <button 
                            onClick={() => markAsRead(alert.id)}
                            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-900"
                          >
                            Marquer lu
                          </button>
                          <button 
                            onClick={() => deleteAlert(alert.id)}
                            className="text-[10px] font-bold text-rose-400 uppercase tracking-wider hover:text-rose-600 flex items-center gap-1"
                          >
                            <Archive size={12} /> Archiver
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
              <Bell size={48} className="text-gray-200 mb-4" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Aucune alerte correspondante</p>
            </div>
          )}
        </div>

        <div className="px-8 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/20 text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center">
          Système de Monitoring clinique — v2.4.0 — Dernière synchro: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default AlertesPage;

