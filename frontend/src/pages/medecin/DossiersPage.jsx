import React, { useState, useMemo, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientsAvecStatut } from '../../services/patientService';
import { 
  Search, 
  Folder, 
  FolderOpen,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
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

const STATUS_CONFIG = {
  NOUVEAU:        { from: 'from-blue-400',    to: 'to-sky-300',      text: 'text-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-100'    },
  STABLE:         { from: 'from-emerald-400', to: 'to-teal-300',     text: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  'EN SUIVI':     { from: 'from-indigo-400',  to: 'to-violet-300',   text: 'text-indigo-500',  bg: 'bg-indigo-50',  border: 'border-indigo-100'  },
  'À SURVEILLER': { from: 'from-amber-400',   to: 'to-orange-300',   text: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
  CRITIQUE:       { from: 'from-rose-400',    to: 'to-pink-300',     text: 'text-rose-500',    bg: 'bg-rose-50',    border: 'border-rose-100'    },
  ARCHIVÉ:        { from: 'from-slate-400',   to: 'to-slate-300',    text: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-100'   },
};

const getConfig = (status) => STATUS_CONFIG[status] ?? STATUS_CONFIG.NOUVEAU;

const formatPatientId = (uuid) => {
  if (!uuid) return '-----';
  return uuid.substring(0, 8).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

// ── CARTE DOSSIER ─────────────────────────────────────────────────────────
const DossierCard = ({ patient, onOpen }) => {
  const c = getConfig(patient.status);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onOpen(patient)}
      className="group bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${c.from} ${c.to} text-white shadow-sm`}>
          <Folder size={18} />
        </div>
        <div className={`px-2.5 py-0.5 rounded-lg ${c.text} ${c.bg} ${c.border} border text-[8px] font-black uppercase tracking-widest`}>
          {patient.status}
        </div>
      </div>

      {/* Nom + ID */}
      <div className="mb-4">
        <h3 className="text-[13px] font-black text-slate-800 group-hover:text-pink-500 transition-colors uppercase tracking-tight">
          {patient.prenom} {patient.nom}
        </h3>
        <p className="text-[9px] font-bold text-slate-300 mt-0.5 uppercase tracking-widest">
          ID: {formatPatientId(patient.id)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-50">
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Dernier BIRADS</p>
          <p className="text-[11px] font-black text-slate-600">{patient.dernierBIRADS || 'N/A'}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Examens</p>
          <p className="text-[11px] font-black text-slate-600">{patient.examsCount || 0}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock size={10} />
          <span className="text-[8px] font-bold uppercase tracking-widest">
            {formatDate(patient.updatedAt)}
          </span>
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-pink-500 group-hover:text-white transition-all">
          <ArrowUpRight size={13} />
        </div>
      </div>

      {/* Glow subtil */}
      <div className={`absolute -right-10 -bottom-10 w-28 h-28 blur-3xl rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${c.bg}`} />
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PAGE DOSSIERS
// ══════════════════════════════════════════════════════════════════════════
export default function DossiersPage() {
  const navigate = useNavigate();
  const { setPatientSelectionne, recherche } = useOutletContext();
  const { user } = useAuth();

  const [patients,     setPatients]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [filtreStatus, setFiltreStatus] = useState('TOUTES');

  useEffect(() => {
    const charger = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await getPatientsAvecStatut(user.id);
        const patientsAdaptes = data.map(p => ({
          id:            p.id,
          nom:           p.nom,
          prenom:        p.prenom,
          email:         p.email,
          age:           p.age ? `${p.age} ans` : '—',
          status:        mapStatut(p.statut),
          dernierBIRADS: p.dernierBIRADS ?? 'Non évalué',
          examsCount:    p.nombreExamens ?? 0,
          suiviActif:    p.suiviActif,
          updatedAt:     new Date().toISOString(),
        }));
        setPatients(patientsAdaptes);
      } catch (err) {
        setError('Impossible de charger les dossiers.');
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [user?.id]);

  const dossiersFiltres = useMemo(() => {
    return patients.filter(p => {
      const nomComplet  = `${p.prenom} ${p.nom}`.toLowerCase();
      const matchSearch = recherche ? nomComplet.includes(recherche.toLowerCase()) : true;
      const matchStatus = filtreStatus === 'TOUTES' || p.status === filtreStatus;
      return matchSearch && matchStatus;
    });
  }, [recherche, filtreStatus, patients]);

  const handleOpenDossier = (p) => {
    setPatientSelectionne(p);
    navigate(`/medecin/dossier/${p.id}/vue-ensemble`);
  };

  const criticalPatients = patients.filter(p => p.status === 'CRITIQUE');

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-pink-400" size={36} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
        Chargement des dossiers cliniques...
      </p>
    </div>
  );

  // ── Erreur ───────────────────────────────────────────────────────────────
  if (error && patients.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-[2rem] bg-rose-50 flex items-center justify-center">
        <AlertCircle size={28} className="text-rose-400" />
      </div>
      <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest">{error}</p>
      <button onClick={() => window.location.reload()}
        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
        Réessayer
      </button>
    </div>
  );

  return (
    <div
    className="max-w-screen mx-auto px-6 pt-0 pb-6 space-y-4 animate-in fade-in duration-700 min-h-screen"
      style={{ backgroundColor: '#ffffff' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-pink-400">
              <FolderOpen size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Dossiers Médicaux</h1>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                Base de données clinique • {patients.length} dossiers
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['TOUTES', 'NOUVEAU', 'CRITIQUE', 'À SURVEILLER', 'STABLE', 'EN SUIVI'].map(status => (
            <button key={status} onClick={() => setFiltreStatus(status)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 border ${
                filtreStatus === status
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600'
              }`}>
              {status === 'TOUTES' ? 'Tous les dossiers' : status}
            </button>
          ))}
        </div>
      </div>

      {/* ── CAS PRIORITAIRES ── */}
      {criticalPatients.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-rose-400" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Cas Prioritaires • {criticalPatients.length}
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
            {criticalPatients.slice(0, 4).map(p => (
              <motion.div key={`pinned-${p.id}`} whileHover={{ scale: 1.01 }}
                onClick={() => handleOpenDossier(p)}
                className="flex-shrink-0 w-60 p-5 rounded-[1.5rem] bg-gradient-to-br from-rose-50 to-white border border-rose-100 shadow-sm cursor-pointer group">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-8 h-8 rounded-xl bg-rose-400 text-white flex items-center justify-center shadow-sm shadow-rose-100">
                    <AlertCircle size={16} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-rose-400">Urgent</span>
                </div>
                <h3 className="text-sm font-black text-slate-800 group-hover:text-rose-400 transition-colors uppercase">
                  {p.prenom} {p.nom}
                </h3>
                <div className="mt-4 flex items-center justify-between text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  <span>BIRADS: {p.dernierBIRADS}</span>
                  <ArrowUpRight size={13} className="text-rose-300 group-hover:text-rose-400 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── RÉSULTAT RECHERCHE ── */}
      {recherche && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-pink-50 rounded-2xl border border-pink-100">
          <Search size={13} className="text-pink-400" />
          <p className="text-[9px] font-bold text-pink-500 uppercase tracking-widest">
            Résultats pour "{recherche}" — {dossiersFiltres.length} dossier{dossiersFiltres.length > 1 ? 's' : ''} trouvé{dossiersFiltres.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* ── GRILLE ── */}
      {dossiersFiltres.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {dossiersFiltres.map((patient, idx) => (
            <motion.div key={patient.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.2 }}>
              <DossierCard patient={patient} onOpen={handleOpenDossier} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-20 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200">
            <Search size={36} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Aucun dossier trouvé</h3>
            <p className="text-sm font-medium text-slate-400 max-w-sm">
              Essayez de modifier vos filtres ou votre recherche pour trouver la patiente souhaitée.
            </p>
          </div>
          <button onClick={() => setFiltreStatus('TOUTES')}
            className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all">
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}