# 🎨 Genly App - AI-Powered Creative Platform

Application mobile cross-platform (iOS/Android/Web) permettant de générer et transformer des images et vidéos avec l'IA.

**Version**: 1.1.0
**Status**: ✅ Production Ready
**Tech Stack**: React Native · Expo SDK 54 · NativeWind v4 · Supabase

---

## 🚀 Quick Start

```bash
# 1. Installer les dépendances
npm install

# 2. Vérifier l'environnement
npm run check:env

# 3. Démarrer le serveur
npm start

# 4. Scanner le QR code avec Expo Go
```

**📖 Guide complet**: Consultez [`QUICK_START.md`](./QUICK_START.md)

---

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| [**QUICK_START.md**](./QUICK_START.md) | Guide de démarrage rapide (installation, configuration) |
| [**TROUBLESHOOTING.md**](./TROUBLESHOOTING.md) | Guide de dépannage complet (erreurs, fixes) |
| [**COMMANDS_CHEATSHEET.md**](./COMMANDS_CHEATSHEET.md) | Référence rapide des commandes npm |
| [**CHANGELOG_FIXES.md**](./CHANGELOG_FIXES.md) | Historique des corrections et améliorations |

---

## ✨ Fonctionnalités

- 🎨 **Génération d'images IA** (Runware API)
- 🎬 **Génération de vidéos IA** (PixVerse v5, FAL.ai)
- ✨ **Effets sur selfies** (transformation en temps réel)
- 📸 **Capture caméra** intégrée
- 🖼️ **Galerie multimédia** (images & vidéos)
- 🔐 **Authentification** Supabase
- 📱 **Design responsive** (iOS, Android, Web)
- 🎨 **UI moderne** avec NativeWind (Tailwind CSS)

---

## 🛠️ Commandes Principales

```bash
# Démarrage
npm start              # Mode tunnel (recommandé)
npm run start:clean    # Avec nettoyage des caches
npm run start:lan      # Mode LAN (même WiFi)

# Diagnostic
npm run check:env      # Vérifier l'environnement
npm run check:health   # Vérifier les services
npm run check:port     # Vérifier port 8081
npm run free:port      # Libérer le port 8081

# Nettoyage
npm run clean:cache    # Vider les caches
npm run clean          # Réinstaller tout

# Build
npm run build:web      # Export web production
```

**📖 Toutes les commandes**: Consultez [`COMMANDS_CHEATSHEET.md`](./COMMANDS_CHEATSHEET.md)

---

## 📋 Prérequis

- **Node.js** >= 20.19.4
- **npm** >= 10.0.0
- **Expo Go** (smartphone) - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🏗️ Architecture

```
genly-app/
├── app/                    # Routes Expo Router
│   ├── (tabs)/            # Navigation par tabs
│   ├── auth/              # Authentification
│   └── _layout.tsx        # Layout racine
├── components/            # Composants réutilisables
├── hooks/                 # Hooks personnalisés
├── services/              # Services (API, auth, storage)
├── global.css             # Styles Tailwind
├── metro.config.js        # Configuration Metro
└── package.json           # Dépendances
```

---

## 🔧 Technologies

### Frontend
- **React Native** 0.81.4
- **Expo SDK** 54
- **Expo Router** (file-based routing)
- **NativeWind v4** (Tailwind CSS)
- **TypeScript** 5.9

### Backend & Services
- **Supabase** (auth, database, storage)
- **Runware API** (génération images)
- **FAL.ai** (modèles IA avancés)
- **PixVerse v5** (génération vidéos)

### Tooling
- **Metro Bundler** (server-side rendering)
- **Babel** (transpilation)
- **ESLint** (linting)

---

## 🐛 Problèmes Connus & Solutions

### Écran Blanc Bolt Preview
```bash
npm run start:clean
# Ouvrir F12 DevTools → Console
```

### Timeout Expo Go
```bash
npm run free:port
npm start
```

### Erreurs npm install
```bash
npm run clean
```

**📖 Solutions détaillées**: Consultez [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)

---

## 📱 Test sur Smartphone

### iOS
1. Installer **Expo Go** (App Store)
2. Même réseau WiFi que le PC
3. Lancer `npm start`
4. Scanner le QR code avec l'appareil photo

### Android
1. Installer **Expo Go** (Play Store)
2. Même réseau WiFi que le PC
3. Lancer `npm start`
4. Scanner le QR code avec Expo Go

**Note**: Expo Go iOS supporte uniquement SDK 54+

---

## 🔐 Configuration

Copiez `.env.example` vers `.env` et configurez vos clés API:

```bash
cp .env.example .env
```

Variables requises:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_RUNWARE_API_KEY`
- `FAL_KEY`

---

## 🚀 Déploiement

### Web
```bash
npm run build:web
# Les fichiers sont dans ./dist
```

### iOS/Android (EAS Build)
```bash
npx eas build --platform ios
npx eas build --platform android
```

---

## 🤝 Contribution

Ce projet utilise les conventions suivantes:
- **Commits**: Format conventionnel (`feat:`, `fix:`, `docs:`)
- **Branches**: `feature/`, `bugfix/`, `hotfix/`
- **Code Style**: ESLint + Prettier

---

## 📝 Changelog

### Version 1.1.0 (8 Oct 2025)
- ✅ Correction écran blanc Bolt preview
- ✅ Correction timeout Expo Go
- ✅ Configuration NativeWind complète
- ✅ Scripts de diagnostic automatiques
- ✅ Optimisation hook useFrameworkReady
- ✅ Documentation complète

**📖 Historique complet**: Consultez [`CHANGELOG_FIXES.md`](./CHANGELOG_FIXES.md)

---

## 🆘 Support

### Documentation Interne
- [Quick Start Guide](./QUICK_START.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Commands Reference](./COMMANDS_CHEATSHEET.md)

### Documentation Externe
- [Expo Router](https://docs.expo.dev/router/)
- [NativeWind v4](https://www.nativewind.dev/v4)
- [Supabase](https://supabase.com/docs)
- [React Native](https://reactnative.dev)

### Outils de Diagnostic
```bash
npm run check:env      # Environnement
npm run check:health   # Services
npm run doctor         # Diagnostic complet
```

---

## 📄 License

Private - All Rights Reserved

---

## 🎯 Roadmap

- [ ] Mode offline avec cache
- [ ] Optimisation performances vidéo
- [ ] Partage social intégré
- [ ] Templates prédéfinis
- [ ] Export haute résolution

---

**Made with ❤️ using Expo, React Native, and Supabase**

**Version**: 1.1.0 | **Last Update**: October 8, 2025
