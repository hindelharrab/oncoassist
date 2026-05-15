import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Calendar,
  Trash2,
  Activity,
  Layers,
  X,
  Upload,
  Zap,
  Target,
  FileSearch,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info,
  Maximize2,
  Download,
  Clock,
  LayoutGrid,
  Image as ImageIcon
} from 'lucide-react';
import mammographieService from '../../../services/mammographieService';

const MammographiePage = () => {
  const { id: dossierId } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  
  const fileInputRef = useRef(null);

  // Charger l'historique au montage
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchHistory();
  }, [dossierId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mammographieService.getHistory(dossierId);
      // Trier par date décroissante
      const sorted = (data || []).sort((a, b) => new Date(b.dateExamen) - new Date(a.dateExamen));
      setHistory(sorted);
      if (sorted.length > 0) {
        setSelectedExamen(sorted[0]);
      }
    } catch (err) {
      console.warn("API Error:", err);
      // Fallback to mock data if Network Error or non-responsive backend
      if (err.message === 'Network Error' || !err.response) {
        console.log("Using mock data because backend is unreachable (localhost:8080)");
        const mockData = [
          {
            id: "mock-1",
            dossierId: dossierId,
            dateExamen: "2026-05-15T10:30:00",
            predictionIA: "MALIGNANT",
            scoreRisqueIA: 0.7823,
            confidencePct: 78.2,
            scoreBIRADS: "BIRADS_4C",
            biradsDescription: "Lésion suspecte avec cinétique de type 3.",
            recommendationIA: "Macro-biopsie sous IRM recommandée",
            actionIA: "biopsie_recommandee",
            quadrant: "Quadrant supéro-externe",
            quadrantShort: "QSE",
            positionText: "Quadrant supéro-externe, zone médio-mammaire",
            imageOriginal: "https://images.unsplash.com/photo-1576091160550-2173dad99968?q=80&w=800&auto=format&fit=crop",
            imageHeatmap: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop",
            imageBbox: "https://images.unsplash.com/photo-1579154235814-396ec9b5254c?q=80&w=800&auto=format&fit=crop"
          },
          {
            id: "mock-2",
            dossierId: dossierId,
            dateExamen: "2026-04-10T09:00:00",
            predictionIA: "BENIGN",
            scoreRisqueIA: 0.12,
            confidencePct: 88.0,
            scoreBIRADS: "BIRADS_2",
            biradsDescription: "Bénin, probabilité nulle de malignité",
            recommendationIA: "Suivi annuel recommandé",
            actionIA: "suivi_annuel",
            quadrant: "Quadrant inféro-interne",
            quadrantShort: "QII",
            positionText: "Quadrant inféro-interne",
            imageOriginal: "https://images.unsplash.com/photo-1579154235814-396ec9b5254c?q=80&w=800&auto=format&fit=crop",
            imageHeatmap: "https://images.unsplash.com/photo-1576091160550-2173dad99968?q=80&w=800&auto=format&fit=crop",
            imageBbox: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop"
          }
        ];
        setHistory(mockData);
        setSelectedExamen(mockData[0]);
        setError("Note: Affichage de données de démonstration. Le backend Spring Boot (localhost:8080) n'est pas accessible.");
      } else {
        setError("Impossible de charger l'historique des mammographies.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    try {
      setAnalyzing(true);
      setError(null);
      const result = await mammographieService.analyzeMammographie(dossierId, file);
      setHistory([result, ...history]);
      setSelectedExamen(result);
      setIsUploading(false);
    } catch (err) {
      console.warn("Analysis Error:", err);
      // Simulate analysis if network error (MOCK for testing UI)
      if (err.message === 'Network Error' || !err.response) {
        setTimeout(() => {
          const mockResult = {
            id: `mock-${Date.now()}`,
            dossierId: dossierId,
            dateExamen: new Date().toISOString(),
            predictionIA: Math.random() > 0.5 ? "MALIGNANT" : "BENIGN",
            scoreRisqueIA: Math.random(),
            confidencePct: 85.0,
            scoreBIRADS: "BIRADS_4A",
            biradsDescription: "Suspicion faible, biopsie conseillée",
            recommendationIA: "Biopsie recommandée",
            quadrant: "Quadrant supéro-externe",
            quadrantShort: "QSE",
            positionText: "Zone suspecte identifiée en supéro-externe",
            imageOriginal: URL.createObjectURL(file), // Show original file
            imageHeatmap: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop",
            imageBbox: "https://images.unsplash.com/photo-1579154235814-396ec9b5254c?q=80&w=800&auto=format&fit=crop"
          };
          setHistory([mockResult, ...history]);
          setSelectedExamen(mockResult);
          setIsUploading(false);
          setAnalyzing(false);
          setError("Note: Analyse simulée (Backend non accessible).");
        }, 2000);
      } else {
        setError("L'analyse de l'image a échoué. Veuillez vérifier la connexion au backend.");
        setAnalyzing(false);
      }
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const getBiradsColor = (score) => {
    if (!score) return 'bg-slate-100 text-slate-500';
    const s = score.replace('BIRADS_', '');
    if (['1', '2'].includes(s)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s === '3') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const getPredictionColor = (prediction) => {
    if (prediction === 'MALIGNANT') return 'text-rose-600 bg-rose-50 border-rose-100';
    if (prediction === 'BENIGN') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-white">
      <div className="p-3 lg:p-6 max-w-[1700px] mx-auto space-y-6 font-sans">
        
        {/* Header Section */}
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
          <div className="flex items-center gap-3">
             <button
              onClick={() => setIsUploading(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-950 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 dark:shadow-none hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              <Plus size={14} />
              Nouvel Examen
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Sidebar: Historique */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            <div className="rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full max-h-[calc(100vh-140px)]">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-pink-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Chronologie</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[8px] font-black uppercase tracking-widest">
                  {history.length} Examens
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-20 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
                  ))
                ) : history.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-3">
                    <Info size={24} className="text-slate-300" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Aucun examen<br/>dans l'historique
                    </p>
                  </div>
                ) : (
                  history.map((exam) => (
                    <motion.div
                      key={exam.id}
                      layoutId={`exam-${exam.id}`}
                      onClick={() => setSelectedExamen(exam)}
                      className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                        selectedExamen?.id === exam.id 
                        ? 'bg-white border-pink-200 dark:bg-slate-900 dark:border-pink-900/50 shadow-md ring-1 ring-pink-100' 
                        : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 dark:bg-slate-900/50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        exam.predictionIA === 'MALIGNANT' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                      }`}>
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
                          Examen du {new Date(exam.dateExamen).toLocaleDateString('fr-FR')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${getBiradsColor(exam.scoreBIRADS)}`}>
                            {exam.scoreBIRADS?.replace('BIRADS_', 'BI-RADS ')}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{exam.quadrantShort || 'QSE'}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className={`transition-transform duration-300 ${selectedExamen?.id === exam.id ? 'text-pink-500 translate-x-1' : 'text-slate-300'}`} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-9 space-y-6">
            
            <AnimatePresence mode="wait">
              {isUploading ? (
                <motion.div
                  key="upload-zone"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-black p-12 flex flex-col items-center justify-center gap-6 min-h-[500px] transition-all"
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
                        <h3 className="text-xl font-black uppercase tracking-tight">Analyse IA en cours...</h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                          Nos algorithmes de vision par ordinateur analysent les tissus pour détecter d'éventuelles anomalies. Cela peut prendre quelques secondes.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 5 }}
                            className="bg-pink-500 h-full" 
                          />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Prétraitement & Segmentation</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-pink-50 rounded-[2rem] border border-pink-100 flex items-center justify-center text-pink-500 shadow-sm">
                        <Upload size={32} strokeWidth={2.5} />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-black uppercase tracking-tight">Nouveau Cliché Mammaire</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Glissez-déposez l'image DICOM ou PNG ici</p>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e.target.files[0])}
                          accept="image/*"
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="px-10 h-12 rounded-2xl bg-pink-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-pink-200 hover:bg-pink-600 transition-all flex items-center gap-3"
                        >
                          <FileSearch size={18} /> Sélectionner un Fichier
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
                  {/* Top Result Card */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* IA Performance Breakdown */}
                    <div className="lg:col-span-2 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col gap-8">
                       <div className="flex items-start justify-between">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <Zap size={14} className="text-pink-500" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-pink-500">Diagnostic Intelligente</span>
                             </div>
                             <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase">
                                Prédiction: 
                                <span className={`px-4 py-1 rounded-2xl border ${getPredictionColor(selectedExamen.predictionIA)}`}>
                                   {selectedExamen.predictionIA === 'MALIGNANT' ? 'MALIN' : 'BÉNIN'}
                                </span>
                             </h2>
                          </div>
                          <div className={`px-4 py-2 rounded-2xl border text-center ${getBiradsColor(selectedExamen.scoreBIRADS)}`}>
                             <p className="text-[8px] font-black uppercase mb-0.5 opacity-60 italic">Classification</p>
                             <p className="text-lg font-black uppercase tracking-tighter leading-none">{selectedExamen.scoreBIRADS?.replace('BIRADS_', 'BI-RADS ')}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <div className="flex justify-between items-end">
                                <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Confiance IA</p>
                                   <p className="text-3xl font-black tracking-tight tabular-nums">{selectedExamen.confidencePct || (selectedExamen.scoreRisqueIA * 100).toFixed(1)}%</p>
                                </div>
                                <Activity className="text-pink-300" size={32} strokeWidth={1} />
                             </div>
                             <div className="w-full h-3 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 p-0.5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${selectedExamen.confidencePct || selectedExamen.scoreRisqueIA * 100}%` }}
                                  className={`h-full rounded-full ${selectedExamen.predictionIA === 'MALIGNANT' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'}`}
                                />
                             </div>
                          </div>

                          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-center gap-3">
                             <div className="flex items-center gap-2">
                                <Target size={16} className="text-pink-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Localisation</span>
                             </div>
                             <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase">
                                {selectedExamen.positionText || "Localisation non précisée"}
                             </p>
                             <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-pink-500">
                                   {selectedExamen.quadrantShort || 'QSE'}
                                </span>
                                <span className="text-[10px] font-bold italic text-slate-400">
                                   {selectedExamen.quadrant}
                                </span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Recommendation Card */}
                    <div className="rounded-[2.5rem] bg-gradient-to-br from-pink-50 to-rose-100/40 border border-pink-100 p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/20 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000" />
                       
                       <div className="relative z-10 space-y-4">
                          <div className="flex items-center gap-2">
                             <CheckCircle2 size={18} className="text-pink-500" strokeWidth={2.5} />
                             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600">Indications Thérapeutiques</h3>
                          </div>
                          
                          <div className="space-y-1">
                             <p className="text-xl font-black leading-tight uppercase text-slate-900">
                                {selectedExamen.recommendationIA || "Macro-biopsie sous IRM recommandée"}
                             </p>
                             {selectedExamen.predictionIA === 'MALIGNANT' && (
                                <span className="inline-block text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">
                                   Suspicion de Masse Tumorigène
                                </span>
                             )}
                          </div>
                       </div>

                       <div className="relative z-10 mt-8 pt-6 border-t border-pink-200/50 space-y-3">
                          <div className="flex items-center gap-2">
                             <AlertCircle size={14} className="text-pink-400" />
                             <p className="text-[9px] font-black uppercase tracking-widest text-pink-500">Observations</p>
                          </div>
                          <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                             "{selectedExamen.biradsDescription || "Lésion suspecte avec cinétique de type 3."}"
                          </p>
                          <div className="pt-2">
                             <span className="px-2 py-1 rounded-lg bg-white/50 border border-pink-100 text-[8px] font-black text-pink-400 uppercase tracking-[0.2em]">
                                Action Immédiate Requise
                             </span>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Visual Analysis - Images */}
                  <div className="rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <LayoutGrid size={18} className="text-pink-500" />
                           <h3 className="text-sm font-black uppercase tracking-widest">Analyse Visuelle Deep Learning</h3>
                        </div>
                        <div className="flex items-center gap-2">
                           <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors">
                              <Download size={16} className="text-slate-500" />
                           </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Original */}
                        <div className="space-y-3 group">
                           <div className="relative aspect-square rounded-3xl bg-black overflow-hidden border border-slate-200 dark:border-slate-800 group-hover:shadow-2xl transition-all duration-500">
                              <img 
                                src={selectedExamen.imageOriginal || selectedExamen.imageRadio} 
                                alt="Mammographie Originale" 
                                className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => setFullscreenImage(selectedExamen.imageOriginal || selectedExamen.imageRadio)}
                                   className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                                 >
                                    <Maximize2 size={16} />
                                 </button>
                              </div>
                              <span className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                                 Originale
                              </span>
                           </div>
                           <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">Radiographie brute DICOM/PNG</p>
                        </div>

                        {/* 2. Heatmap */}
                        <div className="space-y-3 group">
                           <div className="relative aspect-square rounded-3xl bg-black overflow-hidden border border-slate-200 dark:border-slate-800 group-hover:shadow-2xl transition-all duration-500">
                              <img 
                                src={selectedExamen.imageHeatmap || selectedExamen.heatmapUrl} 
                                alt="IA Heatmap" 
                                className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => setFullscreenImage(selectedExamen.imageHeatmap || selectedExamen.heatmapUrl)}
                                   className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                                 >
                                    <Maximize2 size={16} />
                                 </button>
                              </div>
                              <span className="absolute top-4 left-4 px-3 py-1 bg-pink-500/80 backdrop-blur-md rounded-lg border border-pink-400 text-[9px] font-black text-white uppercase tracking-widest shadow-lg">
                                 Attention Map
                              </span>
                           </div>
                           <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">Zones de forte suspicion neuronale</p>
                        </div>

                        {/* 3. Bounding Box */}
                        <div className="space-y-3 group">
                           <div className="relative aspect-square rounded-3xl bg-black overflow-hidden border border-slate-200 dark:border-slate-800 group-hover:shadow-2xl transition-all duration-500">
                              <img 
                                src={selectedExamen.imageBbox || selectedExamen.bboxImageUrl} 
                                alt="IA Segmentation" 
                                className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => setFullscreenImage(selectedExamen.imageBbox || selectedExamen.bboxImageUrl)}
                                   className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                                 >
                                    <Maximize2 size={16} />
                                 </button>
                              </div>
                              <span className="absolute top-4 left-4 px-3 py-1 bg-sky-500/80 backdrop-blur-md rounded-lg border border-sky-400 text-[9px] font-black text-white uppercase tracking-widest shadow-lg">
                                 Segmentation
                              </span>
                           </div>
                           <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">Repérage anatomique de la lésion</p>
                        </div>
                     </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-center">
                   <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200">
                     <ImageIcon size={40} />
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-tight text-slate-400">Prêt pour une analyse</h3>
                   <p className="text-sm font-medium text-slate-400 max-w-sm">Sélectionnez un examen dans l'historique ou commencez une nouvelle analyse IA dès maintenant.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-md"
            onClick={() => setFullscreenImage(null)}
          >
            <div className="p-6 flex items-center justify-between relative z-10">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                     <ImageIcon size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Aperçu Haute Résolution</h2>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Analyse Morphologique Détaillée</p>
                  </div>
               </div>
               <button 
                 onClick={() => setFullscreenImage(null)}
                 className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
               >
                 <X size={24} />
               </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000_100%)]">
               <motion.img
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 src={fullscreenImage}
                 className="max-h-full max-w-full rounded-2xl shadow-2xl border border-white/10 cursor-zoom-out"
                 alt="Enlarged analysis"
               />
            </div>
            
            <div className="p-8 flex items-center justify-center gap-6 text-white/40 relative z-10">
               <div className="flex flex-col items-center gap-1">
                  <Info size={16} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Cliquez n'importe où pour fermer</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-6 right-6 z-[60] bg-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom">
           <AlertCircle size={20} />
           <p className="text-sm font-bold">{error}</p>
           <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-lg">
             <X size={16} />
           </button>
        </div>
      )}
    </div>
  );
};

export default MammographiePage;
