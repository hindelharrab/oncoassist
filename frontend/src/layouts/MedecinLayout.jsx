import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/medecin/Sidebar';
import Topbar from '../components/medecin/Topbar';
import Breadcrumb from '../components/medecin/Breadcrumb';
import { useSettings } from '../context/SettingsContext';

export default function MedecinLayout() {
  const [patientSelectionne, setPatientSelectionne] = useState(null);
  const [recherche, setRecherche] = useState('');
  const { theme } = useSettings();

  return (
    <div className={`flex h-screen overflow-hidden text-[#1F2937] font-sans transition-colors duration-300 ${theme === 'sombre' ? 'dark bg-gray-950 text-white' : 'bg-white'}`}>
      <Sidebar
        patientSelectionne={patientSelectionne}
        setPatientSelectionne={setPatientSelectionne}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar recherche={recherche} setRecherche={setRecherche} />
        <Breadcrumb />
        <main className="flex-1 overflow-y-auto p-4 lg:p-5">
          <Outlet context={{ patientSelectionne, setPatientSelectionne, recherche }} />
        </main>
      </div>
    </div>
  );
}
