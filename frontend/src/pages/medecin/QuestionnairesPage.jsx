import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Globe, Edit3, Trash2, X, ClipboardList,
  CheckCircle2, AlertTriangle, ChevronRight, MoreVertical,
  MinusCircle, HelpCircle  // ← ajouter ici
} from 'lucide-react';

import { useQuestionnaire } from '../../context/QuestionnaireContext';

const QuestionnairesPage = () => {
  const { globalQuestions, addGlobalQuestion, deleteGlobalQuestion, updateGlobalQuestion } = useQuestionnaire();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Form state
  const [formText, setFormText] = useState('');
  const [formType, setFormType] = useState('unique');
  const [formOptions, setFormOptions] = useState(['', '']);

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

  const handleAddOption = () => setFormOptions([...formOptions, '']);
  const handleRemoveOption = (index) => {
    if (formOptions.length > 1) {
      setFormOptions(formOptions.filter((_, i) => i !== index));
    }
  };

  const handleSaveQuestion = () => {
    if (!formText.trim()) return;
    const filteredOptions = formOptions.filter(o => o.trim() !== '');
    
    if (currentQuestion) {
      updateGlobalQuestion(currentQuestion.id, { text: formText, type: formType, options: filteredOptions });
    } else {
      addGlobalQuestion({ text: formText, type: formType, options: filteredOptions });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (q) => {
    setQuestionToDelete(q);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col font-inter bg-white dark:bg-gray-950 p-2 lg:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full overflow-hidden">
        
        {/* Header Professional */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Questionnaires Globaux</h1>
              <p className="text-gray-400 dark:text-gray-500 text-[11px] font-medium mt-0.5 uppercase tracking-widest">Questions de base attribuées à tous vos patients</p>
            </div>
          </div>
          
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} /> Nouvelle question
          </button>
        </div>

        {/* Stats bar */}
        <div className="px-8 py-3 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              📊 {globalQuestions.length} questions actives
            </span>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {globalQuestions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-white transition-all shadow-sm flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em]">Question {idx + 1}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest transition-opacity group-hover:opacity-0 ${q.type === 'multiple' ? 'bg-indigo-50 text-indigo-500' : 'bg-sky-50 text-sky-500'}`}>
                        {q.type === 'multiple' ? 'MULTIPLE' : 'UNIQUE'}
                      </span>
                    </div>
                    <div className="absolute top-0 right-0 p-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(q)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(q)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded text-gray-400 hover:text-rose-600 transition-all shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                    {q.text}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {q.options.map((opt, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-[10px] font-medium text-gray-500 rounded-md border border-gray-100 dark:border-gray-700">
                        {q.type === 'multiple' ? '□' : '○'} {opt}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {globalQuestions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center opacity-30">
              <HelpCircle size={64} className="mb-4 text-gray-200" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Aucune question globale configurée</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-8 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/20 text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center">
          Système de Questionnaire Unifié — Tout changement affecte l'ensemble des dossiers patients
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="shrink-0 px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    {currentQuestion ? 'Modifier la question' : 'Créer une question globale'}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Cette question sera visible pour tous les patients</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Type de Réponse</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setFormType('unique')}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${formType === 'unique' ? 'bg-black text-white border-black' : 'bg-gray-50 border-transparent text-gray-400'}`}
                      >
                        Choix Unique
                      </button>
                      <button 
                        onClick={() => setFormType('multiple')}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${formType === 'multiple' ? 'bg-black text-white border-black' : 'bg-gray-50 border-transparent text-gray-400'}`}
                      >
                        Choix Multiple
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Texte de la question</label>
                  <textarea 
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Saisissez votre question..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-lg text-sm font-medium focus:bg-white focus:border-gray-200 dark:focus:border-white transition-all outline-none resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Choix de réponses</label>
                    <button onClick={handleAddOption} className="text-[10px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                      <Plus size={12} /> Ajouter un choix
                    </button>
                  </div>
                  
                    <div className="space-y-3">
                      {formOptions.map((opt, i) => (
                        <div key={i} className="relative group">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-[10px]">
                              {formType === 'multiple' ? '□' : '○'}
                            </span>
                            <input 
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...formOptions];
                                newOpts[i] = e.target.value;
                                setFormOptions(newOpts);
                              }}
                              placeholder={`Choix ${i + 1}`}
                              className="w-full pl-8 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-lg text-xs font-semibold focus:bg-white focus:border-gray-200 transition-all outline-none"
                            />
                            <button 
                              onClick={() => handleRemoveOption(i)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
              
                <div className="shrink-0 px-8 py-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 flex items-center justify-end gap-4">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900">Annuler</button>
                <button 
                  onClick={handleSaveQuestion}
                  className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  {currentQuestion ? 'Mettre à jour' : 'Créer la question'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">Supprimer cette question ?</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-8">
                Cette question sera supprimée pour <span className="font-bold text-gray-900 dark:text-white">TOUS</span> les patients et ne pourra pas être récupérée.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    deleteGlobalQuestion(questionToDelete.id);
                    setIsDeleteModalOpen(false);
                  }}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-600/20"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionnairesPage;
