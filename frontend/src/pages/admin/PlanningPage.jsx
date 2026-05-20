import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { Header, cn } from "../../Shared";

const NAVY = "#002855";
const RED  = "#E31E24";

const planDoctors = [
  { id:1, lastName:"Durand",  speciality:"Cardiologie"  },
  { id:2, lastName:"Martin",  speciality:"Pédiatrie"    },
  { id:3, lastName:"Dupont",  speciality:"Dermatologie" },
];

const appointments = [
  { day:"Lundi",    time:"09:00", duration:1, title:"Sophie Martin",  type:"Confirmé",   color:"navy"   },
  { day:"Mardi",    time:"11:00", duration:2, title:"Jean Dupont",    type:"En attente", color:"amber"  },
  { day:"Mercredi", time:"14:00", duration:1, title:"Marc Durand",    type:"Urgent",     color:"red"    },
  { day:"Vendredi", time:"10:00", duration:2, title:"Claire Lemoine", type:"Confirmé",   color:"navy"   },
  { day:"Jeudi",    time:"09:00", duration:1, title:"Alice Bernard",  type:"Confirmé",   color:"navy"   },
  { day:"Lundi",    time:"14:00", duration:1, title:"Hugo Fontaine",  type:"En attente", color:"amber"  },
];

const slotStyle = {
  navy:  {
    bg:"rgba(0,40,85,0.07)",   border:`rgba(0,40,85,0.2)`,
    text:NAVY,                  bar:NAVY,
    icon: CheckCircle,
  },
  red:   {
    bg:"rgba(227,30,36,0.07)", border:`rgba(227,30,36,0.25)`,
    text:RED,                   bar:RED,
    icon: Zap,
  },
  amber: {
    bg:"rgba(245,158,11,0.07)", border:"rgba(245,158,11,0.3)",
    text:"#d97706",              bar:"#f59e0b",
    icon: AlertCircle,
  },
};

const typeLabel = {
  "Confirmé":   { bg:"rgba(0,40,85,0.08)",   color:NAVY,    dot:"#002855" },
  "En attente": { bg:"rgba(245,158,11,0.10)", color:"#d97706", dot:"#f59e0b" },
  "Urgent":     { bg:"rgba(227,30,36,0.08)",  color:RED,     dot:RED       },
};

const CalendarGrid = () => {
  const hours = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
  const days  = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

  const COL_W  = 140;
  const ROW_H  = 72;
  const LEFT_W = 64;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: LEFT_W + COL_W * days.length }}>

        {/* Header jours */}
        <div
          className="grid border-b border-slate-100 dark:border-slate-800"
          style={{ gridTemplateColumns:`${LEFT_W}px repeat(${days.length}, ${COL_W}px)` }}
        >
          <div className="bg-slate-50/50 dark:bg-slate-800/30" />
          {days.map((day, i) => {
            const isToday = i === 0;
            return (
              <div
                key={day}
                className="p-3 text-center border-l border-slate-100 dark:border-slate-800"
                style={{ background: isToday ? "rgba(0,40,85,0.04)" : undefined }}
              >
                <span className="text-[8px] font-black uppercase tracking-widest block mb-0.5"
                  style={{ color: isToday ? NAVY : "#94a3b8" }}>
                  {isToday ? "Aujourd'hui" : "Semaine"}
                </span>
                <span
                  className="text-xs font-black"
                  style={{ color: isToday ? NAVY : "#64748b" }}
                >
                  {day}
                </span>
                {isToday && (
                  <div className="w-4 h-0.5 mx-auto mt-1 rounded-full" style={{ background: NAVY }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Grille heures */}
        <div className="relative">
          {hours.map((h) => (
            <div
              key={h}
              className="grid border-b border-slate-50 dark:border-slate-800/50"
              style={{
                gridTemplateColumns: `${LEFT_W}px repeat(${days.length}, ${COL_W}px)`,
                minHeight: ROW_H,
              }}
            >
              <div className="flex items-start justify-end pr-3 pt-2">
                <span className="text-[9px] font-black text-slate-300 dark:text-slate-600">{h}</span>
              </div>
              {days.map((d, di) => (
                <div
                  key={`${d}-${h}`}
                  className="border-l border-slate-50 dark:border-slate-800/50 transition-colors cursor-pointer"
                  style={{ background: di === 0 ? "rgba(0,40,85,0.01)" : undefined }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,40,85,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = di === 0 ? "rgba(0,40,85,0.01)" : ""}
                />
              ))}
            </div>
          ))}

          {/* Appointments */}
          {appointments.map((apt, idx) => {
            const dayIdx  = days.indexOf(apt.day);
            const hourIdx = hours.indexOf(apt.time);
            if (dayIdx < 0 || hourIdx < 0) return null;
            const s    = slotStyle[apt.color];
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="absolute rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  top:    `${hourIdx * ROW_H + 4}px`,
                  left:   `${LEFT_W + dayIdx * COL_W + 6}px`,
                  width:  `${COL_W - 12}px`,
                  height: `${apt.duration * ROW_H - 8}px`,
                  background: s.bg,
                  borderColor: s.border,
                  zIndex: 20,
                }}
              >
                {/* Barre latérale */}
                <div
                  className="absolute top-0 left-0 w-[3px] h-full rounded-l-xl"
                  style={{ background: s.bar }}
                />
                <div className="pl-3 pr-2 pt-2 pb-1 h-full flex flex-col">
                  {/* Type badge */}
                  <div className="flex items-center gap-1 mb-1">
                    <Icon size={9} style={{ color: s.text }} />
                    <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: s.text }}>
                      {apt.type}
                    </span>
                  </div>
                  {/* Nom */}
                  <p className="text-[11px] font-black leading-tight truncate" style={{ color: s.text }}>
                    {apt.title}
                  </p>
                  {/* Heure */}
                  <div className="flex items-center gap-1 mt-auto">
                    <Clock size={8} style={{ color: s.text, opacity:0.5 }} />
                    <span className="text-[8px] font-bold" style={{ color: s.text, opacity:0.5 }}>
                      {apt.time} · {apt.duration}h
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function PlanningPage() {
  const [selected, setSelected] = useState(planDoctors[0]);
  const [view,     setView]     = useState("semaine");

  const confirmed  = appointments.filter((a) => a.type === "Confirmé").length;
  const pending    = appointments.filter((a) => a.type === "En attente").length;
  const urgent     = appointments.filter((a) => a.type === "Urgent").length;

  return (
    <div className="pb-10">
      <Header title="Gestion Planning" breadcrumb="Planning & RDV" />
      <div className="px-8 py-6 space-y-5">

        {/* ── BARRE DE CONTRÔLE ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">

         {/* Header bleu clair avec stats compactes */}
<div
  className="px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4"
  style={{ background: "#EEF2F7" }}
>
  {/* Titre */}
  <div>
    <h2 className="text-sm font-black tracking-tight" style={{ color: NAVY }}>
      Planning de la semaine
    </h2>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
      18 — 24 Mai 2024
    </p>
  </div>

</div>

          {/* Contrôles */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-slate-800">

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Select médecin */}
              <select
                onChange={(e) => setSelected(planDoctors.find((d) => d.id === parseInt(e.target.value)))}
                className="pl-4 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-wider outline-none text-slate-900 dark:text-white cursor-pointer transition-all"
                onFocus={(e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px ${NAVY}20`; }}
                onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
              >
                {planDoctors.map((d) => (
                  <option key={d.id} value={d.id}>Dr. {d.lastName.toUpperCase()} — {d.speciality}</option>
                ))}
              </select>

              {/* Toggle vue */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                {["Jour","Semaine","Mois"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v.toLowerCase())}
                    className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                    style={
                      view === v.toLowerCase()
                        ? { background: NAVY, color:"#fff" }
                        : { color:"#94a3b8" }
                    }
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Navigation semaine */}
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 transition-all hover:border-[#002855] hover:text-[#002855]"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest min-w-[130px] text-center">
                  18 — 24 MAI 2024
                </span>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 transition-all hover:border-[#002855] hover:text-[#002855]"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

            </div>
          </div>

          {/* Légende */}
          <div className="px-6 py-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center gap-6">
            {[
              { label:"Confirmé",   color:NAVY,    bg:"rgba(0,40,85,0.07)"    },
              { label:"En attente", color:"#d97706", bg:"rgba(245,158,11,0.08)" },
              { label:"Urgent",     color:RED,     bg:"rgba(227,30,36,0.08)"  },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: l.bg, border:`1.5px solid ${l.color}40` }} />
                <div className="w-0.5 h-3 rounded-full" style={{ background: l.color }} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CALENDRIER ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <CalendarGrid />
        </div>

      </div>
    </div>
  );
}