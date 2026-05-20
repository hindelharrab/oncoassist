import { useState } from "react";
import { UserPlus, Edit3, Trash2, Mail, Phone, Search } from "lucide-react";
import { Header, Button, Badge, cn } from "../../Shared";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NAVY = "#002855";
const RED  = "#E31E24";

// ✅ export nommé — utilisé par SecretaryDetailPage
export const mockSecretaries = [
  {
    id: 1,
    firstName: "Julie",   lastName: "Dumas",
    email: "j.dumas@clinique.fr",   phone: "06 99 88 77 66",
    doctorName: "Dr. Marc Durand",  speciality: "Cardiologie",
    status: "Actif", shift:"Matin",  experience:"3 ans", joined:"Jan 2022",
    rdvGeres:210, satisfaction:97, dossiers:145,
  },
  {
    id: 2,
    firstName: "Thomas", lastName: "Lefebvre",
    email: "t.lefebvre@clinique.fr", phone: "06 88 77 66 55",
    doctorName: "Dr. Sophie Martin", speciality: "Pédiatrie",
    status: "Actif", shift:"Après-midi", experience:"2 ans", joined:"Mar 2022",
    rdvGeres:185, satisfaction:95, dossiers:130,
  },
  {
    id: 3,
    firstName: "Sarah",  lastName: "Petit",
    email: "s.petit@clinique.fr",    phone: "06 77 66 55 44",
    doctorName: "Dr. Luc Leroy",     speciality: "Généraliste",
    status: "Inactif", shift:"Journée", experience:"1 an", joined:"Sep 2023",
    rdvGeres:162, satisfaction:93, dossiers:118,
  },
];

export default function SecretariesPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = mockSecretaries.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="pb-10 bg-slate-50 dark:bg-slate-950">
      <Header title="Personnel Administratif" breadcrumb="Secrétaires" />
      <div className="px-8 py-6">

        {/* Toolbar */}
        <div
          className="flex flex-col md:flex-row items-center gap-4 mb-6 p-4 rounded-2xl border shadow-sm bg-white dark:bg-slate-900"
          style={{ borderColor:"rgba(0,40,85,0.08)" }}
        >
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un membre…"
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-transparent transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              onFocus={(e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px ${NAVY}20`; }}
              onBlur={(e)  => { e.target.style.borderColor = "transparent"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <button
            className="h-10 px-6 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
            style={{ background: NAVY }}
          >
            <UserPlus size={16} /> Ajouter un Membre
          </button>
        </div>

        {/* Table */}
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden"
          style={{ borderColor:"rgba(0,40,85,0.08)" }}
        >
          {/* Header table */}
          <div
            className="hidden md:grid grid-cols-[1.5fr_2fr_1.5fr_1fr_100px] px-6 py-3.5 border-b"
            style={{ background:"rgba(0,40,85,0.03)", borderColor:"rgba(0,40,85,0.08)" }}
          >
            {["Membre","Coordonnées","Médecin Référent","Statut","Actions"].map((h, i) => (
              <span
                key={h}
                className={cn("text-[9px] font-black uppercase tracking-widest text-slate-400", i === 4 && "text-right")}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((sec, idx) => (
              <motion.div
                key={sec.id}
                initial={{ opacity:0, x:-12 }}
                animate={{ opacity:1, x:0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/admin/secretaries/${sec.id}`)}
                className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr_1.5fr_1fr_100px] items-center gap-4 px-6 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                {/* User */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sec.lastName}`}
                      alt=""
                      className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                      style={{ borderColor:"rgba(0,40,85,0.08)" }}
                    />
                    <div
                      className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900"
                      style={{ background: sec.status === "Actif" ? "#10b981" : "#94a3b8" }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-black" style={{ color:NAVY }}>
                      {sec.firstName} {sec.lastName}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ID #{sec.id}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Mail size={12} style={{ color:NAVY, opacity:0.5 }} />
                    {sec.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Phone size={12} style={{ color:NAVY, opacity:0.5 }} />
                    {sec.phone}
                  </div>
                </div>

                {/* Doctor */}
                <div>
                  <div
                    className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800/50"
                    style={{ borderColor:"rgba(0,40,85,0.08)" }}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sec.doctorName}`}
                      alt=""
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700"
                    />
                    <div>
                      <p className="text-[10px] font-black leading-tight" style={{ color:NAVY }}>{sec.doctorName}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{sec.speciality}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{
                      background: sec.status === "Actif" ? "rgba(16,185,129,0.08)" : "rgba(227,30,36,0.08)",
                      color:      sec.status === "Actif" ? "#059669" : RED,
                    }}
                  >
                    {sec.status}
                  </span>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => toast.success("Modification en cours…")}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                    style={{ background:"rgba(0,40,85,0.05)", color:NAVY }}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => toast.error("Suppression annulée (demo)")}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                    style={{ background:"rgba(227,30,36,0.08)", color:RED }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}