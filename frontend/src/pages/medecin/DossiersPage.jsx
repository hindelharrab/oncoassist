import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientsAvecStatut } from '../../services/patientService';
import { 
  Search, 
  ChevronRight, 
  Folder, 
  FolderOpen,
  Filter,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  FileText,
  User
} from 'lucide-react';

// Map statut backend → frontend
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

const getStatusColor = (status) => {
  const styles = {
    NOUVEAU:        "from-blue-500 to-sky-400 text-blue-500 bg-blue-50 border-blue-100",
    STABLE:         "from-emerald-500 to-teal-400 text-emerald-500 bg-emerald-50 border-emerald-100",
    "EN SUIVI":     "from-indigo-500 to-violet-400 text-indigo-500 bg-indigo-50 border-indigo-100",
    "À SURVEILLER": "from-amber-500 to-orange-400 text-amber-500 bg-amber-50 border-amber-100",
    CRITIQUE:       "from-rose-500 to-pink-400 text-rose-500 bg-rose-50 border-rose-100",
    ARCHIVÉ:        "from-slate-500 to-slate-400 text-slate-500 bg-slate-50 border-slate-100",
  };
  return styles[status] ?? styles.NOUVEAU;
};

// Formater l'ID patient (court)
const formatPatientId = (uuid) => {
  if (!uuid) return '-----';
  return uuid.substring(0, 8).toUpperCase();
};

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

const DossierCard = ({ patient, onOpen }) => {
  const statusStyle = getStatusColor(patient.status);
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-white rounded-[2rem] border border-slate-100 p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all cursor-pointer relative overflow-hidden"
      onClick={() => onOpen(patient)}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${statusStyle.split(' ')[0]} ${statusStyle.split(' ')[1]} text-white shadow-lg`}>
          <Folder size={20} />
        </div>
        <div className={`px-2.5 py-1 rounded-lg ${statusStyle.split(' ')[2]} ${statusStyle.split(' ')[3]} ${statusStyle.split(' ')[4]} text-[9px] font-black uppercase tracking-widest`}>
          {patient.status}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 group-hover:text-pink-600 transition-colors uppercase tracking-tight">
            {patient.prenom} {patient.nom}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
            ID: {formatPatientId(patient.id)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Dernier BIRADS</p>
            <p className="text-xs font-black text-slate-700">{patient.dernierBIRADS || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Examens</p>
            <p className="text-xs font-black text-slate-700">{patient.examsCount || 0}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">
              Mise à jour: {formatDate(patient.updatedAt)}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-pink-500 group-hover:text-white transition-all">
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>

      {/* Glow effect matching status */}
      <div className={`absolute -right-12 -bottom-12 w-32 h-32 blur-3xl rounded-full opacity-5 group-hover:opacity-10 transition-opacity bg-current ${statusStyle.split(' ')[2]}`} />
    </motion.div>
  );
};

export default function DossiersPage() {
  const navigate = useNavigate();
  const { setPatientSelectionne, recherche } = useOutletContext();
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtreStatus, setFiltreStatus] = useState('TOUTES');

  useEffect(() => {
    const charger = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await getPatientsAvecStatut(user.id);
        const patientsAdaptes = data.map(p => ({
          id: p.id,
          nom: p.nom,
          prenom: p.prenom,
          email: p.email,
          age: p.age ? `${p.age} ans` : '—',
          status: mapStatut(p.statut),
          dernierBIRADS: p.dernierBIRADS ?? 'Non évalué',
          examsCount: p.nombreExamens ?? 0,
          suiviActif: p.suiviActif,
          updatedAt: new Date().toISOString(),
        }));
        setPatients(patientsAdaptes);
      } catch (err) {
        console.error('Erreur chargement dossiers:', err);
        setError('Impossible de charger les dossiers.');
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [user?.id]);

  const dossiersFiltres = useMemo(() => {
    return patients.filter(p => {
      const nomComplet = `${p.prenom} ${p.nom}`.toLowerCase();
      const matchSearch = recherche ? nomComplet.includes(recherche.toLowerCase()) : true;
      const matchStatus = filtreStatus === 'TOUTES' || p.status === filtreStatus;
      return matchSearch && matchStatus;
    });
  }, [recherche, filtreStatus, patients]);

  const handleOpenDossier = (p) => {
    // Utiliser l'ID patient (l'URL utilisera patient.id)
    setPatientSelectionne(p);
    navigate(`/medecin/dossier/${p.id}/vue-ensemble`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-pink-500" size={40} strokeWidth={1.5} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Chargement des dossiers cliniques...
        </p>
      </div>
    );
  }

  if (error && patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-[2rem] bg-rose-50 flex items-center justify-center">
          <AlertCircle size={32} className="text-rose-500" />
        </div>
        <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const criticalPatients = patients.filter(p => p.status === 'CRITIQUE');

  return (
    <div className="max-w-full mx-auto p-6 space-y-8 animate-in fade-in duration-700 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        body { background-color: #fafbfc; background-image: radial-gradient(at 0% 0%, rgba(255,255,255,0) 0, #f8fafc 100%); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Header section with context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-pink-500">
               <FolderOpen size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Dossiers Médicaux</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Base de données clinique • {patients.length} dossiers
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['TOUTES', 'NOUVEAU', 'CRITIQUE', 'À SURVEILLER', 'STABLE', 'EN SUIVI'].map(status => (
            <button
              key={status}
              onClick={() => setFiltreStatus(status)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 border ${
                filtreStatus === status
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600'
              }`}
            >
              {status === 'TOUTES' ? 'Tous les dossiers' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Dossiers (Cas Prioritaires) */}
      {criticalPatients.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-rose-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Cas Prioritaires • {criticalPatients.length}
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {criticalPatients.slice(0, 4).map(p => (
              <motion.div
                key={`pinned-${p.id}`}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleOpenDossier(p)}
                className="flex-shrink-0 w-64 p-5 rounded-[2rem] bg-gradient-to-br from-rose-50 to-white border border-rose-100 shadow-sm cursor-pointer group"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200">
                    <AlertCircle size={16} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-rose-500">Urgent</span>
                </div>
                <h3 className="text-sm font-black text-slate-800 group-hover:text-rose-600 transition-colors uppercase">
                  {p.prenom} {p.nom}
                </h3>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>BIRADS: {p.dernierBIRADS}</span>
                  <ArrowUpRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Search Result Context */}
      {recherche && (
        <div className="flex items-center gap-2 px-6 py-3 bg-pink-50/50 rounded-2xl border border-pink-100/50">
          <Search size={14} className="text-pink-400" />
          <p className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">
            Résultats pour "{recherche}" — {dossiersFiltres.length} dossier{dossiersFiltres.length > 1 ? 's' : ''} trouvé{dossiersFiltres.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Grid View */}
      {dossiersFiltres.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dossiersFiltres.map((patient) => (
            <DossierCard 
              key={patient.id} 
              patient={patient} 
              onOpen={handleOpenDossier}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
            <Search size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Aucun dossier trouvé</h3>
            <p className="text-sm font-medium text-slate-400 max-w-sm">
              Essayez de modifier vos filtres ou votre recherche pour trouver la patiente souhaitée.
            </p>
          </div>
          <button 
            onClick={() => { setFiltreStatus('TOUTES'); }}
            className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-black transition-all"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}