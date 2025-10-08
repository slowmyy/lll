# 👋 START HERE - Bienvenue sur Genly App!

**Version**: 1.1.0 | **Statut**: ✅ Production Ready

---

## 🎯 Vous êtes ici car...

Vous voulez résoudre les problèmes de **preview Bolt écran blanc** et **timeout Expo Go**?

**Bonne nouvelle**: Toutes les corrections sont déjà appliquées! ✅

---

## ⚡ Quick Start (3 étapes)

### 1️⃣ Installer les Dépendances (2 min)

```bash
npm run clean
```

**Ce que ça fait**: Réinstalle tout avec les bonnes versions

**Attendez**: "All dependencies installed successfully" ✅

---

### 2️⃣ Vérifier l'Environnement (30 sec)

```bash
npm run check:env
```

**Ce que vous devez voir**:
```
✅ Node.js Version: v20.19.4
✅ npm Version: 10.x.x
✅ Metro Config: NativeWind configuré
✅ global.css: Fichier présent
✅ Port 8081: Port libre
📊 Résumé: 8 OK | 0 Avertissements | 0 Erreurs
✅ Votre environnement est correctement configuré!
```

**Si vous voyez des ❌**: Consultez `TROUBLESHOOTING.md`

---

### 3️⃣ Démarrer l'App (30 sec)

```bash
npm start
```

**Ce qui se passe**:
1. Check automatique de l'environnement
2. Metro bundler démarre sur port 8081
3. QR code s'affiche

**Pour tester**:
- **Web**: La preview Bolt devrait s'afficher ✅
- **Mobile**: Scanner le QR code avec Expo Go

---

## 🎊 C'est Tout!

Si ces 3 étapes fonctionnent, vous êtes prêt! 🚀

---

## 🆘 En Cas de Problème

### Écran Blanc dans Bolt Preview?

```bash
# 1. Ouvrir DevTools (F12)
# 2. Aller dans Console
# 3. Chercher "Framework ready signal sent"

# Si pas de signal:
npm run start:clean
```

### Timeout sur Expo Go (iPhone)?

```bash
# 1. Vérifier que vous êtes sur le MÊME réseau WiFi
# 2. Libérer le port si occupé:
npm run free:port

# 3. Redémarrer:
npm start
```

### Port 8081 Occupé?

```bash
npm run free:port
# Répondre "y" pour tuer le processus
```

### Erreurs npm install?

```bash
npm run clean
# Attend 2-3 minutes pour la réinstallation complète
```

---

## 📚 Documentation Complète

| Fichier | Quand le Lire |
|---------|---------------|
| **`START_HERE.md`** | **👈 Vous êtes ici** |
| `README.md` | Vue d'ensemble du projet |
| `QUICK_START.md` | Guide d'installation détaillé |
| `TROUBLESHOOTING.md` | Solutions à tous les problèmes |
| `COMMANDS_CHEATSHEET.md` | Référence des commandes |
| `FINAL_SUMMARY.md` | Résumé des corrections appliquées |

**Recommandation**: Commencez par ce fichier, puis consultez les autres si besoin.

---

## 🔧 Outils de Diagnostic Disponibles

```bash
npm run check:env      # Vérifie environnement (Node, config, port)
npm run check:health   # Vérifie services (Metro, APIs)
npm run check:port     # Vérifie si port 8081 est libre
npm run free:port      # Libère le port 8081
npm run doctor         # Diagnostic Expo complet
```

**Astuce**: Lancez `npm run check:env` avant chaque session de dev!

---

## 🎨 Scripts Principaux

```bash
# Démarrage
npm start              # Mode tunnel (recommandé)
npm run start:clean    # Démarre avec nettoyage des caches
npm run start:lan      # Mode LAN (même WiFi, plus rapide)

# Nettoyage
npm run clean          # Réinstalle tout
npm run clean:cache    # Vide uniquement les caches

# Build
npm run build:web      # Build pour production web
```

---

## 🚨 Checklist "Ça Marche Pas"

Avant de chercher de l'aide, vérifiez:

- [ ] J'ai lancé `npm run clean` (réinstallation)
- [ ] J'ai lancé `npm run check:env` (tout ✅?)
- [ ] Le port 8081 est libre (`npm run check:port`)
- [ ] Je suis sur Node.js >= 20.19.4 (`node -v`)
- [ ] J'ai ouvert F12 DevTools (erreurs dans Console?)
- [ ] Mon téléphone et PC sont sur le MÊME WiFi
- [ ] J'ai mis à jour Expo Go (dernière version)

**Si tout est ✅ et ça marche toujours pas**: Consultez `TROUBLESHOOTING.md`

---

## 📱 Tester sur Smartphone

### iOS (iPhone/iPad)

1. **Installer Expo Go** (App Store)
2. **Mettre à jour** Expo Go (version SDK 54+ requise)
3. **Même réseau WiFi** que votre ordinateur
4. **Scanner QR code** avec l'appareil photo (pas Expo Go!)
5. **Attendre** "Bundling complete"

### Android

1. **Installer Expo Go** (Play Store)
2. **Même réseau WiFi** que votre ordinateur
3. **Ouvrir Expo Go** → Scanner QR code
4. **Attendre** "Bundling complete"

**⚠️ Important**: Si timeout, essayez:
```bash
npm run free:port
npm run tunnel
```

---

## ✅ Ce Qui a Été Corrigé

D'après votre recherche Perplexity, voici ce qui a été résolu:

| Problème | Solution Appliquée | Statut |
|----------|-------------------|---------|
| Écran blanc Bolt | Configuration NativeWind complète | ✅ |
| Timeout Expo Go | Gestion port 8081 + tunnel | ✅ |
| Erreurs npm install | @types/react 19.x + .npmrc | ✅ |
| Signal frameworkReady | Hook optimisé avec retry | ✅ |
| Node.js version | .nvmrc + engines dans package.json | ✅ |
| Metro cache | Scripts de nettoyage | ✅ |

**Tous les points de votre recherche ont été adressés!** 🎉

---

## 💡 Tips Pro

### Workflow Quotidien Optimal

```bash
# Matin (démarrage du jour)
npm run check:env && npm start

# Après un git pull
npm run clean:cache && npm start

# Si ça plante
npm run free:port && npm run start:clean
```

### Vérifier Rapidement

```bash
# Versions OK?
npm run check:versions

# Services OK?
npm run check:health

# Tout OK?
npm run check:env && npm run check:health
```

---

## 🎓 Prochaines Étapes

### Vous avez réussi à démarrer?

1. **Explorez l'app**: Testez la génération d'images/vidéos
2. **Lisez le README**: Découvrez toutes les fonctionnalités
3. **Consultez les docs**: Familiarisez-vous avec les services (Runware, FAL.ai)

### Vous développez?

1. **Étudiez la structure**: `app/`, `components/`, `services/`
2. **Configurez votre IDE**: TypeScript strict activé
3. **Utilisez les hooks**: `useGeneration`, `usePixVerse`, etc.

---

## 🌟 Résumé

Votre projet Genly App est maintenant configuré avec:

✅ Node.js 20.19.4+ forcé
✅ Dépendances compatibles
✅ NativeWind v4 configuré
✅ Metro bundler optimisé
✅ Scripts de diagnostic automatiques
✅ Documentation complète
✅ Hook frameworkReady robuste
✅ Gestion port 8081 automatique

**Vous êtes prêt à développer!** 🚀

---

## 🎯 Action Immédiate

**Maintenant, lancez**:

```bash
npm run clean
```

Puis attendez la fin de l'installation.

Une fois terminé:

```bash
npm run check:env
npm start
```

**Si tout est ✅**: Bienvenue dans votre environnement de dev! 🎊

**Si vous voyez des ❌**: Ouvrez `TROUBLESHOOTING.md` page 1

---

## 🆘 Besoin d'Aide?

1. **Consultez d'abord**: `TROUBLESHOOTING.md` (solutions détaillées)
2. **Vérifiez les logs**: F12 DevTools → Console (navigateur)
3. **Lancez les diagnostics**: `npm run doctor`
4. **Lisez le CHANGELOG**: `CHANGELOG_FIXES.md` (toutes les corrections)

---

**Version**: 1.1.0 | **Dernière mise à jour**: 8 octobre 2025

**Made with ❤️ by your dev team**

---

🚀 **Ready? Lancez `npm run clean` maintenant!**
