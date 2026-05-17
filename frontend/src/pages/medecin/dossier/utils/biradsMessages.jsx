// src/utils/biradsMessages.js

export const BIRADS_MESSAGES = {
  BIRADS_0: {
    indication:    'Évaluation complémentaire nécessaire',
    observation:   'Mammographie incomplète — des examens supplémentaires sont requis pour évaluer les anomalies détectées.',
    action:        'Compléter le bilan imagerie',
    urgence:       'normale',
    couleur:       'slate'
  },
  BIRADS_1: {
    indication:    'Surveillance annuelle recommandée',
    observation:   'Aucune anomalie détectée. La mammographie est considérée comme négative.',
    action:        'Mammographie de contrôle dans 12 mois',
    urgence:       'normale',
    couleur:       'emerald'
  },
  BIRADS_2: {
    indication:    'Suivi annuel de routine',
    observation:   'Anomalie bénigne identifiée sans caractère suspect. Probabilité de malignité nulle.',
    action:        'Prochain contrôle dans 12 mois',
    urgence:       'normale',
    couleur:       'emerald'
  },
  BIRADS_3: {
    indication:    'Contrôle échographique à 6 mois',
    observation:   'Anomalie probablement bénigne. Risque de malignité inférieur à 2%. Une surveillance rapprochée est conseillée.',
    action:        'Échographie de contrôle dans 6 mois',
    urgence:       'surveillance',
    couleur:       'amber'
  },
  BIRADS_4A: {
    indication:    'Biopsie à discuter avec le radiologue',
    observation:   'Suspicion faible de malignité. Risque estimé entre 2% et 10%. Une biopsie peut être envisagée selon l\'avis clinique.',
    action:        'Concertation pluridisciplinaire recommandée',
    urgence:       'moderee',
    couleur:       'orange'
  },
  BIRADS_4B: {
    indication:    'Biopsie écho-guidée recommandée',
    observation:   'Suspicion intermédiaire de malignité. Risque estimé entre 10% et 50%. Une confirmation histologique est nécessaire.',
    action:        'Biopsie en urgence relative',
    urgence:       'elevee',
    couleur:       'rose'
  },
  BIRADS_4C: {
    indication:    'Biopsie urgente + bilan d\'extension',
    observation:   'Suspicion élevée de malignité. Risque estimé entre 50% et 95%. Une prise en charge rapide est impérative.',
    action:        'Orientation oncologique immédiate',
    urgence:       'urgente',
    couleur:       'red'
  },
  BIRADS_5: {
    indication:    'Prise en charge oncologique immédiate',
    observation:   'Lésion hautement suspecte de malignité. Probabilité supérieure à 95%. Un bilan d\'extension complet est indispensable.',
    action:        'Biopsie urgente + scanner thoraco-abdominal',
    urgence:       'critique',
    couleur:       'red'
  },
  BIRADS_6: {
    indication:    'Suivi post-biopsie — malignité confirmée',
    observation:   'Diagnostic de malignité déjà confirmé histologiquement. La mammographie est réalisée dans le cadre du suivi thérapeutique.',
    action:        'Coordination avec l\'équipe oncologique',
    urgence:       'critique',
    couleur:       'purple'
  }
};

export const getBiradsMessage = (scoreBIRADS) => {
  if (!scoreBIRADS) return BIRADS_MESSAGES.BIRADS_1;
  return BIRADS_MESSAGES[scoreBIRADS] || BIRADS_MESSAGES.BIRADS_1;
};

export const getUrgenceStyle = (urgence) => {
  switch (urgence) {
    case 'normale':
      return {
        bg:     'bg-emerald-50',
        border: 'border-emerald-100',
        text:   'text-emerald-700',
        badge:  'bg-emerald-100 text-emerald-700',
        dot:    'bg-emerald-400'
      };
    case 'surveillance':
      return {
        bg:     'bg-amber-50',
        border: 'border-amber-100',
        text:   'text-amber-700',
        badge:  'bg-amber-100 text-amber-700',
        dot:    'bg-amber-400'
      };
    case 'moderee':
      return {
        bg:     'bg-orange-50',
        border: 'border-orange-100',
        text:   'text-orange-700',
        badge:  'bg-orange-100 text-orange-700',
        dot:    'bg-orange-400'
      };
    case 'elevee':
      return {
        bg:     'bg-rose-50',
        border: 'border-rose-100',
        text:   'text-rose-700',
        badge:  'bg-rose-100 text-rose-700',
        dot:    'bg-rose-500'
      };
    case 'urgente':
    case 'critique':
      return {
        bg:     'bg-red-50',
        border: 'border-red-200',
        text:   'text-red-700',
        badge:  'bg-red-100 text-red-700',
        dot:    'bg-red-600 animate-pulse'
      };
    default:
      return {
        bg:     'bg-slate-50',
        border: 'border-slate-100',
        text:   'text-slate-700',
        badge:  'bg-slate-100 text-slate-700',
        dot:    'bg-slate-400'
      };
  }
};