# Guide de Dépannage - Preview Bolt & Expo Go

Ce guide vous aidera à résoudre les problèmes courants de preview Bolt et de connexion Expo Go.

## 🚨 Problèmes Fréquents

### 1. Écran Blanc dans la Preview Bolt

**Symptômes**: La preview Bolt affiche un écran blanc

**Solutions** (dans l'ordre):

1. **Vérifier la console du navigateur**:
   - Appuyez sur `F12` pour ouvrir les DevTools
   - Consultez l'onglet Console pour les erreurs JavaScript
   - Consultez l'onglet Network pour les requêtes bloquées

2. **Désactiver les extensions de navigateur**:
   - Désactivez les adblockers (cause #1 des écrans blancs)
   - Désactivez les VPN temporairement
   - Testez en mode navigation privée

3. **Vider le cache Metro**:
   ```bash
   npm run start:clean
   ```

4. **Vérifier la version de Node.js**:
   ```bash
   node -v  # Doit être >= 20.19.4
   npm run check:versions
   ```

### 2. Timeout QR Code Expo Go (iPhone)

**Symptômes**: Après scan du QR code, l'app affiche "Timeout" ou ne se connecte pas

**Solutions**:

1. **Vérifier les versions**:
   ```bash
   npm run doctor
   ```

2. **Vérifier le réseau WiFi**:
   - Assurez-vous que le téléphone et l'ordinateur sont sur le MÊME réseau WiFi
   - Désactivez les réseaux invités ou VPN
   - Essayez en mode hotspot si disponible

3. **Libérer le port 8081**:
   ```bash
   npm run check:port
   # Si le port est occupé:
   lsof -i :8081
   kill -9 [PID]
   ```

4. **Forcer le mode tunnel**:
   ```bash
   npm run tunnel
   # ou
   npm start
   ```

5. **Vérifier la compatibilité SDK**:
   - Expo Go iOS supporte uniquement SDK 54+
   - Mettez à jour l'app Expo Go depuis l'App Store
   - Vérifiez que votre projet utilise Expo SDK ~54.0.0

### 3. Erreurs de Dépendances npm

**Symptômes**: `npm install` échoue avec des erreurs ERESOLVE

**Solutions**:

Le fichier `.npmrc` est déjà configuré avec `legacy-peer-deps=true`. Si l'erreur persiste:

```bash
npm run clean
# ou manuellement:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### 4. Metro Bundler ne Démarre Pas

**Symptômes**: Le Metro Bundler crashe ou ne répond pas

**Solutions**:

1. **Nettoyage complet**:
   ```bash
   npm run clean:cache
   npm run start:clean
   ```

2. **Vérifier les conflits de port**:
   ```bash
   npm run check:port
   ```

3. **Redémarrage avec cache vidé**:
   ```bash
   npx expo start --clear --tunnel
   ```

## 🔧 Scripts Utiles

Votre projet dispose de plusieurs scripts de diagnostic:

| Script | Description |
|--------|-------------|
| `npm start` | Démarre en mode tunnel (recommandé) |
| `npm run start:clean` | Nettoyage cache + démarrage |
| `npm run start:local` | Mode localhost uniquement |
| `npm run start:lan` | Mode LAN (même réseau) |
| `npm run check:versions` | Affiche les versions Node/npm/Expo |
| `npm run check:port` | Vérifie si le port 8081 est libre |
| `npm run doctor` | Lance le diagnostic Expo complet |
| `npm run clean` | Réinstalle toutes les dépendances |
| `npm run clean:cache` | Vide uniquement les caches Metro |

## 🎯 Checklist de Diagnostic Rapide

Avant de demander de l'aide, vérifiez:

- [ ] Version Node.js >= 20.19.4 (`node -v`)
- [ ] Port 8081 libre (`npm run check:port`)
- [ ] Même réseau WiFi (PC + mobile)
- [ ] Expo Go à jour sur le téléphone
- [ ] Cache Metro vidé (`npm run clean:cache`)
- [ ] Console navigateur sans erreurs (F12)
- [ ] Adblockers/VPN désactivés
- [ ] `npm install` réussi sans erreurs

## 📱 Spécificités iOS vs Android

### iOS
- Expo Go supporte **uniquement** la dernière version SDK (54)
- Si SDK < 54, utilisez un development build EAS
- Apple impose des restrictions réseau plus strictes

### Android
- Expo Go supporte plusieurs versions SDK
- Moins de restrictions réseau
- Versions anciennes disponibles sur [expo.dev/go](https://expo.dev/go)

## 🆘 Dernier Recours

Si rien ne fonctionne après tous les essais:

```bash
# Réinstallation complète du projet
npm run clean
npm run check:versions
npm run start:clean
```

Si le problème persiste:
1. Vérifiez les logs détaillés dans la console
2. Essayez sur un autre réseau WiFi
3. Essayez sur un autre appareil (iOS/Android)
4. Consultez les logs Metro pour identifier l'erreur exacte

## 📚 Ressources

- [Documentation Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Troubleshooting](https://docs.expo.dev/troubleshooting/overview/)
- [Metro Bundler Config](https://docs.expo.dev/guides/customizing-metro/)
- [NativeWind v4 Setup](https://www.nativewind.dev/v4/getting-started/expo-router)

---

**Note**: Ce projet est configuré avec:
- Expo SDK 54
- React Native 0.81.4
- Node.js >= 20.19.4
- NativeWind v4
- Metro bundler avec support server-side
