import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Bell, Search, Command, Sun, Moon,
  LayoutDashboard, Users, UserRound, UserCog,
  Stethoscope, Calendar, Settings, LogOut,
  Activity, ChevronRight, X, ArrowRight,
  Home, Heart,
} from "lucide-react";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const NAVY = "#002855";
const RED  = "#E31E24";

// ─── THEME ───────────────────────────────────────────────────────────────────
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    toast.success(`Mode ${next === "light" ? "clair" : "sombre"} activé`, {
      icon: next === "light" ? "☀️" : "🌙",
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

// ─── BADGE ───────────────────────────────────────────────────────────────────
export function Badge({ children, variant = "default", className }) {
  const variants = {
    default: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    success: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    error:   "bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400",
    info:    "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400",
    primary: `text-white`,
  };

  const primaryStyle =
    variant === "primary" ? { background: NAVY } : {};

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
        variants[variant],
        className
      )}
      style={primaryStyle}
    >
      {children}
    </span>
  );
}

// ─── BUTTON ──────────────────────────────────────────────────────────────────
export function Button({ children, className, variant = "primary", size = "md", style, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:   { className: "text-white shadow-lg", style: { background: NAVY } },
    danger:    { className: "text-white shadow-lg", style: { background: RED  } },
    secondary: { className: "bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white", style: {} },
    outline:   { className: "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800", style: {} },
    ghost:     { className: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800", style: {} },
  };

  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  const v = variants[variant] || variants.primary;

  return (
    <button
      className={cn(base, v.className, sizes[size], className)}
      style={{ ...v.style, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── INPUT ───────────────────────────────────────────────────────────────────
export function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl",
          "outline-none transition-all",
          "text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500",
          "focus:border-[#002855] focus:ring-2 focus:ring-[#002855]/20",
          error && "border-red-400 focus:ring-red-400/30 focus:border-red-400",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, className }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={cn(
              "relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800",
              className
            )}
          >
            {/* Barre de couleur en haut */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${NAVY}, ${RED})` }} />

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────────
// ─── HEADER ──────────────────────────────────────────────────────────────────
export function Header({ title, breadcrumb }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery]     = useState("");
  const [open,  setOpen]      = useState(false);

  const pages = [
    { label:"Tableau de bord", path:"/admin/dashboard",   keywords:["dashboard","tableau","bord","accueil"] },
    { label:"Patients",        path:"/admin/patients",     keywords:["patient","patients","registre","dossier"] },
    { label:"Médecins",        path:"/admin/doctors",      keywords:["médecin","médecins","doctor","praticien"] },
    { label:"Secrétaires",     path:"/admin/secretaries",  keywords:["secrétaire","secrétaires","administratif","personnel"] },
    { label:"Spécialités",     path:"/admin/specialities", keywords:["spécialité","spécialités","service","services","clinique"] },
    { label:"Planning",        path:"/admin/planning",     keywords:["planning","agenda","rdv","rendez-vous","calendrier"] },
    { label:"Mon Profil",      path:"/admin/profile",      keywords:["profil","paramètre","paramètres","compte","sécurité","settings"] },
  ];

  const results = query.trim().length === 0 ? [] : pages.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.label.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.includes(q))
    );
  });

  const handleSelect = (path) => {
    navigate(path);
    setQuery("");
    setOpen(false);
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30 transition-colors duration-300">
      <div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
          <span>Admin</span>
          {breadcrumb && (
            <>
              <ChevronRight size={10} />
              <span style={{ color: RED }}>{breadcrumb}</span>
            </>
          )}
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">

        {/* Barre de recherche avec dropdown */}
        <div className="relative hidden lg:block">
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 gap-2 transition-all group focus-within:border-[#002855] focus-within:ring-2 focus-within:ring-[#002855]/10">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher une page…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              className="bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-52"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setOpen(false); }}
                className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
              >
                <X size={13} />
              </button>
            )}
            {!query && (
              <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-200/70 dark:bg-slate-700 rounded text-[9px] font-bold text-slate-400 shrink-0">
                <Command size={9} />K
              </kbd>
            )}
          </div>

          {/* Dropdown résultats */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity:0, y:6, scale:0.98 }}
                animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, y:4, scale:0.98 }}
                transition={{ duration:0.15 }}
                className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden z-50"
              >
                {/* Résultats filtrés */}
                {results.length > 0 ? (
                  <div className="py-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2">
                      Résultats
                    </p>
                    {results.map((r) => (
                      <button
                        key={r.path}
                        onMouseDown={() => handleSelect(r.path)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left group"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background:"rgba(0,40,85,0.07)" }}
                        >
                          <Search size={13} style={{ color:"#002855" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-[#002855] transition-colors">
                            {r.label}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">{r.path}</p>
                        </div>
                        <ArrowRight size={13} className="text-slate-300 group-hover:text-[#002855] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : query.trim().length > 0 ? (
                  /* Aucun résultat */
                  <div className="py-8 text-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                      style={{ background:"rgba(0,40,85,0.06)" }}
                    >
                      <Search size={16} style={{ color:"#002855" }} />
                    </div>
                    <p className="text-xs font-black text-slate-500">Aucune page trouvée</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Essayez "patients" ou "planning"</p>
                  </div>
                ) : (
                  /* Suggestions par défaut */
                  <div className="py-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2">
                      Navigation rapide
                    </p>
                    {pages.map((r) => (
                      <button
                        key={r.path}
                        onMouseDown={() => handleSelect(r.path)}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left group"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background:"rgba(0,40,85,0.05)" }}
                        >
                          <ArrowRight size={11} style={{ color:"#002855" }} />
                        </div>
                        <p className="text-xs font-black text-slate-600 dark:text-slate-400 group-hover:text-[#002855] transition-colors">
                          {r.label}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bouton thème */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-all hover:border-[#002855] hover:text-[#002855]"
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* Cloche */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-all hover:border-[#002855] hover:text-[#002855]">
          <Bell size={17} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white dark:border-slate-950"
            style={{ background: RED }}
          />
        </button>
      </div>
    </header>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord",  path: "/admin/dashboard"    },
  { icon: Users,           label: "Patients",          path: "/admin/patients"     },
  { icon: UserRound,       label: "Médecins",           path: "/admin/doctors"      },
  { icon: UserCog,         label: "Secrétaires",        path: "/admin/secretaries"  },
  { icon: Stethoscope,     label: "Spécialités",        path: "/admin/specialities" },
  { icon: Calendar,        label: "Planning",           path: "/admin/planning"     },
];

export function Sidebar() {
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    toast.success("Déconnecté avec succès");
    navigate("/admin/login");
  };

  return (
    <aside
      className="w-60 h-screen fixed left-0 top-0 flex flex-col z-40 border-r border-slate-100 dark:border-slate-800 transition-colors duration-300"
      style={{ background: NAVY }}
    >
      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Icône maison + pip cœur — identique au login */}
          <div className="relative w-10 h-10 flex items-center justify-center rounded-2xl shadow-lg flex-shrink-0"
            style={{ background: RED }}
          >
            <Home className="text-white" size={20} strokeWidth={2.5} />
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
              style={{ background: NAVY }}
            >
              <Heart className="text-white w-2.5 h-2.5 fill-current" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-white font-black text-xl tracking-tighter leading-none">
              HOME<span style={{ color: RED }}>CARE</span>
            </span>
            <div className="h-[2px] my-1.5 w-full rounded-full" style={{ background: RED }} />
            <span className="text-white/40 font-bold text-[9px] tracking-[0.4em] uppercase leading-none">
              Administration
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[9px] font-black uppercase tracking-[0.15em] text-white/25 mb-3">
          Navigation
        </p>

        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive
                  ? "text-white"
                  : "text-white/45 hover:bg-white/8 hover:text-white/80"
              )}
              style={isActive ? { background: RED } : {}}
            >
              <item.icon
                size={17}
                className={isActive ? "text-white" : "text-white/40 group-hover:text-white/70"}
              />
              <span className={cn("text-xs tracking-tight", isActive ? "font-black" : "font-semibold")}>
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Bottom : profil + déconnexion ── */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
              isActive ? "text-white" : "text-white/50 hover:bg-white/8 hover:text-white/80"
            )
          }
          style={({ isActive }) => (isActive ? { background: RED } : {})}
        >
          <div className="relative shrink-0">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan"
              alt="Admin"
              className="w-8 h-8 rounded-lg"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: "#10b981", borderColor: NAVY }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white/90 truncate">Hassan Admin</p>
            <p className="text-[9px] font-semibold text-white/35 uppercase tracking-wider">Directeur</p>
          </div>
          <Settings size={14} className="text-white/25" />
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/35 transition-all hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut size={16} />
          <span className="text-xs font-semibold">Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}

// ─── LAYOUT ──────────────────────────────────────────────────────────────────
export function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      <main className="pl-60 min-h-screen">
        {/* Halo décoratif navy discret */}
        <div
          className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/3"
          style={{ background: "rgba(0,40,85,0.06)" }}
        />
        <div
          className="fixed bottom-0 left-60 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none translate-y-1/3"
          style={{ background: "rgba(227,30,36,0.05)" }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}