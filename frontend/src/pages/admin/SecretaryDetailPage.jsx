// ── SecretaryDetailPage.jsx ──────────────────────────────────────────────────
import { ArrowLeft, Phone, Mail, Calendar, Clock, CheckCircle, FileText, TrendingUp, Activity } from "lucide-react";
import { Header, cn } from "../../Shared";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { mockSecretaries } from "./SecretariesPage";

const NAVY = "#002855";
const RED  = "#E31E24";

const activityLog = [
  { date:"20 Mai 2024", time:"09:15", action:"RDV confirmé",    patient:"Alice Bernard",  type:"confirm"    },
  { date:"20 Mai 2024", time:"10:30", action:"Dossier créé",    patient:"Hugo Fontaine",  type:"create"     },
  { date:"19 Mai 2024", time:"14:00", action:"RDV annulé",      patient:"Jules Roux",     type:"cancel"     },
  { date:"19 Mai 2024", time:"16:45", action:"RDV reprogrammé", patient:"Inès Caron",     type:"reschedule" },
  { date:"18 Mai 2024", time:"11:00", action:"Dossier archivé", patient:"Félix Guerin",   type:"archive"    },
];

const typeStyle = {
  confirm:     { color:"#059669", bg:"rgba(5,150,105,0.08)",   icon: CheckCircle },
  create:      { color: NAVY,     bg:"rgba(0,40,85,0.07)",     icon: FileText    },
  cancel:      { color: RED,      bg:"rgba(227,30,36,0.08)",   icon: Clock       },
  reschedule:  { color:"#d97706", bg:"rgba(245,158,11,0.08)",  icon: Calendar    },
  archive:     { color:"#64748b", bg:"rgba(100,116,139,0.08)", icon: FileText    },
};

const weeklyRdv = [
  { day:"Lun", value:42 },
  { day:"Mar", value:38 },
  { day:"Mer", value:51 },
  { day:"Jeu", value:45 },
  { day:"Ven", value:34 },
];

export default function SecretaryDetailPage() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const secretary = mockSecretaries.find((s) => s.id === parseInt(id)) || mockSecretaries[0];
  const maxVal    = Math.max(...weeklyRdv.map((d) => d.value));

  return (
    <div className="pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header title="Fiche Secrétaire" breadcrumb="Secrétaires" />
      <div className="px-8 py-6 space-y-6">

        {/* Retour */}
        <button
          onClick={() => navigate("/admin/secretaries")}
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#002855] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} /> Retour à l'équipe
        </button>

        {/* ── HERO — même style que PatientDetailPage ── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background:"rgba(0,40,85,0.05)", borderColor:"rgba(0,40,85,0.1)" }}
        >
          {/* Infos secrétaire */}
          <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden border-2 bg-slate-50"
                style={{ borderColor:"rgba(0,40,85,0.08)" }}
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${secretary.lastName}`}
                  alt={secretary.firstName}
                  className="w-full h-full"
                />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background:"#10b981", border:"2.5px solid white" }}
              >
                <CheckCircle size={10} className="text-white" />
              </div>
            </div>

            {/* Nom + meta */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                  Dossier #{secretary.id.toString().padStart(4,"0")}
                </span>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background:"#eef9f4", color:"#10b981", border:"0.5px solid rgba(16,185,129,0.3)" }}
                >
                  Active
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-1.5" style={{ color:NAVY }}>
                {secretary.firstName}{" "}
                <span style={{ color:NAVY, opacity:0.4, fontWeight:600 }}>{secretary.lastName}</span>
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                Secrétaire Médicale
                <span className="w-1 h-1 rounded-full bg-slate-200 inline-block" />
                Shift {secretary.shift}
                <span className="w-1 h-1 rounded-full bg-slate-200 inline-block" />
                Depuis <span className="font-black ml-1" style={{ color:NAVY }}>{secretary.joined}</span>
              </p>
            </div>

          
          </div>

          {/* KPIs — bande comme les vitaux du patient */}
          <div className="grid grid-cols-4 border-t" style={{ borderColor:"rgba(0,40,85,0.1)" }}>
            {[
              { label:"RDV gérés",    value: secretary.rdvGeres,          icon:<Calendar size={15} />,   color:"rgba(0,40,85,0.08)",    iconColor:NAVY      },
              { label:"Dossiers",     value: secretary.dossiers,           icon:<FileText size={15} />,   color:"rgba(227,30,36,0.08)",  iconColor:RED       },
              { label:"Satisfaction", value:`${secretary.satisfaction}%`,  icon:<TrendingUp size={15} />, color:"rgba(5,150,105,0.1)",   iconColor:"#059669" },
              { label:"Expérience",   value: secretary.experience,         icon:<Activity size={15} />,   color:"rgba(245,158,11,0.1)",  iconColor:"#d97706" },
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
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black" style={{ color:NAVY }}>{v.value}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{v.label}</p>
                </div>
                <CheckCircle size={13} style={{ color:"#10b981" }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTENU ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Colonne gauche */}
          <div className="lg:col-span-4 space-y-5">

            {/* Coordonnées */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(0,40,85,0.07)" }}>
                  <Phone size={14} style={{ color:NAVY }} />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Coordonnées</h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { Icon:Phone, label:"Téléphone", value:secretary.phone },
                  { Icon:Mail,  label:"Email",     value:secretary.email },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:"rgba(0,40,85,0.07)" }}>
                      <Icon size={15} style={{ color:NAVY }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Infos poste */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Informations de Poste</h3>
              </div>
              <div className="p-5 space-y-2">
                {[
                  { label:"Shift",      value:secretary.shift                                    },
                  { label:"Expérience", value:secretary.experience                               },
                  { label:"Depuis",     value:secretary.joined                                   },
                  { label:"Statut",     value:"Actif", style:{ color:"#059669", fontWeight:900 } },
                ].map(({ label, value, style }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white" style={style}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphique RDV semaine */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">RDV cette semaine</h3>
              <div className="flex items-end gap-2 h-24">
                {weeklyRdv.map((d, i) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-black" style={{ color:NAVY }}>{d.value}</span>
                    <motion.div
                      initial={{ height:0 }}
                      animate={{ height:`${(d.value / maxVal) * 80}px` }}
                      transition={{ duration:0.6, delay: i * 0.08, ease:"easeOut" }}
                      className="w-full rounded-t-lg"
                      style={{ background: i === 2 ? RED : NAVY, opacity: i === 2 ? 1 : 0.7 }}
                    />
                    <span className="text-[9px] font-black text-slate-400">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Colonne droite — journal d'activité */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Journal d'Activité</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                    {activityLog.length} actions récentes
                  </p>
                </div>
                <button
                  className="text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all hover:opacity-80"
                  style={{ background:"rgba(0,40,85,0.07)", color:NAVY }}
                >
                  Voir tout
                </button>
              </div>

              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {activityLog.map((item, i) => {
                  const s    = typeStyle[item.type];
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity:0, y:8 }}
                      animate={{ opacity:1, y:0 }}
                      transition={{ delay: i * 0.08 }}
                      className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      <div className="flex gap-5">
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: i === 0 ? NAVY : s.bg }}
                          >
                            <Icon size={16} style={{ color: i === 0 ? "#fff" : s.color }} />
                          </div>
                          {i < activityLog.length - 1 && (
                            <div className="flex-1 w-px min-h-[40px]" style={{ background:"rgba(0,40,85,0.08)" }} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"
                                  style={{ background: i === 0 ? "rgba(0,40,85,0.07)" : s.bg, color: i === 0 ? NAVY : s.color }}
                                >
                                  {item.action}
                                </span>
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                {item.date} · {item.time}
                              </p>
                            </div>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200 shrink-0">{item.patient}</p>
                          </div>
                          <div
                            className="rounded-xl px-4 py-3"
                            style={{ background: i === 0 ? "rgba(0,40,85,0.04)" : "rgba(0,0,0,0.02)" }}
                          >
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              Action enregistrée pour le patient <strong>{item.patient}</strong> — {item.action.toLowerCase()}.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div
                className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800"
                style={{ background:"rgba(0,40,85,0.02)" }}
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Dernière action : <span style={{ color:NAVY }}>20 Mai 2024 · 10:30</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}