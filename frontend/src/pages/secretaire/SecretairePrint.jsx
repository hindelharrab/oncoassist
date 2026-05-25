import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer, Search, FileText, Eye, X,
  Filter, CheckCircle2, AlertCircle, Loader2,
  ClipboardList, Calendar
} from 'lucide-react';
import secretairePrintService from '../../services/secretairePrintService';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut', delay },
});

/* ── helpers ── */
const fmt     = (v) => v || '—';
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR') : '—';

const TYPE_LABELS_BIO = {
  fibroadenoma:       'Fibroadénome',
  tubular_adenoma:    'Adénome Tubulaire',
  ductal_carcinoma:   'Carcinome Canalaire',
  mucinous_carcinoma: 'Carcinome Mucineux',
};

/* ════════════════════════════════════════
   COMPOSANTS PDF
════════════════════════════════════════ */
const PdfWrap = ({ children }) => (
  <div
    className="w-full min-h-[297mm] bg-white p-[15mm] relative flex flex-col"
    style={{ fontFamily: 'system-ui,sans-serif' }}
  >
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.025]
                    pointer-events-none rotate-[-35deg] select-none overflow-hidden">
      <span className="text-6xl font-black uppercase tracking-[0.5em] text-slate-900">
        ONCOASSIST
      </span>
    </div>
    <div className="relative z-10 flex flex-col flex-1">{children}</div>
  </div>
);

/* ── Référence document (tout en bas) ── */
const PdfRef = ({ id }) => (
  <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end">
    <div>
      <p className="text-[7px] text-slate-400 uppercase font-black">Réf document</p>
      <p className="text-[8px] font-mono font-bold text-slate-700">
        ONCO-{String(id || '').substring(0, 8).toUpperCase() || 'XXXXXX'}
      </p>
    </div>
    <div className="flex flex-col items-center opacity-30">
      <div className="w-10 h-10 border border-slate-400 flex items-center
                      justify-center rounded mb-1">
        <span className="text-[5px] font-mono leading-none text-center">QR VALIDÉ</span>
      </div>
      <p className="text-[6px] font-black uppercase">Signé électroniquement</p>
    </div>
  </div>
);

/* ── Signature (avant la ref) ── */
const PdfSignature = ({ medecinRef }) => (
  <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 mb-4">
    <div>
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">
        Médecin responsable
      </p>
      <p className="text-[9px] font-bold text-slate-700">Dr. {medecinRef || '—'}</p>
      <div className="mt-6 border-b border-slate-300 w-28" />
      <p className="text-[7px] text-slate-400 mt-1">Signature</p>
    </div>
    <div>
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">
        Cachet établissement
      </p>
      <div className="w-16 h-16 border border-dashed border-slate-200 rounded
                      flex items-center justify-center">
        <p className="text-[6px] text-slate-300 text-center font-bold uppercase">
          Cachet<br/>officiel
        </p>
      </div>
    </div>
  </div>
);

const RapportSection = ({ title }) => (
  <div className="mt-6 mb-2">
    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-pink-600
                  pb-1 border-b border-pink-100">{title}</p>
  </div>
);

const RapportRow = ({ label, value, accent }) => (
  <div className="flex justify-between py-1 border-b border-slate-100 last:border-0">
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400
                     shrink-0 mr-4">{label}</span>
    <span className={`text-[9px] font-medium text-right leading-snug ${accent || 'text-slate-800'}`}>
      {value || '—'}
    </span>
  </div>
);

const RapportTexte = ({ text }) => text ? (
  <p className="text-[9px] font-medium text-slate-700 leading-relaxed py-1
                border-b border-slate-100">{text}</p>
) : null;

/* ════════════════════════════════════════
   PDF RAPPORT DE SYNTHÈSE
════════════════════════════════════════ */
const PdfRapport = ({ selection, examensData, patient }) => {
  const hasManuel  = selection?.examenManuel   && examensData?.RESULTAT_MANUEL?.length  > 0;
  const hasMammo   = selection?.mammographie   && examensData?.RESULTAT_MAMMOGRAPHIE?.length > 0;
  const hasEcho    = selection?.echographie    && examensData?.RESULTAT_ECHOGRAPHIE?.length > 0;
  const hasIRM     = selection?.irm            && examensData?.RESULTAT_IRM?.length     > 0;
  const hasBiopsie = selection?.biopsie        && examensData?.RESULTAT_BIOPSIE?.length  > 0;

  return (
    <PdfWrap>
      {/* ── Header ── */}
      <div className="mb-8 pb-5 border-b-2 border-slate-900 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-black tracking-tighter text-slate-900 italic uppercase">
            CENTRE DE SÉNOLOGIE
          </h2>
          <p className="text-[9px] font-bold text-slate-500 mt-0.5 italic">
            Pôle d'excellence en sénologie
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-pink-600">
            Rapport de Synthèse
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">
            Dossier Médical Complet
          </p>
          <p className="text-[9px] font-bold text-slate-400 mt-1">
            {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* ── INFOS GÉNÉRALES ── */}
      {selection?.infosGenerales && patient && (<>
        <RapportSection title="Informations Générales" />
        <RapportRow label="Nom Complet"
          value={`${patient.prenom || ''} ${patient.nom || ''}`} />
        <RapportRow label="Date de Naissance"
          value={patient.dateNaissance
            ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : '—'} />
        <RapportRow label="Âge"
          value={patient.age ? `${patient.age} ans` : '—'} />
        <RapportRow label="Téléphone"  value={patient.telephone} />
        <RapportRow label="Email"      value={patient.email} />
        <RapportRow label="Adresse"    value={patient.adresse} />
        <RapportRow label="Médecin référent"
          value={patient.medecinRef ? `Dr. ${patient.medecinRef}` : '—'} />
        <RapportRow label="Statut"
          value={patient.statut}
          accent={
            patient.statut === 'CRITIQUE' ? 'text-rose-600'
            : patient.statut === 'STABLE' ? 'text-emerald-600'
            : 'text-slate-500'
          }
        />

        {/* Antécédents */}
        {examensData?.RESULTAT_MANUEL?.length > 0 && (() => {
          const last  = examensData.RESULTAT_MANUEL[0];
          const medic = last.antecedentsMedicaux  || [];
          const famil = last.antecedentsFamiliaux || [];
          return (<>
            {medic.length > 0 && (<>
              <RapportSection title="Antécédents Médicaux" />
              {medic.map((a, i) => (
                <RapportRow key={i} label={a.maladie}
                  value={[
                    a.statut?.replace('_', ' '),
                    a.dateDiagnostic
                      ? new Date(a.dateDiagnostic).getFullYear() : null,
                    a.traitements || null,
                  ].filter(Boolean).join(' — ')} />
              ))}
            </>)}
            {famil.length > 0 && (<>
              <RapportSection title="Antécédents Familiaux" />
              {famil.map((a, i) => (
                <RapportRow key={i}
                  label={`${a.lienFamilial} — ${a.maladie}`}
                  value={a.ageSurvenue ? `Détecté à ${a.ageSurvenue} ans` : '—'} />
              ))}
            </>)}
          </>);
        })()}
      </>)}

      {/* ── EXAMEN MANUEL ── */}
      {hasManuel && (() => {
        const consult = examensData.RESULTAT_MANUEL[0];
        const em = consult.examenManuel;
        if (!em) return null;
        return (<>
          <RapportSection title="Examen Clinique Manuel" />
          <RapportRow label="Date"
            value={fmtDate(em.date)} />
          <RapportRow label="Médecin"
            value={`Dr. ${em.auteurPrenom || ''} ${em.auteurNom || ''}`} />
          <RapportRow label="Site Anatomique" value={fmt(em.siteAnatomique)} />
          <RapportRow label="Masse Palpée"
            value={em.massePalpee ? 'Oui' : 'Non'}
            accent={em.massePalpee ? 'text-rose-600' : 'text-emerald-600'} />
          {em.massePalpee && (
            <RapportRow label="Localisation" value={fmt(em.localisationDeMasse)} />
          )}
          <RapportRow label="Aspect Peau"  value={fmt(em.aspectPeau)} />
          <RapportRow label="Adénopathies" value={fmt(em.adenopathies)} />
          {em.description && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em]
                          text-slate-400 mt-3 mb-1">Conclusions</p>
            <RapportTexte text={em.description} />
          </>)}
        </>);
      })()}

      {/* ── MAMMOGRAPHIE ── */}
      {hasMammo && (() => {
        const exam    = examensData.RESULTAT_MAMMOGRAPHIE[0];
        const isMalin = exam.predictionIA === 'MALIGNANT';
        const conf    = (exam.confidencePct
          || (exam.scoreRisqueIA * 100) || 0).toFixed(1);
        const birads  = exam.scoreBIRADS?.replace('BIRADS_', 'BI-RADS ') || '—';
        return (<>
          <RapportSection title="Mammographie Numérique" />
          <RapportRow label="Date"
            value={fmtDate(exam.dateExamen)} />
          <RapportRow label="Classification BI-RADS" value={birads} />
          <RapportRow label="Résultat IA"
            value={`${isMalin ? 'Malin' : 'Bénin'} — ${conf}% de confiance`}
            accent={isMalin ? 'text-rose-600' : 'text-emerald-600'} />
          <RapportRow label="Localisation"
            value={`${exam.quadrantShort || '—'} — ${exam.positionText || '—'}`} />
          {exam.recommendationIA && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em]
                          text-slate-400 mt-3 mb-1">Recommandation</p>
            <RapportTexte text={exam.recommendationIA} />
          </>)}
        </>);
      })()}

      {/* ── ÉCHOGRAPHIE ── */}
      {hasEcho && (() => {
        const exam = examensData.RESULTAT_ECHOGRAPHIE[0];
        return (<>
          <RapportSection title="Échographie Mammaire" />
          <RapportRow label="Date"          value={fmtDate(exam.date)} />
          <RapportRow label="Sein Examiné"  value={fmt(exam.seinExamine)} />
          <RapportRow label="Quadrant"       value={fmt(exam.quadrant)} />
          <RapportRow label="Type Structure" value={fmt(exam.typeStructure)} />
          <RapportRow label="Score BI-RADS"  value={fmt(exam.scoreBIRADS)} />
          <RapportRow label="Taille"
            value={`${exam.tailleAxe1||'0'} × ${exam.tailleAxe2||'0'} × ${exam.tailleAxe3||'0'} mm`} />
          {exam.recommandation && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em]
                          text-slate-400 mt-3 mb-1">Recommandation</p>
            <RapportTexte text={exam.recommandation} />
          </>)}
        </>);
      })()}

      {/* ── IRM ── */}
      {hasIRM && (() => {
        const exam = examensData.RESULTAT_IRM[0];
        return (<>
          <RapportSection title="IRM Mammaire" />
          <RapportRow label="Date"          value={fmtDate(exam.date)} />
          <RapportRow label="Sein Examiné"  value={fmt(exam.seinExamine)} />
          <RapportRow label="Séquences"     value={fmt(exam.sequences)} />
          <RapportRow label="Signal T2"     value={fmt(exam.signalT2)} />
          <RapportRow label="Score BI-RADS" value={fmt(exam.scoreBIRADS)} />
          <RapportRow label="Diffusion"
            value={fmt(exam.restrictionDiffusion)}
            accent={exam.restrictionDiffusion === 'Oui'
              ? 'text-rose-600' : 'text-emerald-600'} />
          {exam.recommandation && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em]
                          text-slate-400 mt-3 mb-1">Recommandation</p>
            <RapportTexte text={exam.recommandation} />
          </>)}
        </>);
      })()}

      {/* ── BIOPSIE ── */}
      {hasBiopsie && (() => {
        const exam    = examensData.RESULTAT_BIOPSIE[0];
        const isMalin = exam.classeBinaire === 'MALIN';
        const scoreB  = exam.scoreBenignMalin
          ? `${(exam.scoreBenignMalin * 100).toFixed(1)}%` : '—';
        return (<>
          <RapportSection title="Analyse de Biopsie" />
          <RapportRow label="Date"           value={fmtDate(exam.date)} />
          <RapportRow label="Site Anatomique" value={fmt(exam.siteAnatomique)} />
          <RapportRow label="Grossissement"   value={fmt(exam.grossissement)} />
          {exam.isAnalysed && (<>
            <RapportRow label="Résultat IA"
              value={`${isMalin ? 'Malin' : 'Bénin'} — ${scoreB}`}
              accent={isMalin ? 'text-rose-600' : 'text-emerald-600'} />
            {exam.typeTumeur && (
              <RapportRow label="Type Tumeur"
                value={TYPE_LABELS_BIO[exam.typeTumeur] || exam.typeTumeur} />
            )}
          </>)}
          {exam.notes && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em]
                          text-slate-400 mt-3 mb-1">Compte-Rendu</p>
            <RapportTexte text={exam.notes} />
          </>)}
        </>);
      })()}

      {!selection?.infosGenerales && !hasManuel && !hasMammo
       && !hasEcho && !hasIRM && !hasBiopsie && (
        <p className="text-[10px] text-slate-400 italic mt-8 text-center">
          Aucun élément sélectionné pour ce rapport.
        </p>
      )}

      {/* ── Signature (une seule fois) ── */}
    

      {/* ── Référence document ── */}
      <PdfRef id="rapport-global" />
    </PdfWrap>
  );
};

/* ════════════════════════════════════════
   MODAL APERÇU
════════════════════════════════════════ */
const ModalApercu = ({ patient, rapportData, onClose, onImprimer }) => {
  if (!rapportData) return null;
  const { selection, examensData, patient: patientFromDoc } = rapportData;
  const patientFinal = patientFromDoc || patient;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh', zIndex: 999999,
      display: 'flex', flexDirection: 'column',
      background: 'rgba(15,23,42,0.82)',
      backdropFilter: 'blur(6px)',
    }}>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-zone-sec, #print-zone-sec * {
            visibility: visible !important;
          }
          #print-zone-sec {
            position: fixed !important; inset: 0;
            width: 210mm; min-height: 297mm;
            background: #fff !important;
            margin: 0 auto;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Barre du haut */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px', background: '#fff',
        borderBottom: '1px solid #f1f5f9', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '16px',
            background: '#ec4899', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <ClipboardList size={22} />
          </div>
          <div>
            <h3 style={{
              fontSize: '15px', fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              color: '#0f172a', margin: 0,
            }}>Rapport de Synthèse</h3>
            <p style={{
              fontSize: '10px', fontWeight: 900, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              margin: '2px 0 0',
            }}>
              {patientFinal?.prenom} {patientFinal?.nom}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onImprimer} style={{
            height: '44px', padding: '0 24px', borderRadius: '12px',
            background: '#0f172a', color: '#fff', fontSize: '11px',
            fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.1em', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Printer size={16} /> Imprimer
          </button>
          <button onClick={onClose} style={{
            width: '44px', height: '44px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            borderRadius: '12px', background: '#fff',
            border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b',
          }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Zone scrollable */}
      <div style={{
        flex: 1, overflowY: 'auto', background: '#e2e8f0',
        padding: '32px', display: 'flex',
        flexDirection: 'column', alignItems: 'center',
      }}>
        <div
          id="print-zone-sec"
          style={{
            width: '148mm',
            boxShadow: '0 4px 40px rgba(0,0,0,0.15)',
          }}
        >
          <PdfRapport
            selection={selection}
            examensData={examensData}
            patient={patientFinal}
          />
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   LIGNE PATIENT
════════════════════════════════════════ */
const PatientRow = ({
  patient, index, onApercu, onImprimer, loadingId, printed
}) => {
  const [imgError, setImgError] = useState(false);
  const showPhoto = patient.photoProfil && !imgError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group flex items-center gap-4 p-4 bg-white rounded-2xl
                 border border-slate-100 hover:border-slate-200
                 hover:shadow-sm transition-all"
    >
      {/* Avatar */}
      {showPhoto ? (
        <img
          src={`http://localhost:8080/${patient.photoProfil}`}
          alt={`${patient.prenom} ${patient.nom}`}
          className="w-11 h-11 rounded-xl object-cover shrink-0"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600
                        flex items-center justify-center text-[12px]
                        font-black shrink-0">
          {patient.nom?.[0]}{patient.prenom?.[0]}
        </div>
      )}

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-semibold text-slate-900 truncate">
            {patient.nom} {patient.prenom}
          </p>
          {patient.hasRapportFinal && (
            <span className="text-[10px] font-semibold text-emerald-600
                             bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
              ✓ Rapport disponible
            </span>
          )}
          {printed.includes(patient.id) && (
            <span className="text-[10px] font-semibold text-violet-600
                             bg-violet-50 px-2 py-0.5 rounded-md shrink-0">
              ✓ Imprimé
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-[11px] text-slate-400">
            {patient.age ? `${patient.age} ans` : '—'}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span className="text-[11px] text-slate-500">
            {patient.medecinRef
              ? `Dr. ${patient.medecinRef}` : 'Non assigné'}
          </span>
          {patient.derniereConsultation && <>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="text-[11px] text-slate-400
                             flex items-center gap-1">
              <Calendar size={10} /> {patient.derniereConsultation}
            </span>
          </>}
        </div>
      </div>

      {/* Statut */}
      <span className={`hidden sm:inline-flex text-[11px] font-semibold
                        px-2.5 py-1 rounded-lg border shrink-0 ${
        patient.statut === 'STABLE' || patient.statut === 'EN_SUIVI'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : patient.statut === 'A_SURVEILLER'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : patient.statut === 'CRITIQUE'
              ? 'bg-red-50 text-red-700 border-red-200'
              : patient.statut === 'NOUVELLE'
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
      }`}>
        {patient.statut || '—'}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {patient.hasRapportFinal ? (
          <>
            <button
              onClick={() => onApercu(patient)}
              disabled={loadingId === patient.id}
              className="flex items-center gap-1.5 h-9 px-3 bg-white
                         border border-slate-200 text-slate-600 rounded-xl
                         text-[12px] font-semibold hover:border-slate-300
                         transition-colors disabled:opacity-50"
            >
              {loadingId === patient.id
                ? <Loader2 size={13} className="animate-spin" />
                : <Eye size={13} />
              }
              Aperçu
            </button>
            <button
              onClick={() => onImprimer(patient)}
              disabled={loadingId === patient.id}
              className="flex items-center gap-1.5 h-9 px-3 bg-slate-800
                         text-white rounded-xl text-[12px] font-semibold
                         hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Printer size={13} /> Imprimer
            </button>
          </>
        ) : (
          <span className="text-[11px] text-slate-400 italic px-3">
            Aucun rapport généré
          </span>
        )}
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════ */
export default function SecretairePrint() {
  const [patients, setPatients]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState('');
  const [filtreMedecin, setFiltreMedecin] = useState('Tous');
  const [patientApercu, setPatientApercu] = useState(null);
  const [rapportData, setRapportData]     = useState(null);
  const [loadingId, setLoadingId]         = useState(null);
  const [printed, setPrinted]             = useState([]);

  // Médecins extraits dynamiquement des patients chargés
  const medecins = [
    ...new Set(patients.map(p => p.medecinRef).filter(Boolean))
  ].sort();

  useEffect(() => {
    secretairePrintService.getAllPatients()
      .then(data => setPatients(data))
      .catch(err => {
        console.error(err);
        setError('Impossible de charger les patients');
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Filtrage ── */
  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || p.nom?.toLowerCase().includes(q)
      || p.prenom?.toLowerCase().includes(q)
      || p.email?.toLowerCase().includes(q);
    const matchMedecin = filtreMedecin === 'Tous'
      || p.medecinRef === filtreMedecin;
    return matchSearch && matchMedecin;
  });

  /* ── Charger rapport ── */
  const chargerRapport = async (patient) => {
    setLoadingId(patient.id);
    try {
      return await secretairePrintService.getRapportFinal(patient.id);
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoadingId(null);
    }
  };

  /* ── Aperçu ── */
  const handleApercu = async (patient) => {
    const data = await chargerRapport(patient);
    if (data) {
      setPatientApercu(patient);
      setRapportData(data);
    } else {
      setError('Impossible de charger le rapport');
    }
  };

  /* ── Imprimer direct ── */
  const handleImprimer = async (patient) => {
    const data = await chargerRapport(patient);
    if (!data) { setError('Impossible de charger le rapport'); return; }
    setPrinted(prev => [...new Set([...prev, patient.id])]);
    setPatientApercu(patient);
    setRapportData(data);
    setTimeout(() => window.print(), 600);
  };

  /* ── Imprimer depuis modal ── */
  const handleImprimerDepuisModal = () => {
    if (!patientApercu) return;
    setPrinted(prev => [...new Set([...prev, patientApercu.id])]);
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <motion.div {...fadeUp(0)}>
        <h2 className="text-xl font-black text-slate-900">
          Imprimer dossier
        </h2>
        <p className="text-[12px] text-slate-400 font-medium mt-0.5">
          Rapports de synthèse — patients de votre spécialité
        </p>
      </motion.div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border
                        border-red-200 rounded-xl text-red-600 text-[12px]">
          <AlertCircle size={14} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Recherche + Filtre médecin dynamique */}
      <motion.div {...fadeUp(0.05)} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200
                       rounded-xl text-[13px] text-slate-700 outline-none
                       focus:border-slate-400 transition-all placeholder:text-slate-300"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtre médecin — dynamique depuis les données */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={filtreMedecin}
            onChange={e => setFiltreMedecin(e.target.value)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-xl
                       text-[13px] font-medium text-slate-600 outline-none
                       focus:border-slate-400 transition-colors"
          >
            <option value="Tous">
              Tous les médecins ({medecins.length})
            </option>
            {medecins.map(m => {
              const count = patients.filter(p => p.medecinRef === m).length;
              return (
                <option key={m} value={m}>
                  Dr. {m} ({count} patient{count > 1 ? 's' : ''})
                </option>
              );
            })}
          </select>
          {filtreMedecin !== 'Tous' && (
            <button
              onClick={() => setFiltreMedecin('Tous')}
              className="flex items-center gap-1 h-9 px-3 bg-white
                         border border-slate-200 rounded-xl text-[12px]
                         font-medium text-slate-500 hover:text-slate-700
                         hover:bg-slate-50 transition-colors"
            >
              <X size={13} /> Réinitialiser
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.08)}
        className="flex items-center gap-4 flex-wrap">
        <span className="text-[12px] font-semibold text-slate-400
                         uppercase tracking-widest">
          {filtered.length} patient{filtered.length > 1 ? 's' : ''}
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="text-[12px] font-semibold text-emerald-500">
          {filtered.filter(p => p.hasRapportFinal).length} avec rapport
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="text-[12px] font-semibold text-slate-400">
          {medecins.length} médecin{medecins.length > 1 ? 's' : ''}
        </span>
        {printed.length > 0 && <>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-[11px] text-violet-600 font-medium
                           flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            {printed.length} imprimé{printed.length > 1 ? 's' : ''} ce jour
          </span>
        </>}
      </motion.div>

      {/* Liste patients */}
      <motion.div {...fadeUp(0.1)}>
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((p, i) => (
              <PatientRow
                key={p.id}
                patient={p}
                index={i}
                onApercu={handleApercu}
                onImprimer={handleImprimer}
                loadingId={loadingId}
                printed={printed}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FileText size={44} strokeWidth={1.2} className="text-slate-300" />
            <p className="text-[14px] font-semibold text-slate-400">
              Aucun dossier trouvé
            </p>
            {filtreMedecin !== 'Tous' && (
              <button
                onClick={() => setFiltreMedecin('Tous')}
                className="text-[12px] text-violet-500 font-medium
                           hover:underline"
              >
                Voir tous les patients
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Note */}
      <motion.div {...fadeUp(0.2)}
        className="flex items-start gap-3 p-4 bg-slate-50 border
                   border-slate-200 rounded-2xl">
        <Printer size={15} className="text-slate-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[12px] font-semibold text-slate-600">
            Rapport de synthèse généré par le médecin
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Seuls les patients ayant un rapport final généré depuis
            l'espace médecin sont imprimables. Le filtre par médecin
            se construit automatiquement depuis les patients de votre spécialité.
          </p>
        </div>
      </motion.div>

      {/* Modal aperçu */}
      <AnimatePresence>
        {patientApercu && rapportData && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalApercu
              patient={patientApercu}
              rapportData={rapportData}
              onClose={() => {
                setPatientApercu(null);
                setRapportData(null);
              }}
              onImprimer={handleImprimerDepuisModal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}