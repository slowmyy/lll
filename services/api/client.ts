/**
 * Client API modulaire et réutilisable
 */

import {
  APIError,
  FetchWithTimeoutOptions,
  fetchWithTimeout,
  validateApiKey,
} from '@/utils/common';

export interface APIClientConfig {
  baseUrl: string;
  apiKey: string;
  serviceName: string;
  defaultTimeout?: number;
}

export class APIClient {
  private readonly config: APIClientConfig;

  constructor(config: APIClientConfig) {
    this.config = {
      defaultTimeout: 60000,
      ...config,
    };

    validateApiKey(this.config.apiKey, this.config.serviceName);
  }

  async post<T = unknown>(
    endpoint: string,
    body: unknown,
    options: FetchWithTimeoutOptions = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;

    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.getAuthHeader(),
          ...options.headers,
        },
        body: JSON.stringify(body),
        timeout: options.timeout ?? this.config.defaultTimeout,
        ...options,
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      this.handleError(error);
    }
  }

  async get<T = unknown>(
    endpoint: string,
    options: FetchWithTimeoutOptions = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;

    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          Authorization: this.getAuthHeader(),
          ...options.headers,
        },
        timeout: options.timeout ?? this.config.defaultTimeout,
        ...options,
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      this.handleError(error);
    }
  }

  private getAuthHeader(): string {
    const { apiKey } = this.config;
    return apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const text = await response.text();
    let errorData: unknown;

    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = { error: text };
    }

    const errorBody = errorData as { error?: string; message?: string };
    const message =
      errorBody.error || errorBody.message || `HTTP ${response.status}`;

    throw new APIError(
      `${this.config.serviceName} error: ${message}`,
      response.status,
      errorData
    );
  }

  private handleError(error: unknown): never {
    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new APIError(
        `${this.config.serviceName} request failed: ${error.message}`
      );
    }

    throw new APIError(`${this.config.serviceName} unknown error`);
  }
}

// ==================== RUNWARE CLIENT ====================
export class RunwareClient extends APIClient {
  constructor(apiKey: string) {
    super({
      baseUrl:
        process.env.EXPO_PUBLIC_RUNWARE_API_URL || 'https://api.runware.ai/v1',
      apiKey,
      serviceName: 'Runware',
      defaultTimeout: 60000,
    });
  }

  // Utiliser le proxy pour éviter CORS
  async postViaProxy<T = unknown>(body: unknown): Promise<T> {
    return this.post<T>('/api/runware', body);
  }
}

// ==================== COMET CLIENT ====================
export class CometClient extends APIClient {
  constructor(apiKey: string) {
    super({
      baseUrl: 'https://api.cometapi.com',
      apiKey,
      serviceName: 'CometAPI',
      defaultTimeout: 90000,
    });
  }

  async generateImage(prompt: string, referenceImages?: string[]): Promise<string> {
    const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [
      { text: prompt },
    ];

    if (referenceImages && referenceImages.length > 0) {
      for (const imgUrl of referenceImages) {
        const { mime_type, data } = await this.convertImageToBase64(imgUrl);
        parts.push({ inline_data: { mime_type, data } });
      }
    }

    const response = await this.post<any>(
      '/v1beta/models/gemini-2.5-flash-image:generateContent',
      {
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }
    );

    return this.extractImageFromResponse(response);
  }

  private async convertImageToBase64(
    uri: string
  ): Promise<{ mime_type: string; data: string }> {
    if (uri.startsWith('data:')) {
      const match = uri.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        return { mime_type: match[1], data: match[2] };
      }
    }

    const response = await fetch(uri);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    const base64 =
      typeof btoa === 'function'
        ? btoa(binary)
        : (globalThis as { Buffer?: { from(data: Uint8Array): { toString(encoding: string): string } } })
            .Buffer?.from(bytes)
            .toString('base64') ?? '';

    if (!base64) {
      throw new Error('Unable to convert image to base64');
    }

    return {
      mime_type: blob.type || 'image/jpeg',
      data: base64,
    };
  }

  private extractImageFromResponse(response: any): string {
    const candidates = response?.candidates;
    if (Array.isArray(candidates)) {
      for (const candidate of candidates) {
        const parts = candidate?.content?.parts;
        if (Array.isArray(parts)) {
          for (const part of parts) {
            const inline = part?.inline_data || part?.inlineData;
            const data = inline?.data;
            const mimeType = inline?.mime_type || inline?.mimeType;

            if (data && typeof data === 'string' && data.length > 100) {
              return `data:${mimeType || 'image/png'};base64,${data}`;
            }
          }
        }
      }
    }

    throw new Error('No image found in CometAPI response');
  }
}
