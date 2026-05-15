import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../services/axiosInstance';
import {
  Plus, Calendar, Trash2, Edit2, Activity, Zap, ClipboardList,
  X, Save, Check, FileText, Image as ImageIcon, Upload,
  AlertCircle, Loader2
} from 'lucide-react';
import {
  getEchographies,
  creerEchographie,
  supprimerEchographie
} from '../../../services/echographieService';

const formatDate = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('fr-FR');
};

const FORM_INITIAL = {
  seinExamine:             'Droit',
  quadrant:                '',
  distanceMamelon:         '',
  typeStructure:           'Masse',
  forme:                   '',
  orientation:             'Parallèle',
  contours:                'Circonscrits',
  echostructure:           '',
  tailleAxe1:              '',
  tailleAxe2:              '',
  tailleAxe3:              '',
  effetsPosterieurs:       'Aucun',
  vascularisationDoppler:  'Nulle',
  calcificationsPresentes: 'Non',
  adenopathieAxillaire:    'Non',
  scoreBIRADS:             '1',
  recommandation:          '',
  resultatDetaille:        '',
};

const EchographiePage = () => {
  const { id: patientId } = useParams();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [dossierId, setDossierId]       = useState(null);
  const [examens, setExamens]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState(null);
  const [isAddingNew, setIsAddingNew]   = useState(false);
  const [formData, setFormData]         = useState(FORM_INITIAL);
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: patient } = await axiosInstance.get(`/patients/${patientId}`);
        const dId = patient.dossierMedicalId;
        setDossierId(dId);
        if (dId) {
          const data = await getEchographies(dId);
          setExamens(data);
        }
      } catch (err) {
        setError("Impossible de charger les échographies.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!dossierId) return;
    setSaving(true);
    try {
      // 1. Créer l'examen sans image
      const payload = {
        medecinId:               user.id,
        seinExamine:             formData.seinExamine,
        quadrant:                formData.quadrant,
        distanceMamelon:         formData.distanceMamelon ? parseFloat(formData.distanceMamelon) : null,
        typeStructure:           formData.typeStructure,
        forme:                   formData.forme,
        orientation:             formData.orientation,
        contours:                formData.contours,
        echostructure:           formData.echostructure,
        tailleAxe1:              formData.tailleAxe1 ? parseFloat(formData.tailleAxe1) : null,
        tailleAxe2:              formData.tailleAxe2 ? parseFloat(formData.tailleAxe2) : null,
        tailleAxe3:              formData.tailleAxe3 ? parseFloat(formData.tailleAxe3) : null,
        effetsPosterieurs:       formData.effetsPosterieurs,
        vascularisationDoppler:  formData.vascularisationDoppler,
        calcificationsPresentes: formData.calcificationsPresentes,
        adenopathieAxillaire:    formData.adenopathieAxillaire,
        scoreBIRADS:             formData.scoreBIRADS,
        recommandation:          formData.recommandation,
        resultatDetaille:        formData.resultatDetaille,
        imageRadio:              null,
      };

      let newExamen = await creerEchographie(dossierId, payload);

      // 2. Si image sélectionnée → upload séparé
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const { data: updated } = await axiosInstance.post(
          `/echographies/${newExamen.id}/image`,
          fd,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        newExamen = updated;
      }

      setExamens(prev => [newExamen, ...prev]);
      setIsAddingNew(false);
      setFormData(FORM_INITIAL);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la sauvegarde. Vérifiez que le backend est à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm("Supprimer cet examen ?")) return;
    try {
      await supprimerEchographie(id);
      setExamens(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError("Impossible de supprimer l'examen.");
    }
  };

  const handleAnnuler = () => {
    setIsAddingNew(false);
    setFormData(FORM_INITIAL);
    setImageFile(null);
    setImagePreview(null);
  };

  const f = (val) => val || 'N/A';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-pink-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-white">
      <div className="p-3 lg:p-5 max-w-[1600px] mx-auto space-y-5 font-sans">

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold flex items-center justify-between">
            {error}<button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center">
              <Zap size={18} className="text-pink-500" strokeWidth={2.3} />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-black tracking-tight uppercase">Échographie Mammaire</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                <span className="text-[8px] font-bold text-black uppercase tracking-[0.25em]">Examens Imagerie</span>
              </div>
            </div>
          </div>
          {!isAddingNew && (
            <button onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-950 text-white font-bold text-[9px] uppercase tracking-[0.22em] shadow-lg shadow-slate-200 dark:shadow-none hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              <Plus size={13} />Nouvel Examen
            </button>
          )}
        </div>

        {/* ── FORMULAIRE ── */}
        <AnimatePresence>
          {isAddingNew && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-[0_15px_50px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              <div className="px-6 lg:px-7 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-pink-50 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center"><Activity size={16} strokeWidth={2.8} /></div>
                  <h2 className="text-base lg:text-lg font-black uppercase tracking-tight">Saisie Compte-Rendu Écho</h2>
                </div>
                <button type="button" onClick={handleAnnuler}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                ><X size={16} /></button>
              </div>

              <div className="p-5 lg:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                  {/* Colonne 1 : Localisation & Image */}
                  <div className="flex flex-col gap-6">
                    <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fcfcfd] dark:bg-slate-900/30 p-5 shadow-sm">
                      <h3 className="text-[9px] font-black uppercase tracking-[0.22em] mb-4 flex items-center gap-2">
                        <AlertCircle size={13} className="text-pink-500" />Localisation
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Sein Examiné</label>
                          <select className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[10px] font-bold uppercase outline-none focus:border-pink-400"
                            value={formData.seinExamine} onChange={(e) => setFormData({...formData, seinExamine: e.target.value})}>
                            <option value="Droit">DROIT</option>
                            <option value="Gauche">GAUCHE</option>
                            <option value="Bilatéral">BILATÉRAL</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Quadrant</label>
                            <input className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400"
                              value={formData.quadrant} onChange={(e) => setFormData({...formData, quadrant: e.target.value})} placeholder="Ex: QSE" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Dist. Mamelon</label>
                            <input className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400"
                              value={formData.distanceMamelon} onChange={(e) => setFormData({...formData, distanceMamelon: e.target.value})} placeholder="3 cm" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── UPLOAD IMAGE FONCTIONNEL ── */}
                    <div className="rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-[#fcfcfd] dark:bg-slate-900/30 p-5 shadow-sm">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.22em] mb-4 flex items-center gap-2">
                        <ImageIcon size={14} className="text-pink-500" />Imagerie
                      </h3>

                      {/* Input caché */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.dcm"
                        className="hidden"
                        onChange={handleImageSelect}
                      />

                      {imagePreview ? (
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-2 rounded-xl bg-white text-[9px] font-black uppercase text-slate-900 hover:bg-pink-50 transition-all">
                              Changer
                            </button>
                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                              className="px-3 py-2 rounded-xl bg-rose-500 text-[9px] font-black uppercase text-white hover:bg-rose-600 transition-all">
                              Retirer
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                            <p className="text-[8px] text-white/80 font-bold truncate">{imageFile?.name}</p>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-pink-300 transition-all cursor-pointer group"
                        >
                          <div className="w-10 h-10 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-pink-500 transition-all mb-3 shadow-sm">
                            <Upload size={18} />
                          </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transférer Cliché</p>
                          <p className="text-[8px] text-slate-300 mt-1">PNG, JPG, DICOM</p>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Colonne 2 : Morphologie */}
                  <div className="flex flex-col gap-5">
                    <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fcfcfd] dark:bg-slate-900/30 p-5 shadow-sm">
                      <h3 className="text-[9px] font-black uppercase tracking-[0.22em] mb-4 flex items-center gap-2">
                        <Activity size={13} className="text-pink-500" />Morphologie & Signes
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Forme</label>
                            <input className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400"
                              value={formData.forme} onChange={(e) => setFormData({...formData, forme: e.target.value})} placeholder="Ovale..." />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Orientation</label>
                            <select className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[10px] font-bold uppercase outline-none focus:border-pink-400"
                              value={formData.orientation} onChange={(e) => setFormData({...formData, orientation: e.target.value})}>
                              <option value="Parallèle">PARALLÈLE</option>
                              <option value="Non-Parallèle">NON-PARALLÈLE</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Contours</label>
                            <input className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400"
                              value={formData.contours} onChange={(e) => setFormData({...formData, contours: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Vasc. Doppler</label>
                            <select className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[10px] font-bold uppercase outline-none focus:border-pink-400"
                              value={formData.vascularisationDoppler} onChange={(e) => setFormData({...formData, vascularisationDoppler: e.target.value})}>
                              <option value="Nulle">NULLE</option>
                              <option value="Périphérique">PÉRIPHÉRIQUE</option>
                              <option value="Centrale">CENTRALE</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Taille (mm) Axe 1×2×3</label>
                          <div className="flex gap-2">
                            <input className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400"
                              value={formData.tailleAxe1} onChange={(e) => setFormData({...formData, tailleAxe1: e.target.value})} placeholder="X" />
                            <input className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400"
                              value={formData.tailleAxe2} onChange={(e) => setFormData({...formData, tailleAxe2: e.target.value})} placeholder="Y" />
                            <input className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400"
                              value={formData.tailleAxe3} onChange={(e) => setFormData({...formData, tailleAxe3: e.target.value})} placeholder="Z" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Calcifications</label>
                            <select className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[10px] font-bold uppercase outline-none focus:border-pink-400"
                              value={formData.calcificationsPresentes} onChange={(e) => setFormData({...formData, calcificationsPresentes: e.target.value})}>
                              <option value="Non">NON</option>
                              <option value="Oui">OUI</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Adéno. Axillaire</label>
                            <select className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[10px] font-bold uppercase outline-none focus:border-pink-400"
                              value={formData.adenopathieAxillaire} onChange={(e) => setFormData({...formData, adenopathieAxillaire: e.target.value})}>
                              <option value="Non">NON</option>
                              <option value="Oui">OUI</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colonne 3 : Conclusion & Score */}
                  <div className="flex flex-col gap-5">
                    <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fcfcfd] dark:bg-slate-900/30 p-5 shadow-sm">
                      <h3 className="text-[9px] font-black uppercase tracking-[0.22em] mb-4 flex items-center gap-2">
                        <Check size={13} className="text-pink-500" />Conclusion & Score
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Type de Structure</label>
                          <input className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400"
                            value={formData.typeStructure} onChange={(e) => setFormData({...formData, typeStructure: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Score BI-RADS</label>
                          <select className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[10px] font-black uppercase outline-none focus:border-pink-400"
                            value={formData.scoreBIRADS} onChange={(e) => setFormData({...formData, scoreBIRADS: e.target.value})}>
                            <option value="1">1 (NORMAL)</option>
                            <option value="2">2 (BÉNIN)</option>
                            <option value="3">3 (PROB. BÉNIN)</option>
                            <option value="4">4 (SUSPECT)</option>
                            <option value="5">5 (MALIN)</option>
                            <option value="6">6 (CANCER PROUVÉ)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 text-pink-500">Recommandation</label>
                          <textarea className="w-full h-32 px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-medium leading-relaxed outline-none focus:border-pink-400 resize-none shadow-sm"
                            value={formData.recommandation} onChange={(e) => setFormData({...formData, recommandation: e.target.value})}
                            placeholder="Biopsie, IRM Comp, ..." />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Résultat détaillé */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    <h3 className="text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">Résultat détaillé</h3>
                  </div>
                  <textarea className="w-full h-24 p-4 rounded-[1.25rem] bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed text-slate-900 dark:text-slate-100 font-medium focus:border-pink-400 outline-none transition-all resize-none italic"
                    placeholder="Description fine de l'image..."
                    value={formData.resultatDetaille} onChange={(e) => setFormData({...formData, resultatDetaille: e.target.value})} />
                </div>
              </div>

              <div className="px-6 lg:px-7 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-white dark:bg-slate-950">
                <button onClick={handleAnnuler}
                  className="h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Annuler
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="h-10 px-5 rounded-xl bg-pink-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-md hover:bg-pink-600 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  {saving ? 'Enregistrement...' : "Enregistrer l'examen"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LISTE ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {examens.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 mb-5 border border-slate-200 dark:border-slate-800">
                <ClipboardList size={36} />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun compte-rendu d'échographie</p>
            </div>
          )}

          {examens.map((exam) => (
            <div key={exam.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-white to-pink-50/20 dark:from-slate-950 dark:to-pink-950/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <Calendar size={22} className="text-black dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-black uppercase tracking-tight">Le {formatDate(exam.date)}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-pink-600 uppercase tracking-widest">Site: {f(exam.seinExamine)}</span>
                      <span className="text-slate-200 dark:text-slate-700">•</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dr. {exam.auteurPrenom} {exam.auteurNom}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 h-8 px-4 rounded-lg bg-slate-950 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
                    <Edit2 size={10} strokeWidth={2.8} />Modifier
                  </button>
                  <button onClick={() => handleSupprimer(exam.id)}
                    className="w-8 h-8 rounded-lg border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-500 hover:text-rose-600 transition-all">
                    <Trash2 size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="p-4 lg:p-6 text-slate-900 dark:text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-stretch">

                  {/* Bloc Gauche */}
                  <div className="xl:col-span-4 flex flex-col gap-5">
                    <div className="flex-1 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm flex flex-col">
                      {exam.imageRadio ? (
                        <div className="group relative bg-black aspect-[4/3] overflow-hidden shrink-0">
                          <img src={`http://localhost:8080/uploads/${exam.imageRadio}`} alt="Cliché"
                            className="w-full h-full object-cover opacity-90 transition-all duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-5 flex flex-col justify-end">
                            <span className="text-[9px] font-black text-pink-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
                              <Zap size={10} strokeWidth={3} />Coupe d'intérêt
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-3 text-slate-300 shrink-0">
                          <ImageIcon size={32} strokeWidth={1} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Document non imagé</span>
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Localisation</h4>
                            <div className="px-2.5 py-0.5 rounded-full bg-pink-500 text-[8px] font-black text-white uppercase tracking-widest">Sein {f(exam.seinExamine)}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block">Quadrant</span>
                              <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase">{f(exam.quadrant)}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block">Distance</span>
                              <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase">
                                {exam.distanceMamelon ? `${exam.distanceMamelon} cm` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]">Status: Validé</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloc Milieu */}
                  <div className="xl:col-span-4 flex flex-col gap-5">
                    <div className="flex-1 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col shadow-inner">
                      <div className="flex items-center gap-2.5">
                        <div className="w-1 h-5 bg-pink-500 rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em]">Morphologie</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-5 flex-1">
                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Forme</span>
                            <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{f(exam.forme)}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Orientation</span>
                            <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{f(exam.orientation)}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Contours</span>
                          <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight leading-snug">{f(exam.contours)}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Échostructure</span>
                          <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight leading-snug">{f(exam.echostructure)}</p>
                        </div>
                        <div className="pt-5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-5">
                          <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vascularisation</span>
                            <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{f(exam.vascularisationDoppler)}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Calcifications</span>
                            <p className={`text-[11px] font-black uppercase tracking-tight ${exam.calcificationsPresentes === 'Oui' ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {f(exam.calcificationsPresentes)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl border border-pink-100 dark:border-pink-900/30 bg-pink-50/70 dark:bg-pink-950/20 shadow-xl space-y-2">
                        <span className="text-[9px] font-black text-pink-600 dark:text-pink-500 uppercase tracking-[0.25em]">Biométrie (X•Y•Z)</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black tabular-nums">{exam.tailleAxe1 || '0'}</span>
                          <span className="text-xs font-bold text-slate-400">×</span>
                          <span className="text-2xl font-black tabular-nums">{exam.tailleAxe2 || '0'}</span>
                          <span className="text-xs font-bold text-slate-400">×</span>
                          <span className="text-2xl font-black tabular-nums">{exam.tailleAxe3 || '0'}</span>
                          <span className="text-[10px] font-bold text-pink-500 ml-1 italic uppercase">mm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloc Droit */}
                  <div className="xl:col-span-4 flex flex-col gap-5">
                    <div className="flex-1 relative rounded-3xl bg-pink-50/50 dark:bg-pink-950/10 p-6 overflow-hidden shadow-2xl border border-pink-100/50 dark:border-pink-900/20 group h-full flex flex-col">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 blur-[100px] rounded-full" />
                      <div className="relative z-10 space-y-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1.5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500">Diagnostic</h4>
                            <p className="text-base font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight">{f(exam.typeStructure)}</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter mb-1">Score BI-RADS</span>
                            <div className="w-14 h-14 rounded-2xl bg-pink-500 text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-pink-500/30">
                              {exam.scoreBIRADS || '—'}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-white/10 flex-1 flex flex-col">
                          <div className="space-y-3">
                            <span className="text-[9px] font-black text-pink-500 uppercase tracking-[0.25em]">Recommandation</span>
                            <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100/50 dark:border-pink-900/30">
                              <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase leading-relaxed tracking-tight">
                                {exam.recommandation || 'Aucune recommandation'}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                              <FileText size={12} className="text-slate-400" />
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Observations</span>
                            </div>
                            <p className="text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400 px-1">
                              {exam.resultatDetaille
                                ? <span className="italic">"{exam.resultatDetaille}"</span>
                                : <span className="text-slate-400">Aucun commentaire</span>
                              }
                            </p>
                          </div>
                          <div className="mt-auto pt-8 border-t border-pink-200/30 dark:border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <Check size={11} strokeWidth={3} className="text-pink-500" />Signature Digitale Approuvée
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default EchographiePage;