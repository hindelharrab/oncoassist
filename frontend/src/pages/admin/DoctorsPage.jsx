// ── pages/admin/DoctorsPage.jsx ───────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Filter, Phone, Mail, Stethoscope,
  Trash2, AlertCircle, RefreshCw, Users, Calendar, Clock, X,
  Eye, EyeOff, FileText,
} from "lucide-react";
import { Header, Button, cn } from "../../Shared";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import adminMedecinService, { getPhotoUrl } from "../../services/adminMedecinService";
import axios from "axios";

const NAVY = "#002855";
const RED  = "#E31E24";

const JOURS_FR = {
  MONDAY:"Lun", TUESDAY:"Mar", WEDNESDAY:"Mer",
  THURSDAY:"Jeu", FRIDAY:"Ven", SATURDAY:"Sam", SUNDAY:"Dim",
};
const JOURS_ORDER = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];

const adminApi = axios.create({ baseURL: "http://localhost:8080/api" });
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Avatar ────────────────────────────────────────────────────────────────────
const MedecinAvatar = ({ medecin }) => {
  const photoUrl = getPhotoUrl(medecin.photoProfil);
  const [err, setErr] = useState(false);
  const src = photoUrl && !err ? photoUrl
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${medecin.nom}`;
  return (
    <img src={src} onError={() => setErr(true)} alt={medecin.prenom}
      className="w-14 h-14 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700" />
  );
};

// ── Modal Ajout Médecin ───────────────────────────────────────────────────────
const AddDoctorModal = ({ isOpen, onClose, onAdded }) => {
  const [specialites, setSpecialites] = useState([]);
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [form, setForm] = useState({
    nom:"", prenom:"", email:"", telephone:"",
    motDePasse:"", numeroOrdre:"", specialiteId:"",
  });

  useEffect(() => {
    if (!isOpen) return;
    adminApi.get("/specialites")
      .then(r => setSpecialites(Array.isArray(r.data) ? r.data : []))
      .catch(() => setSpecialites([]));
  }, [isOpen]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.specialiteId) return toast.error("Sélectionnez une spécialité");
    if (form.motDePasse.length < 8) return toast.error("Mot de passe : 8 caractères minimum");
    try {
      setLoading(true);
      await adminApi.post("/admin/medecins", {
        nom: form.nom, prenom: form.prenom, email: form.email,
        telephone: form.telephone, motDePasse: form.motDePasse,
        numeroOrdre: form.numeroOrdre || `ORD-${Date.now()}`,
        specialiteId: form.specialiteId,
      });
      toast.success(`Dr. ${form.prenom} ${form.nom} ajouté !`);
      setForm({ nom:"", prenom:"", email:"", telephone:"", motDePasse:"", numeroOrdre:"", specialiteId:"" });
      onAdded(); onClose();
    } catch (err) {
      toast.error(String(err.response?.data?.message || err.response?.data || "Erreur lors de l'ajout"));
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale:0.95, opacity:0, y:16 }} animate={{ scale:1, opacity:1, y:0 }}
        exit={{ scale:0.95, opacity:0, y:16 }} transition={{ type:"spring", stiffness:300, damping:28 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="h-1 w-full" style={{ background:`linear-gradient(90deg, ${NAVY}, ${RED})` }} />
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Ajouter un Médecin</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Nouveau praticien</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[{ label:"Prénom *", key:"prenom", placeholder:"Marie" }, { label:"Nom *", key:"nom", placeholder:"Dupont" }].map(f => (
              <div key={f.key}>
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                <input value={form[f.key]} onChange={set(f.key)} required placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#002855] focus:ring-2 focus:ring-[#002855]/10 transition-all dark:text-white" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={set("email")} required placeholder="m.dupont@clinique.ma"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#002855] focus:ring-2 focus:ring-[#002855]/10 transition-all dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Téléphone</label>
              <input value={form.telephone} onChange={set("telephone")} placeholder="06 12 34 56 78"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#002855] focus:ring-2 focus:ring-[#002855]/10 transition-all dark:text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">N° Ordre</label>
              <input value={form.numeroOrdre} onChange={set("numeroOrdre")} placeholder="ex: 2024-001"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#002855] focus:ring-2 focus:ring-[#002855]/10 transition-all dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Spécialité *</label>
            <select value={form.specialiteId} onChange={set("specialiteId")} required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#002855] focus:ring-2 focus:ring-[#002855]/10 transition-all dark:text-white">
              <option value="">Sélectionner une spécialité…</option>
              {specialites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
            {specialites.length === 0 && <p className="text-[9px] text-red-400 mt-1">Aucune spécialité chargée.</p>}
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Mot de passe provisoire *</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={form.motDePasse} onChange={set("motDePasse")}
                required minLength={8} placeholder="8 caractères minimum"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#002855] focus:ring-2 focus:ring-[#002855]/10 transition-all dark:text-white pr-12" />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5">Le médecin peut changer ce mot de passe depuis son espace personnel.</p>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-black transition-all hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
              style={{ background:NAVY }}>
              {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Ajout…</> : <><Plus size={16} />Confirmer l'ajout</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Carte médecin ─────────────────────────────────────────────────────────────
const DoctorCard = ({ doctor, onDelete }) => {
  const navigate = useNavigate();

  // Utiliser doctor.disponibilites (nouveau champ) pour afficher les jours
  const dispos = doctor.disponibilites || [];
  const joursActifs = dispos.map(d => d.jour);

  return (
    <motion.div layout initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.98 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:border-slate-200 dark:hover:border-slate-700 transition-all">

      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <MedecinAvatar medecin={doctor} />
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Dr. {doctor.prenom} {doctor.nom}</h3>
              {doctor.specialiteNom && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg mt-2"
                  style={{ background:"rgba(0,40,85,0.06)", color:NAVY }}>
                  <Stethoscope size={11} />
                  <span className="text-[9px] font-black uppercase tracking-wider">{doctor.specialiteNom}</span>
                </div>
              )}
            </div>
          </div>
          <div className="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0"
            style={{ background:"rgba(5,150,105,0.08)", color:"#059669" }}>Actif</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">

        {/* Disponibilités — depuis doctor.disponibilites */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Disponibilité</p>
          <div className="grid grid-cols-7 gap-1">
            {JOURS_ORDER.map(day => {
              const dispo = dispos.find(d => d.jour === day);
              return (
                <div key={day} title={dispo ? `${dispo.heureDebut} – ${dispo.heureFin}` : "Fermé"}
                  className={cn("h-9 rounded-lg flex flex-col items-center justify-center text-[8px] font-black border transition-all",
                    dispo ? "text-white border-transparent" : "bg-slate-50 dark:bg-slate-800/50 text-slate-300 border-slate-100"
                  )}
                  style={{ background: dispo ? NAVY : undefined }}>
                  <span>{JOURS_FR[day]}</span>
                
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <Mail size={13} className="text-slate-400 shrink-0" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">{doctor.email}</span>
          </div>
          {doctor.telephone && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <Phone size={13} className="text-slate-400 shrink-0" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{doctor.telephone}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background:"rgba(0,40,85,0.04)" }}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Patients actifs</p>
            <p className="text-lg font-black mt-1" style={{ color:NAVY }}>{doctor.nbPatients ?? 0}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background:"rgba(227,30,36,0.05)" }}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">RDV aujourd'hui</p>
            <p className="text-lg font-black mt-1" style={{ color:RED }}>{doctor.rdvAujourdhui ?? 0}</p>
          </div>
        </div>

        {/* Documents badge — avec icône Lucide */}
        {doctor.documents && doctor.documents.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background:"rgba(0,40,85,0.04)", border:"1px solid rgba(0,40,85,0.08)" }}>
            <FileText size={12} style={{ color:NAVY }} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {doctor.documents.length} document{doctor.documents.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <button onClick={() => navigate(`/admin/doctors/${doctor.id}`)}
          className="flex-1 h-10 rounded-xl text-white text-[10px] font-black uppercase tracking-wider transition-all hover:opacity-90"
          style={{ background:NAVY }}>
          Voir Profil
        </button>
        {/* Bouton suppression */}
        <button onClick={() => onDelete(doctor)}
          className="w-10 h-10 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all"
          title="Supprimer ce médecin">
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
};

// ── Modal confirmation suppression ────────────────────────────────────────────
const DeleteConfirmModal = ({ doctor, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
      className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-slate-800">
      <div className="h-1 w-full" style={{ background:RED }} />
      <div className="p-6 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background:"rgba(227,30,36,0.08)" }}>
          <Trash2 size={24} style={{ color:RED }} />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Supprimer le médecin ?</h3>
        <p className="text-sm text-slate-500 mb-1">
          <span className="font-black" style={{ color:NAVY }}>Dr. {doctor.prenom} {doctor.nom}</span>
        </p>
        <p className="text-[10px] text-slate-400 mb-6">
          Cette action est irréversible. Tous les rendez-vous et données associées seront supprimés.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-black transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background:RED }}>
            {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Suppression…</> : "Confirmer"}
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-pulse">
    <div className="p-5 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-100 rounded w-3/4" />
          <div className="h-5 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    </div>
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-7 gap-1">{Array(7).fill(0).map((_,i) => <div key={i} className="h-9 rounded-lg bg-slate-100" />)}</div>
      <div className="h-9 rounded-xl bg-slate-100" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 rounded-xl bg-slate-100" />
        <div className="h-16 rounded-xl bg-slate-100" />
      </div>
    </div>
  </div>
);

// ── Page principale ───────────────────────────────────────────────────────────
export default function DoctorsPage() {
  const [doctors,       setDoctors]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null); // médecin à supprimer
  const [deleting,      setDeleting]      = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await adminMedecinService.getAll();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les médecins.");
    } finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminApi.delete(`/medecins/${deleteTarget.id}`);
      toast.success(`Dr. ${deleteTarget.prenom} ${deleteTarget.nom} supprimé`);
      setDeleteTarget(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la suppression");
    } finally { setDeleting(false); }
  };

  const filtered = doctors.filter(d =>
    `${d.prenom} ${d.nom} ${d.specialiteNom || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:         doctors.length,
    rdvAujourdhui: doctors.reduce((s, d) => s + (d.rdvAujourdhui ?? 0), 0),
    patients:      doctors.reduce((s, d) => s + (d.nbPatients ?? 0), 0),
  };

  return (
    <div className="pb-10">
      <Header title="Corps Médical" breadcrumb="Médecins" />

      <AnimatePresence>
        {showAddModal && (
          <AddDoctorModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdded={fetchAll} />
        )}
        {deleteTarget && (
          <DeleteConfirmModal
            doctor={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>

      <div className="px-8 py-6">

        {/* Stats */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label:"Total médecins",  value:stats.total,         color:NAVY,      icon:<Users size={18}/> },
              { label:"Patients actifs", value:stats.patients,      color:"#059669", icon:<Users size={18}/> },
              { label:"RDV aujourd'hui", value:stats.rdvAujourdhui, color:RED,       icon:<Calendar size={18}/> },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:`${s.color}15`, color:s.color }}>{s.icon}</div>
                <div>
                  <span className="text-2xl font-black" style={{ color:s.color }}>{s.value}</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-center gap-4 mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Nom ou spécialité…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-[#002855] text-slate-900 dark:text-white placeholder:text-slate-400 transition-all" />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
           
            <button onClick={fetchAll}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#002855] hover:border-[#002855] transition-all">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 h-10 px-6 rounded-xl text-white text-[10px] font-black uppercase tracking-wider transition-all hover:opacity-90"
              style={{ background:NAVY }}>
              <Plus size={16} /> Ajouter
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {filtered.length} praticien{filtered.length > 1 ? "s" : ""}
          </span>
          {!loading && (
            <><div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{filtered.length} actifs</span></>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl mb-6"
            style={{ background:"rgba(227,30,36,0.06)", border:"1px solid rgba(227,30,36,0.15)" }}>
            <AlertCircle size={18} style={{ color:RED }} />
            <p className="text-sm font-black flex-1" style={{ color:RED }}>{error}</p>
            <button onClick={fetchAll} className="text-xs font-black px-3 py-1.5 rounded-xl"
              style={{ background:"rgba(227,30,36,0.1)", color:RED }}>Réessayer</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length:4 }).map((_,i) => <SkeletonCard key={i} />)
            : <AnimatePresence>{filtered.map(d => (
                <DoctorCard key={d.id} doctor={d} onDelete={setDeleteTarget} />
              ))}</AnimatePresence>
          }
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="font-black text-slate-700 dark:text-slate-300">Aucun médecin trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}