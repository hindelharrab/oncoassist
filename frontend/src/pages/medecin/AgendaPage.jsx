import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from '../../context/SettingsContext';
import rendezVousService from '../../services/rendezVousService';
import patientService from '../../services/patientService';
import { useAuth } from '../../context/AuthContext'; // ← adapter le chemin

import {
  ChevronLeft, ChevronRight, Plus, Clock,
  MapPin, Loader2, AlertCircle, X, User, FileText, Search
} from 'lucide-react';

// ── Constantes ─────────────────────────────────────────────────────────────
const STATUT_STYLE = {
  EN_ATTENTE: 'bg-amber-50 text-amber-600',
  PLANIFIE:   'bg-sky-50 text-sky-600',
  EFFECTUE:   'bg-green-50 text-green-600',
  ANNULE:     'bg-red-50 text-red-500',
};

const STATUT_LABEL = {
  EN_ATTENTE: 'En attente',
  PLANIFIE:   'Planifié',
  EFFECTUE:   'Effectué',
  ANNULE:     'Annulé',
};

const APT_COLORS = [
  'bg-rose-100/60 text-rose-800 border-rose-200/50',
  'bg-indigo-100/60 text-indigo-800 border-indigo-200/50',
  'bg-amber-100/60 text-amber-800 border-amber-200/50',
  'bg-sky-100/60 text-sky-800 border-sky-200/50',
  'bg-purple-100/60 text-purple-800 border-purple-200/50',
];

const formatHeure = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });
};

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDayOf  = (y, m) => new Date(y, m, 1).getDay();

// ══════════════════════════════════════════════════════════════════════════
// MODAL — Nouveau RDV
// ══════════════════════════════════════════════════════════════════════════
const NouveauRdvModal = ({ isOpen, onClose, medecinId, onSuccess }) => {
  const [patients,        setPatients]        = useState([]);
  const [search,          setSearch]          = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [motif,           setMotif]           = useState('');
  const [loading,         setLoading]         = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [error,           setError]           = useState(null);

  // Chargement patients à l'ouverture
  useEffect(() => {
    if (!isOpen) return;
    const fetch = async () => {
      setLoadingPatients(true);
      try {
        const data = await patientService.getAll();
        setPatients(data);
      } catch {
        setError('Impossible de charger les patients');
      } finally {
        setLoadingPatients(false);
      }
    };
    fetch();
  }, [isOpen]);

  const handleClose = () => {
    setSearch('');
    setSelectedPatient(null);
    setMotif('');
    setError(null);
    onClose();
  };

  const filteredPatients = patients.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedPatient || !motif.trim()) {
      setError('Veuillez sélectionner un patient et saisir un motif.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newRdv = await rendezVousService.demander({
        medecinId,
        patientId: selectedPatient.id,
        motif: motif.trim(),
      });
      onSuccess(newRdv);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.96, y: 10  }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col overflow-hidden">

              {/* Header modal */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 dark:border-gray-800">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                    Nouveau Rendez-vous
                  </h2>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                    Demande de consultation
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Corps modal */}
              <div className="px-6 py-5 flex flex-col gap-5">

                {/* Erreur */}
                {error && (
                  <div className="text-[10px] text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2 font-medium">
                    {error}
                  </div>
                )}

                {/* Sélection patient */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <User size={10} /> Patient
                  </label>

                  {/* Champ recherche */}
                  <div className="relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                    <input
                      type="text"
                      placeholder="Rechercher un patient..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setSelectedPatient(null); }}
                      className="w-full pl-8 pr-3 py-2.5 text-[11px] font-medium bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-gray-700 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 outline-none focus:border-gray-300 dark:focus:border-gray-500 transition-all"
                    />
                  </div>

                  {/* Patient sélectionné */}
                  {selectedPatient && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between px-3 py-2 bg-black dark:bg-white rounded-lg"
                    >
                      <span className="text-[11px] font-bold text-white dark:text-black">
                        {selectedPatient.nom} {selectedPatient.prenom}
                      </span>
                      <button
                        onClick={() => { setSelectedPatient(null); setSearch(''); }}
                        className="text-white/60 dark:text-black/40 hover:text-white dark:hover:text-black transition-all"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  )}

                  {/* Liste déroulante */}
                  {!selectedPatient && search.length > 0 && (
                    <div className="max-h-[160px] overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 custom-scrollbar">
                      {loadingPatients ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 size={14} className="animate-spin text-gray-300" />
                        </div>
                      ) : filteredPatients.length === 0 ? (
                        <div className="py-4 text-center text-[10px] text-gray-300 dark:text-gray-600 font-medium">
                          Aucun patient trouvé
                        </div>
                      ) : (
                        filteredPatients.map(p => (
                          <button
                            key={p.id}
                            onClick={() => { setSelectedPatient(p); setSearch(''); }}
                            className="w-full text-left px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                          >
                            <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200">
                              {p.nom} {p.prenom}
                            </p>
                            {p.email && (
                              <p className="text-[9px] text-gray-400 font-medium mt-0.5">{p.email}</p>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Motif */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText size={10} /> Motif de consultation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Décrivez le motif de la consultation..."
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-full px-3 py-2.5 text-[11px] font-medium bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-gray-700 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 outline-none focus:border-gray-300 dark:focus:border-gray-500 transition-all resize-none custom-scrollbar"
                  />
                </div>

                {/* Badge info statut */}
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-lg">
                  <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-800/30 text-amber-600">
                    EN ATTENTE
                  </span>
                  <p className="text-[9px] text-amber-600 dark:text-amber-500 font-medium">
                    Le RDV sera planifié par la secrétaire
                  </p>
                </div>
              </div>

              {/* Footer modal */}
              <div className="px-6 py-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-[11px] font-bold text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedPatient || !motif.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  {loading ? 'Envoi...' : 'Demander le RDV'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PAGE AGENDA
// ══════════════════════════════════════════════════════════════════════════
const AgendaPage = () => {
  const { user } = useAuth(); 
  const { theme } = useSettings();
  const today = new Date();

  // ── State ────────────────────────────────────────────────────────────────
  const [currentDate,  setCurrentDate]  = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [rdvList,      setRdvList]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [showModal,    setShowModal]    = useState(false); // ← modal

  // ── Chargement ───────────────────────────────────────────────────────────
  // ── Chargement ───────────────────────────────────────────────────────────
const fetchRdv = useCallback(async () => {
  if (!user?.id) return; // ← sécurité : attendre que user soit chargé
  setLoading(true);
  setError(null);
  try {
    const data = await rendezVousService.getByMedecin(user.id); // ← getAll() remplacé
    setRdvList(data);
  } catch (err) {
    setError(err.response?.data?.message || 'Erreur lors du chargement');
  } finally {
    setLoading(false);
  }
}, [user?.id]); // ← dépendance sur user?.id

useEffect(() => { fetchRdv(); }, [fetchRdv]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleMarquerEffectue = async (id) => {
    try {
      const updated = await rendezVousService.marquerEffectue(id);
      setRdvList(prev => prev.map(r => r.id === id ? updated : r));
    } catch {
      setError('Impossible de marquer comme effectué');
    }
  };

  const handleAnnuler = async (id) => {
    try {
      const updated = await rendezVousService.annuler(id);
      setRdvList(prev => prev.map(r => r.id === id ? updated : r));
    } catch {
      setError("Impossible d'annuler ce rendez-vous");
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getRdvParJour = useCallback((date) => {
    return rdvList.filter(rdv => {
      if (!rdv.date) return false;
      const d = new Date(rdv.date);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth()    === date.getMonth()    &&
        d.getDate()     === date.getDate()
      );
    });
  }, [rdvList]);

  const calendarDays = useMemo(() => {
    const days = [];
    const total     = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const offset    = firstDayOf(currentDate.getFullYear(), currentDate.getMonth());
    const prevTotal = daysInMonth(currentDate.getFullYear(), currentDate.getMonth() - 1);

    for (let i = offset - 1; i >= 0; i--)
      days.push({ currentMonth: false, date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevTotal - i) });
    for (let i = 1; i <= total; i++)
      days.push({ currentMonth: true,  date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i) });
    for (let i = 1; i <= 42 - days.length; i++)
      days.push({ currentMonth: false, date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i) });

    return days;
  }, [currentDate]);

  const isToday    = (d) => d.toDateString() === today.toDateString();
  const isSelected = (d) => d.toDateString() === selectedDate.toDateString();

  const currentAppointments = getRdvParJour(selectedDate);
  const hours    = Array.from({ length: 12 }, (_, i) => i + 8);
  const monthName = currentDate.toLocaleString('fr-FR', { month: 'long' });
  const year      = currentDate.getFullYear();

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col lg:flex-row gap-2 p-1 overflow-hidden font-inter bg-white dark:bg-gray-950">

      {/* ── CALENDRIER ──────────────────────────────────────────────────── */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-50 dark:border-gray-800 shadow-sm flex flex-col h-full transition-all">

        {/* Header */}
        <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Agenda</h1>
            <p className="text-gray-400 dark:text-gray-500 text-[11px] font-medium mt-0.5">
              Planification et gestion des consultations
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}
            {error && (
              <span className="text-[10px] text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
              </span>
            )}
            <button
              onClick={fetchRdv}
              className="p-2 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-black dark:hover:text-white transition-all text-[10px] font-bold"
            >
              ↺ Actualiser
            </button>

            {/* ← Bouton ouvre la modal */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-bold text-[11px] hover:opacity-80 transition-all shadow-sm"
            >
              <Plus size={14} strokeWidth={3} />
              Nouveau RDV
            </button>
          </div>
        </div>

        {/* Navigation mois */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-1.5 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-black dark:hover:text-white transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-1.5 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-black dark:hover:text-white transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight capitalize">
              {monthName} {year}
            </h2>
          </div>
          <button
            onClick={() => {
              setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
              setSelectedDate(today);
            }}
            className="px-4 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-white font-bold text-[11px] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Grille calendrier */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
          <div className="grid grid-cols-7 border-t border-l border-gray-100 dark:border-gray-800">
            {['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'].map(day => (
              <div key={day} className="py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center border-r border-gray-100 dark:border-gray-800 bg-gray-50/10">
                {day}
              </div>
            ))}

            {calendarDays.map((item, index) => {
              const apts = item.currentMonth ? getRdvParJour(item.date) : [];
              return (
                <motion.div
                  key={index}
                  whileHover={{
                    backgroundColor: item.currentMonth
                      ? (theme === 'sombre' ? '#111827' : '#fcfcfc')
                      : (theme === 'sombre' ? '#1f2937' : '#ffffff'),
                  }}
                  onClick={() => setSelectedDate(item.date)}
                  className={`min-h-[110px] p-2 border-r border-b border-gray-100 dark:border-gray-800 transition-all cursor-pointer relative ${
                    !item.currentMonth ? 'bg-gray-50/10 dark:bg-gray-900/10 opacity-30' : 'bg-white dark:bg-gray-900'
                  } ${isSelected(item.date) ? 'ring-2 ring-inset ring-black dark:ring-white z-10' : ''}`}
                >
                  <div className="flex items-center justify-between pointer-events-none">
                    <span className={`text-[11px] font-bold ${
                      isToday(item.date)
                        ? 'text-white bg-black dark:bg-white dark:text-black w-5 h-5 flex items-center justify-center rounded-full'
                        : isSelected(item.date)
                          ? 'text-gray-900 dark:text-white font-black'
                          : 'text-gray-400 font-medium'
                    }`}>
                      {item.date.getDate()}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    {apts.slice(0, 3).map((apt, i) => (
                      <div key={apt.id} className={`text-[9px] px-1.5 py-0.5 rounded font-bold border truncate tracking-tighter ${APT_COLORS[i % APT_COLORS.length]}`}>
                        {apt.patientNom ?? apt.patient?.nom ?? '—'}
                      </div>
                    ))}
                    {apts.length > 3 && (
                      <div className="text-[8px] text-gray-400 font-bold pl-1 italic">
                        + {apts.length - 3} autres
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PANEL DROIT ─────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[320px] flex flex-col gap-2 shrink-0 h-full">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col h-full overflow-hidden">

          <div className="flex items-center justify-between mb-6 shrink-0 pb-4 border-b border-gray-50 dark:border-gray-800">
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold text-sm tracking-tight uppercase">
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-[10px] font-medium mt-0.5">
                {currentAppointments.length} RDV prévus
              </p>
            </div>
            {isToday(selectedDate) && (
              <span className="bg-black dark:bg-white text-white dark:text-black text-[7px] px-2 py-0.5 rounded font-bold">
                AUJOURD'HUI
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="relative pl-8 border-l border-gray-100 dark:border-gray-800 ml-8 py-2">
              {hours.map((hour) => {
                const hourApts = currentAppointments.filter(apt => {
                  if (!apt.date) return false;
                  return new Date(apt.date).getHours() === hour;
                });

                return (
                  <div key={hour} className="relative mb-4 last:mb-0">
                    <div className="absolute -left-[54px] top-0 text-[10px] font-bold text-gray-300 dark:text-gray-600 w-10 text-right pr-2">
                      {String(hour).padStart(2, '0')}:00
                    </div>
                    <div className="absolute -left-[35px] top-1.5 w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 z-10" />

                    <div className="space-y-1.5">
                      {hourApts.map((apt) => (
                        <motion.div
                          key={apt.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10 hover:bg-gray-50 transition-all shadow-sm"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase">
                                {apt.patientNom ?? `${apt.patient?.nom ?? ''} ${apt.patient?.prenom ?? ''}`}
                              </h4>
                              <span className={`text-[6px] font-black uppercase px-1.5 py-0.5 rounded ${STATUT_STYLE[apt.statut]}`}>
                                {STATUT_LABEL[apt.statut]}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[9px] font-medium text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock size={9} /> {formatHeure(apt.date)}
                              </span>
                              {apt.lieu && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={9} /> {apt.lieu}
                                </span>
                              )}
                            </div>

                            <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border border-gray-50 dark:border-gray-700">
                              <p className="text-[9px] text-gray-500 font-medium italic line-clamp-1">{apt.motif}</p>
                            </div>

                            {apt.statut === 'PLANIFIE' && (
                              <div className="flex gap-1 mt-1">
                                <button
                                  onClick={() => handleMarquerEffectue(apt.id)}
                                  className="text-[8px] px-2 py-0.5 rounded bg-green-50 text-green-600 font-bold hover:bg-green-100 transition-all"
                                >
                                  ✓ Effectué
                                </button>
                                <button
                                  onClick={() => handleAnnuler(apt.id)}
                                  className="text-[8px] px-2 py-0.5 rounded bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-all"
                                >
                                  ✕ Annuler
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      {hourApts.length === 0 && <div className="h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {currentAppointments.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center grayscale opacity-10">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Aucun rendez-vous prévu
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL ────────────────────────────────────────────────────────── */}
      <NouveauRdvModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
         medecinId={user?.id}// ← remplacez par user?.medecinId depuis votre AuthContext
        onSuccess={(newRdv) => {
          setRdvList(prev => [...prev, newRdv]);
        }}
      />

    </div>
  );
};

export default AgendaPage;