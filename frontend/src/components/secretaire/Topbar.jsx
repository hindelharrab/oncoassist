import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, BellRing, Moon, Sun, Globe, Check, X,
  CheckCheck, Calendar, Pill, Users,
  Inbox, Star, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import secretaireNotificationService
  from '../../services/secretaireNotificationService';

/* ── Types de notifications secrétaire ── */
const NOTIF_TYPES = {
  rdv: {
    label: 'Rendez-vous', color: '#0ea5e9',
    bg: 'bg-sky-50', bgIcon: 'bg-sky-100',
    text: 'text-sky-600',
    glow: 'rgba(14,165,233,0.18)', icon: Calendar,
  },
  patient: {
    label: 'Patient', color: '#f97316',
    bg: 'bg-orange-50', bgIcon: 'bg-orange-100',
    text: 'text-orange-600',
    glow: 'rgba(249,115,22,0.18)', icon: Users,
  },
  dossier: {
    label: 'Dossier', color: '#d97706',
    bg: 'bg-amber-50', bgIcon: 'bg-amber-100',
    text: 'text-amber-600',
    glow: 'rgba(217,119,6,0.18)', icon: Pill,
  },
};

const getType = (categorie) =>
  NOTIF_TYPES[categorie?.toLowerCase()] || NOTIF_TYPES.rdv;

const SPRING = { ease: [0.22, 1, 0.36, 1], duration: 0.45 };

const FILTERS = [
  { key: 'all',     label: 'Tout' },
  { key: 'unread',  label: 'Non lus' },
  { key: 'rdv',     label: 'RDV' },
  { key: 'patient', label: 'Patients' },
  { key: 'dossier', label: 'Dossiers' },
];

/* ── Item notification ── */
function NotifDropdownItem({
  notif, idx, onMarkRead, onDismiss
}) {
  const t = getType(notif.categorie);
  const Icon = t.icon;
  const isUnread = notif.lue === false;

  // Formater la date relative
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now - date) / 60000); // minutes
    if (diff < 1)  return 'À l\'instant';
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440)
      return `Il y a ${Math.floor(diff / 60)}h`;
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short'
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        opacity: 0, x: -20,
        height: 0, overflow: 'hidden'
      }}
      transition={{ delay: idx * 0.03, ...SPRING }}
      whileHover={{ x: 2 }}
      className={`group relative flex gap-3 px-4 py-3.5 cursor-pointer transition-colors border-l-2 ${
        isUnread
          ? 'bg-slate-50/60 hover:bg-slate-100/60'
          : 'border-l-transparent hover:bg-slate-50/60'
      }`}
      style={isUnread
        ? { borderLeftColor: t.color } : {}}
    >
      <div className={`w-9 h-9 rounded-xl ${t.bgIcon} flex items-center justify-center shrink-0 relative`}>
        <Icon size={15} style={{ color: t.color }} />
        {isUnread && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{
              backgroundColor: t.color,
              boxShadow: `0 0 6px ${t.glow}`
            }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[11px] font-black uppercase tracking-tight leading-tight ${
            isUnread ? 'text-slate-900' : 'text-slate-500'
          }`}>
            {notif.titre}
          </p>
          {notif.priorite === 'HAUTE' && (
            <Star size={9}
              className="text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
          )}
        </div>
        <p className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-2">
          {notif.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${t.bg} ${t.text}`}>
            {t.label}
          </span>
          <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            {formatDate(notif.dateCreation)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUnread && (
          <button
            onClick={e => {
              e.stopPropagation();
              onMarkRead(notif.id);
            }}
            className="w-6 h-6 rounded-md hover:bg-emerald-50 flex items-center justify-center transition-colors"
            title="Marquer comme lu"
          >
            <Check size={11} className="text-emerald-600" />
          </button>
        )}
        <button
          onClick={e => {
            e.stopPropagation();
            onDismiss(notif.id);
          }}
          className="w-6 h-6 rounded-md hover:bg-rose-50 flex items-center justify-center transition-colors"
          title="Archiver"
        >
          <X size={11} className="text-rose-500" />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Dropdown panel ── */
function NotificationDropdown({
  notifications, loading, onMarkRead,
  onDismiss, onMarkAllRead
}) {
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(
    n => n.lue === false
  ).length;

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => n.lue === false)
      : notifications.filter(
          n => n.categorie?.toLowerCase() === filter
        );

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={SPRING}
      className="fixed right-10 top-16 w-[480px] bg-white rounded-l-2xl border border-r-0 border-slate-200 shadow-2xl overflow-hidden z-50"
      style={{
        boxShadow: '0 20px 50px -10px rgba(14,165,233,0.12), 0 8px 20px -8px rgba(0,0,0,0.08)'
      }}
    >
      {/* Header */}
      <div className="relative px-5 pt-5 pb-3 border-b border-slate-100 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
          style={{
            background: 'rgba(14,165,233,0.06)',
            transform: 'translate(40%,-40%)'
          }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <h3
              className="text-lg font-black text-slate-900 leading-none"
              style={{ letterSpacing: '-0.03em' }}>
              Notifications
            </h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1.5">
              <span className="text-rose-500">
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </span>
              <span className="mx-1">·</span>
              {notifications.length} total
            </p>
          </div>
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-sky-50 text-[8px] font-black text-slate-600 hover:text-sky-600 uppercase tracking-widest transition-colors"
          >
            <CheckCheck size={11} /> Tout lire
          </button>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-1.5 mt-4 flex-wrap">
          {FILTERS.map(f => {
            const count = f.key === 'unread'
              ? unreadCount : null;
            return (
              <button key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                  filter === f.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {f.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[7px] tabular-nums ${
                    filter === f.key
                      ? 'bg-white/20'
                      : 'bg-rose-500/15 text-rose-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste */}
      <div className="max-h-[380px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24}
              className="animate-spin text-sky-500" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 px-6 text-center"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                  <Inbox size={18} className="text-slate-300" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Aucune notification
                </p>
                <p className="text-[9px] text-slate-400 mt-1">
                  Tout est à jour dans cette catégorie.
                </p>
              </motion.div>
            ) : (
              filtered.map((n, i) => (
                <NotifDropdownItem
                  key={n.id} notif={n} idx={i}
                  onMarkRead={onMarkRead}
                  onDismiss={onDismiss}
                />
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <p className="text-[9px] text-slate-400 font-medium">
          Actualisation automatique toutes les 30s
        </p>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   TOPBAR PRINCIPALE
═══════════════════════════════════════ */
export default function SecretaireTopbar() {
  const { theme, toggleTheme } = useSettings();
  const { user, getPhotoUrl }  = useAuth();
  const notifRef = useRef(null);

  const [notifOpen, setNotifOpen]         = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif]   = useState(false);

  const initiales =
    `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`
      .toUpperCase() || 'S';
  const photoUrl = getPhotoUrl();

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoadingNotif(true);
    try {
      const data = await secretaireNotificationService
        .getAll(user.id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotif(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current
          && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () =>
      document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const handleMarkRead = async (id) => {
    try {
      await secretaireNotificationService.marquerLue(id);
    } catch { /* continue */ }
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, lue: true } : n
      )
    );
  };

  const handleDismiss = async (id) => {
    try {
      await secretaireNotificationService.supprimer(id);
    } catch { /* continue */ }
    setNotifications(prev =>
      prev.filter(n => n.id !== id)
    );
  };

  const handleMarkAllRead = async () => {
    try {
      await secretaireNotificationService
        .marquerToutesLues(user.id);
    } catch { /* continue */ }
    setNotifications(prev =>
      prev.map(n => ({ ...n, lue: true }))
    );
  };

  const unreadCount = notifications.filter(
    n => n.lue === false
  ).length;

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric',
    month: 'long', year: 'numeric',
  });

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-40">

      {/* Gauche */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
          <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-[0.25em]">
            Secrétariat
          </span>
        </div>

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

      {/* Droite */}
      <div className="flex items-center gap-2">

        {/* Toggle thème */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          {theme === 'sombre'
            ? <Sun size={16} />
            : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen(prev => !prev)}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              notifOpen
                ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-600'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <motion.div
              animate={unreadCount > 0 && !notifOpen
                ? { rotate: [0, -12, 12, -8, 8, 0] }
                : {}}
              transition={{
                duration: 0.6, repeat: Infinity,
                repeatDelay: 5
              }}
            >
              {notifOpen || unreadCount === 0
                ? <Bell size={16} />
                : <BellRing size={16} />}
            </motion.div>

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
              <NotificationDropdown
                notifications={notifications}
                loading={loadingNotif}
                onMarkRead={handleMarkRead}
                onDismiss={handleDismiss}
                onMarkAllRead={handleMarkAllRead}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 mx-1" />

        {/* Profil */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {photoUrl ? (
              <img src={photoUrl} alt="Profil"
                className="w-9 h-9 rounded-xl object-cover shadow-sm"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }} />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-black shadow-sm select-none"
                style={{
                  background:
                    'linear-gradient(135deg,#6d28d9,#4f46e5)'
                }}
              >
                {initiales}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
          </div>

          <div className="hidden sm:flex flex-col">
            <p className="text-[12px] font-bold text-slate-900 dark:text-white leading-none">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-widest">
              Secrétaire médicale
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}