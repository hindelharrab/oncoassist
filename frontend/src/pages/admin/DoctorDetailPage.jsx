// ── pages/admin/DoctorDetailPage.jsx ─────────────────────────────────────────
import { useState, useEffect } from "react";
import {
  ArrowLeft, Clock, FileText, Mail, Phone,
  ShieldCheck, Calendar, AlertCircle, CheckCircle,
  Users, Activity, Hash, Download, Trash2, Upload, Plus,
  GraduationCap, ScrollText, ClipboardList, File, Save,
} from "lucide-react";
import { Header, cn } from "../../Shared";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import adminMedecinService, { getPhotoUrl, getDocumentUrl } from "../../services/adminMedecinService";
import toast from "react-hot-toast";

const NAVY = "#002855";
const RED  = "#E31E24";

const JOURS_ORDER = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const JOURS_FR    = { MONDAY:"Lun", TUESDAY:"Mar", WEDNESDAY:"Mer", THURSDAY:"Jeu", FRIDAY:"Ven", SATURDAY:"Sam", SUNDAY:"Dim" };

const docTypeConfig = {
  DIPLOME: { label:"Diplôme", color:"#0284c7", bg:"rgba(14,165,233,0.1)",  Icon: GraduationCap },
  LICENCE: { label:"Licence", color:"#059669", bg:"rgba(16,185,129,0.1)",  Icon: ScrollText    },
  CONTRAT: { label:"Contrat", color:"#d97706", bg:"rgba(245,158,11,0.1)",  Icon: ClipboardList },
  AUTRE:   { label:"Autre",   color:"#64748b", bg:"rgba(100,116,139,0.1)", Icon: File          },
};

const Skeleton = ({ className }) => (
  <div className={cn("animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl", className)} />
);

const MedecinAvatar = ({ medecin }) => {
  const photoUrl = getPhotoUrl(medecin.photoProfil);
  const [err, setErr] = useState(false);
  const src = photoUrl && !err ? photoUrl
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${medecin.nom}`;
  return (
    <img src={src} onError={() => setErr(true)} alt={medecin.prenom}
      className="w-24 h-24 rounded-2xl object-cover border-2 bg-slate-50"
      style={{ borderColor: "rgba(0,40,85,0.08)" }} />
  );
};

// ── Modal ajout document ──────────────────────────────────────────────────────
const AddDocumentModal = ({ medecinId, onClose, onAdded }) => {
  const [nom, setNom]         = useState("");
  const [type, setType]       = useState("DIPLOME");
  const [fichier, setFichier] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom.trim()) return toast.error("Nom requis");
    try {
      setLoading(true);
      await adminMedecinService.addDocument(medecinId, nom, type, fichier);
      toast.success("Document ajouté !");
      onAdded(); onClose();
    } catch { toast.error("Erreur lors de l'ajout"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${NAVY}, ${RED})` }} />
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Ajouter un Document</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nom du document *</label>
            <input value={nom} onChange={e => setNom(e.target.value)} required placeholder="ex: Diplôme de Médecine"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#002855] transition-all dark:text-white" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#002855] transition-all dark:text-white">
              <option value="DIPLOME">Diplôme</option>
              <option value="LICENCE">Licence</option>
              <option value="CONTRAT">Contrat</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Fichier (optionnel)</label>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={e => setFichier(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-100 file:text-slate-600 file:cursor-pointer hover:file:bg-slate-200 transition-all" />
            <p className="text-[9px] text-slate-400 mt-1">PDF, Word, Excel, images · Max 20 MB</p>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 rounded-xl text-white text-sm font-black transition-all hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
              style={{ background: NAVY }}>
              {loading ? <><div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />Ajout…</> : "Confirmer"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
export default function DoctorDetailPage() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [doctor,      setDoctor]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showAddDoc,  setShowAddDoc]  = useState(false);
  const [dispoEdit,   setDispoEdit]   = useState(null); // null = lecture
  const [saving,      setSaving]      = useState(false);

  const fetchDoctor = async () => {
    try {
      setLoading(true); setError(null);
      const data = await adminMedecinService.getById(id);
      setDoctor(data);
    } catch (err) {
      setError(err.response?.data?.message || "Médecin introuvable.");
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (id) fetchDoctor(); }, [id]);

  const handleDeleteDoc = async (docId) => {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      await adminMedecinService.deleteDocument(id, docId);
      toast.success("Document supprimé");
      fetchDoctor();
    } catch { toast.error("Erreur lors de la suppression"); }
  };

  // Initialiser l'état édition à partir des disponibilités existantes
  const handleStartEdit = () => {
    const existing = doctor.disponibilites || [];
    const state = JOURS_ORDER.map(jour => {
      const found = existing.find(d => d.jour === jour);
      return { jour, active: !!found, heureDebut: found?.heureDebut || "09:00", heureFin: found?.heureFin || "17:00" };
    });
    setDispoEdit(state);
  };

  const handleToggleJour = (jour) =>
    setDispoEdit(prev => prev.map(d => d.jour === jour ? { ...d, active: !d.active } : d));

  const handleChangeHeure = (jour, field, value) =>
    setDispoEdit(prev => prev.map(d => d.jour === jour ? { ...d, [field]: value } : d));

  const handleSave = async () => {
    const payload = dispoEdit.filter(d => d.active)
      .map(({ jour, heureDebut, heureFin }) => ({ jour, heureDebut, heureFin }));
    try {
      setSaving(true);
      await adminMedecinService.updateDisponibilites(id, payload);
      toast.success("Disponibilités mises à jour !");
      setDispoEdit(null);
      fetchDoctor();
    } catch { toast.error("Erreur lors de la sauvegarde"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header title="Profil Médecin" breadcrumb="Médecins" />
      <div className="px-8 py-6 space-y-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 space-y-5">
            <Skeleton className="h-64 rounded-2xl" />
            <div className="grid grid-cols-2 gap-5"><Skeleton className="h-40 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></div>
          </div>
          <div className="xl:col-span-4"><Skeleton className="h-64 rounded-2xl" /></div>
        </div>
      </div>
    </div>
  );

  if (error || !doctor) return (
    <div className="pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header title="Profil Médecin" breadcrumb="Médecins" />
      <div className="px-8 py-12 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background:"rgba(227,30,36,0.08)" }}>
          <AlertCircle size={28} style={{ color:RED }} />
        </div>
        <p className="font-black text-slate-700 dark:text-slate-200 text-lg">Médecin introuvable</p>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
        <button onClick={() => navigate("/admin/doctors")} className="mt-6 px-5 py-2 rounded-xl text-white text-sm font-black" style={{ background:NAVY }}>Retour</button>
      </div>
    </div>
  );

  return (
    <div className="pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header title={`Dr. ${doctor.nom}`} breadcrumb="Profil Médecin" />

      {showAddDoc && <AddDocumentModal medecinId={id} onClose={() => setShowAddDoc(false)} onAdded={fetchDoctor} />}

      <div className="px-8 py-6 space-y-6">

        <button onClick={() => navigate("/admin/doctors")}
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#002855] transition-colors uppercase tracking-wider">
          <ArrowLeft size={14} /> Retour au Corps Médical
        </button>

        {/* ── HERO ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background:"rgba(0,40,85,0.05)", borderColor:"rgba(0,40,85,0.1)" }}>
          <div className="p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-end">
            <motion.div initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} className="relative shrink-0">
              <MedecinAvatar medecin={doctor} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background:"#10b981", border:"2px solid white" }}>
                <ShieldCheck size={11} className="text-white" />
              </div>
            </motion.div>
            <div className="flex-1 pt-2 lg:pt-0">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background:"#eef9f4", color:"#10b981", border:"0.5px solid rgba(16,185,129,0.3)" }}>Actif</span>
                {doctor.specialiteNom && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background:"rgba(0,40,85,0.07)", color:NAVY }}>{doctor.specialiteNom}</span>
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color:NAVY }}>
                Dr. {doctor.prenom}{" "}<span style={{ color:NAVY, opacity:0.4, fontWeight:600 }}>{doctor.nom}</span>
              </h1>
              {doctor.numeroOrdre && (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mt-3">
                  <Hash size={15} style={{ color:"#10b981" }} /> Ordre #{doctor.numeroOrdre}
                </div>
              )}
            </div>
           
          </div>

          <div className="grid grid-cols-4 border-t" style={{ borderColor:"rgba(0,40,85,0.1)" }}>
            {[
              { label:"Patients actifs", value:doctor.nbPatients??0,    icon:<Users size={15}/>,       color:"rgba(0,40,85,0.08)",   iconColor:NAVY      },
              { label:"RDV aujourd'hui", value:doctor.rdvAujourdhui??0, icon:<Calendar size={15}/>,    color:"rgba(227,30,36,0.08)", iconColor:RED       },
              { label:"Total RDV",       value:doctor.totalRdv??0,      icon:<Activity size={15}/>,    color:"rgba(245,158,11,0.1)", iconColor:"#d97706" },
              { label:"RDV effectués",   value:doctor.rdvEffectues??0,  icon:<CheckCircle size={15}/>, color:"rgba(16,185,129,0.1)", iconColor:"#059669" },
            ].map((v,i) => (
              <div key={v.label} className={cn("px-5 py-4 flex items-center gap-3", i<3 && "border-r border-slate-100 dark:border-slate-800")}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:v.color, color:v.iconColor }}>{v.icon}</div>
                <div>
                  <div className="text-lg font-black" style={{ color:NAVY }}>{v.value}</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{v.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 space-y-5">

            {/* ── Disponibilités ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(0,40,85,0.07)" }}>
                    <Calendar size={16} style={{ color:NAVY }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Jours de Consultation</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {dispoEdit === null
                        ? `${(doctor.disponibilites||[]).length} jour(s) configuré(s)`
                        : "Activez/désactivez les jours et ajustez les horaires"
                      }
                    </p>
                  </div>
                </div>

                {dispoEdit === null ? (
                  <button onClick={handleStartEdit}
                    className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all"
                    style={{ background:"rgba(0,40,85,0.07)", color:NAVY }}>
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setDispoEdit(null)}
                      className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
                      Annuler
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl text-white transition-all disabled:opacity-60 flex items-center gap-1.5"
                      style={{ background:NAVY }}>
                      {saving ? <><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"/>Sauvegarde…</> : <><Save size={12}/>Sauvegarder</>}
                    </button>
                  </div>
                )}
              </div>

              {/* ── Mode LECTURE : même grille que l'original ── */}
              {dispoEdit === null && (
                <div className="p-6">
                  {(doctor.disponibilites||[]).length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-400 font-black">Aucune disponibilité configurée</p>
                      <button onClick={handleStartEdit} className="mt-3 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl" style={{ background:"rgba(0,40,85,0.07)", color:NAVY }}>
                        Configurer
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                      {JOURS_ORDER.map(jour => {
                        const dispo = (doctor.disponibilites||[]).find(d => d.jour === jour);
                        return (
                          <div key={jour}
                            className="p-3 rounded-xl border text-center"
                            style={{
                              background:  dispo ? "rgba(0,40,85,0.06)" : "rgba(148,163,184,0.06)",
                              borderColor: dispo ? "rgba(0,40,85,0.15)" : "rgba(148,163,184,0.08)",
                              opacity:     dispo ? 1 : 0.45,
                            }}>
                            <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: dispo ? NAVY : "#94a3b8" }}>
                              {JOURS_FR[jour]}
                            </p>
                            {dispo ? (
                              <>
                                <Clock size={13} className="mx-auto mb-1" style={{ color:RED }} />
                                <p className="text-[8px] font-black leading-tight" style={{ color:NAVY }}>{dispo.heureDebut}</p>
                                <p className="text-[8px] font-black leading-tight" style={{ color:NAVY }}>{dispo.heureFin}</p>
                              </>
                            ) : (
                              <p className="text-[9px] font-bold text-slate-400">OFF</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Mode ÉDITION : ligne par jour avec toggle + inputs horaires ── */}
              {dispoEdit !== null && (
                <div className="p-6 space-y-2">
                  {dispoEdit.map(d => (
                    <motion.div key={d.jour} layout
                      className="rounded-xl border overflow-hidden transition-all"
                      style={{
                        background:  d.active ? "rgba(0,40,85,0.04)" : "rgba(148,163,184,0.03)",
                        borderColor: d.active ? "rgba(0,40,85,0.12)" : "rgba(148,163,184,0.1)",
                        opacity:     d.active ? 1 : 0.55,
                      }}>
                      <div className="flex items-center gap-3 px-4 py-3">

                        {/* Badge jour cliquable = toggle */}
                        <button onClick={() => handleToggleJour(d.jour)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 transition-all"
                          style={{ background: d.active ? NAVY : "#cbd5e1", color:"#fff" }}>
                          {JOURS_FR[d.jour]}
                        </button>

                        {/* Séparateur */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black" style={{ color: d.active ? NAVY : "#94a3b8" }}>
                            {{ MONDAY:"Lundi", TUESDAY:"Mardi", WEDNESDAY:"Mercredi", THURSDAY:"Jeudi", FRIDAY:"Vendredi", SATURDAY:"Samedi", SUNDAY:"Dimanche" }[d.jour]}
                          </p>
                          {!d.active && <p className="text-[9px] text-slate-400">Fermé — cliquez pour activer</p>}
                        </div>

                        {/* Inputs heures visibles seulement si actif */}
                        {d.active && (
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black text-slate-400">De</span>
                              <input type="time" value={d.heureDebut}
                                onChange={e => handleChangeHeure(d.jour,"heureDebut",e.target.value)}
                                className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black outline-none focus:border-[#002855] transition-all"
                                style={{ color:NAVY }} />
                            </div>
                            <span className="text-slate-400 font-black">–</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black text-slate-400">À</span>
                              <input type="time" value={d.heureFin}
                                onChange={e => handleChangeHeure(d.jour,"heureFin",e.target.value)}
                                className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black outline-none focus:border-[#002855] transition-all"
                                style={{ color:NAVY }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Performances + Coordonnées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background:NAVY }}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background:RED }} />
                <h4 className="text-sm font-black mb-5 text-white">Performances</h4>
                <div className="space-y-4">
                  {[
                    { label:"Patients actifs", val:String(doctor.nbPatients??0), pct:`${Math.min(100,(doctor.nbPatients??0)*5)}%` },
                    { label:"RDV effectués",   val:String(doctor.rdvEffectues??0), pct:doctor.totalRdv>0?`${Math.round((doctor.rdvEffectues/doctor.totalRdv)*100)}%`:"0%" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">{item.label}</span>
                        <span className="text-sm font-black text-white">{item.val}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width:0 }} animate={{ width:item.pct }} transition={{ duration:1, ease:"easeOut" }}
                          className="h-full rounded-full" style={{ background:"linear-gradient(to right, #E31E24, #ff6b6b)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-5">Coordonnées</h4>
                <div className="space-y-4">
                  {[{ Icon:Mail, value:doctor.email },{ Icon:Phone, value:doctor.telephone }]
                    .filter(i=>i.value).map(({ Icon, value }) => (
                    <div key={value} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(0,40,85,0.07)" }}>
                        <Icon size={16} style={{ color:NAVY }} />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 break-all">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Documents */}
          <div className="xl:col-span-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(0,40,85,0.07)" }}>
                    <FileText size={16} style={{ color:NAVY }} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Documents</h3>
                </div>
                <button onClick={() => setShowAddDoc(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80" style={{ background:NAVY }}>
                  <Plus size={13} className="text-white" />
                </button>
              </div>

              {doctor.documents && doctor.documents.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence>
                    {doctor.documents.map((doc,i) => {
                      const typeConf = docTypeConfig[doc.typeDocument] || docTypeConfig.AUTRE;
                      const { Icon: DocIcon } = typeConf;
                      return (
                        <motion.div key={doc.id||i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:10 }}
                          className="flex items-center justify-between p-3.5 rounded-xl border transition-all group"
                          style={{ background:"rgba(0,40,85,0.02)", borderColor:"rgba(0,40,85,0.06)" }}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:typeConf.bg }}>
                              <DocIcon size={16} style={{ color:typeConf.color }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{doc.nom}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background:typeConf.bg, color:typeConf.color }}>
                                  {typeConf.label}
                                </span>
                                {doc.tailleFichier && <span className="text-[9px] font-bold text-slate-400">{doc.tailleFichier}</span>}
                              </div>
                              {doc.dateAjout && <p className="text-[9px] text-slate-400 mt-0.5">{doc.dateAjout}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {doc.cheminFichier && (
                              <a href={getDocumentUrl(doc.cheminFichier)} target="_blank" rel="noreferrer"
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#002855] hover:bg-slate-100 transition-all">
                                <Download size={13} />
                              </a>
                            )}
                            <button onClick={() => handleDeleteDoc(doc.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background:"rgba(0,40,85,0.05)" }}>
                    <FileText size={20} style={{ color:NAVY, opacity:0.4 }} />
                  </div>
                  <p className="text-sm font-black text-slate-400">Aucun document</p>
                  <p className="text-[10px] text-slate-300 mt-1">Cliquez + pour ajouter</p>
                </div>
              )}

              <button onClick={() => setShowAddDoc(true)}
                className="w-full mt-4 py-3 border-2 border-dashed rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-slate-50"
                style={{ borderColor:"rgba(0,40,85,0.12)", color:NAVY }}>
                <Upload size={13} /> Déposer un Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}