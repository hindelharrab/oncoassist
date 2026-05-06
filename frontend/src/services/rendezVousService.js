import axiosInstance from './axiosInstance';

const BASE = '/rendez-vous';

const rendezVousService = {

  // ── Lecture ──────────────────────────────────────────────
  getAll: () =>
    axiosInstance.get(BASE).then(r => r.data),

  getById: (id) =>
    axiosInstance.get(`${BASE}/${id}`).then(r => r.data),

  getByMedecin: (medecinId) =>
    axiosInstance.get(`${BASE}/medecin/${medecinId}`).then(r => r.data),

  getByPatient: (patientId) =>
    axiosInstance.get(`${BASE}/patient/${patientId}`).then(r => r.data),

  getEnAttente: () =>
    axiosInstance.get(`${BASE}/en-attente`).then(r => r.data),

  // ── Mutations ─────────────────────────────────────────────
  demander: ({ medecinId, patientId, motif }) =>
    axiosInstance.post(`${BASE}/demander`, { medecinId, patientId, motif }).then(r => r.data),

  planifier: (id, { date, lieu }) =>
    axiosInstance.put(`${BASE}/${id}/planifier`, { date, lieu }).then(r => r.data),

  marquerEffectue: (id) =>
    axiosInstance.put(`${BASE}/${id}/effectue`).then(r => r.data),

  annuler: (id) =>
    axiosInstance.put(`${BASE}/${id}/annuler`).then(r => r.data),
};

export default rendezVousService;