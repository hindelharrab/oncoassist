import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  Users, 
  UserPlus, 
  AlertCircle, 
  FolderCheck,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Stethoscope,
  ClipboardList,
  FileText,
  Calendar,
  Activity,
  User
} from 'lucide-react';

const patientsData = [
  { 
    id: "1", nom: "Alaoui", prenom: "Fatima", email: "f.alaoui@gmail.com", age: "52 ans", 
    status: "CRITIQUE", lastRdv: "24/04/2026", 
    telephone: "06 12 34 56 78", dateNaissance: "12/03/1974", 
    adresse: "Quartier Gauthier, Casablanca", personneConfiance: "M. Alaoui (Époux)",
    examsCount: 8, historyCount: 3, treatmentPlansCount: 2, followUpsCount: 12
  },
  { 
    id: "2", nom: "Benali", prenom: "Nadia", email: "n.benali@gmail.com", age: "47 ans", 
    status: "STABLE", lastRdv: "15/04/2026",
    telephone: "06 23 45 67 89", dateNaissance: "05/08/1978", 
    adresse: "Hay Riad, Rabat", personneConfiance: "Mme Benali (Sœur)",
    examsCount: 4, historyCount: 1, treatmentPlansCount: 1, followUpsCount: 5
  },
  { 
    id: "3", nom: "Idrissi", prenom: "Sara", email: "s.idrissi@gmail.com", age: "61 ans", 
    status: "À SURVEILLER", lastRdv: "26/04/2026",
    telephone: "06 34 56 78 90", dateNaissance: "22/11/1964", 
    adresse: "Hivernage, Marrakech", personneConfiance: "Dr. Idrissi (Fils)",
    examsCount: 12, historyCount: 5, treatmentPlansCount: 3, followUpsCount: 18
  },
  { 
    id: "4", nom: "Moussaoui", prenom: "Khadija", email: "k.moussaoui@gmail.com", age: "55 ans", 
    status: "EN SUIVI", lastRdv: "20/04/2026",
    telephone: "06 45 67 89 01", dateNaissance: "18/06/1970", 
    adresse: "Agdal, Rabat", personneConfiance: "Mme Moussaoui (Fille)",
    examsCount: 6, historyCount: 2, treatmentPlansCount: 1, followUpsCount: 8
  },
  { 
    id: "5", nom: "Tazi", prenom: "Amina", email: "a.tazi@gmail.com", age: "43 ans", 
    status: "NOUVEAU", lastRdv: "-",
    telephone: "06 56 78 90 12", dateNaissance: "30/01/1983", 
    adresse: "Tanger City Center, Tanger", personneConfiance: "M. Tazi (Père)",
    examsCount: 1, historyCount: 0, treatmentPlansCount: 1, followUpsCount: 2
  },
];

const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs flex items-center gap-3 transition-all">
    <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${colorClass} shrink-0`}>
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest truncate mb-0.5">{title}</p>
      <div className="flex items-baseline gap-1.5">
        <p className="text-lg font-black text-gray-900 leading-none">{value}</p>
        {trend && <span className="text-[7px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded shadow-xs">{trend}</span>}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    NOUVEAU: "bg-blue-50 text-blue-600 border-blue-100",
    STABLE: "bg-emerald-50 text-emerald-600 border-emerald-100",
    "EN SUIVI": "bg-indigo-50 text-indigo-600 border-indigo-100",
    "À SURVEILLER": "bg-amber-50 text-amber-600 border-amber-100",
    CRITIQUE: "bg-rose-50 text-rose-600 border-rose-100",
    ARCHIVÉ: "bg-gray-50 text-gray-400 border-gray-200",
  };
  return (
    <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function PatientsPage() {
  const navigate = useNavigate();
  const { setPatientSelectionne, recherche } = useOutletContext();
  const [filtreStatus, setFiltreStatus] = useState('TOUTES');
  const [patientSelectionneLocal, setPatientSelectionneLocal] = useState(patientsData[0] || null);

  const patientsFiltres = useMemo(() => {
    return patientsData.filter(p => {
      const nomComplet = `${p.prenom} ${p.nom}`.toLowerCase();
      const matchSearch = recherche ? nomComplet.includes(recherche.toLowerCase()) : true;
      const matchStatus = filtreStatus === 'TOUTES' || p.status === filtreStatus;
      return matchSearch && matchStatus;
    });
  }, [recherche, filtreStatus]);

  const handleOpenDossier = (p) => {
    setPatientSelectionne(p);
    navigate(`/medecin/dossier/${p.id}/vue-ensemble`);
  };

  return (
    <div className="max-w-full mx-auto space-y-2.5 animate-in fade-in duration-500">
      
      {/* STATS - Tighter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard title="Total Patientes" value="1,247" icon={Users} colorClass="bg-gray-100 text-gray-600" trend="+3.2%" />
        <StatCard title="Nouveautés" value="86" icon={UserPlus} colorClass="bg-blue-50 text-blue-500" trend="+12.4%" />
        <StatCard title="Cas Critiques" value="12" icon={AlertCircle} colorClass="bg-rose-50 text-rose-600" />
        <StatCard title="Dossiers Actifs" value="1,192" icon={FolderCheck} colorClass="bg-emerald-50 text-emerald-600" />
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['TOUTES', 'NOUVEAU', 'CRITIQUE', 'À SURVEILLER', 'STABLE', 'EN SUIVI'].map(status => (
          <button 
            key={status}
            onClick={() => setFiltreStatus(status)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
              filtreStatus === status 
                ? 'bg-black text-white border-black shadow-md' 
                : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
            }`}
          >
            {status === 'TOUTES' ? 'Toutes les patientes' : status}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
        
        {/* LIST SECTION (LEFT) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/20">
                  <th className="px-4 py-3 w-[45%]">Patiente</th>
                  <th className="px-3 py-3 w-[15%]">Âge</th>
                  <th className="px-3 py-3 w-[20%]">Dernier RDV</th>
                  <th className="px-4 py-3 w-[20%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {patientsFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                       <div className="flex flex-col items-center gap-2">
                          <User size={18} className="text-gray-200" />
                          <p className="text-gray-900 text-sm font-bold">Aucun dossier trouvé</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  patientsFiltres.map(p => (
                    <tr 
                      key={p.id} 
                      onClick={() => {
                        setPatientSelectionneLocal(p);
                        setPatientSelectionne(p);
                      }}
                      className={`group cursor-pointer transition-all border-b border-gray-50 last:border-0 ${patientSelectionneLocal?.id === p.id ? 'bg-pink-50/50' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-900 font-bold text-[11px] shrink-0 overflow-hidden shadow-xs">
                            {p.photo ? (
                              <img src={p.photo} alt={p.nom} className="w-full h-full object-cover" />
                            ) : (
                              <span className="uppercase">{p.prenom[0]}{p.nom[0]}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-[13px] font-black text-gray-900 tracking-tight truncate leading-none">{p.prenom} {p.nom}</h4>
                              <StatusBadge status={p.status} />
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium truncate leading-none">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[12px] font-bold text-gray-600">{p.age}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[12px] font-bold text-gray-600">{p.lastRdv}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenDossier(p); }}
                          className="px-3 py-1.5 bg-gray-900 text-white text-[10px] uppercase font-black tracking-widest rounded-lg hover:bg-black transition-all"
                        >
                          Dossier
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAIL SECTION (RIGHT) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          {patientSelectionneLocal && (
            <AnimatePresence mode="wait">
              <motion.div
                key={patientSelectionneLocal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  {/* Unified Header & Infos Card */}
                  <div className="bg-pink-50/50 rounded-xl border border-pink-100/50 shadow-sm overflow-hidden">
                    {/* Header Section */}
                    <div className="p-4 flex items-center gap-4 border-b border-pink-100/30 bg-white/10">
                      <div className="w-11 h-11 rounded-lg bg-white border border-pink-100/50 text-gray-900 flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                        {patientSelectionneLocal.prenom[0]}{patientSelectionneLocal.nom[0]}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-1.5">{patientSelectionneLocal.prenom} {patientSelectionneLocal.nom}</h3>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dossier Actif</span>
                        </div>
                      </div>
                    </div>

                    {/* Infos Grid Section */}
                    <div className="p-4 pt-5 grid grid-cols-2 gap-x-4 gap-y-4">
                      {[
                        { icon: Activity, label: "Âge", value: patientSelectionneLocal.age },
                        { icon: Calendar, label: "Naissance", value: patientSelectionneLocal.dateNaissance },
                        { icon: Mail, label: "Email", value: patientSelectionneLocal.email, full: true },
                        { icon: Phone, label: "Mobile", value: patientSelectionneLocal.telephone },
                        { icon: MapPin, label: "Ville", value: "Casablanca" },
                        { icon: Users, label: "Urgence", value: patientSelectionneLocal.personneConfiance, full: true },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-start gap-3 ${item.full ? 'col-span-2' : 'col-span-1'}`}>
                          <div className="p-1.5 bg-white/60 rounded text-gray-400 shrink-0">
                            <item.icon size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                            <p className="text-[12px] font-bold text-gray-800 truncate leading-none">{item.value}</p>
                          </div>
                        </div>
                      ))}
                      <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-pink-100/30 mt-1">
                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Statut :</span>
                         <StatusBadge status={patientSelectionneLocal.status} />
                      </div>
                    </div>
                  </div>

                  {/* Medical Summary Card */}
                  <div className="bg-pink-50/50 rounded-xl border border-pink-100/50 shadow-sm p-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3">Résumé Médical</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Examens", val: patientSelectionneLocal.examsCount, col: "text-blue-600" },
                        { label: "Plans", val: patientSelectionneLocal.treatmentPlansCount, col: "text-indigo-600" },
                        { label: "Suivis", val: patientSelectionneLocal.followUpsCount, col: "text-emerald-600" },
                        { label: "Antéc.", val: patientSelectionneLocal.historyCount, col: "text-rose-600" },
                      ].map((m, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{m.label}</span>
                          <span className={`text-xl font-black ${m.col}`}>{m.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Card */}
                  <div className="bg-pink-50/50 rounded-xl border border-pink-100/50 shadow-sm p-4 space-y-2">
                    <button 
                      onClick={() => handleOpenDossier(patientSelectionneLocal)}
                      className="w-full py-2.5 bg-black text-white font-black rounded-lg text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <FolderCheck size={14} /> Ouvrir le dossier
                    </button>
                    <button className="w-full py-2.5 bg-black text-white font-black rounded-lg text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2">
                      <Calendar size={14} /> Demander un rdv
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}
