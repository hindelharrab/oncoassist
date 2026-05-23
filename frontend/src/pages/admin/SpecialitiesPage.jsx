import { useState, useEffect } from "react";
import {
  Users, Clock, ArrowRight, Activity, Heart, Eye,
  Plus, Search, Stethoscope, TrendingUp, X, Trash2,
} from "lucide-react";
import { Header, cn } from "../../Shared";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
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
  if (n.includes("neuro"))                            return Activity;
  return Stethoscope;
};

// ── Taux d'activité mensuelle = RDV ce mois / total patients ─────────────────
const calcActivite = (spec) => {
  if (!spec.nombrePatients || spec.nombrePatients === 0) return 0;
  return Math.min(
    Math.round((spec.nombreRdvMois / spec.nombrePatients) * 100),
    100
  );
};

const activiteLabel = (pct) => {
  if (pct >= 70) return { label: "Très actif", bg: "rgba(227,30,36,0.08)",  color: RED       };
  if (pct >= 40) return { label: "Actif",      bg: "rgba(0,40,85,0.07)",    color: NAVY      };
  if (pct >= 10) return { label: "Modéré",     bg: "rgba(245,158,11,0.08)", color: "#d97706" };
  return               { label: "Faible",      bg: "rgba(16,185,129,0.08)", color: "#059669" };
};

const activiteColor = (pct) =>
  pct >= 70 ? RED : pct >= 40 ? NAVY : pct >= 10 ? "#f59e0b" : "#10b981";

// ── Badge statut ──────────────────────────────────────────────────────────────
const statutSpec = (spec) => {
  if (!spec.nombreMedecins || spec.nombreMedecins === 0)
    return { label: "Inactif",       bg: "rgba(100,116,139,0.08)", color: "#64748b" };
  if (spec.nombreRdvMois > 100)
    return { label: "Forte demande", bg: "rgba(227,30,36,0.08)",   color: RED       };
  if (spec.nombreRdvMois > 40)
    return { label: "Actif",         bg: "rgba(0,40,85,0.07)",     color: NAVY      };
  return   { label: "Disponible",   bg: "rgba(16,185,129,0.08)",  color: "#059669" };
};

const EMPTY_FORM = { nom: "", description: "", dureeConsultation: 30 };

// ── Carte spécialité ──────────────────────────────────────────────────────────
const SpecCard = ({ spec, index, onDelete, onClick }) => {
  const Icon   = specIcon(spec.nom);
  const statut = statutSpec(spec);
  const pct    = calcActivite(spec);
  const act    = activiteLabel(pct);
  const color  = activiteColor(pct);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col relative cursor-pointer"
      onClick={onClick}
    >
      {/* Glow bg */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(0,40,85,0.05)", marginTop: "-40px", marginRight: "-40px" }}
      />

      <div className="p-5 flex flex-col flex-1 relative z-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: "rgba(0,40,85,0.07)" }}
          >
            <Icon size={20} style={{ color: NAVY }} />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[9px] font-black text-slate-400 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg uppercase tracking-widest">
              #{spec.id.toString().slice(0, 4).toUpperCase()}
            </span>
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider"
              style={{ background: statut.bg, color: statut.color }}
            >
              {statut.label}
            </span>
          </div>
        </div>

        {/* Nom + description */}
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 group-hover:text-[#002855] transition-colors">
          {spec.nom}
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-5 leading-relaxed line-clamp-2">
          {spec.description || "—"}
        </p>

        {/* Stats 4 cases */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { label: "Médecins",    value: spec.nombreMedecins,   icon: Users,      suffix: "méd." },
            { label: "Durée RDV",  value: spec.dureeConsultation, icon: Clock,      suffix: "min"  },
            { label: "Patients",   value: spec.nombrePatients,    icon: Users,      suffix: ""     },
            { label: "RDV / mois", value: spec.nombreRdvMois,     icon: TrendingUp, suffix: ""     },
          ].map((s) => (
            <div key={s.label} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                {s.label}
              </p>
              <div className="flex items-center gap-1.5">
                <s.icon size={12} style={{ color: NAVY }} />
                <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                  {s.value ?? 0}
                  {s.suffix && (
                    <span className="text-[10px] font-bold text-slate-400 ml-0.5">
                      {s.suffix}
                    </span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Taux d'activité mensuelle ── */}
        <div className="mt-auto space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">

          {/* Label + % */}
          {/* Label + % */}
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <div
      className="w-1.5 h-1.5 rounded-full animate-pulse"
      style={{ background: color }}
    />
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
      Activité mensuelle
    </span>
  </div>
  <div className="flex items-center gap-1.5">
    <span
      className="text-[9px] font-black rounded-full uppercase tracking-wider whitespace-nowrap"
      style={{
        background: act.bg,
        color: act.color,
        padding: "2px 8px",        // ✅ padding horizontal plus large
        display: "inline-block",
      }}
    >
      {act.label}
    </span>
    <span className="text-xs font-black" style={{ color }}>
      {pct}%
    </span>
  </div>
</div>

          {/* Barre animée */}
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, delay: index * 0.06, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>

          {/* Sous-texte */}
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
            {spec.nombreRdvMois ?? 0} RDV ce mois ·{" "}
            {spec.nombrePatients ?? 0} patients total
          </p>

          {/* Boutons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="flex-1 h-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-white rounded-xl transition-all hover:opacity-90"
              style={{ background: NAVY }}
            >
              Détails <ArrowRight size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(spec.id); }}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:opacity-80"
              style={{ background: "rgba(227,30,36,0.08)", color: RED }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
export default function SpecialitiesPage() {
  const [search,    setSearch]    = useState("");
  const [specs,     setSpecs]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    adminSpecialiteService.getAll()
      .then(setSpecs)
      .catch(() => toast.error("Erreur chargement spécialités"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette spécialité ?")) return;
    try {
      await adminSpecialiteService.delete(id);
      setSpecs((prev) => prev.filter((s) => s.id !== id));
      toast.success("Spécialité supprimée");
    } catch {
      toast.error("Suppression échouée");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) { toast.error("Le nom est requis"); return; }
    setSaving(true);
    try {
      await adminSpecialiteService.create({
        nom:               form.nom.trim(),
        description:       form.description.trim() || null,
        dureeConsultation: form.dureeConsultation || 30,
      });
      const updated = await adminSpecialiteService.getAll();
      setSpecs(updated);
      closeModal();
      toast.success("Spécialité créée");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Création échouée";
      toast.error(typeof msg === "string" ? msg : "Création échouée");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); };

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-slate-200 bg-slate-50 text-slate-900 transition-all";
  const focusFn  = (e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px ${NAVY}15`; };
  const blurFn   = (e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; };

  const filtered = specs.filter((s) =>
    s.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-10">
      <Header title="Spécialités" breadcrumb="Services Médicaux" />
      <div className="px-8 py-6 space-y-5">

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Services Cliniques</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
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
            onClick={() => setShowModal(true)}
            className="h-10 px-6 rounded-xl text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-opacity hover:opacity-90 shrink-0"
            style={{ background: NAVY }}
          >
            <Plus size={15} /> Nouveau Service
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: `${NAVY}40`, borderTopColor: NAVY }}
              />
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Chargement…
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((spec, i) => (
              <SpecCard
                key={spec.id}
                spec={spec}
                index={i}
                onDelete={handleDelete}
                onClick={() => navigate(`/admin/specialities/${spec.id}`)}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(0,40,85,0.06)" }}
            >
              <Search size={24} style={{ color: NAVY }} />
            </div>
            <p className="font-black text-slate-700 dark:text-slate-300">Aucun service trouvé</p>
            <p className="text-sm text-slate-400 mt-1">Modifiez votre recherche</p>
          </div>
        )}
      </div>

      {/* ── Modal Création ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{ opacity: 0,    scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-5 border-b border-slate-100"
                style={{ background: "rgba(0,40,85,0.03)" }}
              >
                <div>
                  <h2 className="text-sm font-black" style={{ color: NAVY }}>Nouveau Service</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                    Créer une spécialité médicale
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                  style={{ background: "rgba(0,40,85,0.05)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreate} className="p-6 space-y-4">

                {/* Nom */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                    Nom de la spécialité *
                  </label>
                  <input
                    type="text" placeholder="ex: Cardiologie" value={form.nom} required
                    onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                    className={inputCls} onFocus={focusFn} onBlur={blurFn}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                    Description
                  </label>
                  <textarea
                    placeholder="Description du service…" value={form.description} rows={3}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className={`${inputCls} resize-none`} onFocus={focusFn} onBlur={blurFn}
                  />
                </div>

                {/* Durée */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                    Durée consultation (min)
                  </label>
                  <input
                    type="number" min="5" max="120" step="5"
                    placeholder="30"
                    value={form.dureeConsultation}
                    onChange={(e) => setForm((f) => ({
                      ...f, dureeConsultation: parseInt(e.target.value) || 30,
                    }))}
                    className={inputCls} onFocus={focusFn} onBlur={blurFn}
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button" onClick={closeModal}
                    className="flex-1 h-10 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit" disabled={saving}
                    className="flex-1 h-10 rounded-xl text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ background: NAVY }}
                  >
                    {saving ? "Enregistrement…" : "Créer"}
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