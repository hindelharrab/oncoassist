import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="w-full h-screen bg-white flex overflow-hidden font-sans select-none">
      {/* --- CÔTÉ GAUCHE (1/2) --- */}
      <div className="hidden md:flex md:w-1/2 h-full relative bg-gray-100">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800')` }}
        />
        <div 
          className="absolute inset-0 z-10" 
          style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.4) 0%, rgba(31, 41, 55, 0.8) 100%)' }}
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 text-white">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-pink-300 font-bold tracking-widest uppercase text-xs mb-4"
          >
            À vos côtés chaque jour
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold leading-tight mb-6"
          >
            Une prise en charge humaine et technologique.
          </motion.h2>
          <div className="w-12 h-1 bg-pink-500 mb-8"></div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-200 text-sm leading-relaxed max-w-xs"
          >
            Votre espace sécurisé vous permet de consulter vos examens, gérer vos rendez-vous et communiquer avec l'équipe médicale.
          </motion.p>
        </div>
      </div>

      {/* --- CÔTÉ DROIT (1/2) --- */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center px-10 md:px-24 bg-white relative">
        <div className="max-w-sm w-full">
          {/* LOGO */}
          <div className="mb-12 flex items-center gap-4">
            <div className="relative w-10 h-10">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <path d="M50 20C35 20 25 35 25 50C25 65 35 80 50 95C65 80 75 65 75 50C75 35 65 20 50 20Z" stroke="#EC4899" strokeWidth="8"/>
                <path d="M35 88L50 68L65 88" stroke="#EC4899" strokeWidth="8"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 font-bold text-[10px] tracking-[0.4em] uppercase leading-none">ONCO</span>
              <div className="h-[2px] bg-[#EC4899] my-1.5 w-full"></div>
              <span className="text-[#1F2937] font-black text-xl tracking-tighter uppercase leading-none">ASSIST</span>
            </div>
          </div>

          <h1 className="text-3xl font-black text-gray-800 mb-2 uppercase tracking-tighter">Connexion</h1>
          <p className="text-gray-500 text-sm mb-8">Heureux de vous revoir. Veuillez saisir vos identifiants.</p>
          
          <form className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Adresse E-mail</label>
              <input 
                type="email" 
                placeholder="nom@exemple.com" 
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-pink-300 outline-none transition-colors text-sm font-medium"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mot de passe</label>
                <Link to="#" className="text-[10px] font-bold text-pink-500 uppercase tracking-widest hover:text-pink-600">Oublié ?</Link>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-pink-300 outline-none transition-colors text-sm font-medium"
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input type="checkbox" id="remember" className="w-4 h-4 border-2 border-gray-200 rounded accent-pink-500 cursor-pointer"/>
              <label htmlFor="remember" className="text-xs text-gray-500 cursor-pointer">Rester connecté pendant 30 jours</label>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01, backgroundColor: "#1f2937" }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 bg-black text-white font-black rounded-lg shadow-xl text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
            >
              Se Connecter 
              <ArrowRight size={16} strokeWidth={3} />
            </motion.button>
          </form>

          <p className="mt-10 text-center text-xs text-gray-400 font-medium">
            Vous n'avez pas de compte ? <Link to="#" className="text-pink-500 font-bold hover:underline">Créer un profil patient</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
