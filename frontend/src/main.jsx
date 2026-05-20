import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { QuestionnaireProvider } from './context/QuestionnaireContext';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './Shared';  // ← AJOUTÉ

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>           {/* ← AJOUTÉ */}
        <AuthProvider>
          <SettingsProvider>
            <QuestionnaireProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: '12px',
                    background: '#fff',
                    color: '#0f172a',
                    boxShadow: '0 10px 40px -8px rgba(0,0,0,0.12)',
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: '1px solid #f1f5f9',
                  },
                }}
              />
            </QuestionnaireProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>           {/* ← AJOUTÉ */}
    </BrowserRouter>
  </StrictMode>,
);