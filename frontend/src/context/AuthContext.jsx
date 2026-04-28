import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    // Récupère les infos user depuis localStorage si elles existent
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (authResponse) => {
    // authResponse = { token, id, nom, prenom, email, role }
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse));
    setToken(authResponse.token);
    setUser(authResponse);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  // Initiales du médecin pour l'avatar
  const getInitiales = () => {
    if (!user) return 'Dr';
    return `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase();
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      logout,
      isAuthenticated: !!token,
      getInitiales,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);