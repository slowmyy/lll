import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, User, Info, CircleHelp as HelpCircle, ArrowLeft, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { runwareService, UserPlan } from '@/services/runware';
import { authService, UserCredential } from '@/services/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/Colors';
import GlassCard from '@/components/GlassCard';

export default function Profile() {
  const [userPlan, setUserPlan] = useState<UserPlan>(runwareService.getUserPlan());
  const [userCredential, setUserCredential] = useState<UserCredential | null>(null);
  const [displayName, setDisplayName] = useState<string>('Utilisateur');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const credential = await authService.getUserCredential();
      const name = await authService.getDisplayName();
      setUserCredential(credential);
      setDisplayName(name);
    } catch (error) {
      console.error('Erreur chargement info utilisateur:', error);
    }
  };
  const handleUpgradeToPremium = () => {
    if (userPlan.isPremium) {
      // For testing purposes, allow downgrading back to free
      runwareService.downgradeToFree();
      setUserPlan(runwareService.getUserPlan());
      Alert.alert(
        'Downgraded to Free',
        'You are now using the free Flux Schnell model.',
        [{ text: 'OK' }]
      );
    } else {
      runwareService.upgradeToPremium();
      setUserPlan(runwareService.getUserPlan());
      Alert.alert(
        'Upgraded to Premium!',
        'You now have access to the Juggernaut Pro model with higher quality generations.',
        [{ text: 'Awesome!' }]
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };
  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    isPremium = false 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    isPremium?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, isPremium && styles.premiumSettingItem]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, isPremium && styles.premiumSettingTitle]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {isPremium && (
        <Crown size={20} color={COLORS.warning} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={COLORS.gradientBackground} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userCredential?.isGuest ? (
              <User size={32} color={COLORS.textSecondary} />
            ) : (
              <User size={32} color={COLORS.purple300} />
            )}
          </View>
          <Text style={styles.title}>{displayName}</Text>
          <Text style={styles.subtitle}>
            {userCredential?.isGuest ? 'Mode invité' : 'Compte connecté'}
          </Text>
        </View>

        {/* Current Plan Status */}
        <View style={styles.planSection}>
          <Text style={styles.sectionTitle}>Abonnement Actuel</Text>
          <GlassCard style={styles.planCard}>
            <View style={styles.planHeader}>
              {userPlan.isPremium && <Crown size={24} color={COLORS.purple300} />}
              <Text style={styles.planName}>
                {userPlan.isPremium ? 'Premium' : 'Gratuit'}
              </Text>
            </View>
            <Text style={styles.planModel}>Modèle: {userPlan.displayName}</Text>
            <Text style={styles.planDescription}>
              {userPlan.isPremium
                ? 'Générations haute qualité avec le modèle Juggernaut Pro'
                : 'Générations rapides avec le modèle Flux Schnell'}
            </Text>
          </GlassCard>
        </View>

        {/* Account Options */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Compte</Text>
          
          <SettingItem
            icon={<Crown size={24} color={userPlan.isPremium ? COLORS.purple300 : COLORS.purple400} />}
            title={userPlan.isPremium ? "Passer en Gratuit" : "Passer Premium"}
            subtitle={userPlan.isPremium 
              ? "Revenir au modèle gratuit" 
              : "Débloquez le modèle IA haute qualité"
            }
            onPress={handleUpgradeToPremium}
            isPremium={!userPlan.isPremium}
          />

          <SettingItem
            icon={<User size={24} color={COLORS.textSecondary} />}
            title="Paramètres du compte"
            subtitle="Gérez votre profil et vos préférences"
          />
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingItem
            icon={<HelpCircle size={24} color={COLORS.textSecondary} />}
            title="Aide & Support"
            subtitle="Obtenez de l'aide et contactez le support"
          />

          <SettingItem
            icon={<Info size={24} color={COLORS.textSecondary} />}
            title="À propos de Genly"
            subtitle="Version 2.0.0"
          />

          <SettingItem
            icon={<LogOut size={24} color={COLORS.error} />}
            title="Déconnexion"
            subtitle={userCredential?.isGuest ? "Quitter le mode invité" : "Se déconnecter du compte"}
            onPress={handleSignOut}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(2, 6, 23, 0.4)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  profileSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 48,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  planSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  planCard: {
    gap: 8,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  planModel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  settingsSection: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    gap: 12,
  },
  premiumSettingItem: {
    borderColor: COLORS.borderActive,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  settingContent: {
    flex: 1,
    gap: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  premiumSettingTitle: {
    color: COLORS.purple300,
  },
  settingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

