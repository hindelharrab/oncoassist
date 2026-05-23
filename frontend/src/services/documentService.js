import axiosInstance from './axiosInstance';

const getMedecinId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.medecinId || payload.id || payload.sub || null;
  } catch { return null; }
};

const authHeader = () => {
  const id = getMedecinId();
  return id ? { 'X-Medecin-Id': id } : {};
};

export const getOrdonnances = async (dossierId) => {
  const { data } = await axiosInstance.get(
    `/documents/dossier/${dossierId}/ordonnances`,
    { headers: authHeader() }
  );
  return data;
};

export const getResultats = async (dossierId) => {
  const { data } = await axiosInstance.get(
    `/documents/dossier/${dossierId}/resultats`,
    { headers: authHeader() }
  );
  return data;
};

export const creerDocument = async (dossierId, payload) => {
  const { data } = await axiosInstance.post(
    `/documents/dossier/${dossierId}`,
    payload,
    { headers: authHeader() }
  );
  return data;
};

export const modifierDocument = async (id, payload) => {
  const { data } = await axiosInstance.put(
    `/documents/${id}`,
    payload,
    { headers: authHeader() }
  );
  return data;
};

export const supprimerDocument = async (id) => {
  await axiosInstance.delete(
    `/documents/${id}`,
    { headers: authHeader() }
  );
};

export const toggleVisibilite = async (id) => {
  const { data } = await axiosInstance.put(
    `/documents/${id}/visibilite`,
    {},
    { headers: authHeader() }
  );
  return data;
};