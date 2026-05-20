import { useState } from "react";
import { User, Shield, Bell, LogOut, Camera, Save, ChevronRight } from "lucide-react";
import { Header, Input, cn } from "../../Shared";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NAVY = "#002855";
const RED  = "#E31E24";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    toast.success("Déconnecté avec succès");
    navigate("/admin/login");
  };

  const Accordion = ({ title, icon: Icon, id, children }) => {
    const open = activeTab === id;
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-3">
        <button
          onClick={() => setActiveTab(open ? "" : id)}
          className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={
                open
                  ? { background: NAVY, color: "#fff" }
                  : { background: "rgba(0,40,85,0.06)", color: "#94a3b8" }
              }
            >
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

  return (
    <div className="pb-10">
      <Header title="Mon Profil" breadcrumb="Paramètres" />
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* ── Colonne gauche ── */}
          <div className="xl:col-span-4 space-y-4">

            {/* Card profil */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">

           
              {/* Bandeau couleur gris bleuté clair */}
<div className="h-16" style={{ background: "#EEF2F7" }} />

              <div className="px-6 pb-6 flex flex-col items-center -mt-10 text-center">
                <div className="relative mb-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan"
                    className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 shadow-lg"
                    alt="Admin"
                  />
                  <button
                    className="absolute bottom-0 right-0 w-7 h-7 text-white rounded-xl border-2 border-white dark:border-slate-900 flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                    style={{ background: NAVY }}
                  >
                    <Camera size={13} />
                  </button>
                </div>

                <h2 className="text-base font-black text-slate-900 dark:text-white">Hassan Admin</h2>
                <p
                  className="text-[10px] font-black uppercase tracking-widest mt-1"
                  style={{ color: RED }}
                >
                  Directeur de Clinique
                </p>

                {/* Mini stats */}
                <div className="mt-5 w-full grid grid-cols-2 gap-2">
                  {[
                    { val:"1.2k", label:"RDV Gérés",     accent: NAVY },
                    { val:"24",   label:"Membres Staff",  accent: "#059669" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800"
                      style={{ background: "rgba(0,40,85,0.03)" }}
                    >
                      <p className="text-lg font-black" style={{ color: s.accent }}>{s.val}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="w-full mt-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-slate-400 hover:text-white border border-slate-100 dark:border-slate-800 hover:border-transparent"
                  style={{ "--hover-bg": RED }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = RED; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = RED; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}
                >
                  <LogOut size={14} /> Déconnexion
                </button>
              </div>
            </div>

            {/* Stockage cloud — fond navy */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: NAVY }}
            >
              {/* Accent rouge */}
              <div
                className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-30"
                style={{ background: RED }}
              />
              <h3 className="text-sm font-black text-white mb-4">Stockage Cloud</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-wider">
                  <span className="text-white/40">Dossiers Médicaux</span>
                  <span className="text-white">85%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width:"85%", background: RED }}
                  />
                </div>
                <p className="text-[10px] text-white/30 leading-relaxed font-medium">
                  Pensez à archiver les dossiers de plus de 5 ans.
                </p>
              </div>

              {/* Stats stockage */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                  { label:"Utilisé",     value:"8.5 Go"  },
                  { label:"Disponible",  value:"1.5 Go"  },
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

          {/* ── Colonne droite : accordéons ── */}
          <div className="xl:col-span-8">

            {/* Informations personnelles */}
            <Accordion title="Informations Personnelles" icon={User} id="personal">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Prénom"    defaultValue="Hassan" />
                <Input label="Nom"       defaultValue="Admin"  />
                <Input label="Email"     type="email"    defaultValue="admin@homecare.ma" />
                <Input label="Téléphone" defaultValue="06 00 00 00 00" />
              </div>
              <div className="flex justify-end mt-5">
                <button
                  onClick={() => toast.success("Profil mis à jour !")}
                  className="h-10 px-6 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: NAVY }}
                >
                  <Save size={15} /> Enregistrer
                </button>
              </div>
            </Accordion>

            {/* Sécurité */}
            <Accordion title="Sécurité & Compte" icon={Shield} id="security">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Mot de passe actuel"    type="password" placeholder="••••••••" />
                <div className="hidden md:block" />
                <Input label="Nouveau mot de passe"   type="password" placeholder="Min. 8 caractères" />
                <Input label="Confirmer mot de passe" type="password" placeholder="••••••••" />
              </div>
              <div
                className="mt-4 p-4 rounded-xl flex items-start gap-3 border"
                style={{ background:"rgba(0,40,85,0.05)", borderColor:"rgba(0,40,85,0.12)" }}
              >
                <Shield size={17} style={{ color: NAVY }} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed font-medium" style={{ color: NAVY }}>
                  L'authentification à deux facteurs est activée. Un code sera envoyé à votre téléphone à chaque connexion.
                </p>
              </div>
              <div className="flex justify-end mt-5">
                <button
                  onClick={() => toast.success("Mot de passe mis à jour !")}
                  className="h-10 px-6 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: RED }}
                >
                  <Save size={15} /> Mettre à jour
                </button>
              </div>
            </Accordion>

            {/* Notifications */}
            <Accordion title="Notifications & Alertes" icon={Bell} id="notifs">
              <div className="space-y-3">
                {[
                  { label:"Nouveaux rendez-vous",  desc:"Alerte nouvelle admission",     on:true  },
                  { label:"Annulations",            desc:"Avertir en cas de désistement", on:true  },
                  { label:"Rapports hebdomadaires", desc:"Bilan performance lundi",       on:false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800"
                    style={{ background:"rgba(0,40,85,0.02)" }}
                  >
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{item.desc}</p>
                    </div>
                    <div
                      className="w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors"
                      style={{ background: item.on ? NAVY : "#e2e8f0" }}
                    >
                      <div
                        className="w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                        style={{ transform: item.on ? "translateX(20px)" : "translateX(0)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>

          </div>
        </div>
      </div>
    </div>
  );
}