// Service de génération vidéo simple avec Seedance 1.0 Lite
export class VideoGenerationService {
  apiKey: string;
  cometApiKey: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_RUNWARE_API_KEY || '';
    this.cometApiKey = process.env.EXPO_PUBLIC_COMET_API_KEY || '';
  }

  // Génération UUID simple
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Conversion File vers base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Upload d'image vers Runware (retourne imageUUID)
  async uploadImage(imageFile: File): Promise<string> {
    console.log('📤 [UPLOAD] Upload image vers Runware...');
    
    const base64Image = await this.fileToBase64(imageFile);
    
    const uploadRequest = {
      taskType: "imageUpload",
      taskUUID: this.generateUUID(),
      image: base64Image
    };

    // Créer un AbortController pour le timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 30000); // Timeout de 30 secondes pour l'upload
    
    try {
      const response = await fetch('/api/runware', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([uploadRequest]),
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const uploadResult = data.data?.[0] || data[0];
      const imageURL = uploadResult?.imageURL || uploadResult?.imagePath;
      
      if (!imageURL) {
        throw new Error('Upload réussi mais imageURL manquant');
      }

      console.log('✅ [UPLOAD] Image uploadée, imageURL:', imageURL);
      return imageURL;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('❌ [UPLOAD] Timeout de l\'upload');
        throw new Error('L\'upload de l\'image a pris trop de temps. Vérifiez votre connexion internet.');
      }
      throw error;
    }
  }

  // Génération vidéo avec Seedance 1.0 Lite
  async generateVideo(params: {
    prompt: string;
    referenceImage?: File;
    model?: string;
    width?: number;
    height?: number;
    duration?: number;
    onProgress?: (progress: number) => void;
  }): Promise<string> {
    const { prompt, referenceImage, model = 'bytedance:1@1', width = 640, height = 640, duration = 6, onProgress } = params;

    if (!this.apiKey) {
      throw new Error('Clé API Runware manquante');
    }

    // Vérifier si c'est le modèle Sora 2 (Comet API)
    if (model?.startsWith('comet:sora-2')) {
      return this.generateVideoWithSora({
        prompt,
        model,
        referenceImage,
        width,
        height,
        duration,
        onProgress
      });
    }

    // Vérifier si c'est le modèle Veo 3 (Ultra)
    if (model === 'google:3@1') {
      return this.generateVideoWithVeo3(prompt, referenceImage, onProgress);
    }

    try {
      console.log('🎬 [SEEDANCE] Début génération vidéo');
      console.log('📝 [SEEDANCE] Prompt:', prompt);
      console.log('🖼️ [SEEDANCE] Avec image:', !!referenceImage);
      console.log('📐 [SEEDANCE] Dimensions:', `${width}x${height}`);

      if (onProgress) onProgress(10);

      let videoRequest: any = {
        taskType: "videoInference",
        taskUUID: this.generateUUID(),
        deliveryMethod: "async",
        outputType: "URL",
        outputFormat: "MP4",
        outputQuality: 85,
        includeCost: true,
        model: model, // Utiliser le modèle passé en paramètre
        duration: duration, // Utiliser la durée passée en paramètre
        width: width,
        height: height,
        positivePrompt: prompt,
      };

      // Ajouter providerSettings seulement pour les modèles bytedance
      if (model.includes('bytedance')) {
        videoRequest.providerSettings = {
          bytedance: {
            cameraFixed: false // Mouvements légers
          }
        };
      } else if (model.includes('google')) {
        // Google Veo 3 Fast ne supporte que enhancePrompt et generateAudio
        // Pas de paramètres spécifiques nécessaires pour l'instant
      }

      // Si une image de référence est fournie, l'uploader d'abord
      if (referenceImage) {
        console.log('📤 [SEEDANCE] Upload de l\'image de référence...');
        if (onProgress) onProgress(20);
        
        const imageURL = await this.uploadImage(referenceImage);
        
        // Ajouter l'image de référence pour Seedance (image-to-video)
        videoRequest.frameImages = [imageURL];
        
        console.log('✅ [SEEDANCE] Image de référence ajoutée');
        if (onProgress) onProgress(40);
      } else {
        // Text-to-video pur
        console.log('📝 [SEEDANCE] Mode text-to-video');
        if (onProgress) onProgress(30);
      }

      // Lancer la génération
      console.log('🚀 [SEEDANCE] Lancement de la génération...');
      
      // Créer un AbortController pour le timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, 60000); // Timeout de 60 secondes
      
      let requestBody: string;
      try {
        requestBody = JSON.stringify([videoRequest]);
      } catch (serializationError) {
        console.error('❌ [SEEDANCE] Erreur sérialisation JSON:', serializationError);
        throw new Error('Erreur lors de la préparation de la requête. Vérifiez votre prompt.');
      }
      
      const response = await fetch('/api/runware', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
        signal: abortController.signal
      });
      
      // Nettoyer le timeout si la requête réussit
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Génération failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const taskUUID = videoRequest.taskUUID;
      
      console.log('⏳ [SEEDANCE] Génération lancée, taskUUID:', taskUUID);
      if (onProgress) onProgress(50);

      // Polling pour attendre le résultat
      console.log('⏳ [SEEDANCE] Attente du résultat...');
      
      let attempts = 0;
      const maxAttempts = 180; // 9 minutes max pour les vidéos
      let delay = 2000; // Commencer avec 2 secondes
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
        
        const progress = 50 + (attempts / maxAttempts) * 45;
        if (onProgress) onProgress(Math.min(95, progress));
        
        try {
          // Vérifier le statut
          const statusRequest = {
            taskType: "getResponse",
            taskUUID: taskUUID
          };

          // Créer un AbortController pour le polling
          const pollAbortController = new AbortController();
          const pollTimeoutId = setTimeout(() => {
            pollAbortController.abort();
          }, 10000); // Timeout de 10 secondes pour chaque poll

          const statusResponse = await fetch('/api/runware', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([statusRequest]),
            signal: pollAbortController.signal
          });
          
          // Nettoyer le timeout du polling
          clearTimeout(pollTimeoutId);

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('📊 [SEEDANCE] Status response:', statusData);
            
            // Vérifier la structure de la réponse
            const results = statusData.data || statusData;
            
            if (Array.isArray(results)) {
              for (const result of results) {
                if (result.taskUUID === taskUUID) {
                  console.log('🔍 [SEEDANCE] Result status:', result.status, 'videoURL:', !!result.videoURL);
                  
                  if (result.status === 'success' && (result.videoURL || result.videoPath)) {
                    const videoUrl = result.videoURL || result.videoPath;
                    console.log('✅ [SEEDANCE] Vidéo prête:', result.videoURL);
                    if (onProgress) onProgress(100);
                    return videoUrl;
                  }
                  if (result.status === 'error') {
                    throw new Error(result.message || 'Erreur génération vidéo');
                  }
                  if (result.status === 'processing' || result.status === 'pending') {
                    console.log('⏳ [SEEDANCE] Vidéo en cours de traitement...');
                  }
                }
              }
            } else if (results && results.taskUUID === taskUUID) {
              // Cas où la réponse n'est pas un array
              if (results.status === 'success' && (results.videoURL || results.videoPath)) {
                const videoUrl = results.videoURL || results.videoPath;
                console.log('✅ [SEEDANCE] Vidéo prête (format direct):', videoUrl);
                if (onProgress) onProgress(100);
                return videoUrl;
              }
            }
          }
        } catch (pollError) {
          if (pollError.name === 'AbortError') {
            console.warn('⚠️ [SEEDANCE] Timeout polling (continue)');
          } else {
            console.warn('⚠️ [SEEDANCE] Erreur polling (continue):', pollError);
          }
        }
        
        // Augmenter progressivement le délai (exponential backoff)
        delay = Math.min(delay * 1.2, 5000);
      }
      
      throw new Error('Timeout - vidéo non prête après 9 minutes');
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ [SEEDANCE] Timeout de la requête initiale');
        throw new Error('La requête a pris trop de temps. Vérifiez votre connexion internet et réessayez.');
      }
      console.error('❌ [SEEDANCE] Erreur génération vidéo:', error);
      throw error;
    }
  }

  private getCometAuthorizationHeader(): string {
    if (!this.cometApiKey) {
      return '';
    }

    if (this.cometApiKey.startsWith('Bearer ')) {
      return this.cometApiKey;
    }

    return `Bearer ${this.cometApiKey}`;
  }

  private extractVideoUrlFromSoraContent(content: any): string | null {
    if (!content) {
      return null;
    }

    if (typeof content === 'string') {
      const match = content.match(/https?:\/\/[^\s"']+\.mp4/);
      return match ? match[0] : null;
    }

    if (Array.isArray(content)) {
      for (const item of content) {
        const result = this.extractVideoUrlFromSoraContent(item);
        if (result) {
          return result;
        }
      }
      return null;
    }

    if (typeof content === 'object') {
      if (content.url && typeof content.url === 'string') {
        const match = content.url.match(/https?:\/\/[^\s"']+\.mp4/);
        if (match) {
          return match[0];
        }
      }

      if (content.text && typeof content.text === 'string') {
        const match = content.text.match(/https?:\/\/[^\s"']+\.mp4/);
        if (match) {
          return match[0];
        }
      }

      if (content.content && typeof content.content === 'string') {
        const match = content.content.match(/https?:\/\/[^\s"']+\.mp4/);
        if (match) {
          return match[0];
        }
      }

      if (content.message) {
        const result = this.extractVideoUrlFromSoraContent(content.message);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  private extractVideoUrlFromSoraResponse(data: any): string | null {
    if (!data) {
      return null;
    }

    if (data.video_url || data.videoUrl) {
      return data.video_url || data.videoUrl;
    }

    if (data.output?.video?.url) {
      return data.output.video.url;
    }

    if (data.links?.video) {
      return data.links.video;
    }

    if (data.choices?.[0]?.message) {
      const { message } = data.choices[0];
      return this.extractVideoUrlFromSoraContent(message.content || message);
    }

    if (data.data) {
      return this.extractVideoUrlFromSoraContent(data.data);
    }

    return null;
  }

  private async pollSoraResult(statusUrl: string, onProgress?: (progress: number) => void): Promise<string> {
    console.log('🔁 [SORA2] Démarrage du polling:', statusUrl);

    const authHeader = this.getCometAuthorizationHeader();
    let attempts = 0;
    const maxAttempts = 180; // 9 minutes

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const response = await fetch(statusUrl, {
          headers: authHeader ? { Authorization: authHeader } : undefined
        });

        if (response.ok) {
          const contentType = response.headers.get('Content-Type') || '';
          const raw = await response.text();

          let parsed: any = null;
          if (contentType.includes('application/json')) {
            try {
              parsed = JSON.parse(raw);
            } catch (jsonError) {
              console.warn('⚠️ [SORA2] Impossible de parser le JSON du polling:', jsonError);
            }
          }

          const directUrl = parsed ? this.extractVideoUrlFromSoraResponse(parsed) : this.extractVideoUrlFromSoraContent(raw);

          if (directUrl) {
            console.log('✅ [SORA2] Vidéo prête via polling:', directUrl);
            if (onProgress) onProgress(100);
            return directUrl;
          }

          if (parsed?.status && ['failed', 'error'].includes(parsed.status)) {
            throw new Error(parsed?.message || 'Statut Sora 2 en échec');
          }
        } else {
          console.warn(`⚠️ [SORA2] Polling status ${response.status}`);
        }
      } catch (pollError) {
        console.warn('⚠️ [SORA2] Erreur lors du polling:', pollError);
      }

      if (onProgress) {
        const progress = 60 + (attempts / maxAttempts) * 40;
        onProgress(Math.min(95, progress));
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('[SORA2] Timeout - vidéo non prête après 9 minutes');
  }

  async generateVideoWithSora(params: {
    prompt: string;
    model: string;
    referenceImage?: File;
    width?: number;
    height?: number;
    duration?: number;
    onProgress?: (progress: number) => void;
  }): Promise<string> {
    const { prompt, model, referenceImage, width, height, duration = 10, onProgress } = params;

    if (!this.cometApiKey) {
      throw new Error('Clé API CometAPI manquante pour Sora 2');
    }

    if (referenceImage) {
      console.warn('⚠️ [SORA2] Les images de référence ne sont pas supportées.');
    }

    console.log('🎬 [SORA2] Début génération vidéo via Comet API');

    const authHeader = this.getCometAuthorizationHeader();
    const soraModel = model.replace('comet:', '');

    const systemInstructionParts = [
      'You are a video generation assistant for Genly.',
      'Return only HTTPS links to the generated MP4 when it is ready.',
    ];

    if (duration) {
      systemInstructionParts.push(`Target duration: approximately ${duration} seconds.`);
    }

    if (width && height) {
      systemInstructionParts.push(`Target resolution: ${width}x${height}.`);
    }

    const messages = [
      { role: 'system', content: systemInstructionParts.join(' ') },
      { role: 'user', content: prompt }
    ];

    const payload = {
      model: soraModel,
      messages,
      stream: false,
      max_tokens: 2048
    };

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 120000); // 120 secondes

    if (onProgress) onProgress(20);

    try {
      const response = await fetch('https://api.cometapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SORA2] Erreur HTTP:', errorText);
        throw new Error(`[SORA2] Erreur: ${response.status} - ${errorText}`);
      }

      const raw = await response.text();
      if (onProgress) onProgress(40);
      let data: any = null;

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (jsonError) {
        console.warn('⚠️ [SORA2] Impossible de parser la réponse JSON, tentative extraction via texte brut');
      }

      const directUrl = data ? this.extractVideoUrlFromSoraResponse(data) : this.extractVideoUrlFromSoraContent(raw);

      if (directUrl) {
        console.log('✅ [SORA2] Vidéo prête immédiatement:', directUrl);
        if (onProgress) onProgress(100);
        return directUrl;
      }

      const statusUrl = data?.links?.video || data?.links?.source || data?.status_url;
      if (statusUrl) {
        if (onProgress) onProgress(60);
        return await this.pollSoraResult(statusUrl, onProgress);
      }

      if (data?.id && data?.links?.status) {
        if (onProgress) onProgress(60);
        return await this.pollSoraResult(data.links.status, onProgress);
      }

      throw new Error('[SORA2] Aucun lien vidéo trouvé dans la réponse');

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.error('❌ [SORA2] Timeout de la requête');
        throw new Error('La génération Sora 2 a expiré. Réessayez dans quelques instants.');
      }

      console.error('❌ [SORA2] Erreur:', error);
      throw error;
    }
  }

  // Nouvelle méthode pour Veo 3 via CometAPI
  async generateVideoWithVeo3(prompt: string, referenceImage?: File, onProgress?: (progress: number) => void): Promise<string> {
    console.log('🎬 [VEO3] Début génération vidéo avec Comet API');

    if (onProgress) onProgress(10);

    try {
      // ---- PATCH POUR VEO3 UNIQUEMENT ----
      // Ajoute la possibilité de générer avec texte + image
      let imageUrl: string | null = null;
      
      if (referenceImage) {
        console.log('📤 [VEO3] Upload de l\'image de référence...');
        if (onProgress) onProgress(20);
        imageUrl = await this.uploadImage(referenceImage);
        console.log('✅ [VEO3] Image uploadée:', imageUrl);
      }
      
      const content: any[] = [
        { type: "text", text: prompt }
      ];

      if (imageUrl) {
        content.push({
          type: "image_url",
          image_url: { url: imageUrl }
        });
      }

      const payload = {
        model: "veo3-fast-frames",
        messages: [{ role: "user", content }],
        max_tokens: 300
      };

      console.log('📡 [VEO3] Envoi vers Comet API...');
      if (onProgress) onProgress(referenceImage ? 40 : 30);

      const response = await fetch('https://api.cometapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.cometApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [VEO3] Erreur:', errorText);
        throw new Error(`[VEO3] Erreur: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 [VEO3] Réponse création tâche:', data);

      // Cas 1 : "veo3" classique avec suivi
      if (data.links?.source) {
        const statusUrl = data.links.source;
        console.log('🔗 [VEO3] Suivi via links.source:', statusUrl);
        return await this.pollVeo3Result(statusUrl, onProgress);
      }

      // Cas 2 : "veo3-fast-frames" → URL directement dans choices
      if (data.choices?.[0]?.message?.content) {
        const content = data.choices[0].message.content;
        const match = content.match(/https?:\/\/[^\s"]+\.mp4/);
        if (match) {
          console.log('✅ [VEO3] URL vidéo extraite direct:', match[0]);
          if (onProgress) onProgress(100);
          return match[0];
        }
      }

      // Si aucun des cas ne marche
      throw new Error('[VEO3] Erreur: Aucun lien vidéo trouvé dans la réponse');

    } catch (error) {
      console.error('❌ [VEO3] Erreur:', error);
      if (error.message.includes('[VEO3]')) {
        throw error;
      } else {
        throw new Error(`[VEO3] Erreur: ${error.message}`);
      }
    }
  }

  // Méthode de polling pour veo3 classique
  async pollVeo3Result(statusUrl: string, onProgress?: (progress: number) => void): Promise<string> {
    if (onProgress) onProgress(60);

    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 [VEO3] Polling tentative ${attempts}/${maxAttempts}`);

      try {
        const statusResponse = await fetch(statusUrl, {
          headers: { 'Authorization': `Bearer ${this.cometApiKey}` }
        });

        if (statusResponse.ok) {
          const text = await statusResponse.text();

          // Chercher la vidéo HQ
          const highQualityMatch = text.match(/High-quality video generated[\s\S]*?(https?:\/\/[^\s\]]+\.mp4)/i);
          if (highQualityMatch) {
            const videoUrl = highQualityMatch[1];
            console.log('✅ [VEO3] URL vidéo HQ:', videoUrl);
            if (onProgress) onProgress(100);
            return videoUrl;
          }

          // Fallback sur n'importe quelle URL .mp4
          const anyMp4Match = text.match(/https?:\/\/[^\s\]]+\.mp4/i);
          if (anyMp4Match) {
            const videoUrl = anyMp4Match[0];
            console.log('✅ [VEO3] URL vidéo (fallback):', videoUrl);
            if (onProgress) onProgress(100);
            return videoUrl;
          }

          console.log('⏳ [VEO3] Vidéo pas encore prête...');
        }
      } catch (pollError) {
        console.warn('⚠️ [VEO3] Erreur polling (continue):', pollError);
      }

      if (onProgress) {
        const progress = 60 + (attempts / maxAttempts) * 40;
        onProgress(Math.min(95, progress));
      }

      await new Promise(r => setTimeout(r, 5000));
    }

    throw new Error('[VEO3] Erreur: Timeout - vidéo non générée après 10 minutes');
  }
}