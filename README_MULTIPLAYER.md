# Mission 2035 - Mode Multijoueur

## 🎮 Fonctionnalités Multijoueur

Ce système transforme le jeu Mission 2035 en une expérience **entièrement multijoueur** avec synchronisation en temps réel.

### ✨ Nouvelles Capacités

#### 1. **Synchronisation en Temps Réel**
- Tous les joueurs voient la progression de chaque équipe en direct
- Mise à jour instantanée des défis complétés
- Tableau de bord live avec le statut de toutes les équipes

#### 2. **Tableau de Bord Admin Amélioré**
- Vue d'ensemble des équipes en ligne
- Indicateur du nombre de joueurs par équipe
- Statut de progression en temps réel
- Contrôle centralisé des événements

#### 3. **Leaderboard Live**
- Classement dynamique basé sur la progression
- Affichage des équipes actives/en attente
- Synchronisation instantanée des changements

#### 4. **Communication en Temps Réel**
- WebSocket pour une latence minimale
- REST API en fallback
- Gestion automatique des déconnexions

## 🚀 Installation

### Prérequis
- Node.js >= 14.0.0
- npm ou yarn

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/camushugo17/Mission2035.git
cd Mission2035

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur
npm start

# En développement avec auto-reload:
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## 🏗️ Architecture

### Backend (server.js)

```
Express + WebSocket
├── REST API
│   ├── GET  /api/game-state          → État global du jeu
│   ├── POST /api/team-join           → Inscription équipe
│   ├── POST /api/team-update         → Mise à jour progression
│   ├── POST /api/admin/start         → Démarrer la mission
│   ├── POST /api/admin/event         → Diffuser un événement
│   ├── POST /api/admin/zones         → Mettre à jour les zones
│   └── POST /api/admin/reset         → Réinitialiser le jeu
└── WebSocket (ws://)
    ├── team-joined                   → Une équipe se joint
    ├── team-updated                  → Progression d'équipe mise à jour
    ├── team-online-update            → Statut de connexion
    ├── game-started                  → Mission lancée
    ├── event-broadcast               → Événement diffusé
    ├── zones-updated                 → Zones repositionnées
    └── game-reset                    → Jeu réinitialisé
```

### Frontend (index.html)

**Nouveaux éléments ajoutés:**
- Connexion WebSocket automatique
- Leaderboard en temps réel
- Indicateurs de statut en ligne
- Synchronisation bidirectionnelle

## 📊 Flux de Données

### Inscription d'une Équipe

```
Joueur A: Rejoint → POST /api/team-join
                 ↓
Serveur: Crée équipe, broadcast
                 ↓
Tous les joueurs: Reçoivent 'team-joined'
                 ↓
Tableau admin: Mise à jour instantanée
```

### Complétion d'un Défi

```
Équipe: Valide code → storageSet + WS message
                   ↓
Serveur: WS reçoit, met à jour état
                   ↓
Broadcast: 'team-updated' à tous
                   ↓
Tous les écrans: Affichent progression synchro
```

## 🎮 Utilisation

### Pour les Joueurs

1. **Rejoindre**: Même interface, mais connecté au serveur
2. **Jouer**: Progression synchro avec tous les autres
3. **Voir les autres**: Leaderboard live visible à tout moment

### Pour l'Admin

1. **Démarrer la mission**: Tous les joueurs reçoivent le signal
2. **Broadcaster un événement**: Message instantané à toutes les équipes
3. **Positionner les zones**: Mis à jour en temps réel pour tous
4. **Réinitialiser**: Reset complet du serveur

## 🔧 Configuration

### Port du Serveur

```bash
# Défaut: 3000
PORT=8080 npm start
```

### Timeout des Équipes

Dans `server.js`, modifier `timeout` (ligne ~180):
```javascript
const timeout = 30000; // 30 secondes
```

## 📡 Messages WebSocket

### Client → Serveur

```json
// Rejoindre une équipe
{ "type": "join-room", "slug": "les-renards" }

// Mettre à jour la progression
{ "type": "team-progress", "pathIndex": 3, "completed": [1,2,3], "inventory": [...] }

// Garder la connexion active
{ "type": "heartbeat" }
```

### Serveur → Client (Broadcast)

```json
// Une équipe s'est jointe
{ "type": "team-joined", "team": {...} }

// Progression d'équipe mise à jour
{ "type": "team-updated", "team": {...} }

// Statut en ligne
{ "type": "team-online-update", "team": {...} }

// Mission lancée
{ "type": "game-started", "data": {...} }

// Événement diffusé
{ "type": "event-broadcast", "data": {...} }

// Zones repositionnées
{ "type": "zones-updated", "data": [...] }

// Jeu réinitialisé
{ "type": "game-reset" }
```

## 🐛 Dépannage

### "Cannot find module 'ws'"
```bash
npm install ws express cors
```

### Connexion refusée
- Vérifier que le serveur est démarré: `npm start`
- Vérifier le port: défaut 3000
- Vérifier les pare-feu/proxies

### WebSocket se ferme
- Vérifier la connexion réseau
- Voir les logs du serveur
- Vérifier le `heartbeat` toutes les 5 secondes

## 📈 Scalabilité

Pour un déploiement en production:

1. **Redis**: Remplacer Map par Redis pour la persistance
2. **Load Balancer**: Ajouter Redis pour les messages entre serveurs
3. **Database**: Persister les données de jeu
4. **Reverse Proxy**: Nginx/HAProxy pour WebSocket

## 📄 Fichiers

- `server.js` - Backend Express + WebSocket
- `package.json` - Dépendances Node.js
- `index.html` - Frontend (à mettre à jour pour intégration complète)
- `README_MULTIPLAYER.md` - Cette documentation

## 🤝 Contribution

Les améliorations bienvenues:
- [ ] Persistance en base de données
- [ ] Authentification des équipes
- [ ] Historique des événements
- [ ] Statistiques détaillées
- [ ] Mode hors-ligne

## 📝 Licence

MIT © Hugo Camus
