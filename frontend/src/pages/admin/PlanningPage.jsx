import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Clock, CheckCircle,
  AlertCircle, Zap, RefreshCw, Loader2, Users,
} from "lucide-react";
import { Header } from "../../Shared";
import { getPlanningJour, getPlanningSemaine, getPlanningMois } from "../../services/adminPlanningService";

const NAVY = "#002855";
const RED  = "#E31E24";

// ── HELPERS DATE ──────────────────────────────────────────────────────────────
const getMondayOf = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const fmt = (date, opts) =>
  new Intl.DateTimeFormat("fr-FR", opts).format(new Date(date));

const fmtRange = (monday) => {
  const sunday = addDays(monday, 6);
  return `${fmt(monday, { day: "numeric", month: "short" })} — ${fmt(sunday, { day: "numeric", month: "short", year: "numeric" })}`;
};

// ── STATUT CONFIG ─────────────────────────────────────────────────────────────
const statutConfig = {
  PLANIFIE:   { color: NAVY,     bg: "rgba(0,40,85,0.07)",     border: "rgba(0,40,85,0.2)",      icon: CheckCircle, label: "Confirmé"   },
  EN_ATTENTE: { color: "#d97706", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.3)",   icon: AlertCircle, label: "En attente" },
  ANNULE:     { color: "#94a3b8", bg: "rgba(148,163,184,0.07)",border: "rgba(148,163,184,0.3)",  icon: AlertCircle, label: "Annulé"     },
  EFFECTUE:   { color: "#059669", bg: "rgba(5,150,105,0.07)",  border: "rgba(5,150,105,0.3)",    icon: CheckCircle, label: "Effectué"   },
};
const getStatut = (s) => statutConfig[s] ?? statutConfig.EN_ATTENTE;

// ── VUE SEMAINE ───────────────────────────────────────────────────────────────
const HOURS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
const COL_W  = 150;
const ROW_H  = 68;
const LEFT_W = 60;

function SemaineGrid({ rdvs, monday }) {
  const days = Array.from({ length: 6 }, (_, i) => addDays(monday, i));
  const today = new Date(); today.setHours(0,0,0,0);

  const getSlot = (rdv) => {
    const d = new Date(rdv.date);
    const dayIdx = days.findIndex(day => {
      const dd = new Date(day); dd.setHours(0,0,0,0);
      const rd = new Date(d);   rd.setHours(0,0,0,0);
      return dd.getTime() === rd.getTime();
    });
    const hour = d.getHours();
    const hourIdx = HOURS.findIndex(h => parseInt(h) === hour);
    return { dayIdx, hourIdx };
  };

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: LEFT_W + COL_W * days.length }}>
        {/* Header */}
        <div className="grid border-b border-slate-100 dark:border-slate-800"
          style={{ gridTemplateColumns: `${LEFT_W}px repeat(${days.length}, ${COL_W}px)` }}>
          <div className="bg-slate-50/50 dark:bg-slate-800/30" />
          {days.map((day, i) => {
            const isToday = new Date(day).setHours(0,0,0,0) === today.getTime();
            return (
              <div key={i} className="p-3 text-center border-l border-slate-100 dark:border-slate-800"
                style={{ background: isToday ? "rgba(0,40,85,0.04)" : undefined }}>
                <span className="text-[8px] font-black uppercase tracking-widest block mb-0.5"
                  style={{ color: isToday ? NAVY : "#94a3b8" }}>
                  {fmt(day, { weekday: "short" })}
                </span>
                <span className="text-sm font-black" style={{ color: isToday ? NAVY : "#64748b" }}>
                  {fmt(day, { day: "numeric" })}
                </span>
                {isToday && <div className="w-4 h-0.5 mx-auto mt-1 rounded-full" style={{ background: NAVY }} />}
              </div>
            );
          })}
        </div>

        {/* Grille */}
        <div className="relative">
          {HOURS.map((h) => (
            <div key={h} className="grid border-b border-slate-50 dark:border-slate-800/50"
              style={{ gridTemplateColumns: `${LEFT_W}px repeat(${days.length}, ${COL_W}px)`, minHeight: ROW_H }}>
              <div className="flex items-start justify-end pr-3 pt-2">
                <span className="text-[9px] font-black text-slate-300 dark:text-slate-600">{h}</span>
              </div>
              {days.map((_, di) => (
                <div key={di} className="border-l border-slate-50 dark:border-slate-800/50"
                  style={{ background: di === 0 ? "rgba(0,40,85,0.01)" : undefined }} />
              ))}
            </div>
          ))}

          {/* RDV */}
          {rdvs.map((rdv, idx) => {
            const { dayIdx, hourIdx } = getSlot(rdv);
            if (dayIdx < 0 || hourIdx < 0) return null;
            const s = getStatut(rdv.statut);
            const Icon = s.icon;
            const d = new Date(rdv.date);
            const timeStr = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
            return (
              <div key={idx} className="absolute rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  top:    `${hourIdx * ROW_H + 4}px`,
                  left:   `${LEFT_W + dayIdx * COL_W + 6}px`,
                  width:  `${COL_W - 12}px`,
                  height: `${ROW_H - 8}px`,
                  background: s.bg, borderColor: s.border, zIndex: 20,
                }}>
                <div className="absolute top-0 left-0 w-[3px] h-full rounded-l-xl" style={{ background: s.color }} />
                <div className="pl-3 pr-2 pt-1.5 pb-1 h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Icon size={8} style={{ color: s.color }} />
                    <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: s.color }}>{s.label}</span>
                  </div>
                  <p className="text-[11px] font-black leading-tight truncate" style={{ color: s.color }}>
                    {rdv.patientPrenom} {rdv.patientNom}
                  </p>
                  <p className="text-[9px] truncate opacity-60" style={{ color: s.color }}>{rdv.motif}</p>
                  <div className="flex items-center gap-1 mt-auto">
                    <Clock size={7} style={{ color: s.color, opacity: 0.5 }} />
                    <span className="text-[8px] font-bold" style={{ color: s.color, opacity: 0.5 }}>{timeStr}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── VUE JOUR ──────────────────────────────────────────────────────────────────
function JourGrid({ rdvs, date }) {
  const timeStr = (d) => {
    const dt = new Date(d);
    return `${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}`;
  };

  if (!rdvs.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Users size={40} className="text-slate-200" />
      <p className="text-sm text-slate-400 font-medium">Aucun rendez-vous ce jour</p>
    </div>
  );

  return (
    <div className="divide-y divide-slate-50 dark:divide-slate-800">
      {rdvs.map((rdv, idx) => {
        const s = getStatut(rdv.statut);
        const Icon = s.icon;
        return (
          <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
            <div className="w-14 text-right shrink-0">
              <span className="text-sm font-black" style={{ color: s.color }}>{timeStr(rdv.date)}</span>
            </div>
            <div className="w-1 h-10 rounded-full shrink-0" style={{ background: s.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {rdv.patientPrenom} {rdv.patientNom}
                </p>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: s.bg, color: s.color }}>
                  {s.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{rdv.motif || "—"}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-slate-400">Dr. {rdv.medecinPrenom} {rdv.medecinNom}</p>
              <p className="text-[10px] text-slate-300">{rdv.lieu || "—"}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── VUE MOIS ──────────────────────────────────────────────────────────────────
function MoisGrid({ rdvs, year, month }) {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDow = (firstDay.getDay() + 6) % 7; // lundi = 0
  const cells = Array.from({ length: startDow + daysInMonth }, (_, i) =>
    i < startDow ? null : i - startDow + 1
  );
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const rdvByDay = {};
  rdvs.forEach(rdv => {
    const d = new Date(rdv.date).getDate();
    if (!rdvByDay[d]) rdvByDay[d] = [];
    rdvByDay[d].push(rdv);
  });

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  const JOURS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

  return (
    <div className="p-4">
      {/* Header jours */}
      <div className="grid grid-cols-7 mb-2">
        {JOURS.map(j => (
          <div key={j} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{j}</div>
        ))}
      </div>
      {/* Cellules */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const isToday = isCurrentMonth && today.getDate() === day;
          const dayRdvs = rdvByDay[day] ?? [];
          return (
            <div key={i} className="min-h-[90px] rounded-xl border p-1.5 transition-colors"
              style={{
                borderColor: isToday ? NAVY : "rgba(0,0,0,0.05)",
                background: isToday ? "rgba(0,40,85,0.03)" : "transparent",
              }}>
              <div className="flex items-center justify-center w-6 h-6 rounded-full mb-1 mx-auto"
                style={{ background: isToday ? NAVY : "transparent" }}>
                <span className="text-[11px] font-black" style={{ color: isToday ? "#fff" : "#64748b" }}>{day}</span>
              </div>
              <div className="space-y-0.5">
                {dayRdvs.slice(0, 3).map((rdv, ri) => {
                  const s = getStatut(rdv.statut);
                  return (
                    <div key={ri} className="rounded px-1 py-0.5 truncate"
                      style={{ background: s.bg, borderLeft: `2px solid ${s.color}` }}>
                      <span className="text-[8px] font-bold truncate" style={{ color: s.color }}>
                       {rdv.patientPrenom} {rdv.patientNom}
                      </span>
                    </div>
                  );
                })}
                {dayRdvs.length > 3 && (
                  <div className="text-[8px] font-black text-slate-400 text-center">+{dayRdvs.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function PlanningPage() {
  const [view,       setView]       = useState("semaine");
  const [currentDate, setCurrentDate] = useState(getMondayOf(new Date()));
  const [medecinId,  setMedecinId]  = useState(null);
  const [overview,   setOverview]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (view === "semaine") {
        data = await getPlanningSemaine(medecinId, getMondayOf(currentDate));
      } else if (view === "jour") {
        data = await getPlanningJour(medecinId, currentDate);
      } else {
        data = await getPlanningMois(medecinId, currentDate.getFullYear(), currentDate.getMonth() + 1);
      }
      setOverview(data);
    } catch (e) {
      setError("Impossible de charger le planning.");
    } finally {
      setLoading(false);
    }
  }, [view, medecinId, currentDate]);

  useEffect(() => { load(); }, [load]);

  // Navigation
  const navigate = (dir) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === "jour")     d.setDate(d.getDate() + dir);
      if (view === "semaine")  d.setDate(d.getDate() + dir * 7);
      if (view === "mois")     d.setMonth(d.getMonth() + dir);
      return d;
    });
  };

  const navLabel = () => {
    if (view === "semaine") return fmtRange(getMondayOf(currentDate));
    if (view === "jour")    return fmt(currentDate, { weekday:"long", day:"numeric", month:"long", year:"numeric" });
    if (view === "mois")    return fmt(currentDate, { month:"long", year:"numeric" });
    return "";
  };

  const medecins = overview?.medecins ?? [];
  const rdvs     = overview?.rdvs     ?? [];

  const STATS = [
    { label: "Confirmés",   value: overview?.totalConfirmes ?? 0, color: NAVY  },
    { label: "En attente",  value: overview?.totalEnAttente ?? 0, color: "#d97706" },
    { label: "Effectués",   value: rdvs.filter(r => r.statut === "EFFECTUE").length, color: "#059669" },
    { label: "Annulés",     value: overview?.totalAnnules   ?? 0, color: "#94a3b8" },
  ];

  return (
    <div className="pb-10">
      <Header title="Gestion Planning" breadcrumb="Planning & RDV" />
      <div className="px-8 py-6 space-y-5">

        {/* Barre refresh */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            {loading ? "Chargement…" : error ? "" : `Mis à jour à ${new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })}`}
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

        {/* Barre de contrôle */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">

          {/* Header stats */}
          <div className="px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4"
            style={{ background: "#EEF2F7" }}>
            <div>
              <h2 className="text-sm font-black tracking-tight" style={{ color: NAVY }}>
                Planning {view === "semaine" ? "de la semaine" : view === "jour" ? "du jour" : "du mois"}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{navLabel()}</p>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="text-center px-3 py-1.5 rounded-xl bg-white/70">
                  <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Select médecin */}
              <select
                value={medecinId ?? ""}
                onChange={(e) => setMedecinId(e.target.value || null)}
                className="pl-4 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-wider outline-none text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="">Tous les médecins</option>
                {medecins.map((m) => (
                  <option key={m.id} value={m.id}>
                    Dr. {m.nom.toUpperCase()} — {m.specialite}
                  </option>
                ))}
              </select>

              {/* Toggle vue */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                {["Jour","Semaine","Mois"].map((v) => (
                  <button key={v} onClick={() => setView(v.toLowerCase())}
                    className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                    style={view === v.toLowerCase()
                      ? { background: NAVY, color: "#fff" }
                      : { color: "#94a3b8" }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(-1)}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 transition-all hover:border-[#002855] hover:text-[#002855]">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest min-w-[200px] text-center">
                {navLabel()}
              </span>
              <button onClick={() => navigate(1)}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 transition-all hover:border-[#002855] hover:text-[#002855]">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Légende */}
          <div className="px-6 py-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center gap-6">
            {Object.entries(statutConfig).map(([key, s]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: s.bg, border: `1.5px solid ${s.color}40` }} />
                <div className="w-0.5 h-3 rounded-full" style={{ background: s.color }} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendrier */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="text-slate-300 animate-spin" />
            </div>
          ) : (
            <>
              {view === "semaine" && <SemaineGrid rdvs={rdvs} monday={getMondayOf(currentDate)} />}
              {view === "jour"    && <JourGrid    rdvs={rdvs} date={currentDate} />}
              {view === "mois"    && <MoisGrid    rdvs={rdvs} year={currentDate.getFullYear()} month={currentDate.getMonth() + 1} />}
            </>
          )}
        </div>

      </div>
    </div>
  );
}