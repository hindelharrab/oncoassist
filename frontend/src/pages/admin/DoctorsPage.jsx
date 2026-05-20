import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Stethoscope,
  Edit3,
} from "lucide-react";

import {
  Header,
  Button,
  cn,
  Modal,
  Input,
} from "../../Shared";

import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NAVY = "#002855";
const RED = "#E31E24";

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────

export const mockDoctors = [
  {
    id: 1,
    firstName: "Marc",
    lastName: "Durand",
    speciality: "Cardiologie",
    phone: "06 12 34 56 78",
    email: "m.durand@clinique.fr",
    status: "Actif",
    availability: ["Lun", "Mar", "Mer", "Ven"],
  },
  {
    id: 2,
    firstName: "Sophie",
    lastName: "Martin",
    speciality: "Pédiatrie",
    phone: "06 23 45 67 89",
    email: "s.martin@clinique.fr",
    status: "Actif",
    availability: ["Lun", "Mer", "Jeu"],
  },
  {
    id: 3,
    firstName: "Jean",
    lastName: "Dupont",
    speciality: "Dermatologie",
    phone: "06 34 56 78 90",
    email: "j.dupont@clinique.fr",
    status: "Actif",
    availability: ["Mar", "Ven", "Sam"],
  },
  {
    id: 4,
    firstName: "Luc",
    lastName: "Leroy",
    speciality: "Généraliste",
    phone: "06 44 55 66 77",
    email: "l.leroy@clinique.fr",
    status: "Inactif",
    availability: ["Mer", "Jeu", "Ven"],
  },
];

// ─────────────────────────────────────────────────────────────
// DOCTOR CARD
// ─────────────────────────────────────────────────────────────

const DoctorCard = ({ doctor, onEdit }) => {
  const navigate = useNavigate();

  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const isActive = doctor.status === "Actif";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="
        bg-white dark:bg-slate-900
        rounded-2xl
        border border-slate-100 dark:border-slate-800
        overflow-hidden
        hover:border-slate-200 dark:hover:border-slate-700
        transition-all
      "
    >
      {/* HEADER */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.lastName}`}
              alt=""
              className="
                w-14 h-14
                rounded-2xl
                bg-slate-100 dark:bg-slate-800
                border border-slate-100 dark:border-slate-700
              "
            />

            <div>

              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Dr. {doctor.firstName} {doctor.lastName}
              </h3>

              <div
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg mt-2"
                style={{
                  background: "rgba(0,40,85,0.06)",
                  color: NAVY,
                }}
              >
                <Stethoscope size={11} />

                <span className="text-[9px] font-black uppercase tracking-wider">
                  {doctor.speciality}
                </span>
              </div>

            </div>
          </div>

          <div
            className="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider"
            style={{
              background: isActive
                ? "rgba(5,150,105,0.08)"
                : "rgba(148,163,184,0.12)",
              color: isActive ? "#059669" : "#64748b",
            }}
          >
            {doctor.status}
          </div>

        </div>
      </div>

      {/* BODY */}
      <div className="p-5 space-y-5">

        {/* DISPONIBILITÉ */}
        <div>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Disponibilité
          </p>

          <div className="grid grid-cols-6 gap-1">

            {days.map((day) => {
              const active = doctor.availability.includes(day);

              return (
                <div
                  key={day}
                  className={cn(
                    "h-8 rounded-lg flex items-center justify-center text-[9px] font-black border transition-all",
                    active
                      ? "text-white border-transparent"
                      : "bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800"
                  )}
                  style={{
                    background: active ? NAVY : undefined,
                  }}
                >
                  {day}
                </div>
              );
            })}

          </div>
        </div>

        {/* CONTACT */}
        <div className="space-y-2">

          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">

            <Mail size={14} className="text-slate-400" />

            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
              {doctor.email}
            </span>

          </div>

          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">

            <Phone size={14} className="text-slate-400" />

            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {doctor.phone}
            </span>

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3">

          <div
            className="rounded-xl p-3"
            style={{
              background: "rgba(0,40,85,0.04)",
            }}
          >
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
              Consultations
            </p>

            <p
              className="text-lg font-black mt-1"
              style={{ color: NAVY }}
            >
              124
            </p>
          </div>

          <div
            className="rounded-xl p-3"
            style={{
              background: "rgba(227,30,36,0.05)",
            }}
          >
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
              Satisfaction
            </p>

            <p
              className="text-lg font-black mt-1"
              style={{ color: RED }}
            >
              98%
            </p>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">

        <button
          onClick={() => navigate(`/admin/doctors/${doctor.id}`)}
          className="
            flex-1
            h-10
            rounded-xl
            text-white
            text-[10px]
            font-black
            uppercase
            tracking-wider
            transition-all
            hover:opacity-90
          "
          style={{ background: NAVY }}
        >
          Voir Profil
        </button>

        <button
          onClick={() => onEdit(doctor)}
          className="
            w-10 h-10
            rounded-xl
            border border-slate-200 dark:border-slate-700
            flex items-center justify-center
            text-slate-400
            hover:text-slate-700 dark:hover:text-white
            transition-all
          "
        >
          <Edit3 size={15} />
        </button>

      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────
// ADD MODAL
// ─────────────────────────────────────────────────────────────

const AddDoctorModal = ({ isOpen, onClose }) => {

  const specs = [
    "Cardiologie",
    "Pédiatrie",
    "Dermatologie",
    "Ophtalmologie",
    "Généraliste",
    "Oncologie",
  ];

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    speciality: "",
  });

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.success("Médecin ajouté avec succès !");

    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      speciality: "",
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter un Médecin"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-2 gap-4">

          <Input
            label="Prénom"
            value={form.firstName}
            onChange={set("firstName")}
            required
          />

          <Input
            label="Nom"
            value={form.lastName}
            onChange={set("lastName")}
            required
          />

        </div>

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={set("email")}
          required
        />

        <Input
          label="Téléphone"
          value={form.phone}
          onChange={set("phone")}
          required
        />

        <div>

          <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
            Spécialité
          </label>

          <select
            value={form.speciality}
            onChange={set("speciality")}
            required
            className="
              w-full
              px-4 py-2.5
              bg-slate-50 dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              rounded-xl
              text-sm
              text-slate-900 dark:text-white
              outline-none
              focus:ring-2 focus:ring-[#002855]/10
              focus:border-[#002855]
              transition-all
            "
          >
            <option value="">Sélectionner…</option>

            {specs.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

        </div>

        <div className="flex gap-3 justify-end pt-2">

          <Button
            variant="outline"
            type="button"
            onClick={onClose}
          >
            Annuler
          </Button>

          <Button type="submit">
            Confirmer
          </Button>

        </div>

      </form>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────

export default function DoctorsPage() {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState("");

  const filtered = mockDoctors.filter((d) =>
    `${d.firstName} ${d.lastName} ${d.speciality}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="pb-10">

      <Header title="Corps Médical" breadcrumb="Médecins" />

      <div className="px-8 py-6">

        {/* TOOLBAR */}
        <div
          className="
            flex flex-col lg:flex-row items-center gap-4 mb-6
            bg-white dark:bg-slate-900
            p-4
            rounded-2xl
            border border-slate-100 dark:border-slate-800
          "
        >

          {/* SEARCH */}
          <div className="relative flex-1 w-full group">

            <Search
              size={16}
              className="
                absolute left-3.5 top-1/2 -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              placeholder="Nom ou spécialité…"
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                pl-10 pr-4 py-2.5
                bg-slate-50 dark:bg-slate-800
                rounded-xl
                text-sm
                outline-none
                border border-transparent
                focus:border-[#002855]
                focus:ring-2 focus:ring-[#002855]/10
                text-slate-900 dark:text-white
                placeholder:text-slate-400
                transition-all
              "
            />

          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 w-full lg:w-auto">

            <Button
              variant="outline"
              className="h-10 px-4"
            >
              <Filter size={16} />
            </Button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="
                flex items-center justify-center gap-2
                h-10 px-6
                rounded-xl
                text-white
                text-[10px]
                font-black
                uppercase
                tracking-wider
                transition-all
                hover:opacity-90
              "
              style={{ background: NAVY }}
            >
              <Plus size={16} />
              Ajouter
            </button>

          </div>

        </div>

        {/* STATS */}
        <div className="flex items-center gap-2 mb-6">

          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {filtered.length} praticien
            {filtered.length > 1 ? "s" : ""}
          </span>

          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            {
              filtered.filter((d) => d.status === "Actif")
                .length
            }{" "}
            actifs
          </span>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">

          <AnimatePresence>

            {filtered.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onEdit={(d) => console.log("edit", d)}
              />
            ))}

          </AnimatePresence>

        </div>

      </div>

      <AddDoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
}