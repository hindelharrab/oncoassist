// ── pages/admin/PatientsPage.jsx ─────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import {
  Search, Filter, UserPlus, Calendar, ArrowRight,
  ChevronLeft, ChevronRight, Loader2, AlertCircle,
  RefreshCw, Users, AlertTriangle, Activity,
} from "lucide-react";
import { Header, Button, cn } from "../../Shared";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import adminPatientService, { getPhotoUrl } from "../../services/adminPatientService";

const NAVY = "#002855";
const RED  = "#E31E24";

const statutConfig = {
  NOUVELLE:     { label: "Nouvelle",     bg: "rgba(14,165,233,0.1)",  color: "#0284c7" },
  STABLE:       { label: "Stable",       bg: "rgba(16,185,129,0.1)", color: "#059669" },
  EN_SUIVI:     { label: "En suivi",     bg: "rgba(0,40,85,0.08)",   color: NAVY      },
  A_SURVEILLER: { label: "À surveiller", bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  CRITIQUE:     { label: "Critique",     bg: "rgba(227,30,36,0.1)",  color: RED       },
  ARCHIVEE:     { label: "Archivée",     bg: "rgba(100,116,139,0.1)",color: "#64748b" },
};

const PatientAvatar = ({ patient }) => {
  const photoUrl = getPhotoUrl(patient.photoProfil);
  const [err, setErr] = useState(false);
  const src = photoUrl && !err ? photoUrl
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.nom}`;
  return (
    <img src={src} onError={() => setErr(true)} alt={patient.prenom}
      className="w-11 h-11 rounded-xl object-cover bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0" />
  );
};

const PatientCard = ({ patient }) => {
  const navigate = useNavigate();
  const statut = statutConfig[patient.statut] || statutConfig.STABLE;

  return (
    <motion.div layout initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.96 }}
      onClick={() => navigate(`/admin/patients/${patient.id}`)}
      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: NAVY }} />

      {patient.statut === "CRITIQUE" && (
        <div className="absolute top-0 right-0 text-white text-[8px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-wider" style={{ background: RED }}>
          Critique
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <PatientAvatar patient={patient} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
            <span className="group-hover:text-[#002855] dark:group-hover:text-[#4a8fd4] transition-colors">
              {patient.prenom} {patient.nom}
            </span>
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">
            {patient.age != null ? `${patient.age} ans` : "—"} · {patient.email}
          </p>
        </div>
      </div>

      {patient.derniereConsultation && (
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-3">
          <Calendar size={12} />
          <span>Dernière visite : {patient.derniereConsultation}</span>
        </div>
      )}

      {patient.prochainRendezVous && (
        <div className="flex items-center gap-2 text-[11px] font-medium mb-3" style={{ color: "#059669" }}>
          <Calendar size={12} />
          <span>Prochain RDV : {patient.prochainRendezVous}</span>
        </div>
      )}

      {patient.medecinRef && (
        <p className="text-[10px] text-slate-400 font-medium mb-3 truncate">🩺 {patient.medecinRef}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
        <span className="px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wider"
          style={{ background: statut.bg, color: statut.color }}>
          {statut.label}
        </span>
        <div className="flex items-center gap-2">
          {patient.nombreRendezVous > 0 && (
            <span className="text-[9px] font-bold text-slate-400">{patient.nombreRendezVous} RDV</span>
          )}
          <ArrowRight size={14} className="text-slate-200 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
      </div>
    </div>
    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mb-4" />
    <div className="pt-3 border-t border-slate-50 flex justify-between">
      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-20" />
      <div className="h-4 w-4 bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
  </div>
);

const PAGE_SIZE = 12;

export default function PatientsPage() {
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState("");
  const [searching, setSearching]     = useState(false);
  const [page, setPage]               = useState(1);
  const [filterStatut, setFilterStatut] = useState("");
  const [showFilters, setShowFilters]   = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await adminPatientService.getAll();
      setAllPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les patients.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Debounce search
  useEffect(() => {
    if (!search.trim()) return;
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await adminPatientService.search(search.trim());
        setAllPatients(Array.isArray(data) ? data : []);
        setPage(1);
      } finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { if (search === "") fetchAll(); }, [search, fetchAll]);

  const filtered = allPatients.filter(p => !filterStatut || p.statut === filterStatut);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats rapides
  const stats = {
    total:    allPatients.length,
    critique: allPatients.filter(p => p.statut === "CRITIQUE").length,
    surveiller: allPatients.filter(p => p.statut === "A_SURVEILLER").length,
    suiviActif: allPatients.filter(p => p.statut === "EN_SUIVI").length,
  };

  return (
    <div className="pb-10">
      <Header title="Registre Patients" breadcrumb="Patients" />
      <div className="px-8 py-6">

        {/* Stats */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total patients",  value: stats.total,      color: NAVY,      icon: <Users size={18} /> },
              { label: "Critiques",       value: stats.critique,   color: RED,       icon: <AlertTriangle size={18} /> },
              { label: "À surveiller",    value: stats.surveiller, color: "#d97706", icon: <AlertCircle size={18} /> },
              { label: "En suivi actif",  value: stats.suiviActif, color: "#059669", icon: <Activity size={18} /> },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}15`, color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <span className="text-2xl font-black" style={{ color: s.color }}>{s.value}</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Barre recherche */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 w-full">
            {searching
              ? <Loader2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
              : <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            }
            <input type="text" placeholder="Rechercher (Nom, Prénom, Email…)" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
              onFocus={(e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px ${NAVY}20`; }}
              onBlur={(e)  => { e.target.style.borderColor = "transparent"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="h-10 px-4" onClick={() => setShowFilters(v => !v)}>
              <Filter size={16} />
              <span className="text-xs font-black uppercase tracking-wider">Filtres</span>
            </Button>
            <button onClick={fetchAll} className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#002855] hover:border-[#002855] transition-all" title="Rafraîchir">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
         
          </div>
        </div>

        {/* Filtres statut */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} className="overflow-hidden mb-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-wrap gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider self-center mr-2">Statut :</span>
                {[{ value: "", label: "Tous" }, ...Object.entries(statutConfig).map(([k, v]) => ({ value: k, label: v.label }))].map(opt => (
                  <button key={opt.value} onClick={() => { setFilterStatut(opt.value); setPage(1); }}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                    style={filterStatut === opt.value ? { background: NAVY, color: "#fff" } : { background: "rgba(0,40,85,0.06)", color: NAVY }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
          {loading ? "Chargement…" : `${filtered.length} patient${filtered.length > 1 ? "s" : ""} trouvé${filtered.length > 1 ? "s" : ""}`}
        </p>

        {/* Erreur */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl mb-6" style={{ background: "rgba(227,30,36,0.06)", border: "1px solid rgba(227,30,36,0.15)" }}>
            <AlertCircle size={18} style={{ color: RED }} />
            <div className="flex-1">
              <p className="text-sm font-black" style={{ color: RED }}>Erreur de chargement</p>
              <p className="text-xs text-slate-500 mt-0.5">{error}</p>
            </div>
            <button onClick={fetchAll} className="text-xs font-black px-3 py-1.5 rounded-xl" style={{ background: "rgba(227,30,36,0.1)", color: RED }}>Réessayer</button>
          </div>
        )}

        {/* Grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : <AnimatePresence>{paginated.map(p => <PatientCard key={p.id} patient={p} />)}</AnimatePresence>
          }
        </div>

        {/* Vide */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-slate-300" />
            </div>
            <p className="font-black text-slate-700 dark:text-slate-300">Aucun résultat</p>
            <p className="text-sm text-slate-400 mt-1">{search ? "Modifiez vos critères" : "Aucun patient enregistré"}</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="mt-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page <span className="text-slate-900 dark:text-white">{page}</span> / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-[#002855] hover:text-[#002855] transition-all disabled:opacity-40">
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                .map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition-all"
                    style={p === page ? { background: NAVY, color: "#fff" } : { color: "#64748b" }}>
                    {p}
                  </button>
                ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-[#002855] hover:text-[#002855] transition-all disabled:opacity-40">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}