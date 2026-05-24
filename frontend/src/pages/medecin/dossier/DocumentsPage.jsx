import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../services/axiosInstance';
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Printer, Eye, X, Calendar,
  ClipboardList, Trash2, Edit3, CheckSquare, Square,
  FileCheck, Plus, Loader2, Stethoscope, Zap, Layers,
  Microscope, Activity, ChevronRight
} from 'lucide-react';
import {
  getOrdonnances, getResultats,
  creerDocument, supprimerDocument
} from '../../../services/documentService';
import { getConsultations }      from '../../../services/consultationService';
import { getEchographies }       from '../../../services/echographieService';
import { getIRMs }               from '../../../services/irmService';
import { getBiopsiesByDossier }  from '../../../services/biopsieService';
import mammographieService       from '../../../services/mammographieService';

// ─── helpers ──────────────────────────────────────────────────
const fmt     = (v) => v || '—';
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR') : '—';
const fmtBool = (v)  => (v === true || v === 'Oui') ? 'Oui' : 'Non';

const TYPE_LABELS_BIO = {
  fibroadenoma      : 'Fibroadénome',
  tubular_adenoma   : 'Adénome Tubulaire',
  ductal_carcinoma  : 'Carcinome Canalaire',
  mucinous_carcinoma: 'Carcinome Mucineux',
};

// ══════════════════════════════════════════════════════════════
// COMPOSANTS PDF PARTAGÉS
// ══════════════════════════════════════════════════════════════
const PdfWrap = ({ children }) => (
  <div className="w-full min-h-[297mm] bg-white p-[15mm] relative flex flex-col"
       style={{ fontFamily: 'system-ui,sans-serif' }}>
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.025]
                    pointer-events-none rotate-[-35deg] select-none overflow-hidden">
      <span className="text-6xl font-black uppercase tracking-[0.5em] text-slate-900">
        ONCOASSIST
      </span>
    </div>
    <div className="relative z-10 flex flex-col flex-1">{children}</div>
  </div>
);

const PdfHeader = ({ title, subtitle, date, docteur }) => (
  <div className="mb-8 pb-5 border-b-2 border-slate-900 flex justify-between items-start">
    <div>
      <h2 className="text-xl font-black tracking-tighter text-slate-900 italic uppercase">
        CLINIQUE DU SEIN
      </h2>
      <p className="text-[9px] font-bold text-slate-500 mt-0.5 italic">
        Pôle d'excellence en oncologie
      </p>
    </div>
    <div className="text-right">
      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-pink-600">{title}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">
        {subtitle}
      </p>
      <p className="text-[9px] font-bold text-slate-400 mt-1">{date}</p>
      {docteur && (
        <p className="text-[9px] font-black text-slate-700 mt-0.5 uppercase">Dr. {docteur}</p>
      )}
    </div>
  </div>
);

const PdfFooter = ({ id }) => (
  <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between items-end">
    <div>
      <p className="text-[7px] text-slate-400 uppercase font-black">Réf document</p>
      <p className="text-[8px] font-mono font-bold text-slate-700">
        ONCO-{String(id || '').substring(0, 8).toUpperCase() || 'XXXXXX'}
      </p>
    </div>
    <div className="flex flex-col items-center opacity-30">
      <div className="w-10 h-10 border border-slate-400 flex items-center
                      justify-center rounded mb-1">
        <span className="text-[5px] font-mono leading-none text-center">QR VALIDÉ</span>
      </div>
      <p className="text-[6px] font-black uppercase">Signé électroniquement</p>
    </div>
  </div>
);

const PdfSection = ({ title }) => (
  <h3 className="text-[8px] font-black uppercase tracking-[0.35em] text-pink-600
                 mt-5 mb-2 pb-1 border-b border-pink-100">
    {title}
  </h3>
);

const PdfRow = ({ label, value, accent }) => (
  <div className="flex justify-between items-start py-1.5 border-b border-slate-100 last:border-0">
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0 mr-4">
      {label}
    </span>
    <span className={`text-[10px] font-black uppercase tracking-tight text-right
                      leading-snug ${accent || 'text-slate-800'}`}>
      {value}
    </span>
  </div>
);

const PdfTexte = ({ text }) => (
  text
    ? <div className="flex justify-between items-start py-1.5 border-b border-slate-100">
        <p className="text-[10px] font-medium text-slate-800 leading-relaxed">{text}</p>
      </div>
    : null
);

// ══════════════════════════════════════════════════════════════
// PDF RAPPORT — composants
// ══════════════════════════════════════════════════════════════
const RapportSection = ({ title }) => (
  <div className="mt-6 mb-2">
    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-pink-600
                  pb-1 border-b border-pink-100">{title}</p>
  </div>
);

const RapportRow = ({ label, value }) => (
  <div className="flex justify-between py-1 border-b border-slate-100 last:border-0">
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400
                     shrink-0 mr-4">{label}</span>
    <span className="text-[9px] font-medium text-slate-800 text-right leading-snug">
      {value || '—'}
    </span>
  </div>
);

const RapportTexte = ({ text }) => (
  text
    ? <p className="text-[9px] font-medium text-slate-700 leading-relaxed py-1
                    border-b border-slate-100">{text}</p>
    : null
);

// ══════════════════════════════════════════════════════════════
// PDF RAPPORT DE SYNTHÈSE
// ══════════════════════════════════════════════════════════════
const PdfRapport = ({ selection, examensData, patient }) => {
  const hasManuel  = selection.examenManuel && examensData.RESULTAT_MANUEL?.length  > 0;
  const hasMammo   = selection.mammographie && examensData.RESULTAT_MAMMOGRAPHIE?.length > 0;
  const hasEcho    = selection.echographie  && examensData.RESULTAT_ECHOGRAPHIE?.length > 0;
  const hasIRM     = selection.irm          && examensData.RESULTAT_IRM?.length     > 0;
  const hasBiopsie = selection.biopsie      && examensData.RESULTAT_BIOPSIE?.length  > 0;

  return (
    <PdfWrap>
      <div className="mb-8 pb-5 border-b-2 border-slate-900 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-black tracking-tighter text-slate-900 italic uppercase">
            CLINIQUE DU SEIN
          </h2>
          <p className="text-[9px] font-bold text-slate-500 mt-0.5 italic">
            Pôle d'excellence en oncologie
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-pink-600">
            Rapport de Synthèse
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">
            Dossier Médical Complet
          </p>
          <p className="text-[9px] font-bold text-slate-400 mt-1">
            {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* INFOS GÉNÉRALES */}
      {selection.infosGenerales && (<>
        <RapportSection title="Informations Générales" />
        {patient ? (<>
          <RapportRow label="Nom Complet"
            value={`${patient.prenom || ''} ${patient.nom || ''}`} />
          <RapportRow label="Date de Naissance"
            value={patient.dateNaissance
              ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : '—'} />
          <RapportRow label="Téléphone"  value={patient.telephone} />
          <RapportRow label="Email"      value={patient.email} />
          <RapportRow label="Adresse"    value={patient.adresse} />
        </>) : (
          <RapportTexte text="Informations patient non disponibles." />
        )}
        {examensData.RESULTAT_MANUEL?.length > 0 && (() => {
          const last  = examensData.RESULTAT_MANUEL[0];
          const medic = last.antecedentsMedicaux  || [];
          const famil = last.antecedentsFamiliaux || [];
          return (<>
            {medic.length > 0 && (<>
              <RapportSection title="Antécédents Médicaux" />
              {medic.map((a, i) => (
                <RapportRow key={i} label={a.maladie}
                  value={[
                    a.statut?.replace('_', ' '),
                    a.dateDiagnostic
                      ? new Date(a.dateDiagnostic).getFullYear() : null,
                    a.traitements || null,
                  ].filter(Boolean).join(' — ')} />
              ))}
            </>)}
            {famil.length > 0 && (<>
              <RapportSection title="Antécédents Familiaux" />
              {famil.map((a, i) => (
                <RapportRow key={i}
                  label={`${a.lienFamilial} — ${a.maladie}`}
                  value={a.ageSurvenue ? `Détecté à ${a.ageSurvenue} ans` : '—'} />
              ))}
            </>)}
          </>);
        })()}
      </>)}

      {/* EXAMEN MANUEL */}
      {hasManuel && (() => {
        const consult = examensData.RESULTAT_MANUEL[0];
        const em      = consult.examenManuel;
        return (<>
          <RapportSection title="Examen Clinique Manuel" />
          <RapportRow label="Date"
            value={fmtDate(em.date)} />
          <RapportRow label="Médecin"
            value={`Dr. ${em.auteurPrenom || ''} ${em.auteurNom || ''}`} />
          <RapportRow label="Site Anatomique"
            value={fmt(em.siteAnatomique)} />
          <RapportRow label="Masse Palpée"
            value={em.massePalpee ? 'Oui' : 'Non'} />
          {em.massePalpee && (
            <RapportRow label="Localisation"
              value={fmt(em.localisationDeMasse)} />
          )}
          <RapportRow label="Aspect Peau"  value={fmt(em.aspectPeau)} />
          <RapportRow label="Adénopathies" value={fmt(em.adenopathies)} />
          {em.description && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400
                           mt-3 mb-1">Conclusions</p>
            <RapportTexte text={em.description} />
          </>)}
        </>);
      })()}

      {/* MAMMOGRAPHIE */}
      {hasMammo && (() => {
        const exam    = examensData.RESULTAT_MAMMOGRAPHIE[0];
        const isMalin = exam.predictionIA === 'MALIGNANT';
        const conf    = (exam.confidencePct || (exam.scoreRisqueIA * 100) || 0).toFixed(1);
        const birads  = exam.scoreBIRADS?.replace('BIRADS_', 'BI-RADS ') || '—';
        return (<>
          <RapportSection title="Mammographie Numérique" />
          <RapportRow label="Date"              value={fmtDate(exam.dateExamen)} />
          <RapportRow label="Médecin"
            value={`Dr. ${exam.auteurPrenom || ''} ${exam.auteurNom || ''}`} />
          <RapportRow label="Classification BI-RADS" value={birads} />
          <RapportRow label="Résultat IA"
            value={`${isMalin ? 'Malin' : 'Bénin'} — ${conf}% de confiance`} />
          {exam.typeTumeur && (
            <RapportRow label="Type Tumeur"
              value={TYPE_LABELS_BIO[exam.typeTumeur] || exam.typeTumeur} />
          )}
          <RapportRow label="Localisation"
            value={`${exam.quadrantShort || '—'} — ${exam.positionText || '—'}`} />
          {exam.recommendationIA && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400
                           mt-3 mb-1">Recommandation</p>
            <RapportTexte text={exam.recommendationIA} />
          </>)}
          {exam.biradsDescription && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400
                           mt-2 mb-1">Observations</p>
            <RapportTexte text={exam.biradsDescription} />
          </>)}
          
        </>);
      })()}

      {/* ÉCHOGRAPHIE */}
      {hasEcho && (() => {
        const exam = examensData.RESULTAT_ECHOGRAPHIE[0];
        return (<>
          <RapportSection title="Échographie Mammaire" />
          <RapportRow label="Date"             value={fmtDate(exam.date)} />
          <RapportRow label="Médecin"
            value={`Dr. ${exam.auteurPrenom || ''} ${exam.auteurNom || ''}`} />
          <RapportRow label="Sein Examiné"     value={fmt(exam.seinExamine)} />
          <RapportRow label="Quadrant"         value={fmt(exam.quadrant)} />
          <RapportRow label="Distance Mamelon"
            value={exam.distanceMamelon ? `${exam.distanceMamelon} cm` : '—'} />
          <RapportRow label="Type Structure"   value={fmt(exam.typeStructure)} />
          <RapportRow label="Forme"            value={fmt(exam.forme)} />
          <RapportRow label="Orientation"      value={fmt(exam.orientation)} />
          <RapportRow label="Contours"         value={fmt(exam.contours)} />
          <RapportRow label="Échostructure"    value={fmt(exam.echostructure)} />
          <RapportRow label="Vascularisation"  value={fmt(exam.vascularisationDoppler)} />
          <RapportRow label="Taille"
            value={`${exam.tailleAxe1||'0'} × ${exam.tailleAxe2||'0'} × ${exam.tailleAxe3||'0'} mm`} />
          <RapportRow label="Calcifications"   value={fmtBool(exam.calcificationsPresentes)} />
          <RapportRow label="Adéno. Axillaire" value={fmtBool(exam.adenopathieAxillaire)} />
          <RapportRow label="Score BI-RADS"    value={fmt(exam.scoreBIRADS)} />
          {exam.recommandation && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400
                           mt-3 mb-1">Recommandation</p>
            <RapportTexte text={exam.recommandation} />
          </>)}
          {exam.resultatDetaille && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400
                           mt-2 mb-1">Observations</p>
            <RapportTexte text={exam.resultatDetaille} />
          </>)}
        </>);
      })()}

      {/* IRM */}
      {hasIRM && (() => {
        const exam = examensData.RESULTAT_IRM[0];
        return (<>
          <RapportSection title="IRM Mammaire" />
          <RapportRow label="Date"              value={fmtDate(exam.date)} />
          <RapportRow label="Médecin"
            value={`Dr. ${exam.auteurPrenom || ''} ${exam.auteurNom || ''}`} />
          <RapportRow label="Sein Examiné"      value={fmt(exam.seinExamine)} />
          <RapportRow label="Séquences"         value={fmt(exam.sequences)} />
          <RapportRow label="Produit Contraste" value={fmt(exam.produitContraste)} />
          <RapportRow label="Quadrant"          value={fmt(exam.quadrant)} />
          <RapportRow label="Forme Lésion"      value={fmt(exam.formeLesion)} />
          <RapportRow label="Contours"          value={fmt(exam.contoursLesion)} />
          <RapportRow label="Signal T2"         value={fmt(exam.signalT2)} />
          <RapportRow label="Cinématique"       value={fmt(exam.cinematiqueRehaussement)} />
          <RapportRow label="Diffusion"         value={fmt(exam.restrictionDiffusion)} />
          <RapportRow label="Valeur ADC"
            value={exam.valeurAdc ? String(exam.valeurAdc) : '—'} />
          <RapportRow label="Taille"
            value={`${exam.tailleAxe1||'0'} × ${exam.tailleAxe2||'0'} × ${exam.tailleAxe3||'0'} mm`} />
          <RapportRow label="Adéno. Axillaire"    value={fmt(exam.adenopathieAxillaire)} />
          <RapportRow label="Adéno. Médiastinale" value={fmt(exam.adenopathieMediastinale)} />
          <RapportRow label="Extension Paroi"     value={fmt(exam.extensionParoi)} />
          <RapportRow label="Extension Cutanée"   value={fmt(exam.extensionCutanee)} />
          <RapportRow label="Score BI-RADS IRM"   value={fmt(exam.scoreBIRADS)} />
          {exam.recommandation && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400
                           mt-3 mb-1">Recommandation</p>
            <RapportTexte text={exam.recommandation} />
          </>)}
          {exam.resultatDetaille && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400
                           mt-2 mb-1">Compte-Rendu Final</p>
            <RapportTexte text={exam.resultatDetaille} />
          </>)}
        </>);
      })()}

      {/* BIOPSIE */}
      {hasBiopsie && (() => {
        const exam    = examensData.RESULTAT_BIOPSIE[0];
        const isMalin = exam.classeBinaire === 'MALIN';
        const scoreB  = exam.scoreBenignMalin
          ? `${(exam.scoreBenignMalin * 100).toFixed(1)}%` : '—';
        const scoreT  = exam.scoreTypeConfiance
          ? `${(exam.scoreTypeConfiance * 100).toFixed(1)}%` : '—';
        return (<>
          <RapportSection title="Analyse de Biopsie" />
          <RapportRow label="Date"              value={fmtDate(exam.date)} />
          <RapportRow label="Médecin"
            value={`Dr. ${exam.auteurPrenom || ''} ${exam.auteurNom || ''}`} />
          <RapportRow label="Site Anatomique"   value={fmt(exam.siteAnatomique)} />
          <RapportRow label="Grossissement"     value={fmt(exam.grossissement)} />
          <RapportRow label="Régions Analysées"
            value={`${exam.imagesAnalysees?.length || 0} zone(s)`} />
          {exam.isAnalysed && (<>
            <RapportRow label="Résultat IA"
              value={`${isMalin ? 'Malin' : 'Bénin'} — ${scoreB} de confiance`} />
            {exam.typeTumeur && (
              <RapportRow label="Type Tumeur"
                value={`${TYPE_LABELS_BIO[exam.typeTumeur] || exam.typeTumeur} — ${scoreT}`} />
            )}
          
          </>)}
          {exam.notes && (<>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400
                           mt-3 mb-1">Compte-Rendu</p>
            <RapportTexte text={exam.notes} />
          </>)}
        </>);
      })()}

      {!selection.infosGenerales && !hasManuel && !hasMammo &&
       !hasEcho && !hasIRM && !hasBiopsie && (
        <p className="text-[10px] text-slate-400 italic mt-8 text-center">
          Aucun élément sélectionné pour ce rapport.
        </p>
      )}

      <PdfFooter id="rapport-global" />
    </PdfWrap>
  );
};

// ══════════════════════════════════════════════════════════════
// PDF PAR EXAMEN
// ══════════════════════════════════════════════════════════════
const PdfExamenManuel = ({ data: consult }) => {
  const em = consult.examenManuel;
  return (
    <PdfWrap>
      <PdfHeader
        title="Examen Clinique Manuel" subtitle="Consultation Sénologique"
        date={fmtDate(em.date)}
        docteur={`${em.auteurPrenom || ''} ${em.auteurNom || ''}`}
      />
      <PdfSection title="Résultats Examen Clinique" />
      <PdfRow label="Site Anatomique" value={fmt(em.siteAnatomique)} accent="text-pink-700" />
      <PdfRow label="Masse Palpée"
        value={em.massePalpee ? 'OUI' : 'NON'}
        accent={em.massePalpee ? 'text-rose-600' : 'text-emerald-600'} />
      <PdfRow label="Localisation"  value={fmt(em.localisationDeMasse)} />
      <PdfRow label="Aspect Peau"   value={fmt(em.aspectPeau)} />
      <PdfRow label="Adénopathies"  value={fmt(em.adenopathies)} />
      {consult.antecedentsMedicaux?.length > 0 && <>
        <PdfSection title="Antécédents Médicaux" />
        {consult.antecedentsMedicaux.map((a, i) => (
          <PdfRow key={i} label={a.maladie}
            value={`${a.statut?.replace('_', ' ')} — ${
              a.dateDiagnostic
                ? new Date(a.dateDiagnostic).getFullYear() : '—'}`} />
        ))}
      </>}
      {consult.antecedentsFamiliaux?.length > 0 && <>
        <PdfSection title="Antécédents Familiaux" />
        {consult.antecedentsFamiliaux.map((a, i) => (
          <PdfRow key={i}
            label={`${a.lienFamilial} — ${a.maladie}`}
            value={a.ageSurvenue ? `à ${a.ageSurvenue} ans` : '—'} />
        ))}
      </>}
      {em.description && <>
        <PdfSection title="Conclusions Cliniques" />
        <PdfTexte text={em.description} />
      </>}
      <PdfFooter id={em.id} />
    </PdfWrap>
  );
};

const PdfEchographie = ({ data: exam }) => (
  <PdfWrap>
    <PdfHeader
      title="Échographie Mammaire" subtitle="Compte-Rendu d'Imagerie"
      date={fmtDate(exam.date)}
      docteur={`${exam.auteurPrenom || ''} ${exam.auteurNom || ''}`}
    />
    <PdfSection title="Localisation" />
    <PdfRow label="Sein Examiné"    value={fmt(exam.seinExamine)} accent="text-pink-700" />
    <PdfRow label="Quadrant"        value={fmt(exam.quadrant)} />
    <PdfRow label="Distance Mamelon"
      value={exam.distanceMamelon ? `${exam.distanceMamelon} cm` : '—'} />
    <PdfSection title="Morphologie" />
    <PdfRow label="Type de Structure"       value={fmt(exam.typeStructure)} />
    <PdfRow label="Forme"                   value={fmt(exam.forme)} />
    <PdfRow label="Orientation"             value={fmt(exam.orientation)} />
    <PdfRow label="Contours"                value={fmt(exam.contours)} />
    <PdfRow label="Échostructure"           value={fmt(exam.echostructure)} />
    <PdfRow label="Effets Postérieurs"      value={fmt(exam.effetsPosterieurs)} />
    <PdfRow label="Vascularisation Doppler" value={fmt(exam.vascularisationDoppler)} />
    <PdfSection title="Biométrie" />
    <PdfRow label="Taille (axe 1×2×3)"
      value={`${exam.tailleAxe1||'0'} × ${exam.tailleAxe2||'0'} × ${exam.tailleAxe3||'0'} mm`}
      accent="text-pink-700" />
    <PdfRow label="Calcifications"
      value={fmtBool(exam.calcificationsPresentes)}
      accent={exam.calcificationsPresentes === 'Oui' ? 'text-rose-600' : 'text-emerald-600'} />
    <PdfRow label="Adéno. Axillaire"
      value={fmtBool(exam.adenopathieAxillaire)}
      accent={exam.adenopathieAxillaire === 'Oui' ? 'text-rose-600' : 'text-emerald-600'} />
    <PdfSection title="Conclusion" />
    <PdfRow label="Score BI-RADS" value={fmt(exam.scoreBIRADS)} accent="text-pink-700" />
    {exam.recommandation && <>
      <PdfSection title="Recommandation" />
      <PdfTexte text={exam.recommandation} />
    </>}
    {exam.resultatDetaille && <>
      <PdfSection title="Observations Détaillées" />
      <PdfTexte text={exam.resultatDetaille} />
    </>}
    <PdfFooter id={exam.id} />
  </PdfWrap>
);

const PdfIRM = ({ data: exam }) => (
  <PdfWrap>
    <PdfHeader
      title="IRM Mammaire" subtitle="Imagerie par Résonance Magnétique"
      date={fmtDate(exam.date)}
      docteur={`${exam.auteurPrenom || ''} ${exam.auteurNom || ''}`}
    />
    <PdfSection title="Protocole" />
    <PdfRow label="Sein Examiné"      value={fmt(exam.seinExamine)} accent="text-pink-700" />
    <PdfRow label="Séquences"         value={fmt(exam.sequences)} />
    <PdfRow label="Produit Contraste" value={fmt(exam.produitContraste)} />
    <PdfRow label="Quadrant"          value={fmt(exam.quadrant)} />
    <PdfSection title="Sémiologie IRM" />
    <PdfRow label="Forme Lésion"      value={fmt(exam.formeLesion)} />
    <PdfRow label="Contours"          value={fmt(exam.contoursLesion)} />
    <PdfRow label="Signal T2"         value={fmt(exam.signalT2)} />
    <PdfRow label="Type Rehaussement" value={fmt(exam.typeRehaussement)} />
    <PdfRow label="Cinématique"
      value={fmt(exam.cinematiqueRehaussement)} accent="text-pink-700" />
    <PdfRow label="Restric. Diffusion"
      value={fmt(exam.restrictionDiffusion)}
      accent={exam.restrictionDiffusion === 'Oui' ? 'text-rose-600' : 'text-emerald-600'} />
    <PdfRow label="Valeur ADC"
      value={exam.valeurAdc ? String(exam.valeurAdc) : '—'} />
    <PdfSection title="Biométrie" />
    <PdfRow label="Dimensions Lésion"
      value={`${exam.tailleAxe1||'0'} × ${exam.tailleAxe2||'0'} × ${exam.tailleAxe3||'0'} mm`}
      accent="text-pink-700" />
    <PdfSection title="Bilan d'Extension" />
    <PdfRow label="Adéno. Axillaire"
      value={fmt(exam.adenopathieAxillaire)}
      accent={exam.adenopathieAxillaire    === 'Oui' ? 'text-rose-600' : 'text-emerald-600'} />
    <PdfRow label="Adéno. Médiastinale"
      value={fmt(exam.adenopathieMediastinale)}
      accent={exam.adenopathieMediastinale === 'Oui' ? 'text-rose-600' : 'text-emerald-600'} />
    <PdfRow label="Extension Paroi"
      value={fmt(exam.extensionParoi)}
      accent={exam.extensionParoi          === 'Oui' ? 'text-rose-600' : 'text-emerald-600'} />
    <PdfRow label="Extension Cutanée"
      value={fmt(exam.extensionCutanee)}
      accent={exam.extensionCutanee        === 'Oui' ? 'text-rose-600' : 'text-emerald-600'} />
    <PdfSection title="Conclusion" />
    <PdfRow label="Score BI-RADS IRM" value={fmt(exam.scoreBIRADS)} accent="text-pink-700" />
    {exam.recommandation && <>
      <PdfSection title="Recommandation" />
      <PdfTexte text={exam.recommandation} />
    </>}
    {exam.resultatDetaille && <>
      <PdfSection title="Compte-Rendu Final" />
      <PdfTexte text={exam.resultatDetaille} />
    </>}
    <PdfFooter id={exam.id} />
  </PdfWrap>
);

const PdfBiopsie = ({ data: exam }) => {
  const isMalin = exam.classeBinaire === 'MALIN';
  return (
    <PdfWrap>
      <PdfHeader
        title="Analyse de Biopsie" subtitle="Pathologie Numérique & IA"
        date={fmtDate(exam.date)}
        docteur={`${exam.auteurPrenom || ''} ${exam.auteurNom || ''}`}
      />
      <PdfSection title="Paramètres de l'Examen" />
      <PdfRow label="Site Anatomique"
        value={fmt(exam.siteAnatomique)} accent="text-pink-700" />
      <PdfRow label="Grossissement"      value={fmt(exam.grossissement)} />
      <PdfRow label="Visibilité Patient" value={exam.visiblePatient ? 'Visible' : 'Privé'} />
      <PdfRow label="Régions Analysées"
        value={`${exam.imagesAnalysees?.length || 0} zone(s)`} />
      {exam.isAnalysed ? (<>
        <PdfSection title="Résultat Analyse IA — DenseNet121" />
        <PdfRow label="Diagnostic"
          value={`${isMalin ? 'Malin' : 'Bénin'} — ${
            ((exam.scoreBenignMalin||0)*100).toFixed(1)}% de confiance`}
          accent={isMalin ? 'text-rose-700' : 'text-emerald-700'} />
        {exam.typeTumeur && (
          <PdfRow label="Type Tumeur"
            value={`${TYPE_LABELS_BIO[exam.typeTumeur] || exam.typeTumeur} — ${
              ((exam.scoreTypeConfiance||0)*100).toFixed(1)}%`} />
        )}
       
      </>) : (
        <PdfTexte text="Aucune analyse IA effectuée." />
      )}
      {exam.notes && <>
        <PdfSection title="Compte-Rendu Anatomopathologique" />
        <PdfTexte text={exam.notes} />
      </>}
      <PdfFooter id={exam.id} />
    </PdfWrap>
  );
};

const PdfMammographie = ({ data: exam }) => {
  const isMalin = exam.predictionIA === 'MALIGNANT';
  const birads  = exam.scoreBIRADS?.replace('BIRADS_', 'BI-RADS ') || '—';
  const conf    = exam.confidencePct != null
    ? exam.confidencePct.toFixed(1)
    : exam.scoreRisqueIA != null
      ? (exam.scoreRisqueIA * 100).toFixed(1)
      : '—';

  return (
    <PdfWrap>
      <PdfHeader
        title="Mammographie Numérique"
        subtitle="Analyse Assistée par Intelligence Artificielle"
        date={fmtDate(exam.dateExamen)}
        docteur={exam.auteurPrenom || exam.auteurNom
          ? `${exam.auteurPrenom || ''} ${exam.auteurNom || ''}`
          : null}
      />
      <PdfSection title="Résultat Diagnostic IA" />
      <PdfRow
        label="Prédiction"
        value={isMalin ? 'MALIN' : 'BÉNIN'}
        accent={isMalin ? 'text-rose-700' : 'text-emerald-700'}
      />
      <PdfRow label="Classification BI-RADS" value={birads} accent="text-pink-700" />
      <PdfRow
        label="Confiance IA"
        value={conf !== '—' ? `${conf}%` : '—'}
        accent={isMalin ? 'text-rose-700' : 'text-emerald-700'}
      />
      <PdfSection title="Localisation Anatomique" />
      <PdfRow
        label="Quadrant"
        value={exam.quadrantShort
          ? `${exam.quadrantShort} — ${exam.quadrant || ''}`
          : fmt(exam.quadrant)}
        accent="text-pink-700"
      />
      {exam.positionText && (
        <PdfRow label="Position" value={exam.positionText} />
      )}
      <PdfSection title="Recommandation Clinique" />
      <PdfTexte text={
        exam.recommendationIA ||
        (isMalin
          ? '⚠ Biopsie recommandée — Confirmation histologique requise'
          : '✓ Surveillance annuelle recommandée')
      } />
      {exam.biradsDescription && <>
        <PdfSection title="Observations BI-RADS" />
        <PdfTexte text={exam.biradsDescription} />
      </>}
      <PdfFooter id={exam.id} />
    </PdfWrap>
  );
};

// ══════════════════════════════════════════════════════════════
// CONFIG PAR TYPE
// ══════════════════════════════════════════════════════════════
const EXAM_CONFIG = {
  RESULTAT_MANUEL: {
    Icon: Stethoscope, color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-500',
    label: 'Examen Manuel', PdfComponent: PdfExamenManuel,
    docTitle: 'Examen Clinique Manuel', docIcon: Stethoscope,
  },
  RESULTAT_ECHOGRAPHIE: {
    Icon: Zap, color: 'bg-sky-50 dark:bg-sky-900/20 text-sky-500',
    label: 'Échographie', PdfComponent: PdfEchographie,
    docTitle: 'Échographie Mammaire', docIcon: Zap,
  },
  RESULTAT_IRM: {
    Icon: Layers, color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-500',
    label: 'IRM Mammaire', PdfComponent: PdfIRM,
    docTitle: 'IRM Mammaire', docIcon: Layers,
  },
  RESULTAT_BIOPSIE: {
    Icon: Microscope, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500',
    label: 'Biopsie & IA', PdfComponent: PdfBiopsie,
    docTitle: 'Analyse de Biopsie', docIcon: Microscope,
  },
  RESULTAT_MAMMOGRAPHIE: {
    Icon: Activity, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
    label: 'Mammographie', PdfComponent: PdfMammographie,
    docTitle: 'Mammographie Numérique', docIcon: Activity,
  },
};

const getBadge = (type, data) => {
  if (!data) return { text: '—', color: 'text-slate-500 bg-slate-50 border-slate-200' };
  switch (type) {
    case 'RESULTAT_MANUEL':
      return data.examenManuel?.massePalpee
        ? { text: '⚠ Masse palpée', color: 'text-rose-600 bg-rose-50 border-rose-100' }
        : { text: '✓ Normal',        color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    case 'RESULTAT_ECHOGRAPHIE':
    case 'RESULTAT_IRM':
      return { text: `BI-RADS ${data.scoreBIRADS || '—'}`,
               color: 'text-pink-700 bg-pink-50 border-pink-100' };
    case 'RESULTAT_BIOPSIE':
      return data.isAnalysed
        ? data.classeBinaire === 'MALIN'
          ? { text: '⚠ Malin', color: 'text-rose-600 bg-rose-50 border-rose-100' }
          : { text: '✓ Bénin', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
        : { text: 'Non analysé', color: 'text-slate-500 bg-slate-50 border-slate-200' };
    case 'RESULTAT_MAMMOGRAPHIE':
      return data.predictionIA === 'MALIGNANT'
        ? { text: '⚠ Malin', color: 'text-rose-600 bg-rose-50 border-rose-100' }
        : { text: '✓ Bénin', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    default:
      return { text: '—', color: 'text-slate-500 bg-slate-50 border-slate-200' };
  }
};

const getSubtitle = (type, data) => {
  if (!data) return '—';
  switch (type) {
    case 'RESULTAT_MANUEL':       return 'Consultation Clinique';
    case 'RESULTAT_ECHOGRAPHIE':  return `Sein ${data.seinExamine || '—'}`;
    case 'RESULTAT_IRM':          return `Sein ${data.seinExamine || '—'}`;
    case 'RESULTAT_BIOPSIE':      return data.siteAnatomique || '—';
    case 'RESULTAT_MAMMOGRAPHIE': return 'Analyse IA EfficientNet-B3';
    default: return '—';
  }
};

const getDate = (type, data) => {
  if (!data) return '—';
  if (type === 'RESULTAT_MAMMOGRAPHIE') return fmtDate(data.dateExamen);
  if (type === 'RESULTAT_MANUEL')       return fmtDate(data.examenManuel?.date);
  return fmtDate(data.date);
};

// ══════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════
const DocumentsPage = () => {
  const { id: patientId } = useParams();
  const { user } = useAuth();

  const [dossierId, setDossierId]           = useState(null);
  const [loading, setLoading]               = useState(true);
  const [savingDoc, setSavingDoc]           = useState(false);
  const [error, setError]                   = useState(null);
  const [activeTab, setActiveTab]           = useState('ordonnances');
  const [openDoc, setOpenDoc]               = useState(null);
  const [showNewOrdForm, setShowNewOrdForm] = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [ordonnances, setOrdonnances]       = useState([]);
  const [newOrd, setNewOrd]                 = useState({ contenu: '' });
  const [examensData, setExamensData]       = useState({});
  const [savedResultats, setSavedResultats] = useState([]);
  const [patientData, setPatientData]       = useState(null);

  const [reportSelection, setReportSelection] = useState({
    infosGenerales : false,
    examenManuel   : false,
    mammographie   : false,
    echographie    : false,
    irm            : false,
    biopsie        : false,
  });

  // ── Chargement ───────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const { data: patient } = await axiosInstance.get(`/patients/${patientId}`);
        const dId = patient.dossierMedicalId;
        setDossierId(dId);
        setPatientData(patient);
        if (!dId) return;

        const [ords, saved, consultations, echos, irms, biopsiesRes, mammos] =
          await Promise.all([
            getOrdonnances(dId).catch(() => []),
            getResultats(dId).catch(() => []),
            getConsultations(dId).catch(() => []),
            getEchographies(dId).catch(() => []),
            getIRMs(dId).catch(() => []),
            // ← patientId pour biopsies (le backend cherche par patientId)
            getBiopsiesByDossier(patientId).then(r => r.data ?? []).catch(() => []),
            // ← dossierId pour mammographies
            mammographieService.getHistorique(patientId).catch(() => []),
          ]);

        setOrdonnances(ords);
        setSavedResultats(saved);
        setExamensData({
          RESULTAT_MANUEL:       consultations,
          RESULTAT_ECHOGRAPHIE:  echos,
          RESULTAT_IRM:          irms,
          RESULTAT_BIOPSIE:      biopsiesRes,
          RESULTAT_MAMMOGRAPHIE: mammos,
        });
      } catch {
        setError("Impossible de charger les documents.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [patientId]);

  // ── Sauvegarder un résultat en base + ouvrir PDF ─────────────
  const handleVoirExamen = useCallback(async (type, examenData) => {
    if (!dossierId || !examenData) return;

    const examenId   = examenData.id || examenData.examenManuel?.id;
    const dejaEnBase = savedResultats.some(r => r.examenSourceId === examenId);

    if (!dejaEnBase && examenId) {
      setSavingDoc(true);
      try {
        const cfg    = EXAM_CONFIG[type];
        const date   = getDate(type, examenData);
        const created = await creerDocument(dossierId, {
          nom             : `${cfg.label} — ${date}`,
          type,
          // ↓ données complètes de l'examen sérialisées
          contenu         : JSON.stringify(examenData),
          partagePatient  : false,
          etape           : cfg.label,
          examenSourceId  : examenId,
          examenSourceType: type,
        });
        setSavedResultats(prev => [created, ...prev]);
      } catch (e) {
        console.warn('Sauvegarde silencieuse échouée:', e);
      } finally {
        setSavingDoc(false);
      }
    }

    setOpenDoc({ type, examenData });
  }, [dossierId, savedResultats]);

  // ── Générer + sauvegarder le rapport de synthèse ─────────────
  const handleGenererRapport = useCallback(async () => {
    if (!dossierId) return;
    const nbSections = Object.values(reportSelection).filter(Boolean).length;
    if (nbSections === 0) return;

    // Sauvegarder le rapport en base
    setSavingDoc(true);
    try {
      await creerDocument(dossierId, {
        nom            : `Rapport de Synthèse — ${new Date().toLocaleDateString('fr-FR')}`,
        type           : 'RAPPORT_FINAL',
        contenu        : JSON.stringify({
          selection  : reportSelection,
          examensData,
          patient    : patientData,
          dateGenere : new Date().toISOString(),
        }),
        partagePatient : false,
        etape          : 'Rapport de Synthèse',
      });
    } catch (e) {
      console.warn('Sauvegarde rapport échouée:', e);
    } finally {
      setSavingDoc(false);
    }

    // Ouvrir le PDF
    setOpenDoc({
      type           : 'RAPPORT',
      reportSelection: { ...reportSelection },
      examensData    : { ...examensData },
    });
  }, [dossierId, reportSelection, examensData, patientData]);

  // ── Ordonnances ──────────────────────────────────────────────
  const handleAddOrdonnance = async (e) => {
    e.preventDefault();
    if (!newOrd.contenu.trim() || !dossierId) return;
    setSaving(true);
    try {
      const created = await creerDocument(dossierId, {
        nom: `Ordonnance — ${new Date().toLocaleDateString('fr-FR')}`,
        type: 'ORDONNANCE', contenu: newOrd.contenu,
        partagePatient: false, etape: 'Manuel',
      });
      setOrdonnances(prev => [created, ...prev]);
      setNewOrd({ contenu: '' });
      setShowNewOrdForm(false);
    } catch { setError("Erreur lors de la création."); }
    finally   { setSaving(false); }
  };

  const toggleReportPart = (part) =>
    setReportSelection(prev => ({ ...prev, [part]: !prev[part] }));

  // ── Rendu document ouvert pleine page ─────────────────────────
  const renderOpenDoc = () => {
    if (!openDoc) return null;

    let pdfContent = null;
    let docTitle   = '';
    let DocIcon    = FileText;

    if (openDoc.type === 'ORDONNANCE') {
      docTitle  = `Ordonnance — ${openDoc.etape || ''}`;
      DocIcon   = ClipboardList;
      pdfContent = (
        <PdfWrap>
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-black tracking-tighter text-slate-900 italic">
                CLINIQUE DU SEIN
              </h2>
              <p className="text-[9px] font-bold text-slate-500 mt-1 italic">
                Pôle d'excellence en oncologie
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-pink-500">
                Ordonnance
              </p>
              <p className="text-[9px] font-bold text-slate-400 mt-1">
                {openDoc.dateAjout
                  ? new Date(openDoc.dateAjout).toLocaleDateString('fr-FR')
                  : new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <div className="mb-10 grid grid-cols-2 gap-8">
            <div>
              <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest
                             border-b border-slate-100 pb-1 mb-2">Étape</h5>
              <p className="text-xs font-black text-slate-900 uppercase">
                {openDoc.etape || openDoc.nom}
              </p>
            </div>
            <div>
              <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest
                             border-b border-slate-100 pb-1 mb-2">Médecin</h5>
              <p className="text-xs font-black text-slate-900 uppercase">
                Dr. {user?.prenom} {user?.nom}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 opacity-10 mb-8">
            <div className="h-px flex-1 bg-slate-950" />
            <FileCheck size={18} className="text-slate-950" />
            <div className="h-px flex-1 bg-slate-950" />
          </div>
          <div className="font-serif italic text-slate-800 text-base leading-relaxed
                          px-8 text-center flex-1">
            {(openDoc.contenu || '').split('\n').map((line, i) => (
              <p key={i} className="mb-3">{line}</p>
            ))}
          </div>
          <PdfFooter id={openDoc.docId} />
        </PdfWrap>
      );

    } else if (openDoc.type === 'RAPPORT') {
      docTitle  = 'Rapport de Synthèse';
      DocIcon   = ClipboardList;
      pdfContent = (
        <PdfRapport
          selection={openDoc.reportSelection}
          examensData={openDoc.examensData}
          patient={patientData}
        />
      );

    } else {
      const cfg     = EXAM_CONFIG[openDoc.type];
      if (!cfg) return null;
      docTitle      = cfg.docTitle;
      DocIcon       = cfg.docIcon;
      const PdfComp = cfg.PdfComponent;
      pdfContent    = <PdfComp data={openDoc.examenData} />;
    }

    return (
      <motion.div key="open-doc"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                   rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[800px] flex flex-col">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800
                        bg-slate-50 dark:bg-slate-950/50 flex items-center
                        justify-between no-print">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center
                            justify-center text-white shadow-lg shadow-pink-500/20">
              <DocIcon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight
                             text-slate-900 dark:text-white">{docTitle}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Aperçu pour impression
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()}
              className="h-12 px-6 rounded-2xl bg-slate-900 text-white text-[11px]
                         font-black uppercase tracking-widest hover:scale-105
                         active:scale-95 transition-all flex items-center gap-2
                         shadow-xl shadow-slate-900/20">
              <Printer size={18} /> Imprimer
            </button>
            <button onClick={() => setOpenDoc(null)}
              className="w-12 h-12 flex items-center justify-center rounded-2xl
                         bg-white dark:bg-slate-800 border border-slate-200
                         dark:border-slate-700 text-slate-400 hover:text-slate-950
                         dark:hover:text-white transition-all shadow-sm">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-slate-100/50 dark:bg-slate-950/20
                        p-6 md:p-12 flex flex-col items-center overflow-y-auto">
          <div id="print-zone" className="w-[148mm] shadow-2xl">
            {pdfContent}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-pink-500" />
    </div>
  );

  const typesAvecDonnees         = Object.entries(examensData)
    .filter(([, list]) => list.length > 0);
  const nbSectionsSelectionnees  = Object.values(reportSelection).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-zone, #print-zone * { visibility: visible !important; }
          #print-zone {
            position: fixed !important; inset: 0;
            width: 210mm; min-height: 297mm;
            background: #fff !important;
            padding: 0 !important; margin: 0 auto;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {error && (
        <div className="max-w-7xl mx-auto mb-4 px-4 py-3 rounded-xl bg-red-50
                        border border-red-200 text-red-700 text-[11px] font-bold
                        flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 bg-white dark:bg-slate-900 border
                      border-slate-200 dark:border-slate-800 rounded-3xl p-6
                      flex flex-wrap items-center justify-between gap-6
                      shadow-sm overflow-hidden relative no-print">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl
                        rounded-full translate-x-10 -translate-y-10" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400
                          to-pink-500 flex items-center justify-center text-white
                          text-2xl font-black shadow-lg shadow-pink-500/10">OA</div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white
                           uppercase tracking-tight">Documents Médicaux</h1>
            <span className="text-[10px] font-black uppercase tracking-widest
                             bg-pink-50/50 dark:bg-pink-900/10 text-pink-500
                             px-2 py-0.5 rounded-md">
              {ordonnances.length} ordonnance{ordonnances.length !== 1 ? 's' : ''}
              {' '}· {typesAvecDonnees.length} type{typesAvecDonnees.length !== 1 ? 's' : ''} d'examen
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800
                        p-1 rounded-2xl relative z-10">
          {[
            { key: 'ordonnances', label: 'Ordonnances' },
            { key: 'resultats',   label: 'Résultats Examens' },
            { key: 'rapport',     label: 'Rapport Dossier' },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => { setActiveTab(tab.key); setOpenDoc(null); }}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase
                          tracking-widest transition-all ${
                activeTab === tab.key
                  ? 'bg-pink-100 text-pink-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">

        {/* Modal nouvelle ordonnance */}
        <AnimatePresence>
          {showNewOrdForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center
                         p-4 bg-slate-950/60 backdrop-blur-sm no-print">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg
                           rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800
                                flex justify-between items-center">
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Nouvelle Ordonnance
                  </h3>
                  <button onClick={() => setShowNewOrdForm(false)}>
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>
                <form onSubmit={handleAddOrdonnance} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest
                                     text-slate-400 ml-1">Médecin</label>
                    <div className="w-full h-12 px-4 rounded-xl border border-slate-100
                                    dark:border-slate-800 bg-slate-50 dark:bg-slate-950
                                    text-sm font-black flex items-center">
                      Dr. {user?.prenom} {user?.nom}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest
                                     text-slate-400 ml-1">Prescription</label>
                    <textarea placeholder="Écrivez la prescription..."
                      value={newOrd.contenu}
                      onChange={(e) => setNewOrd({ ...newOrd, contenu: e.target.value })}
                      className="w-full h-32 p-4 rounded-xl border border-slate-100
                                 dark:border-slate-800 bg-slate-50 dark:bg-slate-950
                                 text-sm font-medium italic outline-none
                                 focus:ring-2 focus:ring-pink-500/20" />
                  </div>
                  <button type="submit" disabled={saving}
                    className="w-full h-14 rounded-2xl bg-slate-950 text-white
                               text-[11px] font-black uppercase tracking-widest
                               hover:bg-black transition-all flex items-center
                               justify-center gap-2 disabled:opacity-60">
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Enregistrer l'ordonnance
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ── Document ouvert pleine page ── */}
          {openDoc && (
            <motion.div key="open-doc"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderOpenDoc()}
            </motion.div>
          )}

          {!openDoc && (
            <motion.div key={activeTab}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}>

              {/* ══ ORDONNANCES ══ */}
              {activeTab === 'ordonnances' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ordonnances.map((ord, i) => (
                    <motion.div key={ord.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="group bg-white dark:bg-slate-900 border border-slate-200
                                 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm
                                 hover:shadow-xl hover:shadow-pink-500/5 transition-all
                                 overflow-hidden relative">
                      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-pink-500/5
                                      blur-3xl rounded-full opacity-0 group-hover:opacity-100
                                      transition-opacity duration-700" />
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-900/20
                                        text-pink-500 group-hover:scale-110
                                        transition-transform duration-500">
                          <ClipboardList size={20} />
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-2 text-slate-300 hover:text-slate-600
                                             transition-colors">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() =>
                            supprimerDocument(ord.id).then(() =>
                              setOrdonnances(prev => prev.filter(o => o.id !== ord.id)))
                          } className="p-2 text-slate-300 hover:text-rose-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4 mb-8">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase
                                         tracking-widest mb-1">Séance / Étape</h4>
                          <p className="text-sm font-black text-slate-900 dark:text-white
                                        uppercase tracking-tight">
                            {ord.etape || 'Ordonnance'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase
                                           tracking-widest mb-1">Date</h4>
                            <p className="text-[11px] font-bold text-slate-700
                                          dark:text-slate-300 flex items-center gap-1">
                              <Calendar size={11} className="text-pink-500" />
                              {ord.dateAjout
                                ? new Date(ord.dateAjout).toLocaleDateString('fr-FR')
                                : '—'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase
                                           tracking-widest mb-1">Visible</h4>
                            <p className={`text-[11px] font-bold ${
                              ord.partagePatient ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {ord.partagePatient ? '✓ Patient' : '✗ Masqué'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => setOpenDoc({
                          type: 'ORDONNANCE', docId: ord.id, contenu: ord.contenu,
                          nom: ord.nom, etape: ord.etape, dateAjout: ord.dateAjout,
                        })}
                          className="w-full h-12 rounded-2xl bg-slate-950 dark:bg-pink-600
                                     text-white text-[10px] font-black uppercase
                                     tracking-widest hover:scale-[1.02] active:scale-[0.98]
                                     transition-all flex items-center justify-center
                                     gap-2 shadow-xl">
                          <Eye size={16} /> Voir & Imprimer
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  <div onClick={() => setShowNewOrdForm(true)}
                    className="bg-white dark:bg-slate-900 border-2 border-dashed
                               border-slate-200 dark:border-slate-800 rounded-[2rem]
                               p-8 flex flex-col items-center justify-center text-center
                               gap-4 group cursor-pointer hover:border-pink-300
                               transition-all hover:bg-pink-50/20">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800
                                    flex items-center justify-center text-slate-400
                                    group-hover:text-pink-400 group-hover:scale-110
                                    transition-all border border-slate-100
                                    dark:border-slate-700 shadow-sm">
                      <Plus size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest
                                    text-slate-500 group-hover:text-pink-500 transition-colors">
                        Ajouter Ordonnance
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1
                                    uppercase tracking-tighter italic">
                        Nouvelle prescription
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ RÉSULTATS EXAMENS ══ */}
              {activeTab === 'resultats' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] font-black uppercase tracking-[0.25em]
                                  text-slate-400">
                      Seuls les examens réalisés sont affichés
                    </p>
                    {savingDoc && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Loader2 size={10} className="animate-spin text-pink-400" />
                        <span className="text-[8px] font-black uppercase tracking-widest
                                         text-pink-400">Enregistrement...</span>
                      </div>
                    )}
                  </div>

                  {typesAvecDonnees.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center
                                    text-center rounded-[2rem] border border-dashed
                                    border-slate-200 dark:border-slate-800
                                    bg-white/70 dark:bg-slate-950">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full
                                      flex items-center justify-center text-slate-200 mb-5
                                      border border-slate-200 dark:border-slate-800">
                        <FileText size={36} strokeWidth={1} />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Aucun examen enregistré dans le dossier
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2
                                      xl:grid-cols-3 2xl:grid-cols-5 gap-5">
                        {typesAvecDonnees.map(([type, list], i) => {
                          const cfg   = EXAM_CONFIG[type];
                          if (!cfg) return null;
                          const last  = list[0];
                          const badge = getBadge(type, last);
                          return (
                            <motion.div key={type}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="group bg-white dark:bg-slate-900 border
                                         border-slate-200 dark:border-slate-800
                                         rounded-[2rem] p-6 shadow-sm
                                         hover:shadow-xl hover:shadow-pink-500/5
                                         transition-all overflow-hidden relative">
                              <div className="absolute -right-8 -bottom-8 w-32 h-32
                                              bg-pink-500/5 blur-3xl rounded-full opacity-0
                                              group-hover:opacity-100 transition-opacity
                                              duration-700" />
                              <div className="flex items-start justify-between mb-5">
                                <div className={`p-3 rounded-2xl ${cfg.color}
                                                group-hover:scale-110 transition-transform
                                                duration-500`}>
                                  <cfg.Icon size={22} />
                                </div>
                                <span className={`text-[8px] font-black uppercase
                                                  tracking-widest px-2.5 py-1
                                                  rounded-full border ${badge.color}`}>
                                  {badge.text}
                                </span>
                              </div>
                              <div className="space-y-1 mb-3">
                                <h4 className="text-sm font-black uppercase tracking-tight
                                               text-slate-900 dark:text-white">
                                  {cfg.label}
                                </h4>
                                <p className="text-[9px] font-bold text-slate-400
                                              uppercase tracking-widest">
                                  {getSubtitle(type, last)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 mb-4
                                              text-[9px] font-bold text-slate-400
                                              uppercase tracking-widest">
                                <Calendar size={10} className="text-pink-400" />
                                Dernier : {getDate(type, last)}
                              </div>
                              <div className="pt-4 border-t border-slate-100
                                              dark:border-slate-800">
                                <button onClick={() => handleVoirExamen(type, last)}
                                  className="w-full h-11 rounded-2xl bg-slate-950
                                             dark:bg-slate-800 text-white text-[9px]
                                             font-black uppercase tracking-[0.22em]
                                             hover:bg-slate-800 transition-all
                                             flex items-center justify-center gap-2
                                             shadow-lg active:scale-[0.98]">
                                  <Eye size={14} /> Voir & Imprimer
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* ══ RAPPORT ══ */}
              {activeTab === 'rapport' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200
                                dark:border-slate-800 rounded-[2.5rem] p-12
                                shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5
                                  blur-[100px] rounded-full translate-x-32 -translate-y-32" />
                  <div className="relative z-10 mx-auto grid grid-cols-1
                                  lg:grid-cols-3 gap-12">

                    {/* Sélection */}
                    <div className="flex flex-col gap-3">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em]
                                     text-slate-400 mb-2">
                        Contenu du rapport :
                      </h4>
                      {[
                        { key: 'infosGenerales', label: 'Infos Générales & Antécédents',
                          disabled: false },
                        { key: 'examenManuel',   label: 'Examen Manuel',
                          disabled: !examensData.RESULTAT_MANUEL?.length },
                        { key: 'mammographie',   label: 'Mammographie',
                          disabled: !examensData.RESULTAT_MAMMOGRAPHIE?.length },
                        { key: 'echographie',    label: 'Échographie',
                          disabled: !examensData.RESULTAT_ECHOGRAPHIE?.length },
                        { key: 'irm',            label: 'IRM Mammaire',
                          disabled: !examensData.RESULTAT_IRM?.length },
                        { key: 'biopsie',        label: 'Biopsie & IA',
                          disabled: !examensData.RESULTAT_BIOPSIE?.length },
                      ].map(({ key, label, disabled }) => (
                        <button key={key}
                          onClick={() => !disabled && toggleReportPart(key)}
                          disabled={disabled}
                          className={`flex items-center gap-3 p-4 rounded-2xl
                                      transition-all border text-left ${
                            disabled
                              ? 'opacity-30 cursor-not-allowed bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-300'
                              : reportSelection[key]
                                ? 'bg-pink-50 text-pink-500 border-pink-200 shadow-sm'
                                : 'bg-white dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-pink-100'
                          }`}>
                          {reportSelection[key]
                            ? <CheckSquare size={18} className="shrink-0" />
                            : <Square size={18} className="shrink-0" />}
                          <div>
                            <span className="text-[10px] font-black uppercase
                                             tracking-widest block">{label}</span>
                            {disabled && (
                              <span className="text-[8px] font-bold uppercase
                                               tracking-widest opacity-60">
                                Aucun examen
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Aperçu + bouton */}
                    <div className="lg:col-span-2 flex flex-col items-center
                                    justify-center space-y-8 text-center px-8
                                    lg:border-l border-slate-100 dark:border-slate-800">
                      <div className="w-24 h-24 rounded-[3rem] bg-pink-50
                                      dark:bg-pink-900/10 flex items-center
                                      justify-center text-pink-400 shadow-xl
                                      animate-pulse">
                        <ClipboardList size={48} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white
                                       uppercase tracking-tight">Rapport de Synthèse</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase
                                      tracking-[0.2em]">Dossier Médical Complet</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {nbSectionsSelectionnees} section
                          {nbSectionsSelectionnees !== 1 ? 's' : ''} sélectionnée
                          {nbSectionsSelectionnees !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {savingDoc && (
                        <div className="flex items-center gap-2 text-pink-400">
                          <Loader2 size={14} className="animate-spin" />
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            Enregistrement...
                          </span>
                        </div>
                      )}

                      <button
                        disabled={nbSectionsSelectionnees === 0 || savingDoc}
                        onClick={handleGenererRapport}
                        className="h-12 px-8 rounded-xl bg-slate-950 dark:bg-pink-600
                                   text-white text-[11px] font-black uppercase
                                   tracking-widest hover:scale-[1.02] active:scale-[0.98]
                                   transition-all flex items-center justify-center
                                   gap-3 shadow-xl disabled:opacity-40
                                   disabled:cursor-not-allowed
                                   disabled:hover:scale-100">
                        <Eye size={18} />
                        Générer le Rapport
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DocumentsPage;