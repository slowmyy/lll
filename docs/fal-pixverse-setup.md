# Configuration Fal AI / PixVerse

Ce projet utilise une route API sécurisée pour communiquer avec Fal AI (PixVerse). Suivez les étapes ci-dessous pour configurer correctement votre environnement local.

## 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet **sans le commiter** dans Git :

```env
# Clé API Fal AI (obligatoire)
FAL_API_KEY=votre_cle_api_fal_ici
```

> ⚠️ N'utilisez pas `EXPO_PUBLIC_FAL_API_KEY` ni `NEXT_PUBLIC_FAL_API_KEY`. Ces noms exposent la clé au client et ne fonctionneront pas avec les routes API server-side.

Après toute modification du fichier `.env.local`, redémarrez le serveur de développement :

```bash
npm run dev
```

## 2. Points de terminaison supportés

La route `app/api/fal-pixverse+api.ts` agit comme proxy sécurisé et prend en charge :

- `POST /api/fal-pixverse` avec `taskType: "submit"` pour lancer une génération PixVerse (effects, image-to-video, text-to-video)
- `taskType: "status"` pour le suivi de la génération
- `taskType: "result"` pour récupérer le résultat final
- `taskType: "upload"` pour envoyer une image vers le stockage Fal

Toutes les requêtes sont signées côté serveur avec `FAL_API_KEY`.

## 3. Débogage

- En cas d'erreur 500, vérifiez que `FAL_API_KEY` est défini et que le serveur a été redémarré après la modification.
- Les logs console du serveur (terminaux) affichent des messages détaillés tels que `📤 Upload image...` ou `📦 Payload`. Utilisez-les pour diagnostiquer les problèmes de payload.
- Les erreurs retournées par Fal AI sont renvoyées dans la réponse JSON (`error`, `details`).

## 4. Tests rapides

1. Configurez `FAL_API_KEY`.
2. Exécutez `npm run dev`.
3. Depuis une console, testez la route :
   ```bash
   curl -X POST http://localhost:3000/api/fal-pixverse \
     -H 'Content-Type: application/json' \
     -d '{"taskType":"status","requestId":"demo"}'
   ```
   Vous devriez recevoir une erreur contrôlée indiquant que l'identifiant est invalide ou inexistant.

Pour des exemples complets d'utilisation côté client, consultez `services/FalPixverseService.ts`.
