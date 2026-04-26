import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };
  const navigate = useNavigate();
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="relative h-screen w-full flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1600')` }}
      />
      
      {/* White Gradient Overlay */}
      <div 
        className="absolute inset-0 z-10"
        style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.92) 50%, rgba(255,255,255,0.3) 100%)' }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-20">
        <motion.div 
          className="max-w-xl flex flex-col items-start"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Service Labels */}
          <div className="space-y-1 mb-6">
            <motion.p variants={itemVariants} className="font-poppins font-bold text-brandPink text-[18px] uppercase tracking-widest">
              Dépistage
            </motion.p>
            <motion.p variants={itemVariants} className="font-inter font-medium text-brandBlue text-[18px]">
              Diagnostic
            </motion.p>
            <motion.p variants={itemVariants} className="font-poppins font-light italic text-gray-500 text-[18px]">
              Suivi
            </motion.p>
          </div>

          {/* Title */}
          <motion.h1 variants={itemVariants} className="font-poppins font-extrabold text-5xl md:text-6xl text-gray-800 leading-tight mb-4">
            Votre santé,<br />notre priorité
          </motion.h1>

          {/* Description */}
          <motion.p variants={itemVariants} className="font-inter text-gray-500 text-lg mb-8">
            Centre spécialisé dans la prise en charge du cancer du sein.
          </motion.p>

          {/* Button */}
          <motion.button 
           onClick={() => navigate('/login')}
            variants={itemVariants}
            whileHover={{ scale: 1.05, backgroundColor: '#f472b6' }}
            animate={{ 
              scale: [1, 1.03, 1],
              transition: { duration: 2, repeat: Infinity }
            }}
            className="flex items-center space-x-2 bg-softPink text-white font-bold py-4 px-8 rounded-full shadow-lg transition-colors group"
          >
            <span>COMMENCER MAINTENANT</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
          
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;