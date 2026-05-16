import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import mammographieService from '../../../services/mammographieService';
import { getBiradsMessage, getUrgenceStyle } from './utils/biradsMessages';
import {
  Plus, Calendar, Activity, Layers, X, Upload,
  Zap, Target, FileSearch, AlertCircle, CheckCircle2,
  ChevronRight, Info, Maximize2, Clock,
  LayoutGrid, Image as ImageIcon, ShieldAlert
} from 'lucide-react';
  // Card recommandation dynamique selon BI-RADS
  const RecommandationCard = ({ examen }) => {
    const msg    = getBiradsMessage(examen.scoreBIRADS);
    const style  = getUrgenceStyle(msg.urgence);

    return (
      <div className={`rounded-[2.5rem] ${style.bg} border ${style.border} p-8 shadow-sm flex flex-col justify-between relative overflow-hidden`}>

        {/* Indicateur urgence */}
        <div className="flex items-center gap-2 mb-6">
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${style.text}`}>
            Indications Thérapeutiques
          </span>
        </div>

        {/* Indication principale */}
        <div className="space-y-2 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className={style.text} strokeWidth={2.5} />
            <p className={`text-lg font-black leading-tight uppercase ${style.text}`}>
              {examen.recommendationIA || msg.indication}
            </p>
          </div>
          {examen.predictionIA === 'MALIGNANT' && (
            <div className="flex items-center gap-2 mt-2">
              <ShieldAlert size={14} className="text-rose-500" />
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                Suspicion de Masse Tumorigène
              </span>
            </div>
          )}
        </div>

        {/* Observations */}
        <div className="pt-5 border-t border-current/10 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className={style.text} />
            <p className={`text-[9px] font-black uppercase tracking-widest ${style.text}`}>
              Observations
            </p>
          </div>
          <p className={`text-[11px] font-bold leading-relaxed italic opacity-80 ${style.text}`}>
            "{examen.biradsDescription || msg.observation}"
          </p>
        </div>

        {/* Action recommandée */}
        <div className="mt-5 pt-4 border-t border-current/10">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border border-current/20 ${style.badge}`}>
            <Zap size={10} />
            {msg.action}
          </span>
        </div>

        {/* Disclaimer */}
        <p className="text-[8px] text-current/50 italic mt-4 leading-relaxed">
          Outil d'aide au diagnostic — La décision finale appartient au médecin.
        </p>
      </div>
    );
  };

const MammographiePage = () => {
  const { id: dossierId } = useParams();
  const [history, setHistory]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [analyzing, setAnalyzing]           = useState(false);
  const [error, setError]                   = useState(null);
  const [isUploading, setIsUploading]       = useState(false);
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    if (dossierId) fetchHistory();
  }, [dossierId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mammographieService.getHistorique(dossierId);
      setHistory(data);
      if (data.length > 0) setSelectedExamen(data[0]);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Format non supporté. Utilisez JPEG ou PNG.');
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      const result = await mammographieService.analyser(dossierId, file);
      setHistory(prev => [result, ...prev]);
      setSelectedExamen(result);
      setIsUploading(false);
    } catch (err) {
      console.error(err);
      if (err.code === 'ECONNABORTED') {
        setError('Timeout — l\'analyse a pris trop de temps');
      } else if (err.response?.status === 500) {
        setError('Erreur serveur — vérifiez que le microservice IA tourne sur le port 8000');
      } else if (err.response?.status === 403) {
        setError('Accès refusé — reconnectez-vous');
      } else {
        setError(err.message || 'Erreur lors de l\'analyse IA');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files[0]);
  };

  const getBiradsColor = (score) => {
    if (!score) return 'bg-slate-100 text-slate-500 border-slate-200';
    const s = score.replace('BIRADS_', '');
    if (['1', '2'].includes(s))
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s === '3')
      return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s === '4A')
      return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const getPredictionColor = (prediction) => {
    if (prediction === 'MALIGNANT')
      return 'text-rose-600 bg-rose-50 border-rose-200';
    if (prediction === 'BENIGN')
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getImageSrc = (base64, filePath) => {
    if (base64 && base64.startsWith('data:')) return base64;
    if (filePath) return `http://localhost:8080/${filePath}`;
    return null;
  };


  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-white">
      <div className="p-3 lg:p-6 max-w-[1700px] mx-auto space-y-6 font-sans">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center">
              <Layers size={20} className="text-pink-500" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-black tracking-tight uppercase">
                Mammographie Numérique
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  Analyse assistée par Intelligence Artificielle
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => { setIsUploading(true); setError(null); }}
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-950 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            <Plus size={14} />
            Nouvel Examen
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Sidebar Historique */}
          <div className="xl:col-span-3">
            <div className="rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-pink-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Chronologie</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[8px] font-black uppercase tracking-widest">
                  {history.length} Examens
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-20 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
                  ))
                ) : history.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-3">
                    <Info size={24} className="text-slate-300" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Aucun examen<br />dans l'historique
                    </p>
                  </div>
                ) : (
                  history.map((exam) => (
                    <motion.div
                      key={exam.id}
                      onClick={() => setSelectedExamen(exam)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                        selectedExamen?.id === exam.id
                          ? 'bg-white border-pink-200 dark:bg-slate-900 shadow-md ring-1 ring-pink-100'
                          : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 dark:bg-slate-900/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        exam.predictionIA === 'MALIGNANT'
                          ? 'bg-rose-50 text-rose-500'
                          : 'bg-emerald-50 text-emerald-500'
                      }`}>
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-tight truncate">
                          {new Date(exam.dateExamen).toLocaleDateString('fr-FR')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase border ${getBiradsColor(exam.scoreBIRADS)}`}>
                            {exam.scoreBIRADS?.replace('BIRADS_', 'BI-RADS ')}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase truncate">
                            {exam.quadrantShort || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className={`transition-transform ${
                        selectedExamen?.id === exam.id ? 'text-pink-500 translate-x-1' : 'text-slate-300'
                      }`} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-9 space-y-6">
            <AnimatePresence mode="wait">

              {/* Zone Upload */}
              {isUploading ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-black p-12 flex flex-col items-center justify-center gap-6 min-h-[500px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                >
                  {analyzing ? (
                    <div className="text-center space-y-8 max-w-md">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-pink-100 border-t-pink-500 animate-spin mx-auto" />
                        <Zap size={32} className="absolute inset-0 m-auto text-pink-500 animate-pulse" strokeWidth={3} />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xl font-black uppercase tracking-tight">
                          Analyse IA en cours...
                        </h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                          EfficientNet-B3 analyse la mammographie et génère la heatmap GradCAM. Cela peut prendre 30 à 60 secondes.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 60, ease: 'linear' }}
                            className="bg-pink-500 h-full"
                          />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Preprocessing · EfficientNet-B3 · GradCAM · BI-RADS
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-pink-50 rounded-[2rem] border border-pink-100 flex items-center justify-center text-pink-500">
                        <Upload size={32} strokeWidth={2.5} />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-black uppercase tracking-tight">
                          Nouveau Cliché Mammaire
                        </h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                          Glissez-déposez l'image JPEG ou PNG ici
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files[0])}
                          accept="image/jpeg,image/png"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-10 h-12 rounded-2xl bg-pink-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-pink-200 hover:bg-pink-600 transition-all flex items-center gap-3"
                        >
                          <FileSearch size={18} />
                          Sélectionner un Fichier
                        </button>
                        <button
                          onClick={() => setIsUploading(false)}
                          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          Retourner à l'historique
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>

              ) : selectedExamen ? (

                <motion.div
                  key={`results-${selectedExamen.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Score + Localisation */}
                    <div className="lg:col-span-2 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col gap-8">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Zap size={14} className="text-pink-500" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-pink-500">
                              Diagnostic IA
                            </span>
                          </div>
                          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase">
                            Prédiction :
                            <span className={`px-4 py-1 rounded-2xl border ${getPredictionColor(selectedExamen.predictionIA)}`}>
                              {selectedExamen.predictionIA === 'MALIGNANT' ? 'MALIN' : 'BÉNIN'}
                            </span>
                          </h2>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl border text-center ${getBiradsColor(selectedExamen.scoreBIRADS)}`}>
                          <p className="text-[8px] font-black uppercase mb-0.5 opacity-60">Classification</p>
                          <p className="text-lg font-black uppercase tracking-tighter leading-none">
                            {selectedExamen.scoreBIRADS?.replace('BIRADS_', 'BI-RADS ')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                Confiance IA
                              </p>
                              <p className="text-3xl font-black tracking-tight tabular-nums">
                                {selectedExamen.confidencePct?.toFixed(1) || (selectedExamen.scoreRisqueIA * 100).toFixed(1)}%
                              </p>
                            </div>
                            <Activity className="text-pink-300" size={32} strokeWidth={1} />
                          </div>
                          <div className="w-full h-3 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 p-0.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${selectedExamen.confidencePct || selectedExamen.scoreRisqueIA * 100}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={`h-full rounded-full ${
                                selectedExamen.predictionIA === 'MALIGNANT' ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          <p className="text-[9px] text-slate-400 font-mono">
                            Score brut : {selectedExamen.scoreRisqueIA?.toFixed(4)}
                          </p>
                        </div>

                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 flex flex-col justify-center gap-3">
                          <div className="flex items-center gap-2">
                            <Target size={16} className="text-pink-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Localisation</span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase">
                            {selectedExamen.positionText || 'Non précisée'}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-black border border-slate-200 text-[10px] font-black uppercase text-pink-500">
                              {selectedExamen.quadrantShort || 'N/A'}
                            </span>
                            <span className="text-[10px] font-bold italic text-slate-400">
                              {selectedExamen.quadrant}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommandation dynamique */}
                    <RecommandationCard examen={selectedExamen} />
                  </div>

                  {/* Images IA */}
                  <div className="rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-8">
                    <div className="flex items-center gap-3">
                      <LayoutGrid size={18} className="text-pink-500" />
                      <h3 className="text-sm font-black uppercase tracking-widest">
                        Analyse Visuelle Deep Learning
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          src:   getImageSrc(selectedExamen.imageOriginal, selectedExamen.imageRadio),
                          label: 'Mammographie Originale',
                          badge: 'Originale',
                          badgeColor: 'bg-black/40 border-white/10',
                          desc: 'Radiographie brute JPEG/PNG'
                        },
                        {
                          src:   getImageSrc(selectedExamen.imageHeatmap, selectedExamen.heatmapUrl),
                          label: 'Heatmap GradCAM',
                          badge: 'Attention Map',
                          badgeColor: 'bg-pink-500/80 border-pink-400',
                          desc: 'Zones de forte suspicion neuronale'
                        },
                        {
                          src:   getImageSrc(selectedExamen.imageBbox, selectedExamen.bboxImageUrl),
                          label: 'Bounding Box',
                          badge: 'Segmentation',
                          badgeColor: 'bg-sky-500/80 border-sky-400',
                          desc: 'Repérage anatomique de la lésion'
                        }
                      ].map((img, idx) => (
                        <div key={idx} className="space-y-3 group">
                          <div className="relative aspect-square rounded-3xl bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 group-hover:shadow-2xl transition-all duration-500">
                            {img.src ? (
                              <img
                                src={img.src}
                                alt={img.label}
                                className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600">
                                <ImageIcon size={40} />
                                <p className="text-[9px] font-bold uppercase tracking-widest">Non disponible</p>
                              </div>
                            )}
                            {img.src && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setFullscreenImage(img.src)}
                                  className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                                >
                                  <Maximize2 size={16} />
                                </button>
                              </div>
                            )}
                            <span className={`absolute top-4 left-4 px-3 py-1 backdrop-blur-md rounded-lg border text-[9px] font-black text-white uppercase tracking-widest ${img.badgeColor}`}>
                              {img.badge}
                            </span>
                          </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">
                            {img.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200">
                    <ImageIcon size={40} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-400">
                    Prêt pour une analyse
                  </h3>
                  <p className="text-sm font-medium text-slate-400 max-w-sm">
                    Sélectionnez un examen dans l'historique ou commencez une nouvelle analyse IA.
                  </p>
                  <button
                    onClick={() => setIsUploading(true)}
                    className="mt-4 flex items-center gap-2 h-10 px-5 rounded-xl bg-pink-500 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-all"
                  >
                    <Plus size={14} />
                    Nouvelle Analyse
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Fullscreen */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-md"
            onClick={() => setFullscreenImage(null)}
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Aperçu Haute Résolution</h2>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Analyse Morphologique</p>
                </div>
              </div>
              <button
                onClick={() => setFullscreenImage(null)}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-6">
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={fullscreenImage}
                className="max-h-full max-w-full rounded-2xl shadow-2xl border border-white/10"
                alt="Aperçu"
              />
            </div>
            <div className="p-6 flex items-center justify-center text-white/40">
              <span className="text-[9px] font-black uppercase tracking-widest">
                Cliquez n'importe où pour fermer
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast erreur */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[60] bg-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-lg">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MammographiePage;