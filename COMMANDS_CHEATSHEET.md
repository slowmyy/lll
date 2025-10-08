# ⚡ Genly App - Commands Cheatsheet

Guide de référence rapide pour tous les scripts disponibles.

---

## 🚀 Démarrage

```bash
# Démarre en mode tunnel (recommandé, auto-check)
npm start

# Démarre avec nettoyage des caches
npm run start:clean

# Mode LAN (même réseau WiFi requis, plus rapide)
npm run start:lan

# Mode localhost (preview Bolt uniquement)
npm run start:local

# Force le mode tunnel
npm run tunnel
```

---

## 🔍 Diagnostic

```bash
# Vérifie l'environnement complet (Node, npm, config)
npm run check:env

# Vérifie les services (Metro, Supabase, APIs)
npm run check:health

# Vérifie si le port 8081 est libre
npm run check:port

# Libère le port 8081 (interactif)
npm run free:port

# Affiche les versions (Node, npm, Expo)
npm run check:versions

# Diagnostic Expo complet
npm run doctor
```

---

## 🧹 Nettoyage

```bash
# Vide les caches Metro/Expo uniquement
npm run clean:cache

# Réinstalle complètement node_modules
npm run clean

# Séquence de nettoyage complète
npm run clean && npm run start:clean
```

---

## 🛠️ Build & Lint

```bash
# Export web production
npm run build:web

# Lint du code
npm run lint
```

---

## 📊 Workflow Recommandés

### Premier Lancement

```bash
# 1. Vérifier l'environnement
npm run check:env

# 2. Si tout est OK, démarrer
npm start
```

### En Cas de Problème

```bash
# 1. Nettoyer les caches
npm run clean:cache

# 2. Vérifier le port
npm run check:port

# 3. Si port occupé, le libérer
npm run free:port

# 4. Redémarrer proprement
npm run start:clean
```

### Diagnostic Complet

```bash
# 1. Environnement
npm run check:env

# 2. Services
npm run check:health

# 3. Versions
npm run check:versions

# 4. Expo Doctor
npm run doctor
```

### Reset Total

```bash
# 1. Nettoyage complet
npm run clean

# 2. Vérification
npm run check:env

# 3. Démarrage propre
npm run start:clean
```

---

## 🎯 Troubleshooting Rapide

| Problème | Commande |
|----------|----------|
| Écran blanc Bolt | `npm run start:clean` |
| Timeout Expo Go | `npm run free:port && npm start` |
| Erreurs npm install | `npm run clean` |
| Metro ne démarre pas | `npm run check:port` puis `npm run free:port` |
| Preview ne charge pas | F12 → Console (browser) |
| APIs ne répondent pas | `npm run check:health` |
| Versions incorrectes | `npm run check:versions` |

---

## 📱 Testing sur Device

### iOS (Expo Go)

```bash
# 1. Mettre à jour Expo Go (App Store)
# 2. Même réseau WiFi que le PC
# 3. Démarrer le serveur
npm start

# 4. Scanner le QR code avec l'appareil photo
# 5. Attendre "Bundling complete"
```

### Android (Expo Go)

```bash
# 1. Installer Expo Go (Play Store)
# 2. Même réseau WiFi que le PC
# 3. Démarrer le serveur
npm start

# 4. Scanner le QR code avec Expo Go
# 5. Attendre "Bundling complete"
```

### Si Scan QR Code Échoue

```bash
# Forcer le mode tunnel (fonctionne sur tous réseaux)
npm run tunnel

# Ou libérer le port et réessayer
npm run free:port
npm start
```

---

## 🆘 Accès Rapide Documentation

| Fichier | Description |
|---------|-------------|
| `QUICK_START.md` | Guide de démarrage rapide |
| `TROUBLESHOOTING.md` | Dépannage détaillé |
| `CHANGELOG_FIXES.md` | Historique des corrections |
| `COMMANDS_CHEATSHEET.md` | Ce fichier |
| `.env.example` | Template configuration |

---

## 💡 Tips & Astuces

### Mode Développement Efficace

```bash
# Terminal 1: Serveur avec logs
npm start

# Terminal 2: Watch health (optionnel)
watch -n 5 npm run check:health
```

### Debug Console

```bash
# Ouvrir DevTools (Browser)
# Chercher dans la console:
# - "Framework ready signal sent" (OK)
# - "window.frameworkReady not available" (Problème)
```

### Vérification Pré-Commit

```bash
npm run lint && npm run check:env
```

### Performance Check

```bash
# Avant de démarrer
npm run check:port      # Port libre?
npm run check:versions  # Versions OK?
npm run check:env      # Config OK?
```

---

## 🔧 Variables d'Environnement

```bash
# Vérifier les variables
cat .env

# Utiliser le template
cat .env.example

# Copier template vers .env (si besoin)
cp .env.example .env
```

---

## 📈 Workflow CI/CD (Futur)

```bash
# Check complet avant deploy
npm run check:env && \
npm run lint && \
npm run build:web
```

---

## ⚙️ Scripts Avancés

### Check Port + Auto Free

```bash
npm run check:port && npm run free:port
```

### Full Reset + Check

```bash
npm run clean && npm run check:env && npm start
```

### Health Monitor

```bash
while true; do npm run check:health; sleep 30; done
```

---

## 🎨 Structure Projet

```
genly-app/
├── app/              # Routes Expo Router
├── components/       # Composants UI
├── hooks/            # Hooks React
├── services/         # Services (API, auth)
├── global.css        # Styles Tailwind
├── metro.config.js   # Config Metro
├── package.json      # Scripts & deps
└── *.md              # Documentation
```

---

## 🌐 Ressources Externes

- [Expo Docs](https://docs.expo.dev)
- [NativeWind](https://www.nativewind.dev/v4)
- [React Native](https://reactnative.dev)
- [Supabase](https://supabase.com/docs)

---

**Note**: Ce cheatsheet est conçu pour un accès rapide. Pour des procédures détaillées, consultez `TROUBLESHOOTING.md` ou `QUICK_START.md`.

**Mise à jour**: 8 octobre 2025 - Version 1.1.0
