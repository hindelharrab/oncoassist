// ── PatientsPage.jsx ─────────────────────────────────────────────────────────
import { useState } from "react";
import { Search, Filter, UserPlus, Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Header, Button, cn } from "../../Shared";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

const NAVY = "#002855";
const RED  = "#E31E24";

export const mockPatients = [
  { id:1,  firstName:"Alice",   lastName:"Bernard",  age:34, phone:"06 12 34 56 78", cin:"AB123456", lastVisit:"2024-05-10", speciality:"Cardiologie",   doctor:"Dr. Marc Durand"    },
  { id:2,  firstName:"Bob",     lastName:"Petit",    age:45, phone:"06 23 45 67 89", cin:"CD234567", lastVisit:"2024-05-12", speciality:"Pédiatrie",     doctor:"Dr. Sophie Martin"  },
  { id:3,  firstName:"Charlie", lastName:"Grand",    age:28, phone:"06 34 56 78 90", cin:"EF345678", lastVisit:"2024-05-14", speciality:"Dermatologie",  doctor:"Dr. Jean Dupont"    },
  { id:4,  firstName:"David",   lastName:"Leroux",   age:52, phone:"06 45 67 89 01", cin:"GH456789", lastVisit:"2024-04-20", speciality:"Ophtalmologie", doctor:"Dr. Claire Lemoine" },
  { id:5,  firstName:"Emma",    lastName:"Vidal",    age:19, phone:"06 56 78 90 12", cin:"IJ567890", lastVisit:"2024-05-15", speciality:"Dentaire",      doctor:"Dr. Thomas Meyer"   },
  { id:6,  firstName:"Félix",   lastName:"Guerin",   age:61, phone:"06 67 89 01 23", cin:"KL678901", lastVisit:"2024-05-08", speciality:"Cardiologie",   doctor:"Dr. Marc Durand"    },
  { id:7,  firstName:"Gisèle",  lastName:"Moreau",   age:72, phone:"06 78 90 12 34", cin:"MN789012", lastVisit:"2024-05-11", speciality:"Généraliste",   doctor:"Dr. Luc Leroy"      },
  { id:8,  firstName:"Hugo",    lastName:"Fontaine", age:41, phone:"06 89 01 23 45", cin:"OP890123", lastVisit:"2024-05-05", speciality:"Pédiatrie",     doctor:"Dr. Sophie Martin"  },
  { id:9,  firstName:"Inès",    lastName:"Caron",    age:25, phone:"06 90 12 34 56", cin:"QR901234", lastVisit:"2024-05-16", speciality:"Dentaire",      doctor:"Dr. Thomas Meyer"   },
  { id:10, firstName:"Jules",   lastName:"Roux",     age:38, phone:"06 01 23 45 67", cin:"ST012345", lastVisit:"2024-05-13", speciality:"Dermatologie",  doctor:"Dr. Jean Dupont"    },
  { id:11, firstName:"Karine",  lastName:"Dufour",   age:47, phone:"06 11 22 33 44", cin:"UV112233", lastVisit:"2024-05-01", speciality:"Cardiologie",   doctor:"Dr. Marc Durand"    },
];

const PatientCard = ({ patient }) => {
  const navigate = useNavigate();
  const isNew = patient.id % 3 === 0;

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, scale:0.96 }}
      onClick={() => navigate(`/admin/patients/${patient.id}`)}
      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
    >
      {/* Trait de couleur en haut au hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: NAVY }}
      />

      {isNew && (
        <div
          className="absolute top-0 right-0 text-white text-[8px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-wider"
          style={{ background: RED }}
        >
          Nouveau
        </div>
      )}

      <div className="flex items-start gap-3 mb-4">
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.lastName}`}
          alt=""
          className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-black text-slate-900 dark:text-white leading-snug transition-colors duration-200"
            style={{ "--hover-color": NAVY }}
          >
            <span className="group-hover:text-[#002855] dark:group-hover:text-[#4a8fd4] transition-colors">
              {patient.firstName} {patient.lastName}
            </span>
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            #{patient.id.toString().padStart(3,"0")} · {patient.age} ans
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-4">
        <Calendar size={13} />
        <span>{patient.lastVisit}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
        <span
          className="px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wider"
          style={{ background:"rgba(0,40,85,0.07)", color:NAVY }}
        >
          {patient.speciality}
        </span>
        <ArrowRight
          size={14}
          className="text-slate-200 dark:text-slate-700 group-hover:translate-x-0.5 transition-all duration-200"
          style={{ color: undefined }}
          onMouseEnter={undefined}
        />
      </div>
    </motion.div>
  );
};

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockPatients.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.cin}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-10">
      <Header title="Registre Patients" breadcrumb="Patients" />
      <div className="px-8 py-6">

        {/* Barre de recherche + actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 w-full group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors"
              style={{ color: undefined }}
            />
            <input
              type="text"
              placeholder="Rechercher (Nom, CIN…)"
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
              style={{ "--tw-ring-color": `${NAVY}33` }}
              onFocus={(e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px ${NAVY}20`; }}
              onBlur={(e)  => { e.target.style.borderColor = "transparent"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="h-10 px-4">
              <Filter size={16} />
              <span className="text-xs font-black uppercase tracking-wider">Filtres</span>
            </Button>
            <button
              className="h-10 px-6 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: NAVY }}
            >
              <UserPlus size={16} />
              Admission
            </button>
          </div>
        </div>

        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">
          {filtered.length} patient{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
        </p>

        {/* Grille cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((p) => <PatientCard key={p.id} patient={p} />)}
          </AnimatePresence>
        </div>

        {/* Vide */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-black text-slate-700 dark:text-slate-300">Aucun résultat</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Modifiez vos critères de recherche</p>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Affichage de <span className="text-slate-900 dark:text-white">{filtered.length}</span> patients
          </p>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-[#002855] hover:text-[#002855] transition-all">
              <ChevronLeft size={18} />
            </button>
            <span
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white text-xs font-black"
              style={{ background: NAVY }}
            >
              1
            </span>
            <span className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 text-xs font-black hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all">
              2
            </span>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-[#002855] hover:text-[#002855] transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}