// ── SpecialityDetailPage.jsx ─────────────────────────────────────────────────
import { ArrowLeft, Users, Clock, TrendingUp, Calendar, Star, Activity, Heart, Eye, Stethoscope, CheckCircle } from "lucide-react";
import { Header, cn } from "../../Shared";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";

const NAVY = "#002855";
const RED  = "#E31E24";

const mockSpecialities = [
  { id:1, name:"Cardiologie",   duration:30, doctorCount:3, capacity:85, patients:312, rdv:124, description:"Diagnostic et traitement des maladies cardiovasculaires." },
  { id:2, name:"Pédiatrie",     duration:20, doctorCount:2, capacity:62, patients:198, rdv:98,  description:"Soins médicaux dédiés aux enfants et adolescents."         },
  { id:3, name:"Dermatologie",  duration:15, doctorCount:1, capacity:45, patients:145, rdv:85,  description:"Traitement des maladies de la peau, des ongles et des cheveux." },
  { id:4, name:"Ophtalmologie", duration:45, doctorCount:1, capacity:78, patients:112, rdv:68,  description:"Soins et chirurgie des maladies oculaires."                },
  { id:5, name:"Dentaire",      duration:60, doctorCount:2, capacity:90, patients:276, rdv:104, description:"Soins dentaires, orthodontie et chirurgie buccale."        },
  { id:6, name:"Généraliste",   duration:15, doctorCount:5, capacity:55, patients:404, rdv:210, description:"Médecine générale, suivi et orientation des patients."     },
];

const specIcons = {
  Cardiologie:   Heart,
  Ophtalmologie: Eye,
  Généraliste:   Activity,
  Pédiatrie:     Users,
  Dermatologie:  Activity,
  Dentaire:      Stethoscope,
};

const specDoctors = {
  1: [
    { name:"Marc Durand",   rdv:124, rating:4.8, patients:98  },
    { name:"Luc Leroy",     rdv:72,  rating:4.6, patients:110 },
    { name:"Jean Dupont",   rdv:85,  rating:4.7, patients:64  },
  ],
  2: [
    { name:"Sophie Martin", rdv:98,  rating:4.9, patients:76  },
    { name:"Emma Vidal",    rdv:60,  rating:4.5, patients:55  },
  ],
};

const capColor = (c) => c >= 80 ? RED : c >= 60 ? "#f59e0b" : "#10b981";

const monthlyData = [
  { month:"Jan", rdv:80  },
  { month:"Fév", rdv:65  },
  { month:"Mar", rdv:110 },
  { month:"Avr", rdv:124 },
  { month:"Mai", rdv:98  },
  { month:"Jun", rdv:115 },
];

export default function SpecialityDetailPage() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const speciality  = mockSpecialities.find((s) => s.id === parseInt(id)) || mockSpecialities[0];
  const Icon        = specIcons[speciality.name] || Activity;
  const doctors     = specDoctors[speciality.id] || specDoctors[1];
  const maxRdv      = Math.max(...monthlyData.map((d) => d.rdv));
  const isHigh      = speciality.capacity >= 80;

  return (
    <div className="pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header title={speciality.name} breadcrumb="Spécialités" />
      <div className="px-8 py-6 space-y-6">

        {/* Retour */}
        <button
          onClick={() => navigate("/admin/specialities")}
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#002855] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} /> Retour aux spécialités
        </button>

       {/* ── HERO — même style que PatientDetailPage ── */}
<div
  className="rounded-2xl border overflow-hidden"
  style={{ background:"rgba(0,40,85,0.05)", borderColor:"rgba(0,40,85,0.1)" }}
>
  {/* Infos spécialité */}
  <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">

    {/* Icône */}
    <div className="relative shrink-0">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center border-2"
        style={{ background:"rgba(0,40,85,0.08)", borderColor:"rgba(0,40,85,0.12)" }}
      >
        <Icon size={32} style={{ color: isHigh ? RED : NAVY }} />
      </div>
      <div
        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: isHigh ? RED : "#10b981", border:"2.5px solid white" }}
      >
        <CheckCircle size={10} className="text-white" />
      </div>
    </div>

    {/* Nom + meta */}
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
          Service #{speciality.id.toString().padStart(2,"0")}
        </span>
        <span
          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{
            background: isHigh ? "rgba(227,30,36,0.1)" : "#eef9f4",
            color:       isHigh ? RED : "#10b981",
            border:      isHigh ? "0.5px solid rgba(227,30,36,0.3)" : "0.5px solid rgba(16,185,129,0.3)",
          }}
        >
          {isHigh ? "Forte demande" : "Disponible"}
        </span>
      </div>
      <h1 className="text-2xl font-black tracking-tight mb-1.5" style={{ color:NAVY }}>
        {speciality.name}
      </h1>
      <p className="text-xs text-slate-400">{speciality.description}</p>
    </div>

   
  </div>

  {/* KPIs — bande comme les vitaux */}
  <div className="grid grid-cols-4 border-t" style={{ borderColor:"rgba(0,40,85,0.1)" }}>
    {[
      { label:"Médecins",   value: speciality.doctorCount,       icon:<Users size={15} />,      color:"rgba(0,40,85,0.08)",   iconColor:NAVY      },
      { label:"Patients",   value: speciality.patients,          icon:<Users size={15} />,      color:"rgba(227,30,36,0.08)", iconColor:RED       },
      { label:"RDV / mois", value: speciality.rdv,               icon:<Calendar size={15} />,   color:"rgba(5,150,105,0.1)",  iconColor:"#059669" },
      { label:"Durée moy.", value:`${speciality.duration} min`,  icon:<Clock size={15} />,      color:"rgba(245,158,11,0.1)", iconColor:"#d97706" },
    ].map((v, i) => (
      <div
        key={v.label}
        className={cn("px-5 py-4 flex items-center gap-3", i < 3 && "border-r border-slate-100 dark:border-slate-800")}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background:v.color, color:v.iconColor }}
        >
          {v.icon}
        </div>
        <div className="flex-1">
          <span className="text-lg font-black" style={{ color:NAVY }}>{v.value}</span>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{v.label}</p>
        </div>
        <CheckCircle size={13} style={{ color:"#10b981" }} />
      </div>
    ))}
  </div>
</div>

        {/* ── CONTENU ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Gauche */}
          <div className="lg:col-span-4 space-y-5">

            {/* Capacité */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Capacité du service</h3>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-4xl font-black" style={{ color: capColor(speciality.capacity) }}>
                  {speciality.capacity}%
                </span>
                <span className="text-xs font-black text-slate-400 pb-1">d'occupation</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width:0 }}
                  animate={{ width:`${speciality.capacity}%` }}
                  transition={{ duration:0.8, ease:"easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: capColor(speciality.capacity) }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:"Dispo.",     pct:100-speciality.capacity, color:"#10b981" },
                  { label:"Occupé",     pct:speciality.capacity,     color: capColor(speciality.capacity) },
                  { label:"En attente", pct:Math.round(speciality.capacity * 0.15), color:"#f59e0b" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-2 rounded-xl" style={{ background:`${s.color}10` }}>
                    <p className="text-sm font-black" style={{ color: s.color }}>{s.pct}%</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Infos service */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Informations Service</h3>
              </div>
              <div className="p-5 space-y-2">
                {[
                  { label:"Durée consultation", value:`${speciality.duration} min` },
                  { label:"Équipe médicale",    value:`${speciality.doctorCount} médecins` },
                
                  { label:"Statut",             value:"Actif", style:{ color:"#059669", fontWeight:900 } },
                ].map(({ label, value, style }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background:"rgba(0,40,85,0.03)" }}>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white" style={style}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphique mensuel */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">RDV par mois</h3>
              <div className="flex items-end gap-1.5 h-24">
                {monthlyData.map((d, i) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height:0 }}
                      animate={{ height:`${(d.rdv / maxRdv) * 80}px` }}
                      transition={{ duration:0.6, delay: i * 0.07, ease:"easeOut" }}
                      className="w-full rounded-t-lg"
                      style={{
                        background: i === monthlyData.length - 2 ? RED : NAVY,
                        opacity: i === monthlyData.length - 2 ? 1 : 0.65,
                      }}
                    />
                    <span className="text-[8px] font-black text-slate-400">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Droite — médecins du service */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Équipe Médicale</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                    {doctors.length} médecin{doctors.length > 1 ? "s" : ""} dans ce service
                  </p>
                </div>
              
              </div>

              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {doctors.map((doc, i) => (
                  <motion.div
                    key={doc.name}
                    initial={{ opacity:0, x:-8 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-5 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`}
                      className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0"
                      alt={doc.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#002855] transition-colors">
                        Dr. {doc.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">{speciality.name}</p>
                    </div>

                    {/* Stats médecin */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-black" style={{ color:NAVY }}>{doc.rdv}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">RDV/mois</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black" style={{ color:NAVY }}>{doc.patients}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Patients</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">{doc.rating}</span>
                      </div>
                    </div>

                    {/* Barre progression */}
                    <div className="w-24 hidden xl:block">
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width:0 }}
                          animate={{ width:`${(doc.rdv / 130) * 100}%` }}
                          transition={{ duration:0.6, delay: i * 0.1, ease:"easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: NAVY }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800"
                style={{ background:"rgba(0,40,85,0.02)" }}
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Total : <span style={{ color:NAVY }}>{doctors.reduce((a, d) => a + d.rdv, 0)} RDV</span> ce mois
                </p>
                <button
                  className="text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
                  style={{ background: RED }}
                >
                  + Ajouter un médecin
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}