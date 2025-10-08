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
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera,
  CreditCard,
  Star,
  RotateCcw,
  Package,
  Upload,
  Download,
  Share,
  ArrowLeft,
  Sparkles
} from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import GlassCard from '@/components/GlassCard';
import GradientButton from '@/components/GradientButton';
import { runwareService } from '@/services/runware';
import { storageService } from '@/services/storage';

interface Effect {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  backgroundColor: string;
  slots: number;
  prompt: string;
  gradientColors: [string, string];
}

const EFFECTS: Effect[] = [
  {
    id: 'celebrity',
    title: 'Celebrity IA',
    description: 'Avec une star',
    icon: Star,
    color: '#F59E0B',
    backgroundColor: '#FFFBEB',
    gradientColors: ['#F59E0B', '#FB923C'],
    slots: 2,
    prompt: 'Take a photo taken with a Polaroid camera. The photo should look like an ordinary photograph, without an explicit subject or property. The photo should have a slight blur and a consistent light source, like a flash from a dark room, scattered throughout the photo. Don\'t change the face. Change the background behind those two people with white curtains. With that boy standing next to me.',
  },
  {
    id: 'footballcard',
    title: 'Football Card',
    description: 'Carte de joueur',
    icon: CreditCard,
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    gradientColors: ['#34D399', '#10B981'],
    slots: 1,
    prompt: 'Transforme le personnage en joueur de football style rendu AAA. Pose 3/4 dynamique sur pelouse de stade nocturne. Maillot générique (couleurs personnalisées) sans blason ni sponsor réels. Crée aussi une carte joueur type "Ultimate" avec note globale, poste, et 6 stats (PAC, SHO, PAS, DRI, DEF, PHY) - valeurs fictives. Sur l\'écran d\'ordinateur, montre l\'interface de création de la carte (avant→après). Détails sueur/herbe, DOF léger. Aucune marque officielle. Très haute définition.'
  },
  {
    id: 'polaroid',
    title: 'Polaroid',
    description: 'Style vintage',
    icon: Camera,
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    gradientColors: ['#60A5FA', '#3B82F6'],
    slots: 2,
    prompt: 'Create an image, Take a photo taken with a Polaroid camera. The photo should look like an ordinary photograph, without an explicit subject or property. The photo should have a slight blur and a a dark consistent light source, like a flash from room, scattered throughout the photo. Don\'t Change the face. Change the background behind those two people with White curtains. With me hugging my young self'
  },
  {
    id: 'restoration',
    title: 'Photo-Restauration',
    description: 'Réparer une photo',
    icon: RotateCcw,
    color: '#8B5CF6',
    backgroundColor: '#F3E8FF',
    gradientColors: ['#C084FC', '#8B5CF6'],
    slots: 1,
    prompt: 'Restore and colorize this vintage photograph with ultra-realism. Keep the exact same people, outfits, poses, and background without alteration. Transform the capture as if it were taken today by a professional portrait photographer with high-end modern equipment. Apply vibrant, cinematic color grading with deep saturation, balanced contrast, and studio-level lighting. Sharpen details, enhance textures, and improve clarity while preserving authenticity and natural appearance. High-definition, photorealistic, professional quality.'
  },
  {
    id: 'figurine',
    title: 'Figurine AI',
    description: 'Créer une figurine',
    icon: Package,
    color: '#059669',
    backgroundColor: '#F0FDF4',
    gradientColors: ['#34D399', '#22D3EE'],
    slots: 1,
    prompt: 'Crée une figurine commercialisée à l\'échelle 1/7 des personnages de l\'image, dans un style réaliste et dans un environnement réel. La figurine est posée sur un bureau d\'ordinateur. Elle possède un socle rond en acrylique transparent, sans aucun texte sur le socle. Le contenu affiché sur l\'écran d\'ordinateur est le processus de modélisation 3D de cette figurine. À côté de l\'écran se trouve une boite d\'emballage du jouet, conçue dans un style évoquant les figurines de collection haut de gamme, imprimée avec des illustrations originales. L\'emballage présente des illustrations 2D à plat.'
  },
  {
    id: 'homeless',
    title: 'Homeless Prank',
    description: 'Ajouter un SDF',
    icon: Sparkles,
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    gradientColors: ['#F97316', '#EF4444'],
    slots: 1,
    prompt: 'Inpaint a realistic homeless person (adult) naturally integrated into the uploaded photo. The person must match the original camera perspective, lighting, colors, shadows and grain. Placement: context-appropriate (e.g., if indoors → sleeping in bed or sitting against wall; if outdoors → standing by the door, leaning on steps). Appearance: worn but neutral clothing (hoodie, jacket, scarf, beanie, old backpack). Clothing must not contain logos, text, or offensive elements. Skin tone, gender, and age can adapt to the scene for maximum realism. Preserve all other details of the original photo unchanged. Final result must be photorealistic, ultra-detailed, natural skin texture, no sharp edges or cutouts.'
  }
];

export default function ImageEffects() {
  const [selectedEffect, setSelectedEffect] = useState<Effect | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{ [key: number]: string }>({});
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isGenerating) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }

    pulseAnim.setValue(1);
  }, [isGenerating, pulseAnim]);

  const handleEffectSelect = (effect: Effect) => {
    setSelectedEffect(effect);
    setUploadedImages({});
    setGeneratedImage(null);
    setError(null);
  };

  const handleBackToGallery = () => {
    setSelectedEffect(null);
    setUploadedImages({});
    setGeneratedImage(null);
    setError(null);
  };

  const handleImageUpload = async (slotIndex: number) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission requise', 'L\'accès à la galerie est nécessaire pour importer une image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedImages(prev => ({
          ...prev,
          [slotIndex]: result.assets[0].uri
        }));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      Alert.alert('Erreur', 'Impossible d\'importer l\'image. Veuillez réessayer.');
    }
  };

  const handleGenerate = async () => {
    if (!selectedEffect) return;

    const requiredImages = Object.keys(uploadedImages).length;
    if (requiredImages < selectedEffect.slots) {
      Alert.alert('Images manquantes', `Veuillez ajouter ${selectedEffect.slots} image(s) pour continuer.`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const referenceImages = Object.values(uploadedImages);
      const referenceImage = selectedEffect.slots === 1 ? referenceImages[0] : undefined;

      const imageUrl = await runwareService.generateImage(selectedEffect.prompt, {
        referenceImage,
        referenceImages: selectedEffect.slots > 1 ? referenceImages : undefined,
        model: 'gemini-2.5-flash-image'
      });

      setGeneratedImage(imageUrl);

      await storageService.saveImage({
        url: imageUrl,
        prompt: selectedEffect.prompt,
        timestamp: Date.now(),
        model: 'Gemini 2.5 Flash Image',
        format: selectedEffect.title,
        style: selectedEffect.description,
      });

    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la génération.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const filename = `genly-${selectedEffect?.id}-${Date.now()}.png`;
      await storageService.downloadImage(generatedImage, filename);

      const successMessage = Platform.OS === 'web'
        ? 'Image téléchargée avec succès!'
        : 'Image sauvegardée dans votre galerie!';

      Alert.alert('Succès', successMessage);
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Impossible de télécharger l\'image');
    }
  };

  const handleShare = async () => {
    if (!generatedImage) return;

    try {
      await storageService.shareImage(generatedImage, selectedEffect?.prompt || '');

      if (Platform.OS === 'web') {
        Alert.alert('Succès', 'Image partagée avec succès!');
      }
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Impossible de partager l\'image');
    }
  };

  if (!selectedEffect) {
    return (
      <View style={styles.galleryContainer}>
        <GlassCard style={styles.galleryIntro}>
          <Text style={styles.galleryTitle}>✨ Effets Image IA</Text>
          <Text style={styles.gallerySubtitle}>
            Choisissez un effet pour transformer vos photos en créations uniques.
          </Text>
        </GlassCard>

        <View style={styles.effectsGrid}>
          {EFFECTS.map((effect) => (
            <TouchableOpacity
              key={effect.id}
              style={styles.effectCard}
              onPress={() => handleEffectSelect(effect)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={effect.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.effectIconContainer}
              >
                <effect.icon size={28} color={COLORS.textPrimary} />
              </LinearGradient>
              <Text style={styles.effectTitle}>{effect.title}</Text>
              <Text style={styles.effectDescription}>{effect.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.detailContainer}>
      <View style={[styles.detailHeader, { backgroundColor: selectedEffect.backgroundColor }]}> 
        <TouchableOpacity style={styles.backButton} onPress={handleBackToGallery}>
          <ArrowLeft size={20} color={selectedEffect.color} />
          <Text style={[styles.backButtonText, { color: selectedEffect.color }]}>Retour</Text>
        </TouchableOpacity>
        <View style={styles.detailHeaderContent}>
          <Text style={[styles.detailTitle, { color: selectedEffect.color }]}>{selectedEffect.title}</Text>
          <Text style={styles.detailSubtitle}>{selectedEffect.description}</Text>
        </View>
      </View>

      <View style={styles.detailContent}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>
            {selectedEffect.slots === 1 ? 'Ajouter une image' : 'Ajouter vos images'}
          </Text>

          <View style={styles.uploadGrid}>
            {Array.from({ length: selectedEffect.slots }, (_, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.uploadSlot, { borderColor: selectedEffect.color }]}
                onPress={() => handleImageUpload(index)}
                activeOpacity={0.85}
              >
                {uploadedImages[index] ? (
                  <Image source={{ uri: uploadedImages[index] }} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Upload size={32} color={selectedEffect.color} />
                    <Text style={[styles.uploadText, { color: selectedEffect.color }]}> 
                      {selectedEffect.id === 'figurine' ? 'Ajouter une image' : `Image ${index + 1}`}
                    </Text>
                    {selectedEffect.id === 'figurine' && (
                      <Text style={styles.uploadSubtext}>Pour créer votre figurine</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <GradientButton
          onPress={handleGenerate}
          title={isGenerating ? 'Génération en cours...' : `Créer ${selectedEffect.title}`}
          icon={
            isGenerating ? (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
              </Animated.View>
            ) : (
              <Sparkles size={20} color={COLORS.textPrimary} />
            )
          }
          disabled={isGenerating || Object.keys(uploadedImages).length < selectedEffect.slots}
        />

        {generatedImage && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>
              {selectedEffect.id === 'figurine' ? 'Votre figurine est prête !' : 'Résultat'}
            </Text>

            <GlassCard
              style={[
                styles.resultContainer,
                selectedEffect.id === 'figurine' && styles.figurineShowcase
              ]}
            >
              <Image source={{ uri: generatedImage }} style={styles.resultImage} />

              {selectedEffect.id === 'figurine' && (
                <View style={styles.figurineDetails}>
                  <Text style={styles.figurineTitle}>Figurine de Collection</Text>
                  <Text style={styles.figurineSpecs}>Échelle 1/7 • Style Réaliste</Text>
                  <Text style={styles.figurineDescription}>
                    Figurine haute qualité avec socle acrylique et emballage premium
                  </Text>
                </View>
              )}
            </GlassCard>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
                <Download size={20} color={selectedEffect.color} />
                <Text style={[styles.actionButtonText, { color: selectedEffect.color }]}>Télécharger</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share size={20} color={selectedEffect.color} />
                <Text style={[styles.actionButtonText, { color: selectedEffect.color }]}>Partager</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  galleryContainer: {
    gap: 24,
  },
  galleryIntro: {
    gap: 12,
    alignItems: 'center',
  },
  galleryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  gallerySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  effectCard: {
    width: '48%',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  effectIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  effectDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  detailContainer: {
    gap: 24,
  },
  detailHeader: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailHeaderContent: {
    flex: 1,
    gap: 4,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  detailSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailContent: {
    gap: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  uploadSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  uploadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  uploadSlot: {
    width: 150,
    height: 150,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  resultSection: {
    alignItems: 'center',
    gap: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  resultContainer: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  figurineShowcase: {
    padding: 28,
  },
  resultImage: {
    width: 260,
    height: 260,
    borderRadius: 16,
  },
  figurineDetails: {
    alignItems: 'center',
    gap: 6,
  },
  figurineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  figurineSpecs: {
    fontSize: 14,
    color: COLORS.purple300,
    fontWeight: '500',
  },
  figurineDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.purple300,
  },
});
