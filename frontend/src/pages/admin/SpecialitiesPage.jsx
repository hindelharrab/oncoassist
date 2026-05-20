// ── SpecialitiesPage.jsx — avec navigate vers détail ────────────────────────
import { useState } from "react";
import { Users, Clock, ArrowRight, Activity, Heart, Eye, Plus, Search, Stethoscope, TrendingUp } from "lucide-react";
import { Header, cn } from "../../Shared";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const NAVY = "#002855";
const RED  = "#E31E24";

export const mockSpecialities = [
  { id:1, name:"Cardiologie",   duration:30, doctorCount:3, capacity:85, patients:312, rdv:124, description:"Diagnostic et traitement des maladies cardiovasculaires."    },
  { id:2, name:"Pédiatrie",     duration:20, doctorCount:2, capacity:62, patients:198, rdv:98,  description:"Soins médicaux dédiés aux enfants et adolescents."           },
  { id:3, name:"Dermatologie",  duration:15, doctorCount:1, capacity:45, patients:145, rdv:85,  description:"Traitement des maladies de la peau, des ongles et des cheveux." },
  { id:4, name:"Ophtalmologie", duration:45, doctorCount:1, capacity:78, patients:112, rdv:68,  description:"Soins et chirurgie des maladies oculaires."                   },
  { id:5, name:"Dentaire",      duration:60, doctorCount:2, capacity:90, patients:276, rdv:104, description:"Soins dentaires, orthodontie et chirurgie buccale."           },
  { id:6, name:"Généraliste",   duration:15, doctorCount:5, capacity:55, patients:404, rdv:210, description:"Médecine générale, suivi et orientation des patients."        },
];

const specIcons = {
  Cardiologie:   Heart,
  Ophtalmologie: Eye,
  Généraliste:   Activity,
  Pédiatrie:     Users,
  Dermatologie:  Activity,
  Dentaire:      Stethoscope,
};

const capColor = (c) => {
  if (c >= 80) return RED;
  if (c >= 60) return "#f59e0b";
  return "#10b981";
};

const capLabel = (c) => {
  if (c >= 80) return { label:"Forte demande", bg:"rgba(227,30,36,0.08)",  color:RED       };
  if (c >= 60) return { label:"Modérée",       bg:"rgba(245,158,11,0.08)", color:"#d97706" };
  return              { label:"Disponible",    bg:"rgba(16,185,129,0.08)", color:"#059669" };
};

const SpecCard = ({ spec, index, onClick }) => {
  const Icon   = specIcons[spec.name] || Activity;
  const cap    = capLabel(spec.capacity);
  const isHigh = spec.capacity >= 80;

  return (
    <motion.div
      initial={{ opacity:0, y:16 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col relative cursor-pointer"
    >
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl pointer-events-none"
        style={{ background: isHigh ? "rgba(227,30,36,0.05)" : "rgba(0,40,85,0.05)", marginTop:"-40px", marginRight:"-40px" }}
      />

      <div className="p-5 flex flex-col flex-1 relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: isHigh ? "rgba(227,30,36,0.08)" : "rgba(0,40,85,0.07)" }}
          >
            <Icon size={20} style={{ color: isHigh ? RED : NAVY }} />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg uppercase tracking-widest">
              #{spec.id.toString().padStart(2,"0")}
            </span>
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider"
              style={{ background:cap.bg, color:cap.color }}
            >
              {cap.label}
            </span>
          </div>
        </div>

        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 group-hover:text-[#002855] transition-colors">
          {spec.name}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-5 leading-relaxed">
          {spec.description}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { label:"Équipe",     value:spec.doctorCount, icon:Users,      suffix:"méd." },
            { label:"Durée RDV",  value:spec.duration,    icon:Clock,      suffix:"min"  },
            { label:"Patients",   value:spec.patients,    icon:Users,      suffix:""     },
            { label:"RDV / mois", value:spec.rdv,         icon:TrendingUp, suffix:""     },
          ].map((s) => (
            <div key={s.label} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
              <div className="flex items-center gap-1.5">
                <s.icon size={12} style={{ color:NAVY }} />
                <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                  {s.value}
                  {s.suffix && <span className="text-[10px] font-bold text-slate-400 ml-0.5">{s.suffix}</span>}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:capColor(spec.capacity) }} />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Actif · Capacité</span>
            </div>
            <span className="text-xs font-black" style={{ color:capColor(spec.capacity) }}>{spec.capacity}%</span>
          </div>

          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width:0 }}
              animate={{ width:`${spec.capacity}%` }}
              transition={{ duration:0.7, delay: index * 0.06, ease:"easeOut" }}
              className="h-full rounded-full"
              style={{ background:capColor(spec.capacity) }}
            />
          </div>

          <button
            className="w-full h-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-white rounded-xl transition-all hover:opacity-90"
            style={{ background:NAVY }}
          >
            Détails Service <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function SpecialitiesPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = mockSpecialities.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-10">
      <Header title="Spécialités" breadcrumb="Services Médicaux" />
      <div className="px-8 py-6 space-y-5">

        <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Services Cliniques</h2>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
              Organisation et performance par pôle
            </p>
          </div>
          <div className="flex-1 md:flex justify-end hidden">
            <div className="relative w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                onFocus={(e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px ${NAVY}20`; }}
                onBlur={(e)  => { e.target.style.borderColor = "transparent"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>
          <button
            className="h-10 px-6 rounded-xl text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-opacity hover:opacity-90 shrink-0"
            style={{ background:NAVY }}
          >
            <Plus size={15} /> Nouveau Service
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((spec, i) => (
            <SpecCard
              key={spec.id}
              spec={spec}
              index={i}
              onClick={() => navigate(`/admin/specialities/${spec.id}`)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background:"rgba(0,40,85,0.06)" }}>
              <Search size={24} style={{ color:NAVY }} />
            </div>
            <p className="font-black text-slate-700 dark:text-slate-300">Aucun service trouvé</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Modifiez votre recherche</p>
          </div>
        )}

      </div>
    </div>
  );
}