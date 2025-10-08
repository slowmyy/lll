# 🚀 Quick Start - Genly App

Guide de démarrage rapide pour développer et tester l'application Genly.

## 📋 Prérequis

- **Node.js** >= 20.19.4 ([télécharger](https://nodejs.org/))
- **npm** >= 10.0.0 (inclus avec Node.js)
- **Expo Go** sur votre smartphone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## 🔧 Installation

### 1. Vérifier Node.js

```bash
node -v  # Doit afficher v20.19.4 ou supérieur
```

Si vous avez une version plus ancienne, installez Node.js 20.19.4+ ou utilisez nvm:

```bash
nvm install 20.19.4
nvm use 20.19.4
```

### 2. Installer les dépendances

```bash
npm install
```

Si vous rencontrez des erreurs, utilisez:

```bash
npm run clean
```

### 3. Vérifier l'environnement

```bash
npm run check:env
```

Ce script vérifie automatiquement:
- Version de Node.js
- Configuration npm
- Fichiers de configuration
- Port 8081 disponible
- Dépendances installées

## 🎯 Démarrage

### Mode Tunnel (Recommandé pour Expo Go)

```bash
npm start
```

ou

```bash
npm run tunnel
```

Ce mode fonctionne sur **tous les réseaux** (WiFi, 4G, différents sous-réseaux).

### Mode LAN (Plus rapide, même réseau WiFi requis)

```bash
npm run start:lan
```

⚠️ Votre ordinateur et votre smartphone doivent être sur le **même réseau WiFi**.

### Mode Local (Développement web uniquement)

```bash
npm run start:local
```

Pour la preview Bolt web uniquement.

## 📱 Tester sur Smartphone

### iOS (iPhone/iPad)

1. Installez **Expo Go** depuis l'App Store
2. Assurez-vous d'avoir la dernière version (SDK 54+)
3. Lancez `npm start`
4. Scannez le QR code avec l'appareil photo
5. L'app s'ouvre dans Expo Go

⚠️ **Important iOS**: Expo Go iOS ne supporte que la dernière version SDK (54). Si vous voyez une erreur de compatibilité, mettez à jour Expo Go.

### Android

1. Installez **Expo Go** depuis le Play Store
2. Lancez `npm start`
3. Scannez le QR code avec l'app Expo Go
4. L'app s'ouvre dans Expo Go

## 🌐 Preview Web dans Bolt

1. Assurez-vous que le port 8081 est libre:
   ```bash
   npm run check:port
   ```

2. Lancez le serveur:
   ```bash
   npm start
   ```

3. La preview Bolt devrait afficher l'application

Si vous voyez un écran blanc:
- Ouvrez les DevTools (F12)
- Vérifiez la console pour les erreurs
- Désactivez les adblockers
- Consultez `TROUBLESHOOTING.md`

## 🛠️ Scripts Utiles

| Commande | Description |
|----------|-------------|
| `npm start` | Démarre en mode tunnel |
| `npm run start:clean` | Nettoie les caches et démarre |
| `npm run start:lan` | Mode LAN (même WiFi) |
| `npm run start:local` | Mode localhost uniquement |
| `npm run check:env` | Vérifie l'environnement |
| `npm run check:port` | Vérifie le port 8081 |
| `npm run doctor` | Diagnostic Expo complet |
| `npm run clean` | Réinstalle tout |
| `npm run clean:cache` | Vide les caches Metro |

## 🐛 Problèmes Courants

### Écran blanc dans Bolt

```bash
# 1. Vérifier les versions
npm run check:env

# 2. Nettoyer et redémarrer
npm run start:clean

# 3. Vérifier DevTools (F12) pour les erreurs
```

### Timeout Expo Go

```bash
# 1. Vérifier le réseau
# Assurez-vous d'être sur le même WiFi

# 2. Mode tunnel en fallback
npm run tunnel

# 3. Libérer le port 8081
npm run check:port
# Si occupé: kill -9 [PID]
```

### Erreurs de dépendances

```bash
npm run clean
```

## 📚 Documentation Complète

- **Dépannage détaillé**: Consultez `TROUBLESHOOTING.md`
- **Documentation Expo**: [docs.expo.dev](https://docs.expo.dev)
- **NativeWind v4**: [nativewind.dev/v4](https://www.nativewind.dev/v4/getting-started/expo-router)

## 🎨 Structure du Projet

```
genly-app/
├── app/                    # Routes Expo Router
│   ├── _layout.tsx        # Layout racine
│   ├── (tabs)/            # Navigation par tabs
│   └── auth/              # Écrans d'authentification
├── components/            # Composants réutilisables
├── hooks/                 # Hooks personnalisés
├── services/              # Services (API, auth, storage)
├── global.css             # Styles Tailwind CSS
├── metro.config.js        # Configuration Metro + NativeWind
├── babel.config.js        # Configuration Babel
├── app.json               # Configuration Expo
└── package.json           # Dépendances et scripts
```

## ✅ Checklist Premier Lancement

- [ ] Node.js >= 20.19.4 installé
- [ ] `npm install` réussi
- [ ] `npm run check:env` OK
- [ ] Port 8081 libre
- [ ] Expo Go installé sur smartphone
- [ ] Même réseau WiFi (pour mode LAN)
- [ ] `npm start` lance le serveur
- [ ] QR code visible et scannable
- [ ] App charge sur Expo Go

---

**Prêt à développer!** 🎉

Si vous rencontrez des problèmes, consultez `TROUBLESHOOTING.md` ou lancez:

```bash
npm run doctor
```
