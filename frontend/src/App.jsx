/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
import MedecinLayout from './layouts/MedecinLayout';

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
        <Route path="dossiers" element={<PatientsPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="alertes" element={<AlertesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="dossier/:id/vue-ensemble" element={<div className="p-8 font-sans"><h2 className="text-2xl font-black uppercase tracking-tighter">Dossier Patient</h2><p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Contenu détaillé en développement</p></div>} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/medecin/dashboard" replace />} />
    </Routes>
  );
}
