import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  Users,
  CalendarDays,
  Phone,
  Mail,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
} from 'lucide-react';

/* ─── Animations ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut', delay },
});

/* ════════════════════════════════════════
   BADGE STATUT MÉDECIN
═══════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const map = {
    disponible:   { label: 'Disponible',      dot: 'bg-emerald-500', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    consultation: { label: 'En consultation', dot: 'bg-[#7F77DD]',   className: 'bg-[#EEEDFE] text-[#7F77DD] border-[#7F77DD]/20' },
    pause:        { label: 'En pause',        dot: 'bg-amber-500',   className: 'bg-amber-50 text-amber-700 border-amber-200' },
    absent:       { label: 'Absent',          dot: 'bg-slate-400',   className: 'bg-slate-100 text-slate-500 border-slate-200' },
  };
  const s = map[status] || map.absent;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${s.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

/* ════════════════════════════════════════
   BADGE STATUT RDV
═══════════════════════════════════════ */
const RdvBadge = ({ statut }) => {
  const map = {
    CONFIRME:   { label: 'Confirmé',   className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
    EN_ATTENTE: { label: 'En attente', className: 'bg-amber-50 text-amber-700',     icon: Clock },
    ANNULE:     { label: 'Annulé',     className: 'bg-red-50 text-red-600',         icon: XCircle },
  };
  const s = map[statut] || map.EN_ATTENTE;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${s.className}`}>
      <Icon size={10} strokeWidth={2} />
      {s.label}
    </span>
  );
};

/* ════════════════════════════════════════
   CARTE MÉDECIN
═══════════════════════════════════════ */
const MedecinCard = ({ medecin, index, onVoirPlanning }) => (
  <motion.div
    {...fadeUp(index * 0.07)}
    whileHover={{ y: -3 }}
    className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden group transition-all hover:shadow-md hover:border-[#7F77DD]/20"
  >
    {/* Bande couleur haut */}
    <div className="h-1.5 bg-gradient-to-r from-[#7F77DD] to-[#D4537E]" />

    <div className="p-5">
      {/* Avatar + nom */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#EEEDFE] flex items-center justify-center text-[#7F77DD] text-[13px] font-black shrink-0 group-hover:bg-[#7F77DD] group-hover:text-white transition-colors">
            {medecin.initiales}
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-slate-900 leading-tight">{medecin.nom}</h3>
            <p className="text-[11px] text-[#7F77DD] font-medium mt-0.5">{medecin.specialite}</p>
          </div>
        </div>
        <StatusBadge status={medecin.status} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
          <p className="text-[20px] font-black text-slate-800 leading-none">{medecin.nbPatients}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wide">Patients</p>
        </div>
        <div className="bg-[#EEEDFE] rounded-xl p-3 text-center border border-[#7F77DD]/10">
          <p className="text-[20px] font-black text-[#7F77DD] leading-none">{medecin.rdvAujourdhui}</p>
          <p className="text-[10px] text-[#7F77DD]/70 font-medium mt-1 uppercase tracking-wide">RDV aujourd'hui</p>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-slate-500">
          <Phone size={12} strokeWidth={1.8} className="shrink-0" />
          <span className="text-[12px]">{medecin.telephone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Mail size={12} strokeWidth={1.8} className="shrink-0" />
          <span className="text-[12px] truncate">{medecin.email}</span>
        </div>
      </div>

      {/* Bouton planning */}
      <button
        onClick={() => onVoirPlanning(medecin)}
        className="w-full flex items-center justify-center gap-2 h-10 bg-slate-900 text-white rounded-xl text-[12px] font-semibold hover:bg-[#7F77DD] transition-colors"
      >
        <CalendarDays size={14} />
        Voir le planning
      </button>
    </div>
  </motion.div>
);

/* ════════════════════════════════════════
   MODAL PLANNING MÉDECIN
═══════════════════════════════════════ */
const ModalPlanning = ({ medecin, onClose }) => {
  const [semaine, setSemaine] = useState(0); // 0 = semaine courante

  const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
  const dates = jours.map((j, i) => {
    const d = new Date();
    // Aller au lundi de la semaine courante + offset semaine
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + i + semaine * 7;
    d.setDate(diff);
    return { jour: j, date: d.getDate(), mois: d.toLocaleDateString('fr-FR', { month: 'short' }) };
  });

  // Planning fictif — à brancher sur l'API
  const rdvParJour = {
    0: [
      { heure: '08:30', patient: 'Salma Bennani',   motif: 'Consultation',   statut: 'CONFIRME' },
      { heure: '10:00', patient: 'Karim Doukkali',  motif: 'Contrôle',       statut: 'CONFIRME' },
      { heure: '11:30', patient: 'Fatima Zahraoui', motif: 'Résultats',      statut: 'EN_ATTENTE' },
      { heure: '14:00', patient: 'Ahmed Salah',     motif: 'IRM Thorax',     statut: 'CONFIRME' },
      { heure: '16:00', patient: 'Nadia Chraibi',   motif: 'Post-opératoire',statut: 'ANNULE' },
    ],
    1: [
      { heure: '09:00', patient: 'Yassir Alami',    motif: 'Biopsie',        statut: 'CONFIRME' },
      { heure: '11:00', patient: 'Amina Bensalah',  motif: 'Chimiothérapie', statut: 'EN_ATTENTE' },
    ],
    2: [
      { heure: '08:00', patient: 'Omar El Fassi',   motif: 'Consultation',   statut: 'CONFIRME' },
      { heure: '13:30', patient: 'Laila Moussaoui', motif: 'Suivi traitement',statut: 'CONFIRME' },
      { heure: '15:00', patient: 'Salma Bennani',   motif: 'Bilan sanguin',  statut: 'CONFIRME' },
    ],
    3: [
      { heure: '10:30', patient: 'Karim Doukkali',  motif: 'Radiothérapie',  statut: 'CONFIRME' },
    ],
    4: [
      { heure: '09:30', patient: 'Fatima Zahraoui', motif: 'Consultation',   statut: 'EN_ATTENTE' },
      { heure: '14:30', patient: 'Nadia Chraibi',   motif: 'Suivi',          statut: 'CONFIRME' },
    ],
  };

  const [jourSelectionne, setJourSelectionne] = useState(0);
  const rdvDuJour = rdvParJour[jourSelectionne] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modale */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEEDFE] flex items-center justify-center text-[#7F77DD] text-[11px] font-black">
              {medecin.initiales}
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">{medecin.nom}</h2>
              <p className="text-[11px] text-[#7F77DD] font-medium mt-0.5">{medecin.specialite}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={medecin.status} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation semaine */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <button
            onClick={() => setSemaine((s) => s - 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#7F77DD] hover:border-[#7F77DD]/30 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <p className="text-[12px] font-semibold text-slate-600">
            {semaine === 0 ? 'Semaine actuelle' : semaine > 0 ? `Semaine +${semaine}` : `Semaine ${semaine}`}
          </p>
          <button
            onClick={() => setSemaine((s) => s + 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#7F77DD] hover:border-[#7F77DD]/30 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Sélecteur jours */}
        <div className="flex gap-2 px-6 py-4 border-b border-slate-100 shrink-0 overflow-x-auto">
          {dates.map((d, i) => (
            <button
              key={i}
              onClick={() => setJourSelectionne(i)}
              className={`flex flex-col items-center gap-1 min-w-[56px] py-2.5 px-3 rounded-xl border transition-all ${
                jourSelectionne === i
                  ? 'bg-[#7F77DD] border-[#7F77DD] text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-[#7F77DD]/30 hover:bg-[#EEEDFE]'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${jourSelectionne === i ? 'text-white/80' : 'text-slate-400'}`}>
                {d.jour}
              </span>
              <span className="text-[15px] font-black leading-none">{d.date}</span>
              <span className={`text-[10px] font-medium ${jourSelectionne === i ? 'text-white/70' : 'text-slate-400'}`}>
                {d.mois}
              </span>
            </button>
          ))}
        </div>

        {/* Liste RDV du jour */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
          {rdvDuJour.length > 0 ? (
            rdvDuJour.map((rdv, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#7F77DD]/20 transition-colors"
              >
                <div className="w-12 text-center shrink-0">
                  <p className="text-[13px] font-black text-slate-800 leading-none">{rdv.heure}</p>
                </div>
                <div className="w-px h-8 bg-slate-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 leading-none truncate">{rdv.patient}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{rdv.motif}</p>
                </div>
                <RdvBadge statut={rdv.statut} />
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-300 gap-3">
              <Calendar size={36} strokeWidth={1.2} />
              <p className="text-[13px] font-medium text-slate-400">Aucun rendez-vous ce jour</p>
            </div>
          )}
        </div>

        {/* Pied */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between">
          <p className="text-[12px] text-slate-400 font-medium">
            {rdvDuJour.length} rendez-vous ce jour
          </p>
          <button
            onClick={onClose}
            className="h-9 px-5 bg-slate-900 text-white rounded-xl text-[12px] font-semibold hover:bg-[#7F77DD] transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ════════════════════════════════════════
   DONNÉES
═══════════════════════════════════════ */
const MEDECINS = [
  {
    id: 1,
    initiales: 'AH',
    nom: 'Dr. El Harrab Amine',
    specialite: 'Oncologie digestive',
    telephone: '06 11 22 33 44',
    email: 'a.elharrab@oncoassist.ma',
    status: 'consultation',
    nbPatients: 142,
    rdvAujourdhui: 8,
  },
  {
    id: 2,
    initiales: 'KB',
    nom: 'Dr. Benali Karim',
    specialite: 'Radiothérapie',
    telephone: '06 55 66 77 88',
    email: 'k.benali@oncoassist.ma',
    status: 'disponible',
    nbPatients: 98,
    rdvAujourdhui: 5,
  },
  {
    id: 3,
    initiales: 'SI',
    nom: 'Dr. Ibrahim Salma',
    specialite: 'Chimiothérapie',
    telephone: '06 99 00 11 22',
    email: 's.ibrahim@oncoassist.ma',
    status: 'pause',
    nbPatients: 115,
    rdvAujourdhui: 6,
  },
];

/* ════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════ */
export default function SecretaireMedecins() {
  const [medecinSelectionne, setMedecinSelectionne] = useState(null);

  const totalPatients   = MEDECINS.reduce((s, m) => s + m.nbPatients, 0);
  const totalRdv        = MEDECINS.reduce((s, m) => s + m.rdvAujourdhui, 0);
  const nbDisponibles   = MEDECINS.filter((m) => m.status === 'disponible').length;

  return (
    <div className="space-y-6 pb-8">

      {/* ── En-tête ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Médecins</h2>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">
            {MEDECINS.length} médecins enregistrés
          </p>
        </div>
      </motion.div>

      {/* ── Stats rapides ── */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total patients suivis', value: totalPatients, color: 'text-[#7F77DD]', bg: 'bg-[#EEEDFE]', icon: Users },
          { label: 'RDV aujourd\'hui',       value: totalRdv,      color: 'text-[#D4537E]', bg: 'bg-[#FBEAF0]', icon: CalendarDays },
          { label: 'Médecins disponibles',   value: `${nbDisponibles}/${MEDECINS.length}`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Stethoscope },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={20} className={s.color} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
              <p className={`text-2xl font-black ${s.color} leading-tight mt-0.5`}>{s.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Grille médecins ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {MEDECINS.map((m, i) => (
          <MedecinCard
            key={m.id}
            medecin={m}
            index={i}
            onVoirPlanning={setMedecinSelectionne}
          />
        ))}
      </div>

      {/* ── Tableau récapitulatif ── */}
      <motion.div {...fadeUp(0.3)} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Stethoscope size={17} className="text-[#7F77DD]" strokeWidth={1.8} />
          <h3 className="text-[14px] font-bold text-slate-800">Récapitulatif de la journée</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left py-3 px-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Médecin</th>
                <th className="text-left py-3 px-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Spécialité</th>
                <th className="text-left py-3 px-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Statut</th>
                <th className="text-center py-3 px-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Patients</th>
                <th className="text-center py-3 px-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">RDV / jour</th>
                <th className="text-right py-3 px-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Planning</th>
              </tr>
            </thead>
            <tbody>
              {MEDECINS.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] text-[#7F77DD] flex items-center justify-center text-[10px] font-black shrink-0">
                        {m.initiales}
                      </div>
                      <span className="text-[13px] font-semibold text-slate-800">{m.nom}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-[12px] text-slate-500">{m.specialite}</span>
                  </td>
                  <td className="py-3.5 px-5 hidden sm:table-cell">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="text-[13px] font-bold text-slate-700">{m.nbPatients}</span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#EEEDFE] text-[#7F77DD] text-[13px] font-bold">
                      {m.rdvAujourdhui}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => setMedecinSelectionne(m)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-[#7F77DD] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Eye size={12} /> Planning
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Modal planning ── */}
      <AnimatePresence>
        {medecinSelectionne && (
          <ModalPlanning
            medecin={medecinSelectionne}
            onClose={() => setMedecinSelectionne(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}