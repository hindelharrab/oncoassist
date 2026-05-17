import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CalendarDays,
  UserPlus,
  AlertTriangle,
  FileText,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  X,
} from 'lucide-react';

/* ─── Animations ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut', delay },
});

/* ════════════════════════════════════════
   CONFIG TYPES
═══════════════════════════════════════ */
const TYPE_CONFIG = {
  ALERTE: {
    label: 'Alerte',
    icon: AlertTriangle,
    badge: 'bg-[#FBEAF0] text-[#D4537E] border-[#D4537E]/20',
    icon_bg: 'bg-[#FBEAF0] text-[#D4537E]',
    border: 'border-l-[#D4537E]',
  },
  RDV: {
    label: 'Rendez-vous',
    icon: CalendarDays,
    badge: 'bg-[#EEEDFE] text-[#7F77DD] border-[#7F77DD]/20',
    icon_bg: 'bg-[#EEEDFE] text-[#7F77DD]',
    border: 'border-l-[#7F77DD]',
  },
  PATIENT: {
    label: 'Patient',
    icon: UserPlus,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon_bg: 'bg-emerald-50 text-emerald-600',
    border: 'border-l-emerald-500',
  },
  DOSSIER: {
    label: 'Dossier',
    icon: FileText,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon_bg: 'bg-amber-50 text-amber-600',
    border: 'border-l-amber-500',
  },
};

/* ════════════════════════════════════════
   CARTE NOTIFICATION
═══════════════════════════════════════ */
const NotifCard = ({ notif, onLu, onSupprimer }) => {
  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.RDV;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
      className={`group relative flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 border-l-4 ${config.border} shadow-sm hover:shadow-md transition-all ${notif.nonLu ? 'bg-white' : 'opacity-80'}`}
    >
      {/* Point non lu */}
      {notif.nonLu && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#D4537E]" />
      )}

      {/* Icône type */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.icon_bg}`}>
        <Icon size={18} strokeWidth={1.8} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wide ${config.badge}`}>
            {config.label}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">{notif.temps}</span>
          {notif.nonLu && (
            <span className="text-[10px] font-semibold text-[#D4537E] bg-[#FBEAF0] px-2 py-0.5 rounded-md">
              Nouveau
            </span>
          )}
        </div>
        <p className="text-[13px] font-semibold text-slate-900 leading-snug mb-1">
          {notif.titre}
        </p>
        <p className="text-[12px] text-slate-500 leading-relaxed">{notif.message}</p>
      </div>

      {/* Actions (apparaissent au survol) */}
      <div className="absolute right-4 bottom-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {notif.nonLu && (
          <button
            onClick={() => onLu(notif.id)}
            title="Marquer comme lu"
            className="w-7 h-7 rounded-lg bg-[#EEEDFE] text-[#7F77DD] flex items-center justify-center hover:bg-[#7F77DD] hover:text-white transition-colors"
          >
            <Check size={13} strokeWidth={2.5} />
          </button>
        )}
        <button
          onClick={() => onSupprimer(notif.id)}
          title="Supprimer"
          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════════════
   DONNÉES MOCK
═══════════════════════════════════════ */
const NOTIFS_MOCK = [
  {
    id: 1, type: 'ALERTE', nonLu: true,  temps: 'Il y a 10 min',
    titre: 'Dossier patient à valider en urgence',
    message: 'Le dossier #P-9821 (Salma Bennani) doit être validé avant 12h00 pour autorisation de chimiothérapie.',
  },
  {
    id: 2, type: 'RDV', nonLu: true, temps: 'Il y a 35 min',
    titre: 'Indisponibilité Dr. Benali — RDV à reporter',
    message: 'Dr. Benali est indisponible demain matin. 4 rendez-vous doivent être reprogrammés.',
  },
  {
    id: 3, type: 'PATIENT', nonLu: true, temps: 'Il y a 1h',
    titre: 'Nouveau patient admis — dossier incomplet',
    message: 'Mme. Bensalah Amina (#P-8840) a été admise. Son dossier est incomplet : téléphone et adresse manquants.',
  },
  {
    id: 4, type: 'RDV', nonLu: false, temps: 'Il y a 2h',
    titre: 'Rappel : RDV de Karim Doukkali confirmé',
    message: 'Le rendez-vous de M. Doukkali avec Dr. Ibrahim est confirmé pour aujourd\'hui à 11h15 — Salle 3.',
  },
  {
    id: 5, type: 'DOSSIER', nonLu: false, temps: 'Il y a 3h',
    titre: 'Résultats d\'examens disponibles',
    message: 'Les résultats de biopsie de Yassir Alami (#P-5512) sont disponibles et en attente de consultation par Dr. Benali.',
  },
  {
    id: 6, type: 'RDV', nonLu: false, temps: 'Hier, 17h30',
    titre: 'RDV annulé — Nadia Chraibi',
    message: 'Le rendez-vous de 15h30 avec Dr. El Harrab a été annulé par la patiente. Aucun nouveau créneau prévu.',
  },
  {
    id: 7, type: 'PATIENT', nonLu: false, temps: 'Hier, 14h00',
    titre: 'Mise à jour dossier — Fatima Zahraoui',
    message: 'Les coordonnées de Mme. Zahraoui (#P-2104) ont été mises à jour. Nouveau téléphone enregistré.',
  },
  {
    id: 8, type: 'DOSSIER', nonLu: false, temps: 'Il y a 2 jours',
    titre: 'Compte rendu de consultation archivé',
    message: 'Le compte rendu de la consultation du 14 mai (Dr. El Harrab / Bennani Salma) a été archivé avec succès.',
  },
];

const FILTRES_TYPE = ['Tous', 'ALERTE', 'RDV', 'PATIENT', 'DOSSIER'];
const FILTRES_LABEL = { Tous: 'Tous', ALERTE: 'Alertes', RDV: 'RDV', PATIENT: 'Patients', DOSSIER: 'Dossiers' };

/* ════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════ */
export default function SecretaireNotifications() {
  const [notifs, setNotifs]       = useState(NOTIFS_MOCK);
  const [filtreType, setFiltreType] = useState('Tous');
  const [filtreLu, setFiltreLu]     = useState('tous'); // 'tous' | 'nonlu' | 'lu'

  /* ── Compteurs ── */
  const nbNonLus = notifs.filter((n) => n.nonLu).length;

  /* ── Filtrage ── */
  const filtered = notifs.filter((n) => {
    const matchType = filtreType === 'Tous' || n.type === filtreType;
    const matchLu =
      filtreLu === 'tous' ||
      (filtreLu === 'nonlu' && n.nonLu) ||
      (filtreLu === 'lu' && !n.nonLu);
    return matchType && matchLu;
  });

  /* ── Actions ── */
  const marquerLu = (id) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, nonLu: false } : n)));

  const marquerTousLus = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, nonLu: false })));

  const supprimer = (id) =>
    setNotifs((prev) => prev.filter((n) => n.id !== id));

  /* ── Groupement par date ── */
  const notifsDuJour  = filtered.filter((n) => n.temps.startsWith('Il y a'));
  const notifsHier    = filtered.filter((n) => n.temps.startsWith('Hier'));
  const notifsAnciens = filtered.filter((n) => n.temps.startsWith('Il y a 2 jours') || n.temps.startsWith('Il y a 3'));

  const groups = [
    { label: "Aujourd'hui", items: notifsDuJour },
    { label: 'Hier',        items: notifsHier },
    { label: 'Plus ancien', items: notifsAnciens },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5 pb-8">

      {/* ── En-tête ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Notifications</h2>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">
            {nbNonLus > 0
              ? `${nbNonLus} notification${nbNonLus > 1 ? 's' : ''} non lue${nbNonLus > 1 ? 's' : ''}`
              : 'Tout est à jour'}
          </p>
        </div>

        {nbNonLus > 0 && (
          <button
            onClick={marquerTousLus}
            className="flex items-center gap-2 h-10 px-5 bg-[#EEEDFE] text-[#7F77DD] border border-[#7F77DD]/20 rounded-xl text-[13px] font-semibold hover:bg-[#7F77DD] hover:text-white transition-colors shrink-0"
          >
            <CheckCheck size={16} />
            Tout marquer comme lu
          </button>
        )}
      </motion.div>

      {/* ── Filtres ── */}
      <motion.div {...fadeUp(0.05)} className="flex flex-wrap items-center gap-3">
        {/* Filtre par type */}
        <div className="flex flex-wrap gap-2">
          {FILTRES_TYPE.map((t) => {
            const isActive = filtreType === t;
            const count = t === 'Tous'
              ? notifs.length
              : notifs.filter((n) => n.type === t).length;
            return (
              <button
                key={t}
                onClick={() => setFiltreType(t)}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-semibold border transition-all ${
                  isActive
                    ? 'bg-[#7F77DD] text-white border-[#7F77DD] shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-[#7F77DD]/30 hover:text-[#7F77DD]'
                }`}
              >
                {FILTRES_LABEL[t]}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Séparateur */}
        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        {/* Filtre lu / non lu */}
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {[
            { value: 'tous',  label: 'Tous' },
            { value: 'nonlu', label: 'Non lus' },
            { value: 'lu',    label: 'Lus' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltreLu(f.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                filtreLu === f.value
                  ? 'bg-[#7F77DD] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Liste groupée ── */}
      {groups.length > 0 ? (
        <div className="space-y-6">
          {groups.map((group) => (
            <motion.div key={group.label} {...fadeUp(0.1)}>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
                {group.label}
              </p>
              <AnimatePresence>
                <div className="space-y-2">
                  {group.items.map((notif) => (
                    <NotifCard
                      key={notif.id}
                      notif={notif}
                      onLu={marquerLu}
                      onSupprimer={supprimer}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          {...fadeUp(0.1)}
          className="flex flex-col items-center justify-center py-24 gap-4 text-slate-300"
        >
          <Bell size={44} strokeWidth={1.2} />
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-400">Aucune notification</p>
            <p className="text-[12px] text-slate-300 mt-1">
              {filtreType !== 'Tous' || filtreLu !== 'tous'
                ? 'Modifiez vos filtres pour voir plus de résultats'
                : 'Vous êtes à jour !'}
            </p>
          </div>
          {(filtreType !== 'Tous' || filtreLu !== 'tous') && (
            <button
              onClick={() => { setFiltreType('Tous'); setFiltreLu('tous'); }}
              className="flex items-center gap-2 text-[12px] text-[#7F77DD] font-medium hover:underline"
            >
              <X size={13} /> Réinitialiser les filtres
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}