import React from 'react';
import { Text, View, useColorScheme } from 'react-native';

import { splitWordToOrp } from '@/utils/orp';

export function OrpWord({ word }: { word: string }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';
  const { prefix, focus, suffix } = splitWordToOrp(word);

  return (
    <View className="items-center justify-center px-4">
      <Text
        allowFontScaling
        className="text-[54px] font-semibold tracking-[-1.5px]"
        style={{ color: isDark ? '#F8FAFC' : '#0F172A', fontFamily: 'monospace' }}
      >
        <Text style={{ color: isDark ? '#94A3B8' : '#475569' }}>{prefix}</Text>
        <Text style={{ color: isDark ? '#38BDF8' : '#E11D48' }}>{focus}</Text>
        <Text style={{ color: isDark ? '#E2E8F0' : '#1E293B' }}>{suffix}</Text>
      </Text>
    </View>
  );
}
