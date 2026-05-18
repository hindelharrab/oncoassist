import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Lock,
  Bell,
  Globe,
  Camera,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Shield,
} from 'lucide-react';

/* ─── Animations ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut', delay },
});

/* ════════════════════════════════════════
   COMPOSANTS UI
═══════════════════════════════════════ */
const inputClass =
  'w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:border-[#7F77DD] focus:ring-2 focus:ring-[#7F77DD]/10 transition-all placeholder:text-slate-300';

const FormField = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
      {label}
    </label>
    {children}
  </div>
);

const SectionCard = ({ title, icon: Icon, children, delay }) => (
  <motion.div
    {...fadeUp(delay)}
    className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
  >
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] flex items-center justify-center">
        <Icon size={15} className="text-[#7F77DD]" strokeWidth={1.8} />
      </div>
      <h3 className="text-[14px] font-bold text-slate-800">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </motion.div>
);

/* ════════════════════════════════════════
   PAGE PARAMÈTRES
═══════════════════════════════════════ */
export default function SecretaireSettings() {
  const [saved, setSaved] = useState(false);
  const [showMdp, setShowMdp] = useState(false);
  const [showMdpNew, setShowMdpNew] = useState(false);

  const [profil, setProfil] = useState({
    nom: 'Smali',
    prenom: 'Fatima',
    telephone: '06 12 34 56 78',
    email: 'f.smali@oncoassist.ma',
  });

  const [notifPrefs, setNotifPrefs] = useState({
    rdv: true,
    alertes: true,
    patients: true,
    dossiers: false,
  });

  const [langue, setLangue] = useState('fr');

  const setProfil_ = (k) => (e) => setProfil((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-slate-950' : 'bg-slate-200'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );

  return (
    <div className="space-y-5 pb-8">

      {/* ── En-tête ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Paramètres</h2>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">
            Gérez votre profil et vos préférences
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold transition-all shadow-sm shrink-0 ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-800 text-white hover:bg-slate-950'
          }`}
        >
          {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saved ? 'Enregistré !' : 'Enregistrer'}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Colonne gauche : profil ── */}
        <div className="space-y-5">

          {/* Avatar */}
          <motion.div
            {...fadeUp(0.05)}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] flex items-center justify-center">
                <User size={15} className="text-[#7F77DD]" strokeWidth={1.8} />
              </div>
              <h3 className="text-[14px] font-bold text-slate-800">Photo de profil</h3>
            </div>
            <div className="p-5 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-[#EEEDFE] flex items-center justify-center text-[#7F77DD] text-2xl font-black shadow-sm">
                  FS
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#D4537E] text-white rounded-xl flex items-center justify-center shadow-md hover:bg-[#c0416c] transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold text-slate-900">
                  {profil.prenom} {profil.nom}
                </p>
                <p className="text-[11px] text-[#7F77DD] font-medium mt-0.5">Secrétaire médicale</p>
              </div>
              <button className="w-full h-9 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Changer la photo
              </button>
            </div>
          </motion.div>

          {/* Infos compte */}
          <motion.div
            {...fadeUp(0.1)}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] flex items-center justify-center">
                <Shield size={15} className="text-[#7F77DD]" strokeWidth={1.8} />
              </div>
              <h3 className="text-[14px] font-bold text-slate-800">Infos du compte</h3>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Rôle', value: 'Secrétaire médicale' },
                { label: 'Identifiant', value: 'f.smali' },
                { label: 'Établissement', value: 'OncoAssist — Casablanca' },
                { label: 'Compte actif depuis', value: 'Janvier 2024' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    {item.label}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Colonne droite : formulaires ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Informations personnelles */}
          <SectionCard title="Informations personnelles" icon={User} delay={0.08}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Nom de famille">
                <input
                  className={inputClass}
                  value={profil.nom}
                  onChange={setProfil_('nom')}
                />
              </FormField>
              <FormField label="Prénom">
                <input
                  className={inputClass}
                  value={profil.prenom}
                  onChange={setProfil_('prenom')}
                />
              </FormField>
              <FormField label="Téléphone">
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`${inputClass} pl-9`}
                    value={profil.telephone}
                    onChange={setProfil_('telephone')}
                    placeholder="06 XX XX XX XX"
                  />
                </div>
              </FormField>
              <FormField label="Adresse e-mail">
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    className={`${inputClass} pl-9`}
                    value={profil.email}
                    onChange={setProfil_('email')}
                  />
                </div>
              </FormField>
            </div>
          </SectionCard>

          {/* Sécurité */}
          <SectionCard title="Sécurité — Mot de passe" icon={Lock} delay={0.12}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Mot de passe actuel">
                <div className="relative">
                  <input
                    type={showMdp ? 'text' : 'password'}
                    className={`${inputClass} pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowMdp((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showMdp ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </FormField>
              <FormField label="Nouveau mot de passe">
                <div className="relative">
                  <input
                    type={showMdpNew ? 'text' : 'password'}
                    className={`${inputClass} pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowMdpNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showMdpNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </FormField>
              <FormField label="Confirmer le mot de passe">
                <input
                  type="password"
                  className={inputClass}
                  placeholder="••••••••"
                />
              </FormField>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.
            </p>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title="Préférences de notifications" icon={Bell} delay={0.16}>
            <div className="space-y-4">
              {[
                { key: 'rdv',      label: 'Rendez-vous',              desc: 'Créations, modifications et annulations de RDV' },
                { key: 'alertes',  label: 'Alertes médicales',        desc: 'Urgences et dossiers à valider rapidement' },
                { key: 'patients', label: 'Nouveaux patients',        desc: 'Admissions et mises à jour de dossiers' },
                { key: 'dossiers', label: 'Mises à jour de dossiers', desc: 'Examens et résultats disponibles' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">{pref.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{pref.desc}</p>
                  </div>
                  <ToggleSwitch
                    checked={notifPrefs[pref.key]}
                    onChange={(v) => setNotifPrefs((p) => ({ ...p, [pref.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Langue */}
          <SectionCard title="Langue et région" icon={Globe} delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Langue de l'interface">
                <select
                  className={inputClass}
                  value={langue}
                  onChange={(e) => setLangue(e.target.value)}
                >
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </FormField>
              <FormField label="Fuseau horaire">
                <select className={inputClass}>
                  <option>Africa/Casablanca (GMT+1)</option>
                  <option>Europe/Paris (GMT+2)</option>
                </select>
              </FormField>
            </div>
          </SectionCard>

          {/* Bouton Enregistrer bas */}
          <motion.div {...fadeUp(0.24)} className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 h-11 px-8 rounded-xl text-[13px] font-semibold transition-all shadow-sm ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-950 text-white hover:bg-slate-950'
              }`}
            >
              {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {saved ? 'Modifications enregistrées !' : 'Enregistrer les modifications'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}