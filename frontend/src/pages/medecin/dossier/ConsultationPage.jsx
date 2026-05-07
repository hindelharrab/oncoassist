import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  Trash2,
  Edit2,
  Users,
  Stethoscope,
  ClipboardList,
  X,
  Save,
  Check,
  FileText,
  History,
  UserPlus
} from 'lucide-react';

const statusStyles = {
  EN_COURS: "bg-amber-50 text-amber-700 border-amber-200",
  GUERI: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ACTIF: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const ConsultationPage = () => {
  const { id } = useParams();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingConsultationId, setEditingConsultationId] = useState(null);

  const [consultations, setConsultations] = useState([
    {
      id: 1,
      date: '15/03/2025',
      type: 'Consultation Standard',
      medecin: 'Dr. Sarah Martin',
      personalHistory: [
        { id: 1, maladie: 'Diabète type 2', dateDiagnostic: '2019', statut: 'EN_COURS', traitements: 'Metformine' },
        { id: 2, maladie: 'Appendicectomie', dateDiagnostic: '2015', statut: 'GUERI', traitements: 'Chirurgical' }
      ],
      familyHistory: [
        { id: 1, lienFamilial: 'Mère', maladie: 'Cancer du sein', ageSurvenue: 52 },
        { id: 2, lienFamilial: 'Sœur', maladie: 'Cancer ovaire', ageSurvenue: 45 }
      ],
      manualExam: {
        siteAnatomique: 'Droite',
        massePalpee: 'Masse palpable quadrant supéro-externe de 2cm, mobile, non douloureuse.',
        localisationDeMasse: 'Quadrant Supéro-Externe (QSE)',
        aspectPeau: 'Normal',
        adenopathies: 'Non'
      },
      notes: 'Patiente consciente, motivée pour le suivi. Tolérance aux traitements actuelle satisfaisante.'
    }
  ]);

  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('fr-FR'),
    type: 'Consultation Standard',
    personalHistory: [],
    familyHistory: [],
    manualExam: {
      siteAnatomique: 'Droite',
      massePalpee: '',
      localisationDeMasse: '',
      aspectPeau: 'Normal',
      adenopathies: 'Non'
    },
    notes: ''
  });

  const [tempMedical, setTempMedical] = useState({ maladie: '', dateDiagnostic: '', statut: 'EN_COURS', traitements: '' });
  const [tempFamily, setTempFamily] = useState({ lienFamilial: '', maladie: '', ageSurvenue: '' });

  const addMedicalHistory = () => {
    if (tempMedical.maladie) {
      setFormData(prev => ({
        ...prev,
        personalHistory: [...prev.personalHistory, { ...tempMedical, id: Date.now() }]
      }));
      setTempMedical({ maladie: '', dateDiagnostic: '', statut: 'EN_COURS', traitements: '' });
    }
  };

  const addFamilyHistory = () => {
    if (tempFamily.maladie) {
      setFormData(prev => ({
        ...prev,
        familyHistory: [...prev.familyHistory, { ...tempFamily, id: Date.now() }]
      }));
      setTempFamily({ lienFamilial: '', maladie: '', ageSurvenue: '' });
    }
  };

  const removeMedicalItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      personalHistory: prev.personalHistory.filter(h => h.id !== itemId)
    }));
  };

  const removeFamilyItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      familyHistory: prev.familyHistory.filter(h => h.id !== itemId)
    }));
  };

  const handleSaveConsultation = () => {
    const newConsult = {
      ...formData,
      id: Date.now(),
      medecin: 'Dr. Sarah Martin'
    };
    setConsultations([newConsult, ...consultations]);
    setIsAddingNew(false);
    setFormData({
      date: new Date().toLocaleDateString('fr-FR'),
      type: 'Consultation Standard',
      personalHistory: [],
      familyHistory: [],
      manualExam: { siteAnatomique: 'Droite', massePalpee: '', localisationDeMasse: '', aspectPeau: 'Normal', adenopathies: 'Non' },
      notes: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-white">
      <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6 font-sans">

        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center">
              <ClipboardList size={22} className="text-pink-500" strokeWidth={2.3} />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-black tracking-tight uppercase">
                Journal des Consultations
              </h1>

              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-black" />
                <span className="text-[10px] font-bold text-black uppercase tracking-[0.25em]">
                  Dossier Patient
                </span>
                <span className="px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-[0.2em]">
                  ACTIF
                </span>
              </div>
            </div>
          </div>

          {!isAddingNew && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-2 h-11 px-5 rounded-2xl bg-slate-950 text-white font-bold text-[10px] uppercase tracking-[0.22em] shadow-lg shadow-slate-200 dark:shadow-none hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              <Plus size={16} />
              Nouvelle Consultation
            </button>
          )}
        </div>

        {/* INLINE NEW CONSULTATION (NO MODAL) */}
        <AnimatePresence>
          {isAddingNew && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-[0_15px_50px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              <div className="px-6 lg:px-7 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-pink-50 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center">
                      <UserPlus size={16} strokeWidth={2.8} />
                    </div>
                    <h2 className="text-lg lg:text-xl font-black uppercase tracking-tight">
                      Nouvelle Saisie Clinique
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 ml-10 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocole de Validation</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formData.date}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 lg:p-8 space-y-8">
                {/* SECTION 1 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Medical */}
                  <div className="rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-[#fcfcfd] dark:bg-slate-900/30 p-6 lg:p-7 shadow-sm">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                        <History size={16} />
                      </div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.22em]">Historique Médical</h3>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Pathologie</label>
                          <input
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400 transition-all"
                            value={tempMedical.maladie}
                            onChange={(e) => setTempMedical({ ...tempMedical, maladie: e.target.value })}
                            placeholder="Ex: Diabète..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Année Diag.</label>
                          <input
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400 transition-all"
                            value={tempMedical.dateDiagnostic}
                            onChange={(e) => setTempMedical({ ...tempMedical, dateDiagnostic: e.target.value })}
                            placeholder="Ex: 2021"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Traitement</label>
                          <input
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400 transition-all"
                            value={tempMedical.traitements}
                            onChange={(e) => setTempMedical({ ...tempMedical, traitements: e.target.value })}
                            placeholder="Médicaments..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Statut Actuel</label>
                          <select
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-pink-400 transition-all"
                            value={tempMedical.statut}
                            onChange={(e) => setTempMedical({ ...tempMedical, statut: e.target.value })}
                          >
                            <option value="EN_COURS">EN COURS</option>
                            <option value="GUERI">GUÉRI</option>
                            <option value="ACTIF">ACTIF</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={addMedicalHistory}
                        className="w-full h-10 rounded-xl bg-slate-950 text-white text-[10px] font-bold uppercase tracking-[0.22em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={12} />
                        Ajouter
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {formData.personalHistory.map(h => (
                        <div key={h.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                            {h.maladie} <span className="text-slate-400 italic">({h.dateDiagnostic})</span>
                          </span>
                          <button onClick={() => removeMedicalItem(h.id)} className="text-rose-500 hover:text-rose-600">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Family */}
                  <div className="rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-[#fcfcfd] dark:bg-slate-900/30 p-6 lg:p-7 shadow-sm">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.22em]">Facteurs Génétiques</h3>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Lien de Parenté</label>
                        <input
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400 transition-all"
                          value={tempFamily.lienFamilial}
                          onChange={(e) => setTempFamily({ ...tempFamily, lienFamilial: e.target.value })}
                          placeholder="Ex: Mère, Grand-père..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Pathologie</label>
                          <input
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400 transition-all"
                            value={tempFamily.maladie}
                            onChange={(e) => setTempFamily({ ...tempFamily, maladie: e.target.value })}
                            placeholder="Ex: Cancer..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">À l'âge de</label>
                          <input
                            type="number"
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[11px] font-semibold outline-none focus:border-pink-400 transition-all"
                            value={tempFamily.ageSurvenue}
                            onChange={(e) => setTempFamily({ ...tempFamily, ageSurvenue: e.target.value })}
                            placeholder="Ex: 50"
                          />
                        </div>
                      </div>

                      <button
                        onClick={addFamilyHistory}
                        className="w-full h-10 rounded-xl bg-slate-950 text-white text-[10px] font-bold uppercase tracking-[0.22em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={12} />
                        Ajouter
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {formData.familyHistory.map(h => (
                        <div key={h.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                            {h.lienFamilial} — {h.maladie}
                          </span>
                          <button onClick={() => removeFamilyItem(h.id)} className="text-rose-500 hover:text-rose-600">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION 2 */}
                <div className="rounded-[1.75rem] border border-pink-100 dark:border-pink-900/30 bg-gradient-to-br from-pink-50/70 via-white to-sky-50/50 dark:from-pink-950/10 dark:via-slate-950 dark:to-sky-950/10 p-6 lg:p-7 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-md">
                      <Stethoscope size={17} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-900 dark:text-white">
                      Examen Manuel Clinique
                    </h3>
                  </div>

                  <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                          Site Anatomique
                        </label>
                        <div className="flex bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-11">
                          {['Gauche', 'Droite', 'Bilateral'].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setFormData({ ...formData, manualExam: { ...formData.manualExam, siteAnatomique: s } })}
                              className={`flex-1 text-[9px] font-black uppercase tracking-tight rounded-lg transition-all ${
                                formData.manualExam.siteAnatomique === s
                                  ? 'bg-slate-950 text-white shadow-md'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                            Aspect
                          </label>
                          <select
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[10px] font-black uppercase tracking-widest outline-none focus:border-pink-400 shadow-sm"
                            value={formData.manualExam.aspectPeau}
                            onChange={(e) => setFormData({ ...formData, manualExam: { ...formData.manualExam, aspectPeau: e.target.value } })}
                          >
                            <option value="Normal">NORMAL</option>
                            <option value="Rougeur">ROUGEUR</option>
                            <option value="Capitons">CAPITONS</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                            Adéno.
                          </label>
                          <div className="flex bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-11">
                            {['Non', 'Oui'].map(a => (
                              <button
                                key={a}
                                type="button"
                                onClick={() => setFormData({ ...formData, manualExam: { ...formData.manualExam, adenopathies: a } })}
                                className={`flex-1 text-[9px] font-black uppercase tracking-tight rounded-lg transition-all ${
                                  formData.manualExam.adenopathies === a
                                    ? 'bg-slate-950 text-white shadow-md'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                          Localisation
                        </label>
                        <input
                          className="w-full h-11 px-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold uppercase tracking-wider outline-none focus:border-pink-400 shadow-sm"
                          value={formData.manualExam.localisationDeMasse}
                          onChange={(e) => setFormData({ ...formData, manualExam: { ...formData.manualExam, localisationDeMasse: e.target.value } })}
                          placeholder="EX: QUADRANT..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                          Description
                        </label>
                        <textarea
                          className="w-full h-28 px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-medium leading-relaxed outline-none focus:border-pink-400 resize-none italic shadow-sm"
                          value={formData.manualExam.massePalpee}
                          onChange={(e) => setFormData({ ...formData, manualExam: { ...formData.manualExam, massePalpee: e.target.value } })}
                          placeholder="..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    <h3 className="text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                      Notes Cliniques
                    </h3>
                  </div>

                  <textarea
                    className="w-full h-24 p-4 rounded-[1.25rem] bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed text-slate-900 dark:text-slate-100 font-medium focus:border-pink-400 outline-none transition-all resize-none italic"
                    placeholder="Observation générale..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="px-6 lg:px-7 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-white dark:bg-slate-950">
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveConsultation}
                  className="h-10 px-5 rounded-xl bg-pink-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-md shadow-pink-100 dark:shadow-none hover:bg-pink-600 transition-all flex items-center gap-2"
                >
                  <Save size={12} />
                  Sauvegarder
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONSULTATION LIST */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {consultations.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 mb-5 border border-slate-200 dark:border-slate-800">
                <FileText size={36} />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Aucune consultation enregistrée
              </p>
            </div>
          )}

          {consultations.map((consult) => (
            <div
              key={consult.id}
              className="bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-[0_10px_35px_rgba(15,23,42,0.05)] overflow-hidden"
            >
              {/* HEADER CARD */}
              <div className="px-6 lg:px-7 py-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-white via-white to-pink-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-pink-950/10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
                    <Calendar size={20} className="text-black" />
                  </div>

                  <div>
                    <h2 className="text-base lg:text-lg font-black uppercase tracking-tight">
                      Le {consult.date}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-pink-600">{consult.type}</span>
                      <span className="text-slate-300">•</span>
                      <span>{consult.medecin}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
                    <Edit2 size={11} strokeWidth={2.8} />
                    Modifier
                  </button>
                  <button className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-pink-500 hover:text-pink-600 transition-all">
                    <Trash2 size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="p-6 lg:p-7">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* LEFT */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <History size={14} className="text-pink-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.22em]">Antécédents Personnels</h3>
                      </div>

                      <div className="mt-3 space-y-3">
                        {consult.personalHistory.map((item) => (
                          <div key={item.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fcfcfd] dark:bg-slate-900/35 flex items-center justify-between gap-4 shadow-sm">
                            <div className="space-y-1">
                              <h4 className="text-[12px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                {item.maladie}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Diag: {item.dateDiagnostic}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{item.traitements}</span>
                              </div>
                            </div>

                            <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border ${statusStyles[item.statut] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                              {item.statut.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <Users size={14} className="text-amber-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.22em]">Antécédents Familiaux</h3>
                      </div>

                      <div className="mt-3 space-y-3">
                        {consult.familyHistory.map((item) => (
                          <div key={item.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fcfcfd] dark:bg-slate-900/35 flex items-center justify-between gap-4 shadow-sm">
                            <div className="space-y-1">
                              <h4 className="text-[12px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                {item.maladie}
                              </h4>
                              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                                Détecté à {item.ageSurvenue} ans
                              </p>
                            </div>

                            <span className="text-[8px] font-bold text-pink-700 dark:text-pink-300 uppercase tracking-widest bg-pink-50 dark:bg-pink-950/40 px-2.5 py-1 rounded-full border border-pink-200 dark:border-pink-900/40">
                              {item.lienFamilial}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="space-y-6">
                    <div className="rounded-[1.75rem] p-6 border border-pink-100 dark:border-pink-900/30 bg-gradient-to-br from-pink-50/80 via-white to-sky-50/40 dark:from-pink-950/10 dark:via-slate-950 dark:to-sky-950/10 shadow-sm">
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-pink-200/50">
                        <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-md">
                          <Stethoscope size={16} />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.22em]">
                          Examen Clinique
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-pink-200/50">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Site</label>
                          <p className="text-[10px] font-bold uppercase text-pink-700 dark:text-pink-300">
                            {consult.manualExam.siteAnatomique}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Localisation</label>
                          <p className="text-[10px] font-bold uppercase text-slate-900 dark:text-slate-100 truncate">
                            {consult.manualExam.localisationDeMasse || 'N/A'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Aspect Peau</label>
                          <span className="text-[10px] font-bold uppercase text-slate-900 dark:text-slate-200">
                            {consult.manualExam.aspectPeau}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Adéno.</label>
                          <p className="text-[10px] font-bold uppercase text-slate-900 dark:text-slate-200">
                            {consult.manualExam.adenopathies}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                          Conclusions
                        </label>
                        <div className="p-4 bg-white dark:bg-slate-900/70 rounded-2xl border border-pink-100 dark:border-pink-900/30 italic text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 shadow-sm min-h-[70px]">
                          "{consult.manualExam.massePalpee}"
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <FileText size={14} className="text-slate-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.22em]">
                          Notes
                        </h3>
                      </div>
                      <div className="mt-3 p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-[12px] leading-relaxed italic shadow-inner">
                        "{consult.notes}"
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

export default ConsultationPage;