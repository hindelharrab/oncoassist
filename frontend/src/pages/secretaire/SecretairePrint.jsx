import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer, Search, FileText, Eye, X, Filter, CheckCircle2, AlertCircle,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut', delay },
});

const TYPE_LABELS_BIO = {
  fibroadenoma: 'Fibroadénome',
  tubular_adenoma: 'Adénome Tubulaire',
  ductal_carcinoma: 'Carcinome Canalaire',
  mucinous_carcinoma: 'Carcinome Mucineux',
};

const fmtBool = (v) => (v === true || v === 'Oui') ? 'Oui' : 'Non';

/* ════════════════════════════════════════
   DONNÉES MOCK
═══════════════════════════════════════ */
const PATIENTS_MOCK = [
  {
    id: '#P-9821', nom: 'Bennani', prenom: 'Salma', age: 42,
    dateNaissance: '1982-03-15',
    telephone: '06 11 22 33 44', email: 's.bennani@mail.com',
    adresse: '12 Rue des Roses, Casablanca',
    medecinRef: 'El Harrab Amine', specialite: 'Oncologie digestive',
    statut: 'INACTIF', derniereConsultation: '14 mai 2026',
    antecedentsMedicaux: [
      { maladie: 'Cancer du côlon stade II', statut: 'GUERI', dateDiagnostic: '2023-01-01', traitements: 'FOLFOX' },
      { maladie: 'Diabète type 2', statut: 'EN_COURS', dateDiagnostic: '2019-06-01', traitements: 'Metformine' },
    ],
    antecedentsFamiliaux: [
      { lienFamilial: 'Père', maladie: 'Cancer colorectal', ageSurvenue: 65 },
      { lienFamilial: 'Sœur', maladie: 'Cancer du sein', ageSurvenue: 48 },
    ],
    examenManuel: {
      date: '14/05/2026', medecin: 'El Harrab Amine',
      siteAnatomique: 'Abdomen', massePalpee: false,
      aspectPeau: 'Normal', adenopathies: 'Aucune',
      description: 'Abdomen souple, pas de masse palpable. Transit normal signalé par la patiente.',
    },
    mammographie: null,
    echographie: {
      date: '15/04/2026', medecin: 'El Harrab Amine',
      seinExamine: 'Droit', quadrant: 'QSE', distanceMamelon: '2',
      typeStructure: 'Kystique', forme: 'Ovale', orientation: 'Parallèle',
      contours: 'Bien définis', echostructure: 'Anéchogène',
      vascularisationDoppler: 'Absente',
      tailleAxe1: '8', tailleAxe2: '5', tailleAxe3: '4',
      calcificationsPresentes: false, adenopathieAxillaire: false,
      scoreBIRADS: '2',
      recommandation: 'Surveillance annuelle.',
      resultatDetaille: 'Kyste simple sans caractère suspect. Aucune adénopathie axillaire.',
    },
    irm: null, biopsie: null,
    traitements: ['FOLFOX 6 cycles (terminé)', 'Surveillance active tous les 3 mois'],
    rdv: [
      { date: '14 mai 2026', motif: 'Consultation de suivi', medecin: 'Dr. El Harrab', statut: 'Effectué' },
      { date: '01 juin 2026', motif: 'Bilan trimestriel', medecin: 'Dr. El Harrab', statut: 'Planifié' },
    ],
  },
  {
    id: '#P-5512', nom: 'Alami', prenom: 'Yassir', age: 35,
    dateNaissance: '1991-07-22',
    telephone: '06 55 66 77 88', email: 'y.alami@mail.com',
    adresse: '45 Avenue Hassan II, Rabat',
    medecinRef: 'Benali Karim', specialite: 'Radiothérapie',
    statut: 'ARCHIVE', derniereConsultation: '10 mai 2026',
    antecedentsMedicaux: [
      { maladie: 'Lymphome hodgkinien', statut: 'EN_COURS', dateDiagnostic: '2026-01-01', traitements: 'ABVD' },
    ],
    antecedentsFamiliaux: [],
    examenManuel: {
      date: '10/05/2026', medecin: 'Benali Karim',
      siteAnatomique: 'Cou / médiastin', massePalpee: true,
      localisationDeMasse: 'Adénopathie cervicale gauche',
      aspectPeau: 'Normal', adenopathies: 'Cervicales bilatérales',
      description: 'Adénopathies cervicales palpables, indolores, fermes.',
    },
    mammographie: null, echographie: null, irm: null,
    biopsie: {
      date: '05/05/2026', medecin: 'Benali Karim',
      siteAnatomique: 'Sein gauche', grossissement: '400X',
      imagesAnalysees: [1], isAnalysed: true,
      classeBinaire: 'BENIN', scoreBenignMalin: 1.0,
      typeTumeur: 'tubular_adenoma', scoreTypeConfiance: 0.938,
      notes: 'Cellules de Reed-Sternberg identifiées. Profil CD30+, CD15+.',
    },
    traitements: ['ABVD en cours (Cycle 1 débuté)'],
    rdv: [
      { date: '10 mai 2026', motif: 'Annonce diagnostic', medecin: 'Dr. Benali', statut: 'Effectué' },
      { date: '20 mai 2026', motif: 'Début chimiothérapie', medecin: 'Dr. Benali', statut: 'Planifié' },
    ],
  },
  {
    id: '#P-2104', nom: 'Zahraoui', prenom: 'Fatima', age: 58,
    dateNaissance: '1966-11-03',
    telephone: '06 99 00 11 22', email: 'f.zahraoui@mail.com',
    adresse: '8 Rue Al Massira, Marrakech',
    medecinRef: 'El Harrab Amine', specialite: 'Oncologie digestive',
    statut: 'ACTIF', derniereConsultation: '08 mai 2026',
    antecedentsMedicaux: [
      { maladie: 'Cancer du sein', statut: 'GUERI', dateDiagnostic: '2019-01-01', traitements: 'Tamoxifène' },
      { maladie: 'Ostéoporose', statut: 'EN_COURS', dateDiagnostic: '2021-01-01', traitements: 'Calcium/VitD' },
    ],
    antecedentsFamiliaux: [
      { lienFamilial: 'Mère', maladie: 'Cancer du sein', ageSurvenue: 52 },
    ],
    examenManuel: {
      date: '08/05/2026', medecin: 'El Harrab Amine',
      siteAnatomique: 'Sein droit', massePalpee: false,
      aspectPeau: 'Cicatrice ancienne stable', adenopathies: 'Aucune',
      description: 'Aucune masse palpable. Cicatrice de mastectomie partielle stable.',
    },
    mammographie: {
      date: '06/05/2026', medecin: 'El Harrab Amine',
      scoreBIRADS: 'BIRADS_2', predictionIA: 'BENIGN', confidencePct: 91.2,
      positionText: 'QSI', quadrant: 'Quadrant supéro-interne', quadrantShort: 'QSI',
      recommendationIA: 'Surveillance annuelle recommandée.',
      biradsDescription: 'Microcalcifications bénignes stables, aucune masse suspecte.',
    },
    echographie: null, irm: null, biopsie: null,
    traitements: ['Hormonothérapie Tamoxifène (5 ans terminés)', 'Supplémentation calcium/vitD'],
    rdv: [
      { date: '08 mai 2026', motif: 'Contrôle annuel', medecin: 'Dr. El Harrab', statut: 'Effectué' },
      { date: '10 juin 2026', motif: 'Bilan densitométrie', medecin: 'Dr. El Harrab', statut: 'Planifié' },
    ],
  },
];

/* ════════════════════════════════════════
   GÉNÉRATEUR HTML POUR IMPRESSION
   (ouvre dans nouvelle fenêtre → pas de page blanche)
═══════════════════════════════════════ */
const genererHTML = (patient) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const refId = patient.id.replace('#', '').replace('-', '');

  const row = (label, value, color) => `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:5px 0;border-bottom:1px solid #f1f5f9;">
      <span style="font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;flex-shrink:0;margin-right:16px;">${label}</span>
      <span style="font-size:9px;font-weight:900;text-transform:uppercase;text-align:right;line-height:1.3;color:${color || '#1e293b'};">${value || '—'}</span>
    </div>`;

  const section = (title) => `
    <div style="margin-top:18px;margin-bottom:6px;">
      <p style="font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.35em;color:#ec4899;padding-bottom:4px;border-bottom:1px solid #fce7f3;margin:0;">${title}</p>
    </div>`;

  const texte = (text) => text ? `
    <div style="padding:5px 0;border-bottom:1px solid #f1f5f9;">
      <p style="font-size:9px;font-weight:500;color:#1e293b;line-height:1.6;margin:0;">${text}</p>
    </div>` : '';

  const sousTitre = (t) => `<p style="font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:0.3em;color:#94a3b8;margin:10px 0 3px;">${t}</p>`;

  const filigrane = `
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.03;pointer-events:none;transform:rotate(-35deg);overflow:hidden;">
      <span style="font-size:60px;font-weight:900;text-transform:uppercase;letter-spacing:0.5em;color:#0f172a;white-space:nowrap;">ONCOASSIST</span>
    </div>`;

  const pageStyle = `width:210mm;min-height:297mm;background:#fff;padding:15mm;box-sizing:border-box;position:relative;display:flex;flex-direction:column;font-family:system-ui,sans-serif;page-break-after:always;`;

  /* ── En-tête (page 1 seulement) ── */
  const header = `
    <div style="margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid #0f172a;display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#0f172a;font-style:italic;text-transform:uppercase;margin:0;">CENTRE D'ONCOLOGIE</h2>
        <p style="font-size:9px;font-weight:700;color:#94a3b8;margin:3px 0 0;font-style:italic;">Pôle d'excellence en oncologie</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.25em;color:#ec4899;margin:0;">Rapport de Synthèse</p>
        <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:3px 0 0;">Dossier Médical Complet</p>
        <p style="font-size:9px;color:#94a3b8;margin:4px 0 0;">${today}</p>
        <p style="font-size:9px;font-weight:900;color:#1e293b;margin:3px 0 0;text-transform:uppercase;">${patient.prenom} ${patient.nom} · ${patient.id}</p>
      </div>
    </div>`;

  /* ── Mini en-tête pages 2+ ── */
  const headerMini = `
    <div style="margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
      <p style="font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.15em;margin:0;">CENTRE D'ONCOLOGIE</p>
      <p style="font-size:8px;color:#94a3b8;margin:0;">${patient.prenom} ${patient.nom} · ${patient.id} · ${today}</p>
    </div>`;

  /* ── Footer (dernière page seulement) ── */
  const footer = `
    <div style="margin-top:auto;padding-top:20px;border-top:1px solid #e2e8f0;">
      <!-- Signature -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:24px;">
        <div>
          <p style="font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 4px;">Médecin responsable</p>
          <p style="font-size:9px;font-weight:700;color:#1e293b;margin:0;">Dr. ${patient.medecinRef}</p>
          <p style="font-size:8px;color:#94a3b8;margin:2px 0 0;">${patient.specialite}</p>
          <div style="margin-top:28px;border-bottom:1px solid #cbd5e1;width:120px;"></div>
          <p style="font-size:7px;color:#94a3b8;margin:4px 0 0;">Signature</p>
        </div>
        <div>
          <p style="font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 4px;">Cachet établissement</p>
          <div style="width:80px;height:80px;border:1px dashed #e2e8f0;border-radius:4px;display:flex;align-items:center;justify-content:center;">
            <p style="font-size:7px;color:#e2e8f0;text-align:center;font-weight:700;text-transform:uppercase;margin:0;">Cachet<br/>officiel</p>
          </div>
        </div>
      </div>
      <!-- Réf -->
      <div style="display:flex;justify-content:space-between;align-items:flex-end;">
        <div>
          <p style="font-size:7px;color:#94a3b8;text-transform:uppercase;font-weight:900;margin:0;">Réf document</p>
          <p style="font-size:8px;font-family:monospace;font-weight:700;color:#475569;margin:2px 0 0;">ONCO-${refId}</p>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;opacity:0.3;">
          <div style="width:36px;height:36px;border:1px solid #94a3b8;display:flex;align-items:center;justify-content:center;border-radius:4px;margin-bottom:3px;">
            <span style="font-size:5px;font-family:monospace;text-align:center;line-height:1.2;">QR VALIDÉ</span>
          </div>
          <p style="font-size:6px;font-weight:900;text-transform:uppercase;margin:0;">Signé électroniquement</p>
        </div>
      </div>
    </div>`;

  /* ══ PAGE 1 : Infos + Antécédents + Examen manuel ══ */
  const page1 = `
    <div style="${pageStyle}">
      ${filigrane}
      <div style="position:relative;z-index:10;display:flex;flex-direction:column;flex:1;">
        ${header}
        ${section('Informations Générales')}
        ${row('Nom Complet', `${patient.prenom} ${patient.nom}`)}
        ${row('Date de Naissance', patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : '—')}
        ${row('Téléphone', patient.telephone)}
        ${row('Email', patient.email)}
        ${row('Adresse', patient.adresse)}
        ${patient.antecedentsMedicaux?.length ? `
          ${section('Antécédents Médicaux')}
          ${patient.antecedentsMedicaux.map(a => row(a.maladie,
            [a.statut?.replace('_',' '), a.dateDiagnostic ? new Date(a.dateDiagnostic).getFullYear() : null, a.traitements].filter(Boolean).join(' — ')
          )).join('')}` : ''}
        ${patient.antecedentsFamiliaux?.length ? `
          ${section('Antécédents Familiaux')}
          ${patient.antecedentsFamiliaux.map(a => row(`${a.lienFamilial} — ${a.maladie}`, a.ageSurvenue ? `Détecté à ${a.ageSurvenue} ans` : '—')).join('')}` : ''}
        ${patient.examenManuel ? `
          ${section('Examen Clinique Manuel')}
          ${row('Date', patient.examenManuel.date)}
          ${row('Médecin', `Dr. ${patient.examenManuel.medecin}`)}
          ${row('Site Anatomique', patient.examenManuel.siteAnatomique)}
          ${row('Masse Palpée', patient.examenManuel.massePalpee ? 'Oui' : 'Non', patient.examenManuel.massePalpee ? '#e11d48' : '#059669')}
          ${patient.examenManuel.massePalpee ? row('Localisation', patient.examenManuel.localisationDeMasse) : ''}
          ${row('Aspect Peau', patient.examenManuel.aspectPeau)}
          ${row('Adénopathies', patient.examenManuel.adenopathies)}
          ${patient.examenManuel.description ? sousTitre('Conclusions') + texte(patient.examenManuel.description) : ''}
        ` : ''}
      </div>
    </div>`;

  /* ══ PAGE 2 : Mammographie + Échographie ══ */
  const page2 = `
    <div style="${pageStyle}">
      ${filigrane}
      <div style="position:relative;z-index:10;display:flex;flex-direction:column;flex:1;">
        ${headerMini}
        ${patient.mammographie ? (() => {
          const e = patient.mammographie;
          const malin = e.predictionIA === 'MALIGNANT';
          const birads = (e.scoreBIRADS || '').replace('BIRADS_', 'BI-RADS ') || '—';
          return `
            ${section('Mammographie Numérique')}
            ${row('Date', e.date)}
            ${row('Médecin', `Dr. ${e.medecin}`)}
            ${row('Classification BI-RADS', birads, '#be185d')}
            ${row('Résultat IA', `${malin ? 'Malin' : 'Bénin'} — ${(e.confidencePct||0).toFixed(1)}% de confiance`, malin ? '#e11d48' : '#059669')}
            ${row('Localisation', `${e.quadrantShort||'—'} — ${e.positionText||'—'}`)}
            ${e.recommendationIA ? sousTitre('Recommandation') + texte(e.recommendationIA) : ''}
            ${e.biradsDescription ? sousTitre('Observations') + texte(e.biradsDescription) : ''}
            <p style="font-size:7px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-top:6px;">Modèle : EfficientNet-B3 · AUC 0.80</p>`;
        })() : `${section('Mammographie Numérique')}<p style="font-size:9px;color:#cbd5e1;font-style:italic;margin-top:8px;">Aucune mammographie enregistrée.</p>`}
        ${patient.echographie ? (() => {
          const e = patient.echographie;
          return `
            ${section('Échographie Mammaire')}
            ${row('Date', e.date)}
            ${row('Médecin', `Dr. ${e.medecin}`)}
            ${row('Sein Examiné', e.seinExamine)}
            ${row('Quadrant', e.quadrant)}
            ${row('Distance Mamelon', e.distanceMamelon ? `${e.distanceMamelon} cm` : '—')}
            ${row('Type Structure', e.typeStructure)}
            ${row('Forme', e.forme)}
            ${row('Orientation', e.orientation)}
            ${row('Contours', e.contours)}
            ${row('Échostructure', e.echostructure)}
            ${row('Vascularisation Doppler', e.vascularisationDoppler)}
            ${row('Taille (axe 1×2×3)', `${e.tailleAxe1||0} × ${e.tailleAxe2||0} × ${e.tailleAxe3||0} mm`, '#be185d')}
            ${row('Calcifications', fmtBool(e.calcificationsPresentes), e.calcificationsPresentes ? '#e11d48' : '#059669')}
            ${row('Adéno. Axillaire', fmtBool(e.adenopathieAxillaire), e.adenopathieAxillaire ? '#e11d48' : '#059669')}
            ${row('Score BI-RADS', e.scoreBIRADS, '#be185d')}
            ${e.recommandation ? sousTitre('Recommandation') + texte(e.recommandation) : ''}
            ${e.resultatDetaille ? sousTitre('Observations') + texte(e.resultatDetaille) : ''}`;
        })() : `${section('Échographie Mammaire')}<p style="font-size:9px;color:#cbd5e1;font-style:italic;margin-top:8px;">Aucune échographie enregistrée.</p>`}
      </div>
    </div>`;

  /* ══ PAGE 3 : IRM + Biopsie + Traitements + RDV + Footer ══ */
  const page3 = `
    <div style="${pageStyle}">
      ${filigrane}
      <div style="position:relative;z-index:10;display:flex;flex-direction:column;flex:1;">
        ${headerMini}
        ${patient.irm ? (() => {
          const e = patient.irm;
          return `
            ${section('IRM Mammaire')}
            ${row('Date', e.date)}
            ${row('Médecin', `Dr. ${e.medecin}`)}
            ${row('Sein Examiné', e.seinExamine)}
            ${row('Séquences', e.sequences)}
            ${row('Produit Contraste', e.produitContraste)}
            ${row('Forme Lésion', e.formeLesion)}
            ${row('Contours', e.contoursLesion)}
            ${row('Signal T2', e.signalT2)}
            ${row('Cinématique', e.cinematiqueRehaussement, '#be185d')}
            ${row('Restric. Diffusion', e.restrictionDiffusion, e.restrictionDiffusion === 'Oui' ? '#e11d48' : '#059669')}
            ${row('Taille (axe 1×2×3)', `${e.tailleAxe1||0} × ${e.tailleAxe2||0} × ${e.tailleAxe3||0} mm`, '#be185d')}
            ${row('Score BI-RADS IRM', e.scoreBIRADS, '#be185d')}
            ${e.resultatDetaille ? sousTitre('Compte-Rendu Final') + texte(e.resultatDetaille) : ''}`;
        })() : `${section('IRM Mammaire')}<p style="font-size:9px;color:#cbd5e1;font-style:italic;margin-top:8px;">Aucun examen IRM enregistré.</p>`}
        ${patient.biopsie ? (() => {
          const e = patient.biopsie;
          const malin = e.classeBinaire === 'MALIN';
          const scoreB = e.scoreBenignMalin ? `${(e.scoreBenignMalin*100).toFixed(1)}%` : '—';
          const scoreT = e.scoreTypeConfiance ? `${(e.scoreTypeConfiance*100).toFixed(1)}%` : '—';
          return `
            ${section('Analyse de Biopsie')}
            ${row('Date', e.date)}
            ${row('Médecin', `Dr. ${e.medecin}`)}
            ${row('Site Anatomique', e.siteAnatomique)}
            ${row('Grossissement', e.grossissement)}
            ${row('Régions Analysées', `${e.imagesAnalysees?.length||0} zone(s)`)}
            ${e.isAnalysed ? `
              ${row('Résultat IA', `${malin ? 'Malin' : 'Bénin'} — ${scoreB} de confiance`, malin ? '#e11d48' : '#059669')}
              ${e.typeTumeur ? row('Type Tumeur', `${TYPE_LABELS_BIO[e.typeTumeur]||e.typeTumeur} — ${scoreT}`) : ''}
              <p style="font-size:7px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-top:6px;">Modèle : DenseNet121 · Dataset : BreaKHis · v1.2</p>
            ` : ''}
            ${e.notes ? sousTitre('Compte-Rendu Anatomopathologique') + texte(e.notes) : ''}`;
        })() : `${section('Analyse de Biopsie')}<p style="font-size:9px;color:#cbd5e1;font-style:italic;margin-top:8px;">Aucune biopsie enregistrée.</p>`}
        ${section('Plans de Traitement')}
        ${(patient.traitements||[]).map((t,i) => row(`Traitement ${i+1}`, t)).join('')}
        ${section('Historique des Rendez-vous')}
        ${(patient.rdv||[]).map(r => row(r.date, `${r.motif} — ${r.medecin} [${r.statut}]`,
          r.statut === 'Effectué' ? '#059669' : r.statut === 'Confirmé' ? '#7c3aed' : '#d97706'
        )).join('')}
        ${footer}
      </div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Rapport — ${patient.prenom} ${patient.nom}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f1f5f9; }
    @media print {
      body { background: #fff; }
      @page { size: A4; margin: 0; }
      .page { page-break-after: always; }
      .page:last-child { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  ${page1}
  ${page2}
  ${page3}
</body>
</html>`;
};

/* ════════════════════════════════════════
   APERÇU PDF inline — même style médecin
═══════════════════════════════════════ */
const s = {
  page: { width:'210mm', minHeight:'297mm', background:'#fff', padding:'15mm', boxSizing:'border-box', position:'relative', display:'flex', flexDirection:'column', fontFamily:'system-ui,sans-serif', marginBottom:'24px', boxShadow:'0 4px 40px rgba(0,0,0,0.15)' },
  fili: { position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', opacity:0.025, pointerEvents:'none', transform:'rotate(-35deg)', overflow:'hidden' },
  inner: { position:'relative', zIndex:10, display:'flex', flexDirection:'column', flex:1 },
};

const Row = ({ label, value, color }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'5px 0', borderBottom:'1px solid #f1f5f9' }}>
    <span style={{ fontSize:'8px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', flexShrink:0, marginRight:'16px' }}>{label}</span>
    <span style={{ fontSize:'9px', fontWeight:900, textTransform:'uppercase', textAlign:'right', lineHeight:1.3, color: color||'#1e293b' }}>{value||'—'}</span>
  </div>
);

const Sec = ({ title }) => (
  <div style={{ marginTop:'18px', marginBottom:'6px' }}>
    <p style={{ fontSize:'8px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.35em', color:'#ec4899', paddingBottom:'4px', borderBottom:'1px solid #fce7f3', margin:0 }}>{title}</p>
  </div>
);

const Txt = ({ text }) => text ? (
  <div style={{ padding:'5px 0', borderBottom:'1px solid #f1f5f9' }}>
    <p style={{ fontSize:'9px', fontWeight:500, color:'#1e293b', lineHeight:1.6, margin:0 }}>{text}</p>
  </div>
) : null;

const SubLabel = ({ t }) => (
  <p style={{ fontSize:'7px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.3em', color:'#94a3b8', margin:'10px 0 3px' }}>{t}</p>
);

const Filigrane = () => (
  <div style={s.fili}>
    <span style={{ fontSize:'60px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.5em', color:'#0f172a', whiteSpace:'nowrap' }}>ONCOASSIST</span>
  </div>
);

const HeaderPage1 = ({ patient }) => (
  <div style={{ marginBottom:'28px', paddingBottom:'18px', borderBottom:'2px solid #0f172a', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
    <div>
      <h2 style={{ fontSize:'20px', fontWeight:900, color:'#0f172a', fontStyle:'italic', textTransform:'uppercase', margin:0 }}>CENTRE D'ONCOLOGIE</h2>
      <p style={{ fontSize:'9px', fontWeight:700, color:'#94a3b8', margin:'3px 0 0', fontStyle:'italic' }}>Pôle d'excellence en oncologie</p>
    </div>
    <div style={{ textAlign:'right' }}>
      <p style={{ fontSize:'11px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.25em', color:'#ec4899', margin:0 }}>Rapport de Synthèse</p>
      <p style={{ fontSize:'10px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', margin:'3px 0 0' }}>Dossier Médical Complet</p>
      <p style={{ fontSize:'9px', color:'#94a3b8', margin:'4px 0 0' }}>{new Date().toLocaleDateString('fr-FR')}</p>
      <p style={{ fontSize:'9px', fontWeight:900, color:'#1e293b', margin:'3px 0 0', textTransform:'uppercase' }}>{patient.prenom} {patient.nom} · {patient.id}</p>
    </div>
  </div>
);

const HeaderMini = ({ patient }) => (
  <div style={{ marginBottom:'14px', paddingBottom:'8px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
    <p style={{ fontSize:'9px', fontWeight:900, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.15em', margin:0 }}>CENTRE D'ONCOLOGIE</p>
    <p style={{ fontSize:'8px', color:'#94a3b8', margin:0 }}>{patient.prenom} {patient.nom} · {patient.id} · {new Date().toLocaleDateString('fr-FR')}</p>
  </div>
);

const Footer = ({ patient }) => {
  const refId = patient.id.replace('#','').replace('-','');
  return (
    <div style={{ marginTop:'auto', paddingTop:'20px', borderTop:'1px solid #e2e8f0' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px', marginBottom:'20px' }}>
        <div>
          <p style={{ fontSize:'8px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', margin:'0 0 4px' }}>Médecin responsable</p>
          <p style={{ fontSize:'9px', fontWeight:700, color:'#1e293b', margin:0 }}>Dr. {patient.medecinRef}</p>
          <p style={{ fontSize:'8px', color:'#94a3b8', margin:'2px 0 0' }}>{patient.specialite}</p>
          <div style={{ marginTop:'28px', borderBottom:'1px solid #cbd5e1', width:'120px' }} />
          <p style={{ fontSize:'7px', color:'#94a3b8', margin:'4px 0 0' }}>Signature</p>
        </div>
        <div>
          <p style={{ fontSize:'8px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', margin:'0 0 4px' }}>Cachet établissement</p>
          <div style={{ width:'80px', height:'80px', border:'1px dashed #e2e8f0', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <p style={{ fontSize:'7px', color:'#e2e8f0', textAlign:'center', fontWeight:700, textTransform:'uppercase', margin:0 }}>Cachet<br/>officiel</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

/* Pages React pour aperçu */
const AperçuPage1 = ({ patient }) => (
  <div style={s.page}>
    <Filigrane />
    <div style={s.inner}>
      <HeaderPage1 patient={patient} />
      <Sec title="Informations Générales" />
      <Row label="Nom Complet"       value={`${patient.prenom} ${patient.nom}`} />
      <Row label="Date de Naissance" value={patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : '—'} />
      <Row label="Téléphone"         value={patient.telephone} />
      <Row label="Email"             value={patient.email} />
      <Row label="Adresse"           value={patient.adresse} />
      {patient.antecedentsMedicaux?.length > 0 && <>
        <Sec title="Antécédents Médicaux" />
        {patient.antecedentsMedicaux.map((a,i) => (
          <Row key={i} label={a.maladie}
            value={[a.statut?.replace('_',' '), a.dateDiagnostic ? new Date(a.dateDiagnostic).getFullYear() : null, a.traitements].filter(Boolean).join(' — ')} />
        ))}
      </>}
      {patient.antecedentsFamiliaux?.length > 0 && <>
        <Sec title="Antécédents Familiaux" />
        {patient.antecedentsFamiliaux.map((a,i) => (
          <Row key={i} label={`${a.lienFamilial} — ${a.maladie}`} value={a.ageSurvenue ? `Détecté à ${a.ageSurvenue} ans` : '—'} />
        ))}
      </>}
      {patient.examenManuel && <>
        <Sec title="Examen Clinique Manuel" />
        <Row label="Date"            value={patient.examenManuel.date} />
        <Row label="Médecin"         value={`Dr. ${patient.examenManuel.medecin}`} />
        <Row label="Site Anatomique" value={patient.examenManuel.siteAnatomique} />
        <Row label="Masse Palpée"    value={patient.examenManuel.massePalpee ? 'Oui' : 'Non'} color={patient.examenManuel.massePalpee ? '#e11d48' : '#059669'} />
        {patient.examenManuel.massePalpee && <Row label="Localisation" value={patient.examenManuel.localisationDeMasse} />}
        <Row label="Aspect Peau"  value={patient.examenManuel.aspectPeau} />
        <Row label="Adénopathies" value={patient.examenManuel.adenopathies} />
        {patient.examenManuel.description && <><SubLabel t="Conclusions" /><Txt text={patient.examenManuel.description} /></>}
      </>}
    </div>
  </div>
);

const AperçuPage2 = ({ patient }) => (
  <div style={s.page}>
    <Filigrane />
    <div style={s.inner}>
      <HeaderMini patient={patient} />
      {patient.mammographie ? (() => {
        const e = patient.mammographie;
        const malin = e.predictionIA === 'MALIGNANT';
        const birads = (e.scoreBIRADS||'').replace('BIRADS_','BI-RADS ')||'—';
        return <>
          <Sec title="Mammographie Numérique" />
          <Row label="Date"    value={e.date} />
          <Row label="Médecin" value={`Dr. ${e.medecin}`} />
          <Row label="Classification BI-RADS" value={birads} color="#be185d" />
          <Row label="Résultat IA" value={`${malin?'Malin':'Bénin'} — ${(e.confidencePct||0).toFixed(1)}% de confiance`} color={malin?'#e11d48':'#059669'} />
          <Row label="Localisation" value={`${e.quadrantShort||'—'} — ${e.positionText||'—'}`} />
          {e.recommendationIA && <><SubLabel t="Recommandation" /><Txt text={e.recommendationIA} /></>}
          {e.biradsDescription && <><SubLabel t="Observations" /><Txt text={e.biradsDescription} /></>}
          <p style={{ fontSize:'7px', fontWeight:900, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'6px' }}>Modèle : EfficientNet-B3 · AUC 0.80</p>
        </>;
      })() : <>
        <Sec title="Mammographie Numérique" />
        <p style={{ fontSize:'9px', color:'#cbd5e1', fontStyle:'italic', marginTop:'8px' }}>Aucune mammographie enregistrée.</p>
      </>}
      {patient.echographie ? (() => {
        const e = patient.echographie;
        return <>
          <Sec title="Échographie Mammaire" />
          <Row label="Date"    value={e.date} />
          <Row label="Médecin" value={`Dr. ${e.medecin}`} />
          <Row label="Sein Examiné"           value={e.seinExamine} />
          <Row label="Quadrant"               value={e.quadrant} />
          <Row label="Distance Mamelon"       value={e.distanceMamelon ? `${e.distanceMamelon} cm` : '—'} />
          <Row label="Type Structure"         value={e.typeStructure} />
          <Row label="Forme"                  value={e.forme} />
          <Row label="Orientation"            value={e.orientation} />
          <Row label="Contours"               value={e.contours} />
          <Row label="Échostructure"          value={e.echostructure} />
          <Row label="Vascularisation Doppler" value={e.vascularisationDoppler} />
          <Row label="Taille (axe 1×2×3)"    value={`${e.tailleAxe1||0} × ${e.tailleAxe2||0} × ${e.tailleAxe3||0} mm`} color="#be185d" />
          <Row label="Calcifications"         value={fmtBool(e.calcificationsPresentes)} color={e.calcificationsPresentes ? '#e11d48' : '#059669'} />
          <Row label="Adéno. Axillaire"       value={fmtBool(e.adenopathieAxillaire)}    color={e.adenopathieAxillaire    ? '#e11d48' : '#059669'} />
          <Row label="Score BI-RADS"          value={e.scoreBIRADS} color="#be185d" />
          {e.recommandation && <><SubLabel t="Recommandation" /><Txt text={e.recommandation} /></>}
          {e.resultatDetaille && <><SubLabel t="Observations" /><Txt text={e.resultatDetaille} /></>}
        </>;
      })() : <>
        <Sec title="Échographie Mammaire" />
        <p style={{ fontSize:'9px', color:'#cbd5e1', fontStyle:'italic', marginTop:'8px' }}>Aucune échographie enregistrée.</p>
      </>}
    </div>
  </div>
);

const AperçuPage3 = ({ patient }) => (
  <div style={s.page}>
    <Filigrane />
    <div style={s.inner}>
      <HeaderMini patient={patient} />
      {patient.irm ? (() => {
        const e = patient.irm;
        return <>
          <Sec title="IRM Mammaire" />
          <Row label="Date"    value={e.date} />
          <Row label="Médecin" value={`Dr. ${e.medecin}`} />
          <Row label="Sein Examiné"      value={e.seinExamine} />
          <Row label="Séquences"         value={e.sequences} />
          <Row label="Produit Contraste" value={e.produitContraste} />
          <Row label="Forme Lésion"      value={e.formeLesion} />
          <Row label="Contours"          value={e.contoursLesion} />
          <Row label="Signal T2"         value={e.signalT2} />
          <Row label="Cinématique"       value={e.cinematiqueRehaussement} color="#be185d" />
          <Row label="Restric. Diffusion" value={e.restrictionDiffusion} color={e.restrictionDiffusion === 'Oui' ? '#e11d48' : '#059669'} />
          <Row label="Taille (axe 1×2×3)" value={`${e.tailleAxe1||0} × ${e.tailleAxe2||0} × ${e.tailleAxe3||0} mm`} color="#be185d" />
          <Row label="Score BI-RADS IRM" value={e.scoreBIRADS} color="#be185d" />
          {e.resultatDetaille && <><SubLabel t="Compte-Rendu Final" /><Txt text={e.resultatDetaille} /></>}
        </>;
      })() : <>
        <Sec title="IRM Mammaire" />
        <p style={{ fontSize:'9px', color:'#cbd5e1', fontStyle:'italic', marginTop:'8px' }}>Aucun examen IRM enregistré.</p>
      </>}
      {patient.biopsie ? (() => {
        const e = patient.biopsie;
        const malin = e.classeBinaire === 'MALIN';
        const scoreB = e.scoreBenignMalin ? `${(e.scoreBenignMalin*100).toFixed(1)}%` : '—';
        const scoreT = e.scoreTypeConfiance ? `${(e.scoreTypeConfiance*100).toFixed(1)}%` : '—';
        return <>
          <Sec title="Analyse de Biopsie" />
          <Row label="Date"             value={e.date} />
          <Row label="Médecin"          value={`Dr. ${e.medecin}`} />
          <Row label="Site Anatomique"  value={e.siteAnatomique} />
          <Row label="Grossissement"    value={e.grossissement} />
          <Row label="Régions Analysées" value={`${e.imagesAnalysees?.length||0} zone(s)`} />
          {e.isAnalysed && <>
            <Row label="Résultat IA" value={`${malin?'Malin':'Bénin'} — ${scoreB} de confiance`} color={malin?'#e11d48':'#059669'} />
            {e.typeTumeur && <Row label="Type Tumeur" value={`${TYPE_LABELS_BIO[e.typeTumeur]||e.typeTumeur} — ${scoreT}`} />}
            <p style={{ fontSize:'7px', fontWeight:900, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'6px' }}>Modèle : DenseNet121 · Dataset : BreaKHis · v1.2</p>
          </>}
          {e.notes && <><SubLabel t="Compte-Rendu Anatomopathologique" /><Txt text={e.notes} /></>}
        </>;
      })() : <>
        <Sec title="Analyse de Biopsie" />
        <p style={{ fontSize:'9px', color:'#cbd5e1', fontStyle:'italic', marginTop:'8px' }}>Aucune biopsie enregistrée.</p>
      </>}
      <Sec title="Plans de Traitement" />
      {(patient.traitements||[]).map((t,i) => <Row key={i} label={`Traitement ${i+1}`} value={t} />)}
      <Sec title="Historique des Rendez-vous" />
      {(patient.rdv||[]).map((r,i) => (
        <Row key={i} label={r.date} value={`${r.motif} — ${r.medecin} [${r.statut}]`}
          color={r.statut==='Effectué'?'#059669':r.statut==='Confirmé'?'#7c3aed':'#d97706'} />
      ))}
      <Footer patient={patient} />
    </div>
  </div>
);

/* ════════════════════════════════════════
   MODAL APERÇU
═══════════════════════════════════════ */
const ModalApercu = ({ patient, onClose, onImprimer }) => (
  <div
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(15,23,42,0.82)',
    backdropFilter: 'blur(6px)',
    margin: 0,
    padding: 0,
  }}
>
    {/* Barre */}
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', background:'#fff', borderBottom:'1px solid #f1f5f9', flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
        <div style={{ width:'48px', height:'48px', borderRadius:'16px', background:'#ec4899', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
          <FileText size={22} />
        </div>
        <div>
          <h3 style={{ fontSize:'15px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.05em', color:'#0f172a', margin:0 }}>Rapport de Synthèse</h3>
          <p style={{ fontSize:'10px', fontWeight:900, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em', margin:'2px 0 0' }}>
            Aperçu pour impression — {patient.nom} {patient.prenom}
          </p>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'8px' }}>
          <AlertCircle size={12} color="#d97706" />
          <span style={{ fontSize:'10px', fontWeight:600, color:'#d97706' }}>Lecture seule</span>
        </div>
        <button onClick={() => onImprimer(patient)}
          style={{ height:'44px', padding:'0 24px', borderRadius:'12px', background:'#0f172a', color:'#fff', fontSize:'11px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' }}>
          <Printer size={16} /> Imprimer
        </button>
        <button onClick={onClose}
          style={{ width:'44px', height:'44px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'12px', background:'#fff', border:'1px solid #e2e8f0', cursor:'pointer', color:'#64748b' }}>
          <X size={18} />
        </button>
      </div>
    </div>
    {/* Scroll des pages */}
    <div style={{ flex:1, overflowY:'auto', background:'#e2e8f0', padding:'32px', display:'flex', flexDirection:'column', alignItems:'center', gap:'24px' }}>
      <AperçuPage1 patient={patient} />
      <AperçuPage2 patient={patient} />
      <AperçuPage3 patient={patient} />
    </div>
  </div>
);

/* ════════════════════════════════════════
   LIGNE PATIENT
═══════════════════════════════════════ */
const PatientRow = ({ patient, index, onApercu, onImprimer, printed }) => (
  <motion.div
    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
    transition={{ delay: index * 0.06 }}
    className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
  >
    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-[12px] font-black shrink-0">
      {patient.nom[0]}{patient.prenom[0]}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-semibold text-slate-900 truncate">{patient.nom} {patient.prenom}</p>
        <span className="text-[10px] text-slate-400 shrink-0">{patient.id}</span>
        {printed && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">✓ Imprimé</span>}
      </div>
      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
        <span className="text-[11px] text-slate-400">{patient.age} ans</span>
        <span className="w-1 h-1 rounded-full bg-slate-200" />
        <span className="text-[11px] text-slate-500">Dr. {patient.medecinRef}</span>
        <span className="w-1 h-1 rounded-full bg-slate-200" />
        <span className="text-[11px] text-slate-400">Dernière consult. : {patient.derniereConsultation}</span>
      </div>
    </div>
   <span
  className={`hidden sm:inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${
    patient.statut === 'ACTIF'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : patient.statut === 'INACTIF'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-slate-100 text-slate-500 border-slate-200'
  }`}
>
  {patient.statut}
</span>
    <div className="flex items-center gap-2 shrink-0">
      <button onClick={() => onApercu(patient)}
        className="flex items-center gap-1.5 h-9 px-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[12px] font-semibold hover:border-slate-300 hover:text-slate-800 transition-colors">
        <Eye size={13} /> Aperçu
      </button>
      <button onClick={() => onImprimer(patient)}
        className="flex items-center gap-1.5 h-9 px-3 bg-slate-800 text-white rounded-xl text-[12px] font-semibold hover:bg-slate-700 transition-colors">
        <Printer size={13} /> Imprimer
      </button>
    </div>
  </motion.div>
);

/* ════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════ */
export default function SecretairePrint() {
  const [search, setSearch]               = useState('');
  const [filtreMedecin, setFiltreMedecin] = useState('Tous');
  const [patientApercu, setPatientApercu] = useState(null);
  const [printed, setPrinted]             = useState([]);

  const filtered = PATIENTS_MOCK.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    const matchMedecin = filtreMedecin === 'Tous' || p.medecinRef.includes(filtreMedecin);
    return matchSearch && matchMedecin;
  });

  const handleImprimer = (patient) => {
    setPrinted(prev => [...new Set([...prev, patient.id])]);
    const html = genererHTML(patient);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('Autorisez les popups pour imprimer.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 600);
  };

  return (
    <div className="space-y-5 pb-8">
      <motion.div {...fadeUp(0)}>
        <h2 className="text-xl font-black text-slate-900">Imprimer dossier</h2>
        <p className="text-[12px] text-slate-400 font-medium mt-0.5">
          Rapport de synthèse complet — 3 pages A4 par dossier
        </p>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Rechercher par nom, prénom ou ID patient…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 outline-none focus:border-slate-400 transition-all placeholder:text-slate-300" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select value={filtreMedecin} onChange={e => setFiltreMedecin(e.target.value)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 outline-none focus:border-slate-400 transition-colors">
            {['Tous','El Harrab','Benali','Ibrahim'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.1)}>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">
            {filtered.length} patient{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </p>
          {printed.length > 0 && (
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              {printed.length} dossier{printed.length > 1 ? 's' : ''} imprimé{printed.length > 1 ? 's' : ''} ce jour
            </p>
          )}
        </div>
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((p,i) => (
              <PatientRow key={p.id} patient={p} index={i}
                onApercu={setPatientApercu}
                onImprimer={handleImprimer}
                printed={printed.includes(p.id)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FileText size={44} strokeWidth={1.2} className="text-slate-300" />
            <p className="text-[14px] font-semibold text-slate-400">Aucun dossier trouvé</p>
          </div>
        )}
      </motion.div>

      <motion.div {...fadeUp(0.2)} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <Printer size={15} className="text-slate-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[12px] font-semibold text-slate-600">Rapport de synthèse complet</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            3 pages A4 : <strong>Page 1</strong> infos + antécédents + examen clinique · <strong>Page 2</strong> mammographie + échographie · <strong>Page 3</strong> IRM + biopsie + traitements + RDV + signature.
            L'impression s'ouvre dans une nouvelle fenêtre.
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {patientApercu && (
          <ModalApercu
            patient={patientApercu}
            onClose={() => setPatientApercu(null)}
            onImprimer={p => { handleImprimer(p); setPatientApercu(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}