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

/* ── Stat Card avec bordure colorée gauche ── */
const StatCard = ({ title, value, icon: Icon, accentColor, trend }) => (
  <div
    className="bg-white rounded-xl border border-slate-100 shadow-md flex items-center gap-4 overflow-hidden transition-shadow hover:shadow-lg"
    style={{ borderLeft: `4px solid ${accentColor}` }}
  >
    {/* icône */}
    <div className="pl-5 py-5 shrink-0">
      <div
        className="w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accentColor}18` }}
      >
        <Icon size={18} style={{ color: accentColor }} />
      </div>
    </div>
    {/* texte */}
    <div className="min-w-0 py-5 pr-5">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        {trend && (
          <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);

/* ── Status Badge légèrement plus foncé ── */
const StatusBadge = ({ status }) => {
  const styles = {
    NOUVEAU:        "bg-blue-100 text-blue-700 border-blue-200",
    STABLE:         "bg-emerald-100 text-emerald-700 border-emerald-200",
    "EN SUIVI":     "bg-indigo-100 text-indigo-700 border-indigo-200",
    "À SURVEILLER": "bg-amber-100 text-amber-700 border-amber-200",
    CRITIQUE:       "bg-rose-100 text-rose-700 border-rose-200",
    ARCHIVÉ:        "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${styles[status] ?? styles.NOUVEAU}`}>
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
          lastRdv: '-',
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

  const patientsFiltres = useMemo(() => {
    return patients.filter(p => {
      const nomComplet = `${p.prenom} ${p.nom}`.toLowerCase();
      const matchSearch = recherche ? nomComplet.includes(recherche.toLowerCase()) : true;
      const matchStatus = filtreStatus === 'TOUTES' || p.status === filtreStatus;
      return matchSearch && matchStatus;
    });
  }, [recherche, filtreStatus, patients]);

  const stats = useMemo(() => ({
    total:    patients.length,
    nouveau:  patients.filter(p => p.status === 'NOUVEAU').length,
    critique: patients.filter(p => p.status === 'CRITIQUE').length,
    actifs:   patients.filter(p => p.status !== 'ARCHIVÉ').length,
  }), [patients]);

  const handleOpenDossier = (p) => {
    setPatientSelectionne(p);
    navigate(`/medecin/dossier/${p.id}/vue-ensemble`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-pink-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="max-w-full mx-auto space-y-4 animate-in fade-in duration-500 min-h-screen p-6"
      style={{ backgroundColor: '#fafbfc' }}
    >

      {/* ── STAT CARDS avec bordure gauche colorée ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patientes"
          value={stats.total}
          icon={Users}
          accentColor="#6366f1"   /* indigo */
        />
        <StatCard
          title="Nouveautés"
          value={stats.nouveau}
          icon={UserPlus}
          accentColor="#38bdf8"   /* sky */
          trend="+2 ce mois"
        />
        <StatCard
          title="Cas Critiques"
          value={stats.critique}
          icon={AlertCircle}
          accentColor="#f43f5e"   /* rose */
        />
        <StatCard
          title="Dossiers Actifs"
          value={stats.actifs}
          icon={FolderCheck}
          accentColor="#10b981"   /* emerald */
        />
      </div>

      {/* ── FILTRES ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['TOUTES', 'NOUVEAU', 'CRITIQUE', 'À SURVEILLER', 'STABLE', 'EN SUIVI'].map(status => (
          <button
            key={status}
            onClick={() => setFiltreStatus(status)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
              filtreStatus === status
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {status === 'TOUTES' ? 'Toutes les patientes' : status}
          </button>
        ))}
      </div>

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* TABLE (gauche) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-100 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                  style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc' }}
                >
                  <th className="px-5 py-3.5 w-[45%]">Patiente</th>
                  <th className="px-3 py-3.5 w-[15%]">Âge</th>
                  <th className="px-3 py-3.5 w-[20%]">Dernier RDV</th>
                  <th className="px-5 py-3.5 w-[20%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patientsFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <User size={18} className="text-slate-200" />
                        <p className="text-slate-400 text-sm font-bold">Aucun dossier trouvé</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  patientsFiltres.map((p, idx) => (
                    <tr
                      key={p.id}
                      onClick={() => {
                        setPatientSelectionneLocal(p);
                        setPatientSelectionne(p);
                      }}
                      className={`group cursor-pointer transition-all ${
                        patientSelectionneLocal?.id === p.id
                          ? 'bg-pink-50/60'
                          : 'hover:bg-slate-50/60'
                      }`}
                      style={{
                        borderBottom: idx < patientsFiltres.length - 1
                          ? '1px solid #f1f5f9'
                          : 'none',
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 font-bold text-[11px] shrink-0 shadow-sm">
                            {p.photo ? (
                              <img src={p.photo} alt={p.nom} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <span className="uppercase">{p.prenom[0]}{p.nom[0]}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-[13px] font-black text-slate-900 tracking-tight truncate leading-none">
                                {p.prenom} {p.nom}
                              </h4>
                              <StatusBadge status={p.status} />
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium truncate leading-none">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-[12px] font-bold text-slate-600">{p.age}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-[12px] font-bold text-slate-400">{p.lastRdv}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenDossier(p); }}
                          className="px-3 py-1.5 bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest rounded-lg hover:bg-black transition-all shadow-sm"
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

        {/* DÉTAIL (droite) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          {patientSelectionneLocal && (
            <AnimatePresence mode="wait">
              <motion.div
                key={patientSelectionneLocal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {/* Header + Infos */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-md overflow-hidden">
                  {/* header */}
                  <div
                    className="p-4 flex items-center gap-4 border-b"
                    style={{ borderColor: '#f1f5f9', backgroundColor: '#fafbfc' }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 text-slate-800 flex items-center justify-center font-black text-base shadow-sm shrink-0">
                      {patientSelectionneLocal.prenom[0]}{patientSelectionneLocal.nom[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate leading-none mb-1.5">
                        {patientSelectionneLocal.prenom} {patientSelectionneLocal.nom}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dossier Actif</span>
                      </div>
                    </div>
                  </div>

                  {/* infos grid */}
                  <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-4">
                    {[
                      { icon: Activity,  label: "Âge",       value: patientSelectionneLocal.age },
                      { icon: Calendar,  label: "Naissance", value: patientSelectionneLocal.dateNaissance },
                      { icon: Mail,      label: "Email",     value: patientSelectionneLocal.email,             full: true },
                      { icon: Phone,     label: "Mobile",    value: patientSelectionneLocal.telephone },
                      { icon: MapPin,    label: "Adresse",   value: patientSelectionneLocal.adresse },
                      { icon: Users,     label: "Urgence",   value: patientSelectionneLocal.personneConfiance, full: true },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start gap-3 ${item.full ? 'col-span-2' : 'col-span-1'}`}>
                        <div className="p-1.5 bg-slate-50 rounded text-slate-400 shrink-0">
                          <item.icon size={13} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                          <p className="text-[12px] font-bold text-slate-800 truncate leading-none">{item.value}</p>
                        </div>
                      </div>
                    ))}
                    <div
                      className="col-span-2 flex items-center gap-2 pt-3 mt-1"
                      style={{ borderTop: '1px solid #f1f5f9' }}
                    >
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Statut :</span>
                      <StatusBadge status={patientSelectionneLocal.status} />
                    </div>
                  </div>
                </div>

                {/* Résumé Médical */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-md p-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">Résumé Médical</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Examens", val: patientSelectionneLocal.examsCount,         col: "text-sky-600" },
                      { label: "Plans",   val: patientSelectionneLocal.treatmentPlansCount, col: "text-indigo-600" },
                      { label: "Suivis",  val: patientSelectionneLocal.followUpsCount,      col: "text-emerald-600" },
                      { label: "Antéc.",  val: patientSelectionneLocal.historyCount,        col: "text-rose-500" },
                    ].map((m, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{m.label}</span>
                        <span className={`text-2xl font-black ${m.col}`}>{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-md p-4 space-y-2">
                  <button
                    onClick={() => handleOpenDossier(patientSelectionneLocal)}
                    className="w-full py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <FolderCheck size={14} /> Ouvrir le dossier
                  </button>
                  <button className="w-full py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2">
                    <Calendar size={14} /> Demander un rdv
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}