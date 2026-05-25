import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit3, X, ClipboardList, User, ShieldCheck, FileSearch,
  Send, Calendar, RefreshCw, CheckCircle2, Loader2, Circle, CheckSquare,
  Search, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { useQuestionnaire } from '../../context/QuestionnaireContext';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/AuthContext';

// ── Fréquences disponibles ─────────────────────────────────────────────────
const FREQUENCES = [
  { value: 'HEBDOMADAIRE',   label: 'Hebdomadaire'    },
  { value: 'BIHEBDOMADAIRE', label: 'Bihebdomadaire'  },
  { value: 'MENSUELLE',      label: 'Mensuelle'       },
];

// ─── Type Badge ──────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const styles = type === 'multiple'
    ? { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: CheckSquare, label: 'Choix multiple' }
    : { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: Circle, label: 'Choix unique' };
  const Icon = styles.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${styles.bg} ${styles.text} ${styles.border}`}>
      <Icon size={9} strokeWidth={2.5} />
      {styles.label}
    </span>
  );
};

// ─── Question Row (style table dense) ────────────────────────────────────────
const QuestionRow = ({ q, idx, isLast, onEdit, onDelete, isGlobal = false }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group transition-colors hover:bg-slate-50/60"
      style={{ borderBottom: isLast ? 'none' : '1px solid #f1f5f9' }}
    >
      <div className="px-5 py-3.5 flex items-center gap-4">
        <span className="text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider bg-slate-50 text-slate-500 border-slate-200 tabular-nums shrink-0">
          Q{String(idx + 1).padStart(2, '0')}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TypeBadge type={q.type} />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {q.options.length} réponse{q.options.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-[13px] font-bold text-slate-900 truncate leading-tight">
            {q.text}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {!isGlobal && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(q)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors border border-slate-100 hover:border-indigo-200"
              title="Modifier"
            >
              <Edit3 size={12} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => onDelete(q)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors border border-slate-100 hover:border-rose-200"
              title="Supprimer"
            >
              <Trash2 size={12} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-4 pt-1" style={{ paddingLeft: 76 }}>
              <div className="bg-slate-50/60 border border-slate-100 rounded-lg p-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Réponses proposées
                </p>
                <div className="flex flex-col gap-1.5">
                  {q.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      {q.type === 'multiple' ? (
                        <div className="w-3.5 h-3.5 rounded-[3px] border-[1.5px] border-slate-300 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-slate-300 shrink-0" />
                      )}
                      <span className="text-[12px] font-semibold text-slate-700">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Shared input style ──────────────────────────────────────────────────────
const inputClass =
  "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        dateFin: dateFin || null,
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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-5 flex items-start justify-between border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                  <Send size={16} className="text-indigo-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1.5">
                    Attribuer le Questionnaire
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Questions globales + personnalisées
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-100 hover:bg-slate-50 text-slate-500 transition-colors shrink-0"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            <div className="px-6 py-6 flex flex-col gap-5">
              {error && (
                <div className="text-[10px] text-rose-500 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 font-medium">
                  {error}
                </div>
              )}

              <div className="flex items-start gap-3 px-3 py-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <ClipboardList size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-indigo-600 font-medium leading-relaxed">
                  Le questionnaire attribué inclut toutes les <strong>questions globales</strong> ainsi que les <strong>questions personnalisées</strong> de cette patiente.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <RefreshCw size={10} /> Fréquence d'envoi
                </label>
                <div className="flex gap-2">
                  {FREQUENCES.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setFrequence(f.value)}
                      className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        frequence === f.value
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={10} /> Date de fin
                  <span className="text-slate-300 font-medium normal-case tracking-normal">(optionnelle)</span>
                </label>
                <input
                  type="date"
                  value={dateFin}
                  min={today}
                  onChange={(e) => setDateFin(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] uppercase font-black tracking-widest rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || success}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm transition-all disabled:cursor-not-allowed ${
                  success
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-900 hover:bg-black text-white'
                }`}
              >
                {loading  && <Loader2 size={12} className="animate-spin" />}
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

  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [currentQuestion,  setCurrentQuestion]  = useState(null);
  const [formText,         setFormText]         = useState('');
  const [formType,         setFormType]         = useState('unique');
  const [formOptions,      setFormOptions]      = useState(['', '']);
  const [isAttributionOpen, setIsAttributionOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

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
    setFormOptions([...q.options]);
    setIsModalOpen(true);
  };

  const confirmDelete = (q) => {
    setQuestionToDelete(q);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (questionToDelete) {
      deletePatientQuestion(patientId, questionToDelete.id);
      setIsDeleteModalOpen(false);
      setQuestionToDelete(null);
    }
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
  };

  const globalQuestions = allQuestions.filter(q => q.isGlobal);
  const customQuestions = allQuestions.filter(q => !q.isGlobal);

  return (
    <div className="max-w-full mx-auto space-y-4 animate-in fade-in duration-500 min-h-screen p-6" style={{ backgroundColor: '#fafbfc' }}>
      
      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
            <ClipboardList size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Questionnaires Patient
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.15em] mt-0.5">
              Configuration personnalisée du suivi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAttributionOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white text-[10px] uppercase font-black tracking-[0.15em] rounded-xl transition-all shadow-md"
          >
            <Send size={14} strokeWidth={3} /> Attribuer le questionnaire
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-black text-white text-[10px] uppercase font-black tracking-[0.15em] rounded-xl transition-all shadow-md"
          >
            <Plus size={14} strokeWidth={3} /> Question personnalisée
          </button>
        </div>
      </div>

      {/* ── RÉSUMÉ RAPIDE ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-indigo-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {globalQuestions.length} question{globalQuestions.length > 1 ? 's' : ''} globale{globalQuestions.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-2">
          <User size={12} className="text-sky-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {customQuestions.length} question{customQuestions.length > 1 ? 's' : ''} personnalisée{customQuestions.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-2">
          <ClipboardList size={12} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Total : {globalQuestions.length + customQuestions.length} question{globalQuestions.length + customQuestions.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── QUESTIONS GLOBALES ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-md overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Questions de Base (Globales)
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">
            {globalQuestions.length} question{globalQuestions.length > 1 ? 's' : ''}
          </span>
        </div>

        {globalQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <ShieldCheck size={26} className="text-slate-300" />
            </div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Aucune question globale disponible
            </p>
          </div>
        ) : (
          <div>
            {globalQuestions.map((q, idx) => (
              <QuestionRow
                key={q.id}
                q={q}
                idx={idx}
                isLast={idx === globalQuestions.length - 1}
                isGlobal={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── QUESTIONS PERSONNALISÉES ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-md overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <User size={14} className="text-sky-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Questions Personnalisées
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">
            {customQuestions.length} question{customQuestions.length > 1 ? 's' : ''}
          </span>
        </div>

        {customQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <FileSearch size={26} className="text-slate-300" />
            </div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Aucune question personnalisée
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-[10px] uppercase font-black tracking-widest rounded-lg transition-all"
            >
              <Plus size={12} strokeWidth={3} /> Ajouter une question
            </button>
          </div>
        ) : (
          <div>
            {customQuestions.map((q, idx) => (
              <QuestionRow
                key={q.id}
                q={q}
                idx={idx}
                isLast={idx === customQuestions.length - 1}
                isGlobal={false}
                onEdit={openEditModal}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ══ CREATE / EDIT MODAL ════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="relative w-full max-w-lg max-h-[88vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-5 flex items-start justify-between border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    {currentQuestion ? (
                      <Edit3 size={16} className="text-indigo-600" strokeWidth={2.5} />
                    ) : (
                      <Plus size={16} className="text-indigo-600" strokeWidth={2.5} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1.5">
                      {currentQuestion ? 'Modifier la question' : 'Question personnalisée'}
                    </h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      Visible uniquement pour cette patiente
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-100 hover:bg-slate-50 text-slate-500 transition-colors shrink-0"
                >
                  <X size={15} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                    Type de réponse
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'unique', label: 'Choix unique', icon: Circle, color: 'sky' },
                      { id: 'multiple', label: 'Choix multiple', icon: CheckSquare, color: 'indigo' },
                    ].map(opt => {
                      const Icon = opt.icon;
                      const active = formType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setFormType(opt.id)}
                          className={`flex items-center justify-center gap-2 py-3 rounded-lg border-[1.5px] transition-all text-[10px] font-black uppercase tracking-widest ${
                            active
                              ? opt.color === 'sky'
                                ? 'bg-sky-50 border-sky-300 text-sky-700'
                                : 'bg-indigo-50 border-indigo-300 text-indigo-700'
                              : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <Icon size={13} strokeWidth={2.5} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                    Énoncé de la question
                  </label>
                  <textarea
                    value={formText}
                    onChange={e => setFormText(e.target.value)}
                    placeholder="Ex : Avez-vous noté des symptômes inhabituels ?"
                    rows={3}
                    className={`${inputClass} resize-none leading-relaxed`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Réponses proposées
                    </label>
                    <button
                      onClick={handleAddOption}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-200 hover:border-indigo-200 transition-colors"
                    >
                      <Plus size={10} strokeWidth={3} /> Ajouter
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <AnimatePresence>
                      {formOptions.map((opt, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8, height: 0 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-7 h-7 shrink-0 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg text-slate-400">
                            {formType === 'multiple'
                              ? <CheckSquare size={12} strokeWidth={2} />
                              : <Circle size={12} strokeWidth={2} />}
                          </div>
                          <input
                            type="text"
                            value={opt}
                            onChange={e => {
                              const n = [...formOptions];
                              n[i] = e.target.value;
                              setFormOptions(n);
                            }}
                            placeholder={`Réponse ${i + 1}`}
                            className={inputClass}
                          />
                          <button
                            onClick={() => handleRemoveOption(i)}
                            disabled={formOptions.length <= 1}
                            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-rose-100"
                          >
                            <Trash2 size={12} strokeWidth={2.5} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] uppercase font-black tracking-widest rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveQuestion}
                  disabled={!formText.trim()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-[10px] uppercase font-black tracking-widest rounded-lg transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {currentQuestion ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ DELETE MODAL ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
              style={{ borderLeft: '4px solid #f43f5e' }}
            >
              <div className="px-6 py-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} className="text-rose-600" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 pt-1">
                    <h3 className="text-base font-black text-slate-900 tracking-tight mb-1.5">
                      Confirmer la suppression
                    </h3>
                    <p className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">
                      Action irréversible
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 mb-5">
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Cette question sera supprimée <strong className="text-rose-600 font-black">uniquement pour cette patiente</strong>. Les réponses associées seront également perdues.
                  </p>
                </div>

                {questionToDelete && (
                  <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Question concernée
                    </p>
                    <p className="text-[12px] font-bold text-slate-800 line-clamp-2">
                      {questionToDelete.text}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] uppercase font-black tracking-widest rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] uppercase font-black tracking-widest rounded-lg transition-all shadow-md inline-flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={12} strokeWidth={2.5} /> Supprimer                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL ATTRIBUTION ────────────────────────────────────────── */}
      <AttributionModal
        isOpen={isAttributionOpen}
        onClose={() => setIsAttributionOpen(false)}
        patientId={patientId}
        medecinId={user?.id}
      />
    </div>
  );
};

export default PatientQuestionnairePage;