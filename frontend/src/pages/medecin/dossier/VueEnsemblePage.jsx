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
  FileText,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const VueEnsemblePage = () => {
  const { id } = useParams();

  // Mock data for the demonstration
  const patient = {
    id: id,
    nom: 'Harrab',
    prenom: 'Hind',
    age: 42,
    doctors: [
      { name: 'Dr. Jean Dupont', specialty: 'OncologueRéférent' },
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
    { type: 'Consultation Initiale', date: '10/03/2026', status: 'Complété', result: 'Masse palpable QSE gauche' },
    { type: 'Mammographie', date: '15/03/2026', status: 'Complété', result: 'ACR 5 - Opacité spiculée' },
    { type: 'Biopsie', date: '20/03/2026', status: 'Complété', result: 'Grade II - HER2+' },
    { type: 'IRM Mammaire', date: '25/03/2026', status: 'Complété', result: 'Extension 2.5cm' }
  ];

  const treatmentPlan = [
    { phase: 'Chirurgie', status: 'Terminé', date: '05/04/2026' },
    { phase: 'Radiothérapie', status: 'En cours', progress: 65 },
    { phase: 'Hormonothérapie', status: 'À venir', date: '01/06/2026' }
  ];

  const graphData = [
    { name: 'Sem 1', fatigue: 4, douleur: 2, moral: 8 },
    { name: 'Sem 2', fatigue: 5, douleur: 3, moral: 7 },
    { name: 'Sem 3', fatigue: 7, douleur: 6, moral: 5 },
    { name: 'Sem 4', fatigue: 6, douleur: 4, moral: 6 },
    { name: 'Sem 5', fatigue: 4, douleur: 2, moral: 8 },
    { name: 'Sem 6', fatigue: 3, douleur: 1, moral: 9 },
  ];

  return (
    <div className="p-8 space-y-6 bg-white dark:bg-black min-h-full font-sans">
      {/* Patient Profile Header - More Clinical/Serious */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 dark:bg-slate-800/30 -skew-x-12 translate-x-20"></div>
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700 shadow-inner">
              <User size={40} strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{patient.nom} {patient.prenom}</h1>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">ID Dossier: {patient.id}</span>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Calendar size={12} className="text-slate-400" /> {patient.age} ans
                </p>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Activity size={12} className="text-slate-400" /> Groupe A+
                </p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-800/50">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Protocol Actif</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1 mb-2">Équipe de Soins</p>
              <div className="flex -space-x-2 h-8">
                {patient.doctors.map((doc, i) => (
                  <div key={i} title={`${doc.name} - ${doc.specialty}`} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">
                    {doc.name.split(' ').pop().charAt(0)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-black text-slate-400 italic">
                  +1
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section - Clinical Data (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Bento Grid for History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical History */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                    <History size={18} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Antécédents Médicaux</h2>
                </div>
              </div>
              
              <div className="space-y-3">
                {medicalHistory.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{item.maladie}</h3>
                      <span className="text-[8px] font-black text-slate-400 uppercase">{item.dateDiagnostic}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mb-2">{item.traitements}</p>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.statut === 'En cours' ? 'bg-amber-400' : 'bg-slate-300'}`}></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.statut}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Family History */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                    <Users size={18} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Antécédents Familiaux</h2>
                </div>
              </div>
              
              <div className="space-y-3">
                {familyHistory.map((item, i) => (
                  <div key={i} className="p-4 border-l-2 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-900/10 rounded-r-xl">
                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">{item.lienFamilial}</p>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{item.maladie}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Âge: {item.ageSurvenue} ans</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Evolution Chart - Precise View */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Cinétique de la Qualité de Vie</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Données issues des questionnaires hebdomadaires</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-500 rounded-sm"></div>
                    <span>Fatigue (VAS)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-sky-500 rounded-sm"></div>
                    <span>Score Moral</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 10]}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #f1f5f9', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }} 
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Line type="monotone" dataKey="fatigue" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="moral" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Detailed Exams Section */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                  <Clipboard size={18} />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Examens Cliniques & Imagerie</h2>
              </div>
              <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-1">
                Voir tout l'historique <ArrowUpRight size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {exams.map((exam, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                      {i + 1}
                    </div>
                    {i !== exams.length - 1 && <div className="flex-1 w-px bg-slate-100 dark:bg-slate-800 my-2"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">{exam.type}</h3>
                      <span className="text-[10px] font-bold text-slate-300">{exam.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mb-2 leading-relaxed">{exam.result}</p>
                    <div className="flex gap-3">
                      <button className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-md hover:bg-slate-50 transition-colors">
                        CR Complet
                      </button>
                      <button className="text-[9px] font-black text-sky-600 uppercase tracking-widest px-3 py-1 rounded-md bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 transition-colors">
                        Imagerie
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Section - Plan & Metrics (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Treatment Plan - Highlighted */}
          <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Activity size={16} />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-sky-400">Parcours Thérapeutique</h2>
            </div>
            
            <div className="space-y-4 relative">
              {treatmentPlan.map((phase, i) => (
                <div key={i} className={`p-4 rounded-xl border ${phase.status === 'En cours' ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      {phase.phase}
                    </h4>
                    {phase.status === 'Terminé' ? (
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    ) : phase.status === 'En cours' ? (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                    ) : (
                      <span className="text-[9px] font-bold text-white/30 italic uppercase">{phase.status}</span>
                    )}
                  </div>
                  
                  {phase.progress ? (
                    <div className="space-y-2">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-sky-400" 
                          initial={{ width: 0 }}
                          animate={{ width: `${phase.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
                        <span>Progression au protocole</span>
                        <span className="text-sky-400">{phase.progress}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      {phase.status === 'Terminé' ? `Clôturé: ${phase.date}` : `Estimation: ${phase.date}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-50 transition-all">
              Éditer la Stratégie
            </button>
          </section>

          {/* Clinical Parameters */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Paramètres Cliniques</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">IMC</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">24.2 <span className="text-[10px] font-bold text-slate-400 ml-1">kg/m²</span></p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-rose-500 font-black text-[10px]">
                    <TrendingUp size={12} />
                    <span>+1.2</span>
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">vs dernier</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sommeil</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">06:30 <span className="text-[10px] font-bold text-slate-400 ml-1">h/j</span></p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px]">
                    <CheckCircle2 size={12} />
                    <span>Stabilité</span>
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">7 derniers jours</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Notes/Observations */}
          <section className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/30 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Clipboard size={14} className="text-amber-600" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-amber-900 dark:text-amber-400">Observations de synthèse</h2>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed italic border-l-2 border-amber-200 dark:border-amber-800 pl-3">
              "Patiente stable sous radiothérapie. Fatigue en légère hausse (Cycle 4). Moral satisfaisant. Soutien nutritionnel à envisager si l'IMC continue la hausse."
            </p>
            <button className="mt-4 text-[9px] font-black uppercase text-amber-700 dark:text-amber-500 tracking-[0.2em] hover:underline">
              Modifier la note de synthèse
            </button>
          </section>

        </div>
      </div>
    </div>
  );
};

export default VueEnsemblePage;
