import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'claire');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'sombre') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleTheme = () => setTheme(prev => prev === 'claire' ? 'sombre' : 'claire');

  return (
    <SettingsContext.Provider value={{ theme, setTheme, toggleTheme, lang, setLang }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
