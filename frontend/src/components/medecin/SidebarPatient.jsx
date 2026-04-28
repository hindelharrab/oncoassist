import { NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Stethoscope,
  ScanLine,
  Microscope,
  BarChart2,
  FileText,
  FolderOpen,
  ClipboardList
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl mx-2 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-pink-50 text-pink-600 font-bold border-l-2 border-pink-400'
          : 'text-gray-500 hover:bg-pink-50 hover:text-pink-500'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={18} className={isActive ? 'text-pink-500' : 'text-gray-400'} />
        <span className="flex-1">{children}</span>
      </>
    )}
  </NavLink>
);

export default function SidebarPatient({ patient, onRetour }) {
  const getInitials = (p) => {
    return `${p.prenom?.[0] || ''}${p.nom?.[0] || ''}`.toUpperCase();
  };

  return (
    <nav className="flex flex-col gap-1">

      {/* Bouton retour */}
      <button
        onClick={onRetour}
        className="flex items-center gap-2 px-5 py-4 text-xs text-gray-400 hover:text-pink-500 font-bold uppercase tracking-widest transition-colors mb-2"
      >
        <ArrowLeft size={14} />
        <span>Retour aux patients</span>
      </button>

      {/* Badge patient */}
      <div className="mx-3 mb-4 p-4 bg-pink-50 rounded-2xl border border-pink-100 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {getInitials(patient)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm text-gray-800 leading-tight truncate">
            {patient.prenom} {patient.nom}
          </p>
          <span className="mt-1 inline-block bg-green-100 text-green-600 rounded-full px-2 py-0.5 text-[10px] font-bold">
            Dossier actif
          </span>
        </div>
      </div>

      {/* Label section */}
      <p className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        Dossier Médical
      </p>

      <NavItem to={`/medecin/dossier/${patient.id}/vue-ensemble`} icon={Eye}>Vue d'ensemble</NavItem>
      <NavItem to={`/medecin/dossier/${patient.id}/consultation`} icon={Stethoscope}>Consultation</NavItem>
      <NavItem to={`/medecin/dossier/${patient.id}/mammographie`} icon={ScanLine}>Mammographie</NavItem>
      <NavItem to={`/medecin/dossier/${patient.id}/biopsie`} icon={Microscope}>Biopsie</NavItem>
      <NavItem to={`/medecin/dossier/${patient.id}/resultats`} icon={BarChart2}>Résultats</NavItem>
      <NavItem to={`/medecin/dossier/${patient.id}/plan-traitement`} icon={FileText}>Plan de traitement</NavItem>
      <NavItem to={`/medecin/dossier/${patient.id}/documents`} icon={FolderOpen}>Documents</NavItem>
      <NavItem to={`/medecin/dossier/${patient.id}/questionnaires`} icon={ClipboardList}>Questionnaires</NavItem>

    </nav>
  );
}