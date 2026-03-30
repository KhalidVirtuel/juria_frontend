// Templates de documents juridiques pour JURIA
// src/lib/documentTemplates.ts

export interface DocumentTemplate {
  id: string;
  type: 'contract' | 'conclusion' | 'note' | 'letter' | 'report';
  name: string;
  description: string;
  icon: string;
  content: string;
  isDefault?: boolean;
}

export const documentTemplates: DocumentTemplate[] = [
  // CONTRATS
  {
    id: 'contract-cdd',
    type: 'contract',
    name: 'CDD',
    description: 'Contrat à Durée Déterminée',
    icon: '📄',
    isDefault: true,
    content: `<h1>CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE</h1>
<p><strong>Entre</strong> : [Nom société]<br><strong>Et</strong> : [Nom salarié]</p>
<h3>Article 1 : Durée</h3>
<p>Du [Date début] au [Date fin]</p>
<h3>Article 2 : Fonction</h3>
<p>Poste : <strong>[Fonction]</strong></p>
<h3>Article 3 : Rémunération</h3>
<p>Salaire : <strong>[Montant]</strong> DH/mois</p>
<p style="margin-top:50px"><strong>Signatures :</strong></p>`
  },
  {
    id: 'contract-cdi',
    type: 'contract',
    name: 'CDI',
    description: 'Contrat à Durée Indéterminée',
    icon: '📄',
    content: `<h1>CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE</h1>
<p><strong>Entre</strong> : [Société]<br><strong>Et</strong> : [Salarié]</p>
<p>Contrat CDI à compter du [Date]</p>`
  },
  {
    id: 'contract-bail',
    type: 'contract',
    name: 'Bail Commercial',
    description: 'Contrat de bail',
    icon: '🏢',
    content: `<h1>CONTRAT DE BAIL COMMERCIAL</h1>
<p><strong>Bailleur</strong> : [Nom]<br><strong>Preneur</strong> : [Nom]</p>
<p>Loyer : [Montant] DH/mois</p>`
  },

  // CONCLUSIONS
  {
    id: 'conclusion-civil',
    type: 'conclusion',
    name: 'Conclusions Civiles',
    description: 'Tribunal civil',
    icon: '⚖️',
    isDefault: true,
    content: `<h1>CONCLUSIONS</h1>
<h2>DEVANT LE TRIBUNAL DE PREMIÈRE INSTANCE</h2>
<p><strong>Dossier :</strong> [N°]</p>
<h3>POUR :</h3>
<p>[Demandeur] - Représenté par Me [Avocat]</p>
<h3>CONTRE :</h3>
<p>[Défendeur]</p>
<h2>PAR CES MOTIFS</h2>
<p>Plaise au Tribunal de bien vouloir :</p>
<ul><li>Déclarer la demande recevable</li><li>[Demandes]</li></ul>`
  },
  {
    id: 'conclusion-commercial',
    type: 'conclusion',
    name: 'Conclusions Commerciales',
    description: 'Tribunal de commerce',
    icon: '💼',
    content: `<h1>CONCLUSIONS</h1>
<h2>DEVANT LE TRIBUNAL DE COMMERCE</h2>
<p><strong>Pour :</strong> [Société]</p>
<p><strong>Demande :</strong> Paiement de [Montant] DH</p>`
  },

  // LETTRES
  {
    id: 'letter-mise-en-demeure',
    type: 'letter',
    name: 'Mise en Demeure',
    description: 'Lettre de mise en demeure',
    icon: '✉️',
    isDefault: true,
    content: `<div style="text-align:right"><p>[Expéditeur]<br>[Date]</p></div>
<p><strong>Destinataire :</strong> [Nom]</p>
<p><strong>Objet : Mise en demeure</strong></p>
<p>Monsieur/Madame,</p>
<p>Nous vous mettons en demeure de régler <strong>[Montant]</strong> DH dans un délai de 8 jours.</p>
<p>Cordialement,</p>`
  },
  {
    id: 'letter-reclamation',
    type: 'letter',
    name: 'Réclamation',
    description: 'Lettre de réclamation',
    icon: '📨',
    content: `<p><strong>Objet : Réclamation</strong></p>
<p>Madame, Monsieur,</p>
<p>Je vous adresse cette réclamation concernant [Objet].</p>`
  },

  // NOTES
  {
    id: 'note-interne',
    type: 'note',
    name: 'Note Interne',
    description: 'Note de synthèse',
    icon: '📝',
    isDefault: true,
    content: `<h1>NOTE INTERNE</h1>
<p><strong>Dossier :</strong> [Nom]<br><strong>Date :</strong> [Date]</p>
<h2>OBJET</h2>
<p>[Objet de la note]</p>
<h2>ANALYSE</h2>
<p>[Analyse]</p>
<h2>RECOMMANDATIONS</h2>
<ol><li>[Action 1]</li></ol>`
  },
  {
    id: 'note-consultation',
    type: 'note',
    name: 'Consultation Juridique',
    description: 'Réponse juridique',
    icon: '💡',
    content: `<h1>NOTE DE CONSULTATION</h1>
<p><strong>Question :</strong> [Question juridique]</p>
<h2>RÉPONSE</h2>
<p>[Réponse motivée]</p>`
  },

  // RAPPORTS
  {
    id: 'report-audit',
    type: 'report',
    name: 'Rapport d\'Audit',
    description: 'Audit juridique',
    icon: '📊',
    isDefault: true,
    content: `<h1>RAPPORT D'AUDIT JURIDIQUE</h1>
<p><strong>Entité :</strong> [Nom]</p>
<h2>CONSTATS</h2>
<p>[Constats]</p>
<h2>RECOMMANDATIONS</h2>
<ol><li>[Recommandation]</li></ol>`
  }
];

// Obtenir le template par défaut d'un type
export const getDefaultTemplateByType = (type: DocumentTemplate['type']): DocumentTemplate | null => {
  return documentTemplates.find(t => t.type === type && t.isDefault) || 
         documentTemplates.find(t => t.type === type) || 
         null;
};

// Obtenir tous les templates d'un type
export const getTemplatesByType = (type: DocumentTemplate['type']): DocumentTemplate[] => {
  return documentTemplates.filter(t => t.type === type);
};

// Obtenir un template par ID
export const getTemplateById = (id: string): DocumentTemplate | undefined => {
  return documentTemplates.find(t => t.id === id);
};