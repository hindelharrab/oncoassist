import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus,
  Clock, X, CheckCircle2, LayoutGrid, List,
  MapPin, Loader2, AlertCircle
} from 'lucide-react';
import secretaireRendezVousService from '../../services/secretaireRendezVousService';
import secretairePatientService from '../../services/secretairePatientService';
import secretaireMedecinService from '../../services/secretaireMedecinService';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut', delay },
});

const STATUT_CFG = {
  PLANIFIE: {
    label: 'Planifié',
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
    pill:  'bg-slate-100 text-slate-600 border-slate-200',
    dot:   'bg-slate-400',
    card:  'border-l-slate-400 bg-slate-50',
  },
  EFFECTUE: {
    label: 'Effectué',
    pill:  'bg-sky-50 text-sky-600 border-sky-200',
    dot:   'bg-sky-500',
    card:  'border-l-sky-400 bg-sky-50/40',
  },
};

const StatutBadge = ({ statut, small }) => {
  const s = STATUT_CFG[statut] || STATUT_CFG.EN_ATTENTE;
  if (small) return <span className={`w-2 h-2 rounded-full ${s.dot} shrink-0`} />;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

/* ── Helpers date ── */
const getLundiDeSemaine = (offsetSemaines = 0) => {
  const d = new Date();
  const jour = d.getDay(); // 0=dim,1=lun,...,6=sam
  const diffVerLundi = jour === 0 ? -6 : 1 - jour;
  d.setDate(d.getDate() + diffVerLundi + offsetSemaines * 7);
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
════════════════════════════════════════ */
const ModalRdv = ({ rdv, onClose, onSave, patients, medecins, saving }) => {
  const [form, setForm] = useState({
    patientId: rdv?.patientId || '',
    medecinId: rdv?.medecinId || '',
    date:      rdv?.date ? new Date(rdv.date).toISOString().split('T')[0] : '',
    heure:     rdv?.heure || '',
    motif:     rdv?.motif || '',
    lieu:      rdv?.lieu  || '',
    statut:    rdv?.statut || 'PLANIFIE',
  });
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const isEdit = !!rdv?.id;
  const canSave = form.patientId && form.medecinId && form.date && form.heure && form.motif;

  const handleSubmit = async () => {
    if (!canSave) return;
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
              <CalendarDays size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                {isEdit ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Remplissez les informations</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[12px]">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <FormField label="Patient" required>
            <select className={inputClass} value={form.patientId} onChange={set('patientId')}>
              <option value="">Sélectionner un patient…</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.prenom} {p.nom} — {p.email}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Médecin" required>
            <select className={inputClass} value={form.medecinId} onChange={set('medecinId')}>
              <option value="">Sélectionner un médecin…</option>
              {medecins.map(m => (
                <option key={m.id} value={m.id}>
                  Dr. {m.prenom} {m.nom}{m.specialiteNom ? ` — ${m.specialiteNom}` : ''}
                </option>
              ))}
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
          <FormField label="Motif" required>
            <input className={inputClass} placeholder="Ex : Consultation post-opératoire"
              value={form.motif} onChange={set('motif')} />
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
                <option value="PLANIFIE">Planifié</option>
                <option value="ANNULE">Annulé</option>
                <option value="EFFECTUE">Effectué</option>
              </select>
            </FormField>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="text-[12px] font-medium text-slate-500 hover:text-slate-700">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={!canSave || saving}
            className="flex items-center gap-2 h-10 px-6 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            style={{ background: canSave && !saving ? 'linear-gradient(135deg,#7c3aed,#db2777)' : '#94a3b8' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer le RDV'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ════════════════════════════════════════
   MODAL PLANIFIER
════════════════════════════════════════ */
const ModalPlanifier = ({ rdv, onClose, onPlanifier, saving }) => {
  const [date, setDate]   = useState('');
  const [heure, setHeure] = useState('');
  const [lieu, setLieu]   = useState('');
  const [error, setError] = useState(null);

  const canSave = date && heure;

  const handleSubmit = async () => {
    if (!canSave) return;
    setError(null);
    try {
      await onPlanifier(rdv.id, `${date}T${heure}:00`, lieu);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la planification');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
              <Clock size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">Planifier le rendez-vous</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {rdv.patient} — Dr. {rdv.medecin}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
            <X size={16} />
          </button>
        </div>

        <div className="mx-6 mt-5 p-3 bg-violet-50 border border-violet-100 rounded-xl">
          <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-widest mb-1">
            Motif de la demande
          </p>
          <p className="text-[13px] text-slate-700 font-medium">{rdv.motif || '—'}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Demandé le{' '}
            {rdv.dateCreation
              ? new Date(rdv.dateCreation).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })
              : '—'}
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[12px]">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" required>
              <input type="date" className={inputClass} value={date}
                onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} />
            </FormField>
            <FormField label="Heure" required>
              <input type="time" className={inputClass} value={heure}
                onChange={e => setHeure(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Lieu">
            <select className={inputClass} value={lieu} onChange={e => setLieu(e.target.value)}>
              <option value="">Choisir…</option>
              <option>Salle 1</option>
              <option>Salle 2</option>
              <option>Salle 3</option>
              <option>Hôpital J.</option>
              <option>À distance</option>
            </select>
          </FormField>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="text-[12px] font-medium text-slate-500 hover:text-slate-700">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={!canSave || saving}
            className="flex items-center gap-2 h-10 px-6 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            style={{ background: canSave && !saving ? 'linear-gradient(135deg,#7c3aed,#db2777)' : '#94a3b8' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {saving ? 'Planification...' : 'Confirmer le RDV'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ════════════════════════════════════════
   VUE SEMAINE
════════════════════════════════════════ */
const VueSemaine = ({ rdvList, lundi, filtreMedecin, onEdit }) => {
  const jours = JOURS_SEMAINE.map((j, i) => ({ label: j, date: addJours(lundi, i) }));

  // Comparer par date réelle, pas par jourOffset
 const rdvDuJour = (jourIndex) => {
  const jourDate = addJours(lundi, jourIndex);
  // Convertir en string "YYYY-MM-DD" pour comparer directement
  const jourStr = jourDate.toLocaleDateString('en-CA'); // format YYYY-MM-DD garanti

  return rdvList.filter(r => {
    if (!r.date) return false;
    const rdvStr = r.date.split('T')[0];
    const matchJour = rdvStr === jourStr;
    const matchMed = filtreMedecin === 'Tous'
      || r.medecin?.toLowerCase().includes(filtreMedecin.toLowerCase());
    return matchJour && matchMed;
  });
};

  return (
    <div className="grid grid-cols-7 gap-2">
      {jours.map((j, i) => {
        const isToday = j.date.toDateString() === new Date().toDateString();
        return (
          <div key={i} className={`text-center py-3 rounded-xl border transition-all ${
            isToday ? 'border-violet-200 bg-violet-50' : 'bg-slate-50 border-slate-100'
          }`}>
            <p className={`text-[10px] font-semibold uppercase tracking-widest ${
              isToday ? 'text-violet-500' : 'text-slate-400'
            }`}>{j.label}</p>
            <p className={`text-[16px] font-black leading-tight mt-0.5 ${
              isToday ? 'text-violet-700' : 'text-slate-700'
            }`}>{j.date.getDate()}</p>
            <p className={`text-[10px] font-medium ${isToday ? 'text-violet-400' : 'text-slate-400'}`}>
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
                <span className="text-[10px] text-slate-300 font-medium">Libre</span>
              </div>
            ) : (
              rdvs.map(rdv => {
                const c = STATUT_CFG[rdv.statut] || STATUT_CFG.PLANIFIE;
                return (
                  <button key={rdv.id} onClick={() => onEdit(rdv)}
                    className={`w-full text-left p-2 rounded-xl border border-slate-100 border-l-4 ${c.card} hover:shadow-sm transition-all`}>
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
════════════════════════════════════════ */
const VueListe = ({ rdvList, filtreMedecin, onEdit }) => {
  const filtered = rdvList.filter(r =>
    filtreMedecin === 'Tous'
    || r.medecin?.toLowerCase().includes(filtreMedecin.toLowerCase())
  );

  // Grouper par date réelle
  const grouped = filtered.reduce((acc, rdv) => {
    if (!rdv.date) return acc;
    const d = new Date(rdv.date);
    const jsDay = d.getDay(); // 0=dim
    const jourOffset = jsDay === 0 ? 6 : jsDay - 1;
    const key = JOURS_SEMAINE[jourOffset] || 'Autre';
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
            {rdvs.map(rdv => (
              <motion.div key={rdv.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => onEdit(rdv)}>
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
                    <span className="text-[11px] text-violet-500 font-medium">{rdv.motif}</span>
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
            ))}
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <CalendarDays size={40} strokeWidth={1.2} className="text-slate-300" />
          <p className="text-[13px] font-medium text-slate-400">Aucun rendez-vous planifié cette semaine</p>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════
   VUE DEMANDES EN ATTENTE
════════════════════════════════════════ */
const DemandesEnAttente = ({ demandes, onPlanifier, filtreMedecin, setFiltreMedecin }) => {
  const filtered = demandes.filter(r =>
    filtreMedecin === 'Tous'
    || r.medecin?.toLowerCase().includes(filtreMedecin.toLowerCase())
  );

  const grouped = filtered.reduce((acc, rdv) => {
    const key = rdv.medecinId;
    if (!acc[key]) acc[key] = { nom: rdv.medecin, rdvs: [] };
    acc[key].rdvs.push(rdv);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <svg className="absolute left-3 text-slate-400 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Filtrer par médecin…"
            value={filtreMedecin === 'Tous' ? '' : filtreMedecin}
            onChange={e => setFiltreMedecin(e.target.value === '' ? 'Tous' : e.target.value)}
            className="h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 outline-none focus:border-violet-400 transition-all placeholder:text-slate-300 w-52"
          />
          {filtreMedecin !== 'Tous' && (
            <button onClick={() => setFiltreMedecin('Tous')}
              className="absolute right-2.5 text-slate-300 hover:text-slate-500">
              <X size={13} />
            </button>
          )}
        </div>
        <span className="text-[12px] text-slate-400 font-medium">
          {filtered.length} demande{filtered.length > 1 ? 's' : ''} en attente
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <CheckCircle2 size={40} strokeWidth={1.2} className="text-emerald-300" />
          <p className="text-[13px] font-medium text-slate-400">Aucune demande en attente</p>
        </div>
      ) : (
        Object.values(grouped).map(({ nom, rdvs }) => (
          <div key={nom}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                <span className="text-[10px] font-black text-violet-600">
                  {nom?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Dr. {nom}</p>
              <span className="ml-auto text-[11px] font-semibold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">
                {rdvs.length} demande{rdvs.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {rdvs.map(rdv => (
                <motion.div key={rdv.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 border-l-4 border-l-rose-400 hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-rose-400" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 truncate">{rdv.patient}</p>
                    <p className="text-[11px] text-rose-500 font-medium truncate mt-0.5">
                      {rdv.motif || 'Aucun motif'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Demandé le{' '}
                      {rdv.dateCreation
                        ? new Date(rdv.dateCreation).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                  <StatutBadge statut="EN_ATTENTE" />
                  <button onClick={() => onPlanifier(rdv)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-bold text-white shrink-0 transition-all hover:opacity-90 active:scale-95"
                    style={{ background: '#0f172a' }}>
                    <CalendarDays size={12} />
                    Planifier
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

/* ════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════ */
export default function SecretairePlanning() {
  const [offsetSemaine, setOffsetSemaine]                 = useState(0);
  const [vue, setVue]                                     = useState('semaine');
  const [activeTab, setActiveTab]                         = useState('planning');
  const [filtreMedecin, setFiltreMedecin]                 = useState('Tous');
  const [filtreMedecinDemandes, setFiltreMedecinDemandes] = useState('Tous');
  const [showModal, setShowModal]                         = useState(false);
  const [showModalPlanifier, setShowModalPlanifier]       = useState(false);
  const [rdvEdite, setRdvEdite]                           = useState(null);
  const [rdvAPlanifier, setRdvAPlanifier]                 = useState(null);
  const [rdvList, setRdvList]                             = useState([]);
  const [demandesEnAttente, setDemandesEnAttente]         = useState([]);
  const [patients, setPatients]                           = useState([]);
  const [medecins, setMedecins]                           = useState([]);
  const [loading, setLoading]                             = useState(true);
  const [saving, setSaving]                               = useState(false);
  const [error, setError]                                 = useState(null);

  const lundi    = getLundiDeSemaine(offsetSemaine);
  const dimanche = addJours(lundi, 6);
  const labelSemaine = offsetSemaine === 0
    ? 'Semaine actuelle'
    : `${formatDate(lundi)} – ${formatDate(dimanche)}`;

  /* ── Adapter un RDV du backend ── */
  const adaptRdv = (r) => {
    // Recalculer l'heure depuis la date ISO si besoin
    const heure = r.heure || (r.date
      ? new Date(r.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '—');

    return {
      id:         r.id,
      date:       r.date, // garder la date ISO brute pour le filtre par jour
      heure,
      duree:      r.duree || 30,
      patient:    r.patientNom ? `${r.patientPrenom} ${r.patientNom}` : '—',
      patientId:  r.patientId,
      medecin:    r.medecinNom || '—',
      medecinId:  r.medecinId,
      motif:      r.motif || '',
      lieu:       r.lieu  || '',
      statut:     r.statut ? r.statut.toString() : 'PLANIFIE',
    };
  };

  const adaptDemande = (r) => ({
    id:           r.id,
    patient:      r.patientNom ? `${r.patientPrenom} ${r.patientNom}` : '—',
    patientId:    r.patientId,
    medecin:      r.medecinNom || '—',
    medecinId:    r.medecinId,
    motif:        r.motif || '',
    statut:       'EN_ATTENTE',
    dateCreation: r.dateCreation,
  });

  /* ── Chargement ── */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rdvs, pts, meds, attentes] = await Promise.all([
          secretaireRendezVousService.getPlanning(lundi),
          secretairePatientService.getAll(),
          secretaireMedecinService.getAll(),
          secretaireRendezVousService.getDemandesEnAttente(),
        ]);
        // Planning : uniquement PLANIFIE
        setRdvList(rdvs.map(adaptRdv).filter(r => r.statut === 'PLANIFIE'));
        // Demandes : EN_ATTENTE sans date
        setDemandesEnAttente(attentes.map(adaptDemande));
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

  /* ── Sauvegarder RDV ── */
  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = {
        patientId: form.patientId,
        medecinId: form.medecinId,
        date:      `${form.date}T${form.heure}:00`,
        motif:     form.motif,
        lieu:      form.lieu,
        statut:    form.statut,
      };
      if (rdvEdite?.id) {
        const updated = await secretaireRendezVousService.modifier(rdvEdite.id, payload);
        setRdvList(prev =>
          prev.map(r => r.id === rdvEdite.id ? adaptRdv(updated) : r)
              .filter(r => r.statut === 'PLANIFIE')
        );
      } else {
        const created = await secretaireRendezVousService.creer(payload);
        if (created.statut === 'PLANIFIE' || form.statut === 'PLANIFIE') {
          setRdvList(prev => [...prev, adaptRdv({ ...created, ...form,
            patientNom:    patients.find(p => p.id === form.patientId)?.nom    || '',
            patientPrenom: patients.find(p => p.id === form.patientId)?.prenom || '',
            medecinNom:    medecins.find(m => m.id === form.medecinId)?.nom    || '',
          })]);
        }
      }
      setShowModal(false);
      setRdvEdite(null);
    } finally {
      setSaving(false);
    }
  };

  /* ── Planifier une demande ── */
  const handlePlanifier = async (id, date, lieu) => {
    setSaving(true);
    try {
      await secretaireRendezVousService.planifier(id, date, lieu);
      setDemandesEnAttente(prev => prev.filter(r => r.id !== id));
      // Recharger le planning pour afficher le nouveau RDV
      const rdvs = await secretaireRendezVousService.getPlanning(lundi);
      setRdvList(rdvs.map(adaptRdv).filter(r => r.statut === 'PLANIFIE'));
      setShowModalPlanifier(false);
      setRdvAPlanifier(null);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit            = (rdv) => { setRdvEdite(rdv); setShowModal(true); };
  const handleOuvrirPlanifier = (rdv) => { setRdvAPlanifier(rdv); setShowModalPlanifier(true); };

  const totalSemaine = rdvList.length;
  const nbAttente    = demandesEnAttente.length;

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
        <button onClick={() => setOffsetSemaine(o => o)}
          className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[1.6rem] font-black text-slate-900 leading-none" style={{ letterSpacing: '-0.03em' }}>
            Planning &{' '}
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              RDV
            </span>
          </h2>
          <p className="text-[12px] text-slate-400 font-medium mt-1">{labelSemaine}</p>
        </div>
        <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setRdvEdite(null); setShowModal(true); }}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[12px] font-bold text-white shadow-sm shrink-0"
          style={{ background: '#0f172a' }}>
          <Plus size={15} /> Nouveau RDV
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-3 gap-4">
        {[
          { label: 'RDV planifiés cette semaine', value: totalSemaine, color: 'text-violet-600' },
          { label: 'Planifiés',                   value: totalSemaine, color: 'text-emerald-600' },
          { label: 'Demandes à planifier',        value: nbAttente,    color: 'text-rose-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-black ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Onglets */}
      <motion.div {...fadeUp(0.08)} className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-fit">
        {[
          { key: 'planning', label: 'Planning',            icon: LayoutGrid },
          { key: 'demandes', label: 'Demandes en attente', icon: Clock, badge: nbAttente },
        ].map(({ key, label, icon: Icon, badge }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
              activeTab === key ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            style={activeTab === key ? { background: 'linear-gradient(135deg,#7c3aed,#db2777)' } : {}}>
            <Icon size={13} />
            {label}
            {badge > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === key ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
              }`}>{badge}</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Contenu */}
      <AnimatePresence mode="wait">

        {/* ── PLANNING ── */}
        {activeTab === 'planning' && (
          <motion.div key="tab-planning"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            className="space-y-4">

            {/* Contrôles */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button onClick={() => setOffsetSemaine(o => o - 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[12px] font-semibold text-slate-600 px-3 min-w-[140px] text-center">
                  {labelSemaine}
                </span>
                <button onClick={() => setOffsetSemaine(o => o + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <svg className="absolute left-3 text-slate-400 pointer-events-none"
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input type="text" placeholder="Rechercher un médecin…"
                    value={filtreMedecin === 'Tous' ? '' : filtreMedecin}
                    onChange={e => setFiltreMedecin(e.target.value === '' ? 'Tous' : e.target.value)}
                    className="h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 outline-none focus:border-violet-400 transition-all placeholder:text-slate-300 w-52"
                  />
                  {filtreMedecin !== 'Tous' && (
                    <button onClick={() => setFiltreMedecin('Tous')}
                      className="absolute right-2.5 text-slate-300 hover:text-slate-500">
                      <X size={13} />
                    </button>
                  )}
                </div>
                <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  {[
                    { key: 'semaine', icon: LayoutGrid, label: 'Semaine' },
                    { key: 'liste',   icon: List,       label: 'Liste' },
                  ].map(({ key, icon: Icon, label }) => (
                    <button key={key} onClick={() => setVue(key)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                        vue === key ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                      style={vue === key ? { background: 'linear-gradient(135deg,#7c3aed,#db2777)' } : {}}>
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Légende */}
            <div className="flex flex-wrap items-center gap-5 px-1">
              {Object.values(STATUT_CFG)
                .filter((s, i, arr) => arr.findIndex(x => x.label === s.label) === i)
                .map(({ label, dot }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    <span className="text-[11px] text-slate-500 font-medium">{label}</span>
                  </div>
                ))}
            </div>

            {/* Calendrier / liste */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 overflow-x-auto">
              <AnimatePresence mode="wait">
                {vue === 'semaine' ? (
                  <motion.div key="semaine"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }}>
                    <VueSemaine
                      rdvList={rdvList}
                      lundi={lundi}
                      filtreMedecin={filtreMedecin}
                      onEdit={handleEdit}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="liste"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
                    <VueListe
                      rdvList={rdvList}
                      filtreMedecin={filtreMedecin}
                      onEdit={handleEdit}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── DEMANDES ── */}
        {activeTab === 'demandes' && (
          <motion.div key="tab-demandes"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
              <DemandesEnAttente
                demandes={demandesEnAttente}
                onPlanifier={handleOuvrirPlanifier}
                filtreMedecin={filtreMedecinDemandes}
                setFiltreMedecin={setFiltreMedecinDemandes}
              />
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <ModalRdv
            rdv={rdvEdite}
            onClose={() => { setShowModal(false); setRdvEdite(null); }}
            onSave={handleSave}
            patients={patients}
            medecins={medecins}
            saving={saving}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModalPlanifier && rdvAPlanifier && (
          <ModalPlanifier
            rdv={rdvAPlanifier}
            onClose={() => { setShowModalPlanifier(false); setRdvAPlanifier(null); }}
            onPlanifier={handlePlanifier}
            saving={saving}
          />
        )}
      </AnimatePresence>

    </div>
  );
}