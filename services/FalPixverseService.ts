// Ce service a été remplacé par le hook usePixVerse
// Utilisez: import { usePixVerse } from '@/hooks/usePixVerse';

export type PixverseEffect = string;
export type PixverseEffectConfig = any;
export type PixverseGenerationOptions = any;
export type PixverseGenerationResult = any;

class FalPixverseServiceDeprecated {
  getEffectsByCategory() {
    console.warn('⚠️ FalPixverseService est obsolète. Utilisez le hook usePixVerse à la place.');
    return [];
  }

  async generateVideoWithEffect() {
    throw new Error('FalPixverseService est obsolète. Utilisez le hook usePixVerse à la place.');
  }

  async uploadImage() {
    throw new Error('FalPixverseService est obsolète. Utilisez le hook usePixVerse à la place.');
  }
}

export const falPixverseService = new FalPixverseServiceDeprecated();
export class FalPixverseService extends FalPixverseServiceDeprecated {}
