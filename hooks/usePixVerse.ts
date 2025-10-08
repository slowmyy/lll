import { useState } from 'react';
import { fal } from '@fal-ai/client';

fal.config({
  proxyUrl: '/api/fal-proxy'
});

export type PixVerseEffect =
  | 'kiss me ai'
  | 'hug your love'
  | 'muscle surge'
  | 'jiggle jiggle'
  | 'skeleton dance'
  | 'kungfu club'
  | 'boom drop'
  | 'creepy devil smile'
  | 'eye zoom challenge'
  | 'balloon belly';

export type CameraMovement =
  | 'zoom_in'
  | 'zoom_out'
  | 'horizontal_left'
  | 'horizontal_right'
  | 'vertical_up'
  | 'vertical_down'
  | 'smooth_zoom_in'
  | 'pan_left'
  | 'pan_right';

interface PixVerseOptions {
  resolution?: '360p' | '540p' | '720p' | '1080p';
  duration?: '5' | '8';
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  style?: 'anime' | '3d_animation' | 'clay' | 'comic' | 'cyberpunk';
  seed?: number;
  negativePrompt?: string;
}

export function usePixVerse() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const imageToVideo = async (
    imageUri: string,
    prompt: string,
    options?: PixVerseOptions & { cameraMovement?: CameraMovement }
  ) => {
    try {
      setLoading(true);
      setError(null);
      setProgress('Upload de l\'image...');

      const response = await fetch(imageUri);
      const blob = await response.blob();
      const file = new File([blob], 'input.jpg', { type: 'image/jpeg' });

      const uploadedUrl = await fal.storage.upload(file);
      setProgress('Image uploadée, génération en cours...');

      const { data, requestId } = await fal.subscribe(
        'fal-ai/pixverse/v5/image-to-video',
        {
          input: {
            prompt,
            image_url: uploadedUrl,
            resolution: options?.resolution || '720p',
            duration: options?.duration || '5',
            aspect_ratio: options?.aspectRatio || '16:9',
            negative_prompt: options?.negativePrompt || 'blurry, low quality, distorted',
            style: options?.style,
            seed: options?.seed,
            camera_movement: options?.cameraMovement
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === 'IN_QUEUE') {
              setProgress(`En file d'attente (position: ${update.queue_position})`);
            } else if (update.status === 'IN_PROGRESS') {
              setProgress('Génération en cours...');
              update.logs?.forEach(log => console.log(log.message));
            }
          }
        }
      );

      setResult(data);
      setProgress('Terminé !');
      return { data, requestId };

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la génération vidéo';
      setError(errorMessage);
      console.error('Erreur imageToVideo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const textToVideo = async (
    prompt: string,
    options?: PixVerseOptions
  ) => {
    try {
      setLoading(true);
      setError(null);
      setProgress('Génération en cours...');

      const { data, requestId } = await fal.subscribe(
        'fal-ai/pixverse/v5/text-to-video',
        {
          input: {
            prompt,
            resolution: options?.resolution || '720p',
            duration: options?.duration || '5',
            aspect_ratio: options?.aspectRatio || '16:9',
            negative_prompt: options?.negativePrompt,
            style: options?.style,
            seed: options?.seed
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === 'IN_QUEUE') {
              setProgress(`Position: ${update.queue_position}`);
            } else if (update.status === 'IN_PROGRESS') {
              setProgress('Génération en cours...');
            }
          }
        }
      );

      setResult(data);
      setProgress('Terminé !');
      return { data, requestId };

    } catch (err: any) {
      setError(err.message || 'Erreur génération vidéo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const applyEffect = async (
    effect: PixVerseEffect,
    imageUri?: string,
    options?: PixVerseOptions
  ) => {
    try {
      setLoading(true);
      setError(null);
      setProgress('Application de l\'effet...');

      let uploadedUrl: string | undefined;

      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const file = new File([blob], 'input.jpg', { type: 'image/jpeg' });
        uploadedUrl = await fal.storage.upload(file);
      }

      const { data, requestId } = await fal.subscribe(
        'fal-ai/pixverse/v4.5/effects',
        {
          input: {
            effect,
            image_url: uploadedUrl,
            resolution: options?.resolution || '720p',
            duration: options?.duration || '5',
            aspect_ratio: options?.aspectRatio
          },
          logs: true,
          onQueueUpdate: (update) => {
            setProgress(update.status === 'IN_QUEUE'
              ? `Position: ${update.queue_position}`
              : 'Traitement...');
          }
        }
      );

      setResult(data);
      return { data, requestId };

    } catch (err: any) {
      setError(err.message || 'Erreur application effet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTransition = async (
    firstImageUri: string,
    lastImageUri: string,
    prompt: string,
    options?: PixVerseOptions
  ) => {
    try {
      setLoading(true);
      setError(null);
      setProgress('Upload des images...');

      const response1 = await fetch(firstImageUri);
      const blob1 = await response1.blob();
      const file1 = new File([blob1], 'first.jpg', { type: 'image/jpeg' });
      const firstUrl = await fal.storage.upload(file1);

      const response2 = await fetch(lastImageUri);
      const blob2 = await response2.blob();
      const file2 = new File([blob2], 'last.jpg', { type: 'image/jpeg' });
      const lastUrl = await fal.storage.upload(file2);

      setProgress('Génération de la transition...');

      const { data, requestId } = await fal.subscribe(
        'fal-ai/pixverse/v5/transition',
        {
          input: {
            prompt,
            first_image_url: firstUrl,
            last_image_url: lastUrl,
            resolution: options?.resolution || '720p',
            duration: options?.duration || '5',
            aspect_ratio: options?.aspectRatio,
            style: options?.style
          },
          logs: true,
          onQueueUpdate: (update) => {
            setProgress(update.status);
          }
        }
      );

      setResult(data);
      return { data, requestId };

    } catch (err: any) {
      setError(err.message || 'Erreur création transition');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
    setProgress('');
  };

  return {
    imageToVideo,
    textToVideo,
    applyEffect,
    createTransition,
    loading,
    progress,
    error,
    result,
    reset
  };
}
