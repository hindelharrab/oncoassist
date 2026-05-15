import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  X, 
  ChevronRight, 
  Calendar, 
  User, 
  ClipboardList, 
  Trash2, 
  Edit3,
  CheckSquare,
  Square,
  FileCheck,
  Plus,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DocumentsPage = () => {
  const [activeTab, setActiveTab] = useState('ordonnances'); // 'ordonnances', 'rapport', 'resultats'
  const [selectedDoc, setSelectedDoc] = useState(null); // Document currently being viewed
  const [editingResult, setEditingResult] = useState(null); // Result currently being edited
  const [showNewOrdForm, setShowNewOrdForm] = useState(false);
  const [newOrd, setNewOrd] = useState({ etape: '', contenu: '' });
  const [ordonnances, setOrdonnances] = useState([
    { id: 1, etape: 'Examen manuel', date: '2026-05-01', medecin: 'Dr. Karimi', contenu: '- Paracétamol 500mg (3x/jour)\n- Repos strict 3 jours' },
    { id: 2, etape: 'IRM', date: '2026-05-05', medecin: 'Dr. Karimi', contenu: '- Bilan sanguin pré-opératoire\n- Jeûne de 6h requis' },
    { id: 3, etape: 'Échographie', date: '2026-05-08', medecin: 'Dr. Karimi', contenu: '- Biopsie à prévoir sous 48h\n- Continuer le traitement en cours' }
  ]);
  const [resultats, setResultats] = useState([
    { id: 1, examen: 'Mammographie', date: '2026-04-28', medecin: 'Dr. Mansouri', note: 'Masse suspecte quadrant supéro-externe gauche. ACR 4.', status: 'terminé' },
    { id: 2, examen: 'Échographie', date: '2026-05-08', medecin: 'Dr. Karimi', note: 'Confirmation nodule 15mm. Vascularisation atypique.', status: 'terminé' }
  ]);

  const [reportSelection, setReportSelection] = useState({
    infos: false,
    parcours: false,
    resultats: false,
    ordonnances: false,
    questionnaires: false
  });

  const handleAddOrdonnance = (e) => {
    e.preventDefault();
    if (!newOrd.contenu) return;
    const ord = {
      id: Date.now(),
      etape: 'Ordonnance',
      date: new Date().toISOString().split('T')[0],
      medecin: 'Dr. Karimi',
      contenu: newOrd.contenu,
      patient: 'Leïla Benali'
    };
    setOrdonnances([ord, ...ordonnances]);
    setNewOrd({ etape: '', contenu: '' });
    setShowNewOrdForm(false);
  };

  const handleDeleteResultat = (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce résultat ?')) {
      setResultats(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleUpdateResult = (e) => {
    e.preventDefault();
    setResultats(prev => prev.map(r => r.id === editingResult.id ? editingResult : r));
    setEditingResult(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleReportPart = (part) => {
    setReportSelection(prev => ({ ...prev, [part]: !prev[part] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8">
      {/* Patient Header */}
      <div className="max-w-7xl mx-auto mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-6 shadow-sm overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
         
         <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-pink-500/10">
               LB
            </div>
            <div>
               <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Leïla Benali</h1>
               <div className="flex items-center gap-3 mt-1 text-slate-500 dark:text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-pink-50/50 dark:bg-pink-900/10 text-pink-500 dark:text-pink-400 px-2 py-0.5 rounded-md">Cancer du Sein</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4 relative z-10">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
               <button 
                onClick={() => setActiveTab('ordonnances')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ordonnances' ? 'bg-pink-100 text-pink-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
               >
                 Ordonnances
               </button>
               <button 
                onClick={() => setActiveTab('resultats')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'resultats' ? 'bg-pink-100 text-pink-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
               >
                 Résultats
               </button>
               <button 
                onClick={() => setActiveTab('rapport')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'rapport' ? 'bg-pink-100 text-pink-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
               >
                 Rapport Dossier
               </button>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          {editingResult && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-lg font-black uppercase tracking-tight">Modifier le résultat</h3>
                  <button onClick={() => setEditingResult(null)} className="text-slate-400 hover:text-slate-950 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleUpdateResult} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Examen</label>
                    <input 
                      type="text" 
                      value={editingResult.examen}
                      onChange={(e) => setEditingResult({...editingResult, examen: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Note / Résultat</label>
                    <textarea 
                      value={editingResult.note}
                      onChange={(e) => setEditingResult({...editingResult, note: e.target.value})}
                      className="w-full h-32 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium italic outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-slate-950 dark:bg-pink-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                  >
                    Sauvegarder les modifications
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}

          {showNewOrdForm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-lg font-black uppercase tracking-tight">Nouvelle Ordonnance</h3>
                  <button onClick={() => setShowNewOrdForm(false)} className="text-slate-400 hover:text-slate-950 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddOrdonnance} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Patient</label>
                    <div className="w-full h-12 px-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-black flex items-center">
                      Leïla Benali
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Motif</label>
                    <textarea 
                      placeholder="Écrivez le motif de l'ordonnance..."
                      value={newOrd.contenu}
                      onChange={(e) => setNewOrd({...newOrd, contenu: e.target.value})}
                      className="w-full h-32 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium italic outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-slate-950 text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20"
                  >
                    Enregistrer l'ordonnance
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {selectedDoc ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[800px] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                      <FileText size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        {selectedDoc.type === 'ordonnance' ? `Ordonnance - ${selectedDoc.etape}` : `Dossier Médical - ${selectedDoc.patient}`}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aperçu pour impression</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePrint}
                    className="h-12 px-6 rounded-2xl bg-slate-900 dark:bg-pink-600 text-white text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20"
                  >
                    <Printer size={18} /> Imprimer
                  </button>
                  <button 
                    onClick={() => setSelectedDoc(null)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all shadow-sm"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-100/50 dark:bg-slate-950/20 p-6 md:p-12 flex flex-col items-center overflow-y-auto">
                <div id="printable-doc" className={`${selectedDoc.type === 'ordonnance' ? 'w-[148mm] min-h-[210mm]' : 'w-[210mm] min-h-[297mm]'} bg-white dark:bg-white p-[15mm] md:p-[20mm] shadow-2xl relative flex flex-col print:shadow-none print:w-full print:p-[10mm]`}>
                  {/* Watermark for digital view */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-35deg] print:hidden">
                    <span className={`${selectedDoc.type === 'ordonnance' ? 'text-4xl' : 'text-6xl'} font-black uppercase tracking-[0.6em] text-pink-900`}>ONCOASSIST</span>
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className={`${selectedDoc.type === 'ordonnance' ? 'mb-8' : 'mb-16'} flex justify-between items-start`}>
                      <div>
                        <h2 className={`${selectedDoc.type === 'ordonnance' ? 'text-lg' : 'text-xl'} font-black tracking-tighter text-slate-900 italic`}>CLINIQUE DU SEIN</h2>
                        <p className="text-[9px] font-bold text-slate-500 mt-1 italic">Pôle d'excellence en oncologie</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-pink-500">
                          {selectedDoc.type === 'ordonnance' ? 'Ordonnance' : selectedDoc.type === 'resultat' ? 'Compte-Rendu' : 'Rapport Médical'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">{new Date().toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>

                    <div className={`${selectedDoc.type === 'ordonnance' ? 'mb-10 gap-8' : 'mb-16 gap-12'} grid grid-cols-2`}>
                      <div className="space-y-3">
                        <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Patient</h5>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase">Leïla Benali</p>
                          <p className="text-[10px] font-medium text-slate-600">42 ans • Casablanca, MAROC</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Praticien</h5>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase">{selectedDoc.medecin || 'Dr. Karimi'}</p>
                          <p className="text-[10px] font-medium text-slate-600">Oncologue Sénologue</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-12">
                      {selectedDoc.type === 'ordonnance' ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                          <div className="flex items-center gap-3 opacity-10">
                            <div className="h-px flex-1 bg-slate-950" />
                            <FileCheck size={18} className="text-slate-950" />
                            <div className="h-px flex-1 bg-slate-950" />
                          </div>
                          <div className="font-serif italic text-slate-800 text-base leading-relaxed px-4 md:px-8 text-center mt-12">
                            {selectedDoc.contenu?.split('\n').map((line, i) => (
                              <p key={i} className="mb-3">{line}</p>
                            ))}
                          </div>
                        </div>
                      ) : selectedDoc.type === 'resultat' ? (
                        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                           <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 italic">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-white pb-3">Détails de l'Examen</h4>
                              <div className="space-y-6">
                                 <div>
                                    <p className="text-[9px] font-black uppercase text-pink-500 mb-1">Examen pratiqué</p>
                                    <p className="text-sm font-black text-slate-900 uppercase">{selectedDoc.examen}</p>
                                 </div>
                                 <div className="text-sm font-serif leading-relaxed text-slate-800 whitespace-pre-wrap">
                                    {selectedDoc.note}
                                 </div>
                              </div>
                           </div>
                           <div className="mt-12 text-[10px] font-medium text-slate-500 leading-relaxed max-w-md">
                              Ce document est un duplicata numérique certifié conforme à l'original archivé dans le dossier patient.
                           </div>
                        </div>
                      ) : (
                        <div className="space-y-12 animate-in slide-in-from-bottom duration-700">
                          {selectedDoc.selection?.infos && (
                            <section>
                              <h4 className="text-xs font-black uppercase text-pink-500 tracking-widest mb-4 border-l-4 border-pink-500 pl-3">Antécédents & Terrain</h4>
                              <p className="text-xs font-serif leading-relaxed text-slate-700 italic">Patient de 42 ans, sans antécédents familiaux notables. Début du protocole d'exploration suite à la découverte fortuite d'un nodule mammaire gauche via auto-examen.</p>
                            </section>
                          )}
                          {selectedDoc.selection?.parcours && (
                            <section>
                              <h4 className="text-xs font-black uppercase text-pink-500 tracking-widest mb-4 border-l-4 border-pink-500 pl-3">Résumé du Parcours</h4>
                              <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                                <div className="text-xs">
                                  <span className="font-black text-slate-900">01/05/2026 :</span> Examen manuel révélant nodule QSEG fixe.
                                </div>
                                <div className="text-xs">
                                  <span className="font-black text-slate-900">05/05/2026 :</span> IRM confirmant lésion tissulaire vascularisée.
                                </div>
                                <div className="text-xs italic text-slate-400">Dossier en cours d'exploration histologique.</div>
                              </div>
                            </section>
                          )}
                          {selectedDoc.selection?.resultats && (
                            <section>
                              <h4 className="text-xs font-black uppercase text-pink-500 tracking-widest mb-4 border-l-4 border-pink-500 pl-3">Bilan des Résultats</h4>
                              <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                                <div className="flex justify-between border-b border-white pb-2">
                                  <span className="text-[10px] font-black">Mammographie</span>
                                  <span className="text-[10px] font-serif italic">ACR 4</span>
                                </div>
                                <div className="flex justify-between border-b border-white pb-2">
                                  <span className="text-[10px] font-black">Échographie</span>
                                  <span className="text-[10px] font-serif italic">Confirmation Nodule 15mm</span>
                                </div>
                              </div>
                            </section>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-10 flex justify-between items-end border-t border-slate-100 pb-4">
                      <div className="space-y-1">
                        <p className="text-[6px] text-slate-400 uppercase font-black">Réf document</p>
                        <p className="text-[7px] font-mono font-bold text-slate-900">ONCO-94-LB-2026</p>
                      </div>
                      <div className="text-center opacity-30 flex flex-col items-center">
                         <div className="w-12 h-12 border border-slate-300 rounded flex items-center justify-center p-1 mb-1">
                            <span className="text-[6px] font-mono leading-none rotate-45 text-center">QR CODE VALIDÉ</span>
                         </div>
                         <p className="text-[5px] font-black uppercase">Signé électroniquement</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="tabs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Main Content Area */}
              <div className="lg:col-span-12">
                <AnimatePresence mode="wait">
                  {activeTab === 'ordonnances' && (
                    <motion.div 
                      key="ordonnances"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {ordonnances.map((ord, i) => (
                        <motion.div 
                          key={ord.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-pink-500/5 transition-all overflow-hidden relative"
                        >
                           <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-pink-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                           
                           <div className="flex items-center justify-between mb-6">
                              <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-900/20 text-pink-500 dark:text-pink-400 group-hover:scale-110 transition-transform duration-500">
                                 <ClipboardList size={20} />
                              </div>
                              <div className="flex items-center gap-1">
                                <button className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                  <Edit3 size={14} />
                                </button>
                                <button className="p-2 text-slate-300 hover:text-rose-400 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div>
                                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Séance / Étape</h4>
                                 <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{ord.etape}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</h4>
                                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                       <Calendar size={12} className="text-pink-500" /> {ord.date}
                                    </p>
                                 </div>
                                 <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Médecin</h4>
                                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                       <User size={12} className="text-pink-500" /> {ord.medecin}
                                    </p>
                                 </div>
                              </div>
                           </div>

                           <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                              <button 
                                onClick={() => setSelectedDoc({ type: 'ordonnance', ...ord })}
                                className="w-full h-12 rounded-2xl bg-slate-950 dark:bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10"
                              >
                                 <Eye size={16} /> Voir & Imprimer
                              </button>
                           </div>
                        </motion.div>
                      ))}
                      
                      {/* Blank Card Tip */}
                      <div 
                        onClick={() => setShowNewOrdForm(true)}
                        className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover:border-pink-300 transition-all hover:bg-pink-50/20"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-pink-400 group-hover:scale-110 transition-all duration-500 shadow-sm border border-slate-100 dark:border-slate-700">
                          <Plus size={24} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-pink-500 dark:group-hover:text-white transition-colors">Ajouter Ordonnance</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter italic">Pour Leïla Benali</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'resultats' && (
                    <motion.div 
                      key="resultats"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {resultats.map((res, i) => (
                        <motion.div 
                          key={res.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-6 shadow-sm hover:shadow-xl hover:shadow-pink-500/5 transition-all group"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-pink-400 group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 transition-all duration-500">
                               <FileText size={22} />
                            </div>
                            <div>
                               <div className="flex items-center gap-3">
                                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">{res.examen}</h4>
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Validé</span>
                                  </div>
                               </div>
                               <div className="flex items-center gap-4 mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <span className="flex items-center gap-1.5"><Calendar size={10} className="text-pink-400" /> {res.date}</span>
                                  <span className="flex items-center gap-1.5"><User size={10} className="text-pink-400" /> {res.medecin}</span>
                               </div>
                            </div>
                          </div>

                          <div className="flex-1 max-w-md px-6 py-2 hidden md:block">
                             <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                               <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 italic line-clamp-1">"{res.note}"</p>
                             </div>
                          </div>

                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => setSelectedDoc({ type: 'resultat', etape: res.examen, contenu: res.note, ...res })}
                               className="h-10 px-4 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 text-[9px] font-black uppercase tracking-widest hover:bg-pink-400 hover:text-white transition-all flex items-center gap-2"
                             >
                                <Eye size={14} /> Voir Doc
                             </button>
                             <button 
                               onClick={() => handlePrint()}
                               className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 transition-all"
                             >
                                <Printer size={16} />
                             </button>
                             <button 
                               onClick={() => setEditingResult({...res})}
                               className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 transition-all"
                             >
                                <Edit3 size={16} />
                             </button>
                             <button 
                               onClick={() => handleDeleteResultat(res.id)}
                               className="p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-all"
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'rapport' && (
                    <motion.div 
                      key="rapport"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 shadow-sm relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
                       <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full -translate-x-32 translate-y-32" />
 
                       <div className="relative z-10 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                          {/* Selection Card on the Left */}
                          <div className="flex flex-col gap-3">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 text-left">Sélectionner les parties :</h4>
                            {Object.keys(reportSelection).map(key => (
                              <button 
                                key={key}
                                onClick={() => toggleReportPart(key)}
                                className={`flex items-center gap-3 p-4 rounded-2xl transition-all border ${reportSelection[key] ? 'bg-pink-50 text-pink-500 border-pink-200 shadow-sm' : 'bg-white dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-pink-100'}`}
                              >
                                {reportSelection[key] ? <CheckSquare size={18} /> : <Square size={18} />}
                                <span className="text-[10px] font-black uppercase tracking-widest">{key}</span>
                              </button>
                            ))}
                          </div>
 
                          {/* Right Content */}
                          <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-8 text-center px-4 lg:px-8 lg:border-l border-slate-100 dark:border-slate-800">
                             <div className="w-24 h-24 rounded-[3rem] bg-pink-50 dark:bg-pink-900/10 flex items-center justify-center text-pink-400 shadow-xl shadow-pink-500/5 scale-110 mb-2 animate-pulse">
                                <ClipboardList size={48} />
                             </div>
                             
                             <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Rapport de Synthèse</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Patient : Leïla Benali</p>
                             </div>
 
                             <div className="flex flex-col gap-3 w-full max-w-xs">
                                <button 
                                  onClick={() => {
                                    const anySelected = Object.values(reportSelection).some(v => v);
                                    const finalSelection = anySelected ? reportSelection : {
                                      infos: true,
                                      parcours: true,
                                      resultats: true,
                                      ordonnances: true,
                                      questionnaires: true
                                    };
                                    setSelectedDoc({ type: 'rapport', patient: 'Leïla Benali', selection: finalSelection });
                                  }}
                                  className="h-12 rounded-xl bg-slate-950 dark:bg-pink-600 text-white text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20"
                                >
                                   <Eye size={18} /> Aperçu {Object.values(reportSelection).some(v => v) ? 'Personnalisé' : 'Complet'}
                                </button>
                                <button className="h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                                   <Download size={16} className="inline mr-2" /> PDF
                                </button>
 
                                <div className="mt-4 bg-slate-50 dark:bg-slate-800/10 p-5 rounded-2xl text-left border border-slate-100 dark:border-slate-800/50">
                                   <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-pink-300 pl-4">
                                      "Ce rapport compilera toutes les données cliniques, les examens d'imagerie, les biopsies et les prescriptions du patient dans un document PDF structuré."
                                   </p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DocumentsPage;
