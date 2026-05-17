import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Calendar, CheckCircle2, Clock, AlertCircle, Loader2,
  Microscope, ChevronDown, ExternalLink,
  Stethoscope, Radio, Activity, Magnet, FlaskConical, ImageOff,
  Pill, HeartPulse, ShieldAlert, Dna, MapPin, UserCheck, CalendarClock,
} from 'lucide-react';
import { getVueEnsemble } from '../../../services/vueEnsembleService';

/* ─────────────────────────────────────────────
   CONFIG EXAMENS — INCHANGÉ
───────────────────────────────────────────── */
const EXAM_CONFIG = {
  MANUEL:       { label: 'Examen Manuel', color: '#7F77DD', bg: '#7F77DD18', Icon: Stethoscope  },
  MAMMOGRAPHIE: { label: 'Mammographie',  color: '#D4537E', bg: '#D4537E18', Icon: Radio        },
  ECHOGRAPHIE:  { label: 'Échographie',   color: '#1D9E75', bg: '#1D9E7518', Icon: Activity     },
  IRM:          { label: 'IRM Mammaire',  color: '#378ADD', bg: '#378ADD18', Icon: Magnet       },
  BIOPSIE:      { label: 'Biopsie',       color: '#D85A30', bg: '#D85A3018', Icon: FlaskConical },
};
const EXAM_ORDER = ['MANUEL', 'MAMMOGRAPHIE', 'ECHOGRAPHIE', 'IRM', 'BIOPSIE'];
const TIMELINE_COLORS = ['#ec4899','#f43f5e','#d946ef','#a855f7','#7c3aed','#6366f1','#3b82f6','#0ea5e9'];

/* ─────────────────────────────────────────────
   HOOK
───────────────────────────────────────────── */
function useVueEnsemble(patientId) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    if (!patientId) { setError("ID patient manquant dans l'URL"); return; }
    setLoading(true); setError(null);
    try {
      const json = await getVueEnsemble(patientId);
      setData(json);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Erreur inconnue');
    } finally { setLoading(false); }
  }, [patientId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, loading, error, refetch: fetchData };
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatDateLong(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatTime(str) {
  if (!str) return '';
  const d = new Date(str);
  const h = d.getHours(), m = d.getMinutes();
  if (h === 0 && m === 0) return '';
  return `${String(h).padStart(2,'0')}h${String(m).padStart(2,'0')}`;
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 size={36} className="text-violet-400 animate-spin" />
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chargement du dossier…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertCircle size={36} className="text-rose-400" />
      <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest">{message}</p>
      <button onClick={onRetry} className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Réessayer</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PATIENT HEADER — INCHANGÉ
───────────────────────────────────────────── */
function PatientHeader({ patient }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/40 -skew-x-12 translate-x-20 pointer-events-none" />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          {patient.photoProfil ? (
            <img src={patient.photoProfil} alt="Photo profil" className="w-16 h-16 rounded-2xl object-cover border border-violet-100" />
          ) : (
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center border border-violet-100">
              <User size={32} strokeWidth={1} className="text-violet-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{patient.nom} {patient.prenom}</h1>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">ID: {patient.dossierId}</span>
            </div>
            <div className="flex items-center gap-6">
              {patient.age && (
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                  <Calendar size={11} className="text-slate-400" /> {patient.age} ANS
                </p>
              )}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">SUIVI ACTIF</span>
              </div>
            </div>
          </div>
        </div>
        {patient.equipe?.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">ÉQUIPE DE RÉFÉRENCE</p>
              <div className="flex -space-x-1.5 h-7 justify-end">
                {patient.equipe.map((doc, i) => (
                  <div key={i} title={`Dr. ${doc.nom} ${doc.prenom} — ${doc.specialite}`}
                    className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black uppercase ${i === 0 ? 'bg-violet-50 text-violet-500' : 'bg-pink-50 text-pink-500'}`}>
                    {doc.nom.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
            <button className="h-11 px-6 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md">
              NOUVEAU COMPTE RENDU
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ANTÉCÉDENTS MÉDICAUX
   Style exact du preview : border-left accent,
   badge pill statut, pills traitements, hover border
───────────────────────────────────────────── */
function AntecedentsMedicaux({ antecedents }) {
  const STATUT_MAP = {
    EN_COURS:  { label: 'En cours',  color: '#534AB7', bg: '#EEEDFE', dot: '#7F77DD' },
    STABILISE: { label: 'Stabilisé', color: '#993556', bg: '#FBEAF0', dot: '#D4537E' },
    RESOLU:    { label: 'Résolu',    color: '#3C3489', bg: '#EEEDFE', dot: '#AFA9EC' },
    CHRONIQUE: { label: 'Chronique', color: '#72243E', bg: '#FBEAF0', dot: '#ED93B1' },
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EEEDFE' }}>
          <HeartPulse size={15} color="#7F77DD" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 leading-none">Antécédents médicaux</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{antecedents.length} entrée{antecedents.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 px-4 py-4 space-y-2 overflow-auto">
        {antecedents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <HeartPulse size={24} className="text-slate-200" />
            <p className="text-[11px] text-slate-400 italic">Aucun antécédent renseigné</p>
          </div>
        ) : antecedents.map((item) => {
          const st = STATUT_MAP[item.statut] || STATUT_MAP.STABILISE;
          const traitements = item.traitements
            ? item.traitements.split(/[,;+]/).map(t => t.trim()).filter(Boolean)
            : [];
          return (
            <div key={item.id}
              className="rounded-xl overflow-hidden transition-all duration-200 cursor-default"
              style={{ border: '0.5px solid #f1f5f9', background: '#fafbfc' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#CECBF6'; e.currentTarget.style.background = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#fafbfc'; }}
            >
              <div className="flex items-stretch">
                {/* Accent latéral */}
                <div style={{ width: 3, flexShrink: 0, background: st.dot }} />
                <div className="flex-1 px-3 py-3 min-w-0">
                  {/* Nom + badge */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-[12px] font-bold text-slate-900 leading-tight flex-1">{item.maladie}</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  {/* Date */}
                  {item.dateDiagnostic && (
                    <div className="flex items-center gap-1 mb-2" style={{ color: '#94a3b8' }}>
                      <Calendar size={10} />
                      <span className="text-[10px]">{formatDate(item.dateDiagnostic)}</span>
                    </div>
                  )}
                  {/* Pills traitements */}
                  {traitements.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {traitements.map((t, ti) => (
                        <span key={ti} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: '#f1f5f9', color: '#64748b', border: '0.5px solid #e2e8f0' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ANTÉCÉDENTS FAMILIAUX
   Style exact du preview : icône user violet,
   lien+age en meta, badge risque rose/violet
───────────────────────────────────────────── */
function AntecedentsFamiliaux({ antecedents }) {
  const LIEN_MAP = {
    MERE:             'Mère',             PERE:           'Père',
    SOEUR:            'Sœur',             FRERE:          'Frère',
    GRAND_MERE:       'Grand-mère',       GRAND_PERE:     'Grand-père',
    TANTE:            'Tante',            ONCLE:          'Oncle',
    TANTE_MATERNELLE: 'Tante maternelle', ONCLE_MATERNEL: 'Oncle maternel',
    COUSIN:           'Cousin(e)',
  };
  const RISK = {
    MERE: 'h', PERE: 'h', SOEUR: 'h', FRERE: 'm',
    GRAND_MERE: 'm', GRAND_PERE: 'm', TANTE: 'l', ONCLE: 'l',
    TANTE_MATERNELLE: 'm', ONCLE_MATERNEL: 'm', COUSIN: 'l',
  };
  const RISK_STYLE = {
    h: { label: 'Élevé',  bg: '#FBEAF0', color: '#993556', border: '#F4C0D1' },
    m: { label: 'Modéré', bg: '#EEEDFE', color: '#534AB7', border: '#CECBF6' },
    l: { label: 'Faible', bg: '#EEEDFE', color: '#3C3489', border: '#CECBF6' },
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FBEAF0' }}>
          <Dna size={15} color="#D4537E" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 leading-none">Antécédents familiaux</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{antecedents.length} facteur{antecedents.length > 1 ? 's' : ''} identifié{antecedents.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 px-4 py-4 space-y-2 overflow-auto">
        {antecedents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Dna size={24} className="text-slate-200" />
            <p className="text-[11px] text-slate-400 italic">Aucun antécédent familial</p>
          </div>
        ) : antecedents.map((item) => {
          const key  = item.lienFamilial?.toUpperCase().replace(/[\s-]/g, '_') || '';
          const lbl  = LIEN_MAP[key] || item.lienFamilial?.replace(/_/g, ' ') || '—';
          const risk = RISK[key] || 'm';
          const rs   = RISK_STYLE[risk];
          return (
            <div key={item.id}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 cursor-default"
              style={{ border: '0.5px solid #f1f5f9', background: '#fafbfc' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#CECBF6'; e.currentTarget.style.background = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#fafbfc'; }}
            >
              {/* Icône user violet */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EEEDFE' }}>
                <User size={14} color="#7F77DD" strokeWidth={2} />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold mb-0.5" style={{ color: '#7F77DD' }}>
                  {lbl}{item.ageSurvenue ? <span style={{ color: '#94a3b8', fontWeight: 400 }}> · {item.ageSurvenue}</span> : null}
                </p>
                <p className="text-[12px] font-bold text-slate-800 truncate">{item.maladie}</p>
              </div>
              {/* Badge risque */}
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: rs.bg, color: rs.color, border: `0.5px solid ${rs.border}` }}>
                {rs.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PROCHAIN RENDEZ-VOUS
   Style exact du preview : carré countdown violet,
   motif + lieu en lignes avec icônes, badge statut
───────────────────────────────────────────── */
function ProchainRendezVous({ rdv }) {
  const getDaysLeft = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const d     = new Date(dateStr); d.setHours(0,0,0,0);
    return Math.round((d - today) / 86400000);
  };
  const daysLeft = rdv ? getDaysLeft(rdv.date) : null;

  return (
    <section className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EEEDFE' }}>
          <CalendarClock size={15} color="#7F77DD" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 leading-none">Prochain rendez-vous</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Agenda du suivi</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 py-4">
        {!rdv ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#f8fafc', border: '0.5px solid #f1f5f9' }}>
              <Calendar size={20} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-[11px] text-slate-400 italic text-center">Aucune consultation planifiée</p>
          </div>
        ) : (
          /* RDV existant — structure exacte du preview */
          <div className="flex-1 rounded-xl overflow-hidden flex flex-col" style={{ border: '0.5px solid #f1f5f9' }}>

            {/* Bloc date + countdown */}
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '0.5px solid #f1f5f9' }}>

              {/* Carré countdown violet */}
              {daysLeft !== null && daysLeft >= 0 && !rdv.aujourdhui && (
                <div className="flex flex-col items-center justify-center rounded-xl shrink-0"
                  style={{ width: 42, height: 42, background: '#EEEDFE', border: '0.5px solid #CECBF6' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#534AB7', lineHeight: 1 }}>{daysLeft}</span>
                  <span style={{ fontSize: 8, color: '#7F77DD', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {daysLeft > 1 ? 'jours' : 'jour'}
                  </span>
                </div>
              )}

              {/* Date + heure */}
              <div className="flex-1 min-w-0">
                {rdv.aujourdhui && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold mb-1"
                    style={{ background: '#FBEAF0', color: '#993556', border: '0.5px solid #F4C0D1' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: '#D4537E' }} />
                    Aujourd'hui
                  </span>
                )}
                <p className="text-[12px] font-bold text-slate-900 capitalize leading-snug">
                  {formatDateLong(rdv.date)}
                </p>
                {formatTime(rdv.date) && (
                  <p className="text-[11px] mt-0.5" style={{ color: '#7F77DD' }}>{formatTime(rdv.date)}</p>
                )}
              </div>

              {/* Badge statut violet */}
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: '#EEEDFE', color: '#534AB7', border: '0.5px solid #CECBF6' }}>
                {rdv.statut === 'EN_ATTENTE' ? 'Planifié' : rdv.statut?.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Motif */}
            <div className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: '0.5px solid #f1f5f9' }}>
              <Stethoscope size={13} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] text-slate-400 mb-0.5">Motif</p>
                <p className="text-[12px] font-bold text-slate-800">{rdv.motif || 'Consultation de suivi'}</p>
              </div>
            </div>

            {/* Lieu */}
            {rdv.lieu && (
              <div className="flex items-center gap-3 px-4 py-3">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-400 mb-0.5">Lieu</p>
                  <p className="text-[12px] font-bold text-slate-800">{rdv.lieu}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   EXAMENS — IDENTIQUE À L'ORIGINAL
───────────────────────────────────────────── */
function ExamenRow({ exam, index, isExpanded, onToggle, onConsulter }) {
  const cfg = EXAM_CONFIG[exam.typeExamen] || EXAM_CONFIG.MANUEL;
  const { Icon } = cfg;
  const hasImage = exam.typeExamen !== 'MANUEL';
  const [imgError, setImgError] = useState(false);
  const detailRef = useRef(null);
  const [detailHeight, setDetailHeight] = useState(0);

  useEffect(() => {
    if (detailRef.current) setDetailHeight(isExpanded ? detailRef.current.scrollHeight : 0);
  }, [isExpanded]);

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300"
      style={{ boxShadow: isExpanded ? `0 0 0 1.5px ${cfg.color}44` : undefined }}>
      <button onClick={onToggle}
        className="w-full flex items-center gap-0 text-left bg-white hover:bg-slate-50/70 transition-colors duration-200"
        aria-expanded={isExpanded}>
        <div className="w-1 self-stretch flex-shrink-0 transition-all duration-300"
          style={{ background: isExpanded ? cfg.color : `${cfg.color}55` }} />
        <div className="flex items-center gap-3 flex-1 px-5 py-4 min-w-0">
          <span className="text-[10px] font-black shrink-0 w-5 text-right" style={{ color: cfg.color }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
            style={{ background: isExpanded ? cfg.color : cfg.bg }}>
            <Icon size={14} style={{ color: isExpanded ? 'white' : cfg.color }} strokeWidth={2} />
          </div>
          <div className="shrink-0 w-28">
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{cfg.label}</p>
          </div>
          <div className="w-px h-6 bg-slate-100 shrink-0" />
          <p className="text-[12px] text-slate-500 flex-1 truncate">{exam.resultatResume || 'En attente de résultat'}</p>
          <div className="hidden lg:flex flex-col items-end shrink-0 gap-0.5">
            {exam.siteAnatomique && <span className="text-[9px] text-slate-400 uppercase tracking-widest">{exam.siteAnatomique}</span>}
            <span className="text-[10px] font-bold text-slate-400">{formatDate(exam.date)}</span>
          </div>
          <ChevronDown size={15} className="shrink-0 text-slate-400 ml-2"
            style={{ transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </div>
      </button>

      <div style={{ maxHeight: detailHeight, overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease', opacity: isExpanded ? 1 : 0 }}>
        <div ref={detailRef}>
          <div className="flex gap-6 px-6 py-5 border-t border-slate-100" style={{ background: `${cfg.color}06` }}>
            {hasImage && (
              <div className="shrink-0 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center bg-white" style={{ width: 160, height: 110 }}>
                {exam.imageUrl && !imgError ? (
                  <img src={exam.imageUrl} alt={`Image ${cfg.label}`} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageOff size={20} className="text-slate-300" />
                    <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Non disponible</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-[12px] font-bold text-slate-700">{formatDate(exam.date)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Site anatomique</p>
                  <p className="text-[12px] font-bold text-slate-700">{exam.siteAnatomique || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Résultat</p>
                  <p className="text-[12px] text-slate-600 leading-relaxed">{exam.resultatResume || 'En attente de résultat'}</p>
                </div>
              </div>
              <button onClick={() => onConsulter(exam)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-200"
                style={{ borderColor: `${cfg.color}55`, color: cfg.color, background: `${cfg.color}10` }}
                onMouseEnter={e => { e.currentTarget.style.background = `${cfg.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${cfg.color}10`; }}>
                <ExternalLink size={12} />
                Consulter le rapport complet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamensSection({ examens, onConsulterExamen }) {
  const [activeFilter, setActiveFilter] = useState('TOUS');
  const [expandedId, setExpandedId]     = useState(null);
  const sorted = [...examens].sort((a, b) => EXAM_ORDER.indexOf(a.typeExamen) - EXAM_ORDER.indexOf(b.typeExamen));
  const filtered = activeFilter === 'TOUS' ? sorted : sorted.filter(e => e.typeExamen === activeFilter);
  const presentTypes = ['TOUS', ...EXAM_ORDER.filter(t => examens.some(e => e.typeExamen === t))];

  return (
    <section className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Microscope size={18} strokeWidth={1.5} className="text-slate-500" />
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-900">Examens &amp; Imagerie Médicale</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Séquençage chronologique • Protocoles hospitaliers</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400">{examens.length} examen{examens.length > 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center gap-2 px-8 py-4 border-b border-slate-50 flex-wrap">
        {presentTypes.map(type => {
          const cfg = EXAM_CONFIG[type];
          const count = type === 'TOUS' ? examens.length : examens.filter(e => e.typeExamen === type).length;
          const active = activeFilter === type;
          return (
            <button key={type} onClick={() => { setActiveFilter(type); setExpandedId(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-200 border"
              style={{ background: active ? (cfg?.color || '#888780') : 'transparent', borderColor: active ? (cfg?.color || '#888780') : '#e2e8f0', color: active ? 'white' : '#94a3b8' }}>
              {type !== 'TOUS' && <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? 'white' : cfg?.color }} />}
              {type === 'TOUS' ? 'Tous' : cfg?.label}
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black"
                style={{ background: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: active ? 'white' : '#64748b' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
      <div className="px-6 py-5 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 text-slate-300">
            <Microscope size={28} strokeWidth={1} />
            <p className="text-[11px] font-bold uppercase tracking-widest">Aucun examen enregistré</p>
          </div>
        ) : filtered.map((exam, i) => (
          <ExamenRow key={exam.id} exam={exam} index={i}
            isExpanded={expandedId === exam.id}
            onToggle={() => setExpandedId(prev => prev === exam.id ? null : exam.id)}
            onConsulter={onConsulterExamen} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TIMELINE — IDENTIQUE À L'ORIGINAL
───────────────────────────────────────────── */
function GanttTimeline({ plans }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const obs = new ResizeObserver(entries => { if (entries[0]) setContainerWidth(entries[0].contentRect.width); });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  if (!plans || plans.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-12 flex flex-col items-center gap-3">
        <Calendar size={32} className="text-slate-200" />
        <p className="text-[11px] text-slate-400 italic uppercase tracking-widest">Aucun plan de traitement renseigné</p>
      </div>
    );
  }

  const PAD = 24;
  const innerW = Math.max(0, containerWidth - PAD * 2);
  const colW   = innerW > 0 ? innerW / plans.length : 0;

  const monthGroups = [];
  plans.forEach(plan => {
    const d = new Date(plan.dateConsultation);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const lbl = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase();
    const last = monthGroups[monthGroups.length - 1];
    if (last && last.key === key) last.count++;
    else monthGroups.push({ key, label: lbl, count: 1 });
  });

  const completed = plans.filter(p => p.statut === 'fait').length;
  const pct       = plans.length > 0 ? Math.round((completed / plans.length) * 100) : 0;
  const lastPlan  = plans[plans.length - 1];
  const isTermine = plans.length > 0 && plans.every(p => p.statut === 'fait');
  const nextStep  = plans.find(p => p.statut !== 'fait' && p.prochaineEtape);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-violet-100 rounded-xl"><Calendar size={18} className="text-violet-500" /></div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Parcours de Traitement</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Séquencement du protocole actif</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 rounded-full p-1 border border-slate-100">
            <span className="text-[10px] font-black text-violet-600 bg-violet-100 px-3 py-1 rounded-full">
              {plans.length} étape{plans.length > 1 ? 's' : ''}
            </span>
          </div>
          {nextStep && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
              <Clock size={10} className="text-amber-400" />
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Suivant : {nextStep.prochaineEtape}</span>
            </div>
          )}
        </div>
      </div>

      <div ref={containerRef} style={{ padding: `0 ${PAD}px` }}>
        {colW === 0 ? <div style={{ height: 120 }} /> : (
          <>
            <div className="flex border-b border-slate-50 pt-5 pb-3">
              {monthGroups.map(m => (
                <div key={m.key} style={{ width: m.count * colW, flexShrink: 0 }} className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{m.label}</span>
                </div>
              ))}
            </div>

            <div style={{ position: 'relative', height: 90, marginTop: 8 }}>
              <div style={{ position: 'absolute', top: 32, left: colW / 2, width: (plans.length - 1) * colW, height: 2, background: '#e2e8f0', zIndex: 0 }} />
              {completed > 1 && (
                <div style={{ position: 'absolute', top: 32, left: colW / 2, width: (completed - 1) * colW, height: 2, background: 'linear-gradient(to right, #ec4899, #a855f7)', zIndex: 0, transition: 'width 0.6s ease' }} />
              )}
              {plans.map((plan, i) => {
                const isFait = plan.statut === 'fait';
                const color  = TIMELINE_COLORS[i % TIMELINE_COLORS.length];
                const cx     = i * colW + colW / 2;
                const IS     = Math.max(34, Math.min(44, colW * 0.38));
                return (
                  <div key={plan.id} style={{ position: 'absolute', left: cx - IS / 2, top: 0, width: IS, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                    <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isFait ? <CheckCircle2 size={14} strokeWidth={3} color="#10b981" /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #cbd5e1' }} />}
                    </div>
                    <div style={{ width: IS, height: IS, borderRadius: '50%', background: isFait ? `radial-gradient(circle at 35% 35%, ${color}dd, ${color})` : '#f1f5f9', border: isFait ? 'none' : '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isFait ? `0 4px 12px ${color}44` : 'none', transition: 'all 0.3s ease' }}>
                      {isFait ? <CheckCircle2 size={Math.round(IS * 0.38)} color="white" strokeWidth={2.5} /> : <Clock size={Math.round(IS * 0.38)} color="#94a3b8" strokeWidth={1.5} />}
                    </div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textAlign: 'center', whiteSpace: 'nowrap', marginTop: 2 }}>{formatDate(plan.dateConsultation)}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex border-b border-slate-50 pb-3">
              {plans.map((plan, i) => (
                <div key={plan.id} style={{ width: colW, flexShrink: 0 }} className="text-center px-1">
                  <p style={{ fontSize: 9, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {plan.etape || `Étape ${i + 1}`}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: 16, paddingBottom: 20 }}>
              {plans.map((plan, i) => {
                const isFait  = plan.statut === 'fait';
                const color   = TIMELINE_COLORS[i % TIMELINE_COLORS.length];
                const BAR_PAD = Math.max(6, colW * 0.06);
                const barLeft = i * colW + BAR_PAD;
                const barW    = colW - BAR_PAD * 2;
                return (
                  <div key={plan.id} style={{ position: 'relative', height: 36, marginBottom: 8 }}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: i * colW, width: colW, background: color, opacity: 0.06, borderRadius: 999 }} />
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: barLeft, width: Math.max(barW, 40), borderRadius: 999, background: isFait ? `linear-gradient(90deg, ${color}, ${color}cc)` : '#f1f5f9', border: isFait ? 'none' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 10, gap: 6, overflow: 'hidden' }}>
                      {isFait ? <CheckCircle2 size={12} color="white" strokeWidth={3} style={{ flexShrink: 0 }} /> : <Clock size={12} color="#94a3b8" style={{ flexShrink: 0 }} />}
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, color: isFait ? 'white' : '#64748b' }}>{plan.etape || `Étape ${i + 1}`}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, flexShrink: 0, color: isFait ? 'rgba(255,255,255,0.72)' : '#94a3b8' }}>{formatDate(plan.dateConsultation)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between px-8 py-5 bg-slate-50/50 border-t border-slate-100">
        <div className="flex items-center gap-5 flex-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">PROGRESSION</span>
          <div className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
            {completed} / {plans.length} étapes |{' '}
            <span className="text-violet-500 font-black">{isTermine ? 'TERMINÉ' : 'EN COURS'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-center">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[200px]">
            <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">{pct}%</span>
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">Dernière étape : {lastPlan ? formatDate(lastPlan.dateConsultation) : '—'}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────────── */
function VueEnsemblePage() {
  const { id: patientId } = useParams();
  const navigate          = useNavigate();
  const { data, loading, error, refetch } = useVueEnsemble(patientId);

  const handleConsulterExamen = useCallback((exam) => {
    const routes = {
      MANUEL:       `/medecin/dossier/${patientId}/consultation`,
      MAMMOGRAPHIE: `/medecin/dossier/${patientId}/mammographie`,
      ECHOGRAPHIE:  `/medecin/dossier/${patientId}/echographie`,
      IRM:          `/medecin/dossier/${patientId}/irm`,
      BIOPSIE:      `/medecin/dossier/${patientId}/biopsie`,
    };
    const route = routes[exam.typeExamen];
    if (route) navigate(route);
  }, [patientId, navigate]);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;
  if (!data)   return null;

  return (
    <div className="p-8 space-y-8 min-h-full font-sans" style={{ backgroundColor: '#fafbfc' }}>
      <PatientHeader patient={data.patient} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4"><AntecedentsMedicaux antecedents={data.antecedentsMedicaux || []} /></div>
        <div className="lg:col-span-4"><AntecedentsFamiliaux antecedents={data.antecedentsFamiliaux || []} /></div>
        <div className="lg:col-span-4"><ProchainRendezVous rdv={data.prochainRendezVous} /></div>
        <div className="lg:col-span-12"><ExamensSection examens={data.examens || []} onConsulterExamen={handleConsulterExamen} /></div>
        <div className="lg:col-span-12"><GanttTimeline plans={data.plansTraitement || []} /></div>
      </div>
    </div>
  );
}

export default VueEnsemblePage;