import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  let section = "Vue générale";
  let page = "OncoAssist";

  // Logic to determine section and page based on path
  if (path.includes('dashboard')) {
    section = "Vue générale";
    page = "Tableau de bord";
  } else if (path.includes('patients')) {
    section = "Vue générale";
    page = "Mes Patientes";
  } else if (path.includes('agenda')) {
    section = "Vue générale";
    page = "Agenda";
  } else if (path.includes('alertes')) {
    section = "Clinique";
    page = "Alertes";
  } else if (path.includes('settings')) {
    section = "Compte";
    page = "Paramètres";
  } else if (path.includes('dossier')) {
    section = "Clinique"; // Or "Clinique" depending on how you view it, let's stick to the user's logic
    page = "Dossier Patient";
  }

  return (
    <div className="px-6 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white">
      <span className="hover:text-gray-600 cursor-default">{section}</span>
      <span className="text-gray-300">/</span>
      <span className="text-gray-900">{page}</span>
    </div>
  );
}
