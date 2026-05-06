import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from "framer-motion";
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
  FileSearch
} from 'lucide-react';


const VueEnsemblePage = () => {
  const { id } = useParams();

  const patient = {
    id: id?.slice(-8) || 'D-8921-X',
    nom: 'Harrab',
    prenom: 'Hind',
    age: 42,
    doctors: [
      { name: 'Dr. Jean Dupont', specialty: 'Oncologue Référent' },
      { name: 'Dr. Sarah Martin', specialty: 'Radiologue' }
    ]
  };

  const medicalHistory = [
    { maladie: 'Carcinome ductal in situ', dateDiagnostic: '12/03/2026', statut: 'En cours', traitements: 'Chirurgie + Radiothérapie' },
    { maladie: 'Hypertension', dateDiagnostic: '05/2020', statut: 'Stabilisé', traitements: 'Lisinopril' }
  ];

  const familyHistory = [
    { lienFamilial: 'Mère', maladie: 'Cancer du sein', ageSurvenue: 45 },
    { lienFamilial: 'Tante maternelle', maladie: 'Cancer de l\'ovaire', ageSurvenue: 52 }
  ];

  const exams = [
    { type: 'Examen Manuel', date: '10/03/2026', result: 'Masse palpable QSE gauche - 2cm' },
    { type: 'Mammographie', date: '15/03/2026', result: 'ACR 5 - Score BIRADS VI' },
    { type: 'Échographie', date: '18/03/2026', result: 'Structure hétérogène hypoéchogène' },
    { type: 'Biopsie', date: '21/03/2026', result: 'Carcinome Infiltrant - HER2+' },
    { type: 'IRM Mammaire', date: '25/03/2026', result: 'Prise de contraste intense - 2.5cm' }
  ];

  const upcomingRendezVous = [
    { id: 1, date: '12/05/2026', motif: 'Contrôle Post-Op', statut: 'Confirmé', lieu: 'Service Oncologie' },
    { id: 2, date: '19/05/2026', motif: 'Séance Radiothérapie', statut: 'Planifié', lieu: 'Plateau Technique' }
  ];

  const timelineData = [
    { 
      month: 'JANVIER', 
      tasks: [
        { id: 1, title: 'Biopsie', subtitle: 'Prélèvement tissulaire', date: '07 JAN', type: 'biopsy', color: '#ec4899', completed: true },
        { id: 2, title: 'Chimio C1', subtitle: 'Protocole EC-100', date: '18 JAN', type: 'chemo', color: '#f43f5e', completed: true },
        { id: 3, title: 'Aromasin', subtitle: 'Traitement Oral', date: '24 JAN', type: 'pill', color: '#d946ef', completed: true },
      ]
    },
    { 
      month: 'FÉVRIER', 
      tasks: [
        { id: 4, title: 'Bisphospho', subtitle: 'Perfusion osseuse', date: '05 FÉV', type: 'pill', color: '#a855f7', completed: true },
        { id: 5, title: 'Radiation P1', subtitle: 'Séance ciblée', date: '19 FÉV', type: 'radiation', color: '#7c3aed', completed: true },
      ]
    },
    { 
      month: 'MARS', 
      tasks: [
        { id: 6, title: 'Scanner', subtitle: 'Contrôle TAP', date: '17 MAR', type: 'scan', color: '#94a3b8', completed: false },
        { id: 7, title: 'Chirurgie', subtitle: 'Tumorectomie QSE', date: '21 MAR', type: 'surgery', color: '#94a3b8', completed: false },
      ]
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-black min-h-full font-sans transition-all">
      {/* Patient Profile Header */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/30 dark:bg-slate-800/20 -skew-x-12 translate-x-20"></div>
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm">
              <User size={32} strokeWidth={1} />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{patient.nom} {patient.prenom}</h1>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none">ID: {patient.id}</span>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Calendar size={12} className="text-slate-400" /> {patient.age} ANS
                </p>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Activity size={12} className="text-slate-400" /> O+
                </p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100/50 dark:border-emerald-800/30">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">SUIVI ACTIF</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 text-right">ÉQUIPE DE RÉFÉRENCE</p>
              <div className="flex -space-x-1.5 h-7 justify-end">
                {patient.doctors.map((doc, i) => (
                  <div key={i} title={`${doc.name} - ${doc.specialty}`} className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-gray-900 flex items-center justify-center text-[9px] font-black text-slate-700 dark:text-slate-400 uppercase shadow-sm">
                    {doc.name.split(' ').pop().charAt(0)}
                  </div>
                ))}
              </div>
            </div>
            <button className="h-11 px-6 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/5">
                NOUVEAU COMPTE RENDU
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Section - History & Appointments */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Medical History */}
          <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                <History size={18} />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Antécédents Médicaux</h2>
            </div>
            <div className="space-y-4">
              {medicalHistory.map((item, i) => (
                <div key={i} className="p-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-slate-300 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.maladie}</h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{item.dateDiagnostic}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mb-4 italic leading-relaxed">"{item.traitements}"</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.statut === 'En cours' ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.statut}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Family History */}
          <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                <Users size={18} />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Antécédents Familiaux</h2>
            </div>
            <div className="space-y-4">
              {familyHistory.map((item, i) => (
                <div key={i} className="p-5 border-l-4 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 rounded-r-2xl hover:bg-slate-50 transition-all">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">{item.lienFamilial}</p>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white mb-2 uppercase leading-none">{item.maladie}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Diagnostic: {item.ageSurvenue} ans</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Appointments */}
        <div className="lg:col-span-4">
          <section className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            <div className="flex items-center gap-3 mb-10 relative">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5"><Calendar size={20} className="text-sky-400" /></div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-400">Rendez-vous</h2>
            </div>
            <div className="space-y-8 relative">
              {upcomingRendezVous.map((rdv) => (
                <div key={rdv.id} className="relative pl-8 border-l-2 border-white/5 hover:border-sky-500 transition-all group">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-sky-500 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(14,165,233,0.3)]"></div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-white/30 tracking-widest italic">{rdv.date}</span>
                    <span className="text-[9px] font-black px-3 py-1 bg-white/5 text-sky-400 rounded-full border border-white/5 uppercase tracking-tighter">{rdv.statut}</span>
                  </div>
                  <h4 className="text-[12px] font-black uppercase tracking-widest mb-1 text-white">{rdv.motif}</h4>
                  <p className="text-[9px] text-white/20 italic uppercase tracking-widest">{rdv.lieu}</p>
                </div>
              ))}
              <button className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 transition-all">
                Gérer l'agenda
              </button>
            </div>
          </section>
        </div>

        {/* Full Width Exams Section */}
        <div className="lg:col-span-12">
          <section className="bg-white dark:bg-gray-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-xl">
                  <Clipboard size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-[0.1em] text-slate-900 dark:text-white">Examens & Imagerie Médicale</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Séquençage chronologique • Protocoles hospitaliers</p>
                </div>
              </div>
              <button className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 transition-all">
                TÉLÉCHARGER TOUT (.ZIP)
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {exams.map((exam, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[11px] font-black px-3 py-1 bg-slate-900 text-white rounded-lg uppercase tracking-widest">RAPPORT 0{i + 1}</span>
                    <span className="text-[10px] font-bold text-slate-300 italic tracking-widest text-right">{exam.date}</span>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-4 leading-tight">{exam.type}</h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-6 border border-slate-50 dark:border-slate-800">
                    <p className="text-[12px] text-slate-600 dark:text-slate-400 font-medium italic leading-relaxed">"{exam.result}"</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest border border-slate-200 dark:border-slate-700 py-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm">Consulter</button>
                    <button className="flex-1 text-[10px] font-black text-sky-600 uppercase tracking-widest bg-sky-50 dark:bg-sky-900/20 py-3 rounded-xl hover:bg-sky-100 transition-all shadow-sm">Visualiser</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── PARCOURS DE SOIN TIMELINE (COMPACT BUT BALANCED) ── */}
        <div className="lg:col-span-12">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative">
            <div className="flex items-start overflow-x-auto no-scrollbar gap-12 pb-4 relative min-h-[220px]">
              {timelineData.map((month, mIdx) => (
                <div key={mIdx} className="flex-none w-[220px] relative">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{month.month}</span>
                    <div className="flex-1 h-px bg-slate-50 dark:bg-slate-800"></div>
                  </div>

                  <div className="space-y-5">
                    {month.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-4 relative group">
                        <div className="relative">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                            style={{ 
                              backgroundColor: task.completed ? task.color : '#f8fafc',
                              color: task.completed ? 'white' : '#cbd5e1'
                            }}
                          >
                            {task.type === 'biopsy' && <FlaskConical size={18} />}
                            {task.type === 'chemo' && <Droplets size={18} />}
                            {task.type === 'pill' && <Stethoscope size={18} />}
                            {task.type === 'radiation' && <Activity size={18} />}
                            {task.type === 'scan' && <FileSearch size={18} />}
                            {task.type === 'surgery' && <Scissors size={18} />}
                          </div>
                          {task.completed && (
                            <div className="absolute -top-1 -left-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-white shadow-sm">
                              <CheckCircle2 size={8} strokeWidth={4} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-tight leading-none mb-1">{task.title}</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{task.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-50/50">
               <div className="flex items-center gap-6 flex-1 w-full">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">AVANCEMENT : 65%</span>
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[65%]" />
                  </div>
               </div>
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] whitespace-nowrap">PROTOCOLE ACTIF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VueEnsemblePage;