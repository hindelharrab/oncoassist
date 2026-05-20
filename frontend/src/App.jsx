import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ── Pages publiques ──
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ── Espace Médecin ──
import MedecinLayout from './layouts/MedecinLayout';
import DashboardPage from './pages/medecin/DashboardPage';
import PatientsPage from './pages/medecin/PatientsPage';
import AgendaPage from './pages/medecin/AgendaPage';
import AlertesPage from './pages/medecin/AlertesPage';
import SettingsPage from './pages/medecin/SettingsPage';
import QuestionnairesPage from './pages/medecin/QuestionnairesPage';
import PatientQuestionnairePage from './pages/medecin/PatientQuestionnairePage';
import DossiersPage from './pages/medecin/DossiersPage';
import VueEnsemblePage from './pages/medecin/dossier/VueEnsemblePage';
import ConsultationPage from './pages/medecin/dossier/ConsultationPage';
import EchographiePage from './pages/medecin/dossier/EchographiePage';
import IRMPage from './pages/medecin/dossier/IRMPage';
import PlanTraitementPage from './pages/medecin/dossier/PlanTraitementPage';
import MammographiePage from './pages/medecin/dossier/MammographiePage';
import DocumentsPage from './pages/medecin/dossier/DocumentsPage';
import BiopsiePage from './pages/medecin/dossier/BiopsiePage';

// ── Espace Secrétaire ──
import SecretaireLayout from './pages/secretaire/SecretaireLayout';
import SecretairePatients from './pages/secretaire/SecretairePatients';
import SecretaireMedecins from './pages/secretaire/SecretaireMedecins';
import SecretairePlanning from './pages/secretaire/SecretairePlanning';
import SecretaireNotifications from './pages/secretaire/SecretaireNotifications';
import SecretairePrint from './pages/secretaire/SecretairePrint';
import SecretaireSettings from './pages/secretaire/SecretaireSettings';
import DashboardSecretaire from './pages/secretaire/DashboardSecretaire';

// ── Espace Admin ──
import { Layout } from './Shared';                              // ← AJOUTÉ
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminDoctorsPage from './pages/admin/DoctorsPage';
import AdminDoctorDetailPage from './pages/admin/DoctorDetailPage';
import AdminPatientsPage from './pages/admin/PatientsPage';
import AdminPatientDetailPage from './pages/admin/PatientDetailPage';
import AdminSecretariesPage from './pages/admin/SecretariesPage';
import AdminSpecialitiesPage from './pages/admin/SpecialitiesPage';
import AdminPlanningPage from './pages/admin/PlanningPage';
import AdminProfilePage from './pages/admin/ProfilePage';
import SecretaryDetailPage  from "./pages/admin/SecretaryDetailPage";
import SpecialityDetailPage from "./pages/admin/SpecialityDetailPage";
// ── Protected Route Admin ──                                  // ← AJOUTÉ
const AdminProtectedRoute = ({ children }) => {
  const ok = localStorage.getItem("adminAuthenticated") === "true";
  return ok ? children : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <Routes>

      {/* ── Pages publiques ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ══════════════════════════════
          ESPACE MÉDECIN
      ══════════════════════════════ */}
      <Route path="/medecin" element={<MedecinLayout />}>
        <Route index element={<Navigate to="/medecin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="dossiers" element={<DossiersPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="alertes" element={<AlertesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="questionnaires" element={<QuestionnairesPage />} />
        <Route path="dossier/:id" element={<Navigate to="vue-ensemble" replace />} />
        <Route path="dossier/:id/vue-ensemble" element={<VueEnsemblePage />} />
        <Route path="dossier/:id/questionnaires" element={<PatientQuestionnairePage />} />
        <Route path="dossier/:id/consultation" element={<ConsultationPage />} />
        <Route path="dossier/:id/mammographie" element={<MammographiePage />} />
        <Route path="dossier/:id/echographie" element={<EchographiePage />} />
        <Route path="dossier/:id/irm" element={<IRMPage />} />
        <Route path="dossier/:id/biopsie" element={<BiopsiePage />} />
        <Route path="dossier/:id/resultats" element={<VueEnsemblePage />} />
        <Route path="dossier/:id/plan-traitement" element={<PlanTraitementPage />} />
        <Route path="dossier/:id/documents" element={<DocumentsPage />} />
      </Route>

      {/* ══════════════════════════════
          ESPACE SECRÉTAIRE
      ══════════════════════════════ */}
      <Route path="/secretaire" element={<SecretaireLayout />}>
        <Route index element={<Navigate to="/secretaire/dashboard" replace />} />
        <Route path="dashboard"     element={<DashboardSecretaire />} />
        <Route path="patients"      element={<SecretairePatients />} />
        <Route path="medecins"      element={<SecretaireMedecins />} />
        <Route path="planning"      element={<SecretairePlanning />} />
        <Route path="notifications" element={<SecretaireNotifications />} />
        <Route path="print"         element={<SecretairePrint />} />
        <Route path="settings"      element={<SecretaireSettings />} />
      </Route>

      {/* ══════════════════════════════
          ESPACE ADMIN
      ══════════════════════════════ */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <Layout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard"    element={<AdminDashboardPage />}    />
        <Route path="patients"     element={<AdminPatientsPage />}     />
        <Route path="patients/:id" element={<AdminPatientDetailPage />}/>
        <Route path="doctors"      element={<AdminDoctorsPage />}      />
        <Route path="doctors/:id"  element={<AdminDoctorDetailPage />} />
        <Route path="secretaries"  element={<AdminSecretariesPage />}  />
        <Route path="secretaries/:id"  element={<SecretaryDetailPage />}  />
        <Route path="specialities" element={<AdminSpecialitiesPage />} />
        <Route path="specialities/:id"  element={<SpecialityDetailPage />}  />
        <Route path="planning"     element={<AdminPlanningPage />}     />
        <Route path="profile"      element={<AdminProfilePage />}      />
      </Route>

      {/* ── Redirections legacy ── */}
      <Route path="/dashboard" element={<Navigate to="/medecin/dashboard" replace />} />

      {/* ── 404 ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}