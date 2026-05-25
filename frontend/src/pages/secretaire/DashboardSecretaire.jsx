import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Clock, UserPlus, Activity,
  ArrowRight, ShieldAlert, ChevronRight, Stethoscope,
  BarChart3, TrendingUp, ArrowUpRight, Bell, Settings
} from 'lucide-react';
import secretaireDashboardService from '../../services/secretaireDashboardService';

const SPRING = { ease: [0.22, 1, 0.36, 1], duration: 0.6 };

/* ── Counter ── */
function Counter({ to, duration = 1.5, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const raf = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      setVal(Math.round((1 - Math.pow(1 - p, 4)) * to));
      if (p < 1) requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString('fr-FR')}{suffix}</span>;
}

/* ── Sparkline ── */
function Sparkline({ data, color, delay = 0 }) {
  const W = 80, H = 36;
  const arr = Array.isArray(data) && data.length > 1 ? data : [0, 1];
  const min = Math.min(...arr), max = Math.max(...arr);
  const pts = arr.map((v, i) => ({
    x: (i / (arr.length - 1)) * W,
    y: H - ((v - min) / (max - min || 1)) * (H - 6) - 3,
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <motion.path d={d} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, delay, ease: 'easeInOut' }}
      />
    </svg>
  );
}

/* ── PulseDot ── */
function PulseDot({ color = '#7c3aed', size = 8 }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <motion.span className="absolute inset-0 rounded-full" style={{ backgroundColor: color }}
        animate={{ scale: [1, 2.8], opacity: [0.6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
      />
      <span className="relative rounded-full" style={{ width: size, height: size, backgroundColor: color }} />
    </span>
  );
}

/* ── CircleProgress ── */
function CircleProgress({ value, color, size = 72, stroke = 6, delay = 0 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const safe = Math.min(Math.max(Number(value) || 0, 0), 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - safe / 100) }}
        transition={{ duration: 1.5, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

/* ── LiveClock ── */
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n) => n.toString().padStart(2, '0');
  return (
    <span className="font-mono text-[10px] font-black text-slate-400 tabular-nums tracking-widest">
      {pad(t.getHours())}
      <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>:</motion.span>
      {pad(t.getMinutes())}
      <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>:</motion.span>
      {pad(t.getSeconds())}
    </span>
  );
}

/* ── StatCard ── */
const CARD_CFG = {
  violet:  { icon: '#7c3aed', spark: '#a78bfa', blob: 'rgba(139,92,246,0.08)', sub: 'text-slate-400'    },
  rose:    { icon: '#e11d48', spark: '#fb7185', blob: 'rgba(244,63,94,0.08)',   sub: 'text-rose-400'    },
  amber:   { icon: '#d97706', spark: '#fbbf24', blob: 'rgba(251,191,36,0.08)',  sub: 'text-amber-500'   },
  emerald: { icon: '#059669', spark: '#34d399', blob: 'rgba(52,211,153,0.08)',  sub: 'text-emerald-500' },
};

function StatCard({ title, value, sub, icon: Icon, theme, bars, idx }) {
  const c = CARD_CFG[theme] || CARD_CFG.violet;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, ...SPRING }}
      whileHover={{ y: -5, transition: { duration: 0.22 } }}
      className="relative bg-white rounded-2xl border border-slate-100 p-5 overflow-hidden cursor-default"
    >
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full"
        style={{ background: c.blob, transform: 'translate(30%, -30%)' }} />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${c.icon}14` }}>
          <Icon size={17} style={{ color: c.icon }} />
        </div>
        <Sparkline data={bars} color={c.spark} delay={0.3 + idx * 0.1} />
      </div>
      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1 relative z-10">{title}</p>
      <p className="text-[1.85rem] font-black text-slate-900 leading-none tabular-nums relative z-10"
        style={{ letterSpacing: '-0.04em' }}>
        <Counter to={Number(value) || 0} duration={1.2 + idx * 0.1} />
      </p>
      <p className={`text-[9px] font-semibold mt-1.5 relative z-10 ${c.sub}`}>{sub}</p>
    </motion.div>
  );
}

/* ── Statut RDV ── */
const STATUT_LABEL = {
  PLANIFIE:   { label: 'Planifié',   dot: '#10b981', pill: 'bg-emerald-50 text-emerald-700' },
  EN_ATTENTE: { label: 'En attente', dot: '#f59e0b', pill: 'bg-amber-50 text-amber-700'     },
  EFFECTUE:   { label: 'Effectué',   dot: '#7c3aed', pill: 'bg-violet-50 text-violet-700'   },
  ANNULE:     { label: 'Annulé',     dot: '#e11d48', pill: 'bg-rose-50 text-rose-700'       },
};

/* ── AptRow ── */
function AptRow({ heure, patient, medecin, motif, lieu, statut, idx }) {
  const s = STATUT_LABEL[statut] || STATUT_LABEL.EN_ATTENTE;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 + idx * 0.07, ...SPRING }}
      whileHover={{ x: 5 }}
      className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all duration-150"
    >
      <div className="w-11 shrink-0 flex flex-col items-center gap-1.5">
        <p className="text-[11px] font-black text-slate-800 tabular-nums tracking-tight">{heure}</p>
        <PulseDot color={s.dot} size={6} />
      </div>
      <div className="w-px h-9 bg-slate-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">{patient}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{medecin}</span>
          {motif && <>
            <span className="w-0.5 h-0.5 rounded-full bg-slate-300 shrink-0" />
            <span className="text-[8px] font-bold text-violet-500 uppercase tracking-widest truncate">{motif}</span>
          </>}
          {lieu && <>
            <span className="w-0.5 h-0.5 rounded-full bg-slate-300 shrink-0" />
            <span className="text-[8px] font-bold text-slate-400 truncate">{lieu}</span>
          </>}
        </div>
      </div>
      <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest ${s.pill}`}>
        {s.label}
      </span>
      <ChevronRight size={12} className="text-slate-200 group-hover:text-violet-400 group-hover:translate-x-1 transition-all shrink-0" />
    </motion.div>
  );
}

/* ── DoctorCard ── */
const DOC_STATUS_CFG = {
  'En Consultation': { dot: '#10b981', tx: 'text-emerald-600' },
  'En Pause':        { dot: '#f59e0b', tx: 'text-amber-600'   },
  'Disponible':      { dot: '#7c3aed', tx: 'text-violet-600'  },
  'Absent':          { dot: '#94a3b8', tx: 'text-slate-400'   },
};
const AVA_GRADS = [
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-slate-400 to-slate-500',
];

function DoctorCard({ nom, prenom, initiales, statut, nbRdvAujourdhui, nbPatients, idx }) {
  const ds = DOC_STATUS_CFG[statut] || DOC_STATUS_CFG['Disponible'];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.38 + idx * 0.08, ...SPRING }}
      whileHover={{ y: -2 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 transition-all duration-150"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-black shrink-0 bg-gradient-to-br ${AVA_GRADS[idx % 4]}`}>
        {initiales}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">
          Dr. {prenom} {nom}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <PulseDot color={ds.dot} size={5} />
          <span className={`text-[7px] font-black uppercase tracking-widest ${ds.tx}`}>{statut}</span>
        </div>
      </div>
      {/* Colonne RDV aujourd'hui */}
      <div className="text-right shrink-0 border-r border-slate-200 pr-3 mr-1">
        <p className="text-[13px] font-black text-slate-900 tabular-nums">{nbRdvAujourdhui}</p>
        <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">rdv/jour</p>
      </div>
      {/* Colonne patients total */}
      <div className="text-right shrink-0">
        <p className="text-[13px] font-black text-violet-600 tabular-nums">{nbPatients ?? '—'}</p>
        <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">patients</p>
      </div>
    </motion.div>
  );
}

/* ── PerfRing ── */
function PerfRing({ value, label, sublabel, color, icon: Icon, delay }) {
  const safe = Math.min(Math.max(Number(value) || 0, 0), 100);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, ...SPRING }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative">
        <CircleProgress value={safe} color={color} size={72} stroke={6} delay={delay} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <Icon size={13} style={{ color }} />
          <span className="text-[11px] font-black text-slate-900 tabular-nums leading-none">
            <Counter to={safe} suffix="%" duration={1.4} />
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[7px] font-black text-slate-700 uppercase tracking-[0.2em] leading-tight">{label}</p>
        {sublabel && <p className="text-[6.5px] font-medium text-slate-400 mt-0.5 leading-tight">{sublabel}</p>}
      </div>
    </motion.div>
  );
}

/* ── ActivityChart ── */
const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function ActivityChart({ rdvParMois, patientsParMois }) {
  const [active, setActive] = useState('rdv');

  const tabs = [
    {
      key: 'rdv', label: 'RDV', icon: Calendar, color: '#7c3aed',
      data: Array.isArray(rdvParMois) && rdvParMois.length === 12
        ? rdvParMois : Array(12).fill(0),
    },
    {
      key: 'patients', label: 'Patients', icon: Users, color: '#e11d48',
      data: Array.isArray(patientsParMois) && patientsParMois.length === 12
        ? patientsParMois : Array(12).fill(0),
    },
  ];

  const tab = tabs.find(t => t.key === active) || tabs[0];
  const W = 500, H = 130;
  const min = Math.min(...tab.data), max = Math.max(...tab.data);
  const pts = tab.data.map((v, i) => ({
    x: (i / (tab.data.length - 1)) * W,
    y: H - ((v - min) / (max - min || 1)) * (H - 20) - 10,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${H} L 0 ${H} Z`;
  const total = tab.data.reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {tabs.map(({ key, label, icon: Icon, color }) => (
          <button key={key} onClick={() => setActive(key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${
              active === key ? 'text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
            style={active === key ? { backgroundColor: color } : {}}>
            <Icon size={11} />{label}
          </button>
        ))}
      </div>

      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[1.8rem] font-black text-slate-900 tabular-nums" style={{ letterSpacing: '-0.04em' }}>
          <Counter to={total} duration={0.8} />
        </span>
        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600">
          Cette année — spécialité
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 130, overflow: 'visible' }}>
        <defs>
          <linearGradient id={`ag-${active}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tab.color} stopOpacity="0.14" />
            <stop offset="100%" stopColor={tab.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path key={`area-${active}`} d={areaD} fill={`url(#ag-${active})`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} />
        <motion.path key={`line-${active}`} d={pathD} fill="none" stroke={tab.color}
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.3, ease: 'easeInOut' }} />
        {pts.map((p, i) => (
          <motion.circle key={`dot-${active}-${i}`} cx={p.x} cy={p.y} r="3.5"
            fill="white" stroke={tab.color} strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: (i / tab.data.length) * 1, duration: 0.22 }} />
        ))}
      </svg>
      <div className="flex mt-2">
        {MONTHS.map((l, i) => (
          <span key={i} className="text-[7px] font-bold text-slate-300 uppercase tracking-wide text-center flex-1">{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════ */
export default function SecretaireDashboard() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    secretaireDashboardService.getDashboard()
      .then(res => setData(res))
      .catch(err => { console.error(err); setError('Impossible de charger le tableau de bord'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Activity size={28} className="text-violet-500" />
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <ShieldAlert size={32} className="text-red-400" />
        <p className="text-red-500 font-medium text-sm">{error || 'Erreur inconnue'}</p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold">
          Réessayer
        </button>
      </div>
    );
  }

  /* ── Stats cards ── */
  const stats = [
    {
      title: 'Total Patients',
      value: Number(data.totalPatients) || 0,
      sub:   'Dossiers enregistrés',
      icon:  Users,
      theme: 'violet',
      bars:  Array.isArray(data.patientsParMois) ? data.patientsParMois.slice(-8) : [40,45,50,55,52,60,58,65],
    },
    {
      title: "RDV Aujourd'hui",
      value: Number(data.rdvAujourdhui) || 0,
      sub:   `${data.rdvDuJour?.length || 0} au planning`,
      icon:  Calendar,
      theme: 'rose',
      bars:  Array.isArray(data.rdvParMois) ? data.rdvParMois.slice(-8) : [8,10,12,9,14,11,15,12],
    },
    {
      title: 'Demandes à planifier',
      value: Number(data.rdvEnAttente) || 0,
      sub:   'En attente de date',
      icon:  Clock,
      theme: 'amber',
      bars:  [3,5,4,6,5,7,4,Number(data.rdvEnAttente) || 0],
    },
    {
      title: 'RDV cette semaine',
      value: Number(data.rdvPlanifiesSemaine) || 0,
      sub:   'Planifiés — spécialité',
      icon:  BarChart3,
      theme: 'emerald',
      bars:  [2,4,3,5,4,6,5,Number(data.rdvPlanifiesSemaine) || 0],
    },
  ];

  /* ── Performance rings ── */
  const perfRings = [
    {
      value:    Number(data.tauxRdvConfirmes) || 0,
      label:    'RDV confirmés',
      sublabel: `${Number(data.tauxRdvConfirmes) || 0}% planifiés`,
      color:    '#7c3aed', icon: Calendar, delay: 0.45,
    },
    {
      value:    Number(data.tauxPatientsTraites) || 0,
      label:    'Patients traités',
      sublabel: `${Number(data.tauxPatientsTraites) || 0}% effectués`,
      color:    '#e11d48', icon: Users, delay: 0.58,
    },
    {
      value:    Number(data.tauxMedecinsActifs) || 0,
      label:    'Médecins actifs',
      sublabel: `${data.medecins?.length || 0} praticiens`,
      color:    '#059669', icon: Stethoscope, delay: 0.71,
    },
    {
      value:    Number(data.tauxNotifsTraitees) || 0,
      label:    'Taux traitement',
      sublabel: 'Demandes gérées',
      color:    '#d97706', icon: Bell, delay: 0.84,
    },
  ];

  /* ── Actions rapides avec navigation ── */
  const quickActions = [
    {
      label: 'Planning & RDV',
      icon:  Calendar,
      bg:    'bg-violet-50 hover:bg-violet-100',
      tx:    'text-violet-600',
      border:'border-violet-100',
      to:    '/secretaire/planning',
    },
    {
      label: 'Patients',
      icon:  Users,
      bg:    'bg-rose-50 hover:bg-rose-100',
      tx:    'text-rose-500',
      border:'border-rose-100',
      to:    '/secretaire/patients',
    },
    {
      label: 'Médecins',
      icon:  Stethoscope,
      bg:    'bg-emerald-50 hover:bg-emerald-100',
      tx:    'text-emerald-600',
      border:'border-emerald-100',
      to:    '/secretaire/medecins',
    },
    {
      label: 'Paramètres',
      icon:  Settings,
      bg:    'bg-amber-50 hover:bg-amber-100',
      tx:    'text-amber-600',
      border:'border-amber-100',
      to:    '/secretaire/settings',
    },
  ];

  return (
    <div className="space-y-5 pb-10">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <PulseDot color="#10b981" size={8} />
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.5em]">Système Actif</span>
            <LiveClock />
          </div>
          <h1 className="text-[2rem] font-black text-slate-900 leading-none" style={{ letterSpacing: '-0.04em' }}>
            Tableau de{' '}
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Bord
            </span>
          </h1>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.45em] mt-1.5">
            OncoAssist · Secrétariat · {today}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/secretaire/planning')}
          className="h-11 px-7 rounded-xl flex items-center gap-3 text-white text-[9px] font-black uppercase tracking-[0.3em] relative overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', boxShadow: '0 8px 24px rgba(124,58,237,0.22)' }}>
          <motion.div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg,#db2777,#7c3aed)' }}
            initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.35 }} />
          <Calendar size={15} className="relative z-10" />
          <span className="relative z-10 italic">Voir le Planning</span>
          <ArrowUpRight size={13} className="relative z-10 opacity-70" />
        </motion.button>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} idx={i} />)}
      </div>

      {/* ── Main grid ── */}
      <div className="space-y-5">

        {/* Ligne 1 : Flux + Praticiens */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Flux journalier */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...SPRING }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-full">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Activity size={15} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">Flux Journalier</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {data.rdvDuJour?.length || 0} rendez-vous aujourd'hui — spécialité
                    </p>
                  </div>
                </div>
                <motion.button whileHover={{ x: 3 }}
                  onClick={() => navigate('/secretaire/planning')}
                  className="flex items-center gap-1.5 text-[8px] font-black text-violet-500 hover:text-violet-700 uppercase tracking-widest transition-colors italic">
                  Tout voir <ArrowRight size={10} />
                </motion.button>
              </div>
              <div className="py-2">
                {(!data.rdvDuJour || data.rdvDuJour.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 opacity-40">
                    <Calendar size={28} strokeWidth={1.2} className="text-slate-300" />
                    <p className="text-[10px] font-bold text-slate-400">Aucun RDV aujourd'hui</p>
                  </div>
                )}
                {data.rdvDuJour?.slice(0, 6).map((a, i) => (
                  <AptRow key={a.id || i} {...a} idx={i} />
                ))}
                {data.rdvDuJour?.length > 6 && (
                  <div className="px-5 py-2">
                    <button onClick={() => navigate('/secretaire/planning')}
                      className="text-[8px] font-black text-violet-500 hover:text-violet-700 uppercase tracking-widest italic">
                      + {data.rdvDuJour.length - 6} autres RDV →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Praticiens */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, ...SPRING }}
              className="bg-white rounded-2xl border border-slate-100 p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Stethoscope size={15} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">Praticiens</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {data.medecins?.length || 0} médecins — votre spécialité
                    </p>
                  </div>
                </div>
                <motion.button whileHover={{ x: 2 }}
                  onClick={() => navigate('/secretaire/medecins')}
                  className="flex items-center gap-1 text-[7px] font-black text-slate-400 hover:text-violet-500 uppercase tracking-widest transition-colors">
                  Voir tout <ChevronRight size={9} />
                </motion.button>
              </div>

              {/* En-tête colonnes */}
              <div className="flex items-center gap-3 px-3 mb-2">
                <div className="flex-1" />
                <span className="text-[6px] font-black text-slate-300 uppercase tracking-widest w-16 text-right">RDV/jour</span>
                <span className="text-[6px] font-black text-slate-300 uppercase tracking-widest w-14 text-right">Patients</span>
              </div>

              <div className="space-y-2">
                {(!data.medecins || data.medecins.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-40">
                    <Stethoscope size={24} strokeWidth={1.2} className="text-slate-300" />
                    <p className="text-[10px] font-bold text-slate-400">Aucun médecin trouvé</p>
                  </div>
                )}
                {data.medecins?.map((d, i) => (
                  <DoctorCard key={d.id} {...d} idx={i} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Ligne 2 : Activité + Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">

          {/* Activité annuelle */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ...SPRING }}
            className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-6 h-full flex flex-col">
            <div className="mb-1">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">Activité Annuelle</p>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Vue mensuelle — {new Date().getFullYear()} — données de votre spécialité
              </p>
            </div>
            <div className="flex-1">
              <ActivityChart
                rdvParMois={data.rdvParMois}
                patientsParMois={data.patientsParMois}
              />
            </div>
          </motion.div>

          {/* Performance */}
          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42, ...SPRING }}
            className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">Performance</p>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Indicateurs — spécialité
                </p>
              </div>
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4 py-1 flex-1 content-center">
              {perfRings.map((r, i) => <PerfRing key={i} {...r} />)}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Actions rapides ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, ...SPRING }}
        className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-4">Actions Rapides</p>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, bg, tx, border, to }, i) => (
            <motion.button key={i}
              whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.06, ...SPRING }}
              onClick={() => navigate(to)}
              className={`flex flex-col items-center justify-center gap-2.5 py-5 rounded-xl border transition-all duration-150 ${bg} ${border}`}>
              <Icon size={22} className={tx} />
              <span className={`text-[8px] font-black uppercase tracking-widest text-center leading-tight ${tx}`}>{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

    </div>
  );
}