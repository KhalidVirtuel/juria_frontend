// Workflow Task Types (Primary Classification)
export type TaskType = 
  | 'qualifier'      // Legal qualification, nature of facts
  | 'verifier'       // Receivability, compliance, deadlines, risks
  | 'analyser'       // Judgment, document, situation
  | 'preparer'       // Hearing, negotiation, drafting
  | 'structurer'     // Reasoning, argumentation, plan
  | 'decider'        // Strategy, options, next move
  | 'calculer';      // Calculations, estimations

// Legal Context (Secondary Classification)
export type LegalContext = 
  | 'travail'        // Labor law
  | 'civil'          // Civil law
  | 'commercial'     // Commercial law
  | 'famille'        // Family law
  | 'accidents'      // Traffic accidents
  | 'contrats'       // Contracts
  | 'penal'          // Criminal law
  | 'immobilier'     // Real estate
  | 'general';       // General / transversal

export interface WorkflowInput {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'file' | 'select' | 'number' | 'checkbox';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  action: string; // Concrete lawyer action
}

export interface WorkflowOutput {
  id: string;
  label: string;
  type: 'qualification' | 'status' | 'risk' | 'reasoning' | 'recommendation' | 'estimation' | 'action';
  description: string;
}

export interface Workflow {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  taskType: TaskType;
  legalContext: LegalContext[];
  icon: string;
  estimatedTime: string;
  inputs: WorkflowInput[];
  steps: WorkflowStep[];
  outputs: WorkflowOutput[];
}

// Task Type Labels (French)
export const taskTypeLabels: Record<TaskType, string> = {
  qualifier: 'Qualifier',
  verifier: 'Vérifier',
  analyser: 'Analyser',
  preparer: 'Préparer',
  structurer: 'Structurer',
  decider: 'Décider',
  calculer: 'Calculer'
};

// Legal Context Labels (French)
export const legalContextLabels: Record<LegalContext, string> = {
  travail: 'Droit du travail',
  civil: 'Droit civil',
  commercial: 'Droit commercial',
  famille: 'Droit de la famille',
  accidents: 'Accidents de circulation',
  contrats: 'Contrats',
  penal: 'Droit pénal',
  immobilier: 'Droit immobilier',
  general: 'Transversal'
};

// ============================================
// 10 FOUNDATIONAL TASK-BASED WORKFLOWS
// ============================================

export const workflows: Workflow[] = [
  // 1. QUALIFICATION JURIDIQUE D'UNE SITUATION FACTUELLE
  {
    id: 'wf-qualification-faits',
    title: 'Qualification juridique d\'une situation factuelle',
    shortTitle: 'Qualifier les faits',
    description: 'Déterminer la nature juridique exacte d\'une situation pour orienter l\'action',
    taskType: 'qualifier',
    legalContext: ['general'],
    icon: 'Brain',
    estimatedTime: '20-40 min',
    inputs: [
      { id: 'facts', label: 'Exposé des faits', type: 'textarea', placeholder: 'Décrivez les faits de manière chronologique et factuelle...', required: true },
      { id: 'documents', label: 'Documents disponibles', type: 'file', required: false },
      { id: 'parties', label: 'Parties impliquées', type: 'textarea', placeholder: 'Identifiez les parties et leurs rôles...', required: true },
      { id: 'context', label: 'Contexte juridique supposé', type: 'select', options: ['Civil', 'Commercial', 'Travail', 'Famille', 'Pénal', 'Administratif', 'Autre'], required: false }
    ],
    steps: [
      { id: '1', title: 'Isoler les faits pertinents', description: 'Distinguer les faits juridiquement significatifs des éléments accessoires', action: 'Surligner les faits constitutifs dans l\'exposé' },
      { id: '2', title: 'Identifier les textes applicables', description: 'Rechercher les dispositions légales potentiellement applicables', action: 'Lister les articles de loi concernés (DOC, Code travail, etc.)' },
      { id: '3', title: 'Vérifier les conditions légales', description: 'Confronter les faits aux conditions posées par chaque texte', action: 'Cocher les conditions remplies / non remplies' },
      { id: '4', title: 'Écarter les qualifications inapplicables', description: 'Éliminer les qualifications dont les conditions ne sont pas réunies', action: 'Justifier l\'exclusion de chaque qualification écartée' },
      { id: '5', title: 'Retenir la qualification', description: 'Choisir et motiver la qualification juridique retenue', action: 'Rédiger la qualification avec fondement textuel' }
    ],
    outputs: [
      { id: 'out-1', label: 'Qualification retenue', type: 'qualification', description: 'Nature juridique précise de la situation' },
      { id: 'out-2', label: 'Fondement légal', type: 'reasoning', description: 'Textes de loi applicables avec références' },
      { id: 'out-3', label: 'Qualifications alternatives', type: 'recommendation', description: 'Autres qualifications possibles à considérer' }
    ]
  },

  // 2. VÉRIFICATION DE RECEVABILITÉ D'UNE ACTION
  {
    id: 'wf-recevabilite',
    title: 'Vérification de recevabilité d\'une action en justice',
    shortTitle: 'Vérifier recevabilité',
    description: 'S\'assurer qu\'une action judiciaire est recevable avant de l\'engager',
    taskType: 'verifier',
    legalContext: ['general', 'civil'],
    icon: 'ShieldCheck',
    estimatedTime: '30-45 min',
    inputs: [
      { id: 'action-type', label: 'Type d\'action envisagée', type: 'select', options: ['Action civile', 'Action pénale', 'Référé', 'Appel', 'Cassation', 'Opposition', 'Tierce opposition'], required: true },
      { id: 'jurisdiction', label: 'Juridiction visée', type: 'select', options: ['TPI', 'Tribunal de commerce', 'Tribunal administratif', 'Cour d\'appel', 'Cour de cassation'], required: true },
      { id: 'date-fait', label: 'Date du fait générateur', type: 'date', required: true },
      { id: 'date-decision', label: 'Date de la décision attaquée (si appel/cassation)', type: 'date', required: false },
      { id: 'parties-info', label: 'Qualité des parties', type: 'textarea', placeholder: 'Capacité, intérêt et qualité à agir de chaque partie...', required: true }
    ],
    steps: [
      { id: '1', title: 'Vérifier l\'intérêt à agir', description: 'Le demandeur a-t-il un intérêt légitime, né, actuel et personnel ?', action: 'Confirmer que le préjudice est direct et certain' },
      { id: '2', title: 'Vérifier la qualité à agir', description: 'Le demandeur a-t-il qualité pour exercer cette action ?', action: 'Vérifier le lien avec le droit invoqué' },
      { id: '3', title: 'Vérifier la capacité', description: 'Le demandeur a-t-il la capacité juridique d\'agir ?', action: 'Contrôler majorité, interdiction, représentation' },
      { id: '4', title: 'Calculer les délais', description: 'L\'action est-elle dans les délais légaux ?', action: 'Appliquer les règles de computation des délais' },
      { id: '5', title: 'Vérifier la compétence', description: 'La juridiction est-elle compétente matériellement et territorialement ?', action: 'Confronter aux règles de compétence applicables' },
      { id: '6', title: 'Détecter les fins de non-recevoir', description: 'Y a-t-il des obstacles procéduraux ?', action: 'Vérifier autorité de chose jugée, litispendance, connexité' }
    ],
    outputs: [
      { id: 'out-1', label: 'Statut de recevabilité', type: 'status', description: 'Recevable / Irrecevable / À risque' },
      { id: 'out-2', label: 'Points bloquants identifiés', type: 'risk', description: 'Liste des obstacles à la recevabilité' },
      { id: 'out-3', label: 'Recommandation', type: 'recommendation', description: 'Action recommandée suite à l\'analyse' }
    ]
  },

  // 3. ANALYSE DE JUGEMENT / DÉCISION
  {
    id: 'wf-analyse-jugement',
    title: 'Analyse de jugement ou décision de justice',
    shortTitle: 'Analyser décision',
    description: 'Décrypter une décision de justice pour en extraire les éléments exploitables',
    taskType: 'analyser',
    legalContext: ['general'],
    icon: 'Gavel',
    estimatedTime: '30-60 min',
    inputs: [
      { id: 'decision', label: 'Décision à analyser', type: 'file', required: true },
      { id: 'partie-representee', label: 'Partie représentée', type: 'select', options: ['Demandeur', 'Défendeur', 'Tiers', 'Observation générale'], required: true },
      { id: 'objectif', label: 'Objectif de l\'analyse', type: 'select', options: ['Préparer appel', 'Exécuter', 'Conseiller client', 'Jurisprudence'], required: true }
    ],
    steps: [
      { id: '1', title: 'Identifier les parties et l\'objet', description: 'Qui demande quoi à qui ?', action: 'Extraire demandeur, défendeur, prétentions' },
      { id: '2', title: 'Repérer le dispositif', description: 'Que décide exactement le juge ?', action: 'Isoler et transcrire le dispositif mot à mot' },
      { id: '3', title: 'Analyser les motifs', description: 'Sur quoi le juge fonde-t-il sa décision ?', action: 'Identifier les motifs de fait et de droit' },
      { id: '4', title: 'Évaluer le raisonnement', description: 'Le raisonnement est-il juridiquement solide ?', action: 'Détecter les failles logiques ou juridiques' },
      { id: '5', title: 'Identifier les moyens d\'appel', description: 'Quels griefs peuvent être soulevés ?', action: 'Lister les moyens exploitables en appel' },
      { id: '6', title: 'Calculer les délais de recours', description: 'Quel est le délai pour agir ?', action: 'Vérifier délai d\'appel, opposition, cassation' }
    ],
    outputs: [
      { id: 'out-1', label: 'Synthèse du dispositif', type: 'reasoning', description: 'Ce qui a été jugé précisément' },
      { id: 'out-2', label: 'Points de fragilité', type: 'risk', description: 'Faiblesses exploitables de la décision' },
      { id: 'out-3', label: 'Moyens de recours', type: 'recommendation', description: 'Griefs à soulever en appel/cassation' },
      { id: 'out-4', label: 'Délai d\'action', type: 'estimation', description: 'Date limite pour exercer un recours' }
    ]
  },

  // 4. ANALYSE DE DOCUMENT ADVERSE
  {
    id: 'wf-analyse-adverse',
    title: 'Analyse de pièce ou document adverse',
    shortTitle: 'Analyser pièce adverse',
    description: 'Examiner un document produit par la partie adverse pour en tirer parti',
    taskType: 'analyser',
    legalContext: ['general'],
    icon: 'FileText',
    estimatedTime: '20-40 min',
    inputs: [
      { id: 'document', label: 'Document à analyser', type: 'file', required: true },
      { id: 'type-doc', label: 'Type de document', type: 'select', options: ['Contrat', 'Correspondance', 'PV', 'Attestation', 'Rapport', 'Facture', 'Autre'], required: true },
      { id: 'contexte', label: 'Contexte du litige', type: 'textarea', placeholder: 'Décrivez brièvement le litige...', required: true }
    ],
    steps: [
      { id: '1', title: 'Vérifier l\'authenticité', description: 'Le document est-il authentique et non falsifié ?', action: 'Contrôler signatures, dates, cohérence' },
      { id: '2', title: 'Vérifier la recevabilité probatoire', description: 'Le document est-il recevable comme preuve ?', action: 'Vérifier mode d\'obtention et conditions légales' },
      { id: '3', title: 'Extraire les admissions', description: 'L\'adversaire reconnaît-il des faits favorables ?', action: 'Surligner les aveux et reconnaissances' },
      { id: '4', title: 'Identifier les contradictions', description: 'Y a-t-il des incohérences avec d\'autres pièces ?', action: 'Croiser avec le dossier existant' },
      { id: '5', title: 'Évaluer la force probante', description: 'Quelle est la valeur juridique de ce document ?', action: 'Qualifier selon les règles de preuve' }
    ],
    outputs: [
      { id: 'out-1', label: 'Éléments favorables', type: 'reasoning', description: 'Points exploitables pour notre dossier' },
      { id: 'out-2', label: 'Points faibles du document', type: 'risk', description: 'Failles à exploiter en contestation' },
      { id: 'out-3', label: 'Stratégie probatoire', type: 'recommendation', description: 'Comment utiliser ou contester ce document' }
    ]
  },

  // 5. VÉRIFICATION CONFORMITÉ CONTRACTUELLE
  {
    id: 'wf-conformite-contrat',
    title: 'Vérification de conformité contractuelle',
    shortTitle: 'Vérifier contrat',
    description: 'S\'assurer qu\'un contrat respecte les exigences légales et protège le client',
    taskType: 'verifier',
    legalContext: ['contrats', 'commercial', 'civil'],
    icon: 'CheckSquare',
    estimatedTime: '45-90 min',
    inputs: [
      { id: 'contrat', label: 'Contrat à vérifier', type: 'file', required: true },
      { id: 'type-contrat', label: 'Type de contrat', type: 'select', options: ['Vente', 'Bail', 'Travail', 'Prestation', 'Société', 'Prêt', 'Autre'], required: true },
      { id: 'partie', label: 'Partie représentée', type: 'select', options: ['Vendeur', 'Acheteur', 'Bailleur', 'Locataire', 'Employeur', 'Salarié', 'Prestataire', 'Client'], required: true },
      { id: 'objectif', label: 'Objectif de vérification', type: 'select', options: ['Signature', 'Renégociation', 'Litige', 'Audit'], required: true }
    ],
    steps: [
      { id: '1', title: 'Vérifier les conditions de validité', description: 'Consentement, capacité, objet, cause sont-ils valides ?', action: 'Contrôler chaque condition de l\'art. 2 DOC' },
      { id: '2', title: 'Identifier les clauses abusives', description: 'Y a-t-il des clauses déséquilibrées ou illicites ?', action: 'Lister les clauses potentiellement contestables' },
      { id: '3', title: 'Vérifier les obligations essentielles', description: 'Les obligations principales sont-elles claires ?', action: 'S\'assurer que l\'objet est déterminé ou déterminable' },
      { id: '4', title: 'Analyser les clauses de sortie', description: 'Résiliation, force majeure, litiges sont-ils prévus ?', action: 'Évaluer la protection en cas de problème' },
      { id: '5', title: 'Vérifier les formalités', description: 'Les formalités requises sont-elles respectées ?', action: 'Contrôler enregistrement, légalisation si nécessaire' }
    ],
    outputs: [
      { id: 'out-1', label: 'Statut de conformité', type: 'status', description: 'Conforme / Non conforme / À modifier' },
      { id: 'out-2', label: 'Clauses à risque', type: 'risk', description: 'Liste des clauses problématiques' },
      { id: 'out-3', label: 'Modifications recommandées', type: 'recommendation', description: 'Changements à négocier avant signature' }
    ]
  },

  // 6. PRÉPARATION AUDIENCE
  {
    id: 'wf-preparation-audience',
    title: 'Checklist de préparation audience',
    shortTitle: 'Préparer audience',
    description: 'Vérifications complètes 24-48h avant de plaider',
    taskType: 'preparer',
    legalContext: ['general'],
    icon: 'ClipboardList',
    estimatedTime: '30-45 min',
    inputs: [
      { id: 'date-audience', label: 'Date de l\'audience', type: 'date', required: true },
      { id: 'juridiction', label: 'Juridiction', type: 'select', options: ['TPI', 'Tribunal de commerce', 'Cour d\'appel', 'Tribunal administratif', 'Tribunal social'], required: true },
      { id: 'type-audience', label: 'Type d\'audience', type: 'select', options: ['Plaidoirie', 'Mise en état', 'Référé', 'Conciliation'], required: true },
      { id: 'partie', label: 'Position', type: 'select', options: ['Demandeur', 'Défendeur', 'Appelant', 'Intimé'], required: true }
    ],
    steps: [
      { id: '1', title: 'Vérifier la complétude du dossier', description: 'Toutes les pièces sont-elles produites et communiquées ?', action: 'Cocher chaque pièce sur le bordereau' },
      { id: '2', title: 'Relire les conclusions', description: 'Les conclusions sont-elles à jour et cohérentes ?', action: 'Vérifier dispositif et moyens soulevés' },
      { id: '3', title: 'Préparer les arguments clés', description: 'Quels sont les 3 arguments principaux ?', action: 'Rédiger les arguments en une phrase chacun' },
      { id: '4', title: 'Anticiper les arguments adverses', description: 'Que va dire la partie adverse ?', action: 'Lister les attaques prévisibles et préparer réponses' },
      { id: '5', title: 'Identifier les points faibles', description: 'Quels sont nos points vulnérables ?', action: 'Préparer la défense des points faibles' },
      { id: '6', title: 'Préparer les questions du juge', description: 'Quelles questions le juge pourrait-il poser ?', action: 'Anticiper et préparer les réponses' }
    ],
    outputs: [
      { id: 'out-1', label: 'Checklist complétude', type: 'status', description: 'Confirmation que tout est prêt' },
      { id: 'out-2', label: 'Plan de plaidoirie', type: 'reasoning', description: 'Structure des arguments à présenter' },
      { id: 'out-3', label: 'Points d\'attention', type: 'risk', description: 'Éléments à surveiller pendant l\'audience' }
    ]
  },

  // 7. VÉRIFICATION DÉLAIS ET RISQUES PROCÉDURAUX
  {
    id: 'wf-delais-risques',
    title: 'Vérification délais et risques procéduraux',
    shortTitle: 'Vérifier délais',
    description: 'Contrôler les délais applicables et identifier les risques de forclusion',
    taskType: 'verifier',
    legalContext: ['general'],
    icon: 'Clock',
    estimatedTime: '20-30 min',
    inputs: [
      { id: 'type-procedure', label: 'Type de procédure', type: 'select', options: ['Instance au fond', 'Référé', 'Appel', 'Cassation', 'Exécution', 'Prescription extinctive'], required: true },
      { id: 'date-reference', label: 'Date de référence', type: 'date', required: true },
      { id: 'nature-acte', label: 'Nature de l\'acte à accomplir', type: 'text', placeholder: 'Ex: signification, conclusions, appel...', required: true },
      { id: 'matiere', label: 'Matière', type: 'select', options: ['Civile', 'Commerciale', 'Sociale', 'Administrative'], required: true }
    ],
    steps: [
      { id: '1', title: 'Identifier le délai applicable', description: 'Quel texte fixe le délai ?', action: 'Rechercher le délai légal ou réglementaire' },
      { id: '2', title: 'Déterminer le point de départ', description: 'Quand commence à courir le délai ?', action: 'Identifier l\'événement déclencheur (notification, signification, etc.)' },
      { id: '3', title: 'Appliquer les règles de computation', description: 'Comment calculer le délai ?', action: 'Appliquer jours francs, prorogation week-end/férié' },
      { id: '4', title: 'Calculer la date limite', description: 'Quelle est la date d\'expiration exacte ?', action: 'Poser la date butoir précise' },
      { id: '5', title: 'Identifier les causes de suspension', description: 'Y a-t-il des événements suspensifs ?', action: 'Vérifier force majeure, médiation, etc.' }
    ],
    outputs: [
      { id: 'out-1', label: 'Date limite', type: 'estimation', description: 'Date d\'expiration du délai' },
      { id: 'out-2', label: 'Jours restants', type: 'estimation', description: 'Nombre de jours avant expiration' },
      { id: 'out-3', label: 'Niveau de risque', type: 'risk', description: 'Évaluation du risque de forclusion' },
      { id: 'out-4', label: 'Action recommandée', type: 'action', description: 'Ce qu\'il faut faire et quand' }
    ]
  },

  // 8. STRUCTURATION DU RAISONNEMENT JURIDIQUE
  {
    id: 'wf-structuration-raisonnement',
    title: 'Structuration du raisonnement juridique',
    shortTitle: 'Structurer raisonnement',
    description: 'Organiser l\'argumentation juridique avant rédaction de conclusions ou mémoire',
    taskType: 'structurer',
    legalContext: ['general'],
    icon: 'Compass',
    estimatedTime: '30-60 min',
    inputs: [
      { id: 'objectif', label: 'Objectif à atteindre', type: 'textarea', placeholder: 'Que voulez-vous obtenir du juge ?', required: true },
      { id: 'faits', label: 'Faits pertinents', type: 'textarea', placeholder: 'Exposez les faits de manière chronologique...', required: true },
      { id: 'type-acte', label: 'Type d\'acte à rédiger', type: 'select', options: ['Conclusions au fond', 'Conclusions d\'appel', 'Mémoire', 'Requête', 'Assignation'], required: true },
      { id: 'arguments-adverses', label: 'Arguments adverses connus', type: 'textarea', placeholder: 'Quels arguments la partie adverse avance-t-elle ?', required: false }
    ],
    steps: [
      { id: '1', title: 'Formuler la thèse principale', description: 'Quelle est la position juridique à défendre ?', action: 'Écrire la thèse en une phrase' },
      { id: '2', title: 'Identifier les moyens de droit', description: 'Sur quels fondements juridiques s\'appuyer ?', action: 'Lister les textes et principes applicables' },
      { id: '3', title: 'Construire le syllogisme', description: 'Majeure (règle) → Mineure (faits) → Conclusion', action: 'Rédiger le raisonnement syllogistique' },
      { id: '4', title: 'Ordonner les arguments', description: 'Dans quel ordre présenter les moyens ?', action: 'Classer par force décroissante ou logique' },
      { id: '5', title: 'Préparer les réfutations', description: 'Comment répondre aux arguments adverses ?', action: 'Associer une réponse à chaque argument adverse' },
      { id: '6', title: 'Rédiger le dispositif', description: 'Que demander précisément au juge ?', action: 'Formuler les demandes de façon précise et exécutoire' }
    ],
    outputs: [
      { id: 'out-1', label: 'Plan d\'argumentation', type: 'reasoning', description: 'Structure ordonnée des arguments' },
      { id: 'out-2', label: 'Fondements juridiques', type: 'reasoning', description: 'Textes et jurisprudence à citer' },
      { id: 'out-3', label: 'Projet de dispositif', type: 'recommendation', description: 'Formulation des demandes' }
    ]
  },

  // 9. PRÉPARATION NÉGOCIATION / RÈGLEMENT AMIABLE
  {
    id: 'wf-preparation-negociation',
    title: 'Préparation négociation et règlement amiable',
    shortTitle: 'Préparer négociation',
    description: 'Structurer une négociation pour maximiser les chances de transaction',
    taskType: 'preparer',
    legalContext: ['general'],
    icon: 'Handshake',
    estimatedTime: '30-45 min',
    inputs: [
      { id: 'contexte', label: 'Contexte du litige', type: 'textarea', placeholder: 'Décrivez le différend et son historique...', required: true },
      { id: 'position-client', label: 'Position du client', type: 'textarea', placeholder: 'Que veut obtenir votre client ?', required: true },
      { id: 'position-adverse', label: 'Position adverse connue', type: 'textarea', placeholder: 'Que demande la partie adverse ?', required: false },
      { id: 'enjeu-financier', label: 'Enjeu financier estimé', type: 'number', placeholder: 'Montant en MAD', required: false },
      { id: 'type-negociation', label: 'Cadre de négociation', type: 'select', options: ['Bilatérale directe', 'Avec avocats', 'Médiation', 'Conciliation judiciaire'], required: true }
    ],
    steps: [
      { id: '1', title: 'Définir l\'objectif minimal', description: 'En dessous de quoi le client ne peut pas descendre ?', action: 'Fixer le seuil plancher non négociable' },
      { id: '2', title: 'Définir l\'objectif optimal', description: 'Quel est le meilleur résultat espéré ?', action: 'Fixer l\'objectif idéal à atteindre' },
      { id: '3', title: 'Identifier les leviers', description: 'Quels sont nos points forts ?', action: 'Lister les arguments et preuves favorables' },
      { id: '4', title: 'Identifier les concessions possibles', description: 'Sur quoi peut-on céder ?', action: 'Hiérarchiser les points négociables' },
      { id: '5', title: 'Anticiper la stratégie adverse', description: 'Quelle sera la tactique de l\'autre partie ?', action: 'Préparer les réponses aux demandes prévisibles' },
      { id: '6', title: 'Préparer la BATNA', description: 'Quelle est l\'alternative si négociation échoue ?', action: 'Évaluer les chances en justice et le coût' }
    ],
    outputs: [
      { id: 'out-1', label: 'Fourchette de négociation', type: 'estimation', description: 'Plancher et plafond acceptables' },
      { id: 'out-2', label: 'Points de négociation', type: 'reasoning', description: 'Arguments et concessions possibles' },
      { id: 'out-3', label: 'BATNA évaluée', type: 'recommendation', description: 'Alternative en cas d\'échec' }
    ]
  },

  // 10. AIDE À LA DÉCISION STRATÉGIQUE
  {
    id: 'wf-decision-strategique',
    title: 'Aide à la décision stratégique',
    shortTitle: 'Décider stratégie',
    description: 'Choisir entre agir, attendre ou négocier en évaluant chaque option',
    taskType: 'decider',
    legalContext: ['general'],
    icon: 'Scale',
    estimatedTime: '30-45 min',
    inputs: [
      { id: 'situation', label: 'Situation actuelle', type: 'textarea', placeholder: 'Décrivez la situation et le dilemme...', required: true },
      { id: 'options', label: 'Options envisagées', type: 'textarea', placeholder: 'Listez les différentes options possibles...', required: true },
      { id: 'contraintes', label: 'Contraintes à respecter', type: 'textarea', placeholder: 'Délais, budget, exigences du client...', required: false },
      { id: 'priorite-client', label: 'Priorité du client', type: 'select', options: ['Rapidité', 'Économie', 'Certitude', 'Confidentialité', 'Principe'], required: true }
    ],
    steps: [
      { id: '1', title: 'Lister les options', description: 'Quelles sont toutes les voies d\'action possibles ?', action: 'Énumérer: agir maintenant, attendre, négocier, autres' },
      { id: '2', title: 'Évaluer les chances de succès', description: 'Quelle probabilité de succès pour chaque option ?', action: 'Attribuer une probabilité réaliste' },
      { id: '3', title: 'Évaluer les coûts', description: 'Quel coût financier et temporel ?', action: 'Chiffrer honoraires, frais, durée pour chaque option' },
      { id: '4', title: 'Évaluer les risques', description: 'Quels risques pour chaque option ?', action: 'Identifier les risques juridiques et pratiques' },
      { id: '5', title: 'Aligner avec les priorités client', description: 'Quelle option correspond aux priorités ?', action: 'Croiser les options avec les attentes du client' },
      { id: '6', title: 'Formuler la recommandation', description: 'Quelle est la meilleure option ?', action: 'Recommander et justifier le choix' }
    ],
    outputs: [
      { id: 'out-1', label: 'Tableau comparatif', type: 'reasoning', description: 'Analyse coût/bénéfice/risque de chaque option' },
      { id: 'out-2', label: 'Recommandation', type: 'recommendation', description: 'Option recommandée avec justification' },
      { id: 'out-3', label: 'Plan d\'action', type: 'action', description: 'Prochaines étapes si option retenue' }
    ]
  }
];

// Quick access workflows for the chat section (subset)
export const quickAccessWorkflows = workflows.slice(0, 6);

// Get workflows by task type
export const getWorkflowsByTaskType = (taskType: TaskType): Workflow[] => {
  return workflows.filter(w => w.taskType === taskType);
};

// Get workflows by legal context
export const getWorkflowsByContext = (context: LegalContext): Workflow[] => {
  return workflows.filter(w => w.legalContext.includes(context));
};

// Search workflows
export const searchWorkflows = (query: string): Workflow[] => {
  const lowerQuery = query.toLowerCase();
  return workflows.filter(w => 
    w.title.toLowerCase().includes(lowerQuery) ||
    w.description.toLowerCase().includes(lowerQuery) ||
    w.shortTitle.toLowerCase().includes(lowerQuery)
  );
};
