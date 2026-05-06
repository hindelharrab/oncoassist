import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit3, X,
  ClipboardList, User, ShieldCheck, FileSearch,
  Send, Calendar, RefreshCw, CheckCircle2, Loader2
} from 'lucide-react';
import { useQuestionnaire } from '../../context/QuestionnaireContext';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';

// ── Fréquences disponibles ─────────────────────────────────────────────────
// ← Adaptez selon votre FrequenceEnum Java
// ── Fréquences — valeurs exactes de FrequenceEnum.java ────────────────────
const FREQUENCES = [
  { value: 'HEBDOMADAIRE',   label: 'Hebdomadaire'    },
  { value: 'BIHEBDOMADAIRE', label: 'Bihebdomadaire'  },
  { value: 'MENSUELLE',      label: 'Mensuelle'       },
];

// ══════════════════════════════════════════════════════════════════════════
// MODAL — Attribution du questionnaire
// ══════════════════════════════════════════════════════════════════════════
const AttributionModal = ({ isOpen, onClose, patientId, medecinId }) => {
  const today = new Date().toISOString().split('T')[0];

  const [dateFin,   setDateFin]   = useState('');
  const [frequence, setFrequence] = useState('HEBDOMADAIRE');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    if (isOpen) {
      setDateFin('');
      setFrequence('HEBDOMADAIRE');
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!frequence) {
      setError('Veuillez choisir une fréquence.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post('/questionnaire/attribuer', {
        patientId,
        medecinId,
        frequence,
        dateFin: dateFin || null,   // ← null si non renseignée = sans limite
      });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'attribution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{   opacity: 0, y: 20, scale: 0.97   }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                  Attribuer le Questionnaire
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Questions globales + personnalisées
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Corps */}
            <div className="px-8 py-6 flex flex-col gap-5">

              {error && (
                <div className="text-[10px] text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2 font-medium">
                  {error}
                </div>
              )}

              {/* Info */}
              <div className="flex items-start gap-3 px-3 py-3 bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/30 rounded-lg">
                <ClipboardList size={14} className="text-sky-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-sky-600 dark:text-sky-400 font-medium leading-relaxed">
                  Le questionnaire attribué inclut toutes les <strong>questions globales</strong> ainsi que les <strong>questions personnalisées</strong> de cette patiente.
                </p>
              </div>

              {/* Fréquence */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <RefreshCw size={10} /> Fréquence d'envoi
                </label>
                <div className="flex gap-2">
                  {FREQUENCES.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setFrequence(f.value)}
                      className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        frequence === f.value
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date fin (optionnelle) */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={10} /> Date de fin
                  <span className="text-gray-300 dark:text-gray-600 font-medium normal-case tracking-normal">
                    (optionnelle — laisser vide = sans limite)
                  </span>
                </label>
                <input
                  type="date"
                  value={dateFin}
                  min={today}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-[11px] font-semibold text-gray-700 dark:text-white outline-none focus:border-gray-300 dark:focus:border-gray-500 transition-all"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || success}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm transition-all disabled:cursor-not-allowed ${
                  success
                    ? 'bg-emerald-500 text-white'
                    : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80 disabled:opacity-40'
                }`}
              >
                {loading  && <Loader2      size={12} className="animate-spin" />}
                {success  && <CheckCircle2 size={12} />}
                {!loading && !success && <Send size={12} />}
                {loading ? 'Attribution...' : success ? 'Attribué !' : 'Attribuer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
// ══════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════
const PatientQuestionnairePage = () => {
  const { id: patientId } = useParams();
const { user } = useAuth(); 
  const {
    loadQuestionsForPatient,
    getQuestionsForPatient,
    addPatientQuestion,
    deletePatientQuestion,
    updatePatientQuestion,
  } = useQuestionnaire();

  useEffect(() => {
    if (patientId) loadQuestionsForPatient(patientId);
  }, [patientId]);

  const allQuestions = getQuestionsForPatient(patientId);

  // ── State modal question ─────────────────────────────────────────────
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [currentQuestion,  setCurrentQuestion]  = useState(null);
  const [formText,         setFormText]         = useState('');
  const [formType,         setFormType]         = useState('unique');
  const [formOptions,      setFormOptions]      = useState(['', '']);

  // ── State modal attribution ──────────────────────────────────────────
  const [isAttributionOpen, setIsAttributionOpen] = useState(false);

  const openAddModal = () => {
    setCurrentQuestion(null);
    setFormText('');
    setFormType('unique');
    setFormOptions(['', '']);
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setCurrentQuestion(q);
    setFormText(q.text);
    setFormType(q.type || 'unique');
    setFormOptions(q.options);
    setIsModalOpen(true);
  };

  const handleAddOption    = () => setFormOptions([...formOptions, '']);
  const handleRemoveOption = (index) => {
    if (formOptions.length > 1)
      setFormOptions(formOptions.filter((_, i) => i !== index));
  };

  const handleSaveQuestion = () => {
    if (!formText.trim()) return;
    const filteredOptions = formOptions.filter(o => o.trim() !== '');
    if (currentQuestion) {
      updatePatientQuestion(patientId, currentQuestion.id, { text: formText, type: formType, options: filteredOptions });
    } else {
      addPatientQuestion(patientId, { text: formText, type: formType, options: filteredOptions });
    }
    setIsModalOpen(false);
    setFormText('');
    setFormType('unique');
    setFormOptions(['', '']);
  };

  const globalCount = allQuestions.filter(q =>  q.isGlobal).length;
  const customCount = allQuestions.filter(q => !q.isGlobal).length;

  return (
    <div className="h-full flex flex-col font-inter bg-white dark:bg-gray-950 p-2 lg:p-4 overflow-hidden">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full overflow-hidden">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Questionnaires Patient
              </h1>
              <p className="text-gray-400 dark:text-gray-500 text-[11px] font-medium mt-0.5 uppercase tracking-widest">
                Configuration personnalisée du suivi
              </p>
            </div>
          </div>

          {/* Boutons header */}
          <div className="flex items-center gap-2">
            {/* ← NOUVEAU : bouton Attribuer */}
            <button
  onClick={() => setIsAttributionOpen(true)}
  className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
>
  <Send size={14} />
  Attribuer le questionnaire
</button>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
            >
              <Plus size={16} /> Question personnalisée
            </button>
          </div>
        </div>

        {/* ── Résumé rapide ────────────────────────────────────────────── */}
        <div className="px-8 py-3 border-b border-gray-50 dark:border-gray-800 flex items-center gap-6 bg-gray-50/30 dark:bg-gray-800/10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-sky-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {globalCount} question{globalCount > 1 ? 's' : ''} globale{globalCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-100 dark:bg-gray-800" />
          <div className="flex items-center gap-2">
            <User size={12} className="text-sky-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {customCount} question{customCount > 1 ? 's' : ''} personnalisée{customCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-100 dark:bg-gray-800" />
          <div className="flex items-center gap-2">
            <ClipboardList size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total : {globalCount + customCount} question{globalCount + customCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/20 dark:bg-gray-950/20">

          {/* Questions globales */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 py-1.5 border border-gray-100 dark:border-gray-800 rounded-full flex items-center gap-2">
                <ShieldCheck size={12} className="text-sky-500" /> Questions de Base (Globales)
              </span>
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allQuestions.filter(q => q.isGlobal).map((q, idx) => (
                <div key={q.id} className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-sky-500/20" />
                  <div className="flex items-center justify-between mb-3 text-[9px] font-black uppercase tracking-widest">
                    <span className="text-gray-300 dark:text-gray-600">Base Q.{idx + 1}</span>
                    <span className={`px-1.5 py-0.5 rounded ${q.type === 'multiple' ? 'bg-indigo-50 text-indigo-500' : 'bg-sky-50 text-sky-500'}`}>
                      {q.type === 'multiple' ? 'Multiple' : 'Unique'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-4">{q.text}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((opt, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-[9px] font-medium text-gray-400 rounded-md">
                        {q.type === 'multiple' ? '□' : '○'} {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Questions personnalisées */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 py-1.5 border border-gray-100 dark:border-gray-800 rounded-full flex items-center gap-2">
                <User size={12} className="text-sky-500" /> Questions Personnalisées
              </span>
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            </div>

            {allQuestions.filter(q => !q.isGlobal).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {allQuestions.filter(q => !q.isGlobal).map((q, idx) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1   }}
                      exit={{   opacity: 0, scale: 0.9  }}
                      className="group p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-sky-500/20" />
                      <div className="flex items-center justify-between mb-3 text-[9px] font-black uppercase tracking-widest">
                        <span className="text-gray-300 dark:text-gray-600">Perso Q.{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded transition-opacity group-hover:opacity-0 ${q.type === 'multiple' ? 'bg-indigo-50 text-indigo-500' : 'bg-sky-50 text-sky-500'}`}>
                            {q.type === 'multiple' ? 'Multiple' : 'Unique'}
                          </span>
                          <div className="absolute top-0 right-0 p-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(q)}
                              className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => deletePatientQuestion(patientId, q.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-500 transition-all hover:bg-rose-50 rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white mb-4 pr-12">{q.text}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {q.options.map((opt, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-[9px] font-medium text-gray-400 rounded-md">
                            {q.type === 'multiple' ? '□' : '○'} {opt}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900/50">
                <FileSearch size={32} className="text-gray-200 mb-3" />
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">
                  Aucune question personnalisée<br />ajoutée pour ce dossier
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-4 text-[10px] font-black text-pink-600 uppercase tracking-widest hover:underline"
                >
                  + Ajouter maintenant
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Modal question personnalisée ─────────────────────────────── */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{   opacity: 0, y: 20  }}
                className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="shrink-0 p-8 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    {currentQuestion ? 'Modifier la question' : 'Question Spécifique'}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    Cette question ne sera visible QUE pour cette patiente.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Type de Réponse
                    </label>
                    <div className="flex gap-2">
                      {['unique', 'multiple'].map(t => (
                        <button
                          key={t}
                          onClick={() => setFormType(t)}
                          className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            formType === t
                              ? 'bg-black text-white border-black shadow-lg shadow-black/10'
                              : 'bg-gray-50 border-transparent text-gray-400'
                          }`}
                        >
                          {t === 'unique' ? 'Choix Unique' : 'Choix Multiple'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Libellé clinique
                    </label>
                    <textarea
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      placeholder="Ex: Avez-vous noté une rougeur au point d'injection?"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-lg text-sm font-medium focus:bg-white focus:border-gray-200 transition-all outline-none resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3 pb-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Choix possibles
                      </label>
                      <button
                        onClick={handleAddOption}
                        className="text-[9px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-1"
                      >
                        <Plus size={10} /> Ajouter
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formOptions.map((opt, i) => (
                        <div key={i} className="relative group">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...formOptions];
                              newOpts[i] = e.target.value;
                              setFormOptions(newOpts);
                            }}
                            placeholder={`Option ${i + 1}`}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-lg text-[11px] font-semibold focus:bg-white focus:border-gray-200 transition-all outline-none"
                          />
                          <button
                            onClick={() => handleRemoveOption(i)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 px-8 py-5 bg-gray-50/50 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveQuestion}
                    className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    {currentQuestion ? 'Mettre à jour' : 'Valider et Ajouter'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── Modal attribution ────────────────────────────────────────── */}
       <AttributionModal
  isOpen={isAttributionOpen}
  onClose={() => setIsAttributionOpen(false)}
  patientId={patientId}
  medecinId={user?.id}    // ← user.id = id du médecin connecté
/>

      </div>
    </div>
  );
};

export default PatientQuestionnairePage;