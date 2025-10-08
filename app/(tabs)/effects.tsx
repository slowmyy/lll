import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ImageIcon, Video as VideoIcon, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProfileHeader from '@/components/ProfileHeader';
import { COLORS } from '@/constants/Colors';
import ImageEffects from '@/components/ImageEffects';
import VideoEffects from '@/components/VideoEffects';

type EffectMode = 'image' | 'video';

export default function Effects() {
  const [mode, setMode] = useState<EffectMode>('image');

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={COLORS.gradientBackground} style={styles.header}>
          <View style={styles.titleContainer}>
            <Sparkles size={28} color={COLORS.textPrimary} />
            <View>
              <Text style={styles.title}>Effets IA</Text>
              <Text style={styles.subtitle}>Transformez vos créations</Text>
            </View>
          </View>

          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'image' && styles.modeButtonActive
              ]}
              onPress={() => setMode('image')}
            >
              <ImageIcon
                size={20}
                color={mode === 'image' ? COLORS.textPrimary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'image' && styles.modeButtonTextActive
                ]}
              >
                Effets Image
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'video' && styles.modeButtonActive
              ]}
              onPress={() => setMode('video')}
            >
              <VideoIcon
                size={20}
                color={mode === 'video' ? COLORS.textPrimary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'video' && styles.modeButtonTextActive
                ]}
              >
                Effets Vidéo
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {mode === 'image' ? (
            <ImageEffects />
          ) : (
            <VideoEffects
              onVideoGenerated={(videoUrl) => {
                console.log('✅ Vidéo générée:', videoUrl);
              }}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 14,
    padding: 6,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  modeButtonTextActive: {
    color: COLORS.purple400,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
});
