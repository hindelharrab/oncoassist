import { useEffect, useState } from "react";
import {
  ArrowLeft, Users, Clock, Calendar,
  Activity, Heart, Eye, Stethoscope, CheckCircle, Edit3, X,
} from "lucide-react";
import { Header, cn } from "../../Shared";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import adminSpecialiteService from "../../services/adminSpecialiteService";

const NAVY = "#002855";
const RED  = "#E31E24";

const specIcon = (nom) => {
  const n = (nom ?? "").toLowerCase();
  if (n.includes("cardio"))                           return Heart;
  if (n.includes("ophta"))                            return Eye;
  if (n.includes("pédia") || n.includes("pedia"))     return Users;
  if (n.includes("général") || n.includes("general")) return Activity;
  return Stethoscope;
};

const calcActivite = (spec) => {
  if (!spec.nombrePatients || spec.nombrePatients === 0) return 0;
  return Math.min(Math.round((spec.nombreRdvMois / spec.nombrePatients) * 100), 100);
};

const activiteLabel = (pct) => {
  if (pct >= 70) return { label: "Très actif", bg: "rgba(227,30,36,0.08)",  color: RED       };
  if (pct >= 40) return { label: "Actif",      bg: "rgba(0,40,85,0.07)",    color: NAVY      };
  if (pct >= 10) return { label: "Modéré",     bg: "rgba(245,158,11,0.08)", color: "#d97706" };
  return               { label: "Faible",      bg: "rgba(16,185,129,0.08)", color: "#059669" };
};

const activiteColor = (pct) =>
  pct >= 70 ? RED : pct >= 40 ? NAVY : pct >= 10 ? "#f59e0b" : "#10b981";

const statutSpec = (spec) => {
  if (!spec.nombreMedecins || spec.nombreMedecins === 0)
    return { label: "Inactif",       bg: "rgba(100,116,139,0.1)", color: "#64748b" };
  if (spec.nombreRdvMois > 100)
    return { label: "Forte demande", bg: "rgba(227,30,36,0.1)",   color: RED       };
  if (spec.nombreRdvMois > 40)
    return { label: "Actif",         bg: "rgba(0,40,85,0.07)",    color: NAVY      };
  return   { label: "Disponible",   bg: "rgba(16,185,129,0.1)",  color: "#059669" };
};

const getPhotoUrl = (photoProfil) => {
  if (!photoProfil) return null;
  if (photoProfil.startsWith("http")) return photoProfil;
  return `http://localhost:8080/uploads/photos/${photoProfil.replace(/^uploads\/photos\//, "")}`;
};

export default function SpecialityDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [spec,      setSpec]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showEdit,  setShowEdit]  = useState(false);
  const [editForm,  setEditForm]  = useState({ nom: "", description: "", dureeConsultation: 30 });
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    adminSpecialiteService.getById(id)
      .then((data) => {
        setSpec(data);
        setEditForm({
          nom:               data.nom               ?? "",
          description:       data.description       ?? "",
          dureeConsultation: data.dureeConsultation ?? 30,
        });
      })
      .catch(() => toast.error("Impossible de charger la spécialité"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.nom.trim()) { toast.error("Le nom est requis"); return; }
    setSaving(true);
    try {
      await adminSpecialiteService.update(id, {
        nom:               editForm.nom.trim(),
        description:       editForm.description.trim() || null,
        dureeConsultation: editForm.dureeConsultation || 30,
      });
      // Recharge les données fraîches
      const updated = await adminSpecialiteService.getById(id);
      setSpec(updated);
      setShowEdit(false);
      toast.success("Spécialité modifiée");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Modification échouée";
      toast.error(typeof msg === "string" ? msg : "Modification échouée");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${NAVY}40`, borderTopColor: NAVY }} />
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Chargement…</span>
      </div>
    </div>
  );

  if (!spec) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <span className="text-3xl">⚠️</span>
      <span className="text-sm font-black text-slate-400">Spécialité introuvable</span>
      <button onClick={() => navigate("/admin/specialities")}
        className="text-xs font-black uppercase px-4 py-2 rounded-xl text-white"
        style={{ background: NAVY }}>Retour</button>
    </div>
  );

  const Icon     = specIcon(spec.nom);
  const statut   = statutSpec(spec);
  const pct      = calcActivite(spec);
  const act      = activiteLabel(pct);
  const actColor = activiteColor(pct);
  const doctors  = spec.medecins ?? [];

  const kpis = [
    { label: "Médecins",   value: spec.nombreMedecins,          icon: <Users    size={15} />, color: "rgba(0,40,85,0.08)",   iconColor: NAVY      },
    { label: "Patients",   value: spec.nombrePatients,          icon: <Users    size={15} />, color: "rgba(227,30,36,0.08)", iconColor: RED       },
    { label: "RDV / mois", value: spec.nombreRdvMois,           icon: <Calendar size={15} />, color: "rgba(5,150,105,0.1)",  iconColor: "#059669" },
    { label: "Durée moy.", value: `${spec.dureeConsultation ?? 30} min`, icon: <Clock size={15} />, color: "rgba(245,158,11,0.1)", iconColor: "#d97706" },
  ];

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-slate-200 bg-slate-50 text-slate-900 transition-all";
  const focusFn  = (e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px ${NAVY}15`; };
  const blurFn   = (e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; };

  return (
    <div className="pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header title={spec.nom} breadcrumb="Spécialités" />
      <div className="px-8 py-6 space-y-6">

        {/* Retour */}
        <button
          onClick={() => navigate("/admin/specialities")}
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#002855] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} /> Retour aux spécialités
        </button>

        {/* ── HERO ── */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: "rgba(0,40,85,0.05)", borderColor: "rgba(0,40,85,0.1)" }}>

          <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">

            {/* Icône */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2"
                style={{ background: "rgba(0,40,85,0.08)", borderColor: "rgba(0,40,85,0.12)" }}>
                <Icon size={32} style={{ color: NAVY }} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#10b981", border: "2.5px solid white" }}>
                <CheckCircle size={10} className="text-white" />
              </div>
            </div>

            {/* Identité */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                  Service #{spec.id.toString().slice(0, 6).toUpperCase()}
                </span>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: statut.bg, color: statut.color, border: `0.5px solid ${statut.color}40` }}
                >
                  {statut.label}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-1.5" style={{ color: NAVY }}>
                {spec.nom}
              </h1>
              <p className="text-xs text-slate-400">{spec.description || "—"}</p>
            </div>

            {/* Bouton modifier */}
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:opacity-80 shrink-0"
              style={{ background: "rgba(0,40,85,0.07)", color: NAVY }}
            >
              <Edit3 size={14} /> Modifier
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t" style={{ borderColor: "rgba(0,40,85,0.1)" }}>
            {kpis.map((v, i) => (
              <div key={v.label}
                className={cn("px-5 py-4 flex items-center gap-3",
                  i < kpis.length - 1 && "border-r border-slate-100 dark:border-slate-800")}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: v.color, color: v.iconColor }}>
                  {v.icon}
                </div>
                <div className="flex-1">
                  <span className="text-lg font-black" style={{ color: NAVY }}>{v.value ?? 0}</span>
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

            {/* Activité mensuelle */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Activité mensuelle</h3>
              <div className="flex items-end justify-between mb-3">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black" style={{ color: actColor }}>{pct}%</span>
                  <span className="text-xs font-black text-slate-400 pb-1">des patients vus ce mois</span>
                </div>
                <span
                  className="text-[9px] font-black uppercase tracking-wider rounded-full whitespace-nowrap"
                  style={{ background: act.bg, color: act.color, padding: "3px 10px" }}
                >
                  {act.label}
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: actColor }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "RDV mois",  value: spec.nombreRdvMois ?? 0,  color: actColor   },
                  { label: "Patients",  value: spec.nombrePatients ?? 0,  color: NAVY       },
                  { label: "Médecins",  value: spec.nombreMedecins ?? 0,  color: "#059669"  },
                ].map((s) => (
                  <div key={s.label} className="text-center p-2.5 rounded-xl" style={{ background: `${s.color}10` }}>
                    <p className="text-sm font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations service */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Informations Service</h3>
                <button
                  onClick={() => setShowEdit(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                  style={{ background: "rgba(0,40,85,0.07)", color: NAVY }}
                >
                  <Edit3 size={12} />
                </button>
              </div>
              <div className="p-5 space-y-2">
                {[
                  { label: "Durée consultation", value: `${spec.dureeConsultation ?? 30} min` },
                  { label: "Équipe médicale",    value: `${spec.nombreMedecins} médecin${spec.nombreMedecins > 1 ? "s" : ""}` },
                  { label: "Secrétaires",        value: `${spec.nombreSecretaires ?? 0}` },
                  { label: "Statut",             value: statut.label, style: { color: statut.color, fontWeight: 900 } },
                ].map(({ label, value, style }) => (
                  <div key={label}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "rgba(0,40,85,0.03)" }}>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white" style={style}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite — équipe médicale */}
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

              {doctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
                  <span className="text-3xl">👨‍⚕️</span>
                  <span className="text-sm font-black">Aucun médecin assigné</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {doctors.map((doc, i) => {
                    // ✅ Taux de suivi = patients de ce médecin / total patients spécialité
                    const totalPatientsSpec = spec.nombrePatients ?? 0;
                    const suiviPct = totalPatientsSpec > 0
                      ? Math.min(Math.round((doc.nombrePatients / totalPatientsSpec) * 100), 100)
                      : 0;

                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-5 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        {/* Avatar */}
                        <img
                          src={getPhotoUrl(doc.photoProfil) ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.nom}`}
                          className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-100 object-cover shrink-0"
                          alt={doc.nom}
                        />

                        {/* Nom */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#002855] transition-colors">
                            Dr. {doc.prenom} {doc.nom}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">{spec.nom}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm font-black" style={{ color: NAVY }}>{doc.nombreRdv ?? 0}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">RDV total</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black" style={{ color: NAVY }}>{doc.nombrePatients ?? 0}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Patients</p>
                          </div>
                        </div>

                        {/* Barre taux de suivi */}
                        <div className="w-28 hidden xl:block">
                          <div className="flex justify-between text-[9px] font-black text-slate-400 mb-1">
                            <span>Part patients</span>
                            <span style={{ color: NAVY }}>{suiviPct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${suiviPct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ background: NAVY }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <div
                className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800"
                style={{ background: "rgba(0,40,85,0.02)" }}
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Total : <span style={{ color: NAVY }}>{doctors.reduce((a, d) => a + (d.nombreRdv ?? 0), 0)} RDV</span>
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Patients suivis : <span style={{ color: NAVY }}>{spec.nombrePatients ?? 0}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Modification ── */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowEdit(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{ opacity: 0,    scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header modal */}
              <div
                className="flex items-center justify-between px-6 py-5 border-b border-slate-100"
                style={{ background: "rgba(0,40,85,0.03)" }}
              >
                <div>
                  <h2 className="text-sm font-black" style={{ color: NAVY }}>Modifier le Service</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                    {spec.nom}
                  </p>
                </div>
                <button
                  onClick={() => setShowEdit(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                  style={{ background: "rgba(0,40,85,0.05)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleUpdate} className="p-6 space-y-4">

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                    Nom de la spécialité *
                  </label>
                  <input
                    type="text" value={editForm.nom} required
                    onChange={(e) => setEditForm((f) => ({ ...f, nom: e.target.value }))}
                    className={inputCls} onFocus={focusFn} onBlur={blurFn}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                    Description
                  </label>
                  <textarea
                    value={editForm.description} rows={3}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    className={`${inputCls} resize-none`} onFocus={focusFn} onBlur={blurFn}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                    Durée consultation (min)
                  </label>
                  <input
                    type="number" min="5" max="120" step="5"
                    value={editForm.dureeConsultation}
                    onChange={(e) => setEditForm((f) => ({
                      ...f, dureeConsultation: parseInt(e.target.value) || 30,
                    }))}
                    className={inputCls} onFocus={focusFn} onBlur={blurFn}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button" onClick={() => setShowEdit(false)}
                    className="flex-1 h-10 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit" disabled={saving}
                    className="flex-1 h-10 rounded-xl text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ background: NAVY }}
                  >
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}