// ── PatientDetailPage.jsx ────────────────────────────────────────────────────
import { ArrowLeft, Phone, Mail, Activity, ShieldCheck, HeartPulse, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Header, cn } from "../../Shared";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { mockPatients } from "./PatientsPage";
import {   Thermometer, Scale } from "lucide-react";

const NAVY = "#002855";
const RED  = "#E31E24";

const history = [
  { date:"10 Mai 2024", time:"09:30", doctor:"Dr. Marc Durand",   spec:"Cardiologie", report:"Bilan annuel, rythme sinusal normal. Tension artérielle stable à 120/80 mmHg. Aucune anomalie détectée à l'ECG.", status:"completed" },
  { date:"15 Avr 2024", time:"14:00", doctor:"Dr. Sophie Martin", spec:"Pédiatrie",   report:"Suivi post-traitement, rétablissement complet. Reprise des activités autorisée.", status:"completed" },
  { date:"02 Mar 2024", time:"11:15", doctor:"Dr. Marc Durand",   spec:"Cardiologie", report:"Douleurs thoraciques légères, ECG prescrit. Résultats à analyser lors du prochain RDV.", status:"pending"   },
];

const vitals = [
  { label:"Tension",     value:"120/80", unit:"mmHg", icon:"🫀", ok:true  },
  { label:"Pouls",       value:"72",     unit:"bpm",  icon:"💓", ok:true  },
  { label:"Température", value:"37.2",   unit:"°C",   icon:"🌡️", ok:true  },
  { label:"IMC",         value:"22.4",   unit:"kg/m²",icon:"⚖️", ok:true  },
];

export default function PatientDetailPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const patient  = mockPatients.find((p) => p.id === parseInt(id)) || mockPatients[0];

  return (
    <div className="pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header title="Dossier Patient" breadcrumb="Patients" />

      <div className="px-8 py-6 space-y-6">

        {/* Retour */}
        <button
          onClick={() => navigate("/admin/patients")}
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#002855] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} /> Retour au Registre
        </button>

     {/* ── HERO ── */}
<div className="rounded-2xl border overflow-hidden"
  style={{ background:"rgba(0,40,85,0.05)", borderColor:"rgba(0,40,85,0.1)" }}
>
  {/* Infos patient */}
  <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">

    {/* Avatar */}
    <div className="relative shrink-0">
      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 bg-slate-50" style={{ borderColor:"rgba(0,40,85,0.08)" }}>
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.lastName}`}
          alt={patient.firstName}
          className="w-full h-full"
        />
      </div>
      <div
        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background:"#10b981", border:"2.5px solid white" }}
      >
        <ShieldCheck size={10} className="text-white" />
      </div>
    </div>

    {/* Nom + meta */}
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
          Dossier #{patient.id.toString().padStart(4, "0")}
        </span>
        <span
          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background:"#eef9f4", color:"#10b981", border:"0.5px solid rgba(16,185,129,0.3)" }}
        >
          Patient Actif
        </span>
      </div>
      <h1 className="text-2xl font-black tracking-tight mb-1.5" style={{ color: NAVY }}>
        {patient.firstName}{" "}
        <span style={{ color: NAVY, opacity: 0.4, fontWeight: 600 }}>{patient.lastName}</span>
      </h1>
      <p className="text-xs text-slate-400 flex items-center gap-2">
        {patient.age} ans
        <span className="w-1 h-1 rounded-full bg-slate-200 inline-block" />
        {patient.speciality}
        <span className="w-1 h-1 rounded-full bg-slate-200 inline-block" />
        Suivi par <span className="font-black ml-1" style={{ color: NAVY }}>{patient.doctor}</span>
      </p>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-3 shrink-0">
    <button
                  className="text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
                  style={{ background:RED }}
                >
               Télécharger le dossier
                </button>
</div>
  </div>

  {/* Vitaux — bande légère */}
 <div className="grid grid-cols-4 border-t" style={{ borderColor:"rgba(0,40,85,0.1)" }}>
    {[
{ label:"Tension",     value:"120/80", unit:"mmHg", icon:<Activity size={15} />,     color:"rgba(227,30,36,0.08)",  iconColor: RED    },
{ label:"Pouls",       value:"72",     unit:"bpm",  icon:<HeartPulse size={15} />,   color:"rgba(0,40,85,0.08)",    iconColor: NAVY   },
{ label:"Température", value:"37.2",   unit:"°C",   icon:<Thermometer size={15} />,  color:"rgba(245,158,11,0.1)",  iconColor:"#d97706" },
{ label:"IMC",         value:"22.4",   unit:"kg/m²",icon:<Scale size={15} />,        color:"rgba(16,185,129,0.1)",  iconColor:"#059669" },
    ].map((v, i) => (
      <div
        key={v.label}
        className={cn(
          "px-5 py-4 flex items-center gap-3",
          i < 3 && "border-r border-slate-100 dark:border-slate-800"
        )}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: v.color, color: v.iconColor }}
        >
          {v.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black" style={{ color: NAVY }}>{v.value}</span>
            <span className="text-[10px] font-bold text-slate-400">{v.unit}</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{v.label}</p>
        </div>
        <CheckCircle size={13} style={{ color:"#10b981" }} />
      </div>
    ))}
  </div>
</div>
        {/* ── CONTENU PRINCIPAL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Colonne gauche */}
          <div className="lg:col-span-4 space-y-5">

            {/* Profil Santé */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div
                className="px-5 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(0,40,85,0.08)" }}>
                  <Activity size={14} style={{ color:NAVY }} />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Profil Santé</h3>
              </div>
              <div className="p-5 space-y-2">
                {[
                  { label:"Âge",            value:`${patient.age} ans`,  style:{} },
                  { label:"Groupe Sanguin", value:"O+ Positive",          style:{ color:RED, fontWeight:900 } },
                  { label:"Allergies",      value:"Pénicilline",          style:{ color:"#f59e0b", fontWeight:900 } },
                  { label:"CIN",            value:patient.cin,            style:{} },
                  { label:"Spécialité",     value:patient.speciality,     style:{ color:NAVY, fontWeight:900 } },
                ].map(({ label, value, style }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white" style={style}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordonnées */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Coordonnées</h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { Icon:Phone, value:patient.phone,        label:"Téléphone" },
                  { Icon:Mail,  value:"contact@patient.com",label:"Email"     },
                ].map(({ Icon, value, label }) => (
                  <div key={label} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background:"rgba(0,40,85,0.07)" }}
                    >
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

            {/* Assurance */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background:NAVY }}
            >
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-20"
                style={{ background:RED }}
              />
              <div className="flex items-center gap-3 mb-4">
                <HeartPulse size={18} style={{ color:RED }} />
                <h3 className="text-sm font-black text-white">Assurance Santé</h3>
              </div>
              <div
                className="rounded-xl p-4 mb-4"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}
              >
                <p className="text-base font-black text-white">CNAM Premium</p>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-0.5">Expire en 2026</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label:"Remboursement", value:"80%"      },
                  { label:"Plafond / an",  value:"50k MAD"  },
                  { label:"Consultations", value:"Incluses" },
                  { label:"Pharmacie",     value:"70%"      },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-3"
                    style={{ background:"rgba(255,255,255,0.05)" }}
                  >
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-wider">{s.label}</p>
                    <p className="text-sm font-black text-white mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Colonne droite — Historique */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Historique Médical</h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                    {history.length} consultations enregistrées
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
                {history.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity:0, y:10 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <div className="flex gap-5">

                      {/* Indicateur latéral */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                          style={{ background: i === 0 ? NAVY : "rgba(0,40,85,0.06)" }}
                        >
                          {item.status === "completed"
                            ? <CheckCircle size={16} style={{ color: i === 0 ? "#fff" : NAVY }} />
                            : <AlertCircle size={16} style={{ color: RED }} />
                          }
                        </div>
                        {i < history.length - 1 && (
                          <div className="flex-1 w-px min-h-[40px]" style={{ background:"rgba(0,40,85,0.08)" }} />
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"
                                style={{ background:"rgba(0,40,85,0.07)", color:NAVY }}
                              >
                                {item.spec}
                              </span>
                              {item.status === "pending" && (
                                <span
                                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"
                                  style={{ background:"rgba(227,30,36,0.08)", color:RED }}
                                >
                                  En attente
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              {item.date} · {item.time}
                            </p>
                          </div>

                          {/* Médecin */}
                          <div className="flex items-center gap-2 shrink-0">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.doctor}`}
                              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                              alt={item.doctor}
                            />
                            <div>
                              <p className="text-xs font-black text-slate-700 dark:text-slate-300">{item.doctor}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{item.spec}</p>
                            </div>
                          </div>
                        </div>

                        {/* Rapport */}
                        <div
                          className="rounded-xl px-4 py-3"
                          style={{ background: i === 0 ? "rgba(0,40,85,0.04)" : "rgba(0,0,0,0.02)" }}
                        >
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {item.report}
                          </p>
                        </div>
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
                  Dernière visite : <span style={{ color:NAVY }}>10 Mai 2024</span>
                </p>
               
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}