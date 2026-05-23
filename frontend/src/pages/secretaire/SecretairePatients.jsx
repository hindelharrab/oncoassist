import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, Filter,
  Edit2, X, CheckCircle2, Phone, Mail, Stethoscope,
  ChevronLeft, ChevronRight, User, Activity,
  ShieldAlert, Archive, Eye, Loader2, AlertCircle
} from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut', delay },
});

/* ── Badge statut ── */
const StatutBadge = ({ statut }) => {
  const map = {
    NOUVELLE:     { label: 'Nouvelle',     className: 'bg-violet-50 text-violet-700 border-violet-200',    icon: UserPlus },
    STABLE:       { label: 'Stable',       className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    EN_SUIVI:     { label: 'En suivi',     className: 'bg-blue-50 text-blue-700 border-blue-200',          icon: Activity },
    A_SURVEILLER: { label: 'À surveiller', className: 'bg-amber-50 text-amber-700 border-amber-200',       icon: Eye },
    CRITIQUE:     { label: 'Critique',     className: 'bg-red-50 text-red-700 border-red-200',             icon: ShieldAlert },
    ARCHIVEE:     { label: 'Archivée',     className: 'bg-slate-100 text-slate-500 border-slate-200',      icon: Archive },
  };
  const s = map[statut] || map.STABLE;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${s.className}`}>
      <Icon size={11} strokeWidth={2} />
      {s.label}
    </span>
  );
};

/* ── Avatar patient ── */
const PatientAvatar = ({ patient }) => {
  const [imgError, setImgError] = useState(false);
  const initiales = `${patient.nom?.[0] || ''}${patient.prenom?.[0] || ''}`.toUpperCase();

  const photoUrl = patient.photoProfil
    ? patient.photoProfil.startsWith('http')
      ? patient.photoProfil
      : `http://localhost:8080/${patient.photoProfil}`
    : null;

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={initiales}
        className="w-9 h-9 rounded-xl object-cover shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-[11px] font-black text-gray-600 shrink-0">
      {initiales}
    </div>
  );
};

/* ── Ligne patient ── */
const PatientRow = ({ patient, index, onEdit }) => (
  <motion.tr
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.2, delay: index * 0.04 }}
    className="group border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer"
    style={{ borderLeft: '3px solid transparent' }}
    onMouseEnter={e => e.currentTarget.style.borderLeft = '3px solid #ec4899'}
    onMouseLeave={e => e.currentTarget.style.borderLeft = '3px solid transparent'}
  >
    <td className="py-3.5 px-5">
      <div className="flex items-center gap-3">
        <PatientAvatar patient={patient} />
        <div>
          <p className="text-[13px] font-bold text-gray-900 leading-none">
            {patient.nom} {patient.prenom}
          </p>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5 font-mono">
            {patient.id?.toString().substring(0, 8)}...
          </p>
        </div>
      </div>
    </td>

    <td className="py-3.5 px-5 hidden md:table-cell">
      <span className="text-[13px] font-semibold text-gray-700">
        {patient.age ? `${patient.age} ans` : '—'}
      </span>
    </td>

    <td className="py-3.5 px-5 hidden lg:table-cell">
      <div className="flex flex-col gap-0.5">
        {patient.telephone && (
          <div className="flex items-center gap-1.5">
            <Phone size={11} className="text-gray-400 shrink-0" />
            <span className="text-[12px] font-medium text-gray-700">
              {patient.telephone}
            </span>
          </div>
        )}
        {patient.email && (
          <div className="flex items-center gap-1.5">
            <Mail size={11} className="text-gray-400 shrink-0" />
            <span className="text-[11px] text-gray-500 truncate max-w-[140px]">
              {patient.email}
            </span>
          </div>
        )}
      </div>
    </td>

    <td className="py-3.5 px-5 hidden sm:table-cell">
      {patient.medecinRef ? (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-[9px] font-black shrink-0">
            DR
          </div>
          <span className="text-[12px] font-semibold text-gray-700">
            Dr. {patient.medecinRef}
          </span>
        </div>
      ) : (
        <span className="text-[11px] text-gray-400 italic">Non assigné</span>
      )}
    </td>

    <td className="py-3.5 px-5 hidden xl:table-cell">
      <span className="text-[12px] font-medium text-gray-600">
        {patient.derniereConsultation || '—'}
      </span>
    </td>

    <td className="py-3.5 px-5">
      <StatutBadge statut={patient.statut} />
    </td>

    <td className="py-3.5 px-5 text-right">
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(patient); }}
        className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white hover:bg-pink-500 transition-colors ml-auto"
      >
        <Edit2 size={14} strokeWidth={1.8} />
      </button>
    </td>
  </motion.tr>
);

/* ── Champs formulaire ── */
const inputClass =
  'w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[13px] ' +
  'font-medium text-gray-900 outline-none focus:border-pink-300 ' +
  'focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-gray-300';

const FormField = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
      {label} {required && <span className="text-pink-500">*</span>}
    </label>
    {children}
  </div>
);

/* ── Modal créer patient ── */
const ModalCreerPatient = ({ onClose, onSave, medecins }) => {
  const submittingRef = useRef(false);
  const [form, setForm] = useState({
    nom: '', prenom: '', dateNaissance: '',
    telephone: '', email: '', adresse: '', ville: '',
    personneConfiance: '', medecinId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    if (!form.nom || !form.prenom || !form.email) {
      setError('Nom, prénom et email sont obligatoires');
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const payload = {
        nom:               form.nom,
        prenom:            form.prenom,
        email:             form.email,
        telephone:         form.telephone,
        adresse:           form.adresse + (form.ville ? ', ' + form.ville : ''),
        dateNaissance:     form.dateNaissance || null,
        personneConfiance: form.personneConfiance,
        motDePasse:        'ChangeMe2026!',
        medecinId:         form.medecinId || null,
      };

      await onSave(payload); // onSave ferme la modal elle-même
    } catch (err) {
      setError(
        err.response?.data?.message || 'Erreur lors de la création'
      );
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const medecinChoisi = medecins.find(m => m.id === form.medecinId);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        exit={{ opacity: 0 }} onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(10,10,20,0.5)', backdropFilter: 'blur(8px)' }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <UserPlus size={18} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">Nouveau patient</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Remplissez les informations du dossier
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[12px]">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* Identité */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <User size={12} /> Identité
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Nom" required>
                  <input className={inputClass} placeholder="Bennani"
                    value={form.nom} onChange={set('nom')} />
                </FormField>
                <FormField label="Prénom" required>
                  <input className={inputClass} placeholder="Salma"
                    value={form.prenom} onChange={set('prenom')} />
                </FormField>
                <FormField label="Date de naissance">
                  <input type="date" className={inputClass}
                    value={form.dateNaissance} onChange={set('dateNaissance')} />
                </FormField>
              </div>
            </div>

            {/* Coordonnées */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Phone size={12} /> Coordonnées
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Téléphone">
                  <input className={inputClass} placeholder="06 XX XX XX XX"
                    value={form.telephone} onChange={set('telephone')} />
                </FormField>
                <FormField label="Email" required>
                  <input type="email" className={inputClass}
                    placeholder="patient@email.com"
                    value={form.email} onChange={set('email')} />
                </FormField>
                <FormField label="Adresse">
                  <input className={inputClass} placeholder="Rue, numéro…"
                    value={form.adresse} onChange={set('adresse')} />
                </FormField>
                <FormField label="Ville">
                  <input className={inputClass} placeholder="Casablanca"
                    value={form.ville} onChange={set('ville')} />
                </FormField>
              </div>
            </div>

            {/* Personne de confiance */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <User size={12} /> Personne de confiance
              </p>
              <FormField label="Nom complet">
                <input className={inputClass} placeholder="Nom de la personne"
                  value={form.personneConfiance}
                  onChange={set('personneConfiance')} />
              </FormField>
            </div>

            {/* Médecin référent */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Stethoscope size={12} /> Affectation médicale
              </p>
              <FormField label="Médecin référent">
                <select className={inputClass}
                  value={form.medecinId} onChange={set('medecinId')}>
                  <option value="">Choisir un médecin…</option>
                  {medecins.map(m => (
                    <option key={m.id} value={m.id}>
                      Dr. {m.prenom} {m.nom}
                      {m.specialiteNom ? ` — ${m.specialiteNom}` : ''}
                    </option>
                  ))}
                </select>
              </FormField>
              {medecinChoisi && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <p className="text-[12px] text-gray-700 font-medium">
                    Affecté à Dr. {medecinChoisi.prenom} {medecinChoisi.nom}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
            <button onClick={onClose}
              className="text-[12px] font-medium text-gray-500 hover:text-gray-700">
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !form.nom || !form.prenom || !form.email}
              className="flex items-center gap-2 h-10 px-6 bg-gray-900 text-white rounded-xl text-[13px] font-semibold hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? <Loader2 size={15} className="animate-spin" />
                : <CheckCircle2 size={15} />}
              {loading ? 'Création...' : 'Créer le dossier'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

/* ── Constantes ── */
const STATUTS_FILTRE = [
  'Tous', 'NOUVELLE', 'STABLE', 'EN_SUIVI',
  'A_SURVEILLER', 'CRITIQUE', 'ARCHIVEE',
];
const STATUTS_LABELS = {
  Tous: 'Tous', NOUVELLE: 'Nouvelle', STABLE: 'Stable',
  EN_SUIVI: 'En suivi', A_SURVEILLER: 'À surveiller',
  CRITIQUE: 'Critique', ARCHIVEE: 'Archivée',
};
const PAR_PAGE = 6;

/* ════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════ */
export default function SecretairePatients() {
  const [patients, setPatients]           = useState([]);
  const [medecins, setMedecins]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState('');
  const [filtreMedecin, setFiltreMedecin] = useState('Tous');
  const [filtreStatut, setFiltreStatut]   = useState('Tous');
  const [showModal, setShowModal]         = useState(false);
  const [showFilters, setShowFilters]     = useState(false);
  const [page, setPage]                   = useState(1);

  // Charger patients + médecins
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [patientsRes, medecinsRes] = await Promise.all([
          axiosInstance.get('/patients'),
          axiosInstance.get('/medecins/avec-statut'),
        ]);
        setPatients(patientsRes.data);
        setMedecins(medecinsRes.data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrage
  const filtered = useMemo(() => patients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || p.nom?.toLowerCase().includes(q)
      || p.prenom?.toLowerCase().includes(q)
      || p.telephone?.includes(q)
      || p.email?.toLowerCase().includes(q);
    const matchMedecin = filtreMedecin === 'Tous' || p.medecinRef === filtreMedecin;
    const matchStatut  = filtreStatut  === 'Tous' || p.statut === filtreStatut;
    return matchSearch && matchMedecin && matchStatut;
  }), [patients, search, filtreMedecin, filtreStatut]);

  const totalPages = Math.ceil(filtered.length / PAR_PAGE);
  const paginated  = filtered.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  // Médecins uniques pour le filtre
  const medecinsFiltre = ['Tous', ...new Set(
    patients.map(p => p.medecinRef).filter(Boolean)
  )];

  // Créer patient — ferme la modal et réinitialise
  const handleSave = async (payload) => {
    await axiosInstance.post('/patients', payload);
    const res = await axiosInstance.get('/patients');
    setPatients(res.data);
    setPage(1);
    setSearch('');
    setShowModal(false); // ← fermeture ici
  };

  const filtersActifs = filtreMedecin !== 'Tous' || filtreStatut !== 'Tous';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-pink-500" />
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
          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="space-y-5 pb-8 transition-all duration-200"
        style={showModal ? { filter: 'blur(2px)', pointerEvents: 'none' } : {}}
      >
        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              Patients
            </h2>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">
              {filtered.length} patient{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 h-10 px-4 bg-gray-700 text-white rounded-xl text-[13px] font-semibold hover:bg-gray-900 transition-colors"
            style={{ pointerEvents: 'auto' }}
          >
            <UserPlus size={15} />
            Nouveau patient
          </button>
        </motion.div>

        {/* Recherche */}
        <motion.div {...fadeUp(0.05)} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoComplete="off"
              placeholder="Rechercher par nom, prénom, email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-800 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-gray-300"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 h-11 px-4 rounded-xl border text-[13px] font-medium transition-colors ${
              filtersActifs || showFilters
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={15} />
            Filtres
            {filtersActifs && <span className="w-2 h-2 rounded-full bg-pink-400" />}
          </button>
        </motion.div>

        {/* Filtres expandables */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Médecin référent
                  </label>
                  <select
                    value={filtreMedecin}
                    onChange={(e) => { setFiltreMedecin(e.target.value); setPage(1); }}
                    className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none"
                  >
                    {medecinsFiltre.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Statut dossier
                  </label>
                  <select
                    value={filtreStatut}
                    onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }}
                    className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none"
                  >
                    {STATUTS_FILTRE.map(s => (
                      <option key={s} value={s}>{STATUTS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                {filtersActifs && (
                  <div className="flex items-end">
                    <button
                      onClick={() => { setFiltreMedecin('Tous'); setFiltreStatut('Tous'); setPage(1); }}
                      className="flex items-center gap-1.5 h-9 px-3 text-[12px] text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={13} /> Réinitialiser
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tableau */}
        <motion.div {...fadeUp(0.08)}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Patient', 'Âge', 'Contact', 'Médecin référent', 'Dernière consultation', 'Statut', 'Actions'].map((h, i) => (
                    <th key={h}
                      className={`text-left py-3 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest ${
                        i === 1 ? 'hidden md:table-cell' :
                        i === 2 ? 'hidden lg:table-cell' :
                        i === 3 ? 'hidden sm:table-cell' :
                        i === 4 ? 'hidden xl:table-cell' :
                        i === 6 ? 'text-right' : ''
                      }`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((p, i) => (
                    <PatientRow
                      key={p.id}
                      patient={p}
                      index={i}
                      onEdit={(pt) => console.log('Edit', pt)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users size={36} strokeWidth={1.2} className="text-gray-300" />
                        <p className="text-[13px] font-medium text-gray-400">
                          Aucun patient trouvé
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/40">
              <p className="text-[12px] text-gray-500 font-medium">
                Page {page} sur {totalPages} — {filtered.length} résultats
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors ${
                      n === page
                        ? 'bg-gray-900 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ModalCreerPatient
            onClose={() => setShowModal(false)}
            onSave={handleSave}
            medecins={medecins}
          />
        )}
      </AnimatePresence>
    </>
  );
}