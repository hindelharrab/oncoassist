import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
   const navigate = useNavigate();

  const navLinks = [
    { name: 'Accueil', href: '#' },
    { name: 'Nos Services', href: '#' },
    { name: 'La Clinique', href: '#' },
    { name: 'Notre Équipe', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          
          {/* --- LOGO AVEC MOUVEMENT INCROYABLE --- */}
          <div className="flex items-center gap-4 cursor-pointer group">
            <div className="relative">
              {/* Effet de lueur derrière le ruban */}
              <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-pink-300 blur-2xl rounded-full"
              />
              
              <motion.svg 
                width="50" height="50" viewBox="0 0 100 100" 
                fill="none" xmlns="http://www.w3.org/2000/svg"
                animate={{ y: [0, -5, 0] }} // Effet de flottaison
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Le Ruban Rose - Animation de tracé */}
                <motion.path 
                  d="M50 20C35 20 25 35 25 50C25 65 35 80 50 95C65 80 75 65 75 50C75 35 65 20 50 20Z" 
                  stroke="#EC4899" strokeWidth="6" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path 
                  d="M35 88L50 68L65 88" 
                  stroke="#EC4899" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
                
                {/* Effet de brillance (Shine) qui passe sur le ruban */}
                <motion.circle 
                  cx="0" cy="0" r="15" fill="white" filter="blur(10px)" opacity="0.4"
                  animate={{ 
                    x: [20, 80], 
                    y: [20, 80],
                    opacity: [0, 0.4, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              </motion.svg>
            </div>
            
            {/* Texte stylisé */}
            <div className="flex flex-col">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-gray-400 font-bold text-[11px] tracking-[0.4em] uppercase leading-none"
              >
                ONCO
              </motion.span>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.5, duration: 1 }}
                className="h-[2px] bg-[#EC4899] my-2"
              />
              <motion.span 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="text-[#1F2937] font-black text-3xl tracking-tighter uppercase leading-none"
              >
                ASSIST
              </motion.span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <a 
                key={link.name} href={link.href} 
                className="text-gray-500 hover:text-[#EC4899] font-bold text-xs uppercase tracking-widest transition-all"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <motion.button
  onClick={() => navigate('/login')}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-8 py-3 bg-[#e8208eea] text-white font-black rounded-lg shadow-xl text-sm uppercase tracking-widest flex items-center gap-2"
>
  Se connecter <ArrowRight size={16} />
</motion.button>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#EC4899]">
              {isOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-gray-100 p-8 space-y-6 shadow-2xl"
        >
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="block text-2xl font-black text-gray-800 uppercase tracking-tighter">
              {link.name}
            </a>
          ))}
          <div className="flex flex-col gap-4">
            <button className="w-full py-4 border-2 border-pink-200 text-[#EC4899] font-bold rounded-xl">Connexion</button>
            <button className="w-full py-4 bg-black text-white font-black rounded-xl uppercase tracking-widest">S'inscrire</button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;