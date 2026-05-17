import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/medecin/DashboardPage';
import PatientsPage from './pages/medecin/PatientsPage';
import AgendaPage from './pages/medecin/AgendaPage';
import AlertesPage from './pages/medecin/AlertesPage';
import SettingsPage from './pages/medecin/SettingsPage';
import QuestionnairesPage from './pages/medecin/QuestionnairesPage';
import PatientQuestionnairePage from './pages/medecin/PatientQuestionnairePage';
import VueEnsemblePage from './pages/medecin/dossier/VueEnsemblePage';
import ConsultationPage from './pages/medecin/dossier/ConsultationPage';
import EchographiePage from './pages/medecin/dossier/EchographiePage';
import IRMPage from './pages/medecin/dossier/IRMPage';
import PlanTraitementPage from './pages/medecin/dossier/PlanTraitementPage';
import MedecinLayout from './layouts/MedecinLayout';
import DocumentsPage from './pages/medecin/dossier/DocumentsPage';
import DossiersPage from './pages/medecin/DossiersPage';
import BiopsiePage from './pages/medecin/dossier/BiopsiePage';
import MammographiePage from './pages/medecin/dossier/MammographiePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      <Route path="/medecin" element={<MedecinLayout />}>
        <Route index element={<Navigate to="/medecin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="dossiers" element={<DossiersPage/>} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="alertes" element={<AlertesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="questionnaires" element={<QuestionnairesPage />} />
        
        {/* Dossier Patient Routes */}
        <Route path="dossier/:id" element={<Navigate to="vue-ensemble" replace />} />
        <Route path="dossier/:id/vue-ensemble" element={<VueEnsemblePage />} />
        <Route path="dossier/:id/questionnaires" element={<PatientQuestionnairePage />} />
        
        {/* Placeholders for other dossiers routes to avoid blank pages */}
        <Route path="dossier/:id/consultation" element={<ConsultationPage />} />
        <Route path="dossier/:id/mammographie" element={<MammographiePage />} />
        <Route path="dossier/:id/echographie" element={<EchographiePage />} />
        <Route path="dossier/:id/irm" element={<IRMPage />} />
        <Route path="dossier/:id/mammographie" element={<VueEnsemblePage />} />
        <Route path="dossier/:id/biopsie" element={<BiopsiePage />} />
        <Route path="dossier/:id/resultats" element={<VueEnsemblePage />} />
        <Route path="dossier/:id/plan-traitement" element={<PlanTraitementPage />} />
        <Route path="dossier/:id/documents" element={<DocumentsPage />} />
        <Route path="dossier/:id/documents" element={<VueEnsemblePage />} />
        
      </Route>

      <Route path="/dashboard" element={<Navigate to="/medecin/dashboard" replace />} />
    </Routes>
  );
}
