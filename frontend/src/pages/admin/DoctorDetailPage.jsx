// ── DoctorDetailPage.jsx ─────────────────────────────────────────────────────
// Même structure originale conservée
// Seules les couleurs / style visuel ont été harmonisés avec PatientDetailPage

import {
  ArrowLeft,
  Clock,
  FileText,
  Mail,
  Phone,
  Award,
  ShieldCheck,
  Calendar,
} from "lucide-react";

import { Header, Button, Badge, cn } from "../../Shared";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { mockDoctors } from "./DoctorsPage";

const NAVY = "#002855";
const RED = "#E31E24";

export default function DoctorDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const doctor =
    mockDoctors.find((d) => d.id === parseInt(id)) || mockDoctors[0];

  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const isActive = doctor.status === "Actif";

  return (
    <div className="pb-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header title={`Dr. ${doctor.lastName}`} breadcrumb="Profil Médecin" />

      <div className="px-8 py-6 space-y-6">

        {/* Retour */}
        <button
          onClick={() => navigate("/admin/doctors")}
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#002855] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          Retour au Corps Médical
        </button>

        {/* HERO */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: "rgba(0,40,85,0.05)",
            borderColor: "rgba(0,40,85,0.1)",
          }}
        >
          {/* Top */}
          <div className="p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-end">

            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative shrink-0"
            >
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden border-2 bg-slate-50"
                style={{ borderColor: "rgba(0,40,85,0.08)" }}
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.lastName}`}
                  alt=""
                  className="w-full h-full"
                />
              </div>

              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: isActive ? "#10b981" : "#cbd5e1",
                  border: "2px solid white",
                }}
              >
                <ShieldCheck size={11} className="text-white" />
              </div>
            </motion.div>

            {/* Infos */}
            <div className="flex-1 pt-2 lg:pt-0">
              <div className="flex flex-wrap gap-2 mb-3">

                <span
                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: isActive
                      ? "#eef9f4"
                      : "rgba(148,163,184,0.08)",
                    color: isActive ? "#10b981" : "#64748b",
                    border: isActive
                      ? "0.5px solid rgba(16,185,129,0.3)"
                      : "0.5px solid rgba(148,163,184,0.2)",
                  }}
                >
                  {doctor.status}
                </span>

                <span
                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(0,40,85,0.07)",
                    color: NAVY,
                  }}
                >
                  Certifié Expert
                </span>
              </div>

              <h1
                className="text-2xl font-black tracking-tight"
                style={{ color: NAVY }}
              >
                Dr. {doctor.firstName}{" "}
                <span
                  style={{
                    color: NAVY,
                    opacity: 0.4,
                    fontWeight: 600,
                  }}
                >
                  {doctor.lastName}
                </span>
              </h1>

              <div className="flex flex-wrap gap-5 mt-3">

                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <Award size={15} style={{ color: RED }} />
                  {doctor.speciality}
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <ShieldCheck size={15} style={{ color: "#10b981" }} />
                  Ordre #2024-X
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              className="text-[11px] font-black uppercase tracking-wider px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: RED }}
            >
              Modifier le Profil
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* LEFT */}
          <div className="xl:col-span-8 space-y-5">

            {/* Agenda */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-5">

                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,40,85,0.07)" }}
                >
                  <Calendar size={16} style={{ color: NAVY }} />
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Agenda de Consultation
                </h3>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {days.map((day) => {
                  const avail = doctor.availability.includes(day);

                  return (
                    <motion.div
                      key={day}
                      whileHover={{ y: -3 }}
                      className="p-4 rounded-xl border text-center transition-all"
                      style={{
                        background: avail
                          ? "rgba(0,40,85,0.04)"
                          : "rgba(148,163,184,0.06)",

                        borderColor: avail
                          ? "rgba(0,40,85,0.08)"
                          : "rgba(148,163,184,0.08)",

                        opacity: avail ? 1 : 0.5,
                      }}
                    >
                      <p
                        className="text-[9px] font-black uppercase tracking-widest mb-1.5"
                        style={{ color: avail ? NAVY : "#94a3b8" }}
                      >
                        {day}
                      </p>

                      {avail ? (
                        <>
                          <Clock
                            size={14}
                            className="mx-auto mb-1.5"
                            style={{ color: RED }}
                          />

                          <p
                            className="text-[9px] font-black"
                            style={{ color: NAVY }}
                          >
                            09h–17h
                          </p>
                        </>
                      ) : (
                        <p className="text-[9px] font-bold text-slate-400">
                          OFF
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Performance */}
              <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: NAVY }}
              >
                <div
                  className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20"
                  style={{ background: RED }}
                />

                <h4 className="text-sm font-black mb-5 text-white">
                  Performances
                </h4>

                <div className="space-y-4">
                  {[
                    {
                      label: "Satisfaction Patients",
                      val: "4.9/5",
                      pct: "98%",
                    },
                    {
                      label: "RDV ce mois",
                      val: "124",
                      pct: "80%",
                    },
                  ].map((item) => (
                    <div key={item.label}>

                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                          {item.label}
                        </span>

                        <span className="text-sm font-black text-white">
                          {item.val}
                        </span>
                      </div>

                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: item.pct }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{
                            background:
                              "linear-gradient(to right, #E31E24, #ff6b6b)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-5">
                  Coordonnées
                </h4>

                <div className="space-y-4">
                  {[
                    { Icon: Mail, value: doctor.email },
                    { Icon: Phone, value: doctor.phone },
                  ].map(({ Icon, value }) => (
                    <div
                      key={value}
                      className="flex items-center gap-3 group"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: "rgba(0,40,85,0.07)" }}
                      >
                        <Icon size={16} style={{ color: NAVY }} />
                      </div>

                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="xl:col-span-4">

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">

              <div className="flex items-center gap-3 mb-5">

                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,40,85,0.07)" }}
                >
                  <FileText size={16} style={{ color: NAVY }} />
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Documents
                </h3>
              </div>

              <div className="space-y-2">
                {[
                  {
                    name: "Contrat_Travail_2024.pdf",
                    size: "2.4 MB",
                  },
                  {
                    name: "Diplôme_Etat_Med.pdf",
                    size: "1.1 MB",
                  },
                  {
                    name: "Relevé_Activités_Mai.xlsx",
                    size: "850 KB",
                  },
                ].map((file, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3.5 rounded-xl border transition-all group cursor-pointer"
                    style={{
                      background: "rgba(0,40,85,0.02)",
                      borderColor: "rgba(0,40,85,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-3">

                      <FileText
                        size={16}
                        style={{ color: NAVY, opacity: 0.5 }}
                      />

                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate w-36">
                          {file.name}
                        </p>

                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                          {file.size}
                        </p>
                      </div>
                    </div>

                    <ArrowLeft
                      size={13}
                      className="rotate-180"
                      style={{ color: RED }}
                    />
                  </motion.div>
                ))}
              </div>

              <button
                className="w-full mt-4 py-3 border-2 border-dashed rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                style={{
                  borderColor: "rgba(0,40,85,0.12)",
                  color: NAVY,
                }}
              >
                Déposer un Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}