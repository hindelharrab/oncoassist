import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Stethoscope,
  X,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  MapPin,
  Filter,
} from 'lucide-react';

/* ─── Animations ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut', delay },
});

/* ════════════════════════════════════════
   BADGE STATUT
═══════════════════════════════════════ */
const StatutBadge = ({ statut, small }) => {
  const map = {
    CONFIRME:   { label: 'Confirmé',   className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    EN_ATTENTE: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
    ANNULE:     { label: 'Annulé',     className: 'bg-red-50 text-red-600 border-red-200',             dot: 'bg-red-500' },
  };
  const s = map[statut] || map.EN_ATTENTE;
  if (small) {
    return <span className={`w-2 h-2 rounded-full ${s.dot} shrink-0`} />;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${s.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

/* ════════════════════════════════════════
   HELPERS DATE
═══════════════════════════════════════ */
const getLundiDeSemaine = (offsetSemaines = 0) => {
  const d = new Date();
  const jour = d.getDay();
  const diff = d.getDate() - jour + (jour === 0 ? -6 : 1) + offsetSemaines * 7;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addJours = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const formatDate = (date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/* ════════════════════════════════════════
   DONNÉES RDV (mock)
═══════════════════════════════════════ */
const RDV_MOCK = [
  { id: 1,  jourOffset: 0, heure: '08:30', duree: 30, patient: 'Salma Bennani',   medecin: 'El Harrab', motif: 'Consultation',    lieu: 'Salle 1', statut: 'CONFIRME' },
  { id: 2,  jourOffset: 0, heure: '10:00', duree: 45, patient: 'Karim Doukkali',  medecin: 'Benali',    motif: 'Échographie',     lieu: 'Salle 2', statut: 'CONFIRME' },
  { id: 3,  jourOffset: 0, heure: '11:30', duree: 30, patient: 'Fatima Zahraoui', medecin: 'El Harrab', motif: 'Résultats',       lieu: 'Salle 1', statut: 'EN_ATTENTE' },
  { id: 4,  jourOffset: 0, heure: '14:00', duree: 60, patient: 'Ahmed Salah',     medecin: 'Ibrahim',   motif: 'Chimiothérapie',  lieu: 'Hôpital J.', statut: 'CONFIRME' },
  { id: 5,  jourOffset: 0, heure: '15:30', duree: 20, patient: 'Nadia Chraibi',   medecin: 'El Harrab', motif: 'Suivi',           lieu: 'Salle 1', statut: 'ANNULE' },
  { id: 6,  jourOffset: 1, heure: '09:00', duree: 30, patient: 'Yassir Alami',    medecin: 'Benali',    motif: 'Biopsie',         lieu: 'Salle 3', statut: 'CONFIRME' },
  { id: 7,  jourOffset: 1, heure: '11:00', duree: 45, patient: 'Amina Bensalah',  medecin: 'Ibrahim',   motif: 'Chimio B-4',      lieu: 'Hôpital J.', statut: 'EN_ATTENTE' },
  { id: 8,  jourOffset: 2, heure: '08:00', duree: 30, patient: 'Omar El Fassi',   medecin: 'El Harrab', motif: 'Consultation',    lieu: 'Salle 1', statut: 'CONFIRME' },
  { id: 9,  jourOffset: 2, heure: '13:30', duree: 30, patient: 'Laila Moussaoui', medecin: 'Benali',    motif: 'Suivi traitement',lieu: 'Salle 2', statut: 'CONFIRME' },
  { id: 10, jourOffset: 3, heure: '10:30', duree: 90, patient: 'Karim Doukkali',  medecin: 'Ibrahim',   motif: 'Radiothérapie',   lieu: 'Hôpital J.', statut: 'CONFIRME' },
  { id: 11, jourOffset: 4, heure: '09:30', duree: 30, patient: 'Fatima Zahraoui', medecin: 'El Harrab', motif: 'Contrôle',        lieu: 'Salle 1', statut: 'EN_ATTENTE' },
  { id: 12, jourOffset: 4, heure: '14:30', duree: 30, patient: 'Nadia Chraibi',   medecin: 'Benali',    motif: 'Suivi',           lieu: 'Salle 2', statut: 'CONFIRME' },
];

/* ════════════════════════════════════════
   CHAMP FORMULAIRE
═══════════════════════════════════════ */
const inputClass =
  'w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:border-[#7F77DD] focus:ring-2 focus:ring-[#7F77DD]/10 transition-all placeholder:text-slate-300';

const FormField = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
      {label} {required && <span className="text-[#D4537E]">*</span>}
    </label>
    {children}
  </div>
);

/* ════════════════════════════════════════
   MODAL CRÉER / MODIFIER RDV
═══════════════════════════════════════ */
const ModalRdv = ({ rdv, onClose, onSave }) => {
  const [form, setForm] = useState({
    patient:  rdv?.patient  || '',
    medecin:  rdv?.medecin  || '',
    date:     rdv?.date     || '',
    heure:    rdv?.heure    || '',
    motif:    rdv?.motif    || '',
    lieu:     rdv?.lieu     || '',
    statut:   rdv?.statut   || 'EN_ATTENTE',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isEdit = !!rdv;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7F77DD] flex items-center justify-center shadow-sm">
              <CalendarDays size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                {isEdit ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Remplissez les informations</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Corps */}
        <div className="px-6 py-5 space-y-4">
          <FormField label="Patient" required>
            <select className={inputClass} value={form.patient} onChange={set('patient')}>
              <option value="">Sélectionner un patient…</option>
              <option>Salma Bennani — #P-9821</option>
              <option>Yassir Alami — #P-5512</option>
              <option>Fatima Zahraoui — #P-2104</option>
              <option>Karim Doukkali — #P-7742</option>
              <option>Nadia Chraibi — #P-3301</option>
              <option>Amina Bensalah — #P-8840</option>
            </select>
          </FormField>

          <FormField label="Médecin" required>
            <select className={inputClass} value={form.medecin} onChange={set('medecin')}>
              <option value="">Sélectionner un médecin…</option>
              <option value="El Harrab">Dr. El Harrab — Oncologie digestive</option>
              <option value="Benali">Dr. Benali — Radiothérapie</option>
              <option value="Ibrahim">Dr. Ibrahim — Chimiothérapie</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" required>
              <input type="date" className={inputClass} value={form.date} onChange={set('date')} />
            </FormField>
            <FormField label="Heure" required>
              <input type="time" className={inputClass} value={form.heure} onChange={set('heure')} />
            </FormField>
          </div>

          <FormField label="Motif de la consultation" required>
            <input className={inputClass} placeholder="Ex : Consultation post-opératoire" value={form.motif} onChange={set('motif')} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Lieu">
              <select className={inputClass} value={form.lieu} onChange={set('lieu')}>
                <option value="">Choisir…</option>
                <option>Salle 1</option>
                <option>Salle 2</option>
                <option>Salle 3</option>
                <option>Hôpital J.</option>
                <option>À distance</option>
              </select>
            </FormField>
            <FormField label="Statut">
              <select className={inputClass} value={form.statut} onChange={set('statut')}>
                <option value="EN_ATTENTE">En attente</option>
                <option value="CONFIRME">Confirmé</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Pied */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="text-[12px] font-medium text-slate-500 hover:text-slate-700 transition-colors">
            Annuler
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            disabled={!form.patient || !form.medecin || !form.date || !form.heure || !form.motif}
            className="flex items-center gap-2 h-10 px-6 bg-[#7F77DD] text-white rounded-xl text-[13px] font-semibold hover:bg-[#6b64c8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <CheckCircle2 size={15} />
            {isEdit ? 'Enregistrer' : 'Créer le RDV'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ════════════════════════════════════════
   VUE SEMAINE
═══════════════════════════════════════ */
const VueSemaine = ({ rdvList, offsetSemaine, filtreMedecin, onEdit }) => {
  const lundi = getLundiDeSemaine(offsetSemaine);
  const jours = JOURS_SEMAINE.map((j, i) => ({
    label: j,
    date: addJours(lundi, i),
  }));

  const rdvDuJour = (jourOffset) =>
    rdvList.filter((r) => {
      const matchJour    = r.jourOffset === jourOffset;
      const matchMedecin = filtreMedecin === 'Tous' || r.medecin === filtreMedecin;
      return matchJour && matchMedecin;
    });

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Headers */}
      {jours.map((j, i) => {
        const isToday = j.date.toDateString() === new Date().toDateString();
        return (
          <div key={i} className={`text-center py-3 rounded-xl border ${isToday ? 'bg-[#7F77DD] border-[#7F77DD]' : 'bg-white border-slate-100'}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-widest ${isToday ? 'text-white/80' : 'text-slate-400'}`}>{j.label}</p>
            <p className={`text-[16px] font-black leading-tight mt-0.5 ${isToday ? 'text-white' : 'text-slate-700'}`}>{j.date.getDate()}</p>
            <p className={`text-[10px] font-medium ${isToday ? 'text-white/70' : 'text-slate-400'}`}>
              {j.date.toLocaleDateString('fr-FR', { month: 'short' })}
            </p>
          </div>
        );
      })}

      {/* Colonnes RDV */}
      {jours.map((_, i) => {
        const rdvs = rdvDuJour(i);
        return (
          <div key={i} className="space-y-2 min-h-[200px]">
            {rdvs.length === 0 ? (
              <div className="h-24 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 font-medium">Libre</span>
              </div>
            ) : (
              rdvs.map((rdv) => {
                const colorMap = {
                  CONFIRME:   'border-l-emerald-500 bg-emerald-50/60',
                  EN_ATTENTE: 'border-l-amber-500 bg-amber-50/60',
                  ANNULE:     'border-l-red-400 bg-red-50/60 opacity-60',
                };
                return (
                  <button
                    key={rdv.id}
                    onClick={() => onEdit(rdv)}
                    className={`w-full text-left p-2 rounded-xl border border-slate-100 border-l-4 ${colorMap[rdv.statut]} hover:shadow-sm transition-all`}
                  >
                    <p className="text-[11px] font-bold text-slate-800 leading-none truncate">{rdv.heure}</p>
                    <p className="text-[10px] text-slate-600 font-medium mt-1 truncate">{rdv.patient}</p>
                    <p className="text-[10px] text-slate-400 truncate">{rdv.motif}</p>
                  </button>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ════════════════════════════════════════
   VUE LISTE
═══════════════════════════════════════ */
const VueListe = ({ rdvList, filtreMedecin, onEdit }) => {
  const filtered = rdvList.filter(
    (r) => filtreMedecin === 'Tous' || r.medecin === filtreMedecin
  );

  const grouped = filtered.reduce((acc, rdv) => {
    const key = JOURS_SEMAINE[rdv.jourOffset] || 'Autre';
    if (!acc[key]) acc[key] = [];
    acc[key].push(rdv);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([jour, rdvs]) => (
        <div key={jour}>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">{jour}</p>
          <div className="space-y-2">
            {rdvs.map((rdv) => (
              <motion.div
                key={rdv.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#7F77DD]/30 hover:shadow-sm transition-all group cursor-pointer"
                onClick={() => onEdit(rdv)}
              >
                <div className="w-14 text-center shrink-0">
                  <p className="text-[14px] font-black text-slate-800 leading-none">{rdv.heure}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{rdv.duree} min</p>
                </div>
                <div className="w-px h-10 bg-slate-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 truncate">{rdv.patient}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500">Dr. {rdv.medecin}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[11px] text-[#7F77DD] font-medium">{rdv.motif}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                    <MapPin size={12} strokeWidth={1.8} />
                    <span className="text-[11px]">{rdv.lieu}</span>
                  </div>
                  <StatutBadge statut={rdv.statut} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-3">
          <CalendarDays size={40} strokeWidth={1.2} />
          <p className="text-[13px] font-medium text-slate-400">Aucun rendez-vous cette semaine</p>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════ */
export default function SecretairePlanning() {
  const [offsetSemaine, setOffsetSemaine] = useState(0);
  const [vue, setVue]                     = useState('semaine'); // 'semaine' | 'liste'
  const [filtreMedecin, setFiltreMedecin] = useState('Tous');
  const [showModal, setShowModal]         = useState(false);
  const [rdvEdite, setRdvEdite]           = useState(null);
  const [rdvList, setRdvList]             = useState(RDV_MOCK);

  const lundi    = getLundiDeSemaine(offsetSemaine);
  const dimanche = addJours(lundi, 6);

  const labelSemaine =
    offsetSemaine === 0
      ? 'Semaine actuelle'
      : `${formatDate(lundi)} – ${formatDate(dimanche)}`;

  const handleSave = (form) => {
    if (rdvEdite) {
      setRdvList((prev) => prev.map((r) => (r.id === rdvEdite.id ? { ...r, ...form } : r)));
    } else {
      setRdvList((prev) => [...prev, { ...form, id: Date.now(), jourOffset: 0 }]);
    }
    setRdvEdite(null);
  };

  const handleEdit = (rdv) => {
    setRdvEdite(rdv);
    setShowModal(true);
  };

  const totalSemaine  = rdvList.filter((r) => r.jourOffset >= 0 && r.jourOffset <= 6).length;
  const nbConfirmes   = rdvList.filter((r) => r.statut === 'CONFIRME').length;
  const nbAttente     = rdvList.filter((r) => r.statut === 'EN_ATTENTE').length;

  return (
    <div className="space-y-5 pb-8">

      {/* ── En-tête ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Planning & RDV</h2>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">{labelSemaine}</p>
        </div>
        <button
          onClick={() => { setRdvEdite(null); setShowModal(true); }}
          className="flex items-center gap-2 h-10 px-5 bg-[#7F77DD] text-white rounded-xl text-[13px] font-semibold hover:bg-[#6b64c8] transition-colors shadow-sm shrink-0"
        >
          <Plus size={16} /> Nouveau RDV
        </button>
      </motion.div>

      {/* ── Stats rapides ── */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-3 gap-4">
        {[
          { label: 'RDV cette semaine', value: totalSemaine, color: 'text-[#7F77DD]', bg: 'bg-[#EEEDFE]' },
          { label: 'Confirmés',         value: nbConfirmes,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'En attente',        value: nbAttente,    color: 'text-amber-600',   bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-black ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Barre de contrôles ── */}
      <motion.div {...fadeUp(0.1)} className="flex flex-wrap items-center justify-between gap-3">
        {/* Navigation semaine */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setOffsetSemaine((o) => o - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#7F77DD] hover:bg-[#EEEDFE] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[12px] font-semibold text-slate-600 px-2 min-w-[140px] text-center">
            {labelSemaine}
          </span>
          <button
            onClick={() => setOffsetSemaine((o) => o + 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#7F77DD] hover:bg-[#EEEDFE] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtre médecin */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filtreMedecin}
              onChange={(e) => setFiltreMedecin(e.target.value)}
              className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-[12px] font-medium text-slate-600 outline-none focus:border-[#7F77DD] transition-colors"
            >
              {['Tous', 'El Harrab', 'Benali', 'Ibrahim'].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Toggle vue */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setVue('semaine')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${vue === 'semaine' ? 'bg-[#7F77DD] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={13} /> Semaine
            </button>
            <button
              onClick={() => setVue('liste')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${vue === 'liste' ? 'bg-[#7F77DD] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={13} /> Liste
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Légende statuts ── */}
      <motion.div {...fadeUp(0.12)} className="flex flex-wrap items-center gap-4 px-1">
        {[
          { label: 'Confirmé',   dot: 'bg-emerald-500' },
          { label: 'En attente', dot: 'bg-amber-500' },
          { label: 'Annulé',     dot: 'bg-red-400' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${s.dot}`} />
            <span className="text-[11px] text-slate-500 font-medium">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* ── Vue calendrier / liste ── */}
      <motion.div {...fadeUp(0.15)} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 overflow-x-auto">
        <AnimatePresence mode="wait">
          {vue === 'semaine' ? (
            <motion.div
              key="semaine"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
            >
              <VueSemaine
                rdvList={rdvList}
                offsetSemaine={offsetSemaine}
                filtreMedecin={filtreMedecin}
                onEdit={handleEdit}
              />
            </motion.div>
          ) : (
            <motion.div
              key="liste"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              <VueListe
                rdvList={rdvList}
                filtreMedecin={filtreMedecin}
                onEdit={handleEdit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Modal RDV ── */}
      <AnimatePresence>
        {showModal && (
          <ModalRdv
            rdv={rdvEdite}
            onClose={() => { setShowModal(false); setRdvEdite(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}