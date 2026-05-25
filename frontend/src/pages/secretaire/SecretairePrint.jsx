import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer, Search, FileText, Eye, X,
  Filter, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import secretairePrintService
  from '../../services/secretairePrintService';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut', delay },
});

const TYPE_LABELS_BIO = {
  fibroadenoma:      'Fibroadénome',
  tubular_adenoma:   'Adénome Tubulaire',
  ductal_carcinoma:  'Carcinome Canalaire',
  mucinous_carcinoma:'Carcinome Mucineux',
};

const fmtBool = (v) =>
  (v === true || v === 'Oui') ? 'Oui' : 'Non';

/* ════════════════════════════════════════
   GÉNÉRATEUR HTML POUR IMPRESSION
═══════════════════════════════════════ */
const genererHTML = (patient, biopsies, plans, rdvs) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const refId = patient.id?.toString()
    .replace(/-/g, '').substring(0, 8).toUpperCase()
    || 'ONCO0001';

  const row = (label, value, color) => `
    <div style="display:flex;justify-content:space-between;
      align-items:flex-start;padding:5px 0;
      border-bottom:1px solid #f1f5f9;">
      <span style="font-size:8px;font-weight:900;
        text-transform:uppercase;letter-spacing:0.1em;
        color:#94a3b8;flex-shrink:0;margin-right:16px;">
        ${label}
      </span>
      <span style="font-size:9px;font-weight:900;
        text-transform:uppercase;text-align:right;
        line-height:1.3;color:${color || '#1e293b'};">
        ${value || '—'}
      </span>
    </div>`;

  const section = (title) => `
    <div style="margin-top:18px;margin-bottom:6px;">
      <p style="font-size:8px;font-weight:900;
        text-transform:uppercase;letter-spacing:0.35em;
        color:#ec4899;padding-bottom:4px;
        border-bottom:1px solid #fce7f3;margin:0;">
        ${title}
      </p>
    </div>`;

  const texte = (text) => text ? `
    <div style="padding:5px 0;border-bottom:1px solid #f1f5f9;">
      <p style="font-size:9px;font-weight:500;
        color:#1e293b;line-height:1.6;margin:0;">${text}</p>
    </div>` : '';

  const sousTitre = (t) =>
    `<p style="font-size:7px;font-weight:900;
      text-transform:uppercase;letter-spacing:0.3em;
      color:#94a3b8;margin:10px 0 3px;">${t}</p>`;

  const filigrane = `
    <div style="position:absolute;inset:0;display:flex;
      align-items:center;justify-content:center;
      opacity:0.03;pointer-events:none;
      transform:rotate(-35deg);overflow:hidden;">
      <span style="font-size:60px;font-weight:900;
        text-transform:uppercase;letter-spacing:0.5em;
        color:#0f172a;white-space:nowrap;">ONCOASSIST</span>
    </div>`;

  const pageStyle = `
    width:210mm;min-height:297mm;background:#fff;
    padding:15mm;box-sizing:border-box;position:relative;
    display:flex;flex-direction:column;
    font-family:system-ui,sans-serif;
    page-break-after:always;`;

  const header = `
    <div style="margin-bottom:28px;padding-bottom:18px;
      border-bottom:2px solid #0f172a;display:flex;
      justify-content:space-between;align-items:flex-start;">
      <div>
        <h2 style="font-size:20px;font-weight:900;
          color:#0f172a;font-style:italic;
          text-transform:uppercase;margin:0;">
          CENTRE D'ONCOLOGIE
        </h2>
        <p style="font-size:9px;font-weight:700;
          color:#94a3b8;margin:3px 0 0;font-style:italic;">
          Pôle d'excellence en oncologie
        </p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:11px;font-weight:900;
          text-transform:uppercase;letter-spacing:0.25em;
          color:#ec4899;margin:0;">Rapport de Synthèse</p>
        <p style="font-size:10px;font-weight:900;
          text-transform:uppercase;letter-spacing:0.1em;
          color:#94a3b8;margin:3px 0 0;">
          Dossier Médical Complet
        </p>
        <p style="font-size:9px;color:#94a3b8;
          margin:4px 0 0;">${today}</p>
        <p style="font-size:9px;font-weight:900;
          color:#1e293b;margin:3px 0 0;
          text-transform:uppercase;">
          ${patient.prenom} ${patient.nom}
        </p>
      </div>
    </div>`;

  const headerMini = `
    <div style="margin-bottom:16px;padding-bottom:10px;
      border-bottom:1px solid #e2e8f0;display:flex;
      justify-content:space-between;align-items:center;">
      <p style="font-size:9px;font-weight:900;
        color:#94a3b8;text-transform:uppercase;
        letter-spacing:0.15em;margin:0;">
        CENTRE D'ONCOLOGIE
      </p>
      <p style="font-size:8px;color:#94a3b8;margin:0;">
        ${patient.prenom} ${patient.nom} · ${today}
      </p>
    </div>`;

  const footer = `
    <div style="margin-top:auto;padding-top:20px;
      border-top:1px solid #e2e8f0;">
      <div style="display:grid;grid-template-columns:1fr 1fr;
        gap:40px;margin-bottom:24px;">
        <div>
          <p style="font-size:8px;font-weight:900;
            text-transform:uppercase;letter-spacing:0.1em;
            color:#94a3b8;margin:0 0 4px;">
            Médecin responsable
          </p>
          <p style="font-size:9px;font-weight:700;
            color:#1e293b;margin:0;">
            Dr. ${patient.medecinRef || '—'}
          </p>
          <div style="margin-top:28px;
            border-bottom:1px solid #cbd5e1;
            width:120px;"></div>
          <p style="font-size:7px;color:#94a3b8;
            margin:4px 0 0;">Signature</p>
        </div>
        <div>
          <p style="font-size:8px;font-weight:900;
            text-transform:uppercase;letter-spacing:0.1em;
            color:#94a3b8;margin:0 0 4px;">
            Cachet établissement
          </p>
          <div style="width:80px;height:80px;
            border:1px dashed #e2e8f0;border-radius:4px;
            display:flex;align-items:center;
            justify-content:center;">
            <p style="font-size:7px;color:#e2e8f0;
              text-align:center;font-weight:700;
              text-transform:uppercase;margin:0;">
              Cachet<br/>officiel
            </p>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;
        align-items:flex-end;">
        <div>
          <p style="font-size:7px;color:#94a3b8;
            text-transform:uppercase;font-weight:900;margin:0;">
            Réf document
          </p>
          <p style="font-size:8px;font-family:monospace;
            font-weight:700;color:#475569;margin:2px 0 0;">
            ONCO-${refId}
          </p>
        </div>
      </div>
    </div>`;

  // Première biopsie
  const biopsie = biopsies?.[0];

  /* PAGE 1 */
  const page1 = `
    <div style="${pageStyle}">
      ${filigrane}
      <div style="position:relative;z-index:10;
        display:flex;flex-direction:column;flex:1;">
        ${header}
        ${section('Informations Générales')}
        ${row('Nom Complet', `${patient.prenom} ${patient.nom}`)}
        ${row('Date de Naissance',
          patient.dateNaissance
            ? new Date(patient.dateNaissance)
                .toLocaleDateString('fr-FR')
            : '—'
        )}
        ${row('Âge', patient.age ? `${patient.age} ans` : '—')}
        ${row('Téléphone', patient.telephone)}
        ${row('Email', patient.email)}
        ${row('Adresse', patient.adresse)}
        ${row('Médecin référent',
          patient.medecinRef
            ? `Dr. ${patient.medecinRef}`
            : '—'
        )}
        ${row('Statut dossier',
          patient.statut || '—',
          patient.statut === 'CRITIQUE' ? '#e11d48'
            : patient.statut === 'STABLE' ? '#059669'
            : '#94a3b8'
        )}
      </div>
    </div>`;

  /* PAGE 2 — Biopsie */
  const page2 = `
    <div style="${pageStyle}">
      ${filigrane}
      <div style="position:relative;z-index:10;
        display:flex;flex-direction:column;flex:1;">
        ${headerMini}
        ${biopsie ? (() => {
          const malin = biopsie.classeBinaire === 'MALIN';
          const scoreB = biopsie.scoreBenignMalin
            ? `${(biopsie.scoreBenignMalin * 100).toFixed(1)}%`
            : '—';
          const scoreT = biopsie.scoreTypeConfiance
            ? `${(biopsie.scoreTypeConfiance * 100).toFixed(1)}%`
            : '—';
          return `
            ${section('Analyse de Biopsie')}
            ${row('Date',
              biopsie.date
                ? new Date(biopsie.date)
                    .toLocaleDateString('fr-FR')
                : '—'
            )}
            ${row('Médecin',
              biopsie.auteurPrenom && biopsie.auteurNom
                ? `Dr. ${biopsie.auteurPrenom} ${biopsie.auteurNom}`
                : '—'
            )}
            ${row('Site Anatomique', biopsie.siteAnatomique)}
            ${row('Grossissement', biopsie.grossissement)}
            ${biopsie.isAnalysed ? `
              ${row('Résultat IA',
                `${malin ? 'Malin' : 'Bénin'} — ${scoreB}`,
                malin ? '#e11d48' : '#059669'
              )}
              ${biopsie.typeTumeur ? row('Type Tumeur',
                `${TYPE_LABELS_BIO[biopsie.typeTumeur]
                  || biopsie.typeTumeur} — ${scoreT}`
              ) : ''}
            ` : row('Statut Analyse', 'Non analysée', '#94a3b8')}
            ${biopsie.notes
              ? sousTitre('Notes anatomopathologiques')
                + texte(biopsie.notes)
              : ''}`;
        })() : `
          ${section('Analyse de Biopsie')}
          <p style="font-size:9px;color:#cbd5e1;
            font-style:italic;margin-top:8px;">
            Aucune biopsie enregistrée.
          </p>`}
      </div>
    </div>`;

  /* PAGE 3 — Plans + RDV + Footer */
  const page3 = `
    <div style="${pageStyle}">
      ${filigrane}
      <div style="position:relative;z-index:10;
        display:flex;flex-direction:column;flex:1;">
        ${headerMini}
        ${section('Plans de Traitement')}
        ${plans?.length > 0
          ? plans.map((p, i) => row(
              `Séance ${i + 1} — ${p.dateConsultation
                ? new Date(p.dateConsultation)
                    .toLocaleDateString('fr-FR')
                : '—'}`,
              `${p.etape || '—'} [${p.statut || '—'}]`,
              p.statut === 'en cours' ? '#7c3aed'
                : p.statut === 'fait' ? '#059669'
                : '#94a3b8'
            )).join('')
          : `<p style="font-size:9px;color:#cbd5e1;
              font-style:italic;margin-top:8px;">
              Aucun plan de traitement enregistré.
            </p>`
        }
        ${section('Historique des Rendez-vous')}
        ${rdvs?.length > 0
          ? rdvs.map(r => row(
              r.heure
                ? `${r.jour || ''} ${r.heure}`
                : r.date
                  ? new Date(r.date)
                      .toLocaleDateString('fr-FR')
                  : '—',
              `${r.motif || '—'} [${r.statut || '—'}]`,
              r.statut === 'EFFECTUE' ? '#059669'
                : r.statut === 'CONFIRME'
                    || r.statut === 'PLANIFIE'
                  ? '#7c3aed'
                  : '#d97706'
            )).join('')
          : `<p style="font-size:9px;color:#cbd5e1;
              font-style:italic;margin-top:8px;">
              Aucun rendez-vous enregistré.
            </p>`
        }
        ${footer}
      </div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Rapport — ${patient.prenom} ${patient.nom}</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { background:#f1f5f9; }
    @media print {
      body { background:#fff; }
      @page { size:A4; margin:0; }
      div { page-break-after:always; }
      div:last-child { page-break-after:avoid; }
    }
  </style>
</head>
<body>${page1}${page2}${page3}</body>
</html>`;
};

/* ════════════════════════════════════════
   STYLES APERÇU
═══════════════════════════════════════ */
const s = {
  page: {
    width: '210mm', minHeight: '297mm', background: '#fff',
    padding: '15mm', boxSizing: 'border-box',
    position: 'relative', display: 'flex',
    flexDirection: 'column', fontFamily: 'system-ui,sans-serif',
    marginBottom: '24px',
    boxShadow: '0 4px 40px rgba(0,0,0,0.15)'
  },
  fili: {
    position: 'absolute', inset: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    opacity: 0.025, pointerEvents: 'none',
    transform: 'rotate(-35deg)', overflow: 'hidden'
  },
  inner: {
    position: 'relative', zIndex: 10,
    display: 'flex', flexDirection: 'column', flex: 1
  },
};

const Row = ({ label, value, color }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: '5px 0',
    borderBottom: '1px solid #f1f5f9'
  }}>
    <span style={{
      fontSize: '8px', fontWeight: 900,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      color: '#94a3b8', flexShrink: 0, marginRight: '16px'
    }}>{label}</span>
    <span style={{
      fontSize: '9px', fontWeight: 900,
      textTransform: 'uppercase', textAlign: 'right',
      lineHeight: 1.3, color: color || '#1e293b'
    }}>{value || '—'}</span>
  </div>
);

const Sec = ({ title }) => (
  <div style={{ marginTop: '18px', marginBottom: '6px' }}>
    <p style={{
      fontSize: '8px', fontWeight: 900,
      textTransform: 'uppercase', letterSpacing: '0.35em',
      color: '#ec4899', paddingBottom: '4px',
      borderBottom: '1px solid #fce7f3', margin: 0
    }}>{title}</p>
  </div>
);

const Txt = ({ text }) => text ? (
  <div style={{ padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
    <p style={{
      fontSize: '9px', fontWeight: 500,
      color: '#1e293b', lineHeight: 1.6, margin: 0
    }}>{text}</p>
  </div>
) : null;

const Filigrane = () => (
  <div style={s.fili}>
    <span style={{
      fontSize: '60px', fontWeight: 900,
      textTransform: 'uppercase', letterSpacing: '0.5em',
      color: '#0f172a', whiteSpace: 'nowrap'
    }}>ONCOASSIST</span>
  </div>
);

const HeaderPage1 = ({ patient }) => (
  <div style={{
    marginBottom: '28px', paddingBottom: '18px',
    borderBottom: '2px solid #0f172a', display: 'flex',
    justifyContent: 'space-between', alignItems: 'flex-start'
  }}>
    <div>
      <h2 style={{
        fontSize: '20px', fontWeight: 900, color: '#0f172a',
        fontStyle: 'italic', textTransform: 'uppercase', margin: 0
      }}>CENTRE D'ONCOLOGIE</h2>
      <p style={{
        fontSize: '9px', fontWeight: 700, color: '#94a3b8',
        margin: '3px 0 0', fontStyle: 'italic'
      }}>Pôle d'excellence en oncologie</p>
    </div>
    <div style={{ textAlign: 'right' }}>
      <p style={{
        fontSize: '11px', fontWeight: 900,
        textTransform: 'uppercase', letterSpacing: '0.25em',
        color: '#ec4899', margin: 0
      }}>Rapport de Synthèse</p>
      <p style={{
        fontSize: '9px', color: '#94a3b8', margin: '4px 0 0'
      }}>{new Date().toLocaleDateString('fr-FR')}</p>
      <p style={{
        fontSize: '9px', fontWeight: 900,
        color: '#1e293b', margin: '3px 0 0',
        textTransform: 'uppercase'
      }}>{patient.prenom} {patient.nom}</p>
    </div>
  </div>
);

const HeaderMini = ({ patient }) => (
  <div style={{
    marginBottom: '14px', paddingBottom: '8px',
    borderBottom: '1px solid #e2e8f0', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center'
  }}>
    <p style={{
      fontSize: '9px', fontWeight: 900, color: '#94a3b8',
      textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0
    }}>CENTRE D'ONCOLOGIE</p>
    <p style={{ fontSize: '8px', color: '#94a3b8', margin: 0 }}>
      {patient.prenom} {patient.nom} ·{' '}
      {new Date().toLocaleDateString('fr-FR')}
    </p>
  </div>
);

const FooterPreview = ({ patient }) => (
  <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '20px' }}>
      <div>
        <p style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', margin: '0 0 4px' }}>Médecin responsable</p>
        <p style={{ fontSize: '9px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Dr. {patient.medecinRef || '—'}</p>
        <div style={{ marginTop: '28px', borderBottom: '1px solid #cbd5e1', width: '120px' }} />
        <p style={{ fontSize: '7px', color: '#94a3b8', margin: '4px 0 0' }}>Signature</p>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════
   PAGES APERÇU REACT
═══════════════════════════════════════ */
const AperçuPage1 = ({ patient }) => (
  <div style={s.page}>
    <Filigrane />
    <div style={s.inner}>
      <HeaderPage1 patient={patient} />
      <Sec title="Informations Générales" />
      <Row label="Nom Complet"
        value={`${patient.prenom} ${patient.nom}`} />
      <Row label="Date de Naissance"
        value={patient.dateNaissance
          ? new Date(patient.dateNaissance)
              .toLocaleDateString('fr-FR')
          : '—'} />
      <Row label="Âge"
        value={patient.age ? `${patient.age} ans` : '—'} />
      <Row label="Téléphone" value={patient.telephone} />
      <Row label="Email" value={patient.email} />
      <Row label="Adresse" value={patient.adresse} />
      <Row label="Médecin référent"
        value={patient.medecinRef
          ? `Dr. ${patient.medecinRef}`
          : '—'} />
      <Row label="Statut"
        value={patient.statut}
        color={patient.statut === 'CRITIQUE' ? '#e11d48'
          : patient.statut === 'STABLE' ? '#059669'
          : '#94a3b8'} />
    </div>
  </div>
);

const AperçuPage2 = ({ biopsies }) => {
  const biopsie = biopsies?.[0];
  return (
    <div style={s.page}>
      <Filigrane />
      <div style={s.inner}>
        <Sec title="Analyse de Biopsie" />
        {biopsie ? (
          <>
            <Row label="Date"
              value={biopsie.date
                ? new Date(biopsie.date)
                    .toLocaleDateString('fr-FR')
                : '—'} />
            <Row label="Médecin"
              value={biopsie.auteurPrenom
                ? `Dr. ${biopsie.auteurPrenom} ${biopsie.auteurNom}`
                : '—'} />
            <Row label="Site Anatomique"
              value={biopsie.siteAnatomique} />
            <Row label="Grossissement"
              value={biopsie.grossissement} />
            {biopsie.isAnalysed ? (
              <>
                <Row label="Résultat IA"
                  value={`${biopsie.classeBinaire === 'MALIN'
                    ? 'Malin' : 'Bénin'} — ${biopsie.scoreBenignMalin
                    ? (biopsie.scoreBenignMalin * 100).toFixed(1) + '%'
                    : '—'}`}
                  color={biopsie.classeBinaire === 'MALIN'
                    ? '#e11d48' : '#059669'} />
                {biopsie.typeTumeur && (
                  <Row label="Type Tumeur"
                    value={TYPE_LABELS_BIO[biopsie.typeTumeur]
                      || biopsie.typeTumeur} />
                )}
              </>
            ) : (
              <Row label="Statut" value="Non analysée"
                color="#94a3b8" />
            )}
            {biopsie.notes && (
              <Txt text={biopsie.notes} />
            )}
          </>
        ) : (
          <p style={{ fontSize: '9px', color: '#cbd5e1',
            fontStyle: 'italic', marginTop: '8px' }}>
            Aucune biopsie enregistrée.
          </p>
        )}
      </div>
    </div>
  );
};

const AperçuPage3 = ({ patient, plans, rdvs }) => (
  <div style={s.page}>
    <Filigrane />
    <div style={s.inner}>
      <Sec title="Plans de Traitement" />
      {plans?.length > 0 ? plans.map((p, i) => (
        <Row key={i}
          label={`Séance ${i + 1} — ${p.dateConsultation
            ? new Date(p.dateConsultation)
                .toLocaleDateString('fr-FR')
            : '—'}`}
          value={`${p.etape || '—'} [${p.statut || '—'}]`}
          color={p.statut === 'en cours' ? '#7c3aed'
            : p.statut === 'fait' ? '#059669'
            : '#94a3b8'} />
      )) : (
        <p style={{ fontSize: '9px', color: '#cbd5e1',
          fontStyle: 'italic', marginTop: '8px' }}>
          Aucun plan de traitement.
        </p>
      )}
      <Sec title="Historique des Rendez-vous" />
      {rdvs?.length > 0 ? rdvs.map((r, i) => (
        <Row key={i}
          label={r.date
            ? new Date(r.date).toLocaleDateString('fr-FR')
            : '—'}
          value={`${r.motif || '—'} [${r.statut || '—'}]`}
          color={r.statut === 'EFFECTUE' ? '#059669'
            : r.statut === 'CONFIRME'
                || r.statut === 'PLANIFIE' ? '#7c3aed'
            : '#d97706'} />
      )) : (
        <p style={{ fontSize: '9px', color: '#cbd5e1',
          fontStyle: 'italic', marginTop: '8px' }}>
          Aucun rendez-vous enregistré.
        </p>
      )}
      <FooterPreview patient={patient} />
    </div>
  </div>
);

/* ════════════════════════════════════════
   MODAL APERÇU
═══════════════════════════════════════ */
const ModalApercu = ({
  patient, biopsies, plans, rdvs, onClose, onImprimer
}) => (
  <div style={{
    position: 'fixed', top: 0, left: 0,
    width: '100vw', height: '100vh', zIndex: 999999,
    display: 'flex', flexDirection: 'column',
    background: 'rgba(15,23,42,0.82)',
    backdropFilter: 'blur(6px)',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px', background: '#fff',
      borderBottom: '1px solid #f1f5f9', flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '16px',
          background: '#ec4899', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#fff'
        }}>
          <FileText size={22} />
        </div>
        <div>
          <h3 style={{
            fontSize: '15px', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            color: '#0f172a', margin: 0
          }}>Rapport de Synthèse</h3>
          <p style={{
            fontSize: '10px', fontWeight: 900,
            color: '#94a3b8', textTransform: 'uppercase',
            letterSpacing: '0.1em', margin: '2px 0 0'
          }}>
            {patient.nom} {patient.prenom}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', background: '#fffbeb',
          border: '1px solid #fde68a', borderRadius: '8px'
        }}>
          <AlertCircle size={12} color="#d97706" />
          <span style={{
            fontSize: '10px', fontWeight: 600, color: '#d97706'
          }}>Lecture seule</span>
        </div>
        <button
          onClick={() => onImprimer(patient, biopsies, plans, rdvs)}
          style={{
            height: '44px', padding: '0 24px',
            borderRadius: '12px', background: '#0f172a',
            color: '#fff', fontSize: '11px', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
          <Printer size={16} /> Imprimer
        </button>
        <button onClick={onClose} style={{
          width: '44px', height: '44px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          borderRadius: '12px', background: '#fff',
          border: '1px solid #e2e8f0', cursor: 'pointer',
          color: '#64748b'
        }}>
          <X size={18} />
        </button>
      </div>
    </div>
    <div style={{
      flex: 1, overflowY: 'auto', background: '#e2e8f0',
      padding: '32px', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: '24px'
    }}>
      <AperçuPage1 patient={patient} />
      <AperçuPage2 biopsies={biopsies} />
      <AperçuPage3 patient={patient} plans={plans} rdvs={rdvs} />
    </div>
  </div>
);

/* ════════════════════════════════════════
   LIGNE PATIENT
═══════════════════════════════════════ */
const PatientRow = ({
  patient, index, onApercu, onImprimer, printed
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
  >
    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-[12px] font-black shrink-0">
      {patient.nom?.[0]}{patient.prenom?.[0]}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-semibold text-slate-900 truncate">
          {patient.nom} {patient.prenom}
        </p>
        {printed && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
            ✓ Imprimé
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
        <span className="text-[11px] text-slate-400">
          {patient.age ? `${patient.age} ans` : '—'}
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-200" />
        <span className="text-[11px] text-slate-500">
          {patient.medecinRef
            ? `Dr. ${patient.medecinRef}`
            : 'Non assigné'}
        </span>
        {patient.derniereConsultation && <>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span className="text-[11px] text-slate-400">
            {patient.derniereConsultation}
          </span>
        </>}
      </div>
    </div>
    <span className={`hidden sm:inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${
      patient.statut === 'STABLE' || patient.statut === 'EN_SUIVI'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : patient.statut === 'A_SURVEILLER'
          ? 'bg-amber-50 text-amber-700 border-amber-200'
        : patient.statut === 'CRITIQUE'
          ? 'bg-red-50 text-red-700 border-red-200'
        : patient.statut === 'NOUVELLE'
          ? 'bg-violet-50 text-violet-700 border-violet-200'
        : 'bg-slate-100 text-slate-500 border-slate-200'
    }`}>
      {patient.statut || '—'}
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
  const [patients, setPatients]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState('');
  const [filtreMedecin, setFiltreMedecin] = useState('Tous');
  const [patientApercu, setPatientApercu] = useState(null);
  const [apercuData, setApercuData]       = useState(null);
  const [loadingApercu, setLoadingApercu] = useState(false);
  const [printed, setPrinted]             = useState([]);
  const [medecins, setMedecins]           = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const data = await secretairePrintService
          .getAllPatients();
        setPatients(data);
        // Médecins uniques pour le filtre
        const meds = [...new Set(
          data.map(p => p.medecinRef).filter(Boolean)
        )];
        setMedecins(meds);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || p.nom?.toLowerCase().includes(q)
      || p.prenom?.toLowerCase().includes(q)
      || p.email?.toLowerCase().includes(q);
    const matchMedecin = filtreMedecin === 'Tous'
      || p.medecinRef === filtreMedecin;
    return matchSearch && matchMedecin;
  });

  // Charger les données complètes pour l'aperçu
  const handleApercu = async (patient) => {
    setPatientApercu(patient);
    setLoadingApercu(true);
    try {
      const [biopsies, plans, rdvs] = await Promise.all([
        secretairePrintService.getBiopsies(patient.id),
        secretairePrintService.getPlansTraitement(patient.id),
        secretairePrintService.getRendezVous(patient.id)
      ]);
      setApercuData({ biopsies, plans, rdvs });
    } catch (err) {
      console.error(err);
      setApercuData({ biopsies: [], plans: [], rdvs: [] });
    } finally {
      setLoadingApercu(false);
    }
  };

  // Imprimer directement sans aperçu
  const handleImprimer = async (
    patient, biopsies, plans, rdvs
  ) => {
    setPrinted(prev => [...new Set([...prev, patient.id])]);

    let b = biopsies;
    let p = plans;
    let r = rdvs;

    // Si pas encore chargé, charger maintenant
    if (!b) {
      try {
        [b, p, r] = await Promise.all([
          secretairePrintService.getBiopsies(patient.id),
          secretairePrintService.getPlansTraitement(patient.id),
          secretairePrintService.getRendezVous(patient.id)
        ]);
      } catch {
        b = []; p = []; r = [];
      }
    }

    const html = genererHTML(patient, b, p, r);
    const win = window.open(
      '', '_blank', 'width=900,height=700'
    );
    if (!win) {
      alert('Autorisez les popups pour imprimer.');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 600);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32}
          className="animate-spin text-pink-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={32} className="text-red-500" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <motion.div {...fadeUp(0)}>
        <h2 className="text-xl font-black text-slate-900">
          Imprimer dossier
        </h2>
        <p className="text-[12px] text-slate-400 font-medium mt-0.5">
          Rapport de synthèse complet — 3 pages A4 par dossier
        </p>
      </motion.div>

      {/* Recherche */}
      <motion.div {...fadeUp(0.05)}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text"
            placeholder="Rechercher par nom, prénom ou email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 outline-none focus:border-slate-400 transition-all placeholder:text-slate-300" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select value={filtreMedecin}
            onChange={e => setFiltreMedecin(e.target.value)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 outline-none focus:border-slate-400 transition-colors">
            <option value="Tous">Tous</option>
            {medecins.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Liste patients */}
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
            {filtered.map((p, i) => (
              <PatientRow key={p.id} patient={p} index={i}
                onApercu={handleApercu}
                onImprimer={patient =>
                  handleImprimer(patient, null, null, null)
                }
                printed={printed.includes(p.id)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FileText size={44} strokeWidth={1.2}
              className="text-slate-300" />
            <p className="text-[14px] font-semibold text-slate-400">
              Aucun dossier trouvé
            </p>
          </div>
        )}
      </motion.div>

      {/* Note */}
      <motion.div {...fadeUp(0.2)}
        className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <Printer size={15} className="text-slate-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[12px] font-semibold text-slate-600">
            Rapport de synthèse complet
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            3 pages A4 : <strong>Page 1</strong> informations
            générales · <strong>Page 2</strong> biopsie ·{' '}
            <strong>Page 3</strong> plans de traitement + RDV
            + signature.
          </p>
        </div>
      </motion.div>

      {/* Modal aperçu */}
      <AnimatePresence>
        {patientApercu && (
          loadingApercu ? (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 999999,
              background: 'rgba(15,23,42,0.82)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Loader2 size={40}
                className="animate-spin text-white" />
            </div>
          ) : (
            <ModalApercu
              patient={patientApercu}
              biopsies={apercuData?.biopsies || []}
              plans={apercuData?.plans || []}
              rdvs={apercuData?.rdvs || []}
              onClose={() => {
                setPatientApercu(null);
                setApercuData(null);
              }}
              onImprimer={handleImprimer}
            />
          )
        )}
      </AnimatePresence>
    </div>
  );
}