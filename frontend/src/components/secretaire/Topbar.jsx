import React, { useState, useRef, useEffect } from 'react';
import { Bell, BellRing, Moon, Sun, Globe, Check, X, CheckCheck, ShieldAlert, Calendar, FlaskConical, Pill, Users, ArrowUpRight, Archive, Inbox, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

// ─── Config types ────────────────────────────────────────────────
const NOTIF_TYPES = {
  critique: {
    label: 'Critique', color: '#e11d48',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    bgIcon: 'bg-rose-100 dark:bg-rose-900/40',
    text: 'text-rose-600 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    glow: 'rgba(244,63,94,0.18)', icon: ShieldAlert,
  },
  rdv: {
    label: 'Rendez-vous', color: '#7c3aed',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    bgIcon: 'bg-violet-100 dark:bg-violet-900/40',
    text: 'text-violet-600 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800',
    glow: 'rgba(124,58,237,0.18)', icon: Calendar,
  },
  labo: {
    label: 'Laboratoire', color: '#059669',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    bgIcon: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-600 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    glow: 'rgba(5,150,105,0.18)', icon: FlaskConical,
  },
  ordonnance: {
    label: 'Ordonnance', color: '#d97706',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    bgIcon: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-600 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    glow: 'rgba(217,119,6,0.18)', icon: Pill,
  },
  patient: {
    label: 'Patient', color: '#0ea5e9',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    bgIcon: 'bg-sky-100 dark:bg-sky-900/40',
    text: 'text-sky-600 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
    glow: 'rgba(14,165,233,0.18)', icon: Users,
  },
};

const SPRING = { ease: [0.22, 1, 0.36, 1], duration: 0.45 };

// ─── Données mock ────────────────────────────────────────────────
const NOTIFICATIONS_INIT = [
  {
    id: 1, type: 'critique', unread: true, pinned: true,
    title: 'Résultat anormal — Ahmed Salah',
    desc: 'Marqueurs CA 19-9 élevés (487 U/mL). Consultation Dr. Benali requise sous 24h.',
    time: 'Il y a 4 min', meta: 'Biologie · Urgent',
  },
  {
    id: 2, type: 'rdv', unread: true,
    title: 'Nouveau rendez-vous confirmé',
    desc: 'Sophie Dupont — Consultation Dr. El Harrab, demain à 09:00.',
    time: 'Il y a 12 min', meta: 'Consultation',
  },
  {
    id: 3, type: 'labo', unread: true,
    title: 'Résultats IRM Thorax disponibles',
    desc: 'Marie Curie — Compte-rendu radiologique prêt à consulter.',
    time: 'Il y a 38 min', meta: 'Imagerie',
  },
  {
    id: 4, type: 'ordonnance', unread: false,
    title: 'Renouvellement ordonnance',
    desc: 'Leila Bensouda — Tamoxifène 20mg, à valider.',
    time: 'Il y a 2 h', meta: 'Pharmacie',
  },
  {
    id: 5, type: 'patient', unread: false,
    title: 'Nouvelle admission',
    desc: 'Jean Martin enregistré — Dossier #4827 créé.',
    time: 'Il y a 3 h', meta: 'Secrétariat',
  },
  {
    id: 6, type: 'rdv', unread: false,
    title: 'Annulation RDV',
    desc: 'Karim Tazi a annulé son RDV du 22 mai (motif personnel).',
    time: 'Hier', meta: 'Consultation',
  },
];

const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'unread', label: 'Non lus' },
  { key: 'critique', label: 'Critiques' },
  { key: 'rdv', label: 'RDV' },
];

// ─── Item dropdown ────────────────────────────────────────────────
function NotifDropdownItem({ notif, idx, onMarkRead, onDismiss }) {
  const t = NOTIF_TYPES[notif.type];
  const Icon = t.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, overflow: 'hidden' }}
      transition={{ delay: idx * 0.03, ...SPRING }}
      whileHover={{ x: 2 }}
      className={`group relative flex gap-3 px-4 py-3.5 cursor-pointer transition-colors border-l-2 ${
        notif.unread
          ? `border-l-[${t.color}] bg-slate-50/60 dark:bg-slate-800/20 hover:bg-slate-100/60 dark:hover:bg-slate-800/40`
          : 'border-l-transparent hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
      }`}
      style={notif.unread ? { borderLeftColor: t.color } : {}}
    >
      <div className={`w-9 h-9 rounded-xl ${t.bgIcon} flex items-center justify-center shrink-0 relative`}>
        <Icon size={15} style={{ color: t.color }} />
        {notif.unread && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: t.color, boxShadow: `0 0 6px ${t.glow}` }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[11px] font-black uppercase tracking-tight leading-tight ${
            notif.unread ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
          }`}>
            {notif.title}
          </p>
          {notif.pinned && <Star size={9} className="text-amber-500 fill-amber-500 shrink-0 mt-0.5" />}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-2">{notif.desc}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${t.bg} ${t.text}`}>
            {t.label}
          </span>
          <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{notif.time}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {notif.unread && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkRead(notif.id); }}
            className="w-6 h-6 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center transition-colors"
            title="Marquer comme lu"
          >
            <Check size={11} className="text-emerald-600" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
          className="w-6 h-6 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors"
          title="Supprimer"
        >
          <X size={11} className="text-rose-500" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Dropdown panel ───────────────────────────────────────────────
function NotificationDropdown({ onClose }) {
  const [items, setItems] = useState(NOTIFICATIONS_INIT);
  const [filter, setFilter] = useState('all');

  const unreadCount = items.filter(n => n.unread).length;
  const filtered =
    filter === 'all'     ? items :
    filter === 'unread'  ? items.filter(n => n.unread) :
    items.filter(n => n.type === filter);

  const markRead    = (id) => setItems(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  const dismiss     = (id) => setItems(prev => prev.filter(n => n.id !== id));
  const markAllRead = ()   => setItems(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={SPRING}
      className="fixed right-10 top-16 w-[480px] bg-white dark:bg-slate-900 rounded-l-2xl border border-r-0 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50"
      style={{ boxShadow: '0 20px 50px -10px rgba(124,58,237,0.12), 0 8px 20px -8px rgba(0,0,0,0.08)' }}
    >
      {/* HEADER */}
      <div className="relative px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'rgba(124,58,237,0.06)', transform: 'translate(40%,-40%)' }}
        />
        <div className="relative flex items-center justify-between">
          <div>
           
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none" style={{ letterSpacing: '-0.03em' }}>
              Notifications
            </h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1.5">
              <span className="text-rose-500">{unreadCount} non lus</span>
              <span className="mx-1">·</span>
              {items.length} total
            </p>
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-[8px] font-black text-slate-600 dark:text-slate-300 hover:text-violet-600 uppercase tracking-widest transition-colors"
          >
            <CheckCheck size={11} /> Tout lire
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-1.5 mt-4">
          {FILTERS.map(f => {
            const count = f.key === 'unread' ? unreadCount : null;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                  filter === f.key
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {f.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[7px] tabular-nums ${
                    filter === f.key ? 'bg-white/20' : 'bg-rose-500/15 text-rose-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTE */}
      <div className="max-h-[380px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 px-6 text-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                <Inbox size={18} className="text-slate-300" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Boîte vide</p>
              <p className="text-[9px] text-slate-400 mt-1">Aucune notification dans cette catégorie.</p>
            </motion.div>
          ) : (
            filtered.map((n, i) => (
              <NotifDropdownItem key={n.id} notif={n} idx={i} onMarkRead={markRead} onDismiss={dismiss} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
       
      </div>
    </motion.div>
  );
}

// ─── Topbar principale ─────────────────────────────────────────────
export default function SecretaireTopbar() {
  const { theme, toggleTheme } = useSettings();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // Nombre non lus (synced avec les données initiales — à brancher sur state global si besoin)
  const unreadCount = NOTIFICATIONS_INIT.filter(n => n.unread).length;

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-40">

      {/* ── Gauche ── */}
      <div className="flex items-center gap-5">

        {/* Badge secrétariat */}
        <div className="flex items-center gap-2.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
          <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-[0.25em]">
            Secrétariat
          </span>
        </div>

        {/* Date + HL7 */}
        <div className="hidden lg:flex flex-col border-l border-slate-100 dark:border-slate-800 pl-5">
          <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-none capitalize">
            {today}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Globe size={9} className="text-slate-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em]">
              <span className="text-slate-500 dark:text-slate-400">HL7</span>
              <span className="text-slate-300 dark:text-slate-600 mx-1">·</span>
              <span className="text-emerald-600 dark:text-emerald-400">Nominal</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Droite ── */}
      <div className="flex items-center gap-2">

        {/* Toggle thème */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          {theme === 'sombre' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* ── Notifications avec dropdown ── */}
        <div ref={notifRef} className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen(prev => !prev)}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              notifOpen
                ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-300'
                : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <motion.div
              animate={unreadCount > 0 && !notifOpen
                ? { rotate: [0, -12, 12, -8, 8, 0] }
                : {}}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 5 }}
            >
              {notifOpen || unreadCount === 0
                ? <Bell size={16} />
                : <BellRing size={16} />}
            </motion.div>

            {/* Badge count */}
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[8px] font-black flex items-center justify-center tabular-nums border-2 border-white dark:border-slate-950"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <NotificationDropdown onClose={() => setNotifOpen(false)} />
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 mx-1" />

        {/* Profil */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-black shadow-sm select-none"
              style={{ background: 'linear-gradient(135deg,#6d28d9,#4f46e5)' }}
            >
              FS
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
          </div>

          <div className="hidden sm:flex flex-col">
            <p className="text-[12px] font-bold text-slate-900 dark:text-white leading-none">Fatima Smali</p>
            <p className="text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-widest">Secrétaire médicale</p>
          </div>
        </div>

      </div>
    </header>
  );
}