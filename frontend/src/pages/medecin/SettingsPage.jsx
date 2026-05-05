import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { medecinService } from '../../services/medecinService';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import {
  User,
  Lock,
  Shield,
  Globe,
  Save,
  CheckCircle2,
  Building2,
  Database,
  Smartphone,
  Camera
} from 'lucide-react';

const API_BASE = 'http://localhost:8080';

const SettingsPage = () => {
  const { theme, setTheme, lang, setLang } = useSettings();
  const { user, login, getInitiales } = useAuth();

  const [activeTab, setActiveTab] = useState('profil');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [doctorInfo, setDoctorInfo] = useState({
    nom: '',
    prenom: '',
    specialite: '',
    numOrdre: '',
    email: '',
    tel: '',
    photoProfil: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState('');

  useEffect(() => {
    const loadProfil = async () => {
      try {
        if (!user?.id) return;

        const res = await medecinService.findById(user.id);
        const medecin = res.data;

        setDoctorInfo({
          nom: medecin.nom || '',
          prenom: medecin.prenom || '',
          specialite: medecin.specialite?.nom || '',
          numOrdre: medecin.numeroOrdre || '',
          email: medecin.email || '',
          tel: medecin.telephone || '',
          photoProfil: medecin.photoProfil || ''
        });

        // Correction affichage photo backend après sauvegarde
        if (medecin.photoProfil) {
          const cleanPath = medecin.photoProfil
            .replace(/\\/g, '/')
            .replace(/^\/+/, '');

          setPreviewPhoto(
            `${API_BASE}/${cleanPath}?t=${new Date().getTime()}`
          );
        }

      } catch (error) {
        console.error('Erreur chargement profil :', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfil();
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);

    // Preview instantané
    const localPreview = URL.createObjectURL(file);
    setPreviewPhoto(localPreview);
  };

  const handleSave = async () => {
    try {
      const payload = {
        nom: doctorInfo.nom,
        prenom: doctorInfo.prenom,
        telephone: doctorInfo.tel
      };

      const res = await medecinService.modifierProfil(
        user.id,
        payload,
        photoFile
      );

      const updatedUser = {
        ...user,
        nom: res.data.nom,
        prenom: res.data.prenom,
        photoProfil: res.data.photoProfil
      };

      login(updatedUser);

      // IMPORTANT : refresh vraie photo stockée backend
      if (res.data.photoProfil) {
        const cleanPath = res.data.photoProfil
          .replace(/\\/g, '/')
          .replace(/^\/+/, '');

        setPreviewPhoto(
          `${API_BASE}/${cleanPath}?t=${new Date().getTime()}`
        );

        setDoctorInfo((prev) => ({
          ...prev,
          photoProfil: res.data.photoProfil
        }));
      }

      setPhotoFile(null);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

    } catch (error) {
      console.error('Erreur sauvegarde profil :', error);
      alert(
        error.response?.data?.message ||
        'Impossible de sauvegarder.'
      );
    }
  };

  const menuItems = [
    { id: 'profil', icon: User, label: 'Profil Praticien' },
    { id: 'clinique', icon: Building2, label: 'Établissement' },
    { id: 'securite', icon: Shield, label: 'Sécurité' },
    { id: 'ia', icon: Database, label: 'Données & IA' },
    { id: 'preferences', icon: Globe, label: 'Interface' },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-sm font-bold">
        Chargement du profil...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col font-inter p-2 lg:p-4 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col lg:flex-row h-full overflow-hidden">

        {/* SIDEBAR NAVIGATION */}
        <div className="w-full lg:w-72 bg-gray-50/50 dark:bg-gray-800/20 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
          <div className="p-8 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Paramètres
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              Configuration du compte
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === item.id
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          {/* VERSION LOGICIELLE - gardée exactement */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Version Logicielle
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  v3.8.2-stable
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">

            {activeTab === 'profil' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl space-y-12"
              >

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                      Profil du Praticien
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Informations authentifiées pour votre activité médicale.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">

                  {/* PHOTO */}
                  <div className="lg:col-span-2 flex items-center gap-8 pb-8 border-b border-gray-50 dark:border-gray-800">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white font-bold text-2xl border-2 border-gray-50 overflow-hidden">
                        {previewPhoto ? (
                          <img
                            src={previewPhoto}
                            alt="Profil"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitiales()
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        id="photo-upload"
                        onChange={handlePhotoChange}
                      />

                      <label
                        htmlFor="photo-upload"
                        className="absolute bottom-0 right-0 p-2 bg-black dark:bg-white text-white dark:text-black rounded-full border-2 border-white shadow-xl hover:scale-110 transition-all cursor-pointer"
                      >
                        <Camera size={14} />
                      </label>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        {doctorInfo.prenom} {doctorInfo.nom}
                      </h3>
                      <p className="text-xs text-sky-600 font-bold uppercase tracking-widest mt-0.5">
                        {doctorInfo.specialite || 'Spécialité non définie'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        Inscrite à l'ordre : {doctorInfo.numOrdre}
                      </p>
                    </div>
                  </div>

                  {/* NOM */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={doctorInfo.nom}
                      onChange={(e) =>
                        setDoctorInfo({ ...doctorInfo, nom: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-bold"
                    />
                  </div>

                  {/* PRENOM */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={doctorInfo.prenom}
                      onChange={(e) =>
                        setDoctorInfo({ ...doctorInfo, prenom: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-bold"
                    />
                  </div>

                  {/* NUMERO ORDRE */}
                  <div className="space-y-1.5 outline-none">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Numéro d'Ordre
                    </label>
                    <input
                      type="text"
                      value={doctorInfo.numOrdre}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-transparent rounded-lg text-xs font-bold text-gray-400 cursor-not-allowed uppercase"
                    />
                    <p className="text-[9px] text-gray-400 italic ml-1">
                      Non modifiable directement. Contactez le support.
                    </p>
                  </div>

                  {/* SPECIALITE */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Spécialité Principale
                    </label>
                    <input
                      type="text"
                      value={doctorInfo.specialite}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-transparent rounded-lg text-xs font-bold text-gray-400 cursor-not-allowed uppercase"
                    />
                    <p className="text-[9px] text-gray-400 italic ml-1">
                      Non modifiable directement. Contactez le support.
                    </p>
                  </div>

                  {/* TELEPHONE */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Téléphone Clinic
                    </label>
                    <input
                      type="tel"
                      value={doctorInfo.tel}
                      onChange={(e) =>
                        setDoctorInfo({ ...doctorInfo, tel: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-bold"
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Email Professionnel
                    </label>
                    <input
                      type="email"
                      value={doctorInfo.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-transparent rounded-lg text-xs font-bold text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-[9px] text-gray-400 italic ml-1">
                      Non modifiable directement. Contactez le support.
                    </p>
                  </div>

                </div>
              </motion.div>
            )}

          </div>

          {/* BOTTOM ACTIONS */}
          <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-4 shrink-0 bg-white dark:bg-gray-950">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
            >
              Réinitialiser
            </button>

            <button
              onClick={handleSave}
              className={`px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-3 transition-all ${
                isSaved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02]'
              }`}
            >
              {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {isSaved ? 'Profil à jour' : 'Sauvegarder les modifications'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;