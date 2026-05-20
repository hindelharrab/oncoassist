import { useState } from "react";
import { Header } from "../../Shared";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Stethoscope, Users, Star,
  TrendingUp, ArrowRight, UserCog, FolderOpen,
  Clock, CheckCircle, FileText, Activity,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

const NAVY = "#002855";
const RED  = "#E31E24";

// ── STATS LIÉES ──────────────────────────────────────────────────────────────
const STATS = [
  {
    id: 1, label: "RDV du jour", value: "48", change: "+12%",
    icon: Calendar, accent: NAVY, accentBg: "rgba(0,40,85,0.07)",
    spark: [30,45,35,50,48,60,48], chartType: "area",
    chartTitle: "Rendez-vous par semaine",
    chartLabels: ["S1","S2","S3","S4","S5","S6","S7"],
    chartData:   [30,  45,  35,  50,  48,  60,  48],
    breakdown: [{ label:"Effectués", value:"34" },{ label:"En attente", value:"9" },{ label:"Annulés", value:"5" }],
    trend: { label:"Taux de complétion", pct:92 },
    rightStats: [
      { label:"Cette semaine", value:"286" },
      { label:"Ce mois", value:"1 240" },
      { label:"Annulés mois", value:"48" },
    ],
  },
  {
    id: 2, label: "Médecins actifs", value: "14", change: "+2",
    icon: Stethoscope, accent: RED, accentBg: "rgba(227,30,36,0.07)",
    spark: [10,11,11,12,12,14,14], chartType: "radar",
    chartTitle: "Médecins par spécialité",
    chartLabels: ["Cardio","Pédia","Dermato","Ophtalmo","Généra","Neuro"],
    chartData:   [3,2,2,1,4,2],
    breakdown: [{ label:"Généralistes", value:"5" },{ label:"Spécialistes", value:"7" },{ label:"Remplaçants", value:"2" }],
    trend: { label:"Disponibilité moyenne", pct:85 },
    rightStats: [
      { label:"Consultations/j moy.", value:"18" },
      { label:"Nouveaux ce mois", value:"2" },
      { label:"Indisponibles", value:"1" },
    ],
  },
  {
    id: 3, label: "Patients total", value: "1 847", change: "+8%",
    icon: Users, accent: NAVY, accentBg: "rgba(0,40,85,0.07)",
    spark: [100,120,110,140,130,150,156], chartType: "line",
    chartTitle: "Nouveaux patients par semaine",
    chartLabels: ["S1","S2","S3","S4","S5","S6","S7"],
    chartData:   [22, 31,  18,  40,  28,  35,  38],
    breakdown: [{ label:"Actifs", value:"1 691" },{ label:"Archivés", value:"156" },{ label:"Nouveaux/mois", value:"156" }],
    trend: { label:"Taux de rétention", pct:91 },
    rightStats: [
      { label:"Adultes", value:"1 102" },
      { label:"Enfants (< 18)", value:"489" },
      { label:"Seniors (> 65)", value:"256" },
    ],
  },
  {
    id: 4, label: "Satisfaction", value: "98%", change: "+2.4%",
    icon: Star, accent: RED, accentBg: "rgba(227,30,36,0.07)",
    spark: [90,92,91,95,94,96,98], chartType: "donut",
    chartTitle: "Satisfaction par critère",
    chartLabels: ["Soins","Accueil","Délais","Suivi"],
    chartData:   [99,97,95,96],
    breakdown: [{ label:"Soins", value:"99%" },{ label:"Accueil", value:"97%" },{ label:"Délais", value:"95%" }],
    trend: { label:"Objectif atteint", pct:98 },
    rightStats: [
      { label:"Avis collectés", value:"824" },
      { label:"Note moyenne", value:"4.8 / 5" },
      { label:"Réclamations", value:"3" },
    ],
  },
];

// ── DONNÉES MÉTIER ───────────────────────────────────────────────────────────
const RDV_MENSUEL = [
  { name:"Jan", effectues:320, attente:80 },
  { name:"Fév", effectues:280, attente:60 },
  { name:"Mar", effectues:540, attente:90 },
  { name:"Avr", effectues:700, attente:100 },
  { name:"Mai", effectues:460, attente:70 },
  { name:"Jun", effectues:630, attente:85 },
];

const DOSSIERS = [
  { name:"Jan", actifs:820, archives:30 },
  { name:"Fév", actifs:850, archives:35 },
  { name:"Mar", actifs:900, archives:40 },
  { name:"Avr", actifs:980, archives:50 },
  { name:"Mai", actifs:1050, archives:60 },
  { name:"Jun", actifs:1120, archives:72 },
];

const SPEC_PIE = [
  { name:"Cardiologie",   value:400, color:NAVY },
  { name:"Pédiatrie",     value:300, color:RED  },
  { name:"Dermatologie",  value:300, color:"rgba(0,40,85,0.45)"   },
  { name:"Ophtalmologie", value:200, color:"rgba(227,30,36,0.45)" },
];

const TOP_DOCTORS = [
  { id:1, name:"Marc Durand",    speciality:"Cardiologie",   rdv:124, patients:98,  rating:4.8, growth:80 },
  { id:2, name:"Sophie Martin",  speciality:"Pédiatrie",      rdv:98,  patients:76,  rating:4.9, growth:65 },
  { id:3, name:"Jean Dupont",    speciality:"Dermatologie",   rdv:85,  patients:64,  rating:4.7, growth:50 },
  { id:4, name:"Luc Leroy",      speciality:"Généraliste",    rdv:72,  patients:110, rating:4.6, growth:40 },
  { id:5, name:"Claire Lemoine", speciality:"Ophtalmologie",  rdv:68,  patients:55,  rating:4.5, growth:35 },
  { id:5, name:"Hind El Harrab", speciality:"Oncologue",  rdv:68,  patients:55,  rating:4.5, growth:60 },
];

const SECRETAIRES = [
  { id:1, name:"Amina Berrada",  rdvGeres:210, satisfaction:97, status:"active" },
  { id:2, name:"Fatima Zahra",   rdvGeres:185, satisfaction:95, status:"active" },
  { id:3, name:"Karim Mansouri", rdvGeres:162, satisfaction:93, status:"active" },
];

const PATIENTS_PAR_MED = [
  { medecin:"Dr. Leroy",   patients:110 },
  { medecin:"Dr. Durand",  patients:98  },
  { medecin:"Dr. Martin",  patients:76  },
  { medecin:"Dr. Dupont",  patients:64  },
  { medecin:"Dr. Lemoine", patients:55  },
];

// ── SPARK ────────────────────────────────────────────────────────────────────
const Spark = ({ data, color }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data.map((v) => ({ v }))}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// ── GRAPHIQUE LIÉ ─────────────────────────────────────────────────────────────
function LinkedChart({ stat }) {
  const color = stat.accent;
  const cd = stat.chartData.map((v, i) => ({ label: stat.chartLabels[i], value: v }));

  const TT = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 text-xs shadow-lg">
        <p className="font-black text-slate-400 uppercase tracking-wider mb-0.5">{payload[0].payload.label}</p>
        <p className="font-black" style={{ color }}>{payload[0].value}</p>
      </div>
    );
  };

  if (stat.chartType === "area") return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={cd} margin={{ top:4, right:8, left:-28, bottom:0 }}>
        <defs>
          <linearGradient id={`g${stat.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill:"#94a3b8", fontSize:10, fontWeight:700 }} dy={6} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill:"#94a3b8", fontSize:10, fontWeight:700 }} />
        <Tooltip content={<TT />} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#g${stat.id})`} dot={false} animationDuration={400} />
      </AreaChart>
    </ResponsiveContainer>
  );

  if (stat.chartType === "line") return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={cd} margin={{ top:4, right:8, left:-28, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill:"#94a3b8", fontSize:10, fontWeight:700 }} dy={6} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill:"#94a3b8", fontSize:10, fontWeight:700 }} />
        <Tooltip content={<TT />} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
          dot={{ r:4, fill:color, strokeWidth:0 }} activeDot={{ r:6 }} animationDuration={400} />
      </LineChart>
    </ResponsiveContainer>
  );

  if (stat.chartType === "radar") return (
    <ResponsiveContainer width="100%" height={160}>
      <RadarChart data={cd.map((d) => ({ label:d.label, value:d.value }))} margin={{ top:0, right:20, left:20, bottom:0 }}>
        <PolarGrid stroke="rgba(0,0,0,0.08)" />
        <PolarAngleAxis dataKey="label" tick={{ fill:"#94a3b8", fontSize:10, fontWeight:700 }} />
        <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.18} strokeWidth={2} animationDuration={400} />
      </RadarChart>
    </ResponsiveContainer>
  );

  if (stat.chartType === "donut") {
    const total = stat.chartData.reduce((a, b) => a + b, 0);
    const alphas = ["ff","99","66","44"];
    const pd = stat.chartData.map((v, i) => ({ name:stat.chartLabels[i], value:v }));
    return (
      <div className="flex items-center justify-center gap-8 h-[160px]">
        <div className="relative w-[130px] h-[130px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pd} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                paddingAngle={3} dataKey="value" stroke="none" animationDuration={400}>
                {pd.map((_, i) => <Cell key={i} fill={`${color}${alphas[i]}`} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-black" style={{ color }}>{Math.round(total / pd.length)}%</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">moy.</span>
          </div>
        </div>
        {/* Légendes + valeurs */}
        <div className="flex flex-col gap-3">
          {pd.map((d, i) => (
            <div key={d.name} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background:`${color}${alphas[i]}` }} />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 w-16">{d.name}</span>
              <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width:`${d.value}%`, background:`${color}${alphas[i]}` }} />
              </div>
              <span className="text-[11px] font-black" style={{ color }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

// ── BLOC STATS LIÉES ─────────────────────────────────────────────────────────
function LinkedStats() {
  const [active, setActive] = useState(STATS[0]);

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* 4 cartes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800">
        {STATS.map((s, idx) => {
          const isActive = s.id === active.id;
          const Icon = s.icon;
          return (
            <motion.button
              key={s.id}
              onClick={() => setActive(s)}
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: idx * 0.07 }}
              className={[
                "relative flex flex-col gap-1 p-5 text-left transition-colors duration-200 focus:outline-none w-full",
                isActive ? "bg-slate-50 dark:bg-slate-800/60" : "hover:bg-slate-50/60 dark:hover:bg-slate-800/30",
              ].join(" ")}
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300"
                style={{ background: isActive ? s.accent : "transparent" }} />
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: isActive ? s.accentBg : "rgba(0,0,0,0.04)" }}>
                  <Icon size={17} style={{ color: isActive ? s.accent : "#94a3b8" }} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background:"rgba(5,150,105,0.09)", color:"#059669" }}>
                  <TrendingUp size={9} />{s.change}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black tracking-tight transition-colors duration-200"
                style={{ color: isActive ? s.accent : undefined }}>{s.value}</p>
              <div className="h-6 mt-1">
                <Spark data={s.spark} color={isActive ? s.accent : "#cbd5e1"} />
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800" />

      {/* Panel lié — 3 colonnes : méta | graphique | stats droite */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity:0, y:8 }}
          animate={{ opacity:1, y:0 }}
          exit={{ opacity:0, y:-6 }}
          transition={{ duration:0.22, ease:[0.22,1,0.36,1] }}
          className="grid grid-cols-1 lg:grid-cols-5"
        >
          {/* GAUCHE : méta */}
          <div className="lg:col-span-1 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{active.label}</p>
              <p className="text-4xl font-black tracking-tight" style={{ color:active.accent }}>{active.value}</p>
              <p className="text-xs font-bold text-emerald-500 mt-1">{active.change} ce mois</p>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              {active.breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{b.label}</span>
                  <span className="text-xs font-black" style={{ color:active.accent }}>{b.value}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{active.trend.label}</span>
                <span className="text-[10px] font-black" style={{ color:active.accent }}>{active.trend.pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  key={active.id + "-t"}
                  initial={{ width:0 }}
                  animate={{ width:`${active.trend.pct}%` }}
                  transition={{ duration:0.6, ease:"easeOut" }}
                  className="h-full rounded-full"
                  style={{ background:active.accent }}
                />
              </div>
            </div>
          </div>

          {/* CENTRE : graphique */}
          <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{active.chartTitle}</p>
            <LinkedChart stat={active} />
          </div>

          {/* DROITE : stats supplémentaires */}
          <div className="lg:col-span-1 p-6 flex flex-col justify-center gap-5">
            {active.rightStats.map((rs) => (
              <div key={rs.label} className="text-center px-2 py-3 rounded-xl"
                style={{ background: active.accent === NAVY ? "rgba(0,40,85,0.05)" : "rgba(227,30,36,0.05)" }}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{rs.label}</p>
                <p className="text-xl font-black" style={{ color:active.accent }}>{rs.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── AREA CHART : RDV effectués vs en attente ──────────────────────────────────
function RdvChart() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 h-[300px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">RDV Effectués vs En attente</h3>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Analyse mensuelle 2024</p>
        </div>
        <div className="flex items-center gap-4">
          {[{ label:"Effectués", color:NAVY },{ label:"En attente", color:RED }].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background:l.color }} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={RDV_MENSUEL} margin={{ top:4, right:4, left:-20, bottom:0 }}>
          <defs>
            <linearGradient id="rdvEff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={NAVY} stopOpacity={0.15} />
              <stop offset="100%" stopColor={NAVY} stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="rdvAtt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={RED} stopOpacity={0.15} />
              <stop offset="100%" stopColor={RED} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill:"#94a3b8", fontSize:11, fontWeight:700 }} dy={6} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill:"#94a3b8", fontSize:11, fontWeight:700 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">
                  <p className="font-black text-slate-400 uppercase tracking-wider mb-1">{payload[0].payload.name}</p>
                  {payload.map((p, i) => (
                    <div key={i} className="flex justify-between gap-5">
                      <span className="text-slate-500">{p.dataKey === "effectues" ? "Effectués" : "En attente"}</span>
                      <span className="font-black" style={{ color: p.dataKey === "effectues" ? NAVY : RED }}>{p.value}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="effectues" stroke={NAVY} strokeWidth={2} fill="url(#rdvEff)" dot={false} />
          <Area type="monotone" dataKey="attente"   stroke={RED}  strokeWidth={2} fill="url(#rdvAtt)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── BAR CHART : patients par médecin ─────────────────────────────────────────
function PatientsMedecin() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 h-[300px]">
      <div className="mb-5">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Patients par Médecin</h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Répartition du suivi</p>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={PATIENTS_PAR_MED} layout="vertical" margin={{ top:0, right:16, left:8, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill:"#94a3b8", fontSize:10, fontWeight:700 }} />
          <YAxis type="category" dataKey="medecin" axisLine={false} tickLine={false} tick={{ fill:"#64748b", fontSize:11, fontWeight:700 }} width={80} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
                  <p className="font-black" style={{ color:NAVY }}>{payload[0].value} patients</p>
                </div>
              );
            }}
          />
          <Bar dataKey="patients" radius={[0,4,4,0]} barSize={18} animationDuration={500}>
            {PATIENTS_PAR_MED.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? NAVY : RED} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── DONUT spécialités + mini-stats ───────────────────────────────────────────
function SpecialitiesBlock() {
  const total = SPEC_PIE.reduce((a, c) => a + c.value, 0);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Spécialités</h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
          Volume de consultations par service
        </p>
      </div>

      {/* Donut centré + légendes propres */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={SPEC_PIE}
                cx="50%" cy="50%"
                innerRadius={56} outerRadius={84}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                animationDuration={500}
              >
                {SPEC_PIE.map((e, i) => (
                  <Cell key={i} fill={e.color} fillOpacity={0.9} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black" style={{ color: NAVY }}>{total}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">total</span>
          </div>
        </div>

        {/* Légendes : point + nom + barre + % */}
        <div className="w-full space-y-3">
          {SPEC_PIE.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-24 shrink-0">
                  {item.name}
                </span>
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                  />
                </div>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 w-8 text-right shrink-0">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── TABLE MÉDECINS ────────────────────────────────────────────────────────────
function DoctorsTable() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Performance Médecins</h3>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">RDV, patients suivis & satisfaction</p>
        </div>
        <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider group" style={{ color:NAVY }}>
          Rapport complet <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/50">
              {["Médecin","Spécialité","Patients","RDV / Mois","Note","Progression"].map((h, i) => (
                <th key={h} className={["px-5 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest", i >= 4 ? "text-right" : ""].join(" ")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {TOP_DOCTORS.map((doc, idx) => (
              <motion.tr
                key={doc.id}
                initial={{ opacity:0, x:-8 }}
                animate={{ opacity:1, x:0 }}
                transition={{ delay: idx * 0.06 }}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`}
                      className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800" alt={doc.name} />
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">Dr. {doc.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">#{doc.id.toString().padStart(4,"0")}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wider"
                    style={{ background:"rgba(0,40,85,0.07)", color:NAVY }}>
                    {doc.speciality}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} style={{ color:NAVY }} />
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{doc.patients}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300">{doc.rdv}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{doc.rating}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width:0 }}
                        animate={{ width:`${doc.growth}%` }}
                        transition={{ duration:0.6, delay: idx*0.06, ease:"easeOut" }}
                        className="h-full rounded-full"
                        style={{ background:NAVY }}
                      />
                    </div>
                    <span className="text-xs font-black text-emerald-500 w-10 text-right">+{doc.growth}%</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Secrétaires en bas de la table */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Secrétaires — RDV gérés ce mois</p>
        <div className="grid grid-cols-3 gap-3">
          {SECRETAIRES.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800" alt={s.name} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold" style={{ color:NAVY }}>{s.rdvGeres} RDV</span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-emerald-500">{s.satisfaction}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DOSSIERS MÉDICAUX ────────────────────────────────────────────────────────
function DossiersChart() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Dossiers Médicaux</h3>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Actifs vs archivés</p>
        </div>
      </div>
      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label:"Dossiers actifs",  value:"1 691", icon:FolderOpen,   color:NAVY },
          { label:"Archivés",         value:"156",   icon:FileText,     color:"#64748b" },
          { label:"Créés ce mois",    value:"+156",  icon:Activity,     color:"#059669" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl p-3 text-center"
            style={{ background: k.color === NAVY ? "rgba(0,40,85,0.05)" : k.color === RED ? "rgba(227,30,36,0.05)" : "rgba(0,0,0,0.03)" }}>
            <k.icon size={16} className="mx-auto mb-1" style={{ color:k.color }} />
            <p className="text-lg font-black" style={{ color:k.color }}>{k.value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{k.label}</p>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={DOSSIERS} margin={{ top:4, right:4, left:-28, bottom:0 }}>
          <defs>
            <linearGradient id="dosActif" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={NAVY} stopOpacity={0.18} />
              <stop offset="100%" stopColor={NAVY} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill:"#94a3b8", fontSize:10, fontWeight:700 }} dy={4} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill:"#94a3b8", fontSize:10, fontWeight:700 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
                  <p className="font-black text-slate-400 uppercase tracking-wider mb-1">{payload[0].payload.name}</p>
                  <p className="font-black" style={{ color:NAVY }}>Actifs : {payload[0].value}</p>
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="actifs" stroke={NAVY} strokeWidth={2} fill="url(#dosActif)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="pb-10">
      <Header title="Tableau de Bord" breadcrumb="Aperçu" />
      <div className="px-8 py-6 space-y-5">

        {/* Bloc cartes liées */}
        <LinkedStats />

        {/* RDV area + Patients par médecin */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8"><RdvChart /></div>
          <div className="xl:col-span-4"><PatientsMedecin /></div>
        </div>

        {/* Spécialités + Table médecins & secrétaires */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          <div className="xl:col-span-4 flex flex-col gap-5">
            <SpecialitiesBlock />
            <DossiersChart />
          </div>
          <div className="xl:col-span-8">
            <DoctorsTable />
          </div>
        </div>

      </div>
    </div>
  );
}