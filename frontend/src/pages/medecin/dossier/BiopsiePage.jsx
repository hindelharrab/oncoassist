import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Calendar, Trash2, Edit2, Microscope, X, Save,
  FileText, Image as ImageIcon, Upload, Zap, Target,
  FileSearch, ChevronRight, ChevronLeft, AlertCircle, FileCheck,
  BrainCircuit, Eye, EyeOff, Activity, Check, ClipboardList,
  ShieldCheck, ScanLine, FlaskConical
} from 'lucide-react';
import {
  getBiopsiesByDossier,
  creerBiopsie,
  modifierBiopsie,
  supprimerBiopsie,
  analyserBiopsie
} from '../../../services/biopsieService';

const TYPE_LABELS = {
  fibroadenoma      : 'Fibroadénome',
  tubular_adenoma   : 'Adénome Tubulaire',
  ductal_carcinoma  : 'Carcinome Canalaire',
  mucinous_carcinoma: 'Carcinome Mucineux',
};

const BiopsiePage = () => {
  const { id: dossierId } = useParams();

  const [view, setView]                           = useState('list');
  const [isAnalyzing, setIsAnalyzing]             = useState(false);
  const [isSaving, setIsSaving]                   = useState(false);
  const [isLoading, setIsLoading]                 = useState(true);
  const [analysisResult, setAnalysisResult]       = useState(null);
  const [selectedImagePair, setSelectedImagePair] = useState(null);
  const [currentExamen, setCurrentExamen]         = useState(null);
  const [isEditing, setIsEditing]                 = useState(false);
  const [errorMsg, setErrorMsg]                   = useState(null);
  const [biopsieEnCours, setBiopsieEnCours]       = useState(null);
  const [examens, setExamens]                     = useState([]);
  const [analyseEditFaite, setAnalyseEditFaite]   = useState(false);

  const [formData, setFormData] = useState({
    siteAnatomique : 'Sein gauche',
    grossissement  : '400X',
    visiblePatient : false,
    date           : new Date().toLocaleDateString('fr-FR'),
    notes          : '',
    images         : []
  });

  const imageUrl = (chemin) => {
    if (!chemin) return null;
    if (chemin.startsWith('http')) return chemin;
    return `http://localhost:8080${chemin}`;
  };

  useEffect(() => {
    if (!dossierId) return;
    setIsLoading(true);
    getBiopsiesByDossier(dossierId)
      .then(res => setExamens(res.data))
      .catch(() => setErrorMsg('Impossible de charger les biopsies.'))
      .finally(() => setIsLoading(false));
  }, [dossierId]);

  const resetForm = () => {
    setFormData({ siteAnatomique: 'Sein gauche', grossissement: '400X', visiblePatient: false, date: new Date().toLocaleDateString('fr-FR'), notes: '', images: [] });
    setAnalysisResult(null);
    setErrorMsg(null);
    setBiopsieEnCours(null);
    setAnalyseEditFaite(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({ id: Math.random(), name: file.name, file, url: URL.createObjectURL(file) }));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  const removeImage = (id) => setFormData(prev => ({ ...prev, images: prev.images.filter(img => img.id !== id) }));

  const handleDelete = async (examId) => {
    if (!window.confirm("Supprimer cet examen ? Cette action est irréversible.")) return;
    try {
      await supprimerBiopsie(examId);
      setExamens(prev => prev.filter(ex => ex.id !== examId));
      setView('list');
      setCurrentExamen(null);
    } catch { setErrorMsg("Erreur lors de la suppression."); }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await modifierBiopsie(currentExamen.id, { siteAnatomique: formData.siteAnatomique, grossissement: formData.grossissement, visiblePatient: formData.visiblePatient, notes: formData.notes });
      if (formData.images.length > 0 && !analyseEditFaite) {
        await analyserBiopsie(currentExamen.id, formData.images, formData.grossissement);
      }
      const updated = await getBiopsiesByDossier(dossierId);
      const updatedCurrent = updated.data.find(e => e.id === currentExamen.id);
      setExamens(updated.data);
      setCurrentExamen(updatedCurrent);
      setIsEditing(false);
      setAnalysisResult(null);
      setAnalyseEditFaite(false);
      setFormData(prev => ({ ...prev, images: [] }));
    } catch { setErrorMsg("Erreur lors de la modification."); }
    finally { setIsSaving(false); }
  };

  const handleAnalyze = async () => {
    if (formData.images.length === 0) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      if (biopsieEnCours) {
        const analyseRes = await analyserBiopsie(biopsieEnCours, formData.images, formData.grossissement);
        setAnalysisResult({ ...analyseRes.data, biopsieId: biopsieEnCours });
        const updated = await getBiopsiesByDossier(dossierId);
        setExamens(updated.data);
        return;
      }
      const res = await creerBiopsie({ dossierId, siteAnatomique: formData.siteAnatomique, grossissement: formData.grossissement, visiblePatient: formData.visiblePatient, date: new Date().toISOString(), notes: formData.notes });
      const biopsieId = res.data.id;
      setBiopsieEnCours(biopsieId);
      const analyseRes = await analyserBiopsie(biopsieId, formData.images, formData.grossissement);
      setAnalysisResult({ ...analyseRes.data, biopsieId });
      const updated = await getBiopsiesByDossier(dossierId);
      setExamens(updated.data);
    } catch { setErrorMsg("Erreur lors de l'analyse IA. Vérifiez que FastAPI est lancé."); }
    finally { setIsAnalyzing(false); }
  };

  const handleAnalyzeEdit = async () => {
    if (formData.images.length === 0) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const analyseRes = await analyserBiopsie(currentExamen.id, formData.images, formData.grossissement);
      setAnalysisResult(analyseRes.data);
      setAnalyseEditFaite(true);
    } catch { setErrorMsg("Erreur lors de l'analyse IA."); }
    finally { setIsAnalyzing(false); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      if (biopsieEnCours) {
        if (formData.notes && formData.notes.trim() !== '') {
          await modifierBiopsie(biopsieEnCours, { siteAnatomique: formData.siteAnatomique, grossissement: formData.grossissement, visiblePatient: formData.visiblePatient, notes: formData.notes });
        }
        const updated = await getBiopsiesByDossier(dossierId);
        setExamens(updated.data);
        setView('list');
        resetForm();
        return;
      }
      await creerBiopsie({ dossierId, siteAnatomique: formData.siteAnatomique, grossissement: formData.grossissement, visiblePatient: formData.visiblePatient, date: new Date().toISOString(), notes: formData.notes });
      const updated = await getBiopsiesByDossier(dossierId);
      setExamens(updated.data);
      setView('list');
      resetForm();
    } catch { setErrorMsg("Erreur lors de la sauvegarde."); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-white">
      <div className="p-3 lg:p-5 max-w-[1600px] mx-auto space-y-5 font-sans">

        {/* ══ HEADER ══ */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center">
              <Microscope size={18} className="text-pink-500" strokeWidth={2.3} />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-black tracking-tight uppercase">Analyse de Biopsie</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                <span className="text-[8px] font-bold text-black dark:text-white uppercase tracking-[0.25em]">Pathologie Numérique & IA</span>
                <span className="px-2 py-0.5 rounded-full border border-pink-200 bg-pink-50 text-pink-700 text-[8px] font-bold uppercase tracking-[0.2em]">V-1.2.0 ACTIVE</span>
              </div>
            </div>
          </div>
          {view === 'list' ? (
            <button onClick={() => setView('add')}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-950 text-white font-bold text-[9px] uppercase tracking-[0.22em] shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98]">
              <Plus size={13} /> Nouvelle Biopsie
            </button>
          ) : (
            <button onClick={() => { setView('list'); resetForm(); setIsEditing(false); }}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-950 text-white font-bold text-[9px] uppercase tracking-[0.22em] shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98]">
              <ChevronLeft size={13} /> Retour à la liste
            </button>
          )}
        </div>

        {/* Erreur */}
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <p className="text-[11px] font-bold text-rose-600">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="ml-auto text-rose-400 hover:text-rose-600"><X size={14} /></button>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ════════════════════════════════
              VUE LISTE
          ════════════════════════════════ */}
          {view === 'list' && (
            <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
              {isLoading ? (
                <div className="py-24 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-pink-500 rounded-full animate-spin" />
                </div>
              ) : examens.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 mb-5 border border-slate-200 dark:border-slate-800">
                    <Microscope size={36} strokeWidth={1} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucune biopsie enregistrée</p>
                </div>
              ) : examens.map((exam, idx) => {
                const isMalin = exam.classeBinaire === 'MALIN';
                return (
                  <motion.div key={exam.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.03)] overflow-hidden">

                    {/* Card Header */}
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-white to-pink-50/20 dark:from-slate-950 dark:to-pink-950/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                          <Calendar size={22} className="text-black dark:text-white" />
                        </div>
                        <div>
                          <h2 className="text-base font-black uppercase tracking-tight">Le {exam.date ? new Date(exam.date).toLocaleDateString('fr-FR') : '—'}</h2>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-pink-600 uppercase tracking-widest">Biopsie: {exam.siteAnatomique}</span>
                            <span className="text-slate-200 dark:text-slate-700">•</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dr. {exam.auteurPrenom} {exam.auteurNom}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {exam.isAnalysed && (
                          <span className={`h-8 px-4 flex items-center rounded-lg border text-[9px] font-black uppercase tracking-widest ${isMalin ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            {exam.classeBinaire}
                          </span>
                        )}
                        <button onClick={() => { setCurrentExamen(exam); setView('detail'); setIsEditing(false); }}
                          className="flex items-center gap-2 h-8 px-4 rounded-lg bg-slate-950 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">
                          Voir Détail <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Card Body — 3 colonnes comme IRM/Echo */}
                    <div className="p-4 lg:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-stretch">

                        {/* Bloc 1 — Paramètres + miniatures */}
                        <div className="xl:col-span-4 flex flex-col gap-4">
                          <div className="flex-1 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm flex flex-col">
                            {(exam.imagesAnalysees?.length || 0) > 0 ? (
                              <div className="group relative bg-black aspect-[4/3] overflow-hidden shrink-0">
                                <img src={imageUrl(exam.imagesAnalysees[0].cheminImage)} alt="Cliché" className="w-full h-full object-cover opacity-90 transition-all duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                                  <span className="text-[9px] font-black text-pink-500 uppercase tracking-[0.3em] flex items-center gap-1.5 mb-1">
                                    <Zap size={10} strokeWidth={3} /> Cliché de référence
                                  </span>
                                  <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">{exam.imagesAnalysees.length} région{exam.imagesAnalysees.length > 1 ? 's' : ''} analysée{exam.imagesAnalysees.length > 1 ? 's' : ''}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-2 text-slate-300 shrink-0">
                                <ImageIcon size={28} strokeWidth={1} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Aucune image</span>
                              </div>
                            )}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Localisation</h4>
                                  <div className="px-2.5 py-0.5 rounded-full bg-pink-500 text-[8px] font-black text-white uppercase tracking-widest shadow-lg shadow-pink-500/20">{exam.grossissement}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Site</span>
                                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-tight">{exam.siteAnatomique}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Régions</span>
                                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{exam.imagesAnalysees?.length || 0} zone{(exam.imagesAnalysees?.length || 0) > 1 ? 's' : ''}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                                  <Check size={10} strokeWidth={3} className="text-pink-500" /> Signature Digitale
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bloc 2 — Analyse IA */}
                        <div className="xl:col-span-4 flex flex-col">
                          <div className="flex-1 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col">
                            <div className="flex items-center gap-2.5 mb-4">
                              <div className="w-1 h-5 bg-pink-500 rounded-full" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.25em]">Analyse IA</h4>
                            </div>
                            {exam.isAnalysed ? (
                              <div className="space-y-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Score Bénin/Malin</span>
                                      <span className="text-sm font-black tabular-nums">{((exam.scoreBenignMalin || 0) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${(exam.scoreBenignMalin || 0) * 100}%` }}
                                        className={`h-full rounded-full ${isMalin ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confiance Type</span>
                                      <span className="text-sm font-black tabular-nums">{((exam.scoreTypeConfiance || 0) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${(exam.scoreTypeConfiance || 0) * 100}%` }}
                                        className="h-full rounded-full bg-blue-500" />
                                    </div>
                                  </div>
                                </div>
                                {exam.typeTumeur && (
                                  <div className="p-4 rounded-2xl border border-pink-100 dark:border-pink-900/30 bg-pink-50/70 dark:bg-pink-950/20 shadow-xl">
                                    <span className="text-[9px] font-black text-pink-600 dark:text-pink-500 uppercase tracking-[0.25em]">Sous-type identifié</span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                      <p className="text-base font-black uppercase text-slate-900 dark:text-white">{TYPE_LABELS[exam.typeTumeur] || exam.typeTumeur}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-slate-300 dark:text-slate-700">
                                <BrainCircuit size={28} strokeWidth={1} />
                                <p className="text-[9px] font-black uppercase tracking-widest">Non analysé</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bloc 3 — Diagnostic */}
                        <div className="xl:col-span-4 flex flex-col">
                          {exam.isAnalysed ? (
                            <div className={`flex-1 relative rounded-3xl p-6 overflow-hidden shadow-sm border flex flex-col group ${isMalin ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100/50 dark:border-rose-900/20' : 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/20'}`}>
                              <div className={`absolute top-0 right-0 w-48 h-48 blur-[100px] rounded-full opacity-30 group-hover:scale-125 transition-transform duration-1000 ${isMalin ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                              <div className="relative z-10 space-y-4 flex-1 flex flex-col">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1.5">
                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isMalin ? 'text-rose-500' : 'text-emerald-600'}`}>Diagnostic IA</h4>
                                    <p className="text-base font-black uppercase text-slate-900 dark:text-white leading-none tracking-tight">{exam.classeBinaire}</p>
                                  </div>
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-105 ${isMalin ? 'bg-rose-500 shadow-rose-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
                                    {isMalin ? <AlertCircle size={26} className="text-white" /> : <ShieldCheck size={26} className="text-white" />}
                                  </div>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-white/10 flex-1 flex flex-col">
                                  <div className={`p-4 rounded-xl border ${isMalin ? 'bg-rose-50/50 border-rose-100 dark:border-rose-900/30' : 'bg-emerald-50/50 border-emerald-100 dark:border-emerald-900/30'}`}>
                                    <p className={`text-[12px] font-black uppercase leading-relaxed tracking-tight ${isMalin ? 'text-rose-700' : 'text-emerald-700'}`}>
                                      {isMalin ? '⚠ Présence probable de tissu malin' : '✓ Tissu probablement bénin'}
                                    </p>
                                  </div>
                                  <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                                    <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-slate-400">
                                      <Check size={10} strokeWidth={3} className="text-pink-500" /> Signature Digitale Approuvée
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400">IA · v1.2</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-950">
                              <div className="text-center py-8 space-y-2">
                                <BrainCircuit size={28} className="mx-auto text-slate-200 dark:text-slate-700" strokeWidth={1} />
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Aucune analyse IA</p>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ════════════════════════════════
              VUE DETAIL
          ════════════════════════════════ */}
          {view === 'detail' && currentExamen && (
            <motion.div key="detail" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-5 pb-10">

              {/* Actions bar */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <Target size={14} className="text-pink-500" />
                  </div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Actions sur l'examen</h2>
                </div>
                <div className="flex items-center gap-3">
                  {!isEditing ? (
                    <>
                      <button onClick={() => { setFormData({ siteAnatomique: currentExamen.siteAnatomique, grossissement: currentExamen.grossissement, visiblePatient: currentExamen.visiblePatient, notes: currentExamen.notes || '', date: currentExamen.date, images: [] }); setIsEditing(true); }}
                        className="flex items-center gap-2 h-9 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-sm">
                        <Edit2 size={12} /> Modifier l'examen
                      </button>
                      <button onClick={() => handleDelete(currentExamen.id)}
                        className="flex items-center gap-2 h-9 px-4 rounded-xl bg-white dark:bg-slate-950 border border-rose-100 dark:border-rose-900/30 text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-all shadow-sm">
                        <Trash2 size={12} /> Supprimer
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button onClick={() => { setIsEditing(false); setAnalysisResult(null); setAnalyseEditFaite(false); setFormData(prev => ({ ...prev, images: [] })); }}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 underline decoration-slate-200">
                        Annuler les modifs
                      </button>
                      <button onClick={handleUpdate} disabled={isSaving}
                        className="flex items-center gap-2 h-9 px-6 rounded-xl bg-pink-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-pink-200 disabled:opacity-50">
                        {isSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={12} />}
                        Enregistrer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div key="view-mode" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 items-stretch">

                      {/* Bloc 1 — Image + Infos */}
                      <div className="xl:col-span-4 flex flex-col gap-5">
                        <div className="flex-1 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm flex flex-col">
                          {(currentExamen.imagesAnalysees?.length || 0) > 0 ? (
                            <div className="group relative bg-black aspect-[4/3] overflow-hidden shrink-0">
                              <img src={imageUrl(currentExamen.imagesAnalysees[0].cheminImage)} alt="Cliché" className="w-full h-full object-cover opacity-90 transition-all duration-700 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-5 flex flex-col justify-end">
                                <span className="text-[9px] font-black text-pink-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
                                  <Zap size={10} strokeWidth={3} /> Cliché de référence
                                </span>
                                <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">{currentExamen.imagesAnalysees.length} région{currentExamen.imagesAnalysees.length > 1 ? 's' : ''} analysée{currentExamen.imagesAnalysees.length > 1 ? 's' : ''}</p>
                              </div>
                              <button onClick={() => setSelectedImagePair(currentExamen.imagesAnalysees[0])}
                                className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30 shadow-2xl">
                                <FileSearch size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-3 text-slate-300 shrink-0">
                              <ImageIcon size={32} strokeWidth={1} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Aucune image</span>
                            </div>
                          )}
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Informations</h4>
                                <div className="px-2.5 py-0.5 rounded-full bg-pink-500 text-[8px] font-black text-white uppercase tracking-widest shadow-lg shadow-pink-500/20">{currentExamen.grossissement}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Site</span>
                                  <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-tight">{currentExamen.siteAnatomique}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Date</span>
                                  <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{currentExamen.date ? new Date(currentExamen.date).toLocaleDateString('fr-FR') : '—'}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Praticien</span>
                                  <p className="text-[11px] font-black text-slate-900 dark:text-white">Dr. {currentExamen.auteurPrenom} {currentExamen.auteurNom}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Visibilité</span>
                                  <div className={`flex items-center gap-1 text-[11px] font-black uppercase ${currentExamen.visiblePatient ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {currentExamen.visiblePatient ? <Eye size={11} /> : <EyeOff size={11} />}
                                    {currentExamen.visiblePatient ? 'Visible' : 'Privé'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                                <Check size={10} strokeWidth={3} className="text-pink-500" /> Signature Digitale Approuvée
                              </span>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bloc 2 — Images Grid */}
                      <div className="xl:col-span-4 flex flex-col gap-5">
                        <div className="flex-1 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col">
                          <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-1 h-5 bg-pink-500 rounded-full" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.25em]">Images & Heatmaps Grad-CAM</h4>
                          </div>
                          {(currentExamen.imagesAnalysees?.length || 0) > 0 ? (
                            <div className="grid grid-cols-2 gap-3 flex-1">
                              {currentExamen.imagesAnalysees.slice(0, 4).map((img, i) => (
                                <div key={img.id} className="space-y-2">
                                  <div onClick={() => setSelectedImagePair(img)} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer group hover:border-slate-300 transition-all relative shadow-sm">
                                    <img src={imageUrl(img.cheminImage)} alt="Original" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                      <Eye size={18} className="text-white" />
                                    </div>
                                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[8px] font-bold text-white uppercase">Orig.</div>
                                  </div>
                                  {img.cheminGradCam && (
                                    <div onClick={() => setSelectedImagePair(img)} className="aspect-square rounded-2xl overflow-hidden border-2 border-pink-100 dark:border-pink-900/30 cursor-pointer group hover:border-pink-300 transition-all relative shadow-sm">
                                      <img src={imageUrl(img.cheminGradCam)} alt="Grad-CAM" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                        <Eye size={18} className="text-white" />
                                      </div>
                                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-pink-600/80 text-[8px] font-bold text-white uppercase">CAM</div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-center">
                              <div className="text-center space-y-2">
                                <ImageIcon size={28} className="mx-auto text-slate-300" strokeWidth={1} />
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Aucune image analysée</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText size={12} className="text-slate-400" />
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Compte-rendu</h3>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-inner">
                            <p className="text-[11px] font-medium leading-relaxed italic text-slate-500 dark:text-slate-400">
                              "{currentExamen.notes || 'Aucune conclusion rédigée pour cet examen.'}"
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bloc 3 — Diagnostic IA */}
                      <div className="xl:col-span-4 flex flex-col">
                        {currentExamen.isAnalysed ? (
                          <div className={`flex-1 relative rounded-3xl p-6 overflow-hidden shadow-sm border flex flex-col group ${currentExamen.classeBinaire === 'MALIN' ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100/50 dark:border-rose-900/20' : 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/20'}`}>
                            <div className={`absolute top-0 right-0 w-48 h-48 blur-[100px] rounded-full opacity-30 group-hover:scale-125 transition-transform duration-1000 ${currentExamen.classeBinaire === 'MALIN' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                            <div className="relative z-10 space-y-5 flex-1 flex flex-col">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1.5">
                                  <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${currentExamen.classeBinaire === 'MALIN' ? 'text-rose-500' : 'text-emerald-600'}`}>Diagnostic IA</h4>
                                  <p className="text-xl font-black uppercase text-slate-900 dark:text-white leading-none">{currentExamen.classeBinaire}</p>
                                </div>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-105 ${currentExamen.classeBinaire === 'MALIN' ? 'bg-rose-500 shadow-rose-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
                                  {currentExamen.classeBinaire === 'MALIN' ? <AlertCircle size={26} className="text-white" /> : <ShieldCheck size={26} className="text-white" />}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Score Bénin/Malin</span>
                                    <span className="text-sm font-black tabular-nums">{((currentExamen.scoreBenignMalin || 0) * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="h-3 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden shadow-inner">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(currentExamen.scoreBenignMalin || 0) * 100}%` }}
                                      className={`h-full rounded-full ${currentExamen.classeBinaire === 'MALIN' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confiance Type</span>
                                    <span className="text-sm font-black tabular-nums">{((currentExamen.scoreTypeConfiance || 0) * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="h-3 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden shadow-inner">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(currentExamen.scoreTypeConfiance || 0) * 100}%` }}
                                      className="h-full rounded-full bg-blue-500" />
                                  </div>
                                </div>
                              </div>

                              {currentExamen.typeTumeur && (
                                <div className="p-4 rounded-2xl border border-pink-100 dark:border-pink-900/30 bg-pink-50/70 dark:bg-pink-950/20 shadow-xl">
                                  <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${currentExamen.classeBinaire === 'MALIN' ? 'text-rose-500' : 'text-emerald-600'}`}>Sous-type identifié</span>
                                  <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase mt-1">{TYPE_LABELS[currentExamen.typeTumeur] || currentExamen.typeTumeur}</p>
                                </div>
                              )}

                              <div className="flex-1" />

                              <div className={`p-4 rounded-xl border ${currentExamen.classeBinaire === 'MALIN' ? 'bg-rose-50/50 border-rose-200 dark:border-rose-900/30' : 'bg-emerald-50/50 border-emerald-200 dark:border-emerald-900/30'}`}>
                                <p className={`text-[11px] font-black uppercase leading-relaxed ${currentExamen.classeBinaire === 'MALIN' ? 'text-rose-700' : 'text-emerald-700'}`}>
                                  {currentExamen.classeBinaire === 'MALIN' ? '⚠ Présence probable de tissu malin — Confirmation clinique requise' : '✓ Tissu probablement bénin — Surveillance recommandée'}
                                </p>
                              </div>

                              <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                                <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-slate-400">
                                  <Check size={10} strokeWidth={3} className="text-pink-500" /> Signature Digitale Approuvée
                                </span>
                                <span className="text-[9px] font-bold text-slate-400">IA · v1.2</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center p-12 bg-white dark:bg-slate-950">
                            <div className="text-center space-y-3">
                              <BrainCircuit size={32} className="mx-auto text-slate-200 dark:text-slate-700" strokeWidth={1} />
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Aucune analyse IA</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                ) : (
                  /* ── MODE ÉDITION ── */
                  <motion.div key="edit-mode" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

                    <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden border-t-8 border-t-pink-500">
                      <div className="px-7 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-pink-50/50 to-white dark:from-slate-900 dark:to-slate-950 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-200"><Target size={16} strokeWidth={2.5} /></div>
                        <h2 className="text-base font-black uppercase tracking-tight">Paramètres de l'Examen</h2>
                      </div>
                      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-5">
                        <FieldSelect label="Site Anatomique" value={formData.siteAnatomique} onChange={v => setFormData(p => ({ ...p, siteAnatomique: v }))} options={[['Sein gauche','SEIN GAUCHE'],['Sein droit','SEIN DROIT'],['Sein gauche - Quadrant Supéro-Interne','SEIN G. – QSI'],['Sein gauche - Quadrant Supéro-Externe','SEIN G. – QSE']]} />
                        <FieldSelect label="Grossissement" value={formData.grossissement} onChange={v => setFormData(p => ({ ...p, grossissement: v }))} options={[['40X','40X'],['100X','100X'],['200X','200X'],['400X','400X']]} />
                        <div className="space-y-1">
                          <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Visibilité Patient</label>
                          <button onClick={() => setFormData(p => ({ ...p, visiblePatient: !p.visiblePatient }))}
                            className={`w-full h-10 flex items-center justify-between px-4 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${formData.visiblePatient ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <div className="flex items-center gap-2">{formData.visiblePatient ? <Eye size={14} /> : <EyeOff size={14} />}<span>{formData.visiblePatient ? 'Visible' : 'Privé'}</span></div>
                            <div className={`w-8 h-4 rounded-full relative ${formData.visiblePatient ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${formData.visiblePatient ? 'right-0.5' : 'left-0.5'}`} />
                            </div>
                          </button>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Date</label>
                          <div className="w-full h-10 flex items-center px-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-400">{formData.date ? new Date(formData.date).toLocaleDateString('fr-FR') : '—'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Nouvelles zones */}
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-7 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-200"><BrainCircuit size={16} /></div>
                          <h2 className="text-base font-black uppercase tracking-tight">Ajouter & Analyser de Nouvelles Zones</h2>
                        </div>
                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">{currentExamen.imagesAnalysees?.length || 0} zones archivées</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all hover:border-pink-300 hover:bg-pink-50/20 group cursor-pointer min-h-[180px]">
                          <input type="file" multiple accept=".png" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <Upload size={28} className="text-slate-300 mb-3 group-hover:text-pink-500 transition-colors" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Glissez de nouveaux clichés PNG</p>
                          <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">224×224 px uniquement</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-center gap-5">
                          {formData.images.length === 0 ? (
                            <div className="text-center py-5 text-slate-400"><AlertCircle size={22} className="mx-auto mb-2 opacity-30" /><p className="text-[9px] font-black uppercase tracking-widest">Prêt à analyser de nouvelles régions</p></div>
                          ) : (
                            <div className="space-y-5">
                              <div className="flex flex-wrap gap-2 justify-center py-2">
                                {formData.images.map(img => (
                                  <div key={img.id} className="relative w-12 h-12 rounded-xl border-2 border-white dark:border-slate-900 overflow-hidden shadow-lg hover:-translate-y-1 transition-all">
                                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                                    <button onClick={() => removeImage(img.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-rose-600"><X size={10} strokeWidth={3} /></button>
                                  </div>
                                ))}
                              </div>
                              <button onClick={handleAnalyzeEdit} disabled={isAnalyzing}
                                className="w-full h-12 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-200">
                                {isAnalyzing ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Calcul IA...</> : <><Zap size={14} /> Lancer l'analyse supplémentaire</>}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {analysisResult && <AnalyseResultMini result={analysisResult} imageUrl={imageUrl} setSelectedImagePair={setSelectedImagePair} />}
                    </div>

                    {/* Notes */}
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-7 shadow-sm space-y-4">
                      <div className="flex items-center gap-2"><FileText size={14} className="text-slate-400" /><h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Conclusions Diagnostiques (Édition)</h3></div>
                      <textarea className="w-full min-h-[180px] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/40 text-[12px] font-medium leading-relaxed text-slate-900 dark:text-slate-100 focus:border-pink-400 outline-none transition-all resize-none italic shadow-inner"
                        placeholder="Mettez à jour vos conclusions..." value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
                    </div>

                    <div className="flex justify-end gap-4 pt-2">
                      <button onClick={() => { setIsEditing(false); setAnalysisResult(null); setAnalyseEditFaite(false); setFormData(p => ({ ...p, images: [] })); }}
                        className="px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all underline underline-offset-8 decoration-slate-200">
                        Abandonner
                      </button>
                      <button onClick={handleUpdate} disabled={isSaving}
                        className="px-12 h-12 rounded-2xl bg-pink-500 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-pink-200 hover:bg-pink-600 transition-all flex items-center gap-3 active:scale-[0.98] disabled:opacity-50">
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                        Appliquer les changements
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ════════════════════════════════
              VUE AJOUT
          ════════════════════════════════ */}
          {view === 'add' && (
            <motion.div key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 pb-16">

              {/* Étape 1 */}
              <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-[0_15px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="px-7 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-pink-50/50 to-white dark:from-slate-900 dark:to-slate-950 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-200"><Activity size={16} strokeWidth={2.5} /></div>
                  <h2 className="text-base lg:text-lg font-black uppercase tracking-tight">Étape 1 : Informations Générales</h2>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-5">
                  <FieldSelect label="Site Anatomique" value={formData.siteAnatomique} onChange={v => setFormData(p => ({ ...p, siteAnatomique: v }))} options={[['Sein gauche','SEIN GAUCHE'],['Sein droit','SEIN DROIT'],['Sein gauche - Quadrant Supéro-Interne','SEIN G. – QSI'],['Sein gauche - Quadrant Supéro-Externe','SEIN G. – QSE']]} />
                  <FieldSelect label="Grossissement" value={formData.grossissement} onChange={v => setFormData(p => ({ ...p, grossissement: v }))} options={[['40X','40X'],['100X','100X'],['200X','200X'],['400X','400X']]} />
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Visible au Patient</label>
                    <div className="h-10 flex items-center gap-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                      <button onClick={() => setFormData(p => ({ ...p, visiblePatient: !p.visiblePatient }))}
                        className={`w-10 h-5 rounded-full relative transition-colors ${formData.visiblePatient ? 'bg-black shadow-lg shadow-black/20' : 'bg-slate-200'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${formData.visiblePatient ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                      <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest">{formData.visiblePatient ? 'OUI' : 'NON'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Date d'examen</label>
                    <div className="w-full h-10 flex items-center px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-900 dark:text-slate-400 shadow-inner">{formData.date}</div>
                  </div>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-pink-50/50 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-200"><Upload size={16} strokeWidth={2.5} /></div>
                    <h2 className="text-base lg:text-lg font-black uppercase tracking-tight">Étape 2 : Upload et Analyse IA</h2>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <FlaskConical size={13} className="text-pink-500" /> DenseNet121 · BreaKHis
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Info QuPath */}
                  <div className="p-5 bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/50 rounded-2xl flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex-shrink-0 flex items-center justify-center shadow-lg shadow-pink-200 dark:shadow-none"><AlertCircle size={18} /></div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-pink-900 dark:text-pink-300 uppercase tracking-[0.2em]">Procédure d'Exportation QuPath :</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-8">
                        {[{ n:1, t:'Ouvrir le .SVS de référence' },{ n:2, t:'Cibler la zone atypique' },{ n:3, t:'Région fixée à 224×224 PX' },{ n:4, t:'Export PNG (File → Export)' }].map(s => (
                          <div key={s.n} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-pink-100 dark:bg-pink-900/50 text-[8px] flex items-center justify-center font-black text-pink-600 dark:text-pink-400 mt-0.5 shrink-0">{s.n}</span>
                            <p className="text-[9px] font-semibold text-pink-700/80 dark:text-pink-400/80 leading-relaxed uppercase">{s.t}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dropzone */}
                  <div className="relative border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center transition-all hover:border-pink-300 hover:bg-pink-50/20 dark:hover:bg-slate-800/20 group cursor-pointer">
                    <input type="file" multiple accept=".png" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 group-hover:text-pink-500 transition-all shadow-sm mb-5 group-hover:scale-105">
                      <Upload size={40} strokeWidth={1.2} />
                    </div>
                    <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Glissez vos images PNG ici ou cliquez</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Images .PNG de 224×224 pixels uniquement</p>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                      {formData.images.map(img => (
                        <div key={img.id} className="relative aspect-square bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm group">
                          <img src={img.url} alt="Upload" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-3 transition-all">
                            <p className="text-[8px] font-black text-white uppercase truncate w-full text-center mb-2 tracking-widest">{img.name}</p>
                            <button onClick={() => removeImage(img.id)} className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-all shadow-xl"><X size={18} strokeWidth={3} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center pt-4">
                    <button onClick={handleAnalyze} disabled={formData.images.length === 0 || isAnalyzing}
                      className={`h-14 px-14 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center gap-4 active:scale-[0.98] ${formData.images.length === 0 || isAnalyzing ? 'bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed shadow-none' : 'bg-slate-950 text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-black group'}`}>
                      {isAnalyzing ? (
                        <div className="flex items-center gap-4"><div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" /> Analyse IA en cours...</div>
                      ) : (
                        <><BrainCircuit size={20} className="text-slate-400 group-hover:text-white transition-colors" /> Lancer l'Analyse IA</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Résultat */}
              {analysisResult && <AnalyseResultFull result={analysisResult} imageUrl={imageUrl} setSelectedImagePair={setSelectedImagePair} />}

              {/* Étape 3 */}
              <div className="bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-7 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-200"><FileText size={16} /></div>
                  <h3 className="text-base font-black uppercase tracking-tight">Compte-rendu de Pathologie</h3>
                </div>
                <div className="space-y-3">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block">Observations & Conclusions Diagnostiques</label>
                  <textarea className="w-full min-h-[200px] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/40 text-[12px] font-medium leading-relaxed text-slate-900 dark:text-white focus:border-pink-400 outline-none transition-all resize-none italic shadow-inner appearance-none"
                    placeholder="Rédigez ici vos conclusions anatomopathologiques détaillées (Grade SBR, emboles vasculaires, etc.)..."
                    value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={resetForm} className="px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all underline underline-offset-8 decoration-slate-200">
                  Annuler l'ajout
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="px-12 h-12 rounded-2xl bg-pink-500 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-pink-200 hover:bg-pink-600 transition-all flex items-center gap-3 active:scale-[0.98] disabled:opacity-50">
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                  Valider & Enregistrer l'examen
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════ MODAL ════════════════ */}
        <AnimatePresence>
          {selectedImagePair && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedImagePair(null)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 10 }}
                className="relative w-full max-w-3xl bg-white dark:bg-slate-950 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col">
                <div className="p-8 lg:px-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-black dark:bg-slate-900 text-white flex items-center justify-center shadow-lg border border-pink-500/20">
                      <FileSearch size={20} className="text-pink-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Analyse Pathologique Comparative</h3>
                      <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest mt-0.5">Extraction de motifs cellulaires</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedImagePair(null)} className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all"><X size={20} /></button>
                </div>
                <div className="p-10 flex flex-col md:flex-row items-center justify-center gap-12 bg-white dark:bg-slate-950">
                  <div className="flex flex-col gap-4 items-center">
                    <div className="p-1 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                      <div className="w-[224px] h-[224px] rounded-2xl overflow-hidden bg-slate-100">
                        <img src={imageUrl(selectedImagePair.cheminImage)} className="w-full h-full object-cover" alt="Original" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Cliché Original</p>
                    </div>
                  </div>
                  {selectedImagePair.cheminGradCam && (
                    <div className="flex flex-col gap-4 items-center">
                      <div className="p-1 bg-pink-50 dark:bg-pink-950/10 rounded-3xl border border-pink-100 dark:border-pink-900/50 shadow-xl shadow-pink-100/50 dark:shadow-none">
                        <div className="w-[224px] h-[224px] rounded-2xl overflow-hidden bg-slate-100">
                          <img src={imageUrl(selectedImagePair.cheminGradCam)} className="w-full h-full object-cover" alt="Grad-CAM" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]" />
                        <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest italic">Carte de Décision IA</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-10 bg-slate-950 border-t border-white/5 shrink-0 flex items-center justify-center gap-12">
                  {[
                    { color: 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]', label: 'Critique', desc: 'Zones à fort impact diagnostique' },
                    { color: 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]', label: 'Contextualisé', desc: 'Texture cellulaire consultée' },
                    { color: 'bg-slate-500 opacity-50', label: 'Filtre', desc: 'Zone non discriminante' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className={`w-5 h-5 rounded-full ${item.color} group-hover:scale-125 transition-transform`} />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest block">{item.label}</span>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

// ─── COMPOSANTS UTILITAIRES ─────────────────────────────────────────────────

const FieldSelect = ({ label, value, onChange, options }) => (
  <div className="space-y-1">
    <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[10px] font-bold uppercase outline-none focus:border-pink-400 transition-all">
      {options.map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
    </select>
  </div>
);

const AnalyseResultMini = ({ result, imageUrl, setSelectedImagePair }) => {
  const isMalin = result.classeBinaire === 'MALIN';
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className={`p-6 rounded-2xl border relative overflow-hidden ${isMalin ? 'bg-rose-50/50 border-rose-100 dark:border-rose-900/20' : 'bg-emerald-50/50 border-emerald-100 dark:border-emerald-900/20'}`}>
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-30 ${isMalin ? 'bg-rose-400' : 'bg-emerald-400'}`} />
      <div className="relative flex items-center gap-5 mb-4">
        <div className={`w-16 h-16 rounded-2xl border-4 flex flex-col items-center justify-center text-center shadow-lg shrink-0 ${isMalin ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}>
          <span className="text-[8px] font-black uppercase tracking-widest opacity-50">IA</span>
          <span className="text-sm font-black">{result.classeBinaire}</span>
        </div>
        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px]"><span className="font-black text-slate-400 uppercase tracking-widest">Bénin/Malin</span><span className="font-black tabular-nums">{((result.scoreBenignMalin || 0) * 100).toFixed(1)}%</span></div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(result.scoreBenignMalin || 0) * 100}%` }} className={`h-full rounded-full ${isMalin ? 'bg-rose-500' : 'bg-emerald-500'}`} /></div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px]"><span className="font-black text-slate-400 uppercase tracking-widest">{TYPE_LABELS[result.typeTumeur] || result.typeTumeur}</span><span className="font-black tabular-nums">{((result.scoreTypeConfiance || 0) * 100).toFixed(1)}%</span></div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(result.scoreTypeConfiance || 0) * 100}%` }} className="h-full rounded-full bg-blue-500" /></div>
          </div>
        </div>
      </div>
      {(result.imagesAnalysees?.length || 0) > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-2">
          {result.imagesAnalysees.slice(0, 4).map((img, i) => (
            <div key={i} className="space-y-1.5">
              <div onClick={() => setSelectedImagePair(img)} className="aspect-square rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:border-slate-300 transition-all group shadow-sm">
                <img src={imageUrl(img.cheminImage)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
              </div>
              {img.cheminGradCam && (
                <div onClick={() => setSelectedImagePair(img)} className="aspect-square rounded-xl overflow-hidden border-2 border-pink-100 cursor-pointer hover:border-pink-300 transition-all group shadow-sm">
                  <img src={imageUrl(img.cheminGradCam)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const AnalyseResultFull = ({ result, imageUrl, setSelectedImagePair }) => {
  const isMalin = result.classeBinaire === 'MALIN';
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-80 h-80 blur-[120px] rounded-full pointer-events-none opacity-20 ${isMalin ? 'bg-rose-400' : 'bg-emerald-400'}`} />

        {/* Header */}
        <div className={`p-7 border-b border-slate-100 dark:border-slate-800 ${isMalin ? 'bg-rose-50/50' : 'bg-emerald-50/50'}`}>
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className={`w-24 h-24 rounded-[2rem] border-8 flex flex-col items-center justify-center text-center shadow-2xl shrink-0 ${isMalin ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">Résultat IA</span>
              <span className="text-2xl font-black tabular-nums">{result.classeBinaire}</span>
            </div>
            <div className="flex-1 space-y-5 w-full">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Confiance Bénin/Malin</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{((result.scoreBenignMalin || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(result.scoreBenignMalin || 0) * 100}%` }}
                    className={`h-full rounded-full ${isMalin ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Sous-type identifié</span>
                    <p className="text-base font-black uppercase text-slate-900 dark:text-slate-100">{TYPE_LABELS[result.typeTumeur] || result.typeTumeur}</p>
                  </div>
                  <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{((result.scoreTypeConfiance || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(result.scoreTypeConfiance || 0) * 100}%` }} className="h-full rounded-full bg-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grad-CAM */}
        {(result.imagesAnalysees?.length || 0) > 0 && (
          <div className="p-7 space-y-5">
            <h4 className="text-[10px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-500 uppercase flex items-center gap-3">
              <FileSearch size={14} /> Cartographies de Décision (Grad-CAM)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {result.imagesAnalysees.map((img, i) => (
                <div key={i} className="space-y-3">
                  <div onClick={() => setSelectedImagePair(img)} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:border-slate-300 transition-all group relative">
                    <img src={imageUrl(img.cheminImage)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 text-[8px] font-bold text-white uppercase">Original</div>
                  </div>
                  {img.cheminGradCam && (
                    <div onClick={() => setSelectedImagePair(img)} className="aspect-square rounded-2xl overflow-hidden border-2 border-pink-100 dark:border-pink-900/30 shadow-sm cursor-pointer hover:border-pink-300 transition-all group relative">
                      <img src={imageUrl(img.cheminGradCam)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-pink-600/80 border border-pink-400/30 text-[8px] font-bold text-white uppercase">Grad-CAM</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BiopsiePage;