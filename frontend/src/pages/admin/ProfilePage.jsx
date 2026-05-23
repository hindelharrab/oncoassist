import { useState, useEffect } from "react";
import {
  User, Shield, LogOut, Camera, Save, ChevronRight,
  Loader2, Activity, Users, Calendar, FolderOpen,
} from "lucide-react";
import { Header, Input } from "../../Shared";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getProfile, updateProfile, updatePassword, updatePhoto,
} from "../../services/adminProfileService";

const NAVY = "#002855";
const RED  = "#E31E24";

const getPhotoUrl = (photoProfil) => {
  if (!photoProfil) return null;
  if (photoProfil.startsWith("http")) return photoProfil;
  return `http://localhost:8080/uploads/photos/${photoProfil.replace(/^uploads\/photos\//, "")}`;
};

// ── ACCORDION — défini HORS du composant pour éviter le re-mount ─────────────
const Accordion = ({ title, icon: Icon, id, activeTab, setActiveTab, children }) => {
  const open = activeTab === id;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => setActiveTab(open ? "" : id)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={open
              ? { background: NAVY, color: "#fff" }
              : { background: "rgba(0,40,85,0.06)", color: "#94a3b8" }}>
            <Icon size={17} />
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-white">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 90 : 0 }} className="text-slate-300 dark:text-slate-600">
          <ChevronRight size={16} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-50 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({ nom: "", prenom: "", telephone: "" });
  const [pwForm, setPwForm] = useState({
    motDePasseActuel: "", nouveauMotDePasse: "", confirmer: "",
  });

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          nom:       data.nom       ?? "",
          prenom:    data.prenom    ?? "",
          telephone: data.telephone ?? "",
        });
      })
      .catch(() => toast.error("Impossible de charger le profil"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    toast.success("Déconnecté avec succès");
    navigate("/admin/login");
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updated = await updateProfile(form);
      setProfile(updated);
      toast.success("Profil mis à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (pwForm.nouveauMotDePasse !== pwForm.confirmer) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (pwForm.nouveauMotDePasse.length < 8) {
      toast.error("Minimum 8 caractères requis");
      return;
    }
    try {
      setSaving(true);
      await updatePassword({
        motDePasseActuel:  pwForm.motDePasseActuel,
        nouveauMotDePasse: pwForm.nouveauMotDePasse,
      });
      toast.success("Mot de passe mis à jour !");
      setPwForm({ motDePasseActuel: "", nouveauMotDePasse: "", confirmer: "" });
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Mot de passe actuel incorrect");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoLoading(true);
      const updated = await updatePhoto(file);
      setProfile(updated);
      toast.success("Photo mise à jour !");
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Erreur lors de l'upload");
    } finally {
      setPhotoLoading(false);
      // Reset input pour permettre re-upload du même fichier
      e.target.value = "";
    }
  };

  if (loading) return (
    <div className="pb-10">
      <Header title="Mon Profil" breadcrumb="Paramètres" />
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="text-slate-300 animate-spin" />
      </div>
    </div>
  );

  const kpis = [
    { icon: FolderOpen, label: "Patients",      value: profile?.totalPatients    ?? 0, color: RED       },
    { icon: Activity,   label: "Médecins",      value: profile?.totalMedecins    ?? 0, color: "#7c3aed" },
    { icon: Users,      label: "Secrétaires",   value: profile?.totalSecretaires ?? 0, color: "#0ea5e9" },
  ];

  const photoUrl = getPhotoUrl(profile?.photoProfil);

  return (
    <div className="pb-10">
      <Header title="Mon Profil" breadcrumb="Paramètres" />
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* ── Colonne gauche ── */}
          <div className="xl:col-span-4 space-y-4">

            {/* Card profil */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="h-16" style={{ background: "#EEF2F7" }} />
              <div className="px-6 pb-6 flex flex-col items-center -mt-10 text-center">

                {/* Avatar + upload */}
                <div className="relative mb-4">
                  {photoLoading ? (
                    <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 shadow-lg flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-slate-400" />
                    </div>
                  ) : photoUrl ? (
                    <img
                      src={photoUrl}
                      className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 object-cover shadow-lg"
                      alt="Admin"
                    />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.prenom}${profile?.nom}`}
                      className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 shadow-lg"
                      alt="Admin"
                    />
                  )}

                  <label htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 w-7 h-7 text-white rounded-xl border-2 border-white dark:border-slate-900 flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                    style={{ background: NAVY }}>
                    <Camera size={13} />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>

                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {profile?.prenom} {profile?.nom}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: RED }}>
                  Administrateur
                </p>
                <p className="text-xs text-slate-400 mt-1">{profile?.email}</p>

                {/* Mini stats */}
                <div className="mt-5 w-full grid grid-cols-2 gap-2">
                  {kpis.slice(0, 2).map((k) => (
                    <div key={k.label} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800"
                      style={{ background: "rgba(0,40,85,0.03)" }}>
                      <p className="text-xl font-black" style={{ color: k.color }}>
                        {k.value.toLocaleString("fr-FR")}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{k.label}</p>
                    </div>
                  ))}
                </div>

                {/* Déconnexion */}
                <button type="button" onClick={handleLogout}
                  className="w-full mt-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-slate-400 border border-slate-100 dark:border-slate-800"
                  onMouseEnter={(e) => { e.currentTarget.style.background = RED; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = RED; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}>
                  <LogOut size={14} /> Déconnexion
                </button>
              </div>
            </div>

            {/* Carte vue d'ensemble */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(0,40,85,0.07)" }}>
                  <Activity size={14} style={{ color: NAVY }} />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Vue d'ensemble</h3>
              </div>
              <div className="space-y-3">
                {kpis.map((k) => {
                  const Icon = k.icon;
                  return (
                    <div key={k.label} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: "rgba(0,40,85,0.02)" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: `${k.color}15` }}>
                          <Icon size={13} style={{ color: k.color }} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{k.label}</span>
                      </div>
                      <span className="text-sm font-black" style={{ color: k.color }}>
                        {k.value.toLocaleString("fr-FR")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── Colonne droite ── */}
          <div className="xl:col-span-8">

            <Accordion title="Informations Personnelles" icon={User}
              id="personal" activeTab={activeTab} setActiveTab={setActiveTab}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Prénom"
                  value={form.prenom}
                  onChange={(e) => setForm(f => ({ ...f, prenom: e.target.value }))} />
                <Input label="Nom"
                  value={form.nom}
                  onChange={(e) => setForm(f => ({ ...f, nom: e.target.value }))} />
                <Input label="Email" type="email"
                  value={profile?.email ?? ""}
                  disabled />
                <Input label="Téléphone"
                  value={form.telephone}
                  onChange={(e) => setForm(f => ({ ...f, telephone: e.target.value }))} />
              </div>
              <div className="flex justify-end mt-5">
                <button type="button" onClick={handleSaveProfile} disabled={saving}
                  className="h-10 px-6 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: NAVY }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={15} />}
                  Enregistrer
                </button>
              </div>
            </Accordion>

            <Accordion title="Sécurité & Compte" icon={Shield}
              id="security" activeTab={activeTab} setActiveTab={setActiveTab}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Mot de passe actuel" type="password"
                  placeholder="••••••••"
                  value={pwForm.motDePasseActuel}
                  onChange={(e) => setPwForm(f => ({ ...f, motDePasseActuel: e.target.value }))} />
                <div className="hidden md:block" />
                <Input label="Nouveau mot de passe" type="password"
                  placeholder="Min. 8 caractères"
                  value={pwForm.nouveauMotDePasse}
                  onChange={(e) => setPwForm(f => ({ ...f, nouveauMotDePasse: e.target.value }))} />
                <Input label="Confirmer mot de passe" type="password"
                  placeholder="••••••••"
                  value={pwForm.confirmer}
                  onChange={(e) => setPwForm(f => ({ ...f, confirmer: e.target.value }))} />
              </div>
              <div className="mt-4 p-4 rounded-xl flex items-start gap-3 border"
                style={{ background: "rgba(0,40,85,0.05)", borderColor: "rgba(0,40,85,0.12)" }}>
                <Shield size={17} style={{ color: NAVY }} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed font-medium" style={{ color: NAVY }}>
                  Choisissez un mot de passe fort d'au moins 8 caractères.
                </p>
              </div>
              <div className="flex justify-end mt-5">
                <button type="button" onClick={handleSavePassword} disabled={saving}
                  className="h-10 px-6 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: RED }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={15} />}
                  Mettre à jour
                </button>
              </div>
            </Accordion>

          </div>
        </div>
      </div>
    </div>
  );
}