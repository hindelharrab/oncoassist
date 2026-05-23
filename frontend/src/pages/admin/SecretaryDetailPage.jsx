import { useEffect, useState } from "react";
import {
  ArrowLeft, Phone, Mail, Calendar, Clock,
  CheckCircle, FileText, TrendingUp, Activity, XCircle,
  Stethoscope, Heart, Brain, Baby, Bone, Eye, Wind,
} from "lucide-react";
import { Header, cn } from "../../Shared";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import adminSecretaireService from "../../services/adminSecretaireService";

const NAVY = "#002855";
const RED  = "#E31E24";

const typeStyle = {
  confirm:   { color: "#059669", bg: "rgba(5,150,105,0.08)",   icon: CheckCircle },
  create:    { color: NAVY,      bg: "rgba(0,40,85,0.07)",     icon: FileText    },
  cancel:    { color: RED,       bg: "rgba(227,30,36,0.08)",   icon: XCircle     },
  reschedule:{ color: "#d97706", bg: "rgba(245,158,11,0.08)",  icon: Calendar    },
  effectue:  { color: NAVY,      bg: "rgba(0,40,85,0.07)",     icon: CheckCircle },
};

const SpecialiteIcon = ({ nom, size = 16 }) => {
  const n = (nom ?? "").toLowerCase();
  if (n.includes("cardio"))  return <Heart       size={size} />;
  if (n.includes("neuro"))   return <Brain       size={size} />;
  if (n.includes("pédia") || n.includes("pedia")) return <Baby size={size} />;
  if (n.includes("ortho"))   return <Bone        size={size} />;
  if (n.includes("ophta"))   return <Eye         size={size} />;
  if (n.includes("pneumo"))  return <Wind        size={size} />;
  if (n.includes("général") || n.includes("general")) return <Activity size={size} />;
  return <Stethoscope size={size} />;
};

const specialiteColor = (nom) => {
  const n = (nom ?? "").toLowerCase();
  if (n.includes("cardio"))  return { bg: "rgba(239,68,68,0.08)",   color: "#dc2626" };
  if (n.includes("neuro"))   return { bg: "rgba(139,92,246,0.08)",  color: "#7c3aed" };
  if (n.includes("pédia") || n.includes("pedia")) return { bg: "rgba(251,146,60,0.08)", color: "#ea580c" };
  if (n.includes("ortho"))   return { bg: "rgba(20,184,166,0.08)",  color: "#0d9488" };
  if (n.includes("ophta"))   return { bg: "rgba(14,165,233,0.08)",  color: "#0284c7" };
  if (n.includes("pneumo"))  return { bg: "rgba(100,116,139,0.08)", color: "#475569" };
  return                            { bg: "rgba(0,40,85,0.07)",     color: NAVY      };
};

export default function SecretaryDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [sec,     setSec]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminSecretaireService.getById(id)
      .then(setSec)
      .catch(() => toast.error("Impossible de charger le profil"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${NAVY}40`, borderTopColor: NAVY }}
          />
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Chargement…</span>
        </div>
      </div>
    );
  }

  if (!sec) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-slate-50 dark:bg-slate-950">
        <span className="text-3xl">⚠️</span>
        <span className="text-sm font-black text-slate-400">Secrétaire introuvable</span>
        <button
          onClick={() => navigate("/admin/secretaries")}
          className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl text-white"
          style={{ background: NAVY }}
        >
          Retour
        </button>
      </div>
    );
  }

  const spColor  = specialiteColor(sec.specialiteNom);
  const avatarSrc =
    adminSecretaireService.getPhotoUrl(sec.photoProfil) ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${sec.nom}`;

  const kpis = [
    { label: "Total RDV",  value: sec.totalRendezVousGeres ?? 0, icon: <Calendar    size={15} />, color: "rgba(0,40,85,0.08)",   iconColor: NAVY      },
    { label: "Planifiés",  value: sec.rdvPlanifies  ?? 0,        icon: <CheckCircle size={15} />, color: "rgba(5,150,105,0.1)",  iconColor: "#059669" },
    { label: "Effectués",  value: sec.rdvEffectues  ?? 0,        icon: <TrendingUp  size={15} />, color: "rgba(0,40,85,0.08)",   iconColor: NAVY      },
    { label: "Annulés",    value: sec.rdvAnnules    ?? 0,        icon: <Activity    size={15} />, color: "rgba(227,30,36,0.08)", iconColor: RED       },
  ];

  const barres = [
    { label: "Planifiés",  value: sec.rdvPlanifies ?? 0, color: "#059669" },
    { label: "Effectués",  value: sec.rdvEffectues ?? 0, color: NAVY      },
    { label: "En attente", value: sec.rdvEnAttente ?? 0, color: "#d97706" },
    { label: "Annulés",    value: sec.rdvAnnules   ?? 0, color: RED       },
  ];

  const derniereActivite = sec.activitesRecentes?.[0];

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

        {/* ── HERO ── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "rgba(0,40,85,0.05)", borderColor: "rgba(0,40,85,0.1)" }}
        >
          <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden border-2 bg-slate-50"
                style={{ borderColor: "rgba(0,40,85,0.08)" }}
              >
                <img src={avatarSrc} alt={sec.prenom} className="w-full h-full object-cover" />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#10b981", border: "2.5px solid white" }}
              >
                <CheckCircle size={10} className="text-white" />
              </div>
            </div>

            {/* Identité */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                  Dossier #{sec.id.toString().slice(0, 8).toUpperCase()}
                </span>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: "#eef9f4", color: "#10b981", border: "0.5px solid rgba(16,185,129,0.3)" }}
                >
                  Actif
                </span>
                {/* Badge spécialité avec icône */}
                {sec.specialiteNom && (
                  <span
                    className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: spColor.bg, color: spColor.color, border: `0.5px solid ${spColor.color}30` }}
                  >
                    <SpecialiteIcon nom={sec.specialiteNom} size={10} />
                    {sec.specialiteNom}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-1.5" style={{ color: NAVY }}>
                {sec.prenom}{" "}
                <span style={{ color: NAVY, opacity: 0.4, fontWeight: 600 }}>{sec.nom}</span>
              </h1>
              <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                Secrétaire Médicale
                <span className="w-1 h-1 rounded-full bg-slate-200 inline-block" />
                <Mail size={11} className="inline" /> {sec.email}
                {sec.telephone && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-200 inline-block" />
                    <Phone size={11} className="inline" /> {sec.telephone}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t" style={{ borderColor: "rgba(0,40,85,0.1)" }}>
            {kpis.map((v, i) => (
              <div
                key={v.label}
                className={cn(
                  "px-5 py-4 flex items-center gap-3",
                  i < kpis.length - 1 && "border-r border-slate-100 dark:border-slate-800"
                )}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: v.color, color: v.iconColor }}
                >
                  {v.icon}
                </div>
                <div className="flex-1">
                  <span className="text-lg font-black" style={{ color: NAVY }}>{v.value}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{v.label}</p>
                </div>
                <CheckCircle size={13} style={{ color: "#10b981" }} />
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
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,40,85,0.07)" }}>
                  <Phone size={14} style={{ color: NAVY }} />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Coordonnées</h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { Icon: Phone, label: "Téléphone", value: sec.telephone || "—" },
                  { Icon: Mail,  label: "Email",     value: sec.email            },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,40,85,0.07)" }}>
                      <Icon size={15} style={{ color: NAVY }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5 break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations de poste */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Informations de Poste</h3>
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Rôle</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{sec.role ?? "SECRETAIRE"}</span>
                </div>
                {/* Spécialité avec icône */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Spécialité</span>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full"
                    style={{ background: spColor.bg, color: spColor.color }}
                  >
                    <SpecialiteIcon nom={sec.specialiteNom} size={12} />
                    {sec.specialiteNom ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">ID</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                    {sec.id.toString().slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Statut</span>
                  <span className="text-xs font-black" style={{ color: "#059669" }}>Actif</span>
                </div>
              </div>
            </div>

            {/* Répartition RDV */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Répartition des RDV</h3>
              <div className="space-y-3">
                {barres.map((bar) => {
                  const pct = sec.totalRendezVousGeres > 0
                    ? Math.round((bar.value / sec.totalRendezVousGeres) * 100)
                    : 0;
                  return (
                    <div key={bar.label}>
                      <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1">
                        <span>{bar.label}</span>
                        <span style={{ color: bar.color }}>{bar.value} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: bar.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Colonne droite — Journal */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Journal d'Activité</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                    {sec.activitesRecentes?.length ?? 0} actions récentes
                  </p>
                </div>
              </div>

              {!sec.activitesRecentes || sec.activitesRecentes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
                  <span className="text-3xl">📋</span>
                  <span className="text-sm font-black">Aucune activité enregistrée</span>
                  <span className="text-xs text-slate-300">
                    Les RDV gérés apparaîtront ici
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {sec.activitesRecentes.map((item, i) => {
                    const s    = typeStyle[item.typeAction] ?? typeStyle.create;
                    const Icon = s.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex gap-5">
                          <div className="flex flex-col items-center gap-2 shrink-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ background: i === 0 ? NAVY : s.bg }}
                            >
                              <Icon size={16} style={{ color: i === 0 ? "#fff" : s.color }} />
                            </div>
                            {i < sec.activitesRecentes.length - 1 && (
                              <div className="flex-1 w-px min-h-[40px]" style={{ background: "rgba(0,40,85,0.08)" }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"
                                    style={{
                                      background: i === 0 ? "rgba(0,40,85,0.07)" : s.bg,
                                      color:      i === 0 ? NAVY : s.color,
                                    }}
                                  >
                                    {item.action}
                                  </span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                  {item.date} · {item.heure}
                                </p>
                              </div>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200 shrink-0">
                                {item.patientPrenom} {item.patientNom}
                              </p>
                            </div>
                            <div
                              className="rounded-xl px-4 py-3"
                              style={{ background: i === 0 ? "rgba(0,40,85,0.04)" : "rgba(0,0,0,0.02)" }}
                            >
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Action enregistrée pour le patient{" "}
                                <strong>{item.patientPrenom} {item.patientNom}</strong>{" "}
                                — {item.action.toLowerCase()}.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {derniereActivite && (
                <div
                  className="px-6 py-4 border-t border-slate-100 dark:border-slate-800"
                  style={{ background: "rgba(0,40,85,0.02)" }}
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Dernière action :{" "}
                    <span style={{ color: NAVY }}>
                      {derniereActivite.date} · {derniereActivite.heure}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}