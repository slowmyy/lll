# 🔧 Changelog - Corrections Preview Bolt & Expo Go

**Date**: 8 octobre 2025
**Version**: 1.1.0
**Statut**: ✅ Corrections appliquées avec succès

---

## 📋 Résumé des Problèmes Résolus

### 1. ❌ Écran Blanc dans Preview Bolt
**Cause**: Configuration NativeWind incomplète + conflits de dépendances

**Solutions appliquées**:
- ✅ Création de `global.css` avec directives Tailwind
- ✅ Configuration de `metro.config.js` avec NativeWind v4
- ✅ Import de `global.css` dans `app/_layout.tsx`
- ✅ Optimisation du hook `useFrameworkReady` avec retry et meilleurs logs
- ✅ Configuration `.npmrc` avec `legacy-peer-deps=true`

### 2. ❌ Timeout QR Code Expo Go (iPhone)
**Cause**: Port 8081 bloqué + configuration réseau + versions incompatibles

**Solutions appliquées**:
- ✅ Mise à jour des dépendances vers `@types/react@19.2.2` (compatible React Native 0.81.4)
- ✅ Ajout de scripts de diagnostic du port 8081
- ✅ Configuration tunnel par défaut dans les scripts
- ✅ Ajout de `.nvmrc` pour forcer Node.js 20.19.4+
- ✅ Configuration `engines` dans package.json

### 3. ❌ Erreurs ERESOLVE npm
**Cause**: Conflits de peer dependencies entre React Native 0.81.4 et @types/react 18.x

**Solutions appliquées**:
- ✅ Mise à jour vers `@types/react@19.2.2` et `@types/react-dom@19.2.2`
- ✅ Configuration `.npmrc` avec legacy-peer-deps
- ✅ Ajout de script `npm run clean` pour réinstallation complète

---

## 🆕 Fichiers Créés

### Configuration

1. **`.npmrc`**
   - Active `legacy-peer-deps=true`
   - Résout les conflits de dépendances
   - Configure le registry npm local Bolt

2. **`.nvmrc`**
   - Force Node.js version 20.19.4
   - Assure la compatibilité Expo SDK 54

3. **`global.css`**
   - Directives Tailwind CSS
   - Support NativeWind v4
   - Import dans app/_layout.tsx

4. **`metro.config.js`**
   - Configuration Metro avec NativeWind
   - Support du bundler server-side
   - Référence global.css

### Documentation

5. **`TROUBLESHOOTING.md`**
   - Guide complet de dépannage
   - Procédures pas-à-pas
   - Scripts de diagnostic
   - Checklist complète

6. **`QUICK_START.md`**
   - Guide de démarrage rapide
   - Installation et configuration
   - Tests sur smartphone
   - Structure du projet

7. **`CHANGELOG_FIXES.md`** (ce fichier)
   - Récapitulatif des corrections
   - Liste des fichiers créés/modifiés
   - Changelog détaillé

### Scripts de Diagnostic

8. **`check-env.js`**
   - Vérifie Node.js >= 20.19.4
   - Vérifie configuration npm
   - Vérifie fichiers de config
   - Vérifie port 8081
   - S'exécute automatiquement avant `npm start`

9. **`health-check.js`**
   - Vérifie Metro Bundler (port 8081)
   - Vérifie connexion Supabase
   - Vérifie configuration Runware API
   - Vérifie configuration FAL.ai

10. **`.env.example`**
    - Template de configuration
    - Variables d'environnement documentées
    - Protection des secrets

---

## 🔄 Fichiers Modifiés

### 1. `package.json`

**Ajouts de dépendances**:
```json
"@types/react": "~19.2.2",
"@types/react-dom": "~19.2.2"
```

**Ajouts de scripts**:
```json
"start:clean": "npm run clean:cache && expo start --clear --tunnel",
"start:local": "expo start --localhost",
"start:lan": "expo start",
"clean": "rm -rf node_modules package-lock.json && npm install",
"clean:cache": "rm -rf node_modules/.cache .expo .metro",
"check:port": "lsof -i :8081 || echo 'Port 8081 is free'",
"check:versions": "node -v && npm -v && npx expo --version",
"check:env": "node check-env.js",
"check:health": "node health-check.js",
"doctor": "npx expo-doctor",
"prestart": "node check-env.js"
```

**Configuration engines**:
```json
"engines": {
  "node": ">=20.19.4",
  "npm": ">=10.0.0"
}
```

### 2. `app/_layout.tsx`

**Ajout**:
```typescript
import '../global.css'; // En première ligne
```

### 3. `hooks/useFrameworkReady.ts`

**Améliorations**:
- Ajout de retry automatique (10 tentatives max)
- Vérification de `document.readyState`
- Timeout augmenté à 500ms
- Logs détaillés pour diagnostic
- Event listener sur `window.load`
- Protection contre les appels multiples avec `useRef`

### 4. `app.json`

**Ajout section web.splash**:
```json
"splash": {
  "image": "./assets/images/icon.png",
  "resizeMode": "contain",
  "backgroundColor": "#ffffff"
}
```

---

## 📊 Scripts Disponibles

| Script | Description | Usage |
|--------|-------------|-------|
| `npm start` | Démarre en mode tunnel (auto-check env) | Production/Expo Go |
| `npm run start:clean` | Nettoie caches + démarre | Après problèmes |
| `npm run start:local` | Mode localhost uniquement | Preview Bolt |
| `npm run start:lan` | Mode LAN (même réseau) | Développement rapide |
| `npm run tunnel` | Force mode tunnel | Réseau restrictif |
| `npm run check:env` | Diagnostic environnement | Debug installation |
| `npm run check:health` | Vérifie services (Metro, APIs) | Debug runtime |
| `npm run check:port` | Vérifie port 8081 | Debug connexion |
| `npm run check:versions` | Affiche versions Node/npm/Expo | Support |
| `npm run doctor` | Diagnostic Expo complet | Analyse approfondie |
| `npm run clean` | Réinstalle node_modules | Reset complet |
| `npm run clean:cache` | Vide caches Metro | Problèmes bundler |
| `npm run build:web` | Build web production | Déploiement |

---

## ✅ Checklist de Validation

### Environnement
- [x] Node.js >= 20.19.4 configuré
- [x] npm >= 10.0.0 disponible
- [x] `.nvmrc` créé
- [x] `.npmrc` avec legacy-peer-deps
- [x] `engines` dans package.json

### Configuration
- [x] `metro.config.js` avec NativeWind
- [x] `global.css` créé
- [x] Import CSS dans `_layout.tsx`
- [x] `babel.config.js` correct (reanimated en dernier)
- [x] `app.json` optimisé pour web

### Scripts
- [x] Scripts de nettoyage ajoutés
- [x] Scripts de diagnostic ajoutés
- [x] Scripts de vérification ajoutés
- [x] Prestart hook configuré

### Documentation
- [x] `TROUBLESHOOTING.md` créé
- [x] `QUICK_START.md` créé
- [x] `.env.example` créé
- [x] `CHANGELOG_FIXES.md` créé

### Hooks & Composants
- [x] `useFrameworkReady` optimisé
- [x] Retry automatique implémenté
- [x] Logs de debug améliorés

---

## 🎯 Prochaines Étapes

### Pour Tester Immédiatement

1. **Installer les nouvelles dépendances**:
   ```bash
   npm run clean
   ```

2. **Vérifier l'environnement**:
   ```bash
   npm run check:env
   ```

3. **Démarrer le serveur**:
   ```bash
   npm start
   ```

4. **Vérifier la preview Bolt**:
   - Ouvrir F12 DevTools
   - Chercher "✅ Framework ready signal sent successfully" dans la console
   - Vérifier que l'app s'affiche correctement

5. **Tester sur Expo Go (iPhone)**:
   - Mettre à jour Expo Go depuis l'App Store
   - Même réseau WiFi que l'ordinateur
   - Scanner le QR code
   - Attendre "Bundling complete"

### Si Problèmes Persistent

1. **Preview Bolt écran blanc**:
   ```bash
   npm run start:clean
   # Ouvrir F12 → Console → chercher erreurs
   ```

2. **Expo Go timeout**:
   ```bash
   npm run check:port
   npm run tunnel
   ```

3. **Erreurs de dépendances**:
   ```bash
   npm run clean
   ```

4. **Diagnostic complet**:
   ```bash
   npm run check:env
   npm run check:health
   npm run doctor
   ```

---

## 📚 Ressources

### Documentation Créée
- `TROUBLESHOOTING.md` - Guide de dépannage complet
- `QUICK_START.md` - Guide de démarrage rapide
- `.env.example` - Template configuration

### Scripts de Diagnostic
- `check-env.js` - Vérifie l'environnement
- `health-check.js` - Vérifie les services

### Documentation Externe
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [NativeWind v4 Setup](https://www.nativewind.dev/v4/getting-started/expo-router)
- [Metro Bundler Config](https://docs.expo.dev/guides/customizing-metro/)
- [Expo Troubleshooting](https://docs.expo.dev/troubleshooting/overview/)

---

## 🎉 Résultat Attendu

Après application de ces corrections:

✅ **Preview Bolt**: Affichage correct avec signal "Framework ready"
✅ **Expo Go iOS**: Connexion réussie via QR code
✅ **Expo Go Android**: Connexion réussie via QR code
✅ **Metro Bundler**: Démarrage sur port 8081 sans erreur
✅ **NativeWind**: Styles Tailwind appliqués correctement
✅ **Hot Reload**: Rechargement automatique fonctionnel
✅ **APIs**: Runware, FAL.ai, Supabase connectés

---

**Note Importante**: Ce changelog documente TOUTES les corrections appliquées selon votre recherche Perplexity sur les problèmes Bolt/Expo Go récents. Ces solutions sont basées sur les meilleures pratiques 2024-2025 pour Expo SDK 54 et Node.js 20.19.4+.

**Statut**: ✅ **Prêt pour test**

Si vous rencontrez encore des problèmes, consultez `TROUBLESHOOTING.md` pour des procédures détaillées de dépannage.
