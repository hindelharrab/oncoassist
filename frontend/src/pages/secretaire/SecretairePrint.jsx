import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  Search,
  FileText,
  Download,
  Eye,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';

/* ─── Animations ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut', delay },
});

/* ════════════════════════════════════════
   DONNÉES MOCK
═══════════════════════════════════════ */
const PATIENTS_MOCK = [
  {
    id: '#P-9821', nom: 'Bennani', prenom: 'Salma', age: 42,
    telephone: '06 11 22 33 44', email: 's.bennani@mail.com',
    adresse: '12 Rue des Roses, Casablanca',
    medecinRef: 'Dr. El Harrab Amine', specialite: 'Oncologie digestive',
    statut: 'Suivi', derniereConsultation: '14 mai 2026',
    antecedents: ['Cancer du côlon stade II (2023)', 'Diabète type 2', 'Hypertension artérielle'],
    examens: [
      { date: '10 mai 2026', type: 'IRM abdominale',    resultat: 'Stable — pas de progression' },
      { date: '28 avr 2026', type: 'Bilan biologique',  resultat: 'NFS normale, CRP légèrement élevée' },
      { date: '15 avr 2026', type: 'Échographie foie',  resultat: 'RAS' },
    ],
    traitements: ['FOLFOX 6 cycles (terminé)', 'Surveillance active tous les 3 mois'],
    rdv: [
      { date: '14 mai 2026', motif: 'Consultation de suivi',  medecin: 'Dr. El Harrab', statut: 'Effectué' },
      { date: '17 mai 2026', motif: 'Résultats IRM',          medecin: 'Dr. El Harrab', statut: 'Confirmé' },
      { date: '01 juin 2026',motif: 'Bilan trimestriel',      medecin: 'Dr. El Harrab', statut: 'Planifié' },
    ],
  },
  {
    id: '#P-5512', nom: 'Alami', prenom: 'Yassir', age: 35,
    telephone: '06 55 66 77 88', email: 'y.alami@mail.com',
    adresse: '45 Avenue Hassan II, Rabat',
    medecinRef: 'Dr. Benali Karim', specialite: 'Radiothérapie',
    statut: 'Nouveau', derniereConsultation: '10 mai 2026',
    antecedents: ['Lymphome hodgkinien (diagnostic 2026)'],
    examens: [
      { date: '08 mai 2026', type: 'TEP-Scan',           resultat: 'Atteinte ganglionnaire médiastinale' },
      { date: '05 mai 2026', type: 'Biopsie ganglionnaire', resultat: 'Lymphome hodgkinien confirmé' },
    ],
    traitements: ['ABVD en cours (Cycle 1 débuté)'],
    rdv: [
      { date: '10 mai 2026', motif: 'Annonce diagnostic',    medecin: 'Dr. Benali', statut: 'Effectué' },
      { date: '20 mai 2026', motif: 'Début chimiothérapie',  medecin: 'Dr. Benali', statut: 'Planifié' },
    ],
  },
  {
    id: '#P-2104', nom: 'Zahraoui', prenom: 'Fatima', age: 58,
    telephone: '06 99 00 11 22', email: 'f.zahraoui@mail.com',
    adresse: '8 Rue Al Massira, Marrakech',
    medecinRef: 'Dr. El Harrab Amine', specialite: 'Oncologie digestive',
    statut: 'Suivi', derniereConsultation: '08 mai 2026',
    antecedents: ['Cancer du sein (2019, traité)', 'Ostéoporose'],
    examens: [
      { date: '06 mai 2026', type: 'Mammographie',       resultat: 'Aucune récidive détectée' },
      { date: '20 avr 2026', type: 'Densitométrie osseuse', resultat: 'Ostéoporose modérée' },
    ],
    traitements: ['Hormonothérapie Tamoxifène (5 ans terminés)', 'Supplémentation calcium/vitD'],
    rdv: [
      { date: '08 mai 2026', motif: 'Contrôle annuel',       medecin: 'Dr. El Harrab', statut: 'Effectué' },
      { date: '10 juin 2026', motif: 'Bilan densitométrie',  medecin: 'Dr. El Harrab', statut: 'Planifié' },
    ],
  },
];

/* ════════════════════════════════════════
   MODAL APERÇU DOSSIER
═══════════════════════════════════════ */
const ModalApercu = ({ patient, onClose, onImprimer }) => {
  const Section = ({ icon: Icon, title, children }) => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className="text-[#7F77DD]" strokeWidth={1.8} />
        <h4 className="text-[12px] font-bold text-[#7F77DD] uppercase tracking-widest">{title}</h4>
      </div>
      {children}
    </div>
  );

  const statutBadge = (s) => {
    const map = {
      Effectué: 'bg-emerald-50 text-emerald-700',
      Confirmé: 'bg-[#EEEDFE] text-[#7F77DD]',
      Planifié: 'bg-amber-50 text-amber-700',
    };
    return map[s] || 'bg-slate-100 text-slate-500';
  };

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
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEEDFE] text-[#7F77DD] flex items-center justify-center text-[12px] font-black">
              {patient.nom[0]}{patient.prenom[0]}
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                {patient.nom} {patient.prenom}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {patient.id} · {patient.age} ans · {patient.statut}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Informations personnelles */}
          <Section icon={User} title="Informations personnelles">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Phone, value: patient.telephone },
                { icon: Mail,  value: patient.email },
                { icon: MapPin, value: patient.adresse, full: true },
                { icon: Stethoscope, value: `${patient.medecinRef} — ${patient.specialite}`, full: true },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 ${item.full ? 'col-span-2' : ''}`}>
                  <item.icon size={13} className="text-slate-400 mt-0.5 shrink-0" strokeWidth={1.8} />
                  <span className="text-[12px] text-slate-600 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Antécédents */}
          <Section icon={ClipboardList} title="Antécédents médicaux">
            <ul className="space-y-2">
              {patient.antecedents.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 bg-[#FBEAF0]/50 border border-[#D4537E]/10 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4537E] mt-1.5 shrink-0" />
                  <span className="text-[12px] text-slate-700 font-medium">{a}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Examens */}
          <Section icon={FlaskConical} title="Examens récents">
            <div className="space-y-2">
              {patient.examens.map((e, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-[90px]">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{e.date}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-800">{e.type}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{e.resultat}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Traitements */}
          <Section icon={ClipboardList} title="Plans de traitement">
            <ul className="space-y-2">
              {patient.traitements.map((t, i) => (
                <li key={i} className="flex items-center gap-2.5 p-3 bg-[#EEEDFE]/50 border border-[#7F77DD]/10 rounded-xl">
                  <CheckCircle2 size={13} className="text-[#7F77DD] shrink-0" />
                  <span className="text-[12px] text-slate-700 font-medium">{t}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* RDV */}
          <Section icon={CalendarDays} title="Rendez-vous">
            <div className="space-y-2">
              {patient.rdv.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[12px] font-semibold text-slate-800">{r.motif}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{r.date} · {r.medecin}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${statutBadge(r.statut)}`}>
                    {r.statut}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Pied */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button onClick={onClose} className="text-[12px] font-medium text-slate-500 hover:text-slate-700 transition-colors">
            Fermer
          </button>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 h-10 px-4 border border-slate-200 bg-white text-slate-600 rounded-xl text-[12px] font-semibold hover:bg-slate-50 transition-colors">
              <Download size={14} /> Télécharger PDF
            </button>
            <button
              onClick={() => { onImprimer(patient); onClose(); }}
              className="flex items-center gap-2 h-10 px-5 bg-[#7F77DD] text-white rounded-xl text-[13px] font-semibold hover:bg-[#6b64c8] transition-colors shadow-sm"
            >
              <Printer size={14} /> Imprimer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ════════════════════════════════════════
   LIGNE PATIENT IMPRIMABLE
═══════════════════════════════════════ */
const PatientPrintRow = ({ patient, index, onApercu, onImprimer }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#7F77DD]/30 hover:shadow-sm transition-all"
  >
    {/* Avatar */}
    <div className="w-11 h-11 rounded-xl bg-[#EEEDFE] text-[#7F77DD] flex items-center justify-center text-[12px] font-black shrink-0 group-hover:bg-[#7F77DD] group-hover:text-white transition-colors">
      {patient.nom[0]}{patient.prenom[0]}
    </div>

    {/* Infos */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-semibold text-slate-900 truncate">
          {patient.nom} {patient.prenom}
        </p>
        <span className="text-[10px] text-slate-400 font-medium shrink-0">{patient.id}</span>
      </div>
      <div className="flex items-center gap-3 mt-0.5">
        <span className="text-[11px] text-slate-400">{patient.age} ans</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="text-[11px] text-[#7F77DD] font-medium truncate">Dr. {patient.medecinRef.replace('Dr. ', '').split(' ')[0]}</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="text-[11px] text-slate-400">Dernière consult. : {patient.derniereConsultation}</span>
      </div>
    </div>

    {/* Statut */}
    <span className={`hidden sm:inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${
      patient.statut === 'Nouveau'
        ? 'bg-[#FBEAF0] text-[#D4537E] border-[#D4537E]/20'
        : patient.statut === 'Suivi'
        ? 'bg-[#EEEDFE] text-[#7F77DD] border-[#7F77DD]/20'
        : 'bg-slate-100 text-slate-500 border-slate-200'
    }`}>
      {patient.statut}
    </span>

    {/* Actions */}
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => onApercu(patient)}
        className="flex items-center gap-1.5 h-9 px-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[12px] font-semibold hover:border-[#7F77DD]/40 hover:text-[#7F77DD] transition-colors"
      >
        <Eye size={13} /> Aperçu
      </button>
      <button
        onClick={() => onImprimer(patient)}
        className="flex items-center gap-1.5 h-9 px-3 bg-[#7F77DD] text-white rounded-xl text-[12px] font-semibold hover:bg-[#6b64c8] transition-colors shadow-sm"
      >
        <Printer size={13} /> Imprimer
      </button>
    </div>
  </motion.div>
);

/* ════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════ */
export default function SecretairePrint() {
  const [search, setSearch]             = useState('');
  const [filtreMedecin, setFiltreMedecin] = useState('Tous');
  const [patientApercu, setPatientApercu] = useState(null);
  const [printed, setPrinted]             = useState([]);

  const filtered = PATIENTS_MOCK.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.nom.toLowerCase().includes(q) ||
      p.prenom.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);
    const matchMedecin =
      filtreMedecin === 'Tous' ||
      p.medecinRef.includes(filtreMedecin);
    return matchSearch && matchMedecin;
  });

  const handleImprimer = (patient) => {
    setPrinted((prev) => [...new Set([...prev, patient.id])]);
    window.print();
  };

  return (
    <div className="space-y-5 pb-8">

      {/* ── En-tête ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Imprimer dossier</h2>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">
            Recherchez un patient, consultez l'aperçu et générez le PDF
          </p>
        </div>
      </motion.div>

      {/* ── Barre de recherche ── */}
      <motion.div {...fadeUp(0.05)} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou ID patient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 outline-none focus:border-[#7F77DD] focus:ring-2 focus:ring-[#7F77DD]/10 transition-all placeholder:text-slate-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={filtreMedecin}
            onChange={(e) => setFiltreMedecin(e.target.value)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 outline-none focus:border-[#7F77DD] transition-colors"
          >
            {['Tous', 'El Harrab', 'Benali', 'Ibrahim'].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* ── Résultats ── */}
      <motion.div {...fadeUp(0.1)}>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">
            {filtered.length} patient{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </p>
          {printed.length > 0 && (
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              {printed.length} dossier{printed.length > 1 ? 's' : ''} imprimé{printed.length > 1 ? 's' : ''} ce jour
            </p>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((p, i) => (
              <PatientPrintRow
                key={p.id}
                patient={p}
                index={i}
                onApercu={setPatientApercu}
                onImprimer={handleImprimer}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-300">
            <FileText size={44} strokeWidth={1.2} />
            <div className="text-center">
              <p className="text-[14px] font-semibold text-slate-400">Aucun dossier trouvé</p>
              <p className="text-[12px] text-slate-300 mt-1">Modifiez vos critères de recherche</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Info impression ── */}
      <motion.div
        {...fadeUp(0.2)}
        className="flex items-start gap-3 p-4 bg-[#EEEDFE]/60 border border-[#7F77DD]/15 rounded-2xl"
      >
        <Printer size={16} className="text-[#7F77DD] mt-0.5 shrink-0" strokeWidth={1.8} />
        <div>
          <p className="text-[12px] font-semibold text-[#7F77DD]">Comment fonctionne l'impression</p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            Cliquez sur <strong>Aperçu</strong> pour consulter le dossier complet avant impression.
            Cliquez sur <strong>Imprimer</strong> pour générer directement un PDF propre et conforme.
            Le dossier comprend : antécédents, examens, traitements et historique des RDV.
          </p>
        </div>
      </motion.div>

      {/* ── Modal aperçu ── */}
      <AnimatePresence>
        {patientApercu && (
          <ModalApercu
            patient={patientApercu}
            onClose={() => setPatientApercu(null)}
            onImprimer={handleImprimer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}