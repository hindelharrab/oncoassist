import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientsAvecStatut } from '../../services/patientService';
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
  User,
  Loader2
} from 'lucide-react';

// Map des statuts backend → labels affichés
const mapStatut = (statut) => {
  const map = {
    NOUVELLE:     'NOUVEAU',
    STABLE:       'STABLE',
    EN_SUIVI:     'EN SUIVI',
    A_SURVEILLER: 'À SURVEILLER',
    CRITIQUE:     'CRITIQUE',
    ARCHIVEE:     'ARCHIVÉ',
  };
  return map[statut] ?? 'NOUVEAU';
};

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
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtreStatus, setFiltreStatus] = useState('TOUTES');
  const [patientSelectionneLocal, setPatientSelectionneLocal] = useState(null);

  // Charger les patients depuis le backend
  useEffect(() => {
    const charger = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await getPatientsAvecStatut(user.id);

        // Adapter les données backend au format attendu par l'UI
        const patientsAdaptes = data.map(p => ({
          id: p.id,
          nom: p.nom,
          prenom: p.prenom,
          email: p.email,
          age: p.age ? `${p.age} ans` : '—',
          status: mapStatut(p.statut),
          lastRdv: '-', // sera rempli plus tard quand RDV implémenté
          telephone: p.telephone ?? '—',
          dateNaissance: p.dateNaissance ?? '—',
          adresse: p.adresse ?? '—',
          personneConfiance: p.personneConfiance ?? '—',
          examsCount: p.nombreExamens ?? 0,
          historyCount: 0,
          treatmentPlansCount: 0,
          followUpsCount: p.suiviActif ? 1 : 0,
          dernierBIRADS: p.dernierBIRADS ?? 'Non évalué',
          suiviActif: p.suiviActif,
        }));

        setPatients(patientsAdaptes);
        setPatientSelectionneLocal(patientsAdaptes[0] || null);
      } catch (err) {
        setError('Impossible de charger les patientes.');
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [user?.id]);

  // Filtrage
  const patientsFiltres = useMemo(() => {
    return patients.filter(p => {
      const nomComplet = `${p.prenom} ${p.nom}`.toLowerCase();
      const matchSearch = recherche ? nomComplet.includes(recherche.toLowerCase()) : true;
      const matchStatus = filtreStatus === 'TOUTES' || p.status === filtreStatus;
      return matchSearch && matchStatus;
    });
  }, [recherche, filtreStatus, patients]);

  // Stats calculées dynamiquement
  const stats = useMemo(() => ({
    total:     patients.length,
    nouveau:   patients.filter(p => p.status === 'NOUVEAU').length,
    critique:  patients.filter(p => p.status === 'CRITIQUE').length,
    actifs:    patients.filter(p => p.status !== 'ARCHIVÉ').length,
  }), [patients]);

  const handleOpenDossier = (p) => {
    setPatientSelectionne(p);
    navigate(`/medecin/dossier/${p.id}/vue-ensemble`);
  };

  // État chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-pink-400" size={32} />
      </div>
    );
  }

  // État erreur
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-2.5 animate-in fade-in duration-500">
      
      {/* STATS - Tighter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard title="Total Patientes" value={stats.total} icon={Users} colorClass="bg-gray-100 text-gray-600" />
        <StatCard title="Nouveautés" value={stats.nouveau} icon={UserPlus} colorClass="bg-blue-50 text-blue-500" />
        <StatCard title="Cas Critiques" value={stats.critique} icon={AlertCircle} colorClass="bg-rose-50 text-rose-600" />
        <StatCard title="Dossiers Actifs" value={stats.actifs} icon={FolderCheck} colorClass="bg-emerald-50 text-emerald-600" />
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
                        { icon: MapPin, label: "Adresse", value: patientSelectionneLocal.adresse },
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