export class FalApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'FalApiError';
  }
}

export function handleFalError(error: any): FalApiError {
  if (error.status === 404 || error.statusCode === 404) {
    return new FalApiError(
      'Endpoint API invalide. Vérifiez l\'URL et le modèle ID.',
      404,
      error
    );
  }

  if (error.status === 401 || error.statusCode === 401) {
    return new FalApiError(
      'Clé API invalide ou expirée. Vérifiez votre configuration.',
      401,
      error
    );
  }

  if (error.status === 422 || error.statusCode === 422) {
    return new FalApiError(
      'Paramètres de requête invalides. Vérifiez votre payload.',
      422,
      error
    );
  }

  if (error.status === 429 || error.statusCode === 429) {
    return new FalApiError(
      'Limite de taux dépassée. Réessayez dans quelques instants.',
      429,
      error
    );
  }

  if (error.status >= 500 || error.statusCode >= 500) {
    return new FalApiError(
      'Erreur serveur fal.ai. Réessayez (non facturé).',
      error.status || error.statusCode,
      error
    );
  }

  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return new FalApiError(
      'Erreur de connexion réseau. Vérifiez votre connexion.',
      0,
      error
    );
  }

  if (error.message?.includes('timeout')) {
    return new FalApiError(
      'Délai d\'attente dépassé. L\'opération a pris trop de temps.',
      0,
      error
    );
  }

  return new FalApiError(
    error.message || 'Erreur inconnue lors de l\'appel API',
    error.status || error.statusCode,
    error
  );
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      const shouldRetry =
        error.statusCode >= 500 ||
        error.statusCode === 429 ||
        error.message?.includes('timeout') ||
        error.message?.includes('network');

      if (!shouldRetry || attempt === maxRetries) {
        throw handleFalError(error);
      }

      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      console.log(`Tentative ${attempt}/${maxRetries} échouée, retry dans ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw handleFalError(lastError);
}
