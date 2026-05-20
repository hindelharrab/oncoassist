import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Moon, 
  Sun,
  Home,
  Activity,
  Heart
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../../Shared";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (email === "admin@medplus.ma" && password === "admin123") {
        localStorage.setItem("adminAuthenticated", "true");
        toast.success("Authentification réussie");
        navigate("/admin/dashboard");
      } else {
        toast.error("Identifiants incorrects");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="w-full h-screen bg-white flex overflow-hidden font-sans select-none">

      {/* ── Section Gauche: Identité Visuelle ── */}
      <div className="hidden md:flex md:w-1/2 h-full relative bg-[#002855]">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center grayscale opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url('/src/assets/images/home_care_admin_bg_1779196487346.png')` }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(135deg, rgba(0, 40, 85, 0.95) 0%, rgba(227, 30, 36, 0.1) 100%)' }}
        />
        
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-20 text-white">
          {/* Logo Unique et Officiel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="relative w-12 h-12 flex items-center justify-center bg-[#E31E24] rounded-2xl shadow-2xl">
               <Home className="text-white" size={26} strokeWidth={2.5} />
               <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#002855] rounded-full flex items-center justify-center border-2 border-white">
                  <Heart className="text-white w-2.5 h-2.5 fill-current" />
               </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-2xl tracking-tighter leading-none">
                HOME<span className="text-[#E31E24]">CARE</span>
              </span>
              <div className="h-[2px] bg-[#E31E24] my-2 w-full" />
              <span className="text-white/40 font-bold text-[9px] tracking-[0.4em] uppercase leading-none">
                Administration
              </span>
            </div>
          </motion.div>

          {/* Message de bienvenue Admin */}
          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-6">
                <ShieldCheck size={12} className="text-[#E31E24]" />
                <span className="text-white/60 text-[9px] font-black uppercase tracking-widest">Système de Gouvernance v4.2</span>
              </div>
              
              <h2 className="text-4xl font-light leading-tight text-white mb-6">
                Pilotage Stratégique & <br />
                <span className="font-bold">Efficacité Opérationnelle.</span>
              </h2>
              
              <div className="w-16 h-1 bg-[#E31E24]" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/50 text-sm leading-relaxed font-medium"
            >
              Accédez à vos outils de gestion de staff, d'affectation des soins et d'analyse de données cliniques.
            </motion.p>
          </div>
        </div>
      </div>

      {/* ── Section Droite: Formulaire (Blanc Pur) ── */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center px-8 md:px-24 bg-white dark:bg-zinc-950 transition-colors relative">
        
        

        <div className="max-w-[340px] w-full">
          {/* Header épuré pour desktop, logo mobile visible uniquement sur petits écrans */}
          <div className="lg:hidden mb-12 flex items-center gap-4 justify-center">
            <div className="relative w-10 h-10 flex items-center justify-center bg-[#E31E24] rounded-xl shadow-lg shadow-[#E31E24]/20">
               <Home className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[#002855] dark:text-white font-black text-xl tracking-tighter">
              HOME<span className="text-[#E31E24]">CARE</span>
            </span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-2">
              Authentification
            </h1>
            <p className="text-zinc-400 text-xs font-medium">
              Heureux de vous revoir. Veuillez saisir vos identifiants.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Erreur visuelle discrète si besoin */}
            <div className="space-y-4">
              <div className="group space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 group-focus-within:text-[#002855] transition-colors">
                  Identifiant Admin
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="admin@homecare.ma"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl focus:border-[#002855] dark:focus:border-[#E31E24] outline-none transition-all text-sm font-semibold dark:text-white shadow-sm"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-200" size={16} />
                </div>
              </div>

              <div className="group space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-focus-within:text-[#002855] transition-colors">
                    Mot de passe
                  </label>
                  <a href="#" className="text-[10px] font-bold text-[#E31E24] uppercase tracking-widest hover:brightness-110">
                    Oublié ?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl focus:border-[#002855] dark:focus:border-[#E31E24] outline-none transition-all text-sm font-semibold dark:text-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-200 hover:text-zinc-400"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 py-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 border border-zinc-200 dark:border-zinc-800 rounded accent-[#002855] cursor-pointer"
              />
              <label htmlFor="remember" className="text-[11px] font-medium text-zinc-400 cursor-pointer">
                Maintenir la session active
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 bg-[#002855] text-white font-black rounded-xl shadow-xl shadow-[#002855]/10 text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Connecter <ArrowRight size={16} strokeWidth={3} />
                </>
              )}
            </motion.button>
          </form>

          {/* Secure Badge */}
          <div className="mt-16 flex justify-center">
             <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-zinc-50 dark:border-zinc-900 bg-white dark:bg-zinc-900 shadow-sm">
                <ShieldCheck className="text-[#E31E24]" size={14} />
                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">
                  Terminal Sécurisé AES-256
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
