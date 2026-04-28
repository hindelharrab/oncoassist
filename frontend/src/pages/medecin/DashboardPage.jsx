import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Calendar,
  Bell,
  ClipboardList,
  UserCheck,
  ChevronRight
} from 'lucide-react';

const StatCard = ({ title, value, badge, icon: Icon, color, delay }) => {
  const badgeColor =
    badge.includes('+') ? 'green' :
    badge.includes('attente') ? 'yellow' :
    badge.includes('dépassé') || badge.includes('Urgent') ? 'red' : 'purple';

  const badgeClasses = {
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-500',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon size={20} strokeWidth={2.5} className="text-gray-400" />
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${badgeClasses[badgeColor]}`}>
          {badge}
        </span>
      </div>
      <div className="text-3xl font-black text-gray-800">{value}</div>
      <div className="text-xs text-gray-400 font-medium uppercase tracking-tight mt-1">{title}</div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const { setPatientSelectionne } = useOutletContext();
  const { user } = useAuth();

  const prenomMedecin = user?.prenom ?? 'Docteur';

  const handleSimulate = () => {
    setPatientSelectionne({
      id: "1",
      nom: "Alaoui",
      prenom: "Fatima",
      email: "f.alaoui@gmail.com"
    });
  };

  const appointments = [
    { time: "09:00", name: "Fatima Alaoui",    reason: "Consultation initiale",   status: "Planifié",   statusColor: "bg-blue-50 text-blue-600"   },
    { time: "10:30", name: "Nadia Benali",     reason: "Résultats mammographie",  status: "Effectué",   statusColor: "bg-green-50 text-green-600"  },
    { time: "14:00", name: "Sara Idrissi",     reason: "Suivi traitement",        status: "En attente", statusColor: "bg-yellow-50 text-yellow-600"},
    { time: "15:30", name: "Khadija Moussaoui",reason: "Biopsie",                 status: "Planifié",   statusColor: "bg-blue-50 text-blue-600"   },
  ];

  const lastPatients = [
    { name: "Fatima Alaoui",     lastVisit: "Il y a 2h",   dot: "bg-green-500",  initials: "FA", color: "bg-pink-100 text-pink-600"   },
    { name: "Nadia Benali",      lastVisit: "Hier",        dot: "bg-green-500",  initials: "NB", color: "bg-blue-100 text-blue-600"   },
    { name: "Sara Idrissi",      lastVisit: "24/04/2026",  dot: "bg-red-500",    initials: "SI", color: "bg-orange-100 text-orange-600"},
    { name: "Khadija Moussaoui", lastVisit: "22/04/2026",  dot: "bg-orange-500", initials: "KM", color: "bg-purple-100 text-purple-600"},
    { name: "Amina Tazi",        lastVisit: "20/04/2026",  dot: "bg-green-500",  initials: "AT", color: "bg-teal-100 text-teal-600"   },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-800">
            Bonjour, Dr. {prenomMedecin} 👋
          </h2>
          <p className="text-gray-400 text-sm">
            Voici un aperçu de votre activité aujourd'hui.
          </p>
        </div>
        <button
          onClick={handleSimulate}
          className="bg-pink-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-pink-600 transition-all shadow-md shadow-pink-100"
        >
          <UserCheck size={18} />
          Simuler sélection patient
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Patients actifs"  value="24" badge="+3 ce mois"    icon={Users}         color="border-pink-400"   delay={0.1} />
        <StatCard title="RDV aujourd'hui"  value="8"  badge="2 en attente"  icon={Calendar}      color="border-blue-400"   delay={0.2} />
        <StatCard title="Alertes actives"  value="3"  badge="Suivi dépassé" icon={Bell}          color="border-orange-400" delay={0.3} />
        <StatCard title="Questionnaires"   value="12" badge="5 non lus"     icon={ClipboardList} color="border-purple-400" delay={0.4} />
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Rendez-vous */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-lg text-gray-800">Rendez-vous d'aujourd'hui</h3>
            <button className="text-pink-500 text-sm font-bold hover:underline flex items-center gap-1">
              Voir tout <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-1">
            {appointments.map((apt, idx) => (
              <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-xl transition-colors">
                <span className="w-14 bg-pink-50 text-pink-600 font-black text-[10px] text-center py-1.5 rounded-lg shrink-0">
                  {apt.time}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  idx === 0 ? 'bg-blue-100 text-blue-600' :
                  idx === 1 ? 'bg-orange-100 text-orange-600' :
                  idx === 2 ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                }`}>
                  {apt.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{apt.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tight">{apt.reason}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${apt.statusColor}`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Derniers patients */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-black text-lg text-gray-800 mb-6">Mes derniers patients</h3>
          <div className="space-y-4">
            {lastPatients.map((p, idx) => (
              <div key={idx} className="flex items-center gap-3 py-1 group cursor-pointer">
                <div className={`w-10 h-10 rounded-full ${p.color} flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110`}>
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-pink-500 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-gray-400">{p.lastVisit}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${p.dot}`}></div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-xs font-bold hover:border-pink-200 hover:text-pink-400 transition-all">
            Explorer tous les patients
          </button>
        </div>

      </div>
    </motion.div>
  );
}