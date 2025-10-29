# Routes Manquantes dans le Backend

Ce document liste toutes les routes que le frontend utilise mais qui n'existent pas dans le backend actuel.

## Résumé
- **Total de routes attendues par le frontend**: 20
- **Routes existantes dans le backend**: 7
- **Routes manquantes ou incompatibles**: 13

---

## 1. ROUTES D'AUTHENTIFICATION

### ✅ Routes Existantes
| Frontend | Backend | Statut |
|----------|---------|--------|
| `POST /auth/register` | `POST /api/auth/register` | ✅ Compatible |
| `POST /auth/login` | `POST /api/auth/login` | ✅ Compatible |

### ⚠️ Routes à Adapter
| Frontend | Backend Actuel | Action Requise |
|----------|----------------|----------------|
| `GET /auth/profile` | `GET /api/me/` | 🔧 Changer le chemin dans le frontend |

### ❌ Routes Manquantes
| Route Frontend | Description | Priorité |
|----------------|-------------|----------|
| `PUT /auth/profile` | Mise à jour du profil utilisateur | **HAUTE** |

**Détails:**
- **Route attendue**: `PUT /api/auth/profile`
- **Payload**: `{ firstName?, lastName?, lawFirm?, legalSpecialty? }`
- **Réponse attendue**: `{ user: User }`
- **Note**: Le backend n'a actuellement aucune route pour mettre à jour le profil utilisateur

---

## 2. ROUTES FOLDERS/DOSSIERS

### ✅ Routes Existantes
| Frontend | Backend | Statut |
|----------|---------|--------|
| `GET /folders` | `GET /api/folders/` | ✅ Compatible |
| `POST /folders` | `POST /api/folders/` | ✅ Compatible |
| `DELETE /folders/:id` | `DELETE /api/folders/:id` | ✅ Compatible |

### ⚠️ Routes à Adapter
| Frontend | Backend Actuel | Action Requise |
|----------|----------------|----------------|
| `PUT /folders/:id` | `PATCH /api/folders/:id` | 🔧 Changer PUT en PATCH dans le frontend |

**Note**: Le backend utilise PATCH pour les mises à jour partielles au lieu de PUT.

### ❌ Routes Manquantes

#### 2.1 Détails de Folder
| Route Frontend | Description | Priorité |
|----------------|-------------|----------|
| `GET /folders/:id` | Obtenir les détails d'un dossier par ID | **HAUTE** |

**Détails:**
- **Route attendue**: `GET /api/folders/:id`
- **Réponse attendue**: `{ folder: Folder }` avec tous les détails (attachments, timeline, documents, deadlines)

---

#### 2.2 Gestion des Pièces Jointes (Attachments)
| Route Frontend | Description | Priorité |
|----------------|-------------|----------|
| `POST /folders/:id/attachments` | Ajouter une pièce jointe à un dossier | **MOYENNE** |
| `DELETE /folders/attachments/:attachmentId` | Supprimer une pièce jointe | **MOYENNE** |

**Détails POST attachments:**
- **Route attendue**: `POST /api/folders/:id/attachments`
- **Payload**: `{ name: string, type: "EVIDENCE"|"CONTRACT"|"DOCUMENT"|"OTHER", url: string, size: number }`
- **Réponse attendue**: `{ attachment: Attachment }`

**Détails DELETE attachment:**
- **Route attendue**: `DELETE /api/folders/attachments/:attachmentId`

**Note**: Le backend a une route `/api/documents/upload` qui pourrait être adaptée, mais elle n'est pas directement compatible avec l'API actuelle du frontend.

---

#### 2.3 Gestion de la Timeline
| Route Frontend | Description | Priorité |
|----------------|-------------|----------|
| `POST /folders/:id/timeline` | Ajouter une entrée à la chronologie | **MOYENNE** |
| `DELETE /folders/timeline/:entryId` | Supprimer une entrée de la timeline | **MOYENNE** |

**Détails POST timeline:**
- **Route attendue**: `POST /api/folders/:id/timeline`
- **Payload**: `{ title: string, description: string, type: "FACT"|"PROCEDURE"|"HEARING"|"DEADLINE"|"EVENT", date: string }`
- **Réponse attendue**: `{ entry: TimelineEntry }`

**Détails DELETE timeline entry:**
- **Route attendue**: `DELETE /api/folders/timeline/:entryId`

---

#### 2.4 Gestion des Échéances (Deadlines)
| Route Frontend | Description | Priorité |
|----------------|-------------|----------|
| `POST /folders/:id/deadlines` | Créer une nouvelle échéance | **HAUTE** |
| `PATCH /folders/deadlines/:deadlineId/status` | Mettre à jour le statut d'une échéance | **HAUTE** |
| `DELETE /folders/deadlines/:deadlineId` | Supprimer une échéance | **MOYENNE** |

**Détails POST deadline:**
- **Route attendue**: `POST /api/folders/:id/deadlines`
- **Payload**: `{ title: string, description: string, dueDate: string, priority: "LOW"|"MEDIUM"|"HIGH"|"URGENT" }`
- **Réponse attendue**: `{ deadline: Deadline }`

**Détails PATCH deadline status:**
- **Route attendue**: `PATCH /api/folders/deadlines/:deadlineId/status`
- **Payload**: `{ status: "PENDING"|"COMPLETED"|"OVERDUE" }`
- **Réponse attendue**: `{ deadline: Deadline }`

**Détails DELETE deadline:**
- **Route attendue**: `DELETE /api/folders/deadlines/:deadlineId`

---

#### 2.5 Gestion des Documents Générés
| Route Frontend | Description | Priorité |
|----------------|-------------|----------|
| `POST /folders/:id/documents` | Générer/ajouter un document | **MOYENNE** |
| `PUT /folders/documents/:documentId` | Mettre à jour un document | **MOYENNE** |
| `DELETE /folders/documents/:documentId` | Supprimer un document | **BASSE** |

**Détails POST document:**
- **Route attendue**: `POST /api/folders/:id/documents`
- **Payload**: `{ title: string, type: "CONTRACT"|"CONCLUSION"|"NOTE"|"LETTER"|"REPORT", content: string }`
- **Réponse attendue**: `{ document: GeneratedDocument }`

**Détails PUT document:**
- **Route attendue**: `PUT /api/folders/documents/:documentId`
- **Payload**: `{ title?: string, content?: string }`
- **Réponse attendue**: `{ document: GeneratedDocument }`

**Détails DELETE document:**
- **Route attendue**: `DELETE /api/folders/documents/:documentId`

---

## 3. ROUTES CHAT/CONVERSATIONS

### ⚠️ Routes à Adapter

| Route Frontend | Backend Actuel | Action Requise |
|----------------|----------------|----------------|
| `GET /chat/conversations` | `GET /api/conversations/` | 🔧 Retirer le préfixe `/chat` |
| `POST /chat/conversations` | `POST /api/conversations/` | 🔧 Retirer le préfixe `/chat` |
| `GET /chat/conversations/:id` | `GET /api/conversations/:id/messages` | 🔧 Adapter le chemin et la logique |
| `POST /chat/conversations/:id/messages` | `POST /api/conversations/:id/message` | 🔧 Changer `/messages` en `/message` |
| `DELETE /chat/conversations/:id` | `DELETE /api/conversations/:id` | 🔧 Retirer le préfixe `/chat` |

**Notes importantes:**
1. Le backend n'utilise pas le préfixe `/chat` pour les routes de conversations
2. La route pour obtenir les messages est `/conversations/:id/messages` (GET)
3. La route pour envoyer un message est `/conversations/:id/message` (POST, singulier)

### ❌ Routes Manquantes

| Route Frontend | Description | Priorité |
|----------------|-------------|----------|
| `PATCH /chat/conversations/:id/move` | Déplacer une conversation vers un dossier | **MOYENNE** |

**Détails:**
- **Route attendue**: `PATCH /api/conversations/:id/move` ou `PATCH /api/conversations/:id`
- **Payload**: `{ folderId: string | null }`
- **Réponse attendue**: `{ conversation: Conversation }`
- **Note**: Le backend a `PATCH /api/conversations/:id` pour mettre à jour le titre, mais pas pour changer le folderId

---

## 4. RÉSUMÉ DES ACTIONS REQUISES

### 🔧 Modifications dans le Frontend (7 routes)
1. Changer `GET /auth/profile` → `GET /me/`
2. Changer `PUT /folders/:id` → `PATCH /folders/:id`
3. Changer `GET /chat/conversations` → `GET /conversations`
4. Changer `POST /chat/conversations` → `POST /conversations`
5. Changer `GET /chat/conversations/:id` → `GET /conversations/:id/messages`
6. Changer `POST /chat/conversations/:id/messages` → `POST /conversations/:id/message`
7. Changer `DELETE /chat/conversations/:id` → `DELETE /conversations/:id`

### ❌ Routes à Implémenter dans le Backend (13 routes)

#### Priorité HAUTE (3 routes)
1. `PUT /api/auth/profile` - Mise à jour du profil utilisateur
2. `GET /api/folders/:id` - Détails d'un dossier
3. `POST /api/folders/:id/deadlines` - Créer une échéance
4. `PATCH /api/folders/deadlines/:id/status` - Mettre à jour une échéance

#### Priorité MOYENNE (7 routes)
5. `POST /api/folders/:id/attachments` - Ajouter une pièce jointe
6. `DELETE /api/folders/attachments/:id` - Supprimer une pièce jointe
7. `POST /api/folders/:id/timeline` - Ajouter une entrée timeline
8. `DELETE /api/folders/timeline/:id` - Supprimer une entrée timeline
9. `POST /api/folders/:id/documents` - Ajouter un document généré
10. `PUT /api/folders/documents/:id` - Mettre à jour un document
11. `PATCH /api/conversations/:id` - Déplacer/mettre à jour une conversation (support du champ folderId)

#### Priorité BASSE (2 routes)
12. `DELETE /api/folders/deadlines/:id` - Supprimer une échéance
13. `DELETE /api/folders/documents/:id` - Supprimer un document

---

## 5. COMPATIBILITÉ DES MODÈLES DE DONNÉES

### ⚠️ Différences de Schéma

#### User Model
**Frontend attend:**
```typescript
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  lawFirm?: string,
  legalSpecialty?: string,
  createdAt: string,
  updatedAt: string
}
```

**Backend retourne:**
```javascript
{
  id: number,          // ⚠️ number au lieu de string
  email: string,
  firstName: string,
  lastName: string,
  firm: string,        // ⚠️ "firm" au lieu de "lawFirm"
  specialty: string,   // ⚠️ "specialty" au lieu de "legalSpecialty"
  createdAt: datetime
  // ❌ pas de updatedAt
}
```

#### Folder Model
**Frontend attend:**
```typescript
{
  id: string,
  userId: string,
  name: string,
  description?: string,
  color: string,
  createdAt: string,
  updatedAt: string,
  attachments?: Attachment[],
  timeline?: TimelineEntry[],
  documents?: GeneratedDocument[],
  deadlines?: Deadline[],
  conversations?: Conversation[]
}
```

**Backend retourne:**
```javascript
{
  id: number,        // ⚠️ number au lieu de string
  userId: number,    // ⚠️ number au lieu de string
  name: string,
  createdAt: datetime
  // ❌ Pas de description, color, updatedAt
  // ❌ Pas de relations (attachments, timeline, etc.)
}
```

#### Conversation Model
**Frontend attend:**
```typescript
{
  id: string,
  userId: string,
  title: string,
  folderId?: string,
  createdAt: string,
  updatedAt: string,
  messages?: Message[]
}
```

**Backend retourne:**
```javascript
{
  id: number,        // ⚠️ number au lieu de string
  userId: number,    // ⚠️ number au lieu de string
  title: string?,
  caseId: number?,   // ⚠️ "caseId" au lieu de "folderId"
  createdAt: datetime
  // ❌ Pas de updatedAt
  // Messages récupérées via GET /conversations/:id/messages
}
```

**Actions requises:**
1. Convertir les `id` de number à string dans le frontend
2. Mapper `firm` → `lawFirm` et `specialty` → `legalSpecialty`
3. Mapper `caseId` → `folderId` (ou vice versa)
4. Ajouter les champs manquants dans le backend si nécessaire

---

## 6. ROUTES BACKEND EXISTANTES NON UTILISÉES PAR LE FRONTEND

Ces routes existent dans le backend mais ne sont pas utilisées par le frontend actuel:

| Route Backend | Description | Utilité |
|---------------|-------------|---------|
| `POST /api/documents/upload` | Upload de documents avec RAG | Pourrait remplacer les attachments |
| `POST /api/stt/transcribe` | Transcription audio vers texte | Fonctionnalité non implémentée dans le frontend |
| `POST /api/tts/speak` | Synthèse vocale | Fonctionnalité non implémentée dans le frontend |
| `GET /api/clients/` | Liste des clients | Fonctionnalité non implémentée dans le frontend |
| `POST /api/clients/` | Créer un client | Fonctionnalité non implémentée dans le frontend |
| `GET /api/cases/` | Liste des cas/dossiers | Pourrait être lié aux folders |
| `POST /api/cases/` | Créer un cas | Pourrait être lié aux folders |
| `POST /api/ai/contract/draft` | Génération de contrats | Fonctionnalité non implémentée dans le frontend |
| `POST /api/ai/contract/review` | Analyse de contrats | Fonctionnalité non implémentée dans le frontend |
| `GET /api/conversations/:id/messages` | Récupérer tous les messages | À utiliser pour charger l'historique |
| `PATCH /api/conversations/:id` | Mettre à jour le titre | Fonctionnalité non implémentée dans le frontend |
| `DELETE /api/admin/qdrant/reset` | Reset vector DB (admin) | Fonctionnalité admin non exposée |

---

## 7. RECOMMANDATIONS

### Approche Court Terme (Connection Immédiate)
1. Adapter le frontend pour utiliser les routes backend existantes
2. Désactiver temporairement les fonctionnalités sans backend (attachments, timeline, deadlines, documents)
3. Convertir les types de données (number ↔ string, firm ↔ lawFirm)

### Approche Long Terme (Complétion Backend)
1. Implémenter les routes manquantes priorité HAUTE
2. Ajouter les relations manquantes dans les modèles Prisma
3. Implémenter les routes priorité MOYENNE
4. Intégrer les fonctionnalités backend existantes mais non utilisées (STT, TTS, AI contracts)

---

**Document généré le**: 2025-10-29
**Version Frontend**: Commit 2a9a2c0
**Version Backend**: Analysé depuis le repository GitHub
