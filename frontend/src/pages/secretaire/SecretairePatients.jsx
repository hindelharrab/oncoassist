import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, Filter, Printer, Edit2,
  X, CheckCircle2, Phone, Mail,
  Stethoscope, ChevronLeft, ChevronRight, User,
  Activity, ShieldAlert, Archive, Eye,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut', delay },
});

/* ════════════════════════════════════════
   BADGE STATUT — 6 statuts
═══════════════════════════════════════ */
const StatutBadge = ({ statut }) => {
  const map = {
    NOUVELLE:     { label: 'Nouvelle',     className: 'bg-violet-50 text-violet-700 border-violet-200',   icon: UserPlus },
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

/* ════════════════════════════════════════
   LIGNE PATIENT
═══════════════════════════════════════ */
const PatientRow = ({ patient, index, onEdit, onPrint }) => (
  <motion.tr
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.2, delay: index * 0.04 }}
    className="group border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer"
    style={{ borderLeft: '3px solid transparent' }}
    onMouseEnter={e => e.currentTarget.style.borderLeft = '3px solid #ec4899'}
    onMouseLeave={e => e.currentTarget.style.borderLeft = '3px solid transparent'}
  >
    {/* Patient */}
    <td className="py-3.5 px-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-[11px] font-black text-gray-600 shrink-0">
          {patient.nom[0]}{patient.prenom[0]}
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-900 leading-none">
            {patient.nom} {patient.prenom}
          </p>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">{patient.id}</p>
        </div>
      </div>
    </td>

    {/* Âge */}
    <td className="py-3.5 px-5 hidden md:table-cell">
      <span className="text-[13px] font-semibold text-gray-700">{patient.age} ans</span>
    </td>

    {/* Contact */}
    <td className="py-3.5 px-5 hidden lg:table-cell">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Phone size={11} strokeWidth={1.8} className="text-gray-400 shrink-0" />
          <span className="text-[12px] font-medium text-gray-700">{patient.telephone}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mail size={11} strokeWidth={1.8} className="text-gray-400 shrink-0" />
          <span className="text-[11px] text-gray-500 truncate max-w-[140px]">{patient.email}</span>
        </div>
      </div>
    </td>

    {/* Médecin référent */}
    <td className="py-3.5 px-5 hidden sm:table-cell">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-[9px] font-black shrink-0">
          DR
        </div>
        <span className="text-[12px] font-semibold text-gray-700">Dr. {patient.medecinRef}</span>
      </div>
    </td>

    {/* Dernière consultation */}
    <td className="py-3.5 px-5 hidden xl:table-cell">
      <span className="text-[12px] font-medium text-gray-600">{patient.derniereConsultation}</span>
    </td>

    {/* Statut */}
    <td className="py-3.5 px-5">
      <StatutBadge statut={patient.statut} />
    </td>

    {/* Actions — icônes uniquement, toujours visibles */}
    <td className="py-3.5 px-5 text-right">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onPrint(patient); }}
          title="Imprimer"
          className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors"
        >
          <Printer size={14} strokeWidth={1.8} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(patient); }}
          title="Modifier"
          className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white hover:bg-pink-500 transition-colors"
        >
          <Edit2 size={14} strokeWidth={1.8} />
        </button>
      </div>
    </td>
  </motion.tr>
);

/* ════════════════════════════════════════
   CHAMP FORMULAIRE
═══════════════════════════════════════ */
const inputClass = 'w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-900 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-gray-300';

const FormField = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
      {label} {required && <span className="text-pink-500">*</span>}
    </label>
    {children}
  </div>
);

/* ════════════════════════════════════════
   MODAL CRÉER PATIENT
   — overlay couvre TOUT (y compris navbar)
   — on cible uniquement le contenu page
     via un wrapper qu'on flou côté CSS
═══════════════════════════════════════ */
const ModalCreerPatient = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    nom: '', prenom: '', dateNaissance: '', sexe: '',
    telephone: '', email: '', adresse: '', ville: '',
    personneConfiance: '', telConfiance: '', medecinRef: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    if (!form.nom || !form.prenom || !form.medecinRef) return;
    onSave(form);
    onClose();
  };

  return (
    <>
      {/* Overlay sombre + flou — couvre toute la page SAUF navbar (z géré côté layout) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(10, 10, 20, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Conteneur centrage — pointer-events:none pour que l'overlay capte les clics hors modale */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col pointer-events-auto"
        >
          {/* En-tête */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <UserPlus size={18} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">Nouveau patient</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Remplissez les informations du dossier</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Corps scrollable */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

            {/* Identité */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <User size={12} /> Identité du patient
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Nom de famille" required>
                  <input className={inputClass} placeholder="Ex : Bennani" value={form.nom} onChange={set('nom')} />
                </FormField>
                <FormField label="Prénom" required>
                  <input className={inputClass} placeholder="Ex : Salma" value={form.prenom} onChange={set('prenom')} />
                </FormField>
                <FormField label="Date de naissance">
                  <input type="date" className={inputClass} value={form.dateNaissance} onChange={set('dateNaissance')} />
                </FormField>
                <FormField label="Sexe">
                  <select className={inputClass} value={form.sexe} onChange={set('sexe')}>
                    <option value="">Sélectionner…</option>
                    <option>Féminin</option>
                    <option>Masculin</option>
                  </select>
                </FormField>
              </div>
            </div>

            {/* Coordonnées */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Phone size={12} /> Coordonnées
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Téléphone" required>
                  <input className={inputClass} placeholder="06 XX XX XX XX" value={form.telephone} onChange={set('telephone')} />
                </FormField>
                <FormField label="Email">
                  <input type="email" className={inputClass} placeholder="patient@email.com" value={form.email} onChange={set('email')} />
                </FormField>
                <FormField label="Adresse">
                  <input className={inputClass} placeholder="Rue, numéro…" value={form.adresse} onChange={set('adresse')} />
                </FormField>
                <FormField label="Ville">
                  <input className={inputClass} placeholder="Ex : Casablanca" value={form.ville} onChange={set('ville')} />
                </FormField>
              </div>
            </div>

            {/* Personne de confiance */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <User size={12} /> Personne de confiance
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Nom complet">
                  <input className={inputClass} placeholder="Nom de la personne de confiance" value={form.personneConfiance} onChange={set('personneConfiance')} />
                </FormField>
                <FormField label="Téléphone">
                  <input className={inputClass} placeholder="06 XX XX XX XX" value={form.telConfiance} onChange={set('telConfiance')} />
                </FormField>
              </div>
            </div>

            {/* Affectation médicale */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Stethoscope size={12} /> Affectation médicale
              </p>
              <FormField label="Oncologue référent" required>
                <select className={inputClass} value={form.medecinRef} onChange={set('medecinRef')}>
                  <option value="">Choisir un médecin…</option>
                  <option value="El Harrab">Dr. El Harrab — Oncologie digestive</option>
                  <option value="Benali">Dr. Benali — Radio-oncologie</option>
                  <option value="Ibrahim">Dr. Ibrahim — Onco-chimiothérapie</option>
                </select>
              </FormField>
              {form.medecinRef && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <p className="text-[12px] text-gray-700 font-medium">
                    Ce patient sera affecté à Dr. {form.medecinRef}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Pied */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
            <button
              onClick={onClose}
              className="text-[12px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.nom || !form.prenom || !form.medecinRef}
              className="flex items-center gap-2 h-10 px-6 bg-gray-900 text-white rounded-xl text-[13px] font-semibold hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle2 size={15} />
              Créer le dossier
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════
   DONNÉES MOCK — 6 statuts
═══════════════════════════════════════ */
const PATIENTS_MOCK = [
  { id: '#P-9821', nom: 'Bennani',   prenom: 'Salma',   age: 42, telephone: '06 11 22 33 44', email: 's.bennani@mail.com',  medecinRef: 'El Harrab', derniereConsultation: '14 mai 2026', statut: 'EN_SUIVI'     },
  { id: '#P-5512', nom: 'Alami',     prenom: 'Yassir',  age: 35, telephone: '06 55 66 77 88', email: 'y.alami@mail.com',    medecinRef: 'Benali',    derniereConsultation: '10 mai 2026', statut: 'NOUVELLE'     },
  { id: '#P-2104', nom: 'Zahraoui',  prenom: 'Fatima',  age: 58, telephone: '06 99 00 11 22', email: 'f.zahraoui@mail.com', medecinRef: 'El Harrab', derniereConsultation: '08 mai 2026', statut: 'STABLE'       },
  { id: '#P-7742', nom: 'Doukkali',  prenom: 'Karim',   age: 49, telephone: '06 22 44 66 88', email: 'k.doukkali@mail.com', medecinRef: 'Benali',    derniereConsultation: '05 mai 2026', statut: 'A_SURVEILLER' },
  { id: '#P-3301', nom: 'Chraibi',   prenom: 'Nadia',   age: 63, telephone: '06 33 55 77 99', email: 'n.chraibi@mail.com',  medecinRef: 'Ibrahim',   derniereConsultation: '02 mai 2026', statut: 'ARCHIVEE'     },
  { id: '#P-8840', nom: 'Bensalah',  prenom: 'Amina',   age: 31, telephone: '06 77 88 99 00', email: 'a.bensalah@mail.com', medecinRef: 'Ibrahim',   derniereConsultation: '01 mai 2026', statut: 'CRITIQUE'     },
  { id: '#P-1193', nom: 'El Fassi',  prenom: 'Omar',    age: 55, telephone: '06 44 55 66 77', email: 'o.elfassi@mail.com',  medecinRef: 'El Harrab', derniereConsultation: '28 avr 2026', statut: 'EN_SUIVI'     },
  { id: '#P-6628', nom: 'Moussaoui', prenom: 'Laila',   age: 47, telephone: '06 12 23 34 45', email: 'l.mouss@mail.com',    medecinRef: 'Benali',    derniereConsultation: '25 avr 2026', statut: 'STABLE'       },
];

const MEDECINS_FILTRE = ['Tous', 'El Harrab', 'Benali', 'Ibrahim'];
const STATUTS_FILTRE  = ['Tous', 'NOUVELLE', 'STABLE', 'EN_SUIVI', 'A_SURVEILLER', 'CRITIQUE', 'ARCHIVEE'];
const STATUTS_LABELS  = {
  Tous: 'Tous', NOUVELLE: 'Nouvelle', STABLE: 'Stable',
  EN_SUIVI: 'En suivi', A_SURVEILLER: 'À surveiller',
  CRITIQUE: 'Critique', ARCHIVEE: 'Archivée',
};
const PAR_PAGE = 6;

/* ════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════ */
export default function SecretairePatients() {
  const [patients, setPatients]           = useState(PATIENTS_MOCK);
  const [search, setSearch]               = useState('');
  const [filtreMedecin, setFiltreMedecin] = useState('Tous');
  const [filtreStatut, setFiltreStatut]   = useState('Tous');
  const [showModal, setShowModal]         = useState(false);
  const [showFilters, setShowFilters]     = useState(false);
  const [page, setPage]                   = useState(1);

  const filtered = useMemo(() => patients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch  = !q || p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.telephone.includes(q);
    const matchMedecin = filtreMedecin === 'Tous' || p.medecinRef === filtreMedecin;
    const matchStatut  = filtreStatut  === 'Tous' || p.statut     === filtreStatut;
    return matchSearch && matchMedecin && matchStatut;
  }), [patients, search, filtreMedecin, filtreStatut]);

  const totalPages = Math.ceil(filtered.length / PAR_PAGE);
  const paginated  = filtered.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  const handleSave = (form) => {
    const nouveau = {
      id: `#P-${Math.floor(1000 + Math.random() * 9000)}`,
      nom: form.nom.toUpperCase(), prenom: form.prenom,
      age: form.dateNaissance ? new Date().getFullYear() - new Date(form.dateNaissance).getFullYear() : '—',
      telephone: form.telephone, email: form.email,
      medecinRef: form.medecinRef, derniereConsultation: '—', statut: 'NOUVELLE',
    };
    setPatients((prev) => [nouveau, ...prev]);
  };

  const filtersActifs = filtreMedecin !== 'Tous' || filtreStatut !== 'Tous';

  return (
    <>
      {/*
        Le wrapper principal se flou quand la modale est ouverte.
        La navbar est en dehors de ce wrapper dans ton layout global,
        donc elle reste nette — le flou ne s'applique qu'au contenu de la page.
        Dans ton layout : <Navbar /> puis <main> contenant cette page.
        L'overlay z-40 couvre tout, la modale z-50 est au-dessus.
      */}
      <div
        className="space-y-5 pb-8 transition-all duration-200"
        style={showModal ? { filter: 'blur(2px)', pointerEvents: 'none' } : {}}
      >
        {/* ── En-tête ── */}
        <motion.div {...fadeUp(0)} className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Patients</h2>
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

        {/* ── Recherche + Filtres ── */}
        <motion.div {...fadeUp(0.05)} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, ID ou téléphone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-800 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-gray-300"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
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
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Médecin référent</label>
                  <select
                    value={filtreMedecin}
                    onChange={(e) => { setFiltreMedecin(e.target.value); setPage(1); }}
                    className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none focus:border-gray-400 transition-colors"
                  >
                    {MEDECINS_FILTRE.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Statut dossier</label>
                  <select
                    value={filtreStatut}
                    onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }}
                    className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none focus:border-gray-400 transition-colors"
                  >
                    {STATUTS_FILTRE.map((s) => (
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

        {/* ── Tableau ── */}
        <motion.div {...fadeUp(0.08)} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Patient</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest hidden md:table-cell">Âge</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Contact</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Médecin référent</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest hidden xl:table-cell">Dernière consultation</th>
                  <th className="text-left py-3 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Statut</th>
                  <th className="text-right py-3 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((p, i) => (
                    <PatientRow
                      key={p.id}
                      patient={p}
                      index={i}
                      onEdit={(pt)  => console.log('Modifier', pt)}
                      onPrint={(pt) => console.log('Imprimer', pt)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users size={36} strokeWidth={1.2} className="text-gray-300" />
                        <p className="text-[13px] font-medium text-gray-400">Aucun patient trouvé</p>
                        <p className="text-[12px] text-gray-300">Modifiez vos critères de recherche</p>
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors ${
                      n === page ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal — en dehors du div flouté, rendu au niveau racine */}
      <AnimatePresence>
        {showModal && (
          <ModalCreerPatient
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </>
  );
}