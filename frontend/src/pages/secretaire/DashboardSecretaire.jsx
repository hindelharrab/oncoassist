import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Clock,
  Stethoscope,
  CheckCircle2,
  XCircle,
  UserPlus,
  Printer,
  CalendarPlus,
  ArrowRight,
  Bell,
  TrendingUp,
} from 'lucide-react';

/* ─── Animation ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut', delay },
});

/* ════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════ */
const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => {
  const colors = {
    pink:  { bg: 'bg-pink-50',   icon: 'text-pink-500',   value: 'text-pink-500',   border: 'border-pink-100' },
    dark:  { bg: 'bg-gray-100',  icon: 'text-gray-700',   value: 'text-gray-900',   border: 'border-gray-200' },
    green: { bg: 'bg-green-50',  icon: 'text-green-600',  value: 'text-green-700',  border: 'border-green-100' },
    amber: { bg: 'bg-amber-50',  icon: 'text-amber-600',  value: 'text-amber-700',  border: 'border-amber-100' },
  };
  const c = colors[color] || colors.pink;

  return (
    <motion.div
      {...fadeUp(delay)}
      whileHover={{ y: -2 }}
      className={`bg-white border ${c.border} rounded-2xl p-5 flex items-center gap-4 shadow-sm`}
    >
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon size={22} className={c.icon} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <p className={`text-2xl font-black ${c.value} leading-none`}>{value}</p>
        {sub && <p className="text-[11px] text-gray-400 font-medium mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════════════
   BADGE STATUT RDV
═══════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const map = {
    CONFIRME:   { label: 'Confirmé',   className: 'bg-green-50 text-green-700 border-green-200',   icon: CheckCircle2 },
    EN_ATTENTE: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock },
    ANNULE:     { label: 'Annulé',     className: 'bg-red-50 text-red-600 border-red-200',         icon: XCircle },
  };
  const s = map[status] || map.EN_ATTENTE;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${s.className}`}>
      <Icon size={11} strokeWidth={2} />
      {s.label}
    </span>
  );
};

/* ════════════════════════════════════════
   LIGNE RDV
═══════════════════════════════════════ */
const RdvRow = ({ rdv, index }) => (
  <motion.div
    {...fadeUp(0.1 + index * 0.05)}
    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-pink-200 hover:shadow-sm transition-all group cursor-pointer"
  >
    {/* Heure */}
    <div className="w-14 shrink-0 text-center">
      <p className="text-[14px] font-black text-gray-900 leading-none">{rdv.heure}</p>
      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{rdv.duree}</p>
    </div>

    <div className="w-px h-10 bg-gray-100 shrink-0" />

    {/* Infos */}
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-gray-900 truncate leading-none">{rdv.patient}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[11px] text-gray-500">Dr. {rdv.medecin}</span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className="text-[11px] text-pink-500 font-medium">{rdv.motif}</span>
      </div>
    </div>

    {/* Lieu */}
    <span className="hidden sm:block text-[11px] text-gray-400 font-medium shrink-0">{rdv.lieu}</span>

    {/* Statut */}
    <div className="shrink-0">
      <StatusBadge status={rdv.statut} />
    </div>
  </motion.div>
);

/* ════════════════════════════════════════
   NOTIFICATION
═══════════════════════════════════════ */
const NotifItem = ({ notif, index }) => {
  const typeColor = {
    RDV:     'bg-gray-100 text-gray-700',
    PATIENT: 'bg-green-50 text-green-700',
    ALERTE:  'bg-pink-50 text-pink-600',
  };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-all ${notif.nonLu ? 'bg-pink-50/60 border border-pink-100' : 'border border-transparent'}`}>
      <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide ${typeColor[notif.type] || typeColor.RDV}`}>
        {notif.type}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-800 leading-snug">{notif.message}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{notif.temps}</p>
      </div>
      {notif.nonLu && <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0 mt-1.5" />}
    </div>
  );
};

/* ════════════════════════════════════════
   MÉDECIN
═══════════════════════════════════════ */
const MedecinItem = ({ medecin }) => {
  const statusMap = {
    disponible:   { dot: 'bg-green-500',  label: 'Disponible',      text: 'text-green-600' },
    consultation: { dot: 'bg-pink-500',   label: 'En consultation', text: 'text-pink-600' },
    pause:        { dot: 'bg-amber-500',  label: 'En pause',        text: 'text-amber-600' },
    absent:       { dot: 'bg-gray-400',   label: 'Absent',          text: 'text-gray-500' },
  };
  const s = statusMap[medecin.status] || statusMap.absent;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 text-[11px] font-black shrink-0">
        {medecin.initiales}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-800 leading-none truncate">{medecin.nom}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{medecin.specialite}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
        <span className={`text-[11px] font-medium ${s.text}`}>{s.label}</span>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   BOUTON ACTION RAPIDE
═══════════════════════════════════════ */
const QuickAction = ({ icon: Icon, label, desc, onClick, primary }) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
      primary
        ? 'bg-gray-900 border-gray-900 text-white hover:bg-pink-500 hover:border-pink-500 shadow-sm'
        : 'bg-white border-gray-100 text-gray-700 hover:border-pink-200 hover:bg-pink-50/40'
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${primary ? 'bg-white/10' : 'bg-pink-50'}`}>
      <Icon size={18} className={primary ? 'text-white' : 'text-pink-500'} strokeWidth={1.8} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-[13px] font-semibold leading-none ${primary ? 'text-white' : 'text-gray-800'}`}>{label}</p>
      <p className={`text-[11px] mt-1 ${primary ? 'text-white/60' : 'text-gray-400'}`}>{desc}</p>
    </div>
    <ArrowRight size={15} className={primary ? 'text-white/50' : 'text-gray-300'} />
  </motion.button>
);

/* ════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════ */
export default function DashboardSecretaire() {
  const navigate = useNavigate();

  const stats = [
    { icon: CalendarDays, label: "RDV aujourd'hui", value: '24', sub: '3 en attente de confirmation', color: 'pink',  delay: 0 },
    { icon: UserPlus,     label: 'Nouveaux patients', value: '6',  sub: 'Ajoutés cette semaine',        color: 'dark',  delay: 0.05 },
    { icon: Clock,        label: 'RDV en attente',    value: '5',  sub: 'À confirmer ou planifier',     color: 'amber', delay: 0.1 },
    { icon: Stethoscope,  label: 'Médecins dispo',    value: '2',  sub: 'Sur 3 oncologues',             color: 'green', delay: 0.15 },
  ];

  const rdvAujourdhui = [
    { heure: '08:30', duree: '30 min', patient: 'Salma Bennani',   medecin: 'El Harrab', motif: 'Consultation',   lieu: 'Salle 1', statut: 'CONFIRME' },
    { heure: '09:00', duree: '45 min', patient: 'Yassir Alami',    medecin: 'Benali',    motif: 'Échographie',    lieu: 'Salle 2', statut: 'CONFIRME' },
    { heure: '10:30', duree: '30 min', patient: 'Fatima Zahraoui', medecin: 'El Harrab', motif: 'Contrôle',       lieu: 'Salle 1', statut: 'EN_ATTENTE' },
    { heure: '11:15', duree: '60 min', patient: 'Karim Doukkali',  medecin: 'Ibrahim',   motif: 'Chimio cycle 3', lieu: 'Hôpital J.', statut: 'CONFIRME' },
    { heure: '14:00', duree: '30 min', patient: 'Ahmed Salah',     medecin: 'Benali',    motif: 'IRM Thorax',     lieu: 'Salle 3', statut: 'EN_ATTENTE' },
    { heure: '15:30', duree: '20 min', patient: 'Nadia Chraibi',   medecin: 'El Harrab', motif: 'Résultats',      lieu: 'Salle 1', statut: 'ANNULE' },
  ];

  const notifications = [
    { type: 'ALERTE',  message: 'Dossier #P-9821 à valider avant 12h',                  nonLu: true,  temps: 'Il y a 10 min' },
    { type: 'RDV',     message: 'Dr. Benali indisponible demain — 4 RDV à reporter',     nonLu: true,  temps: 'Il y a 35 min' },
    { type: 'PATIENT', message: 'Nouveau patient admis : Mme. Bensalah (dossier incomplet)', nonLu: false, temps: 'Il y a 1h' },
    { type: 'RDV',     message: 'RDV Doukkali confirmé pour 11h15 — Salle 3',           nonLu: false, temps: 'Il y a 2h' },
  ];

  const medecins = [
    { initiales: 'AH', nom: 'Dr. El Harrab Amine', specialite: 'Oncologie digestive', status: 'consultation' },
    { initiales: 'KB', nom: 'Dr. Benali Karim',    specialite: 'Radio-oncologie',      status: 'disponible' },
    { initiales: 'SI', nom: 'Dr. Ibrahim Salma',   specialite: 'Onco-chimiothérapie',  status: 'pause' },
  ];

  return (
    <div className="space-y-6 pb-8">

      {/* ── Titre ── */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
            Tableau de bord
          </h2>
          <p className="text-[12px] text-gray-400 font-medium mt-0.5">
            Bienvenue, Fatima — voici le résumé du jour
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
          <TrendingUp size={14} className="text-pink-500" />
          <span className="text-[12px] font-semibold text-gray-600">Dimanche 17 mai 2026</span>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Corps principal ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* RDV du jour */}
        <motion.div {...fadeUp(0.2)} className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CalendarDays size={17} className="text-pink-500" strokeWidth={1.8} />
              <h3 className="text-[14px] font-bold text-gray-800">RDV d'aujourd'hui</h3>
              <span className="ml-1 px-2 py-0.5 bg-pink-50 text-pink-500 text-[11px] font-bold rounded-lg border border-pink-100">
                {rdvAujourdhui.length}
              </span>
            </div>
            <button
              onClick={() => navigate('/secretaire/planning')}
              className="flex items-center gap-1 text-[12px] text-gray-500 font-medium hover:text-pink-500 transition-colors"
            >
              Voir le planning <ArrowRight size={13} />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {rdvAujourdhui.map((rdv, i) => <RdvRow key={i} rdv={rdv} index={i} />)}
          </div>
        </motion.div>

        {/* Colonne droite */}
        <div className="space-y-6">

          {/* Médecins */}
          <motion.div {...fadeUp(0.25)} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Stethoscope size={17} className="text-pink-500" strokeWidth={1.8} />
                <h3 className="text-[14px] font-bold text-gray-800">Oncologues</h3>
              </div>
              <button
                onClick={() => navigate('/secretaire/medecins')}
                className="text-[12px] text-gray-500 font-medium hover:text-pink-500 transition-colors flex items-center gap-1"
              >
                Voir tout <ArrowRight size={13} />
              </button>
            </div>
            <div className="px-5 py-3">
              {medecins.map((m, i) => <MedecinItem key={i} medecin={m} />)}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div {...fadeUp(0.3)} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell size={17} className="text-pink-500" strokeWidth={1.8} />
                <h3 className="text-[14px] font-bold text-gray-800">Notifications</h3>
                <span className="ml-1 px-2 py-0.5 bg-pink-50 text-pink-500 text-[11px] font-bold rounded-lg border border-pink-100">
                  {notifications.filter((n) => n.nonLu).length} nouvelles
                </span>
              </div>
              <button
                onClick={() => navigate('/secretaire/notifications')}
                className="text-[12px] text-gray-500 font-medium hover:text-pink-500 transition-colors flex items-center gap-1"
              >
                Tout voir <ArrowRight size={13} />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {notifications.map((n, i) => <NotifItem key={i} notif={n} index={i} />)}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Actions rapides ── */}
      <motion.div {...fadeUp(0.35)} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-800">Activité rapide</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Accès direct aux actions fréquentes</p>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction
            icon={UserPlus}  label="Nouveau patient"  desc="Créer un dossier et affecter un oncologue"
            onClick={() => navigate('/secretaire/patients')}
          />
          <QuickAction
            icon={CalendarPlus} label="Nouveau RDV" desc="Planifier un rendez-vous"
            onClick={() => navigate('/secretaire/planning')}
          />
          <QuickAction
            icon={Printer} label="Imprimer dossier" desc="Rechercher et générer un PDF"
            onClick={() => navigate('/secretaire/print')}
          />
        </div>
      </motion.div>
    </div>
  );
}