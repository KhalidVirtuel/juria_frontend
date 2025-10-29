# Configuration de Connexion Frontend-Backend

Ce document explique comment configurer et connecter le frontend Juria avec le backend.

## Configuration de l'API

### URL de l'API

Le frontend est configuré pour se connecter au backend via la variable d'environnement `VITE_API_URL`.

**Fichier**: `.env`
```env
VITE_API_URL=http://localhost:8787/api
```

### Configuration Axios

Le client API est configuré dans `/src/lib/api.ts` avec:
- **Base URL**: `http://localhost:8787/api` (par défaut)
- **Timeout**: 30 secondes
- **Authentication**: JWT Bearer token automatiquement ajouté via intercepteur
- **Error handling**: Déconnexion automatique sur erreur 401

---

## Modifications Effectuées

### 1. Routes d'Authentification

**Changements:**
- ✅ `GET /auth/profile` → `GET /me/`
- ✅ `PUT /auth/profile` → `PUT /me/` (⚠️ route non implémentée dans le backend)

**Adaptations:**
- Conversion `firm` → `lawFirm`
- Conversion `specialty` → `legalSpecialty`
- Les IDs sont convertis de `number` à `string`
- Le backend retourne uniquement `{ token }` pour login/register, le profil est récupéré ensuite

### 2. Routes Folders

**Changements:**
- ✅ `PUT /folders/:id` → `PATCH /folders/:id`
- ✅ Adaptation des réponses du backend (format différent)

**Limitations:**
- ❌ `GET /folders/:id` n'existe pas (workaround: récupérer tous les folders et filtrer)
- ❌ Les champs `description` et `color` ne sont pas supportés par le backend
- ❌ Les routes attachments, timeline, deadlines, documents ne sont pas implémentées

### 3. Routes Chat/Conversations

**Changements:**
- ✅ `/chat/conversations` → `/conversations`
- ✅ `/chat/conversations/:id` → `/conversations/:id/messages`
- ✅ `/chat/conversations/:id/messages` → `/conversations/:id/message` (singulier)

**Adaptations:**
- Conversion `folderId` → `folder_id` (et number au lieu de string)
- Les messages sont récupérés séparément via `/conversations/:id/messages`
- La réponse de `sendMessage` est adaptée (`{ reply, answer }` → `{ userMessage, assistantMessage }`)

### 4. Adaptation des Données

**Fonctions de conversion créées:**
- `adaptUserFromBackend()`: Convertit l'utilisateur backend vers frontend
- `adaptFolderFromBackend()`: Convertit les folders backend vers frontend
- `adaptConversationFromBackend()`: Convertit les conversations backend vers frontend
- `adaptMessageFromBackend()`: Convertit les messages backend vers frontend

**Conversions principales:**
- IDs: `number` → `string`
- Champs utilisateur: `firm` → `lawFirm`, `specialty` → `legalSpecialty`
- Rôle message: `"user"/"assistant"` → `"USER"/"ASSISTANT"`
- Ajout de valeurs par défaut pour les champs manquants

---

## Démarrage

### Prérequis

1. **Backend démarré et fonctionnel**
   ```bash
   cd /path/to/juria_backend
   npm install
   npm start
   ```
   Le backend doit être accessible sur `http://localhost:8787`

2. **Base de données MySQL configurée**
   - Serveur MySQL en cours d'exécution
   - Base de données `jure_ai` créée
   - Migrations Prisma appliquées

3. **Variables d'environnement backend configurées**
   - `DATABASE_URL` correctement configurée
   - `JWT_SECRET` défini
   - `OPENAI_API_KEY` configuré (pour les fonctionnalités IA)

### Démarrage du Frontend

```bash
cd /home/user/juria_frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173` (port par défaut de Vite).

---

## Tests de Connexion

### 1. Test d'Inscription

1. Ouvrir `http://localhost:5173/auth`
2. Remplir le formulaire d'inscription
3. Vérifier que:
   - Un token JWT est reçu
   - Le profil utilisateur est chargé
   - Redirection vers `/app`

### 2. Test de Connexion

1. Utiliser les identifiants créés
2. Vérifier l'authentification
3. Le token doit être stocké dans `localStorage`

### 3. Test des Folders

1. Créer un nouveau dossier
2. Modifier le nom d'un dossier
3. Supprimer un dossier

### 4. Test des Conversations

1. Créer une nouvelle conversation
2. Envoyer un message
3. Vérifier la réponse de l'IA (via RAG)
4. Supprimer une conversation

---

## Fonctionnalités Désactivées

Les fonctionnalités suivantes sont documentées mais **non fonctionnelles** car elles nécessitent des routes backend non implémentées:

### Folders
- ❌ Pièces jointes (Attachments)
- ❌ Timeline/Chronologie
- ❌ Échéances (Deadlines)
- ❌ Documents générés

### Conversations
- ⚠️ Déplacer une conversation vers un folder (partiellement supporté)

### Profil
- ❌ Mise à jour du profil utilisateur

**Note**: Ces fonctionnalités peuvent être implémentées en ajoutant les routes manquantes listées dans `ROUTES_MANQUANTES.md`.

---

## Dépannage

### Erreur 401 (Non autorisé)

**Cause**: Token JWT invalide ou expiré

**Solution**:
1. Vérifier que `JWT_SECRET` est identique entre frontend et backend
2. Se déconnecter et se reconnecter
3. Vérifier que le token est bien envoyé dans les requêtes

### Erreur CORS

**Cause**: Le backend bloque les requêtes du frontend

**Solution**:
Le backend a déjà CORS activé avec `app.use(cors())`. Si le problème persiste:
1. Vérifier que le backend écoute bien sur port 8787
2. Vérifier la configuration CORS dans `/home/user/juria_backend/src/index.js`

### Erreur de connexion à la base de données

**Cause**: MySQL non démarré ou mauvaise configuration

**Solution**:
1. Vérifier que MySQL est démarré
2. Vérifier `DATABASE_URL` dans le backend
3. Exécuter les migrations Prisma si nécessaire:
   ```bash
   cd /home/user/juria_backend
   npx prisma migrate dev
   ```

### Erreur "Cannot read property 'id' of undefined"

**Cause**: Format de réponse backend inattendu

**Solution**:
1. Vérifier que les fonctions d'adaptation dans `api.ts` sont correctement appliquées
2. Consulter la console du navigateur pour voir la structure exacte des réponses
3. Ajuster les fonctions `adaptXxxFromBackend()` si nécessaire

---

## Architecture de la Connexion

```
┌─────────────────────┐         ┌──────────────────────┐
│   React Frontend    │         │   Express Backend    │
│   (Port 5173)       │         │   (Port 8787)        │
├─────────────────────┤         ├──────────────────────┤
│                     │         │                      │
│  Components         │   HTTP  │  Routes              │
│      ↓              │ <────> │    /auth/*           │
│  Store (Zustand)    │   JWT   │    /me/*             │
│      ↓              │  Bearer │    /folders/*        │
│  API Client (Axios) │  Token  │    /conversations/*  │
│      ↓              │         │    /documents/*      │
│  api.ts             │         │    /ai/*             │
│  - authAPI          │         │                      │
│  - foldersAPI       │         │  Middleware          │
│  - chatAPI          │         │    - authRequired    │
│                     │         │    - error handler   │
│  Adapters           │         │                      │
│  - adaptUser        │         │  Services            │
│  - adaptFolder      │         │    - Prisma ORM      │
│  - adaptConv        │         │    - OpenAI          │
│  - adaptMessage     │         │    - RAG (Qdrant)    │
│                     │         │                      │
└─────────────────────┘         └──────────────────────┘
         │                                 │
         └─────────────┬───────────────────┘
                       ↓
               ┌──────────────┐
               │    MySQL     │
               │  (Port 3306) │
               └──────────────┘
```

---

## Prochaines Étapes

Pour compléter l'intégration, il est recommandé d'implémenter les routes backend manquantes:

### Priorité HAUTE
1. `PUT /api/me/` - Mise à jour du profil utilisateur
2. `GET /api/folders/:id` - Récupérer un dossier spécifique
3. `POST /api/folders/:id/deadlines` - Créer des échéances
4. `PATCH /api/folders/deadlines/:id/status` - Mettre à jour les échéances

### Priorité MOYENNE
5. Routes pour attachments, timeline, documents
6. Support complet du déplacement de conversations entre folders

### Améliorations
7. Implémenter les fonctionnalités backend existantes mais non utilisées:
   - Speech-to-Text (STT)
   - Text-to-Speech (TTS)
   - Génération de contrats IA
   - Analyse de contrats IA
   - Gestion des clients
   - Gestion des cas

Voir `ROUTES_MANQUANTES.md` pour plus de détails.

---

**Document créé le**: 2025-10-29
**Auteur**: Claude Code
**Version**: 1.0
