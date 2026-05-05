import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Globe, 
  Trash2, 
  Edit3,
  X, 
  AlertTriangle,
  ClipboardList,
  User,
  ShieldCheck,
  Lock,
  MessageCircle,
  FileSearch
} from 'lucide-react';
import { useQuestionnaire } from '../../context/QuestionnaireContext';

const PatientQuestionnairePage = () => {
  const { id: patientId } = useParams();
  
  const {
  loadQuestionsForPatient,
  getQuestionsForPatient,
  addPatientQuestion,
  deletePatientQuestion,
  updatePatientQuestion
} = useQuestionnaire();

useEffect(() => {
  if (patientId) {
    loadQuestionsForPatient(patientId);
  }
}, [patientId]);
  
  const allQuestions = getQuestionsForPatient(patientId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
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
      updatePatientQuestion(patientId, currentQuestion.id, { text: formText, type: formType, options: filteredOptions });
    } else {
      addPatientQuestion(patientId, { text: formText, type: formType, options: filteredOptions });
    }
    
    setIsModalOpen(false);
    setFormText('');
    setFormType('unique');
    setFormOptions(['', '']);
  };

  return (
    <div className="h-full flex flex-col font-inter bg-white dark:bg-gray-950 p-2 lg:p-4 overflow-hidden">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full overflow-hidden">
        
        {/* Header Clinical */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                Questionnaires Patient
              </h1>
              <p className="text-gray-400 dark:text-gray-500 text-[11px] font-medium mt-0.5 uppercase tracking-widest">Configuration personnalisée du suivi</p>
            </div>
          </div>
          
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            <Plus size={16} /> Question personnalisée
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/20 dark:bg-gray-950/20">
          
          {/* Section 1: Global Questions (Read Only here) */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 py-1.5 border border-gray-100 dark:border-gray-800 rounded-full flex items-center gap-2">
                <ShieldCheck size={12} className="text-sky-500" /> Questions de Base (Globales)
              </span>
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allQuestions.filter(q => q.isGlobal).map((q, idx) => (
                <div key={q.id} className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-sky-500/20"></div>
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

          {/* Section 2: Personalized Questions */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 py-1.5 border border-gray-100 dark:border-gray-800 rounded-full flex items-center gap-2">
                <User size={12} className="text-sky-500" /> Questions Personnalisées
              </span>
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
            </div>
            
            {allQuestions.filter(q => !q.isGlobal).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {allQuestions.filter(q => !q.isGlobal).map((q, idx) => (
                    <motion.div 
                      key={q.id} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-sky-500/20"></div>
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
        
        {/* Modal for Personal Question */}
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
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 20 }}
                className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="shrink-0 p-8 border-b border-gray-100 dark:border-gray-800">
                 
                  <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    {currentQuestion ? 'Modifier la question' : 'Question Spécifique'}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Cette question ne sera visible QUE pour cette patiente.</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Type de Réponse</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setFormType('unique')}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${formType === 'unique' ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-gray-50 border-transparent text-gray-400'}`}
                      >
                        Choix Unique
                      </button>
                      <button 
                        onClick={() => setFormType('multiple')}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${formType === 'multiple' ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-gray-50 border-transparent text-gray-400'}`}
                      >
                        Choix Multiple
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Libellé clinique</label>
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Choix possibles</label>
                        <button onClick={handleAddOption} className="text-[9px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-1">
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
                  <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900">Annuler</button>
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

      </div>
    </div>
  );
};

export default PatientQuestionnairePage;
