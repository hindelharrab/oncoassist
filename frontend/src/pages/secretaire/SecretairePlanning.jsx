import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus,
  Clock, X, CheckCircle2, LayoutGrid, List,
  MapPin, Loader2, AlertCircle
} from 'lucide-react';
import secretaireRendezVousService
  from '../../services/secretaireRendezVousService';
import secretairePatientService
  from '../../services/secretairePatientService';
import secretaireMedecinService
  from '../../services/secretaireMedecinService';

/* ─── Animations ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut', delay },
});

/* ─── Config statuts ─── */
const STATUT_CFG = {
  CONFIRME:   {
    label: 'Confirmé',
    pill:  'bg-violet-50 text-violet-700 border-violet-200',
    dot:   'bg-violet-500',
    card:  'border-l-violet-400 bg-violet-50/50',
  },
  PLANIFIE:   {
    label: 'Confirmé',
    pill:  'bg-violet-50 text-violet-700 border-violet-200',
    dot:   'bg-violet-500',
    card:  'border-l-violet-400 bg-violet-50/50',
  },
  EN_ATTENTE: {
    label: 'En attente',
    pill:  'bg-rose-50 text-rose-600 border-rose-200',
    dot:   'bg-rose-400',
    card:  'border-l-rose-400 bg-rose-50/40',
  },
  ANNULE: {
    label: 'Annulé',
    pill:  'bg-slate-800 text-slate-200 border-slate-700',
    dot:   'bg-slate-600',
    card:  'border-l-slate-600 bg-slate-100',
  },
  EFFECTUE: {
    label: 'Effectué',
    pill:  'bg-sky-50 text-sky-600 border-sky-200',
    dot:   'bg-sky-500',
    card:  'border-l-sky-400 bg-sky-50/40',
  },
};

/* ─── Badge statut ─── */
const StatutBadge = ({ statut, small }) => {
  const s = STATUT_CFG[statut] || STATUT_CFG.EN_ATTENTE;
  if (small) return (
    <span className={`w-2 h-2 rounded-full ${s.dot} shrink-0`} />
  );
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

/* ─── Helpers date ─── */
const getLundiDeSemaine = (offsetSemaines = 0) => {
  const d = new Date();
  const jour = d.getDay();
  const diff = d.getDate() - jour
    + (jour === 0 ? -6 : 1)
    + offsetSemaines * 7;
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
  date.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short'
  });

const JOURS_SEMAINE =
  ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/* ─── Champ formulaire ─── */
const inputClass =
  'w-full h-11 px-4 bg-slate-50 border border-slate-200 ' +
  'rounded-xl text-[13px] font-medium text-slate-800 outline-none ' +
  'focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 ' +
  'transition-all placeholder:text-slate-300';

const FormField = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    {children}
  </div>
);

/* ════════════════════════════════════════
   MODAL RDV
═══════════════════════════════════════ */
const ModalRdv = ({
  rdv, onClose, onSave, patients, medecins, saving
}) => {
  const [form, setForm] = useState({
    patientId: rdv?.patientId || '',
    medecinId: rdv?.medecinId || '',
    date:      rdv?.date
                 ? new Date(rdv.date)
                     .toISOString().split('T')[0]
                 : '',
    heure:     rdv?.heure  || '',
    motif:     rdv?.motif  || '',
    lieu:      rdv?.lieu   || '',
    statut:    rdv?.statut || 'EN_ATTENTE',
  });
  const [error, setError] = useState(null);

  const set = (k) => (e) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const isEdit = !!rdv?.id;
  const canSave = form.patientId && form.medecinId
    && form.date && form.heure && form.motif;

  const handleSubmit = async () => {
    if (!canSave) return;
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message
        || 'Erreur lors de l\'enregistrement'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}
            >
              <CalendarDays size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                {isEdit ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Remplissez les informations
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[12px]">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <FormField label="Patient" required>
            <select className={inputClass}
              value={form.patientId}
              onChange={set('patientId')}>
              <option value="">Sélectionner un patient…</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.prenom} {p.nom} — {p.email}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Médecin" required>
            <select className={inputClass}
              value={form.medecinId}
              onChange={set('medecinId')}>
              <option value="">Sélectionner un médecin…</option>
              {medecins.map(m => (
                <option key={m.id} value={m.id}>
                  Dr. {m.prenom} {m.nom}
                  {m.specialiteNom ? ` — ${m.specialiteNom}` : ''}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" required>
              <input type="date" className={inputClass}
                value={form.date} onChange={set('date')} />
            </FormField>
            <FormField label="Heure" required>
              <input type="time" className={inputClass}
                value={form.heure} onChange={set('heure')} />
            </FormField>
          </div>

          <FormField label="Motif" required>
            <input className={inputClass}
              placeholder="Ex : Consultation post-opératoire"
              value={form.motif} onChange={set('motif')} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Lieu">
              <select className={inputClass}
                value={form.lieu} onChange={set('lieu')}>
                <option value="">Choisir…</option>
                <option>Salle 1</option>
                <option>Salle 2</option>
                <option>Salle 3</option>
                <option>Hôpital J.</option>
                <option>À distance</option>
              </select>
            </FormField>
            <FormField label="Statut">
              <select className={inputClass}
                value={form.statut} onChange={set('statut')}>
                <option value="EN_ATTENTE">En attente</option>
                <option value="PLANIFIE">Confirmé</option>
                <option value="ANNULE">Annulé</option>
                <option value="EFFECTUE">Effectué</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose}
            className="text-[12px] font-medium text-slate-500 hover:text-slate-700">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSave || saving}
            className="flex items-center gap-2 h-10 px-6 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            style={{
              background: canSave && !saving
                ? 'linear-gradient(135deg,#7c3aed,#db2777)'
                : '#94a3b8'
            }}
          >
            {saving
              ? <Loader2 size={15} className="animate-spin" />
              : <CheckCircle2 size={15} />
            }
            {saving ? 'Enregistrement...'
              : isEdit ? 'Enregistrer' : 'Créer le RDV'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ════════════════════════════════════════
   VUE SEMAINE
═══════════════════════════════════════ */
const VueSemaine = ({
  rdvList, offsetSemaine, filtreMedecin, onEdit
}) => {
  const lundi = getLundiDeSemaine(offsetSemaine);
  const jours = JOURS_SEMAINE.map((j, i) => ({
    label: j, date: addJours(lundi, i)
  }));
const rdvDuJour = (jourOffset) =>
  rdvList.filter(r => {
    const matchJour = r.jourOffset === jourOffset;
    const matchMed = filtreMedecin === 'Tous'
      || r.medecin?.toLowerCase().includes(filtreMedecin.toLowerCase());
    return matchJour && matchMed;
  });

  return (
    <div className="grid grid-cols-7 gap-2">
      {jours.map((j, i) => {
        const isToday =
          j.date.toDateString() === new Date().toDateString();
        return (
          <div key={i} className={`text-center py-3 rounded-xl border transition-all ${
            isToday
              ? 'border-violet-200 bg-violet-50'
              : 'bg-slate-50 border-slate-100'
          }`}>
            <p className={`text-[10px] font-semibold uppercase tracking-widest ${
              isToday ? 'text-violet-500' : 'text-slate-400'
            }`}>{j.label}</p>
            <p className={`text-[16px] font-black leading-tight mt-0.5 ${
              isToday ? 'text-violet-700' : 'text-slate-700'
            }`}>{j.date.getDate()}</p>
            <p className={`text-[10px] font-medium ${
              isToday ? 'text-violet-400' : 'text-slate-400'
            }`}>
              {j.date.toLocaleDateString('fr-FR', { month: 'short' })}
            </p>
          </div>
        );
      })}

      {jours.map((_, i) => {
        const rdvs = rdvDuJour(i);
        return (
          <div key={i} className="space-y-2 min-h-[200px]">
            {rdvs.length === 0 ? (
              <div className="h-24 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 font-medium">
                  Libre
                </span>
              </div>
            ) : (
              rdvs.map(rdv => {
                const c = STATUT_CFG[rdv.statut]
                  || STATUT_CFG.EN_ATTENTE;
                return (
                  <button
                    key={rdv.id}
                    onClick={() => onEdit(rdv)}
                    className={`w-full text-left p-2 rounded-xl border border-slate-100 border-l-4 ${c.card} hover:shadow-sm transition-all`}
                  >
                    <p className="text-[11px] font-bold text-slate-800 leading-none truncate">
                      {rdv.heure}
                    </p>
                    <p className="text-[10px] text-slate-600 font-medium mt-1 truncate">
                      {rdv.patient}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {rdv.motif}
                    </p>
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
  const filtered = rdvList.filter(r =>
    filtreMedecin === 'Tous'
    || r.medecin?.toLowerCase()
        .includes(filtreMedecin.toLowerCase())
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
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            {jour}
          </p>
          <div className="space-y-2">
            {rdvs.map(rdv => {
              const c = STATUT_CFG[rdv.statut]
                || STATUT_CFG.EN_ATTENTE;
              return (
                <motion.div
                  key={rdv.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => onEdit(rdv)}
                >
                  <div className="w-14 text-center shrink-0">
                    <p className="text-[14px] font-black text-slate-800 leading-none">
                      {rdv.heure}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {rdv.duree} min
                    </p>
                  </div>
                  <div className="w-px h-10 bg-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 truncate">
                      {rdv.patient}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500">
                        Dr. {rdv.medecin}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-[11px] text-violet-500 font-medium">
                        {rdv.motif}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {rdv.lieu && (
                      <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                        <MapPin size={12} strokeWidth={1.8} />
                        <span className="text-[11px]">{rdv.lieu}</span>
                      </div>
                    )}
                    <StatutBadge statut={rdv.statut} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <CalendarDays size={40} strokeWidth={1.2} className="text-slate-300" />
          <p className="text-[13px] font-medium text-slate-400">
            Aucun rendez-vous cette semaine
          </p>
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
  const [vue, setVue]                     = useState('semaine');
  const [filtreMedecin, setFiltreMedecin] = useState('Tous');
  const [showModal, setShowModal]         = useState(false);
  const [rdvEdite, setRdvEdite]           = useState(null);
  const [rdvList, setRdvList]             = useState([]);
  const [patients, setPatients]           = useState([]);
  const [medecins, setMedecins]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState(null);

  const lundi    = getLundiDeSemaine(offsetSemaine);
  const dimanche = addJours(lundi, 6);
  const labelSemaine = offsetSemaine === 0
    ? 'Semaine actuelle'
    : `${formatDate(lundi)} – ${formatDate(dimanche)}`;

  // Charger données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rdvs, pts, meds] = await Promise.all([
          secretaireRendezVousService.getPlanning(lundi),
          secretairePatientService.getAll(),
          secretaireMedecinService.getAll()
        ]);

        // Adapter format backend → frontend
        const adapted = rdvs.map(r => ({
          id:         r.id,
          jourOffset: r.jourOffset ?? 0,
          heure:      r.heure || '—',
          duree:      r.duree || 30,
          patient:    r.patientNom
                        ? `${r.patientPrenom} ${r.patientNom}`
                        : '—',
          patientId:  r.patientId,
          medecin:    r.medecinNom || '—',
          medecinId:  r.medecinId,
          motif:      r.motif || '',
          lieu:       r.lieu  || '',
          statut:     r.statut
                        ? r.statut.toString()
                        : 'EN_ATTENTE',
          date:       r.date
        }));

        setRdvList(adapted);
        setPatients(pts);
        setMedecins(meds);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger le planning');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [offsetSemaine]);

  // Sauvegarder RDV
  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = {
        patientId: form.patientId,
        medecinId: form.medecinId,
        date:      `${form.date}T${form.heure}:00`,
        motif:     form.motif,
        lieu:      form.lieu,
        statut:    form.statut
      };

      if (rdvEdite?.id) {
        const updated = await secretaireRendezVousService
          .modifier(rdvEdite.id, payload);
        setRdvList(prev => prev.map(r =>
          r.id === rdvEdite.id
            ? {
                ...r,
                motif:  updated.motif,
                lieu:   updated.lieu,
                statut: updated.statut?.toString()
                        || r.statut,
                heure:  updated.heure || r.heure
              }
            : r
        ));
      } else {
        const created = await secretaireRendezVousService
          .creer(payload);
        const patient = patients.find(
          p => p.id === form.patientId
        );
        const medecin = medecins.find(
          m => m.id === form.medecinId
        );
        setRdvList(prev => [...prev, {
          id:         created.id,
          jourOffset: new Date(created.date || form.date)
                        .getDay() - 1,
          heure:      form.heure,
          duree:      30,
          patient:    patient
                        ? `${patient.prenom} ${patient.nom}`
                        : '—',
          patientId:  form.patientId,
          medecin:    medecin
                        ? medecin.nom
                        : '—',
          medecinId:  form.medecinId,
          motif:      form.motif,
          lieu:       form.lieu,
          statut:     form.statut,
          date:       created.date
        }]);
      }

      setShowModal(false);
      setRdvEdite(null);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (rdv) => {
    setRdvEdite(rdv);
    setShowModal(true);
  };

  const totalSemaine = rdvList.length;
  const nbConfirmes  = rdvList.filter(r =>
    r.statut === 'CONFIRME' || r.statut === 'PLANIFIE'
  ).length;
  const nbAttente    = rdvList.filter(r =>
    r.statut === 'EN_ATTENTE'
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-violet-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={32} className="text-red-500" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => setOffsetSemaine(o => o)}
          className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <motion.div {...fadeUp(0)}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-[1.6rem] font-black text-slate-900 leading-none"
            style={{ letterSpacing: '-0.03em' }}
          >
            Planning &{' '}
            <span style={{
              background: 'linear-gradient(135deg,#7c3aed,#db2777)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              RDV
            </span>
          </h2>
          <p className="text-[12px] text-slate-400 font-medium mt-1">
            {labelSemaine}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setRdvEdite(null); setShowModal(true); }}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[12px] font-bold text-white shadow-sm shrink-0"
          style={{ background: '#0f172a' }}
        >
          <Plus size={15} /> Nouveau RDV
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.05)}
        className="grid grid-cols-3 gap-4">
        {[
          { label: 'RDV cette semaine', value: totalSemaine,
            color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Confirmés', value: nbConfirmes,
            color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'En attente', value: nbAttente,
            color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((s, i) => (
          <div key={i}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              {s.label}
            </p>
            <p className={`text-2xl font-black ${s.color} mt-1`}>
              {s.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Contrôles */}
      <motion.div {...fadeUp(0.1)}
        className="flex flex-wrap items-center justify-between gap-3">

        {/* Navigation semaine */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setOffsetSemaine(o => o - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[12px] font-semibold text-slate-600 px-3 min-w-[140px] text-center">
            {labelSemaine}
          </span>
          <button
            onClick={() => setOffsetSemaine(o => o + 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtre médecin */}
          <div className="relative flex items-center">
            <svg className="absolute left-3 text-slate-400 pointer-events-none"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un médecin…"
              value={filtreMedecin === 'Tous' ? '' : filtreMedecin}
              onChange={e => setFiltreMedecin(
                e.target.value === '' ? 'Tous' : e.target.value
              )}
              className="h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 outline-none focus:border-violet-400 transition-all placeholder:text-slate-300 w-52"
            />
            {filtreMedecin !== 'Tous' && (
              <button
                onClick={() => setFiltreMedecin('Tous')}
                className="absolute right-2.5 text-slate-300 hover:text-slate-500"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Toggle vue */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {[
              { key: 'semaine', icon: LayoutGrid, label: 'Semaine' },
              { key: 'liste',   icon: List,       label: 'Liste' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setVue(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  vue === key
                    ? 'text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                style={vue === key
                  ? { background: 'linear-gradient(135deg,#7c3aed,#db2777)' }
                  : {}
                }
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Légende */}
      <motion.div {...fadeUp(0.12)}
        className="flex flex-wrap items-center gap-5 px-1">
        {Object.values(STATUT_CFG)
          .filter((s, i, arr) =>
            arr.findIndex(x => x.label === s.label) === i
          )
          .map(({ label, dot }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-[11px] text-slate-500 font-medium">
                {label}
              </span>
            </div>
          ))}
      </motion.div>

      {/* Vue calendrier / liste */}
      <motion.div {...fadeUp(0.15)}
        className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 overflow-x-auto">
        <AnimatePresence mode="wait">
          {vue === 'semaine' ? (
            <motion.div key="semaine"
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
            <motion.div key="liste"
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ModalRdv
            rdv={rdvEdite}
            onClose={() => {
              setShowModal(false);
              setRdvEdite(null);
            }}
            onSave={handleSave}
            patients={patients}
            medecins={medecins}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}