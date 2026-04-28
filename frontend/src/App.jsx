import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages existantes
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Layout médecin
import MedecinLayout from './layouts/MedecinLayout';

// Pages médecin
import DashboardPage from './pages/medecin/DashboardPage';
import PatientsPage from './pages/medecin/PatientsPage';
import AgendaPage from './pages/medecin/AgendaPage';
import AlertesPage from './pages/medecin/AlertesPage';
import SettingsPage from './pages/medecin/SettingsPage';

// PrivateRoute
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>

        {/* ===== ROUTES PUBLIQUES ===== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ===== ROUTES MÉDECIN (protégées) ===== */}
        <Route
          path="/medecin"
          element={
            <PrivateRoute>
              <MedecinLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="alertes" element={<AlertesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route
            path="dossier/:patientId/*"
            element={
              <div className="p-8 text-gray-400 text-center">
                Dossier médical — à implémenter
              </div>
            }
          />
        </Route>

        {/* Redirection 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;