import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  User, 
  ChevronRight, 
  Plus, 
  FileText, 
  Stethoscope, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Circle, 
  MoreHorizontal,
  Edit2,
  Printer,
  Eye,
  EyeOff,
  Send,
  AlertCircle,
  Zap,
  ArrowRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PlanTraitementPage = () => {
  const [activeStep, setActiveStep] = useState(null);
  const [formMode, setFormMode] = useState('new');
  const [currentView, setCurrentView] = useState('form');
  
  const [timeline, setTimeline] = useState([
    {
      id: 1,
      type: 'Examen manuel',
      date: '2026-05-01',
      status: 'fait',
      medecin: 'Dr. Karimi',
      ordonnance: 'Paracétamol 500mg, repos.',
      visiblePatient: true,
    },
    {
      id: 2,
      type: 'IRM',
      date: '2026-05-05',
      status: 'fait',
      medecin: 'Dr. Karimi',
      ordonnance: 'Bilan sanguin complet.',
      visiblePatient: true,
    },
    {
      id: 3,
      type: 'Échographie',
      date: '2026-05-08',
      status: 'fait',
      medecin: 'Dr. Karimi',
      ordonnance: 'Biopsie à prévoir.',
      visiblePatient: true,
    },
    {
      id: 4,
      type: 'Biopsie',
      date: 'En attente',
      status: 'à venir',
      medecin: 'Dr. Karimi',
      motif: 'Prélèvement tissulaire pour analyse anatomo-pathologique.',
    }
  ]);

  const [formData, setFormData] = useState({
    dateConsultation: new Date().toISOString().split('T')[0],
    auteur: 'Dr. Karimi',
    etape: 'Examen manuel',
    ordonnance: '',
    status: 'fait',
    visiblePatient: true,
    prochaineEtape: '',
    motifRDV: ''
  });

  const etapesList = [
    { id: 'Examen manuel', label: 'Examen manuel', icon: <Stethoscope size={18} /> },
    { id: 'Mammographie', label: 'Mammographie', icon: <Zap size={18} /> },
    { id: 'Échographie', label: 'Échographie', icon: <Activity size={18} /> },
    { id: 'IRM', label: 'IRM', icon: <Zap size={18} /> },
    { id: 'Biopsie', label: 'Biopsie', icon: <ChevronRight size={18} /> },
  ];

  const handleNextStepSelect = (stepId) => {
    setFormData(prev => ({
      ...prev,
      prochaineEtape: stepId,
      motifRDV: `Demande de prise en charge pour ${stepId.toLowerCase()}. Merci de planifier dès que possible.`
    }));
  };

  // Initialisation : on charge la prochaine étape à faire si elle existe
  useEffect(() => {
    const nextPlanned = timeline.find(t => t.status === 'à venir');
    if (nextPlanned) {
      handleEdit(nextPlanned);
    } else {
      handleNew();
    }
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    
    setTimeline(prev => {
      const next = prev.filter(item => item.id !== id);
      
      // Si on supprime l'étape active, on redirige vers la suite logique
      if (activeStep === id) {
        const nextStep = next.find(t => t.status === 'à venir');
        if (nextStep) {
          setTimeout(() => handleEdit(nextStep), 0);
        } else {
          setTimeout(() => handleNew(next), 0);
        }
      }
      return next;
    });
  };

  const handleEdit = (item) => {
    setActiveStep(item.id);
    setFormMode('edit');
    setCurrentView('form');
    
    const isPlanned = item.status === 'à venir';
    
    setFormData({
      dateConsultation: isPlanned ? new Date().toISOString().split('T')[0] : (item.date === 'En attente' ? new Date().toISOString().split('T')[0] : item.date),
      auteur: item.medecin,
      etape: item.type,
      ordonnance: item.ordonnance || '',
      status: isPlanned ? 'fait' : item.status,
      visiblePatient: item.visiblePatient ?? true,
      prochaineEtape: '',
      motifRDV: ''
    });
  };

  const handleNew = (currentTimeline = timeline) => {
    setActiveStep(null);
    setFormMode('new');
    setCurrentView('form');
    
    // On cherche s'il y a une étape planifiée pour la traiter en priorité
    const nextPlanned = currentTimeline.find(t => t.status === 'à venir');
    
    if (nextPlanned) {
      handleEdit(nextPlanned);
      return;
    }
    
    setFormData({
      dateConsultation: new Date().toISOString().split('T')[0],
      auteur: 'Dr. Karimi',
      etape: 'Examen manuel',
      ordonnance: '',
      status: 'fait',
      visiblePatient: true,
      prochaineEtape: '',
      motifRDV: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8">
      {/* Patient Header */}
      <div className="max-w-7xl mx-auto mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-6 shadow-sm overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
         
         <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-pink-500/20">
               LB
            </div>
            <div>
               <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Leïla Benali</h1>
               <div className="flex items-center gap-3 mt-1 text-slate-500 dark:text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">ID: #9942</span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded-md">Cancer du Sein</span>
               </div>
            </div>
         </div>

         <div className="flex gap-8 items-center h-full relative z-10 pr-4">
            <div className="flex flex-col items-center">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Dernière Séance</span>
               <span className="text-[11px] font-black text-slate-900 dark:text-white">08 Mai 2026</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div className="flex flex-col items-center">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Prochain Examen</span>
               <span className="text-[11px] font-black text-pink-500">Biopsie</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <button className="h-10 px-6 rounded-xl bg-slate-950 dark:bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20">Imprimer Dossier</button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Colonne GAUCHE: Timeline */}
        <div className="xl:col-span-4 space-y-6">
          <div className="flex items-center justify-between pl-8 pr-2">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Parcours Patient</h2>
            <button 
              onClick={handleNew}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="relative pl-8 space-y-6">
            <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-gradient-to-b from-pink-500 via-rose-500 to-slate-200 dark:to-slate-800 rounded-full" />

            {timeline.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-5 rounded-3xl border transition-all ${
                  activeStep === item.id 
                  ? 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-900/40 shadow-lg shadow-pink-500/5' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                }`}
              >
                <div className={`absolute -left-[27px] top-6 w-4 h-4 rounded-full border-4 ${
                  item.status === 'fait' ? 'bg-pink-500 border-white dark:border-slate-950 shadow-sm' : 
                  'bg-slate-200 dark:bg-slate-700 border-white dark:border-slate-950'
                }`} />

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        item.status === 'fait' ? 'bg-emerald-100 text-emerald-600' : 
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{item.date}</span>
                    </div>
                    <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-900 dark:text-white">{item.type}</h3>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Dr. {item.medecin}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                      title="Modifier"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(item.id, e)}
                      className="relative z-20 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-all"
                      title="Supprimer l'étape"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {item.ordonnance && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 italic line-clamp-2">"{item.ordonnance}"</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Colonne DROITE: Formulaire ou Aperçu */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          <AnimatePresence mode="wait">
            {currentView === 'form' ? (
              <motion.div 
                key="form-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] overflow-hidden"
              >
                 <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-white to-pink-50/20 dark:from-slate-950 dark:to-pink-950/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
                          {formMode === 'new' ? <Plus size={22} className="text-pink-500" /> : <Edit2 size={20} className="text-slate-950 dark:text-white" />}
                       </div>
                       <div>
                          <h2 className="text-lg font-black uppercase tracking-tight">{formMode === 'new' ? 'Nouvelle Séance' : 'Modifier la Séance'}</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Planification et Bilan Médical</p>
                       </div>
                    </div>
                    {formMode === 'edit' && (
                      <button 
                        onClick={handleNew}
                        className="h-8 px-4 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-sans"
                      >
                        Annuler
                      </button>
                    )}
                 </div>

                 <div className="p-8 space-y-10">
                    {/* Bloc 1: Bilan */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Bilan de la séance</h4>
                       </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">
                          <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Date Consultation</label>
                            <div className="relative group">
                              <input 
                                type="date"
                                value={formData.dateConsultation}
                                onChange={(e) => setFormData({...formData, dateConsultation: e.target.value})}
                                className="w-full h-14 pl-14 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-pink-500/20 focus:bg-white dark:focus:bg-slate-900 text-[13px] font-bold transition-all outline-none"
                              />
                              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Médecin Auteur</label>
                            <div className="relative group">
                              <select 
                                value={formData.auteur}
                                onChange={(e) => setFormData({...formData, auteur: e.target.value})}
                                className="w-full h-14 pl-14 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-pink-500/20 focus:bg-white dark:focus:bg-slate-900 text-[13px] font-bold transition-all appearance-none outline-none"
                              >
                                <option>Dr. Karimi</option>
                                <option>Dr. Mansouri</option>
                                <option>Dr. Tahiri</option>
                              </select>
                              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Étape Actuelle</label>
                            <div className="relative group">
                              <select 
                                value={formData.etape}
                                onChange={(e) => setFormData({...formData, etape: e.target.value})}
                                className="w-full h-14 pl-14 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-pink-500/20 focus:bg-white dark:focus:bg-slate-900 text-[13px] font-bold transition-all appearance-none outline-none"
                              >
                                {etapesList.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                              </select>
                              <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Statut Séance</label>
                            <div className="relative group">
                              <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className={`w-full h-14 pl-14 pr-4 rounded-2xl border-2 border-transparent focus:ring-0 text-[13px] font-bold transition-all appearance-none outline-none ${
                                    formData.status === 'fait' 
                                    ? 'bg-pink-50 text-pink-600 dark:bg-pink-950/20 focus:border-pink-500/20' 
                                    : 'bg-slate-50 text-slate-500 dark:bg-slate-900 focus:border-pink-500/20'
                                }`}
                              >
                                <option value="fait">FAIT (Réalisé)</option>
                                <option value="à venir">À VENIR (Planifié)</option>
                              </select>
                              <CheckCircle2 className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${formData.status === 'fait' ? 'text-pink-500' : 'text-slate-400'}`} size={18} />
                            </div>
                          </div>
                        </div>
                    </div>

                    {/* Bloc 2: Ordonnance */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                             <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Ordonnance & Prescriptions</h4>
                          </div>
                          <div className="flex items-center gap-4">
                             <div 
                               onClick={() => setFormData({...formData, visiblePatient: !formData.visiblePatient})}
                               className="flex items-center gap-2 cursor-pointer group"
                             >
                                {formData.visiblePatient ? <Eye size={16} className="text-emerald-500" /> : <EyeOff size={16} className="text-slate-400" />}
                                <span className={`text-[9px] font-black uppercase tracking-widest ${formData.visiblePatient ? 'text-emerald-600' : 'text-slate-400'}`}>
                                   {formData.visiblePatient ? 'Visible Patient' : 'Masqué Patient'}
                                </span>
                             </div>
                             <button 
                               onClick={() => setCurrentView('preview')}
                               className="flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-sans"
                             >
                                <Printer size={14} /> Aperçu Ordonnance
                             </button>
                          </div>
                       </div>

                       <div className="relative">
                          <textarea 
                            placeholder="Saisissez les médicaments, examens complémentaires ou recommandations..."
                            value={formData.ordonnance}
                            onChange={(e) => setFormData({...formData, ordonnance: e.target.value})}
                            className="w-full min-h-[160px] p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-pink-500/20 focus:bg-white dark:focus:bg-slate-900 text-[13px] font-medium leading-relaxed transition-all outline-none resize-none"
                          />
                          <div className="absolute top-6 right-6 opacity-10">
                             <FileText size={40} />
                          </div>
                       </div>
                    </div>

                    {/* Bloc 3: Prochaine étape */}
                    <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Prochaine étape décidée</h4>
                       </div>

                       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                          {etapesList.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleNextStepSelect(item.id)}
                              className={`flex flex-col items-center justify-center gap-4 p-5 rounded-3xl border-2 transition-all group aspect-square lg:aspect-auto lg:h-32 ${
                                formData.prochaineEtape === item.id 
                                ? 'bg-pink-50 border-pink-200 text-pink-600 shadow-xl shadow-pink-500/5 -translate-y-1' 
                                : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-pink-200 dark:hover:border-pink-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                formData.prochaineEtape === item.id 
                                ? 'bg-white dark:bg-pink-900/20 scale-110 shadow-sm' 
                                : 'bg-slate-50 dark:bg-slate-900 group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 group-hover:text-pink-500 text-slate-400'
                              }`}>
                                {item.icon}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-center px-1">{item.label}</span>
                            </button>
                          ))}
                       </div>

                       <AnimatePresence>
                         {formData.prochaineEtape && (
                           <motion.div 
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: 'auto' }}
                             exit={{ opacity: 0, height: 0 }}
                             className="overflow-hidden space-y-4 pt-4"
                           >
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-pink-500 uppercase tracking-widest ml-1">Motif du rendez-vous à transmettre</label>
                                 <div className="relative">
                                   <textarea 
                                     value={formData.motifRDV}
                                     onChange={(e) => setFormData({...formData, motifRDV: e.target.value})}
                                     className="w-full min-h-[100px] p-5 rounded-2xl bg-pink-50/30 dark:bg-pink-900/5 border border-pink-100 dark:border-pink-900/30 text-[12px] font-medium transition-all outline-none resize-none"
                                   />
                                   <div className="absolute right-4 bottom-4">
                                      <button className="flex items-center gap-2 h-10 px-6 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/20">
                                         <Send size={14} /> Demander RDV Secrétaire
                                      </button>
                                   </div>
                                 </div>
                              </div>
                              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                                 <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                 <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Cette étape s'affichera comme "En attente" dans le parcours patient jusqu'à ce que la secrétaire confirme la date du rendez-vous.</p>
                              </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                       <div className="flex items-center gap-3 opacity-60">
                          <CheckCircle2 size={18} className="text-pink-500" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Validation Digitale Prête</span>
                       </div>
                       
                       <button 
                        onClick={() => {
                          setTimeline(prev => {
                            let updated = [...prev];
                            
                            if (formMode === 'new') {
                              const nextId = Math.max(...updated.map(t => t.id), 0) + 1;
                              const newItem = {
                                id: nextId,
                                type: formData.etape,
                                date: formData.status === 'à venir' ? 'En attente' : formData.dateConsultation,
                                status: formData.status,
                                medecin: formData.auteur,
                                ordonnance: formData.ordonnance,
                                visiblePatient: formData.visiblePatient
                              };
                              updated.push(newItem);
                              
                              if (formData.prochaineEtape) {
                                updated.push({
                                   id: nextId + 1,
                                   type: formData.prochaineEtape,
                                   date: 'En attente',
                                   status: 'à venir',
                                   medecin: formData.auteur,
                                   motif: formData.motifRDV
                                });
                              }
                            } else {
                              updated = updated.map(item => 
                                item.id === activeStep 
                                ? { 
                                    ...item, 
                                    type: formData.etape, 
                                    status: formData.status,
                                    date: formData.status === 'à venir' ? 'En attente' : (item.date === 'En attente' ? formData.dateConsultation : item.date), 
                                    ordonnance: formData.ordonnance, 
                                    visiblePatient: formData.visiblePatient 
                                } 
                                : item
                              );
                              
                              // Si on vient de terminer une séance et qu'on en planifie une nouvelle
                              if (formData.status === 'fait' && formData.prochaineEtape) {
                                const nextId = Math.max(...updated.map(t => t.id), 0) + 1;
                                updated.push({
                                   id: nextId,
                                   type: formData.prochaineEtape,
                                   date: 'En attente',
                                   status: 'à venir',
                                   medecin: formData.auteur,
                                   motif: formData.motifRDV
                                });
                              }
                            }
                            
                            // Logique de flux automatique : après enregistrement, on cherche la toute PROCHAINE étape planifiée
                            // On fait ça dans un setTimeout pour laisser l'état se mettre à jour
                            setTimeout(() => {
                              const nextToProcess = updated.find(t => t.status === 'à venir');
                              if (nextToProcess) {
                                handleEdit(nextToProcess);
                              } else {
                                handleNew();
                              }
                            }, 0);

                            return updated;
                          });
                        }}
                        className="h-14 px-10 rounded-2xl bg-slate-950 dark:bg-pink-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 font-sans"
                       >
                          {formMode === 'new' ? 'Enregistrer la Séance' : 'Mettre à jour la Séance'}
                          <ArrowRight size={18} />
                       </button>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div 
                key="preview-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden min-h-[800px]"
              >
                 <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center text-white">
                          <Printer size={20} />
                       </div>
                       <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Aperçu Impression</h3>
                          <p className="text-[9px] font-bold text-slate-400">Document officiel</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setCurrentView('form')}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-slate-950 shadow-sm transition-all"
                    >
                      <X size={20} />
                    </button>
                 </div>

                 <div className="p-12 bg-slate-100/30 flex-1 flex flex-col items-center overflow-y-auto max-h-[700px]">
                    <div className="w-full max-w-sm bg-white p-8 shadow-2xl border border-slate-200 aspect-[1/1.414] relative flex flex-col justify-between overflow-hidden shrink-0">
                       <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-35deg]">
                          <span className="text-4xl font-black uppercase tracking-[0.6em] text-pink-900">ONCOASSIST</span>
                       </div>

                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-10">
                             <h4 className="text-sm font-black tracking-tighter text-slate-900 italic">CLINIQUE DU SEIN</h4>
                             <div className="text-right">
                                <p className="text-[7px] font-black uppercase tracking-widest text-pink-500">Ordonnance</p>
                                <p className="text-[6px] font-bold text-slate-400">{formData.dateConsultation}</p>
                             </div>
                          </div>

                          <div className="space-y-3 mb-8">
                             <div className="border-b border-slate-100 pb-1">
                                <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest">Patient</p>
                                <p className="text-[10px] font-black uppercase text-slate-900">Leïla Benali (42 ANS)</p>
                             </div>
                             <div className="border-b border-slate-100 pb-1">
                                <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest">Praticien</p>
                                <p className="text-[10px] font-black uppercase text-slate-900">{formData.auteur}</p>
                             </div>
                          </div>

                          <div className="min-h-[150px] py-4 font-serif italic text-slate-800 text-[11px] leading-relaxed">
                             {formData.ordonnance || 'Aucune prescription saisie.'}
                          </div>
                       </div>

                       <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between opacity-30">
                          <span className="text-[6px] font-bold uppercase">OncoAssist V2.4</span>
                          <span className="text-[6px] font-mono">REF: OA-{formData.dateConsultation.replace(/-/g, '')}</span>
                       </div>
                    </div>

                    <div className="mt-8 flex gap-4 w-full max-w-sm">
                       <button className="flex-1 h-12 rounded-2xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 font-sans">
                          <Printer size={16} /> Imprimer
                       </button>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PlanTraitementPage;