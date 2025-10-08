import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { User } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/Colors';

interface ProfileHeaderProps {
  onPress?: () => void;
}

export default function ProfileHeader({ onPress }: ProfileHeaderProps) {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/profile');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          top: insets.top + 12,
        },
      ]}
    >
      <TouchableOpacity style={styles.profileButton} onPress={handlePress} activeOpacity={0.85}>
        <LinearGradient
          colors={COLORS.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <User size={22} color={COLORS.textPrimary} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 9999,
    elevation: 9999,
    ...(Platform.OS === 'web' && {
      position: 'fixed' as any,
      transform: 'translate3d(0, 0, 0)',
      WebkitTransform: 'translate3d(0, 0, 0)',
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden',
      WebkitPerspective: '1000px',
      perspective: '1000px',
    }),
  },
  profileButton: {
    borderRadius: 24,
    padding: 2,
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    shadowColor: COLORS.purple500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
    }),
  },
  gradient: {
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
});
