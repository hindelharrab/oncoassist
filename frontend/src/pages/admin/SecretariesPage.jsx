import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  UserPlus, Trash2, Mail, Phone, Search, X,
  Stethoscope, Heart, Brain, Baby, Bone, Eye, Wind, Activity,
  ChevronDown, CheckCircle as CheckCircleIcon,
} from "lucide-react";
import { Header, cn } from "../../Shared";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import adminSecretaireService from "../../services/adminSecretaireService";

const NAVY = "#002855";
const RED  = "#E31E24";

const SpecialiteIcon = ({ nom, size = 14 }) => {
  const n = (nom ?? "").toLowerCase();
  if (n.includes("cardio"))                           return <Heart    size={size} />;
  if (n.includes("neuro"))                            return <Brain    size={size} />;
  if (n.includes("pédia") || n.includes("pedia"))     return <Baby     size={size} />;
  if (n.includes("ortho"))                            return <Bone     size={size} />;
  if (n.includes("ophta"))                            return <Eye      size={size} />;
  if (n.includes("pneumo"))                           return <Wind     size={size} />;
  if (n.includes("général") || n.includes("general")) return <Activity size={size} />;
  return <Stethoscope size={size} />;
};

const specialiteColor = (nom) => {
  const n = (nom ?? "").toLowerCase();
  if (n.includes("cardio"))                           return { bg: "rgba(239,68,68,0.08)",  color: "#dc2626" };
  if (n.includes("neuro"))                            return { bg: "rgba(139,92,246,0.08)", color: "#7c3aed" };
  if (n.includes("pédia") || n.includes("pedia"))     return { bg: "rgba(251,146,60,0.08)", color: "#ea580c" };
  if (n.includes("ortho"))                            return { bg: "rgba(20,184,166,0.08)",  color: "#0d9488" };
  if (n.includes("ophta"))                            return { bg: "rgba(14,165,233,0.08)",  color: "#0284c7" };
  if (n.includes("pneumo"))                           return { bg: "rgba(100,116,139,0.08)", color: "#475569" };
  return                                                     { bg: "rgba(0,40,85,0.07)",     color: NAVY      };
};

// ── Select avec portal + scroll natif ────────────────────────────────────────
function SpecialiteSelect({ specialites, value, onChange }) {
  const [open,      setOpen]      = useState(false);
  const [dropStyle, setDropStyle] = useState({});
  const triggerRef                = useRef(null);
  const selected                  = specialites.find((s) => s.id === value);
  const spCol                     = specialiteColor(selected?.nom);

  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropStyle({
        top:   rect.bottom + window.scrollY + 4,
        left:  rect.left   + window.scrollX,
        width: rect.width,
      });
    }
    setOpen(true);
  };

  return (
    <div>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openDropdown())}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          padding: "10px 12px",
          borderRadius: "12px",
          border: `1px solid ${open ? NAVY : "#e2e8f0"}`,
          background: "#f8fafc",
          cursor: "pointer",
          boxShadow: open ? `0 0 0 3px ${NAVY}15` : "none",
          transition: "all 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 8, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: selected ? spCol.bg : "rgba(0,40,85,0.07)",
            color: selected ? spCol.color : "#94a3b8",
          }}>
            <SpecialiteIcon nom={selected?.nom} size={12} />
          </div>
          <span style={{
            fontSize: 12, fontWeight: 900,
            color: selected ? spCol.color : "#94a3b8",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {selected ? selected.nom : "Aucune spécialité"}
          </span>
        </div>
        <ChevronDown
          size={14}
          style={{
            color: "#94a3b8", flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* Portal dropdown */}
      {open && createPortal(
        <>
          {/* Overlay */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 99998,
              background: "transparent",
            }}
          />

          {/* Dropdown — position absolute sur document */}
          <div
            style={{
              position:        "absolute",
              top:             dropStyle.top,
              left:            dropStyle.left,
              width:           dropStyle.width,
              zIndex:          99999,
              background:      "#ffffff",
              borderRadius:    "12px",
              border:          "1px solid #e2e8f0",
              boxShadow:       "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Option aucune — fixe, hors scroll */}
            <div style={{ padding: "6px 6px 0 6px" }}>
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 12px", borderRadius: "8px", border: "none",
                  cursor: "pointer", textAlign: "left",
                  background: value === "" ? "#f1f5f9" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (value !== "") e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { if (value !== "") e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,40,85,0.07)", color: "#94a3b8",
                }}>
                  <Stethoscope size={12} />
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 900, color: "#94a3b8",
                  textTransform: "uppercase", letterSpacing: "0.05em", flex: 1,
                }}>
                  Aucune spécialité
                </span>
                {value === "" && <CheckCircleIcon size={14} style={{ color: NAVY }} />}
              </button>
            </div>

            {/* Séparateur */}
            <div style={{ height: 1, background: "#f1f5f9", margin: "6px 0" }} />

            {/* ── Zone scrollable ── */}
            <div
              style={{
                height:         "180px",   /* hauteur fixe — force le scroll */
                overflowY:      "scroll",  /* scroll toujours visible */
                overflowX:      "hidden",
                padding:        "0 6px 6px 6px",
                scrollbarWidth: "thin",
                scrollbarColor: `${NAVY}40 #f1f5f9`,
              }}
            >
              {specialites.map((sp) => {
                const col      = specialiteColor(sp.nom);
                const isActive = value === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => { onChange(sp.id); setOpen(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 12px", borderRadius: "8px", border: "none",
                      cursor: "pointer", textAlign: "left", marginBottom: "2px",
                      background: isActive ? col.bg : "transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = isActive ? col.bg : "transparent"; }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: `${col.color}15`, color: col.color,
                    }}>
                      <SpecialiteIcon nom={sp.nom} size={13} />
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 900, flex: 1,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      color: isActive ? col.color : "#475569",
                    }}>
                      {sp.nom}
                    </span>
                    {isActive && (
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: col.color,
                      }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              padding: "6px 16px 8px",
              borderTop: "1px solid #f1f5f9",
              background: "rgba(0,40,85,0.02)",
              borderRadius: "0 0 12px 12px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{
                fontSize: 9, fontWeight: 900, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {specialites.length} spécialité{specialites.length > 1 ? "s" : ""}
              </span>
              {value && (
                <button
                  type="button"
                  onClick={() => { onChange(""); setOpen(false); }}
                  style={{
                    fontSize: 9, fontWeight: 900, background: "none", border: "none",
                    cursor: "pointer", color: RED, textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

const EMPTY_FORM = {
  prenom: "", nom: "", email: "",
  motDePasse: "", telephone: "", specialiteId: "",
};

export default function SecretariesPage() {
  const [search,      setSearch]      = useState("");
  const [secretaries, setSecretaries] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    adminSecretaireService.getAll()
      .then(setSecretaries)
      .catch(() => toast.error("Erreur chargement secrétaires"))
      .finally(() => setLoading(false));

    adminSecretaireService.getAllSpecialites()
      .then(setSpecialites)
      .catch((err) => console.error("❌ Erreur spécialités :", err));
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      await adminSecretaireService.delete(id);
      setSecretaries((prev) => prev.filter((s) => s.id !== id));
      toast.success("Secrétaire supprimé·e");
    } catch {
      toast.error("Suppression échouée");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.prenom || !form.nom || !form.email || !form.motDePasse) {
      toast.error("Remplissez tous les champs obligatoires");
      return;
    }
    if (form.motDePasse.length < 8) {
      toast.error("Mot de passe : 8 caractères minimum");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        prenom:       form.prenom.trim(),
        nom:          form.nom.trim(),
        email:        form.email.trim().toLowerCase(),
        motDePasse:   form.motDePasse,
        telephone:    form.telephone.trim() || null,
        role:         "SECRETAIRE",
        specialiteId: form.specialiteId || null,
      };
      await adminSecretaireService.create(payload);
      const updated = await adminSecretaireService.getAll();
      setSecretaries(updated);
      closeModal();
      toast.success("Secrétaire ajouté·e avec succès");
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data ?? "Création échouée";
      toast.error(typeof msg === "string" ? msg : "Création échouée");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); };

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white transition-all";
  const focusFn  = (e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px ${NAVY}15`; };
  const blurFn   = (e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; };

  const filtered = secretaries.filter((s) =>
    `${s.prenom} ${s.nom} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-10 bg-slate-50 dark:bg-slate-950">
      <Header title="Personnel Administratif" breadcrumb="Secrétaires" />
      <div className="px-8 py-6">

        {/* Toolbar */}
        <div
          className="flex flex-col md:flex-row items-center gap-4 mb-6 p-4 rounded-2xl border shadow-sm bg-white dark:bg-slate-900"
          style={{ borderColor: "rgba(0,40,85,0.08)" }}
        >
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un membre…"
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-transparent transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              onFocus={(e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px ${NAVY}20`; }}
              onBlur={(e)  => { e.target.style.borderColor = "transparent"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="h-10 px-6 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
            style={{ background: NAVY }}
          >
            <UserPlus size={16} /> Ajouter un Membre
          </button>
        </div>

        {/* Table */}
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden"
          style={{ borderColor: "rgba(0,40,85,0.08)" }}
        >
          <div
            className="hidden md:grid grid-cols-[1.5fr_2fr_1.5fr_1fr_80px] px-6 py-3.5 border-b"
            style={{ background: "rgba(0,40,85,0.03)", borderColor: "rgba(0,40,85,0.08)" }}
          >
            {["Membre", "Coordonnées", "Spécialité", "RDV Gérés", "Action"].map((h, i) => (
              <span
                key={h}
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest text-slate-400",
                  i === 4 && "text-right"
                )}
              >
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: `${NAVY}40`, borderTopColor: NAVY }}
                />
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Chargement…</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <span className="text-2xl">🔍</span>
              <span className="text-sm font-black text-slate-400">Aucun résultat trouvé</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((sec, idx) => {
                const spColor = specialiteColor(sec.specialiteNom);
                return (
                  <motion.div
                    key={sec.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/admin/secretaries/${sec.id}`)}
                    className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr_1.5fr_1fr_80px] items-center gap-4 px-6 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    {/* Membre */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={
                            adminSecretaireService.getPhotoUrl(sec.photoProfil) ??
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${sec.nom}`
                          }
                          alt=""
                          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border object-cover"
                          style={{ borderColor: "rgba(0,40,85,0.08)" }}
                        />
                        <div
                          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900"
                          style={{ background: "#10b981" }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black" style={{ color: NAVY }}>
                          {sec.prenom} {sec.nom}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          {sec.role ?? "SECRETAIRE"}
                        </p>
                      </div>
                    </div>

                    {/* Coordonnées */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Mail size={12} style={{ color: NAVY, opacity: 0.5 }} />
                        {sec.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Phone size={12} style={{ color: NAVY, opacity: 0.5 }} />
                        {sec.telephone || "—"}
                      </div>
                    </div>

                    {/* Spécialité */}
                    <div>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border"
                        style={{ borderColor: "rgba(0,40,85,0.08)", background: spColor.bg }}
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${spColor.color}18`, color: spColor.color }}
                        >
                          <SpecialiteIcon nom={sec.specialiteNom} size={13} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black leading-tight" style={{ color: spColor.color }}>
                            {sec.specialiteNom || "Non assignée"}
                          </p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Spécialité</p>
                        </div>
                      </div>
                    </div>

                    {/* RDV */}
                    <div>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black"
                        style={{ background: "rgba(0,40,85,0.07)", color: NAVY }}
                      >
                        <span className="text-sm font-black">{sec.totalRendezVousGeres ?? 0}</span> RDV
                      </span>
                    </div>

                    {/* Action */}
                    <div
                      className="flex items-center justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleDelete(e, sec.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                        style={{ background: "rgba(227,30,36,0.08)", color: RED }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Ajout ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md"
              style={{ overflow: "visible" }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-5 border-b border-slate-100 rounded-t-2xl"
                style={{ background: "rgba(0,40,85,0.03)" }}
              >
                <div>
                  <h2 className="text-sm font-black" style={{ color: NAVY }}>Nouveau Membre</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                    Ajouter une secrétaire médicale
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

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "prenom", label: "Prénom *", ph: "Julie" },
                    { key: "nom",    label: "Nom *",    ph: "Dumas" },
                  ].map(({ key, label, ph }) => (
                    <div key={key}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                        {label}
                      </label>
                      <input
                        type="text" placeholder={ph} value={form[key]} required
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className={inputCls} onFocus={focusFn} onBlur={blurFn}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Email *</label>
                  <input
                    type="email" placeholder="j.dumas@clinique.fr" value={form.email} required
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputCls} onFocus={focusFn} onBlur={blurFn}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                    Mot de passe * (min. 8 caractères)
                  </label>
                  <input
                    type="password" placeholder="••••••••" value={form.motDePasse} required minLength={8}
                    onChange={(e) => setForm((f) => ({ ...f, motDePasse: e.target.value }))}
                    className={inputCls} onFocus={focusFn} onBlur={blurFn}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Téléphone</label>
                  <input
                    type="tel" placeholder="06 12 34 56 78" value={form.telephone}
                    onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                    className={inputCls} onFocus={focusFn} onBlur={blurFn}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                    Spécialité
                  </label>
                  <SpecialiteSelect
                    specialites={specialites}
                    value={form.specialiteId}
                    onChange={(val) => setForm((f) => ({ ...f, specialiteId: val }))}
                  />
                </div>

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
                    {saving ? "Enregistrement…" : "Créer le compte"}
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