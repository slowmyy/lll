import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '@/constants/Colors';

interface ModernInputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export default function ModernInput({ label, icon, helperText, style, ...props }: ModernInputProps) {
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={COLORS.textTertiary}
        {...props}
      />
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 20,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
