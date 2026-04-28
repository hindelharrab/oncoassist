import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/medecin/Sidebar';
import Topbar from '../components/medecin/Topbar';

export default function MedecinLayout() {
  const [patientSelectionne, setPatientSelectionne] = useState(null);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-[#1F2937]">
      <Sidebar
        patientSelectionne={patientSelectionne}
        setPatientSelectionne={setPatientSelectionne}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB]">
          <Outlet context={{ patientSelectionne, setPatientSelectionne }} />
        </main>
      </div>
    </div>
  );
}