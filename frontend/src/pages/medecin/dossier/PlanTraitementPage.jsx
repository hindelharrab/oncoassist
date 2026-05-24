import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../services/axiosInstance';
import {
  getPlansTraitement,
  creerPlanTraitement,
  modifierPlanTraitement,
  supprimerPlanTraitement
} from '../../../services/planTraitementService';
import {
  Calendar, User, ChevronRight, Plus, FileText,
  Stethoscope, Activity, CheckCircle2, Edit2,
  Printer, Eye, EyeOff, Send, AlertCircle, Zap,
  ArrowRight, X, Loader2, Layers, Microscope
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────
const etapesList = [
  { id: 'Examen manuel', label: 'Examen manuel', icon: <Stethoscope size={18} /> },
  { id: 'Mammographie',  label: 'Mammographie',  icon: <Zap size={18} /> },
  { id: 'Échographie',   label: 'Échographie',   icon: <Activity size={18} /> },
  { id: 'IRM',           label: 'IRM',           icon: <Layers size={18} /> },
  { id: 'Analyse tissulaire',       label: 'Analyse tissulaire',       icon: <Microscope size={18} /> },
];

const formatDate = (dateStr) => {
  if (!dateStr) return 'En attente';
  try { return new Date(dateStr).toLocaleDateString('fr-FR'); } catch { return dateStr; }
};

const sortTimeline = (data) => {
  const faits  = [...data.filter(t => t.statut === 'fait')].sort((a, b) =>
    new Date(b.dateConsultation) - new Date(a.dateConsultation)
  );
  const aVenir = data.filter(t => t.statut !== 'fait');
  return [...faits, ...aVenir];
};

// ─────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────
const PlanTraitementPage = () => {
  const { id: patientId } = useParams();
  const { user } = useAuth();

  // ── State ─────────────────────────────────────────────────
  const [dossierId, setDossierId]     = useState(null);
  const [timeline, setTimeline]       = useState([]);
  const [medecins, setMedecins]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [sendingRdv, setSendingRdv]   = useState(false); // spinner bouton RDV
  const [rdvEnvoye, setRdvEnvoye]     = useState(false); // confirmation visuelle RDV
  const [error, setError]             = useState(null);

  const [activeStep, setActiveStep]   = useState(null);
  const [formMode, setFormMode]       = useState('new');
  const [currentView, setCurrentView] = useState('form');

  const [formData, setFormData] = useState({
    dateConsultation:         new Date().toISOString().split('T')[0],
    medecinId:                '',
    auteurLabel:              '',
    etape:                    'Examen manuel',
    // → stockée dans table documents (ORDONNANCE)
    ordonnance:               '',
    ordonnanceVisiblePatient: true,
    // → stockée dans plans_traitement
    status:                   'fait',
    visiblePatient:           true,
    prochaineEtape:           '',
    // → motifRDV sera envoyé séparément via POST /api/rendez-vous/demander
    motifRDV:                 '',
  });

  // ── Charger données initiales ──────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: patient } = await axiosInstance.get(`/patients/${patientId}`);
        const dId = patient.dossierMedicalId;
        setDossierId(dId);

        // Médecins affectés au patient via PriseEnCharge
        const { data: prises } = await axiosInstance.get(`/prises-en-charge/patient/${patientId}`);
        const medecinsList = prises
          .map(p => ({ id: p.medecinId, label: `Dr. ${p.medecinPrenom} ${p.medecinNom}` }))
          .filter(m => m.id);
        setMedecins(medecinsList);

        const defaultMedecin = medecinsList.find(m => m.id === user.id) || medecinsList[0];
        if (defaultMedecin) {
          setFormData(prev => ({
            ...prev,
            medecinId:   defaultMedecin.id,
            auteurLabel: defaultMedecin.label
          }));
        }

        if (dId) {
          const data = await getPlansTraitement(dId);
          setTimeline(sortTimeline(data));
        }
      } catch (err) {
        setError("Impossible de charger le plan de traitement.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  // ── Sélectionner la prochaine étape ──────────────────────
  const handleNextStepSelect = (stepId) => {
    setRdvEnvoye(false); // reset confirmation RDV si on change d'étape
    setFormData(prev => ({
      ...prev,
      prochaineEtape: stepId,
      motifRDV: `Demande de prise en charge pour ${stepId.toLowerCase()}. Merci de planifier dès que possible.`
    }));
  };

  // ─────────────────────────────────────────────────────────
  // ✅ BOUTON "Demander RDV Secrétaire"
  // Appelle POST /api/rendez-vous/demander IMMÉDIATEMENT au clic
  // Indépendant du bouton "Enregistrer la Séance"
  // ─────────────────────────────────────────────────────────
  const handleDemanderRdv = async () => {
    if (!formData.motifRDV.trim()) {
      setError("Veuillez saisir un motif avant de demander un RDV.");
      return;
    }
    setSendingRdv(true);
    try {
      await axiosInstance.post('/rendez-vous/demander', {
        medecinId: formData.medecinId || user.id,
        patientId: patientId,
        motif:     formData.motifRDV,
      });
      setRdvEnvoye(true); // changer couleur bouton → confirmation visuelle
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la demande de RDV. Vérifiez que vous êtes connecté en tant que médecin.");
    } finally {
      setSendingRdv(false);
    }
  };

  // ── handleEdit ────────────────────────────────────────────
  const handleEdit = (item) => {
    setActiveStep(item.id);
    setFormMode('edit');
    setCurrentView('form');
    setRdvEnvoye(false);
    const defaultMedecin = medecins.find(m => m.id === item.auteurId)
      || medecins.find(m => m.id === user.id)
      || medecins[0];
    setFormData({
      dateConsultation:         item.dateConsultation || new Date().toISOString().split('T')[0],
      medecinId:                item.auteurId || defaultMedecin?.id || user.id,
      auteurLabel:              item.auteurPrenom ? `Dr. ${item.auteurPrenom} ${item.auteurNom}` : (defaultMedecin?.label || ''),
      etape:                    item.etape || 'Examen manuel',
      ordonnance:               item.ordonnanceContenu || '',
      ordonnanceVisiblePatient: item.ordonnanceVisiblePatient ?? true,
      status:                   item.statut === 'à venir' ? 'fait' : (item.statut || 'fait'),
      visiblePatient:           item.visiblePatient ?? true,
      prochaineEtape:           '',
      motifRDV:                 '',
    });
  };

  // ── handleNew ─────────────────────────────────────────────
  const handleNew = (currentTimeline = timeline) => {
    const nextPlanned = currentTimeline.find(t => t.statut === 'à venir');
    if (nextPlanned) { handleEdit(nextPlanned); return; }

    setActiveStep(null);
    setFormMode('new');
    setCurrentView('form');
    setRdvEnvoye(false);
    const defaultMedecin = medecins.find(m => m.id === user.id) || medecins[0];
    setFormData({
      dateConsultation:         new Date().toISOString().split('T')[0],
      medecinId:                defaultMedecin?.id || user.id,
      auteurLabel:              defaultMedecin?.label || '',
      etape:                    'Examen manuel',
      ordonnance:               '',
      ordonnanceVisiblePatient: true,
      status:                   'fait',
      visiblePatient:           true,
      prochaineEtape:           '',
      motifRDV:                 '',
    });
  };

  // ── handleDelete ──────────────────────────────────────────
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer cette étape du parcours ?")) return;
    try {
      await supprimerPlanTraitement(id);
      const next = timeline.filter(t => t.id !== id);
      setTimeline(next);
      if (activeStep === id) {
        const nextStep = next.find(t => t.statut === 'à venir');
        if (nextStep) handleEdit(nextStep); else handleNew(next);
      }
    } catch { setError("Impossible de supprimer cette étape."); }
  };

  // ─────────────────────────────────────────────────────────
  // ✅ "Enregistrer la Séance" — crée/modifie plans_traitement + documents
  // Ne crée PAS le RendezVous (fait par handleDemanderRdv)
  // ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!dossierId) return;
    setSaving(true);
    try {
      const payload = {
        medecinId:                formData.medecinId || user.id,
        dateConsultation:         formData.dateConsultation,
        etape:                    formData.etape,
        statut:                   formData.status,
        visiblePatient:           formData.visiblePatient,
        prochaineEtape:           formData.prochaineEtape || null,
        // → ordonnance stockée dans table documents par le service
        ordonnance:               formData.ordonnance || null,
        ordonnanceVisiblePatient: formData.ordonnanceVisiblePatient,
        // ✅ PAS de motifRdv ici — le RDV est déjà créé via handleDemanderRdv
      };

      let updated;
      if (formMode === 'new') {
        const created = await creerPlanTraitement(dossierId, payload);

        // Si prochaine étape → créer aussi la séance planifiée "à venir"
        let nextCreated = null;
        if (formData.prochaineEtape) {
          nextCreated = await creerPlanTraitement(dossierId, {
            medecinId:        formData.medecinId || user.id,
            dateConsultation: new Date().toISOString().split('T')[0],
            etape:            formData.prochaineEtape,
            statut:           'à venir',
            visiblePatient:   false,
          });
        }
        updated = sortTimeline([created, ...(nextCreated ? [nextCreated] : []), ...timeline]);

      } else {
        const modifie = await modifierPlanTraitement(activeStep, payload);

        // Si on planifie une nouvelle prochaine étape lors de la modification
        let nextCreated = null;
        if (formData.prochaineEtape) {
          nextCreated = await creerPlanTraitement(dossierId, {
            medecinId:        formData.medecinId || user.id,
            dateConsultation: new Date().toISOString().split('T')[0],
            etape:            formData.prochaineEtape,
            statut:           'à venir',
            visiblePatient:   false,
          });
        }
        updated = sortTimeline([
          ...timeline.map(t => t.id === activeStep ? modifie : t),
          ...(nextCreated ? [nextCreated] : []),
        ]);
      }

      setTimeline(updated);
      // Après enregistrement → passer à la prochaine étape "à venir" ou nouveau formulaire
      const nextToProcess = updated.find(t => t.statut === 'à venir');
      if (nextToProcess) handleEdit(nextToProcess); else handleNew(updated);

    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-pink-500" />
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // RENDER — style identique au front original
  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8">

      {error && (
        <div className="max-w-7xl mx-auto mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold flex items-center justify-between">
          {error}<button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ── Colonne GAUCHE : Timeline ── */}
        <div className="xl:col-span-4 space-y-6">
          <div className="flex items-center justify-between pl-8 pr-2">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Parcours Patient</h2>
            <button onClick={() => handleNew()}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <Plus size={18} />
            </button>
          </div>

          <div className="relative pl-8 space-y-6">
            <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-gradient-to-b from-pink-500 via-rose-500 to-slate-200 dark:to-slate-800 rounded-full" />

            {timeline.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                Aucune séance enregistrée
              </div>
            )}

            {timeline.map((item, index) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-5 rounded-3xl border transition-all ${
                  activeStep === item.id
                  ? 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-900/40 shadow-lg shadow-pink-500/5'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                }`}
              >
                <div className={`absolute -left-[27px] top-6 w-4 h-4 rounded-full border-4 ${
                  item.statut === 'fait'
                  ? 'bg-pink-500 border-white dark:border-slate-950 shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-700 border-white dark:border-slate-950'
                }`} />

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        item.statut === 'fait' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.statut}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.statut === 'à venir' ? 'En attente' : formatDate(item.dateConsultation)}
                      </span>
                    </div>
                    <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      {item.etape || 'Séance'}
                    </h3>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      Dr. {item.auteurPrenom} {item.auteurNom}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => handleDelete(item.id, e)}
                      className="relative z-20 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-all">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {item.ordonnanceContenu && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 italic line-clamp-2">
                      "{item.ordonnanceContenu}"
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Colonne DROITE : Formulaire ou Aperçu ── */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <AnimatePresence mode="wait">

            {/* ── FORMULAIRE ── */}
            {currentView === 'form' && (
              <motion.div key="form-view"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-white to-pink-50/20 dark:from-slate-950 dark:to-pink-950/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
                      {formMode === 'new' ? <Plus size={22} className="text-pink-500" /> : <Edit2 size={20} className="text-slate-950 dark:text-white" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight">
                        {formMode === 'new' ? 'Nouvelle Séance' : 'Modifier la Séance'}
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Planification et Bilan Médical</p>
                    </div>
                  </div>
                  {formMode === 'edit' && (
                    <button onClick={() => handleNew()}
                      className="h-8 px-4 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-sans">
                      Annuler
                    </button>
                  )}
                </div>

                <div className="p-8 space-y-10">

                  {/* Bloc 1 : Bilan */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Bilan de la séance</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">

                      {/* Date */}
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Date Consultation</label>
                        <div className="relative group">
                          <input type="date" value={formData.dateConsultation}
                            onChange={(e) => setFormData({...formData, dateConsultation: e.target.value})}
                            className="w-full h-14 pl-14 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-pink-500/20 focus:bg-white dark:focus:bg-slate-900 text-[13px] font-bold transition-all outline-none" />
                          <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                        </div>
                      </div>

                      {/* Médecin — chargé depuis PriseEnCharge */}
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Médecin Auteur</label>
                        <div className="relative group">
                          <select value={formData.medecinId}
                            onChange={(e) => {
                              const selected = medecins.find(m => m.id === e.target.value);
                              setFormData({...formData, medecinId: e.target.value, auteurLabel: selected?.label || ''});
                            }}
                            className="w-full h-14 pl-14 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-pink-500/20 focus:bg-white dark:focus:bg-slate-900 text-[13px] font-bold transition-all appearance-none outline-none">
                            {medecins.length === 0 && (
                              <option value={user.id}>Dr. {user.prenom} {user.nom}</option>
                            )}
                            {medecins.map(m => (
                              <option key={m.id} value={m.id}>{m.label}</option>
                            ))}
                          </select>
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                        </div>
                      </div>

                      {/* Étape */}
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Étape Actuelle</label>
                        <div className="relative group">
                          <select value={formData.etape}
                            onChange={(e) => setFormData({...formData, etape: e.target.value})}
                            className="w-full h-14 pl-14 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-pink-500/20 focus:bg-white dark:focus:bg-slate-900 text-[13px] font-bold transition-all appearance-none outline-none">
                            {etapesList.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                          </select>
                          <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                        </div>
                      </div>

                      {/* Statut */}
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Statut Séance</label>
                        <div className="relative group">
                          <select value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className={`w-full h-14 pl-14 pr-4 rounded-2xl border-2 border-transparent focus:ring-0 text-[13px] font-bold transition-all appearance-none outline-none ${
                              formData.status === 'fait'
                              ? 'bg-pink-50 text-pink-600 dark:bg-pink-950/20 focus:border-pink-500/20'
                              : 'bg-slate-50 text-slate-500 dark:bg-slate-900 focus:border-pink-500/20'
                            }`}>
                            <option value="fait">FAIT (Réalisé)</option>
                            <option value="à venir">À VENIR (Planifié)</option>
                          </select>
                          <CheckCircle2 className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${formData.status === 'fait' ? 'text-pink-500' : 'text-slate-400'}`} size={18} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloc 2 : Ordonnance → stockée dans table documents */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Ordonnance & Prescriptions</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <div onClick={() => setFormData({...formData, ordonnanceVisiblePatient: !formData.ordonnanceVisiblePatient})}
                          className="flex items-center gap-2 cursor-pointer group">
                          {formData.ordonnanceVisiblePatient
                            ? <Eye size={16} className="text-emerald-500" />
                            : <EyeOff size={16} className="text-slate-400" />
                          }
                          <span className={`text-[9px] font-black uppercase tracking-widest ${formData.ordonnanceVisiblePatient ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {formData.ordonnanceVisiblePatient ? 'Visible Patient' : 'Masqué Patient'}
                          </span>
                        </div>
                        <button onClick={() => setCurrentView('preview')}
                          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-sans">
                          <Printer size={14} /> Aperçu Ordonnance
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <textarea
                        placeholder="Saisissez les médicaments, examens complémentaires ou recommandations..."
                        value={formData.ordonnance}
                        onChange={(e) => setFormData({...formData, ordonnance: e.target.value})}
                        className="w-full min-h-[160px] p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-pink-500/20 focus:bg-white dark:focus:bg-slate-900 text-[13px] font-medium leading-relaxed transition-all outline-none resize-none" />
                      <div className="absolute top-6 right-6 opacity-10"><FileText size={40} /></div>
                    </div>
                  </div>

                  {/* Bloc 3 : Prochaine étape */}
                  <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Prochaine étape décidée</h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {etapesList.map((item) => (
                        <button key={item.id} onClick={() => handleNextStepSelect(item.id)}
                          className={`flex flex-col items-center justify-center gap-4 p-5 rounded-3xl border-2 transition-all group aspect-square lg:aspect-auto lg:h-32 ${
                            formData.prochaineEtape === item.id
                            ? 'bg-pink-50 border-pink-200 text-pink-600 shadow-xl shadow-pink-500/5 -translate-y-1'
                            : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-pink-200 dark:hover:border-pink-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            formData.prochaineEtape === item.id
                            ? 'bg-white dark:bg-pink-900/20 scale-110 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 group-hover:text-pink-500 text-slate-400'
                          }`}>
                            {item.icon}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-center px-1">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {formData.prochaineEtape && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden space-y-4 pt-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-pink-500 uppercase tracking-widest ml-1">
                              Motif du rendez-vous à transmettre
                            </label>
                            <div className="relative">
                              <textarea value={formData.motifRDV}
                                onChange={(e) => setFormData({...formData, motifRDV: e.target.value})}
                                className="w-full min-h-[100px] p-5 pb-16 rounded-2xl bg-pink-50/30 dark:bg-pink-900/5 border border-pink-100 dark:border-pink-900/30 text-[12px] font-medium transition-all outline-none resize-none" />

                              {/* ✅ Bouton RDV — appelle l'API IMMÉDIATEMENT au clic */}
                              <div className="absolute right-4 bottom-4">
                                <button
                                  type="button"
                                  onClick={handleDemanderRdv}
                                  disabled={sendingRdv || rdvEnvoye}
                                  className={`flex items-center gap-2 h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg disabled:cursor-not-allowed ${
                                    rdvEnvoye
                                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                    : 'bg-slate-950 text-white hover:bg-black shadow-slate-900/20'
                                  }`}>
                                  {sendingRdv
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <Send size={14} />
                                  }
                                  {rdvEnvoye ? 'RDV Demandé ✓' : 'Demander RDV Secrétaire'}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                              Cette étape s'affichera comme "En attente" dans le parcours patient jusqu'à ce que la secrétaire confirme la date du rendez-vous.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Footer */}
                  <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3 opacity-60">
                      <CheckCircle2 size={18} className="text-pink-500" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Validation Digitale Prête</span>
                    </div>
                    <button onClick={handleSave} disabled={saving}
                      className="h-14 px-10 rounded-2xl bg-slate-950 dark:bg-pink-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 font-sans disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                      {saving ? 'Enregistrement...' : (formMode === 'new' ? 'Enregistrer la Séance' : 'Mettre à jour la Séance')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── APERÇU ORDONNANCE ── */}
            {currentView === 'preview' && (
              <motion.div key="preview-view"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden min-h-[800px]">
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center text-white"><Printer size={20} /></div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Aperçu Impression</h3>
                      <p className="text-[9px] font-bold text-slate-400">Document officiel</p>
                    </div>
                  </div>
                  <button onClick={() => setCurrentView('form')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-slate-950 shadow-sm transition-all">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-12 bg-slate-100/30 flex-1 flex flex-col items-center overflow-y-auto max-h-[700px]">
                  <div className="w-full max-w-sm bg-white p-8 shadow-2xl border border-slate-200 aspect-[1/1.414] relative flex flex-col justify-between overflow-hidden shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-35deg]">
                      <span className="text-4xl font-black uppercase tracking-[0.6em] text-pink-900">ONCOASSIST</span>
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-10">
                        <h4 className="text-sm font-black tracking-tighter text-slate-900 italic">CLINIQUE DU SEIN</h4>
                        <div className="text-right">
                          <p className="text-[7px] font-black uppercase tracking-widest text-pink-500">Ordonnance</p>
                          <p className="text-[6px] font-bold text-slate-400">{formData.dateConsultation}</p>
                        </div>
                      </div>
                      <div className="space-y-3 mb-8">
                        <div className="border-b border-slate-100 pb-1">
                          <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest">Étape</p>
                          <p className="text-[10px] font-black uppercase text-slate-900">{formData.etape}</p>
                        </div>
                        <div className="border-b border-slate-100 pb-1">
                          <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest">Praticien</p>
                          <p className="text-[10px] font-black uppercase text-slate-900">{formData.auteurLabel}</p>
                        </div>
                      </div>
                      <div className="min-h-[150px] py-4 font-serif italic text-slate-800 text-[11px] leading-relaxed">
                        {formData.ordonnance || 'Aucune prescription saisie.'}
                      </div>
                    </div>
                    <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between opacity-30">
                      <span className="text-[6px] font-bold uppercase">OncoAssist V2.4</span>
                      <span className="text-[6px] font-mono">REF: OA-{formData.dateConsultation.replace(/-/g, '')}</span>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-4 w-full max-w-sm">
                    <button onClick={() => window.print()}
                      className="flex-1 h-12 rounded-2xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 font-sans">
                      <Printer size={16} /> Imprimer
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PlanTraitementPage;