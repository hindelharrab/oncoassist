import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Globe, 
  Save,
  CheckCircle2,
  Stethoscope,
  Building2,
  Database,
  Smartphone,
  Eye,
  Camera
} from 'lucide-react';

const SettingsPage = () => {
  const { theme, setTheme, lang, setLang } = useSettings();
  const [activeTab, setActiveTab] = useState('profil');
  const [isSaved, setIsSaved] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState({
    nom: 'Harrab',
    prenom: 'Hind',
    specialite: 'Oncologue Sénologue',
    numOrdre: '12345/M',
    email: 'h.harrab@oncoassist.ma',
    tel: '+212 6 00 00 00 00',
    etablissement: 'Hôpital Privé de Casablanca',
    ville: 'Casablanca',
    bio: 'Spécialisée dans le diagnostic précoce et le suivi personnalisé des cancers du sein.',
  });

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const menuItems = [
    { id: 'profil', icon: User, label: 'Profil Praticien' },
    { id: 'clinique', icon: Building2, label: 'Établissement' },
    { id: 'securite', icon: Shield, label: 'Sécurité' },
    { id: 'ia', icon: Database, label: 'Données & IA' },
    { id: 'preferences', icon: Globe, label: 'Interface' },
  ];

  return (
    <div className="h-full flex flex-col font-inter p-2 lg:p-4 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col lg:flex-row h-full overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full lg:w-72 bg-gray-50/50 dark:bg-gray-800/20 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
          <div className="p-8 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Paramètres</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Configuration du compte</p>
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
          
          <div className="p-6 border-t border-gray-100 dark:border-gray-800">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Version Logicielle</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-gray-900 dark:text-white">v3.8.2-stable</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
            
            {activeTab === 'profil' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-12">
                
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Profil du Praticien</h2>
                    <p className="text-gray-400 text-sm mt-1">Informations authentifiées pour votre activité médicale.</p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  
                  {/* Photo Profile */}
                  <div className="lg:col-span-2 flex items-center gap-8 pb-8 border-b border-gray-50 dark:border-gray-800">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white font-bold text-2xl border-2 border-gray-50 overflow-hidden">
                        HH
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-black dark:bg-white text-white dark:text-black rounded-full border-2 border-white shadow-xl hover:scale-110 transition-all">
                        <Camera size={14} />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Hind Harrab</h3>
                      <p className="text-xs text-sky-600 font-bold uppercase tracking-widest mt-0.5">Oncologue Sénologue</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">Inscrite à l'ordre : {doctorInfo.numOrdre}</p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-1.5 outline-none">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Numéro d'Ordre</label>
                    <input type="text" value={doctorInfo.numOrdre} disabled className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-transparent rounded-lg text-xs font-bold text-gray-400 cursor-not-allowed uppercase" />
                    <p className="text-[9px] text-gray-400 italic ml-1">Non modifiable directement. Contactez le support.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Spécialité Principale</label>
                    <input type="text" value={doctorInfo.specialite} onChange={(e) => setDoctorInfo({...doctorInfo, specialite: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:bg-white transition-all outline-none" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Téléphone Clinic</label>
                    <input type="tel" value={doctorInfo.tel} onChange={(e) => setDoctorInfo({...doctorInfo, tel: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:bg-white transition-all outline-none" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Professionnel</label>
                    <input type="email" value={doctorInfo.email} onChange={(e) => setDoctorInfo({...doctorInfo, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:bg-white transition-all outline-none" />
                  </div>

                  <div className="lg:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bio Courte (Apparait sur les rapports)</label>
                    <textarea rows={3} value={doctorInfo.bio} onChange={(e) => setDoctorInfo({...doctorInfo, bio: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:bg-white transition-all outline-none resize-none" />
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'clinique' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-12">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Configuration de l'Établissement</h2>
                  <p className="text-gray-400 text-sm mt-1">Détails de la structure médicale où vous exercez.</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <Building2 size={24} className="text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Hôpital Privé de Casablanca</h3>
                        <p className="text-[10px] font-medium text-gray-400">ID Établissement: #HPC-889022</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Service Affecté</span>
                        <div className="text-xs font-bold text-gray-700 dark:text-gray-300">Oncologie Médicale / Sénologie</div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Responsabilité</span>
                        <div className="text-xs font-bold text-gray-700 dark:text-gray-300">Praticien Senior</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'securite' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-12">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Sécurité & Accès</h2>
                  <p className="text-gray-400 text-sm mt-1">Gérez votre mot de passe et l'authentification à deux facteurs.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Lock size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Mot de passe</h4>
                        <p className="text-xs text-gray-400">Hautement sécurisé, dernière modification il y a 3 mois.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-black dark:border-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Modifier</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                        <Smartphone size={20} className="text-sky-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Double Authentification (2FA)</h4>
                        <p className="text-xs text-gray-400 underline">Configuration recommandée pour la protection des données patient.</p>
                      </div>
                    </div>
                    <div className="w-10 h-6 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-12">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Interface & Affichage</h2>
                  <p className="text-gray-400 text-sm mt-1">Personnalisez votre expérience de travail.</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mode de Couleurs</span>
                    <div className="flex gap-2">
                       <button onClick={() => setTheme('claire')} className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'claire' ? 'border-black dark:border-white bg-gray-50' : 'border-gray-50'}`}>
                         <Globe size={24} className="text-gray-400" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Clair</span>
                       </button>
                       <button onClick={() => setTheme('sombre')} className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'sombre' ? 'border-black dark:border-white bg-gray-900' : 'border-gray-50'}`}>
                         <Globe size={24} className="text-gray-900 dark:text-white" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Sombre</span>
                       </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Langue</span>
                    <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-900 dark:text-white outline-none">
                      <option value="fr">Français (FR)</option>
                      <option value="en">English (US)</option>
                      <option value="ar">العربية (AR)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* BOTTOM ACTIONS */}
          <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-4 shrink-0 bg-white dark:bg-gray-950">
            <button className="px-6 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Réinitialiser</button>
            <button 
              onClick={handleSave}
              className={`px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-3 transition-all ${
                isSaved ? 'bg-emerald-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02]'
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
