import React, { useRef, useState, useEffect } from 'react';
import {
  User,
  Stethoscope,
  Activity,
  History,
  Users,
  Clipboard,
  Calendar,
  CheckCircle2,
  Droplets,
  FlaskConical,
  Scissors,
  FileSearch,
  Plus,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const patient = {
  id: 'D-8921-X',
  nom: 'Harrab',
  prenom: 'Hind',
  age: 42,
  doctors: [
    { name: 'Dr. Jean Dupont', specialty: 'Oncologue Référent' },
    { name: 'Dr. Sarah Martin', specialty: 'Radiologue' },
  ],
};

const medicalHistory = [
  { maladie: 'Carcinome ductal in situ', dateDiagnostic: '12/03/2026', statut: 'En cours', traitements: 'Chirurgie + Radiothérapie' },
  { maladie: 'Hypertension', dateDiagnostic: '05/2020', statut: 'Stabilisé', traitements: 'Lisinopril' },
];

const familyHistory = [
  { lienFamilial: 'Mère', maladie: 'Cancer du sein', ageSurvenue: 45 },
  { lienFamilial: 'Tante maternelle', maladie: "Cancer de l'ovaire", ageSurvenue: 52 },
];

const exams = [
  { type: 'Examen Manuel', date: '10/03/2026', result: 'Masse palpable QSE gauche - 2cm' },
  { type: 'Mammographie', date: '15/03/2026', result: 'ACR 5 - Score BIRADS VI' },
  { type: 'Échographie', date: '18/03/2026', result: 'Structure hétérogène hypoéchogène' },
  { type: 'Biopsie', date: '21/03/2026', result: 'Carcinome Infiltrant - HER2+' },
  { type: 'IRM Mammaire', date: '25/03/2026', result: 'Prise de contraste intense - 2.5cm' },
];

const upcomingRendezVous = [
  { id: 1, date: '12/05/2026', motif: 'Contrôle Post-Op', statut: 'Confirmé', lieu: 'Service Oncologie' },
  { id: 2, date: '19/05/2026', motif: 'Séance Radiothérapie', statut: 'Planifié', lieu: 'Plateau Technique' },
];

/* ── Timeline ── */
const COLS = [
  { label: '07 JAN', month: 0 },
  { label: '18 JAN', month: 0 },
  { label: '24 JAN', month: 0 },
  { label: '05 FÉV', month: 1 },
  { label: '19 FÉV', month: 1 },
  { label: '17 MAR', month: 2 },
  { label: '21 MAR', month: 2 },
];

const MONTHS = [
  { label: 'JANVIER', startCol: 0, endCol: 2 },
  { label: 'FÉVRIER', startCol: 3, endCol: 4 },
  { label: 'MARS',    startCol: 5, endCol: 6 },
];

/* ── Couleurs originales violet/magenta/fuchsia (inchangées) ── */
const EVENTS = [
  { id: 1, title: 'Biopsie',     subtitle: 'Sein droit',     colIndex: 0, type: 'biopsy',    color: '#ec4899', completed: true  },
  { id: 2, title: 'Chimio C1',   subtitle: '6×FEC',          colIndex: 1, type: 'chemo',     color: '#f43f5e', completed: true  },
  { id: 3, title: 'Aromasin',    subtitle: 'Oral',           colIndex: 2, type: 'pill',      color: '#d946ef', completed: true  },
  { id: 4, title: 'Bisphospho',  subtitle: 'Perfusion',      colIndex: 3, type: 'pill',      color: '#a855f7', completed: true  },
  { id: 5, title: 'Radiation P1',subtitle: 'Séance ciblée',  colIndex: 4, type: 'radiation', color: '#7c3aed', completed: true  },
  { id: 6, title: 'Scanner',     subtitle: 'Contrôle TAP',   colIndex: 5, type: 'scan',      color: '#cbd5e1', completed: false },
  { id: 7, title: 'Chirurgie',   subtitle: 'Tumorectomie',   colIndex: 6, type: 'surgery',   color: '#cbd5e1', completed: false },
];

const BARS = [
  { id: 1, label: 'Chimiothérapie  |  6×FEC', color: '#f43f5e', startCol: 1, endCol: 4 },
  { id: 2, label: 'Aromasin',                  color: '#d946ef', startCol: 2, endCol: 5 },
  { id: 3, label: 'Bisphosponates',            color: '#a855f7', startCol: 3, endCol: 6 },
  { id: 4, label: 'Radiation',                 color: '#7c3aed', startCol: 4, endCol: 6 },
];

/* ─────────────────────────────────────────────
   ICON helper
───────────────────────────────────────────── */
function TaskIcon({ type, size = 16 }) {
  if (type === 'biopsy')    return <FlaskConical size={size} />;
  if (type === 'chemo')     return <Droplets size={size} />;
  if (type === 'pill')      return <Stethoscope size={size} />;
  if (type === 'radiation') return <Activity size={size} />;
  if (type === 'scan')      return <FileSearch size={size} />;
  if (type === 'surgery')   return <Scissors size={size} />;
  return null;
}

/* ─────────────────────────────────────────────
   GANTT TIMELINE — RESPONSIVE
───────────────────────────────────────────── */
function GanttTimeline() {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const totalCols = COLS.length;
  const innerW = Math.max(0, containerWidth - 16);
  const colW = innerW > 0 ? innerW / totalCols : 0;
  const iconSize = Math.max(28, Math.min(40, colW * 0.36));
  const taskIconSize = Math.max(12, Math.min(16, colW * 0.14));

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-violet-100 rounded-xl">
            <Calendar size={18} className="text-violet-500" />
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Parcours de Traitement</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Séquencement du protocole actif</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-50 rounded-full p-1 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 px-3 py-1">2025</span>
            <span className="text-[10px] font-black text-violet-600 bg-violet-100 px-3 py-1 rounded-full">2026</span>
          </div>
          <button className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-500 hover:bg-violet-200 transition-colors">
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="w-full px-2">
        {colW === 0 ? (
          <div className="h-64" />
        ) : (
          <>
            <div className="flex border-b border-slate-50 pt-5 pb-3">
              {MONTHS.map((m) => {
                const span = m.endCol - m.startCol + 1;
                return (
                  <div key={m.label} style={{ width: span * colW }} className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{m.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="relative" style={{ height: 100 }}>
              {COLS.map((_, ci) => (
                <div key={ci} className="absolute top-0 bottom-0 border-r border-dashed border-slate-100" style={{ left: ci * colW + colW / 2 }} />
              ))}
              <div className="absolute top-0 left-0 right-0" style={{ height: 48, background: 'linear-gradient(to bottom, rgba(16,185,129,0.04), transparent)' }} />

              {EVENTS.map((ev) => {
                const cx = ev.colIndex * colW + colW / 2;
                return (
                  <div key={ev.id} className="absolute flex flex-col items-center group" style={{ left: cx - iconSize / 2, top: 8, width: iconSize }} title={`${ev.title} — ${ev.subtitle}`}>
                    <div className="mb-1.5">
                      {ev.completed ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-300 flex items-center justify-center">
                          <CheckCircle2 size={12} strokeWidth={3} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div
                      className="rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110 cursor-pointer"
                      style={{
                        width: iconSize,
                        height: iconSize,
                        background: ev.completed
                          ? `radial-gradient(circle at 35% 35%, ${ev.color}cc, ${ev.color})`
                          : 'linear-gradient(135deg,#f1f5f9,#e2e8f0)',
                        color: ev.completed ? 'white' : '#94a3b8',
                        boxShadow: ev.completed ? `0 4px 14px ${ev.color}55` : '0 2px 8px rgba(0,0,0,0.06)',
                      }}
                    >
                      <TaskIcon type={ev.type} size={taskIconSize} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex py-3 border-b border-slate-50">
              {COLS.map((col, ci) => (
                <div key={ci} style={{ width: colW }} className="text-center">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate px-1">{col.label}</div>
                  <div className="text-[9px] font-bold text-slate-700 uppercase tracking-tight mt-0.5 truncate px-1">
                    {EVENTS.find((e) => e.colIndex === ci)?.title ?? ''}
                  </div>
                </div>
              ))}
            </div>

            <div className="py-5 space-y-3 pb-6">
              {BARS.map((bar) => {
                const barLeft = bar.startCol * colW + Math.min(12, colW * 0.1);
                const barWidth = (bar.endCol - bar.startCol) * colW + colW / 2 - Math.min(12, colW * 0.1);
                const trackWidth = (bar.endCol - bar.startCol) * colW + colW;
                return (
                  <div key={bar.id} className="relative" style={{ height: 32 }}>
                    <div className="absolute inset-y-0 rounded-full opacity-15" style={{ left: bar.startCol * colW, width: trackWidth, background: bar.color }} />
                    <div
                      className="absolute inset-y-0 rounded-full flex items-center px-4 overflow-hidden"
                      style={{ left: barLeft, width: Math.max(barWidth, 0), background: `linear-gradient(90deg, ${bar.color}, ${bar.color}cc)` }}
                    >
                      <span className="text-[10px] font-black text-white tracking-tight whitespace-nowrap truncate">{bar.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between px-8 py-5 bg-slate-50/50 border-t border-slate-100">
        <div className="flex items-center gap-5 flex-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">PROGRESSION</span>
          <div className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
            22.01.2026 | <span className="text-violet-500 font-black">RÉCURRENT</span>
          </div>
        </div>
        <div className="flex items-center gap-5 flex-1 justify-center">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[200px]">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '65%' }} />
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">65%</span>
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">20.02.2026</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE — inchangée
───────────────────────────────────────────── */
function VueEnsemblePage() {
  return (
    <div className="p-8 space-y-8 min-h-full font-sans" style={{ backgroundColor: '#fafbfc' }}>

      {/* ── Patient Header ── */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/40 -skew-x-12 translate-x-20 pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center border border-violet-100">
              <User size={32} strokeWidth={1} className="text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                  {patient.nom} {patient.prenom}
                </h1>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">ID: {patient.id}</span>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                  <Calendar size={11} className="text-slate-400" /> {patient.age} ANS
                </p>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                  <Activity size={11} className="text-slate-400" /> O+
                </p>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest">SUIVI ACTIF</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">ÉQUIPE DE RÉFÉRENCE</p>
              <div className="flex -space-x-1.5 h-7 justify-end">
                {patient.doctors.map((doc, i) => (
                  <div
                    key={i}
                    title={`${doc.name} — ${doc.specialty}`}
                    className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black uppercase ${
                      i === 0 ? 'bg-violet-50 text-violet-500' : 'bg-pink-50 text-pink-500'
                    }`}
                  >
                    {doc.name.split(' ').pop().charAt(0)}
                  </div>
                ))}
              </div>
            </div>
            <button className="h-11 px-6 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md">
              NOUVEAU COMPTE RENDU
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Medical History ── */}
        <div className="lg:col-span-4">
          <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-pink-50 rounded-xl">
                <History size={16} className="text-pink-400" />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Antécédents Médicaux</h2>
            </div>
            <div className="space-y-4">
              {medicalHistory.map((item, i) => (
                <div key={i} className="p-5 bg-pink-50/50 rounded-2xl border border-pink-100/70 hover:border-pink-200 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.maladie}</h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase ml-2 shrink-0">{item.dateDiagnostic}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mb-4 italic leading-relaxed">"{item.traitements}"</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.statut === 'En cours' ? 'bg-amber-300' : 'bg-emerald-400'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.statut}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Family History ── */}
        <div className="lg:col-span-4">
          <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <Users size={16} className="text-amber-400" />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Antécédents Familiaux</h2>
            </div>
            <div className="space-y-4">
              {familyHistory.map((item, i) => (
                <div key={i} className="p-5 border-l-4 border-amber-200 bg-amber-50/50 rounded-r-2xl hover:bg-amber-50 transition-all">
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">{item.lienFamilial}</p>
                  <h3 className="text-[11px] font-black text-slate-900 mb-2 uppercase leading-none">{item.maladie}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Diagnostic: {item.ageSurvenue} ans</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Appointments ── */}
        <div className="lg:col-span-4">
          <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-sky-50 rounded-xl">
                <Calendar size={16} className="text-sky-400" />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Rendez-vous</h2>
            </div>
            <div className="space-y-6">
              {upcomingRendezVous.map((rdv) => (
                <div key={rdv.id} className="relative pl-7 border-l-2 border-sky-100 hover:border-sky-300 transition-all group">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-sky-300 group-hover:scale-110 transition-transform" />
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-400 tracking-widest italic">{rdv.date}</span>
                    <span className="text-[9px] font-black px-2.5 py-1 bg-sky-50 text-sky-500 rounded-full border border-sky-100 uppercase tracking-tighter">{rdv.statut}</span>
                  </div>
                  <h4 className="text-[12px] font-black uppercase tracking-widest mb-1 text-slate-900">{rdv.motif}</h4>
                  <p className="text-[9px] text-slate-400 italic uppercase tracking-widest">{rdv.lieu}</p>
                </div>
              ))}
              <button className="w-full mt-6 py-4 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] text-sky-500 transition-all">
                Gérer l'agenda
              </button>
            </div>
          </section>
        </div>

        {/* ── Exams ── */}
        <div className="lg:col-span-12">
          <section className="bg-white rounded-3xl p-10 border border-slate-100 shadow-md">
            <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Clipboard size={22} strokeWidth={1.5} className="text-slate-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-[0.1em] text-slate-900">Examens & Imagerie Médicale</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Séquençage chronologique • Protocoles hospitaliers</p>
                </div>
              </div>
              <button className="px-6 py-3 bg-slate-50 text-[10px] font-black uppercase tracking-[0.15em] border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all">
                TÉLÉCHARGER TOUT (.ZIP)
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {exams.map((exam, i) => {
                const accents = [
                  { badge: 'bg-pink-100 text-pink-500',       bg: 'bg-pink-50/60 border-pink-100',       btn: 'text-pink-500 bg-pink-50 hover:bg-pink-100' },
                  { badge: 'bg-violet-100 text-violet-500',   bg: 'bg-violet-50/60 border-violet-100',   btn: 'text-violet-500 bg-violet-50 hover:bg-violet-100' },
                  { badge: 'bg-amber-100 text-amber-500',     bg: 'bg-amber-50/60 border-amber-100',     btn: 'text-amber-500 bg-amber-50 hover:bg-amber-100' },
                  { badge: 'bg-sky-100 text-sky-500',         bg: 'bg-sky-50/60 border-sky-100',         btn: 'text-sky-500 bg-sky-50 hover:bg-sky-100' },
                  { badge: 'bg-emerald-100 text-emerald-500', bg: 'bg-emerald-50/60 border-emerald-100', btn: 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' },
                ];
                const a = accents[i % accents.length];
                return (
                  <div key={i} className="group p-7 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[10px] font-black px-3 py-1 ${a.badge} rounded-lg uppercase tracking-widest`}>RAPPORT 0{i + 1}</span>
                      <span className="text-[10px] font-bold text-slate-300 italic tracking-widest">{exam.date}</span>
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 leading-tight">{exam.type}</h3>
                    <div className={`${a.bg} p-5 rounded-2xl mb-6 border`}>
                      <p className="text-[12px] text-slate-600 font-medium italic leading-relaxed">"{exam.result}"</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-all">Consulter</button>
                      <button className={`flex-1 text-[10px] font-black uppercase tracking-widest ${a.btn} py-3 rounded-xl transition-all`}>Visualiser</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── GANTT TIMELINE ── */}
        <div className="lg:col-span-12">
          <GanttTimeline />
        </div>
      </div>
    </div>
  );
}

export default VueEnsemblePage;