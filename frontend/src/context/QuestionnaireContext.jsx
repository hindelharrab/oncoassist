import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';// adapte le chemin si besoin

const QuestionnaireContext = createContext();

// ─── Mapper backend → frontend ───────────────────────────────────────────────
// Le backend renvoie : { id, texte, choix: [], ordre, globale }
// Le front attend   : { id, text, options: [], ordre, isGlobal, type }
//
// NOTE : le champ "type" (unique/multiple) n'existe pas encore en base.
// On le stocke uniquement dans le state local pour l'affichage.
// Si tu l'ajoutes côté backend plus tard, il suffit de mapper q.type ici.
const toFront = (q, type = 'unique') => ({
  id:       q.id,
  text:     q.texte,
  options:  q.choix  ?? [],
  ordre:    q.ordre  ?? 0,
  isGlobal: q.globale,
  type,           // géré localement en attendant le backend
});

// ─── Mapper frontend → backend ────────────────────────────────────────────────
// Le back attend : { texte, choix: [], ordre }
const toBack = (q) => ({
  texte: q.text,
  choix: q.options ?? [],
  ordre: q.ordre  ?? 0,
});

// ─────────────────────────────────────────────────────────────────────────────

export const QuestionnaireProvider = ({ children }) => {

  const [globalQuestions, setGlobalQuestions]   = useState([]);
  // questions custom par patient : { [patientId]: [...] }
  const [patientQuestions, setPatientQuestions] = useState({});
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState(null);

  // ── Chargement initial des questions globales ──────────────────────────────
  useEffect(() => {
    fetchGlobales();
  }, []);

  const fetchGlobales = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/questionnaire/globales');
      setGlobalQuestions(data.map(q => toFront(q)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Questions globales ─────────────────────────────────────────────────────

  const addGlobalQuestion = async (newQuestion) => {
    try {
      const { data } = await axiosInstance.post(
        '/questionnaire/globale',
        toBack(newQuestion)
      );
      setGlobalQuestions(prev => [
        ...prev,
        toFront(data, newQuestion.type),
      ]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // updateGlobalQuestion : pas d'endpoint PUT dans ton controller actuel.
  // On met à jour uniquement le state local (cohérent avec l'ancien comportement).
  // Si tu ajoutes PUT /api/questionnaire/{id} plus tard, il suffit de décommenter le bloc.
  const updateGlobalQuestion = async (id, updatedFields) => {
    /* --- décommenter quand l'endpoint existe ---
    try {
      await axiosInstance.put(`/questionnaire/${id}`, toBack(updatedFields));
    } catch (err) {
      setError(err.message);
      throw err;
    }
    */
    setGlobalQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, ...updatedFields } : q)
    );
  };

  const deleteGlobalQuestion = async (id) => {
    try {
      await axiosInstance.delete(`/questionnaire/${id}`);
      setGlobalQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ── Questions custom par patient ───────────────────────────────────────────

  // Récupère depuis le back les questions globales + custom d'un patient,
  // puis les sépare dans le state local.
  const loadQuestionsForPatient = useCallback(async (patientId) => {
    try {
      const { data } = await axiosInstance.get(
        `/questionnaire/patient/${patientId}`
      );
      // Le back renvoie globales + custom triées par ordre
      // On n'écrase que les custom (les globales viennent déjà de globalQuestions)
      const custom = data
        .filter(q => !q.globale)
        .map(q => toFront(q));

      setPatientQuestions(prev => ({
        ...prev,
        [patientId]: custom,
      }));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Retourne globales + custom (synchrone, comme avant)
  // Appelle loadQuestionsForPatient() séparément si les custom ne sont pas encore chargées.
  const getQuestionsForPatient = (patientId) => {
    return [
      ...globalQuestions,
      ...(patientQuestions[patientId] ?? []),
    ];
  };

  const addPatientQuestion = async (patientId, newQuestion) => {
    try {
      const { data } = await axiosInstance.post(
        `/questionnaire/patient/${patientId}/ajouter`,
        toBack(newQuestion)
      );
      const mapped = toFront(data, newQuestion.type);
      setPatientQuestions(prev => ({
        ...prev,
        [patientId]: [...(prev[patientId] ?? []), mapped],
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deletePatientQuestion = async (patientId, questionId) => {
    try {
      await axiosInstance.delete(`/questionnaire/${questionId}`);
      setPatientQuestions(prev => ({
        ...prev,
        [patientId]: (prev[patientId] ?? []).filter(q => q.id !== questionId),
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // updatePatientQuestion : même remarque que updateGlobalQuestion (pas de PUT côté back)
  const updatePatientQuestion = async (patientId, questionId, updatedFields) => {
    /* --- décommenter quand l'endpoint existe ---
    try {
      await axiosInstance.put(`/questionnaire/${questionId}`, toBack(updatedFields));
    } catch (err) {
      setError(err.message);
      throw err;
    }
    */
    setPatientQuestions(prev => ({
      ...prev,
      [patientId]: (prev[patientId] ?? []).map(q =>
        q.id === questionId ? { ...q, ...updatedFields } : q
      ),
    }));
  };

  // ── Attribution questionnaire ──────────────────────────────────────────────
  // dto = { patientId, medecinId, frequence, dateFin }
  const attribuerQuestionnaire = async (dto) => {
    try {
      await axiosInstance.post('/questionnaire/attribuer', dto);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <QuestionnaireContext.Provider value={{
      // état
      globalQuestions,
      patientQuestions,
      loading,
      error,
      // questions globales
      addGlobalQuestion,
      updateGlobalQuestion,
      deleteGlobalQuestion,
      // questions patient
      getQuestionsForPatient,
      loadQuestionsForPatient,   // ← appelle ça dans useEffect de PatientQuestionnairePage
      addPatientQuestion,
      deletePatientQuestion,
      updatePatientQuestion,
      // attribution
      attribuerQuestionnaire,
    }}>
      {children}
    </QuestionnaireContext.Provider>
  );
};

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error('useQuestionnaire must be used within a QuestionnaireProvider');
  }
  return context;
};
