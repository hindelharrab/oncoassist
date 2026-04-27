import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { forgotPassword } from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex overflow-hidden font-sans select-none">

      {/* CÔTÉ GAUCHE */}
      <div className="hidden md:flex md:w-1/2 h-full relative bg-gray-100">
        <div className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800')` }}
        />
        <div className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.4) 0%, rgba(31, 41, 55, 0.8) 100%)' }}
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 text-white">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-pink-300 font-bold tracking-widest uppercase text-xs mb-4">
            À vos côtés chaque jour
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }} className="text-4xl font-bold leading-tight mb-6">
            Récupérez l'accès à votre espace santé.
          </motion.h2>
          <div className="w-12 h-1 bg-pink-500 mb-8"></div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }} className="text-gray-200 text-sm leading-relaxed max-w-xs">
            Entrez votre adresse e-mail et nous vous enverrons un lien pour créer votre nouveau mot de passe.
          </motion.p>
        </div>
      </div>

      {/* CÔTÉ DROIT */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center px-10 md:px-24 bg-white relative">
        <div className="max-w-sm w-full">

          {/* Logo */}
          <div className="mb-12 flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
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

          {!submitted ? (
            <>
              <h1 className="text-3xl font-black text-gray-800 mb-2 uppercase tracking-tighter">Réinitialisation</h1>
              <p className="text-gray-500 text-sm mb-8">Saisissez votre e-mail pour recevoir le lien de secours.</p>

              {/* Erreur */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <span className="text-red-500 text-sm">⚠</span>
                  <p className="text-red-500 text-xs font-medium">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Adresse E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-pink-300 outline-none transition-colors text-sm font-medium"
                  />
                </div>

                <motion.button
                  whileHover={!loading ? { scale: 1.01, backgroundColor: "#1f2937" } : {}}
                  whileTap={!loading ? { scale: 0.99 } : {}}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-black text-white font-black rounded-lg shadow-xl text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>Envoyer le Lien <ArrowRight size={16} strokeWidth={3} /></>
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="text-[#EC4899]" size={32} />
              </div>
              <h1 className="text-2xl font-black text-gray-800 mb-4 uppercase tracking-tighter">Vérifiez vos e-mails</h1>
              <p className="text-gray-500 text-sm mb-8">
                Nous avons envoyé un lien de réinitialisation à{' '}
                <span className="font-bold text-gray-800">{email}</span>.
              </p>

              {error && (
                <p className="text-red-500 text-xs font-medium mb-4">{error}</p>
              )}

              <button
                onClick={handleResend}
                disabled={loading}
                className="text-pink-500 font-bold hover:underline text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Renvoyer le lien'}
              </button>
            </motion.div>
          )}

          <div className="mt-10">
            <Link to="/login"
              className="flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-[#EC4899] transition-colors">
              <ArrowLeft size={14} />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;