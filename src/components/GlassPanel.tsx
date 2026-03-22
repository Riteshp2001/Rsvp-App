import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, View, ViewProps } from 'react-native';

type Props = ViewProps & { intensity?: number; children: React.ReactNode };

export function GlassPanel({ children, intensity = 55, style, ...props }: Props) {
  if (Platform.OS === 'ios') {
    return (
      <View {...props} style={[{ overflow: 'hidden', borderRadius: 28 }, style]}>
        <BlurView intensity={intensity} tint="systemMaterialDark" style={{ padding: 1 }}>
          <LinearGradient
            colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 28 }}
          >
            {children}
          </LinearGradient>
        </BlurView>
      </View>
    );
  }

  return (
    <View
      {...props}
      style={[
        {
          borderRadius: 28,
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          borderWidth: 1,
          borderColor: 'rgba(148,163,184,0.14)'
        },
        style
      ]}
    >
      {children}
    </View>
  );
}
