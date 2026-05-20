import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Stethoscope, Users, CalendarDays, Phone, Mail,
  Eye, X, ChevronLeft, ChevronRight, Clock,
  CheckCircle2, XCircle, Calendar, Loader2, AlertCircle, Search, Filter
} from 'lucide-react';
import secretaireMedecinService from '../../services/secretaireMedecinService';

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

/* ════ BADGE STATUT MÉDECIN ════ */
const StatusBadge = ({ status }) => {
  const map = {
    disponible:   { label: 'Disponible',      dot: 'bg-emerald-500', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    consultation: { label: 'En consultation', dot: 'bg-[#9b95c9]',   className: 'bg-[#f0effe] text-[#9b95c9] border-[#9b95c9]/20' },
    pause:        { label: 'En pause',        dot: 'bg-amber-400',   className: 'bg-amber-50 text-amber-700 border-amber-200' },
    absent:       { label: 'Absent',          dot: 'bg-slate-400',   className: 'bg-slate-100 text-slate-500 border-slate-200' },
  };
  const s = map[status] || map.disponible;
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
    CONFIRME:     { label: 'Confirmé',   className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
    PLANIFIE:     { label: 'Confirmé',   className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
    EN_ATTENTE:   { label: 'En attente', className: 'bg-amber-50 text-amber-700',     icon: Clock },
    ANNULE:       { label: 'Annulé',     className: 'bg-red-50 text-red-500',         icon: XCircle },
    EFFECTUE:     { label: 'Effectué',   className: 'bg-sky-50 text-sky-600',         icon: CheckCircle2 },
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
    transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.08 }}
  >
    <TiltCard className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {medecin.photoProfil ? (
            <img
              src={`http://localhost:8080/${medecin.photoProfil}`}
              alt={medecin.nom}
              className="w-14 h-14 rounded-2xl object-cover shrink-0"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 text-[15px] font-black shrink-0 group-hover:bg-slate-200 transition-colors">
              {medecin.initiales}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-slate-900 leading-snug truncate">
              {medecin.nom}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              {medecin.specialite}
            </p>
            <div className="mt-1.5">
              <StatusBadge status={medecin.status} />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="text-[22px] font-black text-slate-800 leading-none">
              {medecin.nbPatients}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wide">
              Patients
            </p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="text-center">
            <p className="text-[22px] font-black text-[#D4537E] leading-none">
              {medecin.rdvAujourdhui}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wide">
              RDV aujourd'hui
            </p>
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
  const [semaine, setSemaine]                 = useState(0);
  const [jourSelectionne, setJourSelectionne] = useState(0);
  const [rdvData, setRdvData]                 = useState([]);
  const [loadingRdv, setLoadingRdv]           = useState(false);

  const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
  const dates = jours.map((j, i) => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + i + semaine * 7;
    d.setDate(diff);
    return {
      jour: j,
      date: d.getDate(),
      mois: d.toLocaleDateString('fr-FR', { month: 'short' })
    };
  });

  // Charger les RDV depuis le backend
  useEffect(() => {
    const fetchRdv = async () => {
      setLoadingRdv(true);
      try {
        const data = await secretaireMedecinService
          .getPlanning(medecin.id, semaine);
        setRdvData(data);
      } catch (err) {
        console.error(err);
        setRdvData([]);
      } finally {
        setLoadingRdv(false);
      }
    };
    fetchRdv();
  }, [medecin.id, semaine]);

  // Filtrer les RDV par jour sélectionné
  const rdvDuJour = rdvData.filter(
    rdv => rdv.jourOffset === jourSelectionne
  );

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

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0effe] flex items-center justify-center text-[#9b95c9] text-[11px] font-black">
              {medecin.initiales}
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                {medecin.nom}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {medecin.specialite}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={medecin.status} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation semaine */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <button
            onClick={() => setSemaine(s => s - 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#9b95c9] transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <p className="text-[12px] font-semibold text-slate-600">
            {semaine === 0 ? 'Semaine actuelle' : semaine > 0 ? `Semaine +${semaine}` : `Semaine ${semaine}`}
          </p>
          <button
            onClick={() => setSemaine(s => s + 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#9b95c9] transition-colors"
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
                  ? 'bg-[#9b95c9] border-[#9b95c9] text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-[#9b95c9]/30 hover:bg-[#f0effe]/40'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${jourSelectionne === i ? 'text-white/70' : 'text-slate-400'}`}>
                {d.jour}
              </span>
              <span className="text-[15px] font-black leading-none">{d.date}</span>
              <span className={`text-[10px] font-medium ${jourSelectionne === i ? 'text-white/60' : 'text-slate-400'}`}>
                {d.mois}
              </span>
            </button>
          ))}
        </div>

        {/* Liste RDV */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loadingRdv ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#9b95c9]" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {rdvDuJour.length > 0 ? (
                <motion.div
                  key={`${jourSelectionne}-${semaine}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-2"
                >
                  {rdvDuJour.map((rdv, i) => (
                    <motion.div
                      key={rdv.id || i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                    >
                      <div className="w-12 text-center shrink-0">
                        <p className="text-[13px] font-black text-slate-800 leading-none">
                          {rdv.heure}
                        </p>
                      </div>
                      <div className="w-px h-8 bg-slate-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 leading-none truncate">
                          {rdv.patientPrenom} {rdv.patientNom}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {rdv.motif}
                        </p>
                      </div>
                      <RdvBadge statut={rdv.statut} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 gap-3"
                >
                  <Calendar size={36} strokeWidth={1.2} className="text-slate-300" />
                  <p className="text-[13px] font-medium text-slate-400">
                    Aucun rendez-vous ce jour
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between">
          <p className="text-[12px] text-slate-400 font-medium">
            {rdvDuJour.length} rendez-vous ce jour
          </p>
          <button
            onClick={onClose}
            className="h-9 px-5 bg-[#9b95c9] text-white rounded-xl text-[12px] font-semibold hover:bg-[#7068a8] transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ════ PAGE PRINCIPALE ════ */
export default function SecretaireMedecins() {
  const [medecins, setMedecins]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [medecinSelectionne, setMedecinSelectionne] = useState(null);
  const [search, setSearch]                   = useState('');
  const [filtreStatut, setFiltreStatut]       = useState('Tous');
  const [showFilters, setShowFilters]         = useState(false);

  // Charger les médecins depuis le backend
  useEffect(() => {
    const fetchMedecins = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await secretaireMedecinService.getAll();
     const adapted = data.map(m => ({
  id:            m.id,
  initiales:     `${m.prenom?.[0] || ''}${m.nom?.[0] || ''}`.toUpperCase(),
  nom:           `Dr. ${m.prenom} ${m.nom}`,
  specialite:    m.specialiteNom || 'Oncologie',
  telephone:     m.telephone || '—',
  email:         m.email || '—',
  photoProfil:   m.photoProfil || null,
  numeroOrdre:   m.numeroOrdre || '—',  // ← ajout
  status:        'disponible',
  nbPatients:    m.nbPatients    || 0,  // ← vient du backend
  rdvAujourdhui: m.rdvAujourdhui || 0  // ← vient du backend
}));
        setMedecins(adapted);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les médecins');
      } finally {
        setLoading(false);
      }
    };
    fetchMedecins();
  }, []);

  // Statistiques calculées
  const totalPatients  = medecins.reduce((s, m) => s + m.nbPatients, 0);
  const totalRdv       = medecins.reduce((s, m) => s + m.rdvAujourdhui, 0);
  const nbDisponibles  = medecins.filter(m => m.status === 'disponible').length;

  // Filtrage
  const filteredMedecins = useMemo(() => {
    const q = search.toLowerCase();
    return medecins.filter(m => {
      const matchSearch = !q
        || m.nom.toLowerCase().includes(q)
        || m.specialite.toLowerCase().includes(q)
        || m.email.toLowerCase().includes(q);
      const matchStatut = filtreStatut === 'Tous'
        || m.status === filtreStatut;
      return matchSearch && matchStatut;
    });
  }, [medecins, search, filtreStatut]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#9b95c9]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={32} className="text-red-500" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#9b95c9] text-white rounded-xl text-sm font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-black text-slate-900">Médecins</h2>
        <p className="text-[12px] text-slate-400 font-medium mt-0.5">
          {medecins.length} médecin{medecins.length > 1 ? 's' : ''} enregistré{medecins.length > 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Recherche + Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher médecin, spécialité…"
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 outline-none focus:border-[#9b95c9] focus:ring-2 focus:ring-[#9b95c9]/10 transition-all placeholder:text-slate-300"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 h-11 px-4 rounded-xl border text-[13px] font-medium transition-colors ${
            showFilters || filtreStatut !== 'Tous'
              ? 'bg-[#9b95c9] border-[#9b95c9] text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter size={15} />
          Filtres
          {filtreStatut !== 'Tous' && (
            <span className="w-2 h-2 rounded-full bg-[#D4537E]" />
          )}
        </button>
      </div>

      {/* Filtres expandables */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="flex flex-col gap-1.5 min-w-[160px]">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Statut
                </label>
                <select
                  value={filtreStatut}
                  onChange={e => setFiltreStatut(e.target.value)}
                  className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none"
                >
                  <option value="Tous">Tous</option>
                  <option value="disponible">Disponible</option>
                  <option value="consultation">En consultation</option>
                  <option value="pause">En pause</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              {filtreStatut !== 'Tous' && (
                <div className="flex items-end">
                  <button
                    onClick={() => setFiltreStatut('Tous')}
                    className="flex items-center gap-1.5 h-9 px-3 text-[12px] text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                  >
                    <X size={13} /> Réinitialiser
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grille médecins */}
      {filteredMedecins.length > 0 ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Users size={36} strokeWidth={1.2} className="text-slate-300" />
          <p className="text-[13px] font-medium text-slate-400">
            Aucun médecin trouvé
          </p>
        </div>
      )}

      {/* Tableau récapitulatif */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Stethoscope size={17} className="text-slate-400" strokeWidth={1.8} />
          <h3 className="text-[14px] font-bold text-slate-800">
            Récapitulatif de la journée
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Médecin', 'Spécialité', 'Statut', 'Patients', 'RDV / jour', 'Planning'].map((h, i) => (
                  <th
                    key={i}
                    className={`py-3 px-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest ${
                      i >= 3 ? 'text-center' : 'text-left'
                    } ${i === 2 ? 'hidden sm:table-cell' : ''} ${i === 5 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medecins.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      {m.photoProfil ? (
                        <img
                          src={`http://localhost:8080/${m.photoProfil}`}
                          alt={m.nom}
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#f0effe] text-[#9b95c9] flex items-center justify-center text-[10px] font-black shrink-0">
                          {m.initiales}
                        </div>
                      )}
                      <span className="text-[13px] font-semibold text-slate-800">
                        {m.nom}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-[12px] text-slate-500">{m.specialite}</span>
                  </td>
                  <td className="py-3.5 px-5 hidden sm:table-cell">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="text-[13px] font-bold text-slate-700">
                      {m.nbPatients}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#FBEAF0] text-[#D4537E] text-[13px] font-bold">
                      {m.rdvAujourdhui}
                    </span>
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

      {/* Modal planning */}
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