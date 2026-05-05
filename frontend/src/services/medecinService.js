import axiosInstance from './axiosInstance';

export const medecinService = {
  // POST créer médecin (ADMIN)
  creer: (medecin, specialiteId) =>
    axiosInstance.post(`/medecins?specialiteId=${specialiteId}`, medecin),

  // GET tous les médecins
  findAll: () =>
    axiosInstance.get('/medecins'),

  // GET médecin par ID
  findById: (id) =>
    axiosInstance.get(`/medecins/${id}`),

  // PUT modifier profil médecin (MEDECIN) — multipart
  modifierProfil: (id, data, photo) => {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (photo) form.append('photo', photo);
    return axiosInstance.put(`/medecins/profil/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // PUT changer mot de passe (MEDECIN)
  changerMotDePasse: (id, dto) =>
    axiosInstance.put(`/medecins/profil/${id}/change-password`, dto),
  // dto = { ancienMotDePasse, nouveauMotDePasse }
};