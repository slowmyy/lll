import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Easing,
  Platform,
  ScrollView
} from 'react-native';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { Upload, X, Download, Share, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/Colors';
import GlassCard from '@/components/GlassCard';
import GradientButton from '@/components/GradientButton';
import { usePixVerse, PixVerseEffect } from '@/hooks/usePixVerse';
import { storageService } from '@/services/storage';

interface VideoEffectsProps {
  onVideoGenerated?: (videoUrl: string) => void;
}

interface EffectConfig {
  id: string;
  name: PixVerseEffect;
  category: 'interaction' | 'transformation' | 'viral' | 'horror' | 'fantasy';
  description: string;
  requiresImage: boolean;
  emoji: string;
}

const EFFECTS_CONFIG: EffectConfig[] = [
  {
    id: 'kiss-me-ai',
    name: 'kiss me ai',
    category: 'interaction',
    description: 'Effet de bisou IA viral sur TikTok',
    requiresImage: true,
    emoji: '💋'
  },
  {
    id: 'hug-your-love',
    name: 'hug your love',
    category: 'interaction',
    description: 'Effet de câlin/étreinte',
    requiresImage: true,
    emoji: '🤗'
  },
  {
    id: 'muscle-surge',
    name: 'muscle surge',
    category: 'transformation',
    description: 'Transformation corporelle musculaire',
    requiresImage: true,
    emoji: '💪'
  },
  {
    id: 'jiggle-jiggle',
    name: 'jiggle jiggle',
    category: 'viral',
    description: 'Effet viral de mouvement',
    requiresImage: true,
    emoji: '🕺'
  },
  {
    id: 'skeleton-dance',
    name: 'skeleton dance',
    category: 'horror',
    description: 'Transformation en squelette dansant',
    requiresImage: true,
    emoji: '💀'
  },
  {
    id: 'kungfu-club',
    name: 'kungfu club',
    category: 'viral',
    description: 'Mouvements de kung-fu',
    requiresImage: true,
    emoji: '🥋'
  },
  {
    id: 'boom-drop',
    name: 'boom drop',
    category: 'viral',
    description: 'Effet d\'explosion virale',
    requiresImage: true,
    emoji: '💥'
  },
  {
    id: 'creepy-devil-smile',
    name: 'creepy devil smile',
    category: 'horror',
    description: 'Sourire démoniaque effrayant',
    requiresImage: true,
    emoji: '😈'
  },
  {
    id: 'eye-zoom-challenge',
    name: 'eye zoom challenge',
    category: 'viral',
    description: 'Challenge viral du zoom sur les yeux',
    requiresImage: true,
    emoji: '👁️'
  },
  {
    id: 'balloon-belly',
    name: 'balloon belly',
    category: 'transformation',
    description: 'Transformation ventre ballon',
    requiresImage: true,
    emoji: '🎈'
  }
];

export default function VideoEffects({ onVideoGenerated }: VideoEffectsProps) {
  const [selectedEffect, setSelectedEffect] = useState<EffectConfig | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { applyEffect, loading: isGenerating, progress, result, error: apiError } = usePixVerse();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const interactionEffects = EFFECTS_CONFIG.filter(e => e.category === 'interaction');
  const transformationEffects = EFFECTS_CONFIG.filter(e => e.category === 'transformation');
  const viralEffects = EFFECTS_CONFIG.filter(e => e.category === 'viral');
  const horrorEffects = EFFECTS_CONFIG.filter(e => e.category === 'horror');
  const fantasyEffects = EFFECTS_CONFIG.filter(e => e.category === 'fantasy');

  useEffect(() => {
    if (isGenerating) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [isGenerating]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (progress.length || 0) / 100,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);

  useEffect(() => {
    if (result?.video?.url) {
      onVideoGenerated?.(result.video.url);

      storageService.saveImage({
        url: result.video.url,
        prompt: `Effet: ${selectedEffect?.name}`,
        timestamp: Date.now(),
        model: 'PixVerse v4.5',
        format: `Effet Vidéo - ${selectedEffect?.category}`,
        dimensions: '720p - 5s',
        style: selectedEffect?.name,
        isVideo: true,
        duration: 5,
      }).catch(err => console.error('Erreur sauvegarde:', err));
    }
  }, [result]);

  const handleSelectEffect = (effect: EffectConfig) => {
    setSelectedEffect(effect);
    setReferenceImage(null);
    setError(null);
  };

  const handleImportImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission requise', 'L\'accès à la galerie est nécessaire.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReferenceImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error importing image:', err);
      Alert.alert('Erreur', 'Impossible d\'importer l\'image.');
    }
  };

  const handleRemoveImage = () => {
    setReferenceImage(null);
  };

  const handleGenerate = async () => {
    if (!selectedEffect) {
      Alert.alert('Effet requis', 'Veuillez sélectionner un effet vidéo.');
      return;
    }

    if (selectedEffect.requiresImage && !referenceImage) {
      Alert.alert('Image requise', `L'effet "${selectedEffect.name}" nécessite une image de référence.`);
      return;
    }

    setError(null);

    try {
      await applyEffect(
        selectedEffect.name,
        referenceImage || undefined,
        {
          resolution: '720p',
          duration: '5'
        }
      );
    } catch (err) {
      console.error('Error generating video:', err);
      const message = err instanceof Error ? err.message : 'Erreur lors de la génération';
      setError(message);
      Alert.alert('Erreur', message);
    }
  };

  const handleDownload = async () => {
    if (!result?.video?.url) return;

    try {
      const filename = `genly-effect-${selectedEffect?.id}-${Date.now()}.mp4`;
      await storageService.downloadImage(result.video.url, filename);

      const successMessage = Platform.OS === 'web'
        ? 'Vidéo téléchargée avec succès!'
        : 'Vidéo sauvegardée dans votre galerie!';

      Alert.alert('Succès', successMessage);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de télécharger la vidéo');
    }
  };

  const handleShare = async () => {
    if (!result?.video?.url) return;

    try {
      await storageService.shareImage(
        result.video.url,
        `Effet: ${selectedEffect?.name}`
      );

      if (Platform.OS === 'web') {
        Alert.alert('Succès', 'Vidéo partagée avec succès!');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de partager la vidéo');
    }
  };

  const renderEffectCategory = (
    title: string,
    effects: EffectConfig[],
    emoji: string
  ) => {
    if (effects.length === 0) return null;

    return (
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryEmoji}>{emoji}</Text>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categoryCount}>({effects.length})</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.effectsScroll}
        >
          {effects.map((effect) => (
            <TouchableOpacity
              key={effect.id}
              style={[
                styles.effectCard,
                selectedEffect?.id === effect.id && styles.effectCardSelected
              ]}
              onPress={() => handleSelectEffect(effect)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={
                  selectedEffect?.id === effect.id
                    ? COLORS.gradientPrimary
                    : ['rgba(30, 41, 59, 0.6)', 'rgba(15, 23, 42, 0.8)']
                }
                style={styles.effectCardGradient}
              >
                <Text style={styles.effectEmoji}>{effect.emoji}</Text>
                <Text style={[
                  styles.effectName,
                  selectedEffect?.id === effect.id && styles.effectNameSelected
                ]}>
                  {effect.name.split(' ').map(w =>
                    w.charAt(0).toUpperCase() + w.slice(1)
                  ).join(' ')}
                </Text>
                {effect.requiresImage && (
                  <View style={styles.requiresImageBadge}>
                    <Upload size={12} color={COLORS.purple300} />
                    <Text style={styles.requiresImageText}>Image requise</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!selectedEffect ? (
        <View style={styles.selectionView}>
          <GlassCard style={styles.headerCard}>
            <Text style={styles.headerTitle}>✨ Effets Vidéo IA</Text>
            <Text style={styles.headerSubtitle}>
              Transformez vos photos en vidéos virales avec PixVerse
            </Text>
          </GlassCard>

          <ScrollView
            style={styles.categoriesScroll}
            showsVerticalScrollIndicator={false}
          >
            {renderEffectCategory('💋 Interaction', interactionEffects, '💋')}
            {renderEffectCategory('✨ Transformation', transformationEffects, '✨')}
            {renderEffectCategory('🔥 Viral TikTok', viralEffects, '🔥')}
            {renderEffectCategory('👻 Horreur', horrorEffects, '👻')}
            {renderEffectCategory('🦄 Fantastique', fantasyEffects, '🦄')}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.generationView}>
          <GlassCard style={styles.selectedEffectCard}>
            <View style={styles.selectedEffectHeader}>
              <View style={styles.selectedEffectInfo}>
                <Text style={styles.selectedEffectEmoji}>{selectedEffect.emoji}</Text>
                <View>
                  <Text style={styles.selectedEffectName}>{selectedEffect.name}</Text>
                  <Text style={styles.selectedEffectDescription}>
                    {selectedEffect.description}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.changeEffectButton}
                onPress={() => setSelectedEffect(null)}
              >
                <Text style={styles.changeEffectText}>Changer</Text>
              </TouchableOpacity>
            </View>

            {selectedEffect.requiresImage && (
              <View style={styles.imageUploadSection}>
                <Text style={styles.sectionLabel}>Image de référence</Text>
                {referenceImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: referenceImage }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={handleRemoveImage}
                    >
                      <X size={18} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleImportImage}
                  >
                    <Upload size={32} color={COLORS.purple400} />
                    <Text style={styles.uploadButtonText}>
                      Importer une photo
                    </Text>
                    <Text style={styles.uploadButtonSubtext}>
                      Requis pour cet effet
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <GradientButton
              onPress={handleGenerate}
              title={isGenerating ? 'Génération en cours...' : 'Générer la vidéo'}
              icon={
                isGenerating ? (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Zap size={20} color={COLORS.textPrimary} />
                  </Animated.View>
                ) : (
                  <Zap size={20} color={COLORS.textPrimary} />
                )
              }
              disabled={isGenerating || (selectedEffect.requiresImage && !referenceImage)}
              style={styles.generateButton}
            />

            {isGenerating && (
              <View style={styles.progressSection}>
                <Text style={styles.statusMessage}>{progress || 'Préparation...'}</Text>
                <View style={styles.progressBarContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {result?.video?.url && !isGenerating && (
              <View style={styles.resultSection}>
                <Text style={styles.resultLabel}>Vidéo générée 🎉</Text>

                <View style={styles.videoContainer}>
                  <Video
                    source={{ uri: result.video.url }}
                    style={styles.video}
                    useNativeControls
                    resizeMode="contain"
                    isLooping
                  />
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleDownload}
                  >
                    <Download size={20} color={COLORS.purple400} />
                    <Text style={styles.actionButtonText}>Télécharger</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleShare}
                  >
                    <Share size={20} color={COLORS.purple400} />
                    <Text style={styles.actionButtonText}>Partager</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </GlassCard>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  selectionView: {
    gap: 16,
  },
  headerCard: {
    marginBottom: 4,
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoriesScroll: {
    maxHeight: 440,
    paddingBottom: 8,
  },
  categorySection: {
    marginBottom: 24,
    gap: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  categoryCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  effectsScroll: {
    paddingRight: 20,
    gap: 12,
  },
  effectCard: {
    width: 140,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.borderSubtle,
  },
  effectCardSelected: {
    borderColor: COLORS.purple500,
  },
  effectCardGradient: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  effectEmoji: {
    fontSize: 36,
  },
  effectName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  effectNameSelected: {
    color: COLORS.textPrimary,
  },
  requiresImageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  requiresImageText: {
    fontSize: 10,
    color: COLORS.purple300,
    fontWeight: '500',
  },
  generationView: {
    gap: 16,
  },
  selectedEffectCard: {
    gap: 20,
  },
  selectedEffectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectedEffectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectedEffectEmoji: {
    fontSize: 48,
  },
  selectedEffectName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectedEffectDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  changeEffectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  changeEffectText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.purple400,
  },
  imageUploadSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  imagePreviewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 160,
    height: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.borderSubtle,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.purple400,
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  generateButton: {
    marginTop: 8,
  },
  progressSection: {
    gap: 12,
  },
  statusMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: COLORS.borderSubtle,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.purple500,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  resultSection: {
    gap: 16,
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.purple400,
  },
});
