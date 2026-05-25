import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import {
  Activity, Users, AlertTriangle, Calendar, TrendingUp,
  TrendingDown, Heart, ScanLine, Clock, ChevronRight,
  Bell, Sparkles, ArrowUpRight, Brain, 
  CalendarDays, Filter, MoreHorizontal, Loader2
} from 'lucide-react';
import {
  XAxis, YAxis, ResponsiveContainer,
  Tooltip, AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';

const DashboardPage = () => {
  const { setPatientSelectionne } = useOutletContext();
  const { user } = useAuth();
  const [periode, setPeriode] = useState('semaine');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State pour les données du backend
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      activePatients: 0,
      criticalCases: 0,
      iaExamsThisWeek: 0,
      rdvToday: 0
    },
    biradsDistribution: [],
    examsEvolution: [],
    weeklyActivity: [],
    recentExams: [],
    todayAppointments: []
  });

  const prenomMedecin = user?.prenom ?? 'Meryem';
  const nomMedecin = user?.nom ?? '';

  // Chargement des données
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchDashboardData();
  }, [periode]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  // Construction des KPI à partir des données backend
  const kpis = [
    {
      label: 'Patientes actives',
      value: dashboardData.kpis.activePatients,
      variation: '+12',
      trend: 'up',
      icon: Users,
      color: 'violet',
      sub: 'ce mois-ci'
    },
    {
      label: 'Diagnostics IA',
      value: dashboardData.kpis.iaExamsThisWeek,
      variation: '+18%',
      trend: 'up',
      icon: Brain,
      color: 'sky',
      sub: 'cette semaine'
    },
    {
      label: 'Cas critiques',
      value: dashboardData.kpis.criticalCases,
      variation: '+2',
      trend: 'up',
      icon: AlertTriangle,
      color: 'pink',
      sub: 'action requise',
      urgent: true
    },
    {
      label: 'Consultations',
      value: dashboardData.kpis.rdvToday,
      variation: '-3',
      trend: 'down',
      icon: Calendar,
      color: 'rose',
      sub: 'aujourd\'hui'
    }
  ];

  // Données pour les graphiques
  const evolutionData = dashboardData.examsEvolution.length > 0 
    ? dashboardData.examsEvolution 
    : [
        { mois: 'Jan', mammo: 0, irm: 0, echo: 0 },
        { mois: 'Fév', mammo: 0, irm: 0, echo: 0 },
        { mois: 'Mar', mammo: 0, irm: 0, echo: 0 },
        { mois: 'Avr', mammo: 0, irm: 0, echo: 0 },
        { mois: 'Mai', mammo: 0, irm: 0, echo: 0 }
      ];

  const biradsData = dashboardData.biradsDistribution.length > 0
    ? dashboardData.biradsDistribution
    : [
        { name: 'Normaux (1-2)', value: 0, color: '#10b981' },
        { name: 'À surveiller (3)', value: 0, color: '#f59e0b' },
        { name: 'Suspects (4)', value: 0, color: '#ef4444' },
        { name: 'Malins (5-6)', value: 0, color: '#991b1b' }
      ];

  const weeklyActivityData = dashboardData.weeklyActivity.length > 0
    ? dashboardData.weeklyActivity
    : [
        { jour: 'Lun', examens: 0, color: '#818cf8' },
        { jour: 'Mar', examens: 0, color: '#6366f1' },
        { jour: 'Mer', examens: 0, color: '#4f46e5' },
        { jour: 'Jeu', examens: 0, color: '#4338ca' },
        { jour: 'Ven', examens: 0, color: '#3730a3' },
        { jour: 'Sam', examens: 0, color: '#4f46e5' },
        { jour: 'Dim', examens: 0, color: '#6366f1' }
      ];

  const recentExams = dashboardData.recentExams || [];

  const todayAppointments = dashboardData.todayAppointments || [];

  const handleSimulate = (patientName) => {
    setPatientSelectionne({
      id: "1",
      nom: patientName.split(' ')[1] || "B.",
      prenom: patientName.split(' ')[0] || "Patient",
      email: "patient@example.com"
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'critical': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
  };

  const getKpiColorStyle = (color) => {
    const styles = {
      violet: 'from-violet-50/50 to-white border-violet-100 text-violet-600',
      sky: 'from-sky-50/50 to-white border-sky-100 text-sky-600',
      pink: 'from-pink-50/50 to-white border-pink-100 text-pink-600',
      rose: 'from-rose-50/50 to-white border-rose-100 text-rose-600',
    };
    return styles[color] || styles.violet;
  };

  const getKpiIconStyle = (color) => {
    const styles = {
      violet: 'bg-violet-600',
      sky: 'bg-sky-600',
      pink: 'bg-pink-600',
      rose: 'bg-rose-600',
    };
    return styles[color] || styles.violet;
  };

  const getBiradsDisplay = (birads) => {
    if (!birads) return 'N/A';
    return birads.replace('BIRADS_', '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
          <p className="text-rose-600 font-bold">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-bold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
             <Activity size={24} className="text-white" strokeWidth={2.5} />
           </div>
           <div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
               Tableau de bord
             </h1>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.15em] mt-0.5">
               Dr. {prenomMedecin} {nomMedecin} • Centre OncoAssist • {new Date().toLocaleDateString('fr-FR')}
             </p>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-2xl shadow-inner-sm">
            {['semaine', 'mois'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  periode === p ? 'bg-white text-slate-950 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className={`p-6 rounded-[2.5rem] bg-gradient-to-br ${getKpiColorStyle(kpi.color)} border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all group overflow-hidden relative cursor-pointer`}
          >
            <div className="flex flex-col gap-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${getKpiIconStyle(kpi.color)} text-white shadow-lg shadow-${kpi.color}-200/50`}>
                  <kpi.icon size={20} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1 font-black text-[10px] px-2.5 py-1 rounded-lg ${
                  kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {kpi.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.variation}
                </div>
              </div>
              
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 tracking-tight tabular-nums">{kpi.value}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.sub}</span>
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mt-2">{kpi.label}</p>
              </div>
            </div>
            
            <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <kpi.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- Main Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Statistics Chart */}
        <div className="lg:col-span-8 bg-gradient-to-b from-white to-slate-50/40 border border-slate-200 rounded-[2.5rem] p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center shadow-sm">
                <Activity size={22} className="text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-900">Activité Diagnostic</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Surveillance multi-modulaire</p>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={evolutionData}>
              <defs>
                <linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="mammo" stroke="#ec4899" strokeWidth={4} fillOpacity={1} fill="url(#colorPink)" dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="irm" stroke="#8b5cf6" strokeWidth={2} fillOpacity={0} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="echo" stroke="#0ea5e9" strokeWidth={2} fillOpacity={0} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="flex items-center justify-center gap-8 mt-6">
             {[{ n: 'Mammographie', c: 'bg-pink-500' }, { n: 'IRM', c: 'bg-violet-500' }, { n: 'Échographie', c: 'bg-sky-500' }].map(item => (
                <div key={item.n} className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.c} ring-4 ring-${item.c.split('-')[1]}-100`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.n}</span>
                </div>
             ))}
          </div>
        </div>

        {/* BIRADS Distribution */}
        <div className="lg:col-span-4 bg-gradient-to-b from-white to-slate-50/40 border border-slate-200 rounded-[2.5rem] p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Heart size={22} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-900">Score BI-RADS</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Distribution clinique</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={biradsData}
                innerRadius={70}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {biradsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-3 mt-8">
            {biradsData.map((item) => (
              <div key={item.name} className="flex flex-col p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 truncate">{item.name}</span>
                </div>
                <span className="text-lg font-black text-slate-900 tabular-nums">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Exams List */}
        <div className="lg:col-span-12 xl:col-span-8 bg-gradient-to-b from-white to-slate-50/40 border border-slate-200 rounded-[2.5rem] p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                    <ScanLine size={22} className="text-indigo-600" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-900">Analyses Récentes</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Dernières prédictions IA</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentExams.map((exam) => (
                 <div 
                   key={exam.id} 
                   onClick={() => handleSimulate(exam.patient)}
                   className="p-5 rounded-3xl bg-slate-50/30 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-slate-400 transition-colors group-hover:border-indigo-100 group-hover:text-indigo-600">
                          {exam.patient?.substring(0, 2).toUpperCase() || 'NA'}
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase tracking-tight text-slate-900">{exam.patient}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{exam.type} • {exam.time}</p>
                       </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-[10px] font-black tracking-[0.05em] uppercase ${getStatusStyle(exam.status)}`}>
                       BI-RADS {exam.birads}
                    </div>
                 </div>
              ))}
              {recentExams.length === 0 && (
                <div className="col-span-2 text-center py-8 text-slate-400">
                  Aucun examen récent
                </div>
              )}
           </div>
        </div>

        {/* Quick Contacts / Scheduled */}
        <div className="lg:col-span-12 xl:col-span-4 bg-gradient-to-b from-white to-slate-50/40 border border-slate-200 rounded-[2.5rem] p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center">
                 <CalendarDays size={22} className="text-pink-600" />
              </div>
              <div>
                 <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-900">Agenda du jour</h3>
                 <p className="text-[10px] font-bold text-pink-600 uppercase tracking-widest mt-0.5">{todayAppointments.length} rendez-vous</p>
              </div>
           </div>

           <div className="space-y-3">
              {todayAppointments.map((rdv, i) => (
                 <div key={i} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <span className="text-[11px] font-black text-pink-700 tabular-nums bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-100 group-hover:bg-pink-600 group-hover:text-white transition-colors">{rdv.time}</span>
                       <div>
                          <p className="text-xs font-black uppercase tracking-tight text-slate-900">{rdv.patient}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-[0.15em]">{rdv.reason}</p>
                       </div>
                    </div>
                    <button className="p-2 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                       <MoreHorizontal size={16} className="text-slate-400" />
                    </button>
                 </div>
              ))}
              {todayAppointments.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  Aucun rendez-vous aujourd'hui
                </div>
              )}
           </div>
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="lg:col-span-12 bg-gradient-to-b from-white to-slate-50/40 border border-slate-200 rounded-[2.5rem] p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                    <TrendingUp size={22} className="text-indigo-600" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-900">Activité hebdomadaire</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Statistiques de flux patients</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 rounded-3xl text-white shadow-xl">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-2xl font-black tabular-nums tracking-tight">{weeklyActivityData.reduce((sum, day) => sum + day.examens, 0)}</span>
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Total semaine</span>
              </div>
           </div>

           <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyActivityData} margin={{ top: 20 }}>
                 <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={15} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }} />
                 <Bar dataKey="examens" radius={[12, 12, 4, 4]} barSize={50}>
                    {weeklyActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                 </Bar>
              </BarChart>
           </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;