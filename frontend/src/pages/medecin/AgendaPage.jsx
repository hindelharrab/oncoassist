import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from '../../context/SettingsContext';
import rendezVousService from '../../services/rendezVousService';
import patientService from '../../services/patientService';
import { useAuth } from '../../context/AuthContext';

import {
  ChevronLeft, ChevronRight, Plus, Clock,
  MapPin, Loader2, AlertCircle, X, User, FileText, Search
} from 'lucide-react';

// ── Constantes ─────────────────────────────────────────────────────────────
const STATUT_STYLE = {
  EN_ATTENTE: 'bg-amber-50 text-amber-600',
  PLANIFIE:   'bg-pink-50 text-pink-500',
  EFFECTUE:   'bg-purple-50 text-purple-500',
  ANNULE:     'bg-rose-50 text-rose-400',
};

const STATUT_LABEL = {
  EN_ATTENTE: 'En attente',
  PLANIFIE:   'Planifié',
  EFFECTUE:   'Effectué',
  ANNULE:     'Annulé',
};

const APT_COLORS = [
  { bg: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-600',   hover: 'hover:bg-pink-100'   },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
  { bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-600',   hover: 'hover:bg-rose-100'   },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', hover: 'hover:bg-violet-100' },
  { bg: 'bg-fuchsia-50',border: 'border-fuchsia-200',text: 'text-fuchsia-600',hover: 'hover:bg-fuchsia-100'},
];

const getNomPatient = (rdv) => {
  const prenom = rdv.patient?.prenom ?? rdv.patientPrenom ?? '';
  const nom    = rdv.patient?.nom    ?? rdv.patientNom    ?? '';
  return `${prenom} ${nom}`.trim() || rdv.patientNom || '—';
};

const formatHeure = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDayOf  = (y, m) => new Date(y, m, 1).getDay();
const isSameDay   = (a, b) => {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};
const getMondayOf = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

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

  useEffect(() => {
    if (!isOpen || search.length < 2) { setPatients([]); return; }
    const timeout = setTimeout(async () => {
      setLoadingPatients(true);
      try {
        const data = await patientService.searchPatients(search);
        setPatients(Array.isArray(data) ? data : []);
      } catch { setError('Impossible de charger les patients'); }
      finally { setLoadingPatients(false); }
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, isOpen]);

  const filteredPatients = patients;
  const handleClose = () => { setSearch(''); setSelectedPatient(null); setMotif(''); setError(null); onClose(); };

  const handleSubmit = async () => {
    if (!selectedPatient || !motif.trim()) { setError('Veuillez sélectionner un patient et saisir un motif.'); return; }
    setLoading(true); setError(null);
    try {
      const newRdv = await rendezVousService.demander({ medecinId, patientId: selectedPatient.id, motif: motif.trim() });
      onSuccess(newRdv); handleClose();
    } catch (err) { setError(err.response?.data?.message || 'Erreur lors de la création'); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 tracking-tight">Nouveau Rendez-vous</h2>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Demande de consultation</p>
                </div>
                <button onClick={handleClose} className="p-1.5 rounded-lg border border-slate-200 text-gray-400 hover:text-black hover:bg-slate-50 transition-all">
                  <X size={14} />
                </button>
              </div>
              <div className="px-6 py-5 flex flex-col gap-5">
                {error && <div className="text-[10px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 font-medium">{error}</div>}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><User size={10} /> Patient</label>
                  <div className="relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="text" placeholder="Rechercher un patient..." value={search}
                      onChange={(e) => { setSearch(e.target.value); setSelectedPatient(null); }}
                      className="w-full pl-8 pr-3 py-2.5 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-gray-700 placeholder-gray-300 outline-none focus:border-slate-400 transition-all" />
                  </div>
                  {selectedPatient && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between px-3 py-2 bg-black rounded-lg">
                      <span className="text-[11px] font-bold text-white">{selectedPatient.prenom} {selectedPatient.nom}</span>
                      <button onClick={() => { setSelectedPatient(null); setSearch(''); }} className="text-white/60 hover:text-white transition-all"><X size={12} /></button>
                    </motion.div>
                  )}
                  {!selectedPatient && search.length > 0 && (
                    <div className="max-h-[160px] overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
                      {loadingPatients ? (
                        <div className="flex items-center justify-center py-4"><Loader2 size={14} className="animate-spin text-gray-300" /></div>
                      ) : filteredPatients.length === 0 ? (
                        <div className="py-4 text-center text-[10px] text-gray-300 font-medium">Aucun patient trouvé</div>
                      ) : filteredPatients.map(p => (
                        <button key={p.id} onClick={() => { setSelectedPatient(p); setSearch(''); }}
                          className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-all">
                          <p className="text-[11px] font-bold text-gray-700">{p.prenom} {p.nom}</p>
                          {p.email && <p className="text-[9px] text-gray-400 font-medium mt-0.5">{p.email}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FileText size={10} /> Motif de consultation</label>
                  <textarea rows={3} placeholder="Décrivez le motif de la consultation..." value={motif} onChange={(e) => setMotif(e.target.value)}
                    className="w-full px-3 py-2.5 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-gray-700 placeholder-gray-300 outline-none focus:border-slate-400 transition-all resize-none" />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                  <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">EN ATTENTE</span>
                  <p className="text-[9px] text-amber-600 font-medium">Le RDV sera planifié par la secrétaire</p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button onClick={handleClose} className="px-4 py-2 text-[11px] font-bold text-gray-400 hover:text-gray-700 transition-all">Annuler</button>
                <button onClick={handleSubmit} disabled={loading || !selectedPatient || !motif.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-black text-white text-[11px] font-bold rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
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
// VUE SEMAINE
// ══════════════════════════════════════════════════════════════════════════
const COL_W = 130;
const ROW_H = 70;
const LEFT_W = 52;

const VueSemaine = ({ rdvList, monday, onEffectue, onAnnuler, getColorForRdv }) => {
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(d.getDate() + i); return d; });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const getSlot = (rdv) => {
    const d = new Date(rdv.date);
    const dayIdx  = days.findIndex(day => isSameDay(day, d));
    const hourIdx = hours.findIndex(h => h === d.getHours());
    return { dayIdx, hourIdx };
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div style={{ minWidth: LEFT_W + COL_W * 7 }}>
        <div className="grid border-b border-slate-200"
          style={{ gridTemplateColumns: `${LEFT_W}px repeat(7, ${COL_W}px)` }}>
          <div className="bg-slate-50" />
          {days.map((day, i) => {
            const isToday = new Date(day).setHours(0,0,0,0) === today.getTime();
            return (
              <div key={i} className="p-3 text-center border-l border-slate-200"
                style={{ background: isToday ? 'rgba(0,0,0,0.03)' : undefined }}>
                <span className="text-[8px] font-black uppercase tracking-widest block mb-0.5 text-slate-400">
                  {['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][day.getDay()]}
                </span>
                <span className={`text-sm font-black inline-flex items-center justify-center w-7 h-7 rounded-full ${
                  isToday ? 'text-white bg-black' : 'text-slate-600'
                }`}>
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="relative overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {hours.map(h => (
            <div key={h} className="grid border-b border-slate-100"
              style={{ gridTemplateColumns: `${LEFT_W}px repeat(7, ${COL_W}px)`, minHeight: ROW_H }}>
              <div className="flex items-start justify-end pr-3 pt-2 bg-slate-50/50">
                <span className="text-[9px] font-black text-slate-400">{String(h).padStart(2,'0')}:00</span>
              </div>
              {days.map((_, di) => <div key={di} className="border-l border-slate-100" />)}
            </div>
          ))}

          {rdvList.map((rdv) => {
            if (!rdv.date) return null;
            const { dayIdx, hourIdx } = getSlot(rdv);
            if (dayIdx < 0 || hourIdx < 0) return null;
            const c = getColorForRdv(rdv);
            const nomPatient = getNomPatient(rdv);
            return (
              <div key={rdv.id}
                className={`absolute rounded-lg border overflow-hidden cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group ${c.bg} ${c.border}`}
                style={{
                  top:    `${hourIdx * ROW_H + 4}px`,
                  left:   `${LEFT_W + dayIdx * COL_W + 4}px`,
                  width:  `${COL_W - 8}px`,
                  height: `${ROW_H - 8}px`,
                  zIndex: 20,
                }}>
                <div className="p-2 h-full flex flex-col">
                  <p className={`text-[10px] font-black leading-tight truncate ${c.text}`}>{nomPatient}</p>
                  <p className={`text-[9px] truncate opacity-70 flex-1 ${c.text}`}>{rdv.motif}</p>
                  <div className={`flex items-center gap-1 ${c.text} opacity-60`}>
                    <Clock size={8} />
                    <span className="text-[8px] font-bold">{formatHeure(rdv.date)}</span>
                  </div>
                  {rdv.statut === 'PLANIFIE' && (
                    <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 rounded-lg">
                      <button onClick={(e) => { e.stopPropagation(); onEffectue(rdv.id); }}
                        className="text-[8px] px-2 py-1 rounded font-black bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all">✓ Effectué</button>
                      <button onClick={(e) => { e.stopPropagation(); onAnnuler(rdv.id); }}
                        className="text-[8px] px-2 py-1 rounded font-black bg-pink-50 text-pink-500 hover:bg-pink-100 transition-all">✕ Annuler</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PAGE AGENDA
// ══════════════════════════════════════════════════════════════════════════
const AgendaPage = () => {
  const { user }  = useAuth();
  const { theme } = useSettings();
  const today     = new Date();

  const [view,         setView]         = useState('mois');
  const [currentDate,  setCurrentDate]  = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [rdvList,      setRdvList]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [showModal,    setShowModal]    = useState(false);

  const fetchRdv = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true); setError(null);
    try {
      const data = await rendezVousService.getByMedecin(user.id);
      setRdvList(data);
    } catch (err) { setError(err.response?.data?.message || 'Erreur lors du chargement'); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchRdv(); }, [fetchRdv]);

 const handleMarquerEffectue = async (id) => {
  try {
    const u = await rendezVousService.marquerEffectue(id);
    setRdvList(p => p.map(r => r.id === id ? { ...r, ...u, patient: r.patient, patientNom: r.patientNom, patientPrenom: r.patientPrenom } : r));
  } catch { setError('Impossible de marquer comme effectué'); }
};

const handleAnnuler = async (id) => {
  try {
    const u = await rendezVousService.annuler(id);
    setRdvList(p => p.map(r => r.id === id ? { ...r, ...u, patient: r.patient, patientNom: r.patientNom, patientPrenom: r.patientPrenom } : r));
  } catch { setError("Impossible d'annuler ce rendez-vous"); }
};
  const getRdvParJour = useCallback((date) => {
    return rdvList.filter(rdv => {
      if (!rdv.date) return false;
      const d = new Date(rdv.date);
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
    });
  }, [rdvList]);

  const getColorForRdv = useCallback((rdv) => {
    const idx = rdvList.findIndex(r => r.id === rdv.id);
    return APT_COLORS[idx % APT_COLORS.length];
  }, [rdvList]);

  const calendarDays = useMemo(() => {
    const days = [];
    const total     = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const offset    = firstDayOf(currentDate.getFullYear(), currentDate.getMonth());
    const prevTotal = daysInMonth(currentDate.getFullYear(), currentDate.getMonth() - 1);
    for (let i = offset - 1; i >= 0; i--)
      days.push({ currentMonth: false, date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevTotal - i) });
    for (let i = 1; i <= total; i++)
      days.push({ currentMonth: true, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i) });
    for (let i = 1; i <= 42 - days.length; i++)
      days.push({ currentMonth: false, date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i) });
    return days;
  }, [currentDate]);

  const isToday    = (d) => d.toDateString() === today.toDateString();
  const isSelected = (d) => d.toDateString() === selectedDate.toDateString();

  const currentAppointments = getRdvParJour(selectedDate);
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const navLabel = () => {
    if (view === 'semaine') {
      const monday = getMondayOf(selectedDate);
      const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
      return `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const naviguer = (dir) => {
    if (view === 'mois')    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1));
    if (view === 'semaine') { const d = new Date(selectedDate); d.setDate(d.getDate() + dir * 7); setSelectedDate(d); }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-3 p-3 overflow-hidden font-inter bg-slate-100">

      {/* ── COLONNE GAUCHE ── */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col h-full transition-all overflow-hidden">

        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Agenda</h1>
            <p className="text-slate-400 text-[11px] font-medium mt-0.5">Planification et gestion des consultations</p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <Loader2 size={16} className="animate-spin text-slate-400" />}
            {error && <span className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {error}</span>}

            {/* Toggle Semaine / Mois uniquement */}
            <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
              {[{ label: 'Semaine', val: 'semaine' }, { label: 'Mois', val: 'mois' }].map(v => (
                <button key={v.val} onClick={() => setView(v.val)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    view === v.val
                      ? 'bg-black text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}>
                  {v.label}
                </button>
              ))}
            </div>

            <button onClick={fetchRdv}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-black transition-all text-[10px] font-bold">
              ↺ Actualiser
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold text-[11px] hover:opacity-80 transition-all shadow-sm">
              <Plus size={14} strokeWidth={3} />
              Nouveau RDV
            </button>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={() => naviguer(-1)}
                className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-black transition-all">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => naviguer(1)}
                className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-black transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight capitalize">{navLabel()}</h2>
          </div>
          <button onClick={() => { setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(today); }}
            className="px-4 py-1.5 bg-white text-gray-700 font-bold text-[11px] rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-all">
            Aujourd'hui
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} className="flex-1 overflow-hidden flex flex-col">

            {/* VUE MOIS */}
            {view === 'mois' && (
              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                <div className="grid grid-cols-7 border-t border-l border-slate-200">
                  {['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'].map(day => (
                    <div key={day} className="py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center border-r border-slate-200 bg-slate-50">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((item, index) => {
                    const apts = item.currentMonth ? getRdvParJour(item.date) : [];
                    return (
                      <motion.div key={index}
                        whileHover={{ backgroundColor: item.currentMonth ? '#f8fafc' : undefined }}
                        onClick={() => setSelectedDate(item.date)}
                        className={`min-h-[110px] p-2 border-r border-b border-slate-200 transition-all cursor-pointer relative ${
                          !item.currentMonth ? 'bg-slate-50 opacity-40' : 'bg-white'
                        } ${isSelected(item.date) ? 'ring-2 ring-inset ring-black z-10' : ''}`}>
                        <div className="flex items-center justify-between pointer-events-none">
                          <span className={`text-[11px] font-bold ${
                            isToday(item.date)
                              ? 'text-white bg-black w-5 h-5 flex items-center justify-center rounded-full'
                              : isSelected(item.date) ? 'text-gray-900 font-black' : 'text-slate-400 font-medium'
                          }`}>{item.date.getDate()}</span>
                        </div>
                        <div className="mt-2 space-y-1">
                          {apts.slice(0, 3).map((apt) => {
                            const c = getColorForRdv(apt);
                            const nomPatient = getNomPatient(apt);
                            return (
                              <div key={apt.id} className={`text-[9px] px-1.5 py-0.5 rounded font-bold border truncate tracking-tighter ${c.bg} ${c.border} ${c.text}`}>
                                {nomPatient}
                              </div>
                            );
                          })}
                          {apts.length > 3 && <div className="text-[8px] text-slate-400 font-bold pl-1 italic">+ {apts.length - 3} autres</div>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VUE SEMAINE */}
            {view === 'semaine' && (
              <VueSemaine
                rdvList={rdvList}
                monday={getMondayOf(selectedDate)}
                onEffectue={handleMarquerEffectue}
                onAnnuler={handleAnnuler}
                getColorForRdv={getColorForRdv}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── PANEL DROIT ── */}
      <div className="w-full lg:w-[320px] flex flex-col gap-2 shrink-0 h-full">
        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-5 flex flex-col h-full overflow-hidden">

          <div className="flex items-center justify-between mb-4 shrink-0 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-gray-900 font-bold text-sm tracking-tight uppercase">
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <p className="text-slate-400 text-[10px] font-medium mt-0.5">
                {currentAppointments.length} RDV prévus
              </p>
            </div>
            {isToday(selectedDate) && (
              <span className="bg-black text-white text-[7px] px-2 py-0.5 rounded font-bold">AUJOURD'HUI</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="relative pl-8 border-l border-slate-200 ml-8 py-2">
              {hours.map(hour => {
                const hourApts = currentAppointments.filter(apt => apt.date && new Date(apt.date).getHours() === hour);
                return (
                  <div key={hour} className="relative mb-4 last:mb-0">
                    <div className="absolute -left-[54px] top-0 text-[10px] font-bold text-slate-400 w-10 text-right pr-2">
                      {String(hour).padStart(2,'0')}:00
                    </div>
                    <div className="absolute -left-[35px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 z-10" />
                    <div className="space-y-1.5">
                      {hourApts.map(apt => {
                        const c = getColorForRdv(apt);
                        const nomPatient = getNomPatient(apt);
                        return (
                          <motion.div key={apt.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg border transition-all shadow-sm ${c.bg} ${c.border} ${c.hover}`}>
                            <div className="flex flex-col gap-1">
                              {/* Nom + Prénom — sans badge statut */}
                              <h4 className={`text-[11px] font-black uppercase ${c.text}`}>{nomPatient}</h4>

                              <div className={`flex items-center gap-2 text-[9px] font-medium ${c.text} opacity-70`}>
                                <span className="flex items-center gap-1"><Clock size={9} /> {formatHeure(apt.date)}</span>
                                {apt.lieu && <span className="flex items-center gap-1"><MapPin size={9} /> {apt.lieu}</span>}
                              </div>
                              <div className="mt-1 p-2 bg-white/80 rounded border border-white">
                                <p className={`text-[9px] font-medium italic line-clamp-1 ${c.text} opacity-80`}>{apt.motif}</p>
                              </div>
                              {apt.statut === 'PLANIFIE' && (
                                <div className="flex gap-1 mt-1">
                                  <button onClick={() => handleMarquerEffectue(apt.id)}
                                    className="text-[8px] px-2 py-0.5 rounded bg-purple-50 text-purple-600 font-bold hover:bg-purple-100 transition-all">
                                    ✓ Effectué
                                  </button>
                                  <button onClick={() => handleAnnuler(apt.id)}
                                    className="text-[8px] px-2 py-0.5 rounded bg-pink-50 text-pink-500 font-bold hover:bg-pink-100 transition-all">
                                    ✕ Annuler
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                      {hourApts.length === 0 && <div className="h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
            {currentAppointments.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aucun rendez-vous prévu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <NouveauRdvModal isOpen={showModal} onClose={() => setShowModal(false)} medecinId={user?.id}
        onSuccess={(newRdv) => setRdvList(prev => [...prev, newRdv])} />
    </div>
  );
};

export default AgendaPage;