import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import {
  Activity, Users, AlertTriangle, Calendar, TrendingUp,
  TrendingDown, Heart, ScanLine, Brain,
  CalendarDays, MoreHorizontal, Loader2
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

  const [dashboardData, setDashboardData] = useState({
    kpis: { activePatients: 0, criticalCases: 0, iaExamsThisWeek: 0, rdvToday: 0 },
    biradsDistribution: [],
    examsEvolution: [],
    weeklyActivity: [],
    recentExams: [],
    todayAppointments: []
  });

  const prenomMedecin = user?.prenom ?? '';
  const nomMedecin    = user?.nom    ?? '';

  useEffect(() => { fetchDashboardData(); }, [periode]);

  const fetchDashboardData = async () => {
    setLoading(true); setError(null);
    try {
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError('Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { label: 'Patientes actives',  value: dashboardData.kpis.activePatients,  variation: '+12',  trend: 'up',   icon: Users,         color: 'violet', sub: 'ce mois-ci'    },
    { label: 'Diagnostics IA',     value: dashboardData.kpis.iaExamsThisWeek, variation: '+18%', trend: 'up',   icon: Brain,         color: 'sky',    sub: 'cette semaine' },
    { label: 'Cas critiques',      value: dashboardData.kpis.criticalCases,   variation: '+2',   trend: 'up',   icon: AlertTriangle, color: 'pink',   sub: 'action requise' },
    { label: 'Consultations',      value: dashboardData.kpis.rdvToday,        variation: '-3',   trend: 'down', icon: Calendar,      color: 'rose',   sub: "aujourd'hui"   },
  ];

  const defaultEvolution = [
    { mois: 'Jan', mammo: 0, irm: 0, echo: 0, biopsie: 0, consultation: 0 },
    { mois: 'Fév', mammo: 0, irm: 0, echo: 0, biopsie: 0, consultation: 0 },
    { mois: 'Mar', mammo: 0, irm: 0, echo: 0, biopsie: 0, consultation: 0 },
    { mois: 'Avr', mammo: 0, irm: 0, echo: 0, biopsie: 0, consultation: 0 },
    { mois: 'Mai', mammo: 0, irm: 0, echo: 0, biopsie: 0, consultation: 0 },
  ];

  const evolutionData = dashboardData.examsEvolution.length > 0
    ? dashboardData.examsEvolution
    : defaultEvolution;

  const biradsData = dashboardData.biradsDistribution.length > 0
    ? dashboardData.biradsDistribution
    : [
        { name: 'Normaux (1-2)',    value: 0, color: '#6ee7b7' },
        { name: 'À surveiller (3)', value: 0, color: '#fcd34d' },
        { name: 'Suspects (4)',     value: 0, color: '#fca5a5' },
        { name: 'Malins (5-6)',     value: 0, color: '#fb7185' },
      ];

  const weeklyActivityData = dashboardData.weeklyActivity.length > 0
    ? dashboardData.weeklyActivity
    : [
        { jour: 'Lun', examens: 0, color: '#a5b4fc' },
        { jour: 'Mar', examens: 0, color: '#818cf8' },
        { jour: 'Mer', examens: 0, color: '#818cf8' },
        { jour: 'Jeu', examens: 0, color: '#6366f1' },
        { jour: 'Ven', examens: 0, color: '#818cf8' },
        { jour: 'Sam', examens: 0, color: '#a5b4fc' },
        { jour: 'Dim', examens: 0, color: '#c7d2fe' },
      ];

  const recentExams       = dashboardData.recentExams       || [];
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
      case 'critical': return 'bg-rose-50 text-rose-400 border-rose-100';
      case 'warning':  return 'bg-amber-50 text-amber-500 border-amber-100';
      default:         return 'bg-emerald-50 text-emerald-500 border-emerald-100';
    }
  };

  const getKpiColorStyle = (color) => ({
    violet: 'from-violet-50/50 to-white border-violet-100',
    sky:    'from-sky-50/50 to-white border-sky-100',
    pink:   'from-pink-50/50 to-white border-pink-100',
    rose:   'from-rose-50/50 to-white border-rose-100',
  }[color] || 'from-violet-50/50 to-white border-violet-100');

  const getKpiIconStyle = (color) => ({
    violet: 'bg-violet-400',
    sky:    'bg-sky-400',
    pink:   'bg-pink-400',
    rose:   'bg-rose-400',
  }[color] || 'bg-violet-400');

  const LEGEND_ITEMS = [
    { n: 'Mammographie', c: '#c084fc' },
    { n: 'IRM',          c: '#818cf8' },
    { n: 'Échographie',  c: '#7dd3fc' },
    { n: 'Biopsie',      c: '#f472b6' },
    { n: 'Consultation', c: '#34d399' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Loader2 size={36} className="animate-spin text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-slate-300 text-[11px] font-bold uppercase tracking-widest">Chargement...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <AlertTriangle size={36} className="text-rose-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm font-medium mb-4">{error}</p>
        <button onClick={fetchDashboardData}
          className="px-5 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 px-6 pt-2 pb-6" style={{ backgroundColor: '#ffffff' }}>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
            <Activity size={22} className="text-slate-500" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Tableau de bord</h1>
            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5">
              Dr. {prenomMedecin} {nomMedecin} • {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-2xl">
          {['semaine', 'mois'].map((p) => (
            <button key={p} onClick={() => setPeriode(p)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                periode === p
                  ? 'bg-white text-slate-800 shadow-md ring-1 ring-slate-200'
                  : 'text-slate-400 hover:text-slate-700'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.08 }}
            whileHover={{ y: -3 }}
            className={`p-5 rounded-2xl bg-gradient-to-br ${getKpiColorStyle(kpi.color)} border shadow-sm hover:shadow-md transition-all group overflow-hidden relative cursor-pointer`}
          >
            <div className="flex flex-col gap-5 relative z-10">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${getKpiIconStyle(kpi.color)} text-white shadow-sm`}>
                  <kpi.icon size={18} strokeWidth={2} />
                </div>
                <div className={`flex items-center gap-1 font-bold text-[10px] px-2 py-1 rounded-lg ${
                  kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-400'
                }`}>
                  {kpi.trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {kpi.variation}
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800 tracking-tight tabular-nums">{kpi.value}</span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{kpi.sub}</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">{kpi.label}</p>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 p-3 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
              <kpi.icon size={64} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── Area Chart — tous types d'examens ── */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <Activity size={18} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-700">Activité Diagnostic</h3>
              <p className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest mt-0.5">
                Mammographie · IRM · Écho · Biopsie · Consultation
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={evolutionData}>
              <defs>
                <linearGradient id="colorMammo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c084fc" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="mois" axisLine={false} tickLine={false}
                tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 'bold' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{
                borderRadius: '12px', border: '1px solid #f1f5f9',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: '11px', fontWeight: 'bold'
              }} />
              <Area type="monotone" dataKey="mammo"
                stroke="#c084fc" strokeWidth={2.5}
                fillOpacity={1} fill="url(#colorMammo)"
                dot={{ r: 3, strokeWidth: 0, fill: '#c084fc' }}
                activeDot={{ r: 5, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="irm"
                stroke="#818cf8" strokeWidth={1.5} fillOpacity={0} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="echo"
                stroke="#7dd3fc" strokeWidth={1.5} fillOpacity={0} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="biopsie"
                stroke="#f472b6" strokeWidth={1.5} fillOpacity={0} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="consultation"
                stroke="#34d399" strokeWidth={1.5} fillOpacity={0} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>

          {/* Légende */}
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {LEGEND_ITEMS.map(item => (
              <div key={item.n} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.c }} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{item.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BIRADS ── */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Heart size={18} className="text-rose-400" />
            </div>
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-700">Score BI-RADS</h3>
              <p className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest mt-0.5">Distribution clinique</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={biradsData} innerRadius={55} outerRadius={78} paddingAngle={5} dataKey="value" stroke="none">
                {biradsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {biradsData.map((item) => (
              <div key={item.name} className="flex flex-col p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300 truncate">{item.name}</span>
                </div>
                <span className="text-base font-black text-slate-700 tabular-nums">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Analyses Récentes — tous types ── */}
        <div className="lg:col-span-12 xl:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <ScanLine size={18} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-700">Analyses Récentes</h3>
              <p className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest mt-0.5">
                Tous types · 5 derniers examens
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentExams.map((exam, i) => (
              <div key={exam.id ?? i} onClick={() => handleSimulate(exam.patient)}
                className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-bold text-slate-300 text-[10px] group-hover:border-indigo-100 group-hover:text-indigo-400 transition-colors">
                    {exam.patient?.substring(0, 2).toUpperCase() || 'NA'}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-slate-700">{exam.patient}</p>
                    <p className="text-[9px] font-semibold text-slate-300 mt-0.5 uppercase tracking-widest">
                      {exam.type} • {exam.time}
                    </p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold tracking-wide uppercase ${getStatusStyle(exam.status)}`}>
                  {exam.birads !== '—' ? `BI-RADS ${exam.birads}` : exam.type}
                </div>
              </div>
            ))}
            {recentExams.length === 0 && (
              <div className="col-span-2 text-center py-8 text-slate-200 text-sm font-medium">
                Aucun examen récent
              </div>
            )}
          </div>
        </div>

        {/* ── Agenda ── */}
        <div className="lg:col-span-12 xl:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
              <CalendarDays size={18} className="text-sky-400" />
            </div>
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-700">Agenda du jour</h3>
              <p className="text-[9px] font-semibold text-sky-400 uppercase tracking-widest mt-0.5">
                {todayAppointments.length} rendez-vous
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {todayAppointments.map((rdv, i) => (
              <div key={i}
                className="p-3.5 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-sky-500 tabular-nums bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    {rdv.time}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-slate-700">{rdv.patient}</p>
                    <p className="text-[9px] font-semibold text-slate-300 mt-0.5 uppercase tracking-[0.1em]">{rdv.reason}</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                  <MoreHorizontal size={14} className="text-slate-300" />
                </button>
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <div className="text-center py-8 text-slate-200 text-sm font-medium">
                Aucun rendez-vous aujourd'hui
              </div>
            )}
          </div>
        </div>

        {/* ── Activité hebdomadaire ── */}
        <div className="lg:col-span-12 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <TrendingUp size={18} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-700">Activité hebdomadaire</h3>
                <p className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest mt-0.5">
                  Tous types d'examens confondus
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xl font-black tabular-nums tracking-tight text-slate-700">
                {weeklyActivityData.reduce((sum, day) => sum + (day.examens || 0), 0)}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total semaine</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyActivityData} margin={{ top: 16 }}>
              <XAxis dataKey="jour" axisLine={false} tickLine={false}
                tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 'bold' }} dy={12} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }} />
              <Bar dataKey="examens" radius={[8, 8, 2, 2]} barSize={40}>
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