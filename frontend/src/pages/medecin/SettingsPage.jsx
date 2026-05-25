import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { medecinService } from '../../services/medecinService';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import axiosInstance from '../../services/axiosInstance';
import {
  User, Lock, Shield, Globe, Save, CheckCircle2,
  Building2, Database, Camera, Eye, EyeOff,
  MapPin, Phone, Mail, FileText, Award, Clock,
  AlertCircle, CheckCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:8080';

const SettingsPage = () => {
  const { theme, setTheme } = useSettings();
  const { user, login, getInitiales } = useAuth();

  const [activeTab,    setActiveTab]    = useState('profil');
  const [isSaved,      setIsSaved]      = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [photoFile,    setPhotoFile]    = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState('');

  const [doctorInfo, setDoctorInfo] = useState({
    nom: '', prenom: '', specialite: '', numOrdre: '',
    email: '', tel: '', photoProfil: ''
  });

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass,  setShowPass]  = useState({ current: false, newPass: false, confirm: false });
  const [passStatus,  setPassStatus]  = useState(null);
  const [passMessage, setPassMessage] = useState('');
  const [savingPass,  setSavingPass]  = useState(false);

  useEffect(() => {
    const loadProfil = async () => {
      try {
        if (!user?.id) return;
        const res = await medecinService.findById(user.id);
        const medecin = res.data;
        setDoctorInfo({
          nom:         medecin.nom           || user.nom    || '',
          prenom:      medecin.prenom        || user.prenom || '',
          specialite:  medecin.specialiteNom || '',
          numOrdre:    medecin.numeroOrdre   || '',
          email:       medecin.email         || user.email  || '',
          tel:         medecin.telephone     || '',
          photoProfil: medecin.photoProfil   || '',
        });
        if (medecin.photoProfil) {
          const fileName = medecin.photoProfil.split('/').pop();
          const photoUrl = `${API_BASE}/uploads/${fileName}?t=${Date.now()}`;
          setPreviewPhoto(photoUrl);
          login({ ...user, photoProfil: photoUrl });
        }
      } catch (err) {
        console.error('Erreur chargement profil :', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfil();
  }, [user?.id]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const localPreview = URL.createObjectURL(file);
    setPreviewPhoto(localPreview);
    login({ ...user, photoProfil: localPreview });
  };

  const handleSave = async () => {
    try {
      const payload = { nom: doctorInfo.nom, prenom: doctorInfo.prenom, telephone: doctorInfo.tel };
      const res = await medecinService.modifierProfil(user.id, payload, photoFile);
      const photoUrl = res.data.photoProfil
        ? `${API_BASE}/uploads/${res.data.photoProfil.split('/').pop()}?t=${Date.now()}`
        : user.photoProfil;
      login({ ...user, nom: res.data.nom, prenom: res.data.prenom, photoProfil: photoUrl });
      if (res.data.photoProfil) {
        setPreviewPhoto(photoUrl);
        setDoctorInfo(prev => ({ ...prev, photoProfil: res.data.photoProfil }));
      }
      setPhotoFile(null);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Impossible de sauvegarder.');
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setPassStatus('error'); setPassMessage('Tous les champs sont requis.'); return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPassStatus('error'); setPassMessage('Les mots de passe ne correspondent pas.'); return;
    }
    if (passwords.newPass.length < 8) {
      setPassStatus('error'); setPassMessage('Minimum 8 caractères requis.'); return;
    }
    setSavingPass(true); setPassStatus(null);
    try {
      await axiosInstance.put(`/medecins/${user.id}/password`, {
        ancienMotDePasse:  passwords.current,
        nouveauMotDePasse: passwords.newPass,
      });
      setPassStatus('success');
      setPassMessage('Mot de passe modifié avec succès.');
      setPasswords({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setPassStatus(null), 4000);
    } catch (err) {
      setPassStatus('error');
      setPassMessage(err.response?.data?.message || 'Mot de passe actuel incorrect.');
    } finally {
      setSavingPass(false);
    }
  };

  const menuItems = [
    { id: 'profil',      icon: User,      label: 'Profil Praticien' },
    { id: 'clinique',    icon: Building2, label: 'Établissement'    },
    { id: 'securite',    icon: Shield,    label: 'Sécurité'         },
   
  ];

  const inputActive   = "w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold text-slate-800 outline-none focus:border-pink-300 transition-all";
  const inputDisabled = "w-full px-3 py-2 bg-slate-50/50 border border-slate-50 rounded-xl text-[12px] font-bold text-slate-300 cursor-not-allowed";

  if (loading) return (
    <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400">
      Chargement du profil...
    </div>
  );

  return (
    <div className="h-full flex flex-col p-2 lg:p-4 bg-white overflow-hidden">
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col lg:flex-row h-full overflow-hidden">

        {/* ── SIDEBAR ── */}
        <div className="w-full lg:w-60 bg-slate-50/50 border-r border-slate-100 flex flex-col shrink-0">
          <div className="p-5 border-b border-slate-100">
            <h1 className="text-base font-black text-slate-900 tracking-tight uppercase">Paramètres</h1>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">Configuration du compte</p>
          </div>

          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeTab === item.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                }`}>
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Version</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-black text-slate-700">v3.8.2-stable</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 lg:px-8 lg:pt-5 lg:pb-8">

            {/* ══ PROFIL ══ */}
            {activeTab === 'profil' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4">

                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Profil du Praticien</h2>
                  <p className="text-slate-400 text-[11px] mt-0.5">Informations authentifiées pour votre activité médicale.</p>
                </div>

                {/* Photo + identité */}
                <div className="flex items-center gap-5 pb-4 border-b border-slate-100">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-lg overflow-hidden border border-slate-100">
                      {previewPhoto
                        ? <img src={previewPhoto} alt="Profil" className="w-full h-full object-cover" />
                        : getInitiales()}
                    </div>
                    <input type="file" accept="image/png,image/jpeg,image/webp"
                      className="hidden" id="photo-upload" onChange={handlePhotoChange} />
                    <label htmlFor="photo-upload"
                      className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 text-white rounded-xl border-2 border-white shadow-md hover:scale-110 transition-all cursor-pointer">
                      <Camera size={11} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {doctorInfo.prenom} {doctorInfo.nom}
                    </h3>
                    <p className="text-[10px] text-pink-500 font-black uppercase tracking-widest mt-0.5">
                      {doctorInfo.specialite || 'Spécialité non définie'}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium">N° Ordre : {doctorInfo.numOrdre || '—'}</p>
                    {photoFile && (
                      <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest mt-1 block">
                        ⚠ Photo non sauvegardée
                      </span>
                    )}
                  </div>
                </div>

                {/* Champs */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nom</label>
                      <input type="text" value={doctorInfo.nom}
                        onChange={(e) => setDoctorInfo({ ...doctorInfo, nom: e.target.value })}
                        className={inputActive} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prénom</label>
                      <input type="text" value={doctorInfo.prenom}
                        onChange={(e) => setDoctorInfo({ ...doctorInfo, prenom: e.target.value })}
                        className={inputActive} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Téléphone</label>
                    <input type="tel" value={doctorInfo.tel}
                      onChange={(e) => setDoctorInfo({ ...doctorInfo, tel: e.target.value })}
                      className={inputActive} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">N° d'Ordre</label>
                    <input type="text" value={doctorInfo.numOrdre} disabled className={inputDisabled} />
                    <p className="text-[9px] text-slate-300 italic">Non modifiable. Contactez le support.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Spécialité</label>
                    <input type="text" value={doctorInfo.specialite} disabled className={`${inputDisabled} uppercase`} />
                    <p className="text-[9px] text-slate-300 italic">Non modifiable. Contactez le support.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Professionnel</label>
                    <input type="email" value={doctorInfo.email} disabled className={inputDisabled} />
                    <p className="text-[9px] text-slate-300 italic">Non modifiable. Contactez le support.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ ÉTABLISSEMENT ══ */}
            {activeTab === 'clinique' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Établissement</h2>
                  <p className="text-slate-400 text-[11px] mt-0.5">Informations de votre centre médical.</p>
                </div>

                <div className="bg-gradient-to-br bg-slate-50/50 to-white border border-gray-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-pink-100">
                    <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                      <Building2 size={16} className="text-pink-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Centre OncoAssist</h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Centre Spécialisé en Oncologie Mammaire</p>
                    </div>
                  </div>

                  {[
                    { icon: MapPin, label: 'Adresse',       value: '12 Rue Ibn Sina, Casablanca 20000, Maroc' },
                    { icon: Phone,  label: 'Téléphone',     value: '+212 522 000 000'                         },
                    { icon: Mail,   label: 'Email',         value: 'contact@oncoassist.ma'                    },
                    { icon: Clock,  label: 'Horaires',      value: 'Lun–Ven : 08h–18h | Sam : 08h–13h'       },
                    { icon: Award,  label: 'Accréditation', value: 'HAS Niveau A — ISO 9001:2015'             },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-white border border-pink-100 flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon size={12} className="text-pink-400" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-[11px] font-bold text-slate-700 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Documents officiels</p>
                  {[
                    { name: 'Agrément Ministère de la Santé',  date: "Valide jusqu'au 31/12/2026"    },
                    { name: 'Certificat ISO 9001:2015',        date: "Valide jusqu'au 15/06/2025"  },
                    { name: 'Assurance Responsabilité Civile', date: 'Renouvelé le 01/01/2024'  },
                    { name: 'Convention CNSS / AMO',           date: 'En cours de renouvellement' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <FileText size={13} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[11px] font-black text-slate-700">{doc.name}</p>
                          <p className="text-[9px] font-medium text-slate-400 mt-0.5">{doc.date}</p>
                        </div>
                      </div>
                     
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ SÉCURITÉ ══ */}
            {activeTab === 'securite' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Sécurité</h2>
                  <p className="text-slate-400 text-[11px] mt-0.5">Gérez votre mot de passe et la sécurité du compte.</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <Lock size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Modifier le mot de passe</h3>
                      <p className="text-[9px] text-slate-400 font-medium">Minimum 8 caractères recommandés</p>
                    </div>
                  </div>

                  {passStatus && (
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-bold ${
                      passStatus === 'success'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-rose-50 border-rose-100 text-rose-600'
                    }`}>
                      {passStatus === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                      {passMessage}
                    </div>
                  )}

                  {[
                    { key: 'current', label: 'Mot de passe actuel'     },
                    { key: 'newPass', label: 'Nouveau mot de passe'     },
                    { key: 'confirm', label: 'Confirmer le nouveau MDP' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                      <div className="relative">
                        <input
                          type={showPass[key] ? 'text' : 'password'}
                          value={passwords[key]}
                          onChange={(e) => setPasswords(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 pr-10 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold text-slate-800 outline-none focus:border-pink-300 transition-all placeholder:text-slate-200" />
                        <button type="button"
                          onClick={() => setShowPass(prev => ({ ...prev, [key]: !prev[key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                          {showPass[key] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {passwords.newPass && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                            passwords.newPass.length >= i * 3
                              ? passwords.newPass.length >= 12 ? 'bg-emerald-400'
                                : passwords.newPass.length >= 8  ? 'bg-amber-400' : 'bg-rose-400'
                              : 'bg-slate-100'
                          }`} />
                        ))}
                      </div>
                      <p className="text-[9px] font-bold text-slate-400">
                        {passwords.newPass.length < 6 ? 'Trop court'
                          : passwords.newPass.length < 8  ? 'Faible'
                          : passwords.newPass.length < 12 ? 'Moyen' : 'Fort'}
                      </p>
                    </div>
                  )}

                  <button onClick={handleChangePassword} disabled={savingPass}
                    className="w-full py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                    {savingPass
                      ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Modification...</>
                      : <><Lock size={12} />Modifier le mot de passe</>}
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Session active</p>
                  {[
                    { label: 'Connecté en tant que', value: `Dr. ${doctorInfo.prenom} ${doctorInfo.nom}` },
                    { label: 'Email',                value: doctorInfo.email },
                    { label: 'Dernière connexion',   value: new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }) },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-[10px] font-bold text-slate-400">{item.label}</span>
                      <span className="text-[10px] font-black text-slate-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ IA ══ */}
            {activeTab === 'ia' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Données & IA</h2>
                  <p className="text-slate-400 text-[11px] mt-0.5">Configuration des modèles d'intelligence artificielle.</p>
                </div>
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <Database size={24} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Configuration IA disponible prochainement
                  </p>
                </div>
              </motion.div>
            )}

            {/* ══ PRÉFÉRENCES ══ */}
            {activeTab === 'preferences' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Interface</h2>
                  <p className="text-slate-400 text-[11px] mt-0.5">Personnalisez votre expérience utilisateur.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thème</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['clair', 'sombre'].map(t => (
                      <button key={t} onClick={() => setTheme(t)}
                        className={`p-3.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          theme === t
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'
                        }`}>
                        {t === 'clair' ? '☀️ Clair' : '🌙 Sombre'}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* ── BOTTOM ACTIONS ── */}
          {activeTab === 'profil' && (
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 bg-white">
              <button onClick={() => window.location.reload()}
                className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-700 transition-colors">
                Réinitialiser
              </button>
              <button onClick={handleSave}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2 transition-all ${
                  isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black'
                }`}>
                {isSaved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                {isSaved ? 'Profil à jour' : 'Sauvegarder'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;