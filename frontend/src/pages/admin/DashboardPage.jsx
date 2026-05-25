import { useState, useEffect, useCallback } from "react";
import { Header } from "../../Shared";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Stethoscope, Users, FolderOpen,
  TrendingUp, ArrowRight, FileText, Activity,
  RefreshCw, AlertCircle, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { getDashboardOverview } from "../../services/adminDashboardService";

const NAVY = "#002855";
const RED  = "#E31E24";

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = (v) => v?.toLocaleString("fr-FR") ?? "—";

// Construit les 4 cartes STATS à partir du DTO backend
function buildStats(s) {
  if (!s) return [];
  return [
    {
      id: 1, label: "RDV du jour", value: fmt(s.rdvDuJour), change: s.rdvChange ?? "—",
      icon: Calendar, accent: NAVY, accentBg: "rgba(0,40,85,0.07)",
      spark: s.rdvSpark ?? [],
      chartType: "area",
      chartTitle: "Rendez-vous (7 derniers jours)",
      chartLabels: (s.rdvSpark ?? []).map((_, i) => `J-${6 - i}`),
      chartData:   s.rdvSpark ?? [],
      breakdown: [
        { label: "Effectués",  value: fmt(s.rdvEffectues) },
        { label: "En attente", value: fmt(s.rdvEnAttente) },
        { label: "Annulés",    value: fmt(s.rdvAnnules) },
      ],
      trend: { label: "Taux de complétion", pct: s.rdvTauxCompletion ?? 0 },
      rightStats: [
        { label: "Cette semaine", value: fmt(s.rdvSemaine) },
        { label: "Ce mois",       value: fmt(s.rdvMois) },
        { label: "Annulés mois",  value: fmt(s.rdvAnnulesMois) },
      ],
    },
    {
      id: 2, label: "Médecins actifs", value: fmt(s.medecinsActifs), change: s.medecinsChange ?? "—",
      icon: Stethoscope, accent: RED, accentBg: "rgba(227,30,36,0.07)",
      spark: s.medecinsSpark ?? [],
      chartType: "radar",
      chartTitle: "Médecins par spécialité",
      chartLabels: Object.keys(s.medecinsBySpecialite ?? {}),
      chartData:   Object.values(s.medecinsBySpecialite ?? {}),
      breakdown: [
        { label: "Généralistes",  value: fmt(s.medecinsGeneralistes) },
        { label: "Spécialistes",  value: fmt(s.medecinsSpecialistes) },
        { label: "Remplaçants",   value: fmt(s.medecinsRemplacants) },
      ],
      trend: { label: "Disponibilité moyenne", pct: s.medecinsDisponibilite ?? 0 },
      rightStats: [
        { label: "Consultations/j moy.", value: String(s.consultationsParJour ?? 0) },
        { label: "Nouveaux ce mois",     value: fmt(s.medecinsNouveaux) },
        { label: "Indisponibles",        value: fmt(s.medecinsIndisponibles) },
      ],
    },
    {
      id: 3, label: "Patients total", value: fmt(s.patientsTotal), change: s.patientsChange ?? "—",
      icon: Users, accent: NAVY, accentBg: "rgba(0,40,85,0.07)",
      spark: s.patientsSpark ?? [],
      chartType: "line",
      chartTitle: "Nouveaux patients par semaine",
      chartLabels: (s.patientsNouveauxParSemaine ?? []).map((_, i) => `S${i + 1}`),
      chartData:   s.patientsNouveauxParSemaine ?? [],
      breakdown: [
        { label: "Actifs",          value: fmt(s.patientsActifs) },
        { label: "Archivés",        value: fmt(s.patientsArchives) },
        { label: "Nouveaux/mois",   value: fmt(s.patientsNouveauxMois) },
      ],
      trend: { label: "Taux de rétention", pct: s.patientsTauxRetention ?? 0 },
      rightStats: [
        { label: "Adultes",          value: fmt(s.patientsAdultes) },
        { label: "Enfants (< 18)",   value: fmt(s.patientsEnfants) },
        { label: "Seniors (> 65)",   value: fmt(s.patientsSeniors) },
      ],
    },
    {
      id: 4, label: "Dossiers médicaux", value: fmt(s.dossiersActifs), change: s.dossiersChange ?? "—",
      icon: FolderOpen, accent: RED, accentBg: "rgba(227,30,36,0.07)",
      spark: s.dossiersSpark ?? [],
      chartType: "donut",
      chartTitle: "Dossiers par état",
      chartLabels: ["En cours", "Archivés", "Créés ce mois"],
      chartData:   [s.dossiersEnCours ?? 0, s.dossiersArchives ?? 0, s.dossiersCreésMois ?? 0],
      breakdown: [
        { label: "En cours",       value: fmt(s.dossiersEnCours) },
        { label: "Archivés",       value: fmt(s.dossiersArchives) },
        { label: "Créés ce mois",  value: fmt(s.dossiersCreésMois) },
      ],
      trend: { label: "Dossiers complets", pct: s.dossiersCompletion ?? 0 },
      rightStats: [
        { label: "Ce mois",     value: fmt(s.dossiersCeMois) },
        { label: "Trimestre",   value: fmt(s.dossiersTrimestre) },
        { label: "Avec examen", value: fmt(s.dossiersAvecExamen) },
      ],
    },
  ];
}

// ── SPARK ─────────────────────────────────────────────────────────────────────
const Spark = ({ data, color }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={(data ?? []).map((v) => ({ v }))}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// ── GRAPHIQUE LIÉ ─────────────────────────────────────────────────────────────
function LinkedChart({ stat }) {
  const color = stat.accent;
  const cd = (stat.chartData ?? []).map((v, i) => ({
    label: stat.chartLabels?.[i] ?? `${i}`,
    value: v,
  }));

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
      <AreaChart data={cd} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id={`g${stat.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} dy={6} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
        <Tooltip content={<TT />} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#g${stat.id})`} dot={false} animationDuration={400} />
      </AreaChart>
    </ResponsiveContainer>
  );

  if (stat.chartType === "line") return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={cd} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} dy={6} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
        // eslint-disable-next-line react-hooks/static-components
        <Tooltip content={<TT />} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
          dot={{ r: 4, fill: color, strokeWidth: 0 }} activeDot={{ r: 6 }} animationDuration={400} />
      </LineChart>
    </ResponsiveContainer>
  );

  if (stat.chartType === "radar") {
    const radarData = (stat.chartLabels ?? []).map((label, i) => ({
      label,
      value: stat.chartData?.[i] ?? 0,
    }));
    return (
      <ResponsiveContainer width="100%" height={160}>
        <RadarChart data={radarData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
          <PolarGrid stroke="rgba(0,0,0,0.08)" />
          <PolarAngleAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
          <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.18} strokeWidth={2} animationDuration={400} />
        </RadarChart>
      </ResponsiveContainer>
    );
  }

  if (stat.chartType === "donut") {
    const total = (stat.chartData ?? []).reduce((a, b) => a + b, 0);
    const alphas = ["ff", "99", "66"];
    const pd = (stat.chartData ?? []).map((v, i) => ({
      name: stat.chartLabels?.[i] ?? `${i}`,
      value: v,
    }));
    return (
      <div className="flex items-center justify-center gap-8 h-[160px]">
        <div className="relative w-[130px] h-[130px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pd} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                paddingAngle={3} dataKey="value" stroke="none" animationDuration={400}>
                {pd.map((_, i) => <Cell key={i} fill={`${color}${alphas[i] ?? "44"}`} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-black" style={{ color }}>{fmt(total)}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">total</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {pd.map((d, i) => (
            <div key={d.name} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: `${color}${alphas[i] ?? "44"}` }} />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 w-20">{d.name}</span>
              <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                  style={{ width: total > 0 ? `${Math.round((d.value / total) * 100)}%` : "0%", background: `${color}${alphas[i] ?? "44"}` }} />
              </div>
              <span className="text-[11px] font-black" style={{ color }}>{fmt(d.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

// ── LINKED STATS ──────────────────────────────────────────────────────────────
function LinkedStats({ stats }) {
  const [active, setActive] = useState(stats[0]);

  // Sync si les stats changent (refresh)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (stats.length > 0) setActive(stats[0]); }, [stats]);

  if (!active) return null;

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800">
        {stats.map((s, idx) => {
          const isActive = s.id === active.id;
          const Icon = s.icon;
          return (
            <motion.button key={s.id} onClick={() => setActive(s)}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
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
                  style={{ background: "rgba(5,150,105,0.09)", color: "#059669" }}>
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

      <AnimatePresence mode="wait">
        <motion.div key={active.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-5"
        >
          {/* GAUCHE */}
          <div className="lg:col-span-1 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{active.label}</p>
              <p className="text-4xl font-black tracking-tight" style={{ color: active.accent }}>{active.value}</p>
              <p className="text-xs font-bold text-emerald-500 mt-1">{active.change} ce mois</p>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              {active.breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{b.label}</span>
                  <span className="text-xs font-black" style={{ color: active.accent }}>{b.value}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{active.trend.label}</span>
                <span className="text-[10px] font-black" style={{ color: active.accent }}>{active.trend.pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div key={active.id + "-t"}
                  initial={{ width: 0 }} animate={{ width: `${active.trend.pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full" style={{ background: active.accent }} />
              </div>
            </div>
          </div>

          {/* CENTRE */}
          <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{active.chartTitle}</p>
            <LinkedChart stat={active} />
          </div>

          {/* DROITE */}
          <div className="lg:col-span-1 p-6 flex flex-col justify-center gap-5">
            {active.rightStats.map((rs) => (
              <div key={rs.label} className="text-center px-2 py-3 rounded-xl"
                style={{ background: active.accent === NAVY ? "rgba(0,40,85,0.05)" : "rgba(227,30,36,0.05)" }}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{rs.label}</p>
                <p className="text-xl font-black" style={{ color: active.accent }}>{rs.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── RDV MENSUEL ───────────────────────────────────────────────────────────────
function RdvChart({ data }) {
  if (!data?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 h-[300px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">RDV Effectués vs En attente</h3>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Analyse mensuelle</p>
        </div>
        <div className="flex items-center gap-4">
          {[{ label: "Effectués", color: NAVY }, { label: "En attente", color: RED }].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="rdvEff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={NAVY} stopOpacity={0.15} />
              <stop offset="100%" stopColor={NAVY} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rdvAtt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={RED} stopOpacity={0.15} />
              <stop offset="100%" stopColor={RED} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} dy={6} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">
                <p className="font-black text-slate-400 uppercase tracking-wider mb-1">{payload[0].payload.mois}</p>
                {payload.map((p, i) => (
                  <div key={i} className="flex justify-between gap-5">
                    <span className="text-slate-500">{p.dataKey === "effectues" ? "Effectués" : "En attente"}</span>
                    <span className="font-black" style={{ color: p.dataKey === "effectues" ? NAVY : RED }}>{p.value}</span>
                  </div>
                ))}
              </div>
            );
          }} />
          <Area type="monotone" dataKey="effectues" stroke={NAVY} strokeWidth={2} fill="url(#rdvEff)" dot={false} />
          <Area type="monotone" dataKey="attente"   stroke={RED}  strokeWidth={2} fill="url(#rdvAtt)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── PATIENTS PAR MÉDECIN ──────────────────────────────────────────────────────
function PatientsMedecin({ data }) {
  if (!data?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 h-[300px]">
      <div className="mb-5">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Patients par Médecin</h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Répartition du suivi</p>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
          <YAxis type="category" dataKey="medecin" axisLine={false} tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }} width={90} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
                <p className="font-black" style={{ color: NAVY }}>{payload[0].value} patients</p>
              </div>
            );
          }} />
          <Bar dataKey="patients" radius={[0, 4, 4, 0]} barSize={18} animationDuration={500}>
            {data.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? NAVY : RED} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── SPÉCIALITÉS ───────────────────────────────────────────────────────────────
function SpecialitiesBlock({ data }) {
  if (!data?.length) return null;
  const colors = [NAVY, RED, "rgba(0,40,85,0.45)", "rgba(227,30,36,0.45)", "#475569", "#0ea5e9"];
  const total  = data.reduce((a, c) => a + c.value, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Spécialités</h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
          Médecins par service
        </p>
      </div>
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={56} outerRadius={84}
                paddingAngle={3} dataKey="value" stroke="none" animationDuration={500}>
                {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} fillOpacity={0.9} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black" style={{ color: NAVY }}>{total}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">total</span>
          </div>
        </div>
        <div className="w-full space-y-3">
          {data.map((item, i) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            const col = colors[i % colors.length];
            return (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col }} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-28 shrink-0 truncate">{item.name}</span>
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full" style={{ background: col }} />
                </div>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 w-8 text-right shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── TABLE MÉDECINS ────────────────────────────────────────────────────────────
function DoctorsTable({ medecins, secretaires }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Performance Médecins</h3>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">RDV, patients suivis & progression</p>
        </div>
        <button
  onClick={() => navigate("/admin/doctors")}
  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider group"
  style={{ color: NAVY }}
>
  Rapport complet
  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
</button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/50">
              {["Médecin", "Spécialité", "Patients", "RDV / Mois", "Progression"].map((h, i) => (
                <th key={h} className={["px-5 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest", i >= 3 ? "text-right" : ""].join(" ")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {(medecins ?? []).map((doc, idx) => (
              <motion.tr key={doc.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.prenom}${doc.nom}`}
                      className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800" alt={doc.nom} />
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">Dr. {doc.prenom} {doc.nom}</p>
                      <p className="text-[10px] text-slate-400 font-medium">#{doc.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wider"
                    style={{ background: "rgba(0,40,85,0.07)", color: NAVY }}>
                    {doc.specialite}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} style={{ color: NAVY }} />
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{fmt(doc.patients)}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300">{fmt(doc.rdvMois)}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(doc.growth, 100)}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.06, ease: "easeOut" }}
                        className="h-full rounded-full" style={{ background: NAVY }} />
                    </div>
                    <span className="text-xs font-black text-emerald-500 w-10 text-right">+{doc.growth}%</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Secrétaires */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4">
       <div className="flex items-start justify-between mb-3">
  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
    Secrétaires — RDV gérés ce mois
  </p>

  <button
    onClick={() => navigate("/admin/secretaries")}
    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider group"
    style={{ color: NAVY }}
  >
    Rapport complet
    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
  </button>
</div>
        <div className="grid grid-cols-3 gap-3">
          {(secretaires ?? []).map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.prenom}${s.nom}`}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800" alt={s.nom} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{s.prenom} {s.nom}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold" style={{ color: NAVY }}>{fmt(s.rdvGeres)} RDV</span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-emerald-500">{s.tauxCompletion}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DOSSIERS CHART ────────────────────────────────────────────────────────────
function DossiersChart({ data, kpis }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Dossiers Médicaux</h3>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Actifs vs archivés</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Dossiers actifs", value: fmt(kpis?.dossiersActifs),   icon: FolderOpen, color: NAVY    },
          { label: "Archivés",        value: fmt(kpis?.dossiersArchives),  icon: FileText,   color: "#64748b" },
          { label: "Créés ce mois",   value: `+${fmt(kpis?.dossiersCreésMois)}`, icon: Activity, color: "#059669" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl p-3 text-center"
            style={{ background: k.color === NAVY ? "rgba(0,40,85,0.05)" : "rgba(0,0,0,0.03)" }}>
            <k.icon size={16} className="mx-auto mb-1" style={{ color: k.color }} />
            <p className="text-lg font-black" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{k.label}</p>
          </div>
        ))}
      </div>
      {data?.length > 0 && (
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="dosActif" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={NAVY} stopOpacity={0.18} />
                <stop offset="100%" stopColor={NAVY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} dy={4} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
                  <p className="font-black text-slate-400 uppercase tracking-wider mb-1">{payload[0].payload.mois}</p>
                  <p className="font-black" style={{ color: NAVY }}>Actifs : {payload[0].value}</p>
                </div>
              );
            }} />
            <Area type="monotone" dataKey="actifs" stroke={NAVY} strokeWidth={2} fill="url(#dosActif)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-[320px] w-full rounded-2xl" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Skeleton className="xl:col-span-8 h-[300px]" />
        <Skeleton className="xl:col-span-4 h-[300px]" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4 space-y-5">
          <Skeleton className="h-[360px]" />
          <Skeleton className="h-[280px]" />
        </div>
        <Skeleton className="xl:col-span-8 h-[640px]" />
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardOverview();
      setOverview(data);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Impossible de charger le tableau de bord.");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const stats = overview ? buildStats(overview.stats) : [];

  return (
    <div className="pb-10">
      <Header title="Tableau de Bord" breadcrumb="Aperçu" />

      <div className="px-8 py-6 space-y-5">

        {/* Barre d'état + refresh */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            {loading ? "Chargement…" : error ? "" : `Mis à jour à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
          </p>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-100 bg-red-50 dark:bg-red-950/30 dark:border-red-900">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            <button onClick={load} className="ml-auto text-xs font-black text-red-500 hover:underline">Réessayer</button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <DashboardSkeleton />}

        {/* Contenu */}
        {!loading && !error && overview && (
          <>
            <LinkedStats stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              <div className="xl:col-span-8">
                <RdvChart data={overview.rdvMensuel} />
              </div>
              <div className="xl:col-span-4">
                <PatientsMedecin data={overview.patientsByMedecin} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              <div className="xl:col-span-4 flex flex-col gap-5">
                <SpecialitiesBlock data={overview.specialites} />
                <DossiersChart
                  data={overview.dossiersMensuel}
                  kpis={overview.stats}
                />
              </div>
              <div className="xl:col-span-8">
                <DoctorsTable
                  medecins={overview.topMedecins}
                  secretaires={overview.secretaires}
                />
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && !overview && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={32} className="text-slate-300 animate-spin" />
            <p className="text-sm text-slate-400">Aucune donnée disponible.</p>
          </div>
        )}

      </div>
    </div>
  );
}