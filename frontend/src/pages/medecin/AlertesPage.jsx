import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertCircle, CheckCircle2, Info, Search, Eye, Archive,
  Activity, Calendar, ShieldAlert, FileText, ClipboardList,
  Zap, Target, X, Clock, ChevronRight, Filter, Inbox,
  Stethoscope, FileSearch, UserPlus, AlertTriangle, Brain,
  CalendarClock, CalendarX, CalendarCheck, FilePlus, MessageSquareWarning,
  CheckCheck, Trash2
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   CONFIG : CATÉGORIES & TYPES DE NOTIFICATIONS
   ───────────────────────────────────────────────────────── */

const CATEGORIES = {
  ia: {
    label: 'Examens IA',
    icon: Brain,
    color: 'pink',
    accent: 'text-pink-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    dark: 'dark:bg-pink-950/30 dark:border-pink-900/40 dark:text-pink-400'
  },
  rdv: {
    label: 'Rendez-vous',
    icon: Calendar,
    color: 'sky',
    accent: 'text-sky-500',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    dark: 'dark:bg-sky-950/30 dark:border-sky-900/40 dark:text-sky-400'
  },
  clinique: {
    label: 'Alertes Cliniques',
    icon: ShieldAlert,
    color: 'rose',
    accent: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    dark: 'dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400'
  },
  dossier: {
    label: 'Dossiers Patients',
    icon: ClipboardList,
    color: 'violet',
    accent: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    dark: 'dark:bg-violet-950/30 dark:border-violet-900/40 dark:text-violet-400'
  },
  quest: {
    label: 'Questionnaires',
    icon: FileSearch,
    color: 'amber',
    accent: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dark: 'dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-400'
  }
};

const PRIORITES = {
  CRITIQUE: { label: 'Critique', dot: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  HAUTE:    { label: 'Haute',    dot: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  NORMALE:  { label: 'Normale',  dot: 'bg-sky-500', text: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
  INFO:     { label: 'Info',     dot: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' }
};

/* ─────────────────────────────────────────────────────────
   DONNÉES MOCK
   ───────────────────────────────────────────────────────── */

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    categorie: 'ia',
    icon: Zap,
    priorite: 'CRITIQUE',
    title: 'BI-RADS 5 détecté — Suspicion de malignité',
    patient: 'Houda El Amrani',
    patientId: 'P-4582',
    message: "L'analyse IA EfficientNet-B3 a classé la mammographie en BI-RADS 5 avec une confiance de 94.2%. Biopsie urgente recommandée.",
    metadata: { score: '94.2%', model: 'EfficientNet-B3', quadrant: 'QSE Droit' },
    time: 'Il y a 10 min',
    timestamp: Date.now() - 600000,
    unread: true,
    cta: 'Ouvrir le rapport IA'
  },
  {
    id: 2,
    categorie: 'rdv',
    icon: CalendarClock,
    priorite: 'NORMALE',
    title: 'Nouvelle demande de rendez-vous',
    patient: 'Karima Mansouri',
    patientId: 'P-3201',
    message: "La patiente souhaite un RDV de contrôle post-opératoire. Créneau demandé : Mardi 21 mai, 14h00.",
    metadata: { motif: 'Contrôle post-op', date: '21/05/2026 14:00' },
    time: 'Il y a 32 min',
    timestamp: Date.now() - 1920000,
    unread: true,
    cta: 'Valider le RDV'
  },
  {
    id: 3,
    categorie: 'clinique',
    icon: ShieldAlert,
    priorite: 'CRITIQUE',
    title: 'Patiente BI-RADS 5 sans suivi depuis 14 jours',
    patient: 'Sara Berrada',
    patientId: 'P-2876',
    message: "Aucune consultation ni biopsie enregistrée depuis le diagnostic du 02/05/2026. Action immédiate requise.",
    metadata: { jours: '14 jours', dernierExamen: '02/05/2026' },
    time: 'Il y a 2 h',
    timestamp: Date.now() - 7200000,
    unread: true,
    cta: 'Contacter la patiente'
  },
  {
    id: 4,
    categorie: 'ia',
    icon: Activity,
    priorite: 'HAUTE',
    title: 'BI-RADS 4B — Lésion suspecte',
    patient: 'Salma Tazi',
    patientId: 'P-4120',
    message: "Heatmap GradCAM générée. Zone d'attention localisée dans le quadrant supéro-externe gauche.",
    metadata: { score: '78.5%', quadrant: 'QSE Gauche' },
    time: 'Il y a 3 h',
    timestamp: Date.now() - 10800000,
    unread: true,
    cta: 'Visualiser la heatmap'
  },
  {
    id: 5,
    categorie: 'quest',
    icon: MessageSquareWarning,
    priorite: 'HAUTE',
    title: 'Réponses inquiétantes détectées',
    patient: 'Fatima Bennani',
    patientId: 'P-3654',
    message: "La patiente signale une douleur 8/10 et une masse palpable à l'auto-examen. Questionnaire de suivi à réviser.",
    metadata: { douleur: '8/10', masse: 'Palpable' },
    time: 'Il y a 4 h',
    timestamp: Date.now() - 14400000,
    unread: true,
    cta: 'Lire le questionnaire'
  },
  {
    id: 6,
    categorie: 'rdv',
    icon: CalendarCheck,
    priorite: 'INFO',
    title: 'RDV confirmé par la secrétaire',
    patient: 'Nadia Cherkaoui',
    patientId: 'P-2945',
    message: "Le rendez-vous du 18/05/2026 à 10h30 a été confirmé. Type : consultation de suivi.",
    metadata: { date: '18/05/2026 10:30', type: 'Suivi' },
    time: 'Il y a 5 h',
    timestamp: Date.now() - 18000000,
    unread: false,
    cta: 'Voir l\'agenda'
  },
  {
    id: 7,
    categorie: 'clinique',
    icon: FilePlus,
    priorite: 'HAUTE',
    title: 'Résultats de biopsie disponibles',
    patient: 'Amina Idrissi',
    patientId: 'P-3987',
    message: "Compte-rendu anatomopathologique reçu — Carcinome canalaire infiltrant grade SBR II.",
    metadata: { type: 'CCI', grade: 'SBR II' },
    time: 'Hier, 17:24',
    timestamp: Date.now() - 86400000,
    unread: false,
    cta: 'Consulter la biopsie'
  },
  {
    id: 8,
    categorie: 'dossier',
    icon: UserPlus,
    priorite: 'INFO',
    title: 'Nouveau patient assigné',
    patient: 'Leila Ouazzani',
    patientId: 'P-4612',
    message: "Patiente transférée depuis le centre régional. Dossier complet disponible avec historique 2024-2026.",
    metadata: { age: '52 ans', source: 'CHU Rabat' },
    time: 'Hier, 14:10',
    timestamp: Date.now() - 90000000,
    unread: false,
    cta: 'Ouvrir le dossier'
  },
  {
    id: 9,
    categorie: 'rdv',
    icon: CalendarX,
    priorite: 'NORMALE',
    title: 'RDV annulé par la patiente',
    patient: 'Houria Lamrini',
    patientId: 'P-3122',
    message: "Le RDV du 17/05/2026 à 09h00 a été annulé. Raison : indisponibilité personnelle.",
    metadata: { date: '17/05/2026 09:00' },
    time: 'Hier, 11:30',
    timestamp: Date.now() - 100000000,
    unread: false,
    cta: 'Reprogrammer'
  },
  {
    id: 10,
    categorie: 'dossier',
    icon: FileText,
    priorite: 'INFO',
    title: 'Antécédents médicaux mis à jour',
    patient: 'Zineb Alaoui',
    patientId: 'P-2734',
    message: "La secrétaire a ajouté 2 nouveaux antécédents familiaux (mère — cancer du sein, 48 ans).",
    metadata: { ajouts: '2 antécédents', par: 'Secr. Yasmine' },
    time: '2 jours',
    timestamp: Date.now() - 172800000,
    unread: false,
    cta: 'Réviser les antécédents'
  }
];

/* ─────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL
   ───────────────────────────────────────────────────────── */

const AlertesPage = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeCategorie, setActiveCategorie] = useState('all');
  const [activePriorite, setActivePriorite] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  /* ─── Statistiques ─── */
  const stats = useMemo(() => {
    const unread = notifications.filter(n => n.unread).length;
    const critiques = notifications.filter(n => n.priorite === 'CRITIQUE' && n.unread).length;
    // eslint-disable-next-line react-hooks/purity
    const aujourdhui = notifications.filter(n => Date.now() - n.timestamp < 86400000).length;
    const parCategorie = Object.keys(CATEGORIES).reduce((acc, cat) => {
      acc[cat] = notifications.filter(n => n.categorie === cat && n.unread).length;
      return acc;
    }, {});
    return { unread, critiques, aujourdhui, parCategorie, total: notifications.length };
  }, [notifications]);

  /* ─── Filtrage ─── */
  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (activeCategorie !== 'all' && n.categorie !== activeCategorie) return false;
      if (activePriorite !== 'all' && n.priorite !== activePriorite) return false;
      if (showUnreadOnly && !n.unread) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(q) ||
               n.patient.toLowerCase().includes(q) ||
               n.message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notifications, activeCategorie, activePriorite, showUnreadOnly, searchQuery]);

  /* ─── Actions ─── */
  const markAsRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  const deleteNotif = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const selected = notifications.find(n => n.id === selectedId);

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-white">
      <div className="p-3 lg:p-6 max-w-[1700px] mx-auto space-y-6 font-sans">

        {/* ═══════════ HEADER ═══════════ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center relative">
              <Bell size={20} className="text-pink-500" strokeWidth={2.5} />
              {stats.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center border-2 border-white dark:border-black">
                  {stats.unread}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-black tracking-tight uppercase">
                Centre de Notifications
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  Surveillance Clinique en Temps Réel
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher patient, alerte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold placeholder:text-slate-400 outline-none focus:border-pink-400 transition-all w-64 shadow-sm"
              />
            </div>
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-950 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              <CheckCheck size={14} />
              Tout marquer lu
            </button>
          </div>
        </div>

        {/* ═══════════ GRID PRINCIPAL ═══════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* ─────── SIDEBAR CATÉGORIES ─────── */}
          <div className="xl:col-span-3">
            <div className="rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">

              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-pink-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Catégories</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[8px] font-black uppercase tracking-widest">
                  {filtered.length}
                </span>
              </div>

              {/* Liste catégories */}
              <div className="p-3 space-y-1.5">
                {/* Toutes */}
                <button
                  onClick={() => setActiveCategorie('all')}
                  className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all ${
                    activeCategorie === 'all'
                      ? 'bg-slate-950 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeCategorie === 'all' ? 'bg-white/10' : 'bg-white dark:bg-slate-800'
                    }`}>
                      <Inbox size={14} className={activeCategorie === 'all' ? 'text-white' : 'text-slate-500'} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Toutes</span>
                  </div>
                  <span className={`text-[9px] font-black tabular-nums ${
                    activeCategorie === 'all' ? 'text-white/70' : 'text-slate-400'
                  }`}>
                    {notifications.length}
                  </span>
                </button>

                {/* Catégories */}
                {Object.entries(CATEGORIES).map(([key, cat]) => {
                  const Icon = cat.icon;
                  const count = stats.parCategorie[key] || 0;
                  const isActive = activeCategorie === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCategorie(key)}
                      className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-slate-950 text-white shadow-md'
                          : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-white/10' : cat.bg
                        }`}>
                          <Icon size={14} className={isActive ? 'text-white' : cat.accent} strokeWidth={2.3} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest truncate">
                          {cat.label}
                        </span>
                      </div>
                      {count > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black tabular-nums shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-pink-500 text-white'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Filtres priorité */}
              <div className="px-3 pb-3 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 mb-2">
                  Priorité
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setActivePriorite('all')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      activePriorite === 'all'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <span>Tous niveaux</span>
                  </button>
                  {Object.entries(PRIORITES).map(([key, prio]) => (
                    <button
                      key={key}
                      onClick={() => setActivePriorite(key)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${
                        activePriorite === key
                          ? 'bg-slate-100 dark:bg-slate-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                          {prio.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle non-lues */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                    Non lues seulement
                  </span>
                  <button
                    onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      showUnreadOnly ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                      showUnreadOnly ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </label>
              </div>

            </div>
          </div>

          {/* ─────── LISTE NOTIFICATIONS ─────── */}
          <div className={`${selected ? 'xl:col-span-5' : 'xl:col-span-9'} transition-all duration-300`}>
            <div className="rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">

              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-pink-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">
                    {activeCategorie === 'all' ? 'Toutes les notifications' : CATEGORIES[activeCategorie].label}
                  </h3>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest tabular-nums">
                  {filtered.length} résultats
                </span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filtered.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300">
                      <Bell size={28} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                      Aucune notification<br />ne correspond aux filtres
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filtered.map((notif) => {
                      const cat = CATEGORIES[notif.categorie];
                      const prio = PRIORITES[notif.priorite];
                      const Icon = notif.icon;
                      const isSelected = selectedId === notif.id;

                      return (
                        <motion.div
                          key={notif.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => { setSelectedId(notif.id); markAsRead(notif.id); }}
                          className={`group relative cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-all ${
                            isSelected
                              ? 'bg-pink-50/40 dark:bg-pink-950/10'
                              : notif.unread
                                ? 'bg-white dark:bg-slate-950 hover:bg-slate-50/80 dark:hover:bg-slate-900/40'
                                : 'bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                          }`}
                        >
                          {/* Barre latérale priorité */}
                          {notif.unread && (
                            <span className={`absolute left-0 top-0 bottom-0 w-1 ${prio.dot}`} />
                          )}

                          <div className="p-5 flex gap-4">
                            {/* Icône catégorie */}
                            <div className={`w-11 h-11 rounded-2xl ${cat.bg} ${cat.dark} flex items-center justify-center shrink-0`}>
                              <Icon size={18} className={cat.accent} strokeWidth={2.3} />
                            </div>

                            <div className="flex-1 min-w-0 space-y-2">
                              {/* Top row */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${prio.bg} ${prio.text} ${prio.border}`}>
                                    {prio.label}
                                  </span>
                                  <span className={`text-[8px] font-black uppercase tracking-widest ${cat.accent}`}>
                                    {cat.label}
                                  </span>
                                  {notif.unread && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                                  )}
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                                  {notif.time}
                                </span>
                              </div>

                              {/* Title */}
                              <h4 className={`text-[13px] font-black tracking-tight leading-tight ${
                                notif.unread ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                              }`}>
                                {notif.title}
                              </h4>

                              {/* Patient */}
                              <div className="flex items-center gap-2">
                                <Stethoscope size={11} className="text-slate-400" />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                  notif.unread ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'
                                }`}>
                                  {notif.patient}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400">·</span>
                                <span className="text-[9px] font-mono text-slate-400">{notif.patientId}</span>
                              </div>

                              {/* Message */}
                              <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                                notif.unread ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400'
                              }`}>
                                {notif.message}
                              </p>

                              {/* Footer */}
                              <div className="flex items-center justify-between pt-1">
                                <button className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-pink-500 hover:text-pink-600 transition-colors">
                                  {notif.cta}
                                  <ChevronRight size={11} />
                                </button>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {notif.unread && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                      className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700"
                                      title="Marquer comme lu"
                                    >
                                      <Eye size={11} />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                                    className="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center text-slate-400 hover:text-rose-500"
                                    title="Archiver"
                                  >
                                    <Archive size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
          {/* ─────── PANEL DÉTAIL ─────── */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="xl:col-span-4"
              >
                {(() => {
                  const cat = CATEGORIES[selected.categorie];
                  const prio = PRIORITES[selected.priorite];
                  const Icon = selected.icon;
                  return (
                    <div className="rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

                      {/* Header detail */}
                      <div className={`p-6 ${cat.bg} ${cat.dark} border-b ${cat.border} dark:border-slate-800 relative`}>
                        <button
                          onClick={() => setSelectedId(null)}
                          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/60 dark:bg-slate-900/50 hover:bg-white flex items-center justify-center text-slate-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                        <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 ${cat.accent} flex items-center justify-center mb-4 shadow-sm`}>
                          <Icon size={22} strokeWidth={2.3} />
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border bg-white/60 dark:bg-slate-900/50 ${prio.text} ${prio.border}`}>
                            {prio.label}
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${cat.accent}`}>
                            {cat.label}
                          </span>
                        </div>
                        <h2 className="text-lg font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                          {selected.title}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                          <Clock size={11} />
                          {selected.time}
                        </p>
                      </div>

                      {/* Body */}
                      <div className="p-6 space-y-5">

                        {/* Patient */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            Patient concerné
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {selected.patient}
                              </p>
                              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                                ID : {selected.patientId}
                              </p>
                            </div>
                            <button className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors">
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Message */}
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            Détails
                          </p>
                          <p className="text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
                            {selected.message}
                          </p>
                        </div>

                        {/* Metadata */}
                        {selected.metadata && (
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                              Données associées
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(selected.metadata).map(([key, val]) => (
                                <div key={key} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    {key}
                                  </p>
                                  <p className="text-[11px] font-black text-slate-900 dark:text-white">
                                    {val}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-2 space-y-2">
                          <button className="w-full h-11 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            <Eye size={12} />
                            {selected.cta}
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => markAsRead(selected.id)}
                              className="h-10 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <CheckCheck size={11} />
                              Marquer lu
                            </button>
                            <button
                              onClick={() => { deleteNotif(selected.id); setSelectedId(null); }}
                              className="h-10 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/40 text-rose-600 text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Trash2 size={11} />
                              Archiver
                            </button>
                          </div>
                        </div>

                        {/* Disclaimer */}
                        <p className="text-[8px] text-slate-400 italic leading-relaxed pt-3 border-t border-slate-100 dark:border-slate-800">
                          Notification générée automatiquement par le système OncoAssist. Toute action clinique reste à l'appréciation du médecin.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
};

export default AlertesPage;