# Fruytier Group - Réservation RDV Salon 2026

Application de prise de rendez-vous pour le stand Fruytier Group (XXL-D13) au **Carrefour International du Bois 2026** - Nantes, 2-4 juin 2026.

## Fonctionnalités

- 17 créneaux de 45 min (+ 45 min buffer) sur 3 jours
- Blocage automatique des créneaux réservés (temps réel)
- Formulaire simple et rapide (<30 sec)
- Mobile-friendly
- Notifications par email

## Setup Firebase (5 minutes)

### 1. Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Se connecter avec le compte Google de test : `nico.raes5376@gmail.com`
3. Cliquer **Ajouter un projet** → nommer `fruytier-booking`
4. Désactiver Google Analytics (pas nécessaire) → **Créer le projet**

### 2. Activer Realtime Database

1. Dans le menu gauche → **Build** → **Realtime Database**
2. Cliquer **Créer une base de données**
3. Choisir la région : **europe-west1 (Belgique)**
4. Choisir **Mode test** pour commencer
5. Cliquer **Activer**

### 3. Configurer les règles de sécurité

Dans l'onglet **Règles** de la Realtime Database, remplacer par :

```json
{
  "rules": {
    "bookings": {
      "$slotId": {
        ".read": true,
        ".write": "!data.exists()"
      }
    }
  }
}
```

> Cela permet à tout le monde de lire les créneaux, mais un créneau ne peut être écrit qu'une seule fois (pas de double booking).

### 4. Obtenir la configuration Firebase

1. Aller dans **Paramètres du projet** (roue crantée en haut à gauche)
2. Descendre jusqu'à **Vos applications** → cliquer sur l'icône **Web** (`</>`)
3. Nommer l'app `fruytier-booking` → **Enregistrer l'application**
4. Copier le bloc `firebaseConfig`

### 5. Mettre à jour le code

Dans `index.html`, remplacer le bloc `firebaseConfig` par vos vraies valeurs :

```javascript
const firebaseConfig = {
    apiKey: "AIza...",
    authDomain: "fruytier-booking.firebaseapp.com",
    databaseURL: "https://fruytier-booking-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fruytier-booking",
    storageBucket: "fruytier-booking.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

## Setup notifications email (vers florinedubois@outlook.be)

### Option A : Firebase Cloud Functions (recommandé)

1. Passer au plan **Blaze** (gratuit jusqu'à un gros volume)
2. Installer Firebase CLI : `npm install -g firebase-tools`
3. Initialiser : `firebase init functions`
4. Utiliser la Cloud Function fournie dans `functions/index.js`

### Option B : Google Apps Script (100% gratuit)

1. Créer un Google Sheet lié au compte `nico.raes5376@gmail.com`
2. Extensions → Apps Script
3. Ajouter un trigger qui surveille la base Firebase et envoie un email

## Déploiement sur GitHub Pages

1. Créer un repo GitHub (ex: `fruytier-booking`)
2. Pousser le code
3. Settings → Pages → Source : `main` branch, dossier `/ (root)`
4. Le site sera accessible à : `https://votre-user.github.io/fruytier-booking/`

## Synchronisation Google Calendar

Pour ajouter automatiquement les RDV au Google Calendar de `nico.raes5376@gmail.com`, utiliser une Cloud Function Firebase qui appelle l'API Google Calendar à chaque nouvelle réservation.

## Structure des créneaux

| Jour | Créneaux | Horaires |
|------|----------|----------|
| Mardi 2 juin | 5 | 09:00-09:45, 10:30-11:15, 12:00-12:45, 13:30-14:15, 15:00-15:45 |
| Mercredi 3 juin | 7 | 09:00-09:45, 10:30-11:15, 12:00-12:45, 13:30-14:15, 15:00-15:45, 16:30-17:15, 18:00-18:45 |
| Jeudi 4 juin | 5 | 09:00-09:45, 10:30-11:15, 12:00-12:45, 13:30-14:15, 15:00-15:45 |

**Total : 17 créneaux**
