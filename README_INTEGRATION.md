# Jure AI Frontend - Intégré avec Backend

Frontend **100% intégré** avec le backend Node.js + MySQL + Prisma.

## 🎯 Changements Principaux

Ce frontend a été adapté pour se connecter parfaitement au backend :

### ✅ Supabase Remplacé par API Backend
- ❌ ~~Supabase Client~~ → ✅ **Axios API Client** (`src/lib/api.ts`)
- ❌ ~~Auth Supabase~~ → ✅ **JWT Authentication** avec localStorage
- ❌ ~~Supabase Database~~ → ✅ **REST API** avec MySQL

### ✅ Architecture Adaptée
- **Store Zustand** : Conservé et adapté pour utiliser le backend
- **Actions Store** : Toutes connectées aux endpoints API
- **Types TypeScript** : Synchronisés avec le backend

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- Node.js 18+ ou Bun
- Backend démarré sur `http://localhost:8787`

### 2. Installation

```bash
# Installer les dépendances
npm install
# OU
bun install
```

### 3. Configuration

Créez un fichier `.env` :

```bash
cp .env.example .env
```

Modifiez `.env` :
```env
VITE_API_URL=http://localhost:8787/api
```

### 4. Démarrage

```bash
# Développement
npm run dev
# OU
bun run dev
```

L'application sera disponible sur `http://localhost:5173`

---

## 📊 Architecture Frontend

### Structure des Dossiers

```
src/
├── components/          # Composants UI réutilisables
│   ├── Chat/           # Composants de chat
│   ├── Layout/         # Composants de mise en page
│   ├── Navigation/     # Navigation et barre latérale
│   └── ui/             # shadcn/ui components
├── lib/                # Bibliothèques et utilitaires
│   ├── api.ts          # ⭐ Client API (remplace Supabase)
│   └── utils.ts        # Utilitaires
├── pages/              # Pages principales
│   ├── Auth.tsx        # ⭐ Authentification (adaptée)
│   ├── Index.tsx       # Page principale
│   └── Landing.tsx     # Page d'accueil
├── store/              # Zustand store
│   ├── chatStore.ts               # Store principal
│   ├── storeInitialization.ts    # ⭐ Chargement des données (adapté)
│   ├── conversationActions.ts    # ⭐ Actions conversations (adaptées)
│   ├── folderActions.ts          # ⭐ Actions dossiers (adaptées)
│   ├── folderEnhancedActions.ts  # ⭐ Actions avancées (adaptées)
│   └── types.ts                  # Types TypeScript
└── utils/              # Utilitaires métier
    └── legalAI.ts      # Logique IA juridique
```

### Fichiers Clés Modifiés

**1. `src/lib/api.ts`** - Client API
```typescript
// Remplace totalement Supabase
export const authAPI = {
  login, register, getProfile, updateProfile
}
export const foldersAPI = {
  getAll, create, update, delete, addAttachment, ...
}
export const chatAPI = {
  getConversations, sendMessage, createConversation, ...
}
```

**2. `src/store/storeInitialization.ts`** - Chargement des données
```typescript
// Charge les folders et conversations depuis le backend
export const initializeStore = async () => {
  const [folders, conversations] = await Promise.all([
    foldersAPI.getAll(),
    chatAPI.getConversations()
  ]);
  // Convertit les dates backend en timestamps
  // Met à jour le store
}
```

**3. `src/store/conversationActions.ts`** - Actions conversations
```typescript
// Appelle le backend pour chaque action
addMessage: async (conversationId, role, content) => {
  const { userMessage, assistantMessage } = await chatAPI.sendMessage(conversationId, content);
  // Met à jour le store local
}
```

**4. `src/store/folderActions.ts`** - Actions dossiers
```typescript
// Appelle le backend pour créer/modifier/supprimer
createFolder: async (name, description, color) => {
  const { folder } = await foldersAPI.create({ name, description, color });
  // Met à jour le store local
}
```

**5. `src/pages/Auth.tsx`** - Authentification
```typescript
// Utilise authAPI au lieu de Supabase
const handleLogin = async () => {
  const response = await authAPI.login(email, password);
  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(response.user));
  navigate('/app');
}
```

---

## 🔌 Connexion avec le Backend

### Flow d'Authentification

1. **Inscription/Connexion** (`Auth.tsx`)
   ```
   User → authAPI.login(email, password)
        → Backend POST /api/auth/login
        → Response: { user, token }
        → localStorage.setItem('token', token)
        → Navigate to /app
   ```

2. **Requêtes Authentifiées** (Intercepteur Axios)
   ```
   Chaque requête API
   → axios.interceptors.request
   → Ajoute header: Authorization: Bearer {token}
   → Backend vérifie le token JWT
   ```

3. **Gestion des Erreurs 401**
   ```
   Si backend répond 401
   → axios.interceptors.response
   → localStorage.removeItem('token')
   → Redirect vers /auth
   ```

### Flow de Chargement des Données

1. **Initialisation du Store** (Au démarrage de l'app)
   ```
   App Start
   → useChatStore.initialize()
   → foldersAPI.getAll() + chatAPI.getConversations() (parallèle)
   → Conversion backend → store format
   → Store mis à jour avec toutes les données
   ```

2. **Actions Utilisateur**
   ```
   User crée un dossier
   → createFolder('Mon dossier', '...', '#3b82f6')
   → foldersAPI.create({ name, description, color })
   → Backend crée le dossier en DB
   → Response: { folder }
   → Store local mis à jour (optimistic UI)
   ```

### Conversion des Données

Le backend utilise des dates ISO 8601, le frontend des timestamps :

```typescript
// Helper dans chaque action
const toTimestamp = (dateStr: string): number => new Date(dateStr).getTime();

// Conversion backend → frontend
const convertFolder = (folder: BackendFolder): FolderStore => ({
  id: folder.id,
  name: folder.name,
  createdAt: toTimestamp(folder.createdAt), // "2024-01-01T00:00:00Z" → 1704067200000
  attachments: folder.attachments.map(a => ({
    ...a,
    uploadedAt: toTimestamp(a.uploadedAt),
    type: a.type.toLowerCase() // "EVIDENCE" → "evidence"
  }))
});
```

---

## 🎨 Technologies

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS + shadcn/ui
- Zustand (State management)
- Axios (HTTP client)
- React Router

**Backend Compatible:**
- Node.js 20 + Express + TypeScript
- MySQL 8.0 avec Prisma ORM
- JWT Authentication
- Groq + OpenAI pour l'IA

---

## 📚 Endpoints Utilisés

### Authentification
```
POST /api/auth/register    - Inscription
POST /api/auth/login       - Connexion
GET  /api/auth/profile     - Profil utilisateur
PUT  /api/auth/profile     - Mise à jour profil
```

### Dossiers
```
GET    /api/folders                                  - Liste des dossiers
POST   /api/folders                                  - Créer un dossier
GET    /api/folders/:id                              - Détails d'un dossier
PUT    /api/folders/:id                              - Modifier un dossier
DELETE /api/folders/:id                              - Supprimer un dossier
POST   /api/folders/:id/attachments                  - Ajouter une pièce jointe
DELETE /api/folders/attachments/:attachmentId        - Supprimer une pièce jointe
POST   /api/folders/:id/timeline                     - Ajouter un événement
DELETE /api/folders/timeline/:entryId                - Supprimer un événement
POST   /api/folders/:id/deadlines                    - Ajouter une échéance
PATCH  /api/folders/deadlines/:deadlineId/status     - Mettre à jour une échéance
DELETE /api/folders/deadlines/:deadlineId            - Supprimer une échéance
POST   /api/folders/:id/documents                    - Générer un document
PUT    /api/folders/documents/:documentId            - Modifier un document
DELETE /api/folders/documents/:documentId            - Supprimer un document
```

### Conversations (Chat)
```
GET    /api/chat/conversations                            - Liste des conversations
POST   /api/chat/conversations                            - Créer une conversation
GET    /api/chat/conversations/:id                        - Détails d'une conversation
POST   /api/chat/conversations/:id/messages               - Envoyer un message
PATCH  /api/chat/conversations/:id/move                   - Déplacer une conversation
DELETE /api/chat/conversations/:id                        - Supprimer une conversation
```

---

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev                # Démarrer le serveur de dev
bun run dev                # Avec Bun

# Build
npm run build              # Build pour production
bun run build              # Avec Bun

# Preview
npm run preview            # Preview du build
bun run preview            # Avec Bun

# Linting
npm run lint               # Vérifier le code
```

---

## ✅ Checklist d'Intégration

- ✅ Supabase supprimé
- ✅ API Client créé (`src/lib/api.ts`)
- ✅ Store initialisé depuis le backend
- ✅ Actions conversations connectées au backend
- ✅ Actions dossiers connectées au backend
- ✅ Actions avancées (attachments, timeline, deadlines, documents) connectées
- ✅ Authentification JWT
- ✅ Gestion des erreurs 401 (auto-logout)
- ✅ Conversion des dates backend ↔ frontend
- ✅ Types TypeScript synchronisés
- ✅ UI/UX conservé à 100%

---

## 🆘 Support

**Si le backend ne répond pas :**
1. Vérifiez que le backend est démarré : `cd backend && docker-compose up -d && npm run dev`
2. Vérifiez l'URL dans `.env` : `VITE_API_URL=http://localhost:8787/api`
3. Vérifiez les logs backend : `docker-compose logs -f`

**Si l'authentification échoue :**
1. Supprimez le token local : `localStorage.clear()` dans la console
2. Vérifiez que le backend a bien le JWT_SECRET configuré
3. Créez un nouveau compte pour tester

**Si les données ne chargent pas :**
1. Ouvrez la console développeur (F12)
2. Vérifiez les requêtes dans l'onglet Network
3. Vérifiez les erreurs dans l'onglet Console

---

## 📝 Licence

MIT
