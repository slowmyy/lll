import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Image, Video, FolderOpen, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.purple500,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: COLORS.bgPrimary,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderSubtle,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 16,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={COLORS.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Image',
          tabBarIcon: ({ size, color }) => <Image size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          title: 'Video',
          tabBarIcon: ({ size, color }) => <Video size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ size, color }) => <FolderOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="effects"
        options={{
          title: 'Effets',
          tabBarIcon: ({ size, color }) => <Sparkles size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
