import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // ── Charge la photo au démarrage ──────────
useEffect(() => {
  const chargerPhoto = async () => {
    if (!user?.id || !token) return;
    if (user?.photoProfil) return;

    // Ne charger QUE pour les médecins
    if (user.role !== 'MEDECIN') return;

    try {
      const res = await axios.get(
        `${API_BASE}/api/medecins/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.photoProfil) {
        const updated = { ...user, photoProfil: res.data.photoProfil };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
      }
    } catch (e) {
      console.error('Erreur photo profil:', e);
    }
  };
  chargerPhoto();
}, [user?.id]);

  const login = (authResponse) => {
    localStorage.setItem('token', authResponse.token ?? token);
    localStorage.setItem('user', JSON.stringify(authResponse));
    setToken(authResponse.token ?? token);
    setUser(authResponse);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const getInitiales = () => {
    if (!user) return 'Dr';
    return `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase();
  };

  // ── Fonction centralisée pour obtenir l'URL photo ─────────────────────
  // Accepte un timestamp optionnel pour forcer le rechargement
  const getPhotoUrl = (timestamp = null) => {
    if (!user?.photoProfil) return null;

    const val = user.photoProfil;

    // Si c'est déjà un blob URL (preview local) → retourner tel quel
    if (val.startsWith('blob:')) return val;

    // Si c'est une URL complète (http...) → extraire le nom de fichier
    const fileName = val.includes('/')
      ? val.split('/').pop()
      : val;

    const url = `${API_BASE}/uploads/${fileName}`;
    return timestamp ? `${url}?t=${timestamp}` : url;
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      logout,
      isAuthenticated: !!token,
      getInitiales,
      getPhotoUrl,   // ← exposé à tous les composants
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);