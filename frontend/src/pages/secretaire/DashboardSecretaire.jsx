import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Users, Calendar, Clock, UserPlus, Activity,
  ArrowRight, ShieldAlert, ChevronRight, Stethoscope,
  BarChart3, TrendingUp, TrendingDown, ArrowUpRight, Bell
} from 'lucide-react';

const SPRING = { ease: [0.22, 1, 0.36, 1], duration: 0.6 };

// ─── Counter ──────────────────────────────────────────────────────
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

// ─── Sparkline ────────────────────────────────────────────────────
function Sparkline({ data, color, delay = 0 }) {
  const W = 80, H = 36;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / (max - min || 1)) * (H - 6) - 3,
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <motion.path
        d={d} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, delay, ease: 'easeInOut' }}
      />
    </svg>
  );
}

// ─── Pulse dot ────────────────────────────────────────────────────
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

// ─── Circle progress ─────────────────────────────────────────────
function CircleProgress({ value, color, size = 72, stroke = 6, delay = 0 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - value / 100) }}
        transition={{ duration: 1.5, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

// ─── Live clock ───────────────────────────────────────────────────
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
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

// ─── Stat Card — comme image 1 ───────────────────────────────────
const CARD_CFG = {
  violet:  { icon: '#7c3aed', spark: '#a78bfa', blob: 'rgba(139,92,246,0.08)', sub: 'text-slate-400' },
  rose:    { icon: '#e11d48', spark: '#fb7185', blob: 'rgba(244,63,94,0.08)',   sub: 'text-rose-400'  },
  amber:   { icon: '#d97706', spark: '#fbbf24', blob: 'rgba(251,191,36,0.08)',  sub: 'text-amber-500' },
  emerald: { icon: '#059669', spark: '#34d399', blob: 'rgba(52,211,153,0.08)',  sub: 'text-emerald-500' },
};

function StatCard({ title, value, sub, icon: Icon, theme, bars, idx }) {
  const c = CARD_CFG[theme] || CARD_CFG.violet;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, ...SPRING }}
      whileHover={{ y: -5, transition: { duration: 0.22 } }}
      className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 overflow-hidden cursor-default"
    >
      {/* blob coin haut droit */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full"
        style={{ background: c.blob, transform: 'translate(30%, -30%)' }}
      />

      {/* icône + sparkline sur la même ligne */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${c.icon}14` }}>
          <Icon size={17} style={{ color: c.icon }} />
        </div>
        <Sparkline data={bars} color={c.spark} delay={0.3 + idx * 0.1} />
      </div>

      {/* label */}
      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-1 relative z-10">{title}</p>

      {/* valeur */}
      <p className="text-[1.85rem] font-black text-slate-900 dark:text-white leading-none tabular-nums relative z-10" style={{ letterSpacing: '-0.04em' }}>
        <Counter to={value} duration={1.2 + idx * 0.1} />
      </p>

      {/* sub */}
      <p className={`text-[9px] font-semibold mt-1.5 relative z-10 ${c.sub}`}>{sub}</p>
    </motion.div>
  );
}

// ─── Appointment row ──────────────────────────────────────────────
const STATUS_CFG = {
  'Confirmé': { dot: '#10b981', pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  'Attente':  { dot: '#f59e0b', pill: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  'Annulé':   { dot: '#e11d48', pill: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
};

function AptRow({ time, patient, doctor, type, status, idx }) {
  const s = STATUS_CFG[status] || STATUS_CFG['Attente'];
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 + idx * 0.07, ...SPRING }}
      whileHover={{ x: 5 }}
      className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-150 cursor-pointer"
    >
      <div className="w-11 shrink-0 flex flex-col items-center gap-1.5">
        <p className="text-[11px] font-black text-slate-800 dark:text-white tabular-nums tracking-tight">{time}</p>
        <PulseDot color={s.dot} size={6} />
      </div>
      <div className="w-px h-9 bg-slate-100 dark:bg-slate-800 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{patient}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{doctor}</span>
          <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
          <span className="text-[8px] font-bold text-violet-500 uppercase tracking-widest truncate">{type}</span>
        </div>
      </div>
      <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest ${s.pill}`}>{status}</span>
      <ChevronRight size={12} className="text-slate-200 dark:text-slate-700 group-hover:text-violet-400 group-hover:translate-x-1 transition-all shrink-0" />
    </motion.div>
  );
}

// ─── Doctor card ──────────────────────────────────────────────────
const DOC_STATUS_CFG = {
  'En Consultation': { dot: '#10b981', tx: 'text-emerald-600' },
  'En Pause':        { dot: '#f59e0b', tx: 'text-amber-600' },
  'Disponible':      { dot: '#7c3aed', tx: 'text-violet-600' },
  'Absent':          { dot: '#94a3b8', tx: 'text-slate-400' },
};
const AVA_GRADS = [
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-slate-400 to-slate-500',
];

function DoctorCard({ name, initials, status, appointments, idx }) {
  const ds = DOC_STATUS_CFG[status] || DOC_STATUS_CFG['Disponible'];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.38 + idx * 0.08, ...SPRING }}
      whileHover={{ y: -2 }}
      className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-150 cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-black shrink-0 bg-gradient-to-br ${AVA_GRADS[idx % 4]}`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <PulseDot color={ds.dot} size={5} />
          <span className={`text-[7px] font-black uppercase tracking-widest ${ds.tx}`}>{status}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[15px] font-black text-slate-900 dark:text-white tabular-nums">{appointments}</p>
        <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">rdv</p>
      </div>
    </motion.div>
  );
}

// ─── Performance ring ─────────────────────────────────────────────
function PerfRing({ value, label, sublabel, color, icon: Icon, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, ...SPRING }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative">
        <CircleProgress value={value} color={color} size={72} stroke={6} delay={delay} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <Icon size={13} style={{ color }} />
          <span className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums leading-none">
            <Counter to={value} suffix="%" duration={1.4} />
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[7px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] leading-tight">{label}</p>
        {sublabel && <p className="text-[6.5px] font-medium text-slate-400 mt-0.5 leading-tight">{sublabel}</p>}
      </div>
    </motion.div>
  );
}

// ─── Activity chart avec onglets ──────────────────────────────────
const CHART_TABS = [
  { key: 'rdv',      label: 'RDV',      icon: Calendar,    color: '#7c3aed', data: [12,19,15,24,18,28,22,31,24,20,27,24], total: 264, trend: '+18%', trendUp: true  },
  { key: 'patients', label: 'Patients', icon: Users,       color: '#e11d48', data: [40,55,48,62,58,70,65,74,68,72,80,77], total: 769, trend: '+12%', trendUp: true  },
  { key: 'medecins', label: 'Médecins', icon: Stethoscope, color: '#059669', data: [3,3,4,4,4,5,4,5,5,5,6,6],            total: 54,  trend: '+2',   trendUp: true  },
  { key: 'notifs',   label: 'Alertes',  icon: Bell,        color: '#d97706', data: [8,5,12,6,9,14,7,11,8,10,6,9],        total: 105, trend: '−8%',  trendUp: false },
];
const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function ActivityChart() {
  const [active, setActive] = useState('rdv');
  const tab = CHART_TABS.find(t => t.key === active);
  const W = 500, H = 130;
  const min = Math.min(...tab.data), max = Math.max(...tab.data);
  const pts = tab.data.map((v, i) => ({
    x: (i / (tab.data.length - 1)) * W,
    y: H - ((v - min) / (max - min || 1)) * (H - 20) - 10,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${H} L 0 ${H} Z`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {CHART_TABS.map(({ key, label, icon: Icon, color }) => (
          <button key={key} onClick={() => setActive(key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${
              active === key ? 'text-white shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
            }`}
            style={active === key ? { backgroundColor: color } : {}}
          >
            <Icon size={11} />{label}
          </button>
        ))}
      </div>

      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[1.8rem] font-black text-slate-900 dark:text-white tabular-nums" style={{ letterSpacing: '-0.04em' }}>
          <Counter to={tab.total} duration={0.8} />
        </span>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
          tab.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {tab.trend} vs an dernier
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
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        />
        <motion.path key={`line-${active}`} d={pathD} fill="none" stroke={tab.color}
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.3, ease: 'easeInOut' }}
        />
        {pts.map((p, i) => (
          <motion.circle key={`dot-${active}-${i}`} cx={p.x} cy={p.y} r="3.5"
            fill="white" stroke={tab.color} strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: (i / tab.data.length) * 1, duration: 0.22 }}
          />
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

// ─── MAIN ─────────────────────────────────────────────────────────
export default function SecretaireDashboard() {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const stats = [
    { title: 'Registry Total',    value: 1284, sub: '+47 ce mois',    icon: Users,       theme: 'violet',  bars: [55,62,58,70,65,78,72,85,80,92,88,100] },
    { title: "RDV Aujourd'hui",   value: 24,   sub: '3 en cours',     icon: Calendar,    theme: 'rose',    bars: [8,12,10,15,14,18,16,20,19,22,21,24]  },
    { title: 'En Attente',        value: 5,    sub: 'Délai moyen 12 min', icon: Clock,   theme: 'amber',   bars: [4,6,5,7,6,8,7,6,5,6,5,5]             },
    { title: 'Cas Critiques',     value: 2,    sub: 'Priorité haute', icon: ShieldAlert, theme: 'emerald', bars: [0,1,0,1,2,1,0,2,1,1,2,2]             },
  ];

  const appointments = [
    { time: '09:00', patient: 'Sophie Dupont',  doctor: 'Dr. El Harrab', type: 'Consultation',  status: 'Confirmé' },
    { time: '10:30', patient: 'Jean Martin',    doctor: 'Dr. Benali',    type: 'Échographie',   status: 'Attente'  },
    { time: '11:15', patient: 'Marie Curie',    doctor: 'Dr. El Harrab', type: 'Biopsie',       status: 'Confirmé' },
    { time: '14:00', patient: 'Ahmed Salah',    doctor: 'Dr. Benali',    type: 'IRM Thorax',    status: 'Attente'  },
    { time: '15:30', patient: 'Leila Bensouda', doctor: 'Dr. Ibrahim',   type: 'Suivi Post-Op', status: 'Confirmé' },
  ];

  const doctors = [
    { name: 'El Harrab', initials: 'EH', status: 'En Consultation', appointments: 8 },
    { name: 'Benali',    initials: 'MB', status: 'En Pause',        appointments: 6 },
    { name: 'Ibrahim',   initials: 'AI', status: 'Disponible',      appointments: 5 },
    { name: 'Cherkaoui', initials: 'SC', status: 'Absent',          appointments: 0 },
  ];

  const perfRings = [
    { value: 87, label: 'RDV confirmés',    sublabel: '87/100 planifiés',  color: '#7c3aed', icon: Calendar,    delay: 0.45 },
    { value: 91, label: 'Patients traités', sublabel: '47/52 dossiers',    color: '#e11d48', icon: Users,       delay: 0.58 },
    { value: 75, label: 'Médecins actifs',  sublabel: '3/4 disponibles',   color: '#059669', icon: Stethoscope, delay: 0.71 },
    { value: 83, label: 'Notifs traitées',  sublabel: '15/18 alertes',     color: '#d97706', icon: Bell,        delay: 0.84 },
  ];

  const quickActions = [
    { label: 'Admission',   icon: UserPlus,  bg: 'bg-violet-50 hover:bg-violet-100', tx: 'text-violet-600', border: 'border-violet-100' },
    { label: 'Nouveau RDV', icon: Calendar,  bg: 'bg-rose-50 hover:bg-rose-100',     tx: 'text-rose-500',   border: 'border-rose-100'   },
    { label: 'Dossier',     icon: Users,     bg: 'bg-emerald-50 hover:bg-emerald-100', tx: 'text-emerald-600', border: 'border-emerald-100' },
    { label: 'Rapport',     icon: BarChart3, bg: 'bg-amber-50 hover:bg-amber-100',   tx: 'text-amber-600',  border: 'border-amber-100'  },
  ];

  return (
    <div className="space-y-5 pb-10">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <PulseDot color="#10b981" size={8} />
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.5em]">Système Actif</span>
            <LiveClock />
          </div>
          <h1 className="text-[2rem] font-black text-slate-900 dark:text-white leading-none" style={{ letterSpacing: '-0.04em' }}>
            Tableau de{' '}
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Bord
            </span>
          </h1>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.45em] mt-1.5">
            OncoAssist · Secrétariat · {today}
          </p>
        </div>
        {/* bouton admission — même gradient que topbar avatar */}
        <motion.button
          whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
          className="h-11 px-7 rounded-xl flex items-center gap-3 text-white text-[9px] font-black uppercase tracking-[0.3em] relative overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', boxShadow: '0 8px 24px rgba(124,58,237,0.22)' }}
        >
          <motion.div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg,#db2777,#7c3aed)' }}
            initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.35 }}
          />
          <UserPlus size={15} className="relative z-10" />
          <span className="relative z-10 italic">Admission Patient</span>
          <ArrowUpRight size={13} className="relative z-10 opacity-70" />
        </motion.button>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} idx={i} />)}
      </div>

      {/* ── MAIN GRID ── */}
<div className="space-y-5">

  {/* Ligne 1 : Flux + Praticiens */}
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

    {/* Flux journalier */}
    <div className="lg:col-span-3">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ...SPRING }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden h-full"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Activity size={15} className="text-violet-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.25em]">
                Flux Journalier
              </p>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {appointments.length} rendez-vous programmés
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ x: 3 }}
            className="flex items-center gap-1.5 text-[8px] font-black text-violet-500 hover:text-violet-700 uppercase tracking-widest transition-colors italic"
          >
            Tout voir <ArrowRight size={10} />
          </motion.button>
        </div>

        <div className="py-2">
          {appointments.map((a, i) => (
            <AptRow key={i} {...a} idx={i} />
          ))}
        </div>
      </motion.div>
    </div>

    {/* Praticiens */}
    <div className="lg:col-span-2">
      <motion.div
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, ...SPRING }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 h-full"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <Stethoscope size={15} className="text-slate-500" />
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.25em]">
                Praticiens
              </p>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Status temps réel
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ x: 2 }}
            className="flex items-center gap-1 text-[7px] font-black text-slate-400 hover:text-violet-500 uppercase tracking-widest transition-colors"
          >
            Voir tout <ChevronRight size={9} />
          </motion.button>
        </div>

        <div className="space-y-2">
          {doctors.map((d, i) => (
            <DoctorCard key={i} {...d} idx={i} />
          ))}
        </div>
      </motion.div>
    </div>
  </div>

  {/* Ligne 2 : Activité + Performance */}
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">

    {/* Activité annuelle */}
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, ...SPRING }}
      className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 h-full flex flex-col"
    >
      <div className="mb-1">
        <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.25em]">
          Activité Annuelle
        </p>
        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          Vue mensuelle — 2025
        </p>
      </div>

      <div className="flex-1">
        <ActivityChart />
      </div>
    </motion.div>

    {/* Performance */}
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.42, ...SPRING }}
      className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.25em]">
            Performance
          </p>
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Mes 4 indicateurs clés
          </p>
        </div>

        <TrendingUp size={14} className="text-emerald-500" />
      </div>

      <div className="grid grid-cols-2 gap-4 py-1 flex-1 content-center">
        {perfRings.map((r, i) => (
          <PerfRing key={i} {...r} />
        ))}
      </div>
    </motion.div>

  </div>

</div>
      {/* ── ACTIONS RAPIDES — ligne complète sous tout ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, ...SPRING }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5"
      >
        <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] mb-4">Actions Rapides</p>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, bg, tx, border }, i) => (
            <motion.button key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.06, ...SPRING }}
              className={`flex flex-col items-center justify-center gap-2.5 py-5 rounded-xl border transition-all duration-150 ${bg} ${border}`}
            >
              <Icon size={22} className={tx} />
              <span className={`text-[8px] font-black uppercase tracking-widest text-center leading-tight ${tx}`}>{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

    </div>
  );
}