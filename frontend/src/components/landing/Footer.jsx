// Dans Footer.jsx, changez temporairement :
import { Globe, Mail, Briefcase, UserCircle, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-footerBlack text-white pt-16 pb-8 font-inter">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Column 1 */}
        <div className="space-y-6">
          <div className="flex flex-col leading-none font-poppins">
            <span className="text-white font-bold text-2xl tracking-tight">Onco</span>
            <span className="text-brandPink font-light text-lg">Assist</span>
          </div>
          <p className="text-gray-400 text-sm">
            Centre clinique spécialisé dans la prise en charge complète du cancer du sein.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="p-2 bg-white/10 rounded-full hover:text-brandPink transition-colors"><Globe size={20} /></a>
            <a href="#" className="p-2 bg-white/10 rounded-full hover:text-brandPink transition-colors"><Mail size={20} /></a>
          </div>
          <p className="text-gray-600 text-[10px] uppercase tracking-wider">Fait avec soin par OncoAssist</p>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="flex items-center text-brandPink font-bold mb-6">
            <UserCircle size={20} className="mr-2" /> Pour les Patientes
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            {["Prendre rendez-vous", "Mes examens", "Mes résultats", "Mon suivi", "Questionnaires", "Télécharger mes documents"].map(link => (
              <li key={link} className="hover:text-brandPink transition-colors cursor-pointer flex items-center">
                <span className="mr-2">→</span> {link}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="flex items-center text-brandPink font-bold mb-6">
            <Briefcase size={20} className="mr-2" /> Pour les Médecins
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            {["Accéder au dossier patient", "Consulter les résultats", "Gérer les rendez-vous", "Attribuer un suivi"].map(link => (
              <li key={link} className="hover:text-brandPink transition-colors cursor-pointer flex items-center">
                <span className="mr-2">→</span> {link}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4 */}
        <div>
          <h4 className="flex items-center text-brandPink font-bold mb-6">
            <Mail size={20} className="mr-2" /> Nous Contacter
          </h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-start">
              <MapPin size={18} className="mr-3 text-brandPink flex-shrink-0" />
              <span>123 Avenue Hassan II, Rabat, Maroc</span>
            </li>
            <li className="flex items-center">
              <Mail size={18} className="mr-3 text-brandPink" />
              <span>contact@oncoassist.ma</span>
            </li>
            <li className="flex items-center">
              <Clock size={18} className="mr-3 text-brandPink" />
              <span>Lun-Ven : 8h00 - 18h00</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between text-gray-500 text-xs">
        <p>© 2026 OncoAssist. Tous droits réservés.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white">Politique de Confidentialité</a>
          <a href="#" className="hover:text-white">Conditions de Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;