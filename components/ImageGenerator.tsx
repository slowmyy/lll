import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Easing,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wand2,
  Download,
  Share,
  RefreshCw,
  Crown,
  Sparkles,
  Palette,
  Play,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { runwareService } from '@/services/runware';
import { storageService } from '@/services/storage';
import ProfileHeader from '@/components/ProfileHeader';
import { COLORS } from '@/constants/Colors';

const { width: screenWidth } = Dimensions.get('window');

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
  model?: string;
  cfgScale?: number;
  negativePrompt?: string;
  format?: string;
  dimensions?: string;
  style?: string;
}

const STYLES = [
  { id: 'none', name: 'Aucun', emoji: '🎯' },
  { id: 'photorealistic', name: 'Photo', emoji: '📸' },
  { id: 'digital-art', name: 'Art Digital', emoji: '🎨' },
  { id: 'anime', name: 'Anime', emoji: '🎌' },
  { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🤖' },
  { id: 'vintage', name: 'Vintage', emoji: '📷' },
];

const FORMATS = [
  { id: 'square', name: 'Carré', width: 1024, height: 1024, emoji: '⬜', ratio: '1:1' },
  { id: 'portrait', name: 'Portrait', width: 832, height: 1280, emoji: '📱', ratio: '9:16' },
  { id: 'landscape', name: 'Paysage', width: 1280, height: 832, emoji: '🖥️', ratio: '16:9' },
];

const QUALITY_OPTIONS = [
  {
    id: 'standard',
    name: 'Standard',
    emoji: '⚡',
    description: 'Rapide et efficace',
    model: 'runware:100@1',
    modelName: 'Flux Schnell',
  },
  {
    id: 'ultra',
    name: 'Ultra',
    emoji: '💎',
    description: 'Qualité maximale',
    model: 'gemini-2.5-flash-image',
    modelName: 'Gemini 2.5 Flash',
  },
];

const INSPIRATION_PROMPTS = [
  "Un chat astronaute flottant dans l'espace avec des étoiles scintillantes",
  'Cyberpunk street scene avec des néons dans la nuit pluvieuse',
  'Jardin japonais serein avec des cerisiers en fleurs',
  'Cité sous-marine avec architecture futuriste bioluminescente',
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS[0]);
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_OPTIONS[0]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const imageOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isGenerating) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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
  }, [isGenerating, pulseAnim]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Prompt requis', 'Veuillez entrer une description pour générer une image.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setImageLoaded(false);
    setImageLoadError(false);
    imageOpacityAnim.setValue(0);
    progressAnim.setValue(0);

    try {
      const styledPrompt =
        selectedStyle.id === 'none' ? prompt : `${prompt}, ${selectedStyle.name.toLowerCase()} style`;

      let selectedModel = selectedQuality.model;
      let currentModelName = selectedQuality.modelName;

      if (referenceImage) {
        selectedModel = 'gemini-2.5-flash-image';
        currentModelName = 'Gemini 2.5 Flash (Référence)';
      }

      const params = {
        width: selectedFormat.width,
        height: selectedFormat.height,
        referenceImage: referenceImage || undefined,
        model: selectedModel,
        cfgScale: referenceImage ? 3.5 : selectedQuality.id === 'ultra' ? 3.5 : 2.5,
        negativePrompt:
          referenceImage || selectedQuality.id === 'ultra'
            ? 'blurry, low quality, distorted, deformed'
            : undefined,
      };

      const imageUrl = await runwareService.generateImage(styledPrompt, params);

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();


      const newImage: GeneratedImage = {
        url: imageUrl,
        prompt: prompt,
        timestamp: Date.now(),
        model: currentModelName,
        cfgScale: params.cfgScale,
        negativePrompt: params.negativePrompt,
        format: selectedFormat.name,
        dimensions: `${selectedFormat.width}x${selectedFormat.height}`,
        style: selectedStyle.name,
      };

      setGeneratedImage(newImage);

      await storageService.saveImage(newImage);
    } catch (error) {
      console.error('Generation error:', error);
      setError('❌ La génération a échoué. Réessayez ou modifiez votre prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRandomPrompt = () => {
    const randomPrompt = INSPIRATION_PROMPTS[Math.floor(Math.random() * INSPIRATION_PROMPTS.length)];
    setPrompt(randomPrompt);
  };

  const handleImportImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission requise', "L'accès à la galerie est nécessaire.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReferenceImage(result.assets[0].uri);
        const ultraModel = QUALITY_OPTIONS.find((q) => q.id === 'ultra');
        if (ultraModel) setSelectedQuality(ultraModel);
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'importer l'image.");
    }
  };

  return (
    <View style={styles.container}>
      <ProfileHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={COLORS.gradientBackground} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Générateur d'Images IA</Text>
            <Text style={styles.subtitle}>Créez des visuels époustouflants en secondes</Text>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['rgba(168, 85, 247, 0.1)', 'rgba(59, 130, 246, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.premiumBadge}
        >
          <View style={styles.premiumContent}>
            <LinearGradient
              colors={COLORS.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumIcon}
            >
              <Crown size={20} color={COLORS.textPrimary} />
            </LinearGradient>
            <View style={styles.premiumTextContainer}>
              <Text style={styles.premiumTitle}>{selectedQuality.modelName}</Text>
              <Text style={styles.premiumSubtitle}>{selectedQuality.description}</Text>
            </View>
          </View>
        </LinearGradient>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.mainCard}>
          <View style={styles.inputSection}>
            <View style={styles.labelRow}>
              <View style={styles.labelContainer}>
                <Wand2 size={16} color={COLORS.purple400} />
                <Text style={styles.label}>Votre prompt magique</Text>
              </View>
              <TouchableOpacity style={styles.inspirationButton} onPress={handleRandomPrompt}>
                <RefreshCw size={14} color={COLORS.purple400} />
                <Text style={styles.inspirationText}>Inspiration</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textInput}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Décrivez votre image en détail..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Qualité</Text>
            <View style={styles.qualityGrid}>
              {QUALITY_OPTIONS.map((quality) => (
                <TouchableOpacity
                  key={quality.id}
                  style={[styles.qualityCard, selectedQuality.id === quality.id && styles.qualityCardActive]}
                  onPress={() => setSelectedQuality(quality)}
                >
                  {selectedQuality.id === quality.id && (
                    <LinearGradient
                      colors={['rgba(168, 85, 247, 0.2)', 'rgba(59, 130, 246, 0.2)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  )}
                  <Text style={styles.qualityEmoji}>{quality.emoji}</Text>
                  <View style={styles.qualityTextContainer}>
                    <Text
                      style={[styles.qualityName, selectedQuality.id === quality.id && styles.qualityNameActive]}
                    >
                      {quality.name}
                    </Text>
                    <Text style={styles.qualityDesc}>{quality.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Format</Text>
            <View style={styles.formatGrid}>
              {FORMATS.map((format) => (
                <TouchableOpacity
                  key={format.id}
                  style={[styles.formatCard, selectedFormat.id === format.id && styles.formatCardActive]}
                  onPress={() => setSelectedFormat(format)}
                >
                  <Text style={styles.formatEmoji}>{format.emoji}</Text>
                  <Text style={[styles.formatName, selectedFormat.id === format.id && styles.formatNameActive]}>
                    {format.name}
                  </Text>
                  <Text style={styles.formatRatio}>{format.ratio}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Palette size={16} color={COLORS.purple400} />
              <Text style={styles.sectionLabel}>Style artistique</Text>
            </View>
            <View style={styles.styleGrid}>
              {STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[styles.styleCard, selectedStyle.id === style.id && styles.styleCardActive]}
                  onPress={() => setSelectedStyle(style)}
                >
                  <Text style={styles.styleEmoji}>{style.emoji}</Text>
                  <Text style={[styles.styleName, selectedStyle.id === style.id && styles.styleNameActive]}>
                    {style.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateGradient}
            >
              <Animated.View style={[styles.generateContent, { transform: [{ scale: pulseAnim }] }]}>
                {isGenerating ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.textPrimary} />
                    <Text style={styles.generateText}>Génération en cours...</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} color={COLORS.textPrimary} />
                    <Text style={styles.generateText}>Générer l'image</Text>
                  </>
                )}
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {(generatedImage || isGenerating) && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>
              {isGenerating ? 'Génération en cours...' : 'Image générée'}
            </Text>

            <View
              style={[
                styles.imageContainer,
                { aspectRatio: selectedFormat.width / selectedFormat.height },
              ]}
            >
              {isGenerating && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={COLORS.purple400} />
                  <Text style={styles.loadingText}>Création de votre chef-d'œuvre...</Text>
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

              {generatedImage && !isGenerating && (
                <Animated.Image
                  source={{ uri: generatedImage.url }}
                  style={[styles.generatedImage, { opacity: imageOpacityAnim }]}
                  onLoad={() => {
                    setImageLoaded(true);
                    Animated.timing(imageOpacityAnim, {
                      toValue: 1,
                      duration: 600,
                      easing: Easing.out(Easing.ease),
                      useNativeDriver: true,
                    }).start();
                  }}
                  onError={() => setImageLoadError(true)}
                  resizeMode="cover"
                />
              )}

              {imageLoadError && !isGenerating && (
                <View style={styles.imageErrorContainer}>
                  <Text style={styles.imageErrorTitle}>Impossible de charger l'image</Text>
                  <Text style={styles.imageErrorSubtitle}>Relancez une génération pour réessayer.</Text>
                </View>
              )}
            </View>

            {generatedImage && !isGenerating && imageLoaded && !imageLoadError && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Download size={18} color={COLORS.purple400} />
                  <Text style={styles.actionText}>Télécharger</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Share size={18} color={COLORS.purple400} />
                  <Text style={styles.actionText}>Partager</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.animateButton}>
                  <LinearGradient
                    colors={COLORS.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.animateGradient}
                  >
                    <Play size={16} color={COLORS.textPrimary} />
                    <Text style={styles.animateText}>Animer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 120,
  },
  header: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  headerContent: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  premiumBadge: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    overflow: 'hidden',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  premiumIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    padding: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  mainCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.bgCard,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 24,
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  inspirationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  inspirationText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.purple400,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 20,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    minHeight: 100,
  },
  qualityGrid: {
    gap: 12,
  },
  qualityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.borderSubtle,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  qualityCardActive: {
    borderColor: COLORS.purple500,
  },
  qualityEmoji: {
    fontSize: 28,
  },
  qualityTextContainer: {
    flex: 1,
  },
  qualityName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  qualityNameActive: {
    color: COLORS.purple400,
  },
  qualityDesc: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  formatGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  formatCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.borderSubtle,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    gap: 8,
  },
  formatCardActive: {
    borderColor: COLORS.purple500,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  formatEmoji: {
    fontSize: 32,
  },
  formatName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  formatNameActive: {
    color: COLORS.purple400,
  },
  formatRatio: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  styleCard: {
    width: (screenWidth - 88) / 3,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.borderSubtle,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    gap: 8,
  },
  styleCardActive: {
    borderColor: COLORS.purple500,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  styleEmoji: {
    fontSize: 28,
  },
  styleName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  styleNameActive: {
    color: COLORS.purple400,
  },
  generateButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  generateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  generateText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  resultCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.bgCard,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 24,
  },
  resultLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  imageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  imageErrorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  imageErrorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  imageErrorSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '80%',
    height: 4,
    backgroundColor: COLORS.borderSubtle,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.purple500,
  },
  generatedImage: {
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
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.purple400,
  },
  animateButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  animateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  animateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
