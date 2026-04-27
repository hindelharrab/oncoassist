import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';

export default function PatientsPage() {
  const navigate = useNavigate();
  const { setPatientSelectionne } = useOutletContext();
  const [recherche, setRecherche] = useState('');

  const patients = [
    { id: "1", nom: "Alaoui",     prenom: "Fatima",  email: "f.alaoui@gmail.com",    age: "52 ans", birads: "BI-RADS 4", status: "Actif",   statusColor: "green" },
    { id: "2", nom: "Benali",     prenom: "Nadia",   email: "n.benali@gmail.com",    age: "47 ans", birads: "BI-RADS 2", status: "Suivi",   statusColor: "blue"  },
    { id: "3", nom: "Idrissi",    prenom: "Sara",    email: "s.idrissi@gmail.com",   age: "61 ans", birads: "BI-RADS 5", status: "Alerte",  statusColor: "red"   },
    { id: "4", nom: "Moussaoui",  prenom: "Khadija", email: "k.moussaoui@gmail.com", age: "55 ans", birads: "BI-RADS 3", status: "Actif",   statusColor: "green" },
    { id: "5", nom: "Tazi",       prenom: "Amina",   email: "a.tazi@gmail.com",      age: "43 ans", birads: "BI-RADS 1", status: "Inactif", statusColor: "gray"  },
  ];

  // Filtre recherche en temps réel
  const patientsFiltres = patients.filter(p =>
    `${p.prenom} ${p.nom} ${p.email}`
      .toLowerCase()
      .includes(recherche.toLowerCase())
  );

  const handleOpenDossier = (patient) => {
    setPatientSelectionne(patient);
    navigate(`/medecin/dossier/${patient.id}/vue-ensemble`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Mes Patients</h2>
          <p className="text-gray-400 text-sm">
            Gérez et suivez les dossiers médicaux de vos patients.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par nom, email..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-100 transition-all text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Âge</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Diagnostic</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patientsFiltres.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Aucun patient trouvé pour "{recherche}"
                  </td>
                </tr>
              ) : (
                patientsFiltres.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors group">

                    {/* Nom + email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-sm flex-shrink-0">
                          {patient.prenom[0]}{patient.nom[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{patient.prenom} {patient.nom}</p>
                          <p className="text-xs text-gray-400">{patient.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Âge */}
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{patient.age}</td>

                    {/* BI-RADS */}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 ${
                        patient.birads.includes('5') ? 'bg-red-50 text-red-600 ring-red-100' :
                        patient.birads.includes('4') ? 'bg-orange-50 text-orange-600 ring-orange-100' :
                        'bg-blue-50 text-blue-600 ring-blue-100'
                      }`}>
                        {patient.birads}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          patient.statusColor === 'green' ? 'bg-green-500' :
                          patient.statusColor === 'blue'  ? 'bg-blue-500'  :
                          patient.statusColor === 'red'   ? 'bg-red-500'   : 'bg-gray-400'
                        }`}></div>
                        <span className="text-xs font-bold text-gray-600">{patient.status}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDossier(patient)}
                        className="px-4 py-2 rounded-xl border-2 border-pink-100 text-pink-500 text-xs font-bold hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all flex items-center gap-2 ml-auto"
                      >
                        Ouvrir le dossier
                        <ChevronRight size={14} />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}