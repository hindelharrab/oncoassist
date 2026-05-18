import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Stethoscope, Users, CalendarDays, Phone, Mail,
  Eye, X, ChevronLeft, ChevronRight, Clock,
  CheckCircle2, XCircle, Calendar,
} from 'lucide-react';

/* ─── Count-up hook ─── */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return [value, ref];
}

/* ─── 3D tilt card ─── */
function TiltCard({ children, className = '' }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stat card with count-up ─── */
function StatCard({ label, target, displayValue, color, bg, Icon, index }) {
  const isNum = typeof target === 'number';
  const [count, ref] = useCountUp(isNum ? target : 0, 1000 + index * 150);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 + index * 0.08 }}
      className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
    >
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={color} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        <p className={`text-2xl font-black ${color} leading-tight mt-0.5`}>
          {isNum ? count : displayValue}
        </p>
      </div>
    </motion.div>
  );
}

/* ════ BADGE STATUT MÉDECIN ════ */
const StatusBadge = ({ status }) => {
  const map = {
    disponible:   { label: 'Disponible',      dot: 'bg-emerald-500', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    consultation: { label: 'En consultation', dot: 'bg-[#9b95c9]',   className: 'bg-[#f0effe] text-[#9b95c9] border-[#9b95c9]/20' },
    pause:        { label: 'En pause',        dot: 'bg-amber-400',   className: 'bg-amber-50 text-amber-700 border-amber-200' },
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

/* ════ BADGE STATUT RDV ════ */
const RdvBadge = ({ statut }) => {
  const map = {
    CONFIRME:   { label: 'Confirmé',   className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
    EN_ATTENTE: { label: 'En attente', className: 'bg-amber-50 text-amber-700',     icon: Clock },
    ANNULE:     { label: 'Annulé',     className: 'bg-red-50 text-red-500',         icon: XCircle },
  };
  const s = map[statut] || map.EN_ATTENTE;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${s.className}`}>
      <Icon size={10} strokeWidth={2} /> {s.label}
    </span>
  );
};

/* ════ CARTE MÉDECIN ════ */
const MedecinCard = ({ medecin, index, onVoirPlanning }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.1 }}
  >
    <TiltCard className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="p-5 flex flex-col gap-4">

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 text-[15px] font-black shrink-0 group-hover:bg-slate-200 transition-colors">
            {medecin.initiales}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-slate-900 leading-snug truncate">{medecin.nom}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{medecin.specialite}</p>
            <div className="mt-1.5">
              <StatusBadge status={medecin.status} />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="text-[22px] font-black text-slate-800 leading-none">{medecin.nbPatients}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wide">Patients</p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="text-center">
            <p className="text-[22px] font-black text-[#D4537E] leading-none">{medecin.rdvAujourdhui}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wide">RDV aujourd'hui</p>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Phone size={11} strokeWidth={1.8} className="text-slate-300 shrink-0" />
            <span className="text-[12px] text-slate-500">{medecin.telephone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={11} strokeWidth={1.8} className="text-slate-300 shrink-0" />
            <span className="text-[12px] text-slate-400 truncate">{medecin.email}</span>
          </div>
        </div>

        <button
          onClick={() => onVoirPlanning(medecin)}
          className="w-full flex items-center justify-center gap-2 h-9 bg-slate-800 text-white rounded-xl text-[12px] font-semibold hover:bg-slate-600 transition-colors"
        >
          <CalendarDays size={13} /> Voir le planning
        </button>

      </div>
    </TiltCard>
  </motion.div>
);

/* ════ MODAL PLANNING ════ */
const ModalPlanning = ({ medecin, onClose }) => {
  const [semaine, setSemaine] = useState(0);
  const [jourSelectionne, setJourSelectionne] = useState(0);

  const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
  const dates = jours.map((j, i) => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + i + semaine * 7;
    d.setDate(diff);
    return { jour: j, date: d.getDate(), mois: d.toLocaleDateString('fr-FR', { month: 'short' }) };
  });

  const rdvParJour = {
    0: [
      { heure: '08:30', patient: 'Salma Bennani',   motif: 'Consultation',    statut: 'CONFIRME' },
      { heure: '10:00', patient: 'Karim Doukkali',  motif: 'Contrôle',        statut: 'CONFIRME' },
      { heure: '11:30', patient: 'Fatima Zahraoui', motif: 'Résultats',       statut: 'EN_ATTENTE' },
      { heure: '14:00', patient: 'Ahmed Salah',     motif: 'IRM Thorax',      statut: 'CONFIRME' },
      { heure: '16:00', patient: 'Nadia Chraibi',   motif: 'Post-opératoire', statut: 'ANNULE' },
    ],
    1: [
      { heure: '09:00', patient: 'Yassir Alami',   motif: 'Biopsie',        statut: 'CONFIRME' },
      { heure: '11:00', patient: 'Amina Bensalah', motif: 'Chimiothérapie', statut: 'EN_ATTENTE' },
    ],
    2: [
      { heure: '08:00', patient: 'Omar El Fassi',   motif: 'Consultation',     statut: 'CONFIRME' },
      { heure: '13:30', patient: 'Laila Moussaoui', motif: 'Suivi traitement', statut: 'CONFIRME' },
      { heure: '15:00', patient: 'Salma Bennani',   motif: 'Bilan sanguin',    statut: 'CONFIRME' },
    ],
    3: [{ heure: '10:30', patient: 'Karim Doukkali', motif: 'Radiothérapie', statut: 'CONFIRME' }],
    4: [
      { heure: '09:30', patient: 'Fatima Zahraoui', motif: 'Consultation', statut: 'EN_ATTENTE' },
      { heure: '14:30', patient: 'Nadia Chraibi',   motif: 'Suivi',        statut: 'CONFIRME' },
    ],
  };

  const rdvDuJour = rdvParJour[jourSelectionne] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="h-1 bg-[#9b95c9]" />

        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0effe] flex items-center justify-center text-[#9b95c9] text-[11px] font-black">
              {medecin.initiales}
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">{medecin.nom}</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{medecin.specialite}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={medecin.status} />
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <button onClick={() => setSemaine(s => s - 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#9b95c9] hover:border-[#9b95c9]/30 transition-colors">
            <ChevronLeft size={15} />
          </button>
          <p className="text-[12px] font-semibold text-slate-600">
            {semaine === 0 ? 'Semaine actuelle' : semaine > 0 ? `Semaine +${semaine}` : `Semaine ${semaine}`}
          </p>
          <button onClick={() => setSemaine(s => s + 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#9b95c9] hover:border-[#9b95c9]/30 transition-colors">
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="flex gap-2 px-6 py-4 border-b border-slate-100 shrink-0 overflow-x-auto">
          {dates.map((d, i) => (
            <button
              key={i}
              onClick={() => setJourSelectionne(i)}
              className={`flex flex-col items-center gap-1 min-w-[56px] py-2.5 px-3 rounded-xl border transition-all ${
                jourSelectionne === i
                  ? 'bg-[#9b95c9] border-[#9b95c9] text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-[#9b95c9]/30 hover:bg-[#f0effe]/40'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${jourSelectionne === i ? 'text-white/70' : 'text-slate-400'}`}>{d.jour}</span>
              <span className="text-[15px] font-black leading-none">{d.date}</span>
              <span className={`text-[10px] font-medium ${jourSelectionne === i ? 'text-white/60' : 'text-slate-400'}`}>{d.mois}</span>
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          <AnimatePresence mode="wait">
            {rdvDuJour.length > 0 ? (
              <motion.div key={jourSelectionne} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }} className="space-y-2">
                {rdvDuJour.map((rdv, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
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
                ))}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-3">
                <Calendar size={36} strokeWidth={1.2} className="text-slate-300" />
                <p className="text-[13px] font-medium text-slate-400">Aucun rendez-vous ce jour</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between">
          <p className="text-[12px] text-slate-400 font-medium">{rdvDuJour.length} rendez-vous ce jour</p>
          <button onClick={onClose} className="h-9 px-5 bg-[#9b95c9] text-white rounded-xl text-[12px] font-semibold hover:bg-[#7068a8] transition-colors">
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ════ DONNÉES ════ */
const MEDECINS = [
  { id: 1, initiales: 'AH', nom: 'Dr. El Harrab Amine', specialite: 'Oncologie digestive', telephone: '06 11 22 33 44', email: 'a.elharrab@oncoassist.ma', status: 'consultation', nbPatients: 142, rdvAujourdhui: 8 },
  { id: 2, initiales: 'KB', nom: 'Dr. Benali Karim',    specialite: 'Radiothérapie',       telephone: '06 55 66 77 88', email: 'k.benali@oncoassist.ma',   status: 'disponible',   nbPatients: 98,  rdvAujourdhui: 5 },
  { id: 3, initiales: 'SI', nom: 'Dr. Ibrahim Salma',   specialite: 'Chimiothérapie',      telephone: '06 99 00 11 22', email: 's.ibrahim@oncoassist.ma',  status: 'pause',        nbPatients: 115, rdvAujourdhui: 6 },
  { id: 4, initiales: 'MK', nom: 'Dr. Mounir Kettani',  specialite: 'Oncologie médicale',  telephone: '06 21 34 56 78', email: 'm.kettani@oncoassist.ma',  status: 'disponible',   nbPatients: 120, rdvAujourdhui: 7 },
  { id: 5, initiales: 'FA', nom: 'Dr. Fatima Azzouzi',  specialite: 'Hématologie',         telephone: '06 87 65 43 21', email: 'f.azzouzi@oncoassist.ma',  status: 'consultation', nbPatients: 110, rdvAujourdhui: 4 },
  { id: 6, initiales: 'YS', nom: 'Dr. Youssef Saidi',   specialite: 'Radiothérapie',       telephone: '06 77 11 22 33', email: 'y.saidi@oncoassist.ma',    status: 'absent',       nbPatients: 90,  rdvAujourdhui: 2 },
];

/* ════ PAGE PRINCIPALE ════ */
export default function SecretaireMedecins() {
  // ✅ Tous les hooks sont maintenant ICI, dans le corps du composant
  const [medecinSelectionne, setMedecinSelectionne] = useState(null);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('Tous');
  const [showFilters, setShowFilters] = useState(false);

  const totalPatients = MEDECINS.reduce((s, m) => s + m.nbPatients, 0);
  const totalRdv      = MEDECINS.reduce((s, m) => s + m.rdvAujourdhui, 0);
  const nbDisponibles = MEDECINS.filter(m => m.status === 'disponible').length;

  /* ─── Calcul du filtre ─── */
  const filteredMedecins = useMemo(() => {
    const q = search.toLowerCase();
    return MEDECINS.filter((m) => {
      const matchSearch =
        !q ||
        m.nom.toLowerCase().includes(q) ||
        m.specialite.toLowerCase().includes(q);
      const matchStatut =
        filtreStatut === 'Tous' || m.status === filtreStatut;
      return matchSearch && matchStatut;
    });
  }, [search, filtreStatut]);

  return (
    <div className="space-y-6 pb-8">

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h2 className="text-xl font-black text-slate-900">Médecins</h2>
        <p className="text-[12px] text-slate-400 font-medium mt-0.5">{MEDECINS.length} médecins enregistrés</p>
      </motion.div>

      {/* SEARCH + FILTRES */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher médecin..."
            className="w-full h-11 px-4 border rounded-xl"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="h-11 px-4 rounded-xl border bg-white"
        >
          Filtres
        </button>
      </div>

      {showFilters && (
        <div className="flex gap-4 p-4 bg-white border rounded-2xl mb-4">
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="h-9 px-3 border rounded-lg"
          >
            <option value="Tous">Tous</option>
            <option value="disponible">Disponible</option>
            <option value="consultation">En consultation</option>
            <option value="pause">Pause</option>
            <option value="absent">Absent</option>
          </select>
          <button
            onClick={() => setFiltreStatut('Tous')}
            className="h-9 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Réinitialiser
          </button>
        </div>
      )}

      {/* Grille médecins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredMedecins.map((m, i) => (
          <MedecinCard
            key={m.id}
            medecin={m}
            index={i}
            onVoirPlanning={setMedecinSelectionne}
          />
        ))}
      </div>

      {/* Tableau récapitulatif */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.35 }}
        className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Stethoscope size={17} className="text-slate-400" strokeWidth={1.8} />
          <h3 className="text-[14px] font-bold text-slate-800">Récapitulatif de la journée</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Médecin','Spécialité','Statut','Patients','RDV / jour','Planning'].map((h, i) => (
                  <th key={i} className={`py-3 px-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest ${i >= 3 ? 'text-center' : 'text-left'} ${i === 2 ? 'hidden sm:table-cell' : ''} ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEDECINS.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#f0effe] text-[#9b95c9] flex items-center justify-center text-[10px] font-black shrink-0">{m.initiales}</div>
                      <span className="text-[13px] font-semibold text-slate-800">{m.nom}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5"><span className="text-[12px] text-slate-500">{m.specialite}</span></td>
                  <td className="py-3.5 px-5 hidden sm:table-cell"><StatusBadge status={m.status} /></td>
                  <td className="py-3.5 px-5 text-center"><span className="text-[13px] font-bold text-slate-700">{m.nbPatients}</span></td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#FBEAF0] text-[#D4537E] text-[13px] font-bold">{m.rdvAujourdhui}</span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => setMedecinSelectionne(m)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9b95c9] text-white text-[11px] font-semibold hover:bg-[#7068a8] transition-colors"
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

      <AnimatePresence>
        {medecinSelectionne && (
          <ModalPlanning medecin={medecinSelectionne} onClose={() => setMedecinSelectionne(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}