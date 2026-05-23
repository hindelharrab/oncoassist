// ── pages/admin/PatientDetailPage.jsx ────────────────────────────────────────
import { useState, useEffect } from "react";
import {
  ArrowLeft, Phone, Mail, Activity, ShieldCheck, HeartPulse,
  CheckCircle, AlertCircle, Loader2, Calendar, User, MapPin,
  FileText, Clock, Users, Hash,
} from "lucide-react";
import { Header, cn } from "../../Shared";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import adminPatientService, { getPhotoUrl } from "../../services/adminPatientService";

const NAVY = "#002855";
const RED  = "#E31E24";

const statutConfig = {
  NOUVELLE:     { label: "Nouvelle",     color: "#0284c7", bg: "rgba(14,165,233,0.1)"  },
  STABLE:       { label: "Stable",       color: "#059669", bg: "rgba(16,185,129,0.1)"  },
  EN_SUIVI:     { label: "En suivi",     color: NAVY,      bg: "rgba(0,40,85,0.08)"    },
  A_SURVEILLER: { label: "À surveiller", color: "#d97706", bg: "rgba(245,158,11,0.1)"  },
  CRITIQUE:     { label: "Critique",     color: RED,       bg: "rgba(227,30,36,0.1)"   },
  ARCHIVEE:     { label: "Archivée",     color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

const rdvStatutConfig = {
  EN_ATTENTE: { label: "En attente", color: "#d97706", bg: "rgba(245,158,11,0.1)" },
  PLANIFIE:   { label: "Planifié",   color: "#0284c7", bg: "rgba(14,165,233,0.1)" },
  CONFIRME:   { label: "Confirmé",   color: "#059669", bg: "rgba(16,185,129,0.1)" },
  EFFECTUE:   { label: "Effectué",   color: NAVY,      bg: "rgba(0,40,85,0.08)"   },
  ANNULE:     { label: "Annulé",     color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

const PatientAvatar = ({ patient, size = "lg" }) => {
  const photoUrl = getPhotoUrl(patient.photoProfil);
  const [err, setErr] = useState(false);
  const cls = size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const src = photoUrl && !err ? photoUrl
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.nom}`;
  return (
    <img src={src} onError={() => setErr(true)} alt={patient.prenom}
      className={`${cls} rounded-2xl object-cover border-2 bg-slate-50`}
      style={{ borderColor: "rgba(0,40,85,0.08)" }} />
  );

};

const Skeleton = ({ className }) => (
  <div className={cn("animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl", className)} />
);

const InfoRow = ({ label, value, style }) => (
  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</span>
    <span className="text-xs font-black text-slate-900 dark:text-white text-right max-w-[55%] truncate" style={style}>{value || "—"}</span>
  </div>
);

export default function PatientDetailPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true); setError(null);
        const data = await adminPatientService.getById(id);
        setPatient(data);
      } catch (err) {
        setError(err.response?.data?.message || "Patient introuvable.");
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return (
    <div className="pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header title="Dossier Patient" breadcrumb="Patients" />
      <div className="px-8 py-6 space-y-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-52 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-5">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
          <div className="lg:col-span-8"><Skeleton className="h-96 rounded-2xl" /></div>
        </div>
      </div>
    </div>
  );

  if (error || !patient) return (
    <div className="pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header title="Dossier Patient" breadcrumb="Patients" />
      <div className="px-8 py-12 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(227,30,36,0.08)" }}>
          <AlertCircle size={28} style={{ color: RED }} />
        </div>
        <p className="font-black text-slate-700 dark:text-slate-200 text-lg">Dossier introuvable</p>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
        <button onClick={() => navigate("/admin/patients")} className="mt-6 px-5 py-2 rounded-xl text-white text-sm font-black" style={{ background: NAVY }}>
          Retour au registre
        </button>
      </div>
    </div>
  );

  const statut   = statutConfig[patient.statut] || statutConfig.STABLE;
  const isActive = patient.statut !== "ARCHIVEE";
  const shortId  = patient.id?.toString().slice(0, 8).toUpperCase();

  return (
    <div className="pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header title="Dossier Patient" breadcrumb="Patients" />

      <div className="px-8 py-6 space-y-6">

        {/* Retour */}
        <button onClick={() => navigate("/admin/patients")}
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#002855] transition-colors uppercase tracking-wider">
          <ArrowLeft size={14} /> Retour au Registre
        </button>

        {/* ── HERO ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(0,40,85,0.05)", borderColor: "rgba(0,40,85,0.1)" }}>
          <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <PatientAvatar patient={patient} size="lg" />
              {isActive && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "#10b981", border: "2.5px solid white" }}>
                  <ShieldCheck size={10} className="text-white" />
                </div>
              )}
            </div>

            {/* Nom + meta */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Dossier #{shortId}</span>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: statut.bg, color: statut.color, border: `0.5px solid ${statut.color}40` }}>
                  {statut.label}
                </span>
                {patient.statutDossier && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: patient.statutDossier === "ACTIF" ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.1)", color: patient.statutDossier === "ACTIF" ? "#059669" : "#64748b" }}>
                    Dossier {patient.statutDossier === "ACTIF" ? "Actif" : "Archivé"}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-1.5" style={{ color: NAVY }}>
                {patient.prenom}{" "}
                <span style={{ color: NAVY, opacity: 0.4, fontWeight: 600 }}>{patient.nom}</span>
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                {patient.age != null && <>{patient.age} ans<span className="w-1 h-1 rounded-full bg-slate-200 inline-block" /></>}
                {patient.medecinRef && <>Suivi par <span className="font-black ml-1" style={{ color: NAVY }}>{patient.medecinRef}</span></>}
              </p>
            </div>

            <button className="text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl text-white transition-all hover:opacity-90" style={{ background: RED }}>
              Télécharger le dossier
            </button>
          </div>

          {/* Bande stats */}
          <div className="grid grid-cols-4 border-t" style={{ borderColor: "rgba(0,40,85,0.1)" }}>
            {[
              { label: "Rendez-vous", value: patient.nombreRendezVous ?? 0, icon: <Calendar size={15} />, color: "rgba(0,40,85,0.08)", iconColor: NAVY },
              { label: "Examens", value: patient.nombreExamens ?? 0, icon: <Activity size={15} />, color: "rgba(227,30,36,0.08)", iconColor: RED },
              { label: "Documents", value: patient.nombreDocuments ?? 0, icon: <FileText size={15} />, color: "rgba(245,158,11,0.1)", iconColor: "#d97706" },
              { label: "Dossier créé", value: patient.dateCreationDossier ?? "—", icon: <Hash size={15} />, color: "rgba(16,185,129,0.1)", iconColor: "#059669" },
            ].map((v, i) => (
              <div key={v.label} className={cn("px-5 py-4 flex items-center gap-3", i < 3 && "border-r border-slate-100 dark:border-slate-800")}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: v.color, color: v.iconColor }}>
                  {v.icon}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-black" style={{ color: NAVY }}>{v.value}</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{v.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTENU PRINCIPAL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Colonne gauche ── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Identité */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,40,85,0.08)" }}>
                  <User size={14} style={{ color: NAVY }} />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Informations Patient</h3>
              </div>
              <div className="p-5 space-y-2">
                <InfoRow label="Âge"          value={patient.age != null ? `${patient.age} ans` : null} />
                <InfoRow label="Date naissance" value={patient.dateNaissance} />
                <InfoRow label="Statut clinique" value={statut.label} style={{ color: statut.color, fontWeight: 900 }} />
                <InfoRow label="Statut dossier" value={patient.statutDossier === "ACTIF" ? "Actif" : "Archivé"}
                  style={{ color: patient.statutDossier === "ACTIF" ? "#059669" : "#64748b", fontWeight: 900 }} />
                <InfoRow label="Dossier créé le" value={patient.dateCreationDossier} />
                <InfoRow label="Nb. examens"  value={patient.nombreExamens} />
                <InfoRow label="Nb. documents" value={patient.nombreDocuments} />
              </div>
            </div>

            {/* Coordonnées */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Coordonnées</h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { Icon: Phone, value: patient.telephone,        label: "Téléphone" },
                  { Icon: Mail,  value: patient.email,             label: "Email"     },
                  { Icon: MapPin,value: patient.adresse,           label: "Adresse"   },
                  { Icon: User,  value: patient.personneConfiance, label: "Personne de confiance" },
                ].filter(item => item.value).map(({ Icon, value, label }) => (
                  <div key={label} className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(0,40,85,0.07)" }}>
                      <Icon size={15} style={{ color: NAVY }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5 break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Médecin référent */}
            {patient.medecinRef && (
              <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: NAVY }}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-20" style={{ background: RED }} />
                <div className="flex items-center gap-3 mb-4">
                  <HeartPulse size={18} style={{ color: RED }} />
                  <h3 className="text-sm font-black text-white">Médecin Référent</h3>
                </div>
                <div className="rounded-xl p-4 flex items-center gap-3 mb-3"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <img src={
  patient.medecinPhoto
    ? `http://localhost:8080/uploads/photos/${patient.medecinPhoto.replace(/^uploads\/photos\//, '')}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.medecinRef}`
}
                    alt={patient.medecinRef} className="w-10 h-10 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div>
                    <p className="text-sm font-black text-white">{patient.medecinRef}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Référent actif</p>
                  </div>
                </div>
                {[
                  { label: "Email",     value: patient.medecinEmail },
                  { label: "Téléphone", value: patient.medecinTelephone },
                ].filter(i => i.value).map(item => (
                  <div key={item.label} className="rounded-xl p-3 mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs font-black text-white mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Colonne droite — Historique RDV ── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Prochains / derniers RDV */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Historique des Rendez-vous</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                    {patient.nombreRendezVous ?? 0} rendez-vous enregistrés
                  </p>
                </div>
                {patient.prochainRendezVous && (
                  <div className="px-3 py-1.5 rounded-xl text-xs font-black" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                    Prochain : {patient.prochainRendezVous}
                  </div>
                )}
              </div>

              {patient.derniersRendezVous && patient.derniersRendezVous.length > 0 ? (
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {patient.derniersRendezVous.map((rdv, i) => {
                    const rdvStatut = rdvStatutConfig[rdv.statut] || rdvStatutConfig.EN_ATTENTE;
                    return (
                      <motion.div key={rdv.id || i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex gap-5">
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center gap-2 shrink-0">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                              style={{ background: i === 0 ? NAVY : "rgba(0,40,85,0.06)" }}>
                              {rdv.statut === "EFFECTUE"
                                ? <CheckCircle size={16} style={{ color: i === 0 ? "#fff" : NAVY }} />
                                : rdv.statut === "ANNULE"
                                  ? <AlertCircle size={16} style={{ color: RED }} />
                                  : <Clock size={16} style={{ color: i === 0 ? "#fff" : NAVY }} />
                              }
                            </div>
                            {i < patient.derniersRendezVous.length - 1 && (
                              <div className="flex-1 w-px min-h-[40px]" style={{ background: "rgba(0,40,85,0.08)" }} />
                            )}
                          </div>

                          {/* Contenu */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"
                                    style={{ background: rdvStatut.bg, color: rdvStatut.color }}>
                                    {rdvStatut.label}
                                  </span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                  {rdv.date}
                                </p>
                              </div>
                              {rdv.medecin && (
                                <div className="flex items-center gap-2 shrink-0">
                                 <img src={
  rdv.medecinPhoto
    ? `http://localhost:8080/uploads/photos/${rdv.medecinPhoto.replace(/^uploads\/photos\//, '')}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${rdv.medecin}`
}
  className="w-8 h-8 rounded-xl object-cover bg-slate-100 dark:bg-slate-800" alt={rdv.medecin}
  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${rdv.medecin}`; }}
/>
                                  <div>
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{rdv.medecin}</p>
                                    {rdv.lieu && <p className="text-[10px] text-slate-400 font-medium">{rdv.lieu}</p>}
                                  </div>
                                </div>
                              )}
                            </div>

                            {rdv.motif && (
                              <div className="rounded-xl px-4 py-3"
                                style={{ background: i === 0 ? "rgba(0,40,85,0.04)" : "rgba(0,0,0,0.02)" }}>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Motif</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                  {rdv.motif}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(0,40,85,0.05)" }}>
                    <Calendar size={20} style={{ color: NAVY }} />
                  </div>
                  <p className="text-sm font-black text-slate-400">Aucun rendez-vous enregistré</p>
                </div>
              )}

              <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800"
                style={{ background: "rgba(0,40,85,0.02)" }}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {patient.derniereConsultation
                    ? <>Dernière consultation : <span style={{ color: NAVY }}>{patient.derniereConsultation}</span></>
                    : "Aucune consultation passée"}
                </p>
              </div>
            </div>

            {/* Accès dossier médical complet (espace médecin) */}
            {patient.dossierMedicalId && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="p-5 rounded-2xl flex items-center justify-between"
                style={{ background: "rgba(0,40,85,0.04)", border: "1px solid rgba(0,40,85,0.1)" }}>
                <div>
                  <p className="text-sm font-black" style={{ color: NAVY }}>Dossier médical complet</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                    Les données cliniques sont confidentielles — accessibles uniquement depuis l'espace médecin.
                  </p>
                </div>
              
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}