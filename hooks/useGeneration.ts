/**
 * Hooks personnalisés pour la génération d'images et vidéos
 */

import { useCallback, useRef, useState, type ComponentType } from 'react';
import { Alert } from 'react-native';

// ==================== HOOK DE GÉNÉRATION ====================
export interface GenerationState<T> {
  result: T | null;
  isGenerating: boolean;
  error: string | null;
  progress: number;
}

export interface UseGenerationOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  validateInput?: () => boolean | string;
}

export function useGeneration<T>(
  generationFn: (onProgress: (progress: number) => void) => Promise<T>,
  options: UseGenerationOptions<T> = {}
) {
  const [state, setState] = useState<GenerationState<T>>({
    result: null,
    isGenerating: false,
    error: null,
    progress: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    if (options.validateInput) {
      const validation = options.validateInput();
      if (typeof validation === 'string') {
        Alert.alert('Validation Error', validation);
        return;
      }
      if (!validation) {
        return;
      }
    }

    setState({
      result: null,
      isGenerating: true,
      error: null,
      progress: 0,
    });

    abortControllerRef.current = new AbortController();

    try {
      const result = await generationFn((progress) => {
        setState((prev) => ({ ...prev, progress }));
      });

      setState({
        result,
        isGenerating: false,
        error: null,
        progress: 100,
      });

      options.onSuccess?.(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Generation failed';

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
      }));

      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [generationFn, options]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isGenerating: false,
      error: 'Generation cancelled',
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      result: null,
      isGenerating: false,
      error: null,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    generate,
    cancel,
    reset,
  };
}

// ==================== HOOK D'IMAGE PICKER ====================
export interface UseImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  onImageSelected?: (uri: string) => void;
}

export function useImagePicker(options: UseImagePickerOptions = {}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const pickImage = useCallback(async () => {
    const ImagePicker = await import('expo-image-picker');

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Access to gallery is needed to import images.'
      );
      return;
    }

    setIsPickerOpen(true);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? false,
      aspect: options.aspect,
      quality: options.quality ?? 0.8,
      base64: false,
    });

    setIsPickerOpen(false);

    if (!result.canceled && result.assets && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      options.onImageSelected?.(uri);
    }
  }, [options]);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  return {
    selectedImage,
    isPickerOpen,
    pickImage,
    clearImage,
  };
}

// ==================== HOOK DE LOADING ANIMATION ====================
export interface UseLoadingAnimationOptions {
  icons?: Array<ComponentType<any>>;
  iconChangeInterval?: number;
}

export function useLoadingAnimation(options: UseLoadingAnimationOptions = {}) {
  const { iconChangeInterval = 1500 } = options;
  const [iconIndex, setIconIndex] = useState(0);

  const startAnimation = useCallback(() => {
    const interval = setInterval(() => {
      setIconIndex((prev) => {
        const icons = options.icons || [];
        return (prev + 1) % (icons.length || 1);
      });
    }, iconChangeInterval);

    return () => clearInterval(interval);
  }, [iconChangeInterval, options.icons]);

  return {
    iconIndex,
    startAnimation,
  };
}

// ==================== HOOK DE MEDIA STORAGE ====================
export function useMediaStorage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const saveMedia = useCallback(
    async (url: string, filename: string, metadata?: unknown) => {
      setIsSaving(true);
      try {
        const { storageService } = await import('@/services/storage');
        await storageService.downloadImage(url, filename, metadata);
        Alert.alert('Success', 'Media saved successfully!');
      } catch (error) {
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Failed to save media'
        );
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const shareMedia = useCallback(
    async (url: string, prompt: string, metadata?: unknown) => {
      setIsSharing(true);
      try {
        const { storageService } = await import('@/services/storage');
        await storageService.shareImage(url, prompt, metadata);
      } catch (error) {
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Failed to share media'
        );
      } finally {
        setIsSharing(false);
      }
    },
    []
  );

  return {
    isSaving,
    isSharing,
    saveMedia,
    shareMedia,
  };
}

// ==================== HOOK DE FORM STATE ====================
export interface FormField<T> {
  value: T;
  error: string | null;
}

type ExtractFields<T extends Record<string, any>> = {
  [K in keyof T]: FormField<T[K]>;
};

export function useFormState<T extends Record<string, any>>(initialState: T) {
  const createInitialFields = useCallback(() => {
    return Object.entries(initialState).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: { value, error: null },
      };
    }, {} as ExtractFields<T>);
  }, [initialState]);

  const [fields, setFields] = useState<ExtractFields<T>>(() =>
    createInitialFields()
  );

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFields((prev) => ({
      ...prev,
      [field]: { value, error: null },
    }));
  }, []);

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setFields((prev) => ({
      ...prev,
      [field]: { ...prev[field], error },
    }));
  }, []);

  const resetField = useCallback(<K extends keyof T>(field: K) => {
    setFields((prev) => ({
      ...prev,
      [field]: { value: initialState[field], error: null },
    }));
  }, [initialState]);

  const reset = useCallback(() => {
    setFields(createInitialFields());
  }, [createInitialFields]);

  const getValues = useCallback(() => {
    return Object.entries(fields).reduce((acc, [key, field]) => {
      return { ...acc, [key]: (field as FormField<any>).value };
    }, {} as T);
  }, [fields]);

  const hasErrors = useCallback(() => {
    return Object.values(fields).some(
      (field) => (field as FormField<any>).error !== null
    );
  }, [fields]);

  return {
    fields: fields as { [K in keyof T]: FormField<T[K]> },
    setValue,
    setError,
    resetField,
    reset,
    getValues,
    hasErrors,
  };
}
