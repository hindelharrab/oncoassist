import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Calendar,
  Trash2,
  Edit2,
  Activity,
  Layers,
  ClipboardList,
  X,
  Save,
  Check,
  FileText,
  Image as ImageIcon,
  Upload,
  Zap,
  Target,
  FileSearch
} from 'lucide-react';

const IRMPage = () => {
  const { id } = useParams();
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [examens, setExamens] = useState([
    {
      id: 1,
      date: '12/04/2025',
      medecin: 'Dr. Marc Lepage',
      seinExamine: 'Gauche',
      sequences: 'T1, T2, STIR, Dynamique',
      produitContraste: 'Gadolinium',
      quadrant: 'QSI',
      formeLesion: 'Spatulée',
      contoursLesion: 'Irréguliers',
      signalT2: 'Hypersignal',
      tailleAxe1: '25',
      tailleAxe2: '18',
      tailleAxe3: '20',
      typeRehaussement: 'Masse',
      cinematiqueRehaussement: 'Type 3 (Wash-out)',
      restrictionDiffusion: 'Oui',
      valeurAdc: '0.85',
      adenopathieAxillaire: 'Non',
      adenopathieMediastinale: 'Non',
      extensionParoi: 'Non',
      extensionCutanee: 'Non',
      scoreBIRADS: '4c',
      recommandation: 'Macro-biopsie sous IRM recommandée',
      resulatat: 'Lésion suspecte avec cinétique de type 3.',
      fichierImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800'
    }
  ]);

  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('fr-FR'),
    seinExamine: 'Gauche',
    sequences: 'T1, T2, STIR, Dynamique',
    produitContraste: 'Gadolinium',
    quadrant: '',
    formeLesion: '',
    contoursLesion: '',
    signalT2: 'Hypersignal',
    tailleAxe1: '',
    tailleAxe2: '',
    tailleAxe3: '',
    typeRehaussement: 'Mass',
    cinematiqueRehaussement: 'Type 3',
    restrictionDiffusion: 'Oui',
    valeurAdc: '',
    adenopathieAxillaire: 'Non',
    adenopathieMediastinale: 'Non',
    extensionParoi: 'Non',
    extensionCutanee: 'Non',
    scoreBIRADS: '1',
    recommandation: '',
    resulatat: '',
    fichierImage: null
  });

  const handleSave = () => {
    const newExamen = {
      ...formData,
      id: Date.now(),
      medecin: 'Dr. Marc Lepage'
    };
    setExamens([newExamen, ...examens]);
    setIsAddingNew(false);
    setFormData({
      date: new Date().toLocaleDateString('fr-FR'),
      seinExamine: 'Gauche',
      sequences: 'T1, T2, STIR, Dynamique',
      produitContraste: 'Gadolinium',
      quadrant: '',
      formeLesion: '',
      contoursLesion: '',
      signalT2: 'Hypersignal',
      tailleAxe1: '',
      tailleAxe2: '',
      tailleAxe3: '',
      typeRehaussement: 'Mass',
      cinematiqueRehaussement: 'Type 3',
      restrictionDiffusion: 'Oui',
      valeurAdc: '',
      adenopathieAxillaire: 'Non',
      adenopathieMediastinale: 'Non',
      extensionParoi: 'Non',
      extensionCutanee: 'Non',
      scoreBIRADS: '1',
      recommandation: '',
      resulatat: '',
      fichierImage: null
    });
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-white">
      <div className="p-3 lg:p-5 max-w-[1600px] mx-auto space-y-5 font-sans">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center">
              <Layers size={18} className="text-pink-500" strokeWidth={2.3} />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-black tracking-tight uppercase">
                IRM Mammaire
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                <span className="text-[8px] font-bold text-black uppercase tracking-[0.25em]">
                  Imagerie par Résonance Magnétique
                </span>
                <span className="px-2 py-0.5 rounded-full border border-pink-200 bg-pink-50 text-pink-700 text-[8px] font-bold uppercase tracking-[0.2em]">
                  HAUTE RÉSOLUTION
                </span>
              </div>
            </div>
          </div>
          {!isAddingNew && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-950 text-white font-bold text-[9px] uppercase tracking-[0.22em] shadow-lg shadow-slate-200 dark:shadow-none hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              <Plus size={13} />
              Nouvel Examen
            </button>
          )}
        </div>

        <AnimatePresence>
          {isAddingNew && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-[0_15px_50px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              {/* Form Header */}
              <div className="px-6 lg:px-7 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-pink-50/50 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center">
                    <Zap size={16} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-base lg:text-lg font-black uppercase tracking-tight">Saisie Compte-Rendu IRM</h2>
                </div>
                <button onClick={() => setIsAddingNew(false)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 lg:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {/* Section 1: Protocole & Localisation */}
                  <div className="flex flex-col gap-6">
                    <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fcfcfd] dark:bg-slate-900/30 p-5 shadow-sm">
                      <h3 className="text-[9px] font-black uppercase tracking-[0.22em] mb-4 flex items-center gap-2 text-pink-600">
                        <Activity size={13} /> Protocole & Site
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Sein Examiné</label>
                          <select className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[10px] font-black uppercase outline-none focus:border-pink-400" value={formData.seinExamine} onChange={(e) => setFormData({...formData, seinExamine: e.target.value})}>
                            <option value="Droit">DROIT</option>
                            <option value="Gauche">GAUCHE</option>
                            <option value="Bilatéral">BILATÉRAL</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Séquences</label>
                          <input className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-bold outline-none focus:border-pink-400" value={formData.sequences} onChange={(e) => setFormData({...formData, sequences: e.target.value})} placeholder="T1, T2, STIR..."/>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Quadrant / Localisation</label>
                           <input className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-bold outline-none focus:border-pink-400" value={formData.quadrant} onChange={(e) => setFormData({...formData, quadrant: e.target.value})} placeholder="Ex: QSI, QSE..."/>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                       <div className="w-10 h-10 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 group-hover:text-pink-500 transition-all shadow-sm">
                          <Upload size={20} />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Importer Images</p>
                    </div>
                  </div>

                  {/* Section 2: Analyse Lésionnelle & Cinétique */}
                  <div className="flex flex-col gap-6">
                    <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fcfcfd] dark:bg-slate-900/30 p-5 shadow-sm">
                      <h3 className="text-[9px] font-black uppercase tracking-[0.22em] mb-4 flex items-center gap-2 text-pink-600">
                         <Target size={13} /> Lésion & Cinétique
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Forme</label>
                              <input className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-bold outline-none focus:border-pink-400" value={formData.formeLesion} onChange={(e) => setFormData({...formData, formeLesion: e.target.value})}/>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Cinématique</label>
                              <select className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[10px] font-black uppercase outline-none focus:border-pink-400" value={formData.cinematiqueRehaussement} onChange={(e) => setFormData({...formData, cinematiqueRehaussement: e.target.value})}>
                                  <option value="Type 1">TYPE 1 (PROGRESSIF)</option>
                                  <option value="Type 2">TYPE 2 (PLATEAU)</option>
                                  <option value="Type 3">TYPE 3 (WASH-OUT)</option>
                               </select>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Taille (mm) [Axe 1, 2, 3]</label>
                           <div className="flex gap-2">
                             {[1,2,3].map(i => (
                                <input key={i} className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-bold outline-none focus:border-pink-400" value={formData[`tailleAxe${i}`]} onChange={(e) => setFormData({...formData, [`tailleAxe${i}`]: e.target.value})} placeholder="mm"/>
                             ))}
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                               <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">RESTRIC. DIFF.</label>
                               <select className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[10px] font-black uppercase outline-none focus:border-pink-400" value={formData.restrictionDiffusion} onChange={(e) => setFormData({...formData, restrictionDiffusion: e.target.value})}>
                                  <option value="Oui">OUI</option>
                                  <option value="Non">NON</option>
                               </select>
                            </div>
                            <div className="space-y-1">
                               <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">VALEUR ADC</label>
                               <input className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-bold outline-none focus:border-pink-400" value={formData.valeurAdc} onChange={(e) => setFormData({...formData, valeurAdc: e.target.value})} placeholder="0.9..."/>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Conclusion & Score */}
                  <div className="flex flex-col gap-6">
                    <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#f8f9fb] dark:bg-slate-900/50 p-5 shadow-sm">
                       <h3 className="text-[9px] font-black uppercase tracking-[0.22em] mb-4 flex items-center gap-2">
                          <Check size={14} className="text-pink-500" /> Conclusion & Recom.
                       </h3>
                       <div className="space-y-6">
                          <div className="space-y-1">
                             <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Score BI-RADS IRM</label>
                             <input className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-base font-black text-center focus:border-pink-500 shadow-sm outline-none uppercase" value={formData.scoreBIRADS} onChange={(e) => setFormData({...formData, scoreBIRADS: e.target.value})} placeholder="4C..."/>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Recommandations</label>
                             <textarea 
                                className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-bold resize-none outline-none focus:border-pink-500 transition-all shadow-sm"
                                value={formData.recommandation}
                                onChange={(e) => setFormData({...formData, recommandation: e.target.value})}
                                placeholder="Biopsie recommandée..."
                             />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center gap-2 px-1">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Compte-rendu Final de l'Examen</span>
                   </div>
                   <textarea 
                      className="w-full h-24 p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[12px] font-medium leading-relaxed italic outline-none focus:border-pink-400 shadow-inner"
                      value={formData.resulatat}
                      onChange={(e) => setFormData({...formData, resulatat: e.target.value})}
                      placeholder="Saisir les conclusions cliniques ici..."
                   />
                </div>
              </div>

              <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-white dark:bg-slate-950">
                 <button onClick={() => setIsAddingNew(false)} className="px-6 h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">Annuler</button>
                 <button onClick={handleSave} className="px-8 h-11 rounded-2xl bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-pink-600 transition-all flex items-center gap-2">
                    <Save size={14} /> Sauvegarder l'examen IRM
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-5">
           {examens.map(exam => (
             <div key={exam.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-white to-pink-50/20 dark:from-slate-950 dark:to-pink-950/10 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                         <Calendar size={22} className="text-black dark:text-white" />
                      </div>
                      <div>
                         <h2 className="text-base font-black uppercase tracking-tight">Le {exam.date}</h2>
                         <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-pink-600 uppercase tracking-widest">IRM {exam.seinExamine}</span>
                            <span className="text-slate-200 dark:text-slate-700">•</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{exam.medecin}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 h-8 px-4 rounded-lg bg-slate-950 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"><Edit2 size={10} strokeWidth={2.8}/> Modifier</button>
                      <button className="w-8 h-8 rounded-lg border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-500 hover:text-rose-600 transition-all"><Trash2 size={12} strokeWidth={2.5}/></button>
                   </div>
                 </div>
                
                 <div className="p-4 lg:p-6 text-slate-900 dark:text-white">
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-stretch">
                      {/* Bloc 1: Morphologie & Image (Span 4) */}
                      <div className="xl:col-span-4 flex flex-col gap-5">
                         <div className="flex-1 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm flex flex-col">
                            {exam.fichierImage ? (
                               <div className="group relative bg-black aspect-[4/3] overflow-hidden shrink-0">
                                  <img 
                                    src={exam.fichierImage} 
                                    alt="Coupe IRM" 
                                    className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-5">
                                     <span className="text-[9px] font-black text-pink-500 uppercase tracking-[0.3em] flex items-center gap-1.5 mb-1">
                                        <Zap size={12} strokeWidth={3} /> Séquence Maîtresse
                                     </span>
                                     <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">Acquisition de référence</p>
                                  </div>
                                  <button className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-2xl border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30 hover:scale-110 shadow-2xl">
                                     <FileSearch size={18} />
                                  </button>
                               </div>
                            ) : (
                               <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-3 text-slate-300 shrink-0">
                                  <ImageIcon size={32} strokeWidth={1} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Cliché non disponible</span>
                               </div>
                            )}

                            <div className="p-6 space-y-6 flex-1 flex flex-col justify-between text-slate-900 dark:text-white">
                               <div className="space-y-4">
                                  <div className="flex flex-col">
                                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dimensions Lésionnelles</span>
                                     <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{exam.tailleAxe1}×{exam.tailleAxe2}×{exam.tailleAxe3}</span>
                                        <span className="text-[9px] font-black text-pink-500 uppercase italic">mm</span>
                                     </div>
                                  </div>
                                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                     <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Protocole</span>
                                           <p className="text-[11px] font-bold text-slate-900 dark:text-slate-200 uppercase leading-snug">{exam.sequences}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Site</span>
                                           <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{exam.quadrant}</p>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                               
                               <div className="mt-3 flex items-center justify-between">
                                  <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Réf: {exam.id}</span>
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </div>
                            </div>
                         </div>
                      </div>

                      {/* Bloc 2: Analyse Clinique (Span 4) */}
                      <div className="xl:col-span-4 flex flex-col gap-5">
                         <div className="flex-1 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col shadow-inner">
                            <div className="flex items-center gap-2.5">
                               <div className="w-1 h-5 bg-pink-500 rounded-full" />
                               <h4 className="text-[10px] font-black uppercase tracking-[0.25em]">Sémiologie IRM</h4>
                            </div>
                            
                            <div className="space-y-6 flex-1">
                               <div className="grid grid-cols-2 gap-8">
                                  <div className="space-y-2">
                                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Morphologie</span>
                                     <p className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase leading-tight">{exam.formeLesion} — {exam.contoursLesion}</p>
                                  </div>
                                  <div className="space-y-2 text-right">
                                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Signal T2</span>
                                     <p className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase">{exam.signalT2}</p>
                                  </div>
                               </div>

                               <div className="p-4 bg-white dark:bg-black rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 blur-2xl rounded-full group-hover:bg-pink-500/10 transition-all" />
                                  <span className="text-[8px] font-black text-pink-500 uppercase tracking-widest mb-1.5 block relative z-10">Dynamique de Réhaussement</span>
                                  <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight relative z-10 leading-tight">{exam.cinematiqueRehaussement}</p>
                               </div>

                               <div className="grid grid-cols-2 gap-8 pt-2">
                                  <div className="space-y-2">
                                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Diffusion</span>
                                     <p className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase">{exam.restrictionDiffusion}</p>
                                  </div>
                                  <div className="space-y-2 text-right">
                                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Valeur ADC</span>
                                     <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{exam.valeurAdc || 'N/A'}</p>
                                  </div>
                               </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-pink-100 dark:border-pink-900/30 bg-pink-50/70 dark:bg-pink-950/20 text-slate-900 dark:text-white shadow-xl relative overflow-hidden group">
                               <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                               <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-pink-600 dark:text-pink-400 mb-5 relative z-10">Bilan d'Extension</h4>
                               <div className="grid grid-cols-2 gap-x-6 gap-y-5 relative z-10">
                                  <div className="space-y-1">
                                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Axillaire</span>
                                     <p className={`text-[11px] font-black uppercase ${exam.adenopathieAxillaire === 'Oui' ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{exam.adenopathieAxillaire}</p>
                                  </div>
                                  <div className="space-y-1 text-right">
                                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Prop. Paroi</span>
                                     <p className={`text-[11px] font-black uppercase ${exam.extensionParoi === 'Oui' ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{exam.extensionParoi}</p>
                                  </div>
                                  <div className="space-y-1">
                                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Cutancé</span>
                                     <p className={`text-[11px] font-black uppercase ${exam.extensionCutanee === 'Oui' ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{exam.extensionCutanee}</p>
                                  </div>
                                  <div className="space-y-1 text-right">
                                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Autre Sein</span>
                                     <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase">INDÉMNE</p>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Bloc 3: Synthèse & Bilan (Span 4) */}
                      <div className="xl:col-span-4 flex flex-col gap-5">
                         <div className="flex-1 relative rounded-3xl bg-pink-50/50 dark:bg-pink-950/10 text-slate-900 dark:text-white p-6 overflow-hidden shadow-2xl border border-pink-100/50 dark:border-pink-900/20 group h-full flex flex-col">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
                            <div className="relative z-10 space-y-6 flex-1 flex flex-col">
                               <div className="flex items-start justify-between">
                                  <div className="space-y-1.5">
                                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500">Classification</h4>
                                     <p className="text-base font-black uppercase text-slate-900 dark:text-white leading-tight tracking-tight">{exam.typeRehaussement || 'Masse Suspecte'}</p>
                                  </div>
                                  <div className="flex flex-col items-center">
                                     <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter mb-1">BI-RADS</span>
                                     <div className="w-14 h-14 rounded-2xl bg-pink-500 text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-pink-500/30 transform transition-transform group-hover:scale-105">
                                        {exam.scoreBIRADS}
                                     </div>
                                  </div>
                               </div>
                               <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-white/10 flex-1 flex flex-col">
                                  <div className="space-y-3">
                                     <span className="text-[9px] font-black text-pink-500 uppercase tracking-[0.25em]">Indications Thérapeutiques</span>
                                     <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100/50 dark:border-pink-900/30">
                                        <p className="text-[12px] font-black uppercase leading-relaxed text-slate-900 dark:text-white tracking-tight">{exam.recommandation || 'Suivi clinique rapproché requis'}</p>
                                     </div>
                                  </div>

                                  <div className="space-y-2.5">
                                     <div className="flex items-center gap-2">
                                        <FileText size={12} className="text-slate-400" />
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Observations</span>
                                     </div>
                                     <p className="text-[11px] font-medium leading-relaxed italic text-slate-500 dark:text-slate-400 px-1">"{exam.resulatat}"</p>
                                  </div>

                                  <div className="mt-auto pt-8 border-t border-pink-200/30 dark:border-white/5 flex items-center justify-between">
                                     <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                        <Check size={11} strokeWidth={3} className="text-pink-500" /> Signature Digitale Approuvée
                                     </span>
                                     <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">V-2.4.1</span>
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Validité Médicale</span>
                            <div className="flex items-center gap-3">
                               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                               <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Certifié</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default IRMPage;
