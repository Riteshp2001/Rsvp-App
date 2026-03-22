import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, useColorScheme, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Upload } from 'lucide-react-native';

import { useRsvpPlayer } from '@/hooks/useRsvpPlayer';
import { tokenizeText } from '@/utils/orp';
import { STORAGE_KEYS, type ReaderSession } from '@/utils/storage';
import { GlassPanel } from './GlassPanel';
import { OrpWord } from './OrpWord';

const SAMPLE_TEXT = `Read with intent. Focus on one word at a time, settle on the highlighted pivot, and let the interface disappear. Then resume exactly where you left off.`;

export function ReaderScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';
  const [sourceText, setSourceText] = useState(SAMPLE_TEXT);
  const [sourceLabel, setSourceLabel] = useState('Sample text');
  const [sessionReady, setSessionReady] = useState(false);
  const words = useMemo(() => tokenizeText(sourceText), [sourceText]);
  const player = useRsvpPlayer(words);
  const chromeOpacity = useSharedValue(1);

  useEffect(() => {
    chromeOpacity.value = withTiming(player.isPlaying ? 0 : 1, { duration: 280 });
  }, [chromeOpacity, player.isPlaying]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.session);
        if (!raw) {
          setSessionReady(true);
          return;
        }
        const session = JSON.parse(raw) as ReaderSession;
        setSourceLabel(session.sourceLabel || 'Restored session');
        setSourceText(session.sourceText || SAMPLE_TEXT);
        player.setWpm(session.wpm || 320);
        player.setIndex(session.index || 0);
      } finally {
        setSessionReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    const session: ReaderSession = {
      sourceLabel,
      sourceText,
      wpm: player.wpm,
      index: player.index
    };
    AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session)).catch(() => undefined);
  }, [player.index, player.wpm, sessionReady, sourceLabel, sourceText]);

  const chromeStyle = useAnimatedStyle(() => ({
    opacity: chromeOpacity.value,
    transform: [{ translateY: withTiming(player.isPlaying ? 18 : 0, { duration: 280 }) }]
  }));

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['text/plain', 'application/pdf', 'application/epub+zip']
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setSourceLabel(asset.name);

    if (asset.mimeType === 'text/plain') {
      const text = await FileSystem.readAsStringAsync(asset.uri);
      setSourceText(text);
      player.restart();
      return;
    }

    setSourceText(`Imported ${asset.name}. The mobile port preserves the original upload flow and is ready for a native PDF or EPUB parser bridge.`);
    player.restart();
  };

  return (
    <LinearGradient
      colors={player.isPlaying ? ['#010409', '#020617'] : isDark ? ['#020617', '#0F172A'] : ['#F8FAFC', '#E2E8F0']}
      style={{ flex: 1 }}
    >
      <View className="flex-1 px-5 pb-8 pt-6">
        {!player.isPlaying && (
          <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={chromeStyle}>
            <Text className="text-xs uppercase tracking-[3px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
              RSVP Reader • Mobile port
            </Text>
            <Text className="mt-3 text-3xl font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Original-reader flow, reimagined for React Native.
            </Text>
            <Text className="mt-2 text-base leading-6" style={{ color: isDark ? '#94A3B8' : '#475569' }}>
              Focus mode, ORP emphasis, smart timing pauses, saved progress, and liquid-glass chrome on iOS.
            </Text>
          </Animated.View>
        )}

        <View className="flex-1 items-center justify-center">
          <GlassPanel style={{ width: '100%' }}>
            <View className="min-h-[300px] items-center justify-center px-6 py-8">
              <Text className="mb-6 text-xs uppercase tracking-[3px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                {sourceLabel} • {player.index + 1}/{Math.max(player.total, 1)}
              </Text>
              <OrpWord word={player.currentWord} />
              {!player.isPlaying && (
                <Animated.View entering={FadeIn.delay(100)} style={chromeStyle} className="mt-8 w-full items-center">
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Smart timing pauses around punctuation and long words.</Text>
                </Animated.View>
              )}
            </View>
          </GlassPanel>
        </View>

        {!player.isPlaying && (
          <Animated.View entering={FadeIn.delay(120)} style={chromeStyle} className="gap-4">
            <GlassPanel>
              <Pressable onPress={pickDocument} className="flex-row items-center justify-center gap-3 px-4 py-5">
                <Upload color={isDark ? '#7DD3FC' : '#E11D48'} size={18} />
                <View>
                  <Text style={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: '600' }}>Import TXT, PDF, or EPUB</Text>
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Faithful to the original upload-first reading flow.</Text>
                </View>
              </Pressable>
            </GlassPanel>

            <GlassPanel>
              <ScrollView className="max-h-[160px] rounded-[24px]">
                <TextInput
                  multiline
                  value={sourceText}
                  onChangeText={(value) => {
                    setSourceText(value);
                    setSourceLabel('Pasted text');
                    player.restart();
                  }}
                  placeholder="Paste text to start speed reading..."
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  className="min-h-[160px] px-4 py-4 text-base leading-6"
                  style={{ color: isDark ? '#E2E8F0' : '#0F172A', textAlignVertical: 'top' }}
                />
              </ScrollView>
            </GlassPanel>
          </Animated.View>
        )}

        <View className="pt-4">
          <GlassPanel>
            <View className="px-5 py-4">
              <View className="mb-4 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: isDark ? '#0F172A' : '#E2E8F0' }}>
                <View className="h-full rounded-full" style={{ width: `${Math.max(player.progress * 100, 4)}%`, backgroundColor: isDark ? '#38BDF8' : '#E11D48' }} />
              </View>

              <View className="mb-4 flex-row items-center justify-between">
                <Text style={{ color: isDark ? '#94A3B8' : '#475569' }}>Position</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: '700' }}>{player.index + 1}/{Math.max(player.total, 1)}</Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={Math.max(player.total - 1, 1)}
                step={1}
                value={player.index}
                onSlidingComplete={(value) => player.setIndex(value)}
                minimumTrackTintColor={isDark ? '#38BDF8' : '#E11D48'}
                maximumTrackTintColor={isDark ? '#1E293B' : '#CBD5E1'}
                thumbTintColor={isDark ? '#F8FAFC' : '#0F172A'}
              />

              <View className="mt-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Pressable accessibilityLabel="Rewind ten words" onPress={() => player.rewind(10)} className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: isDark ? '#111827' : '#E2E8F0' }}>
                    <RotateCcw color={isDark ? '#F8FAFC' : '#0F172A'} size={18} />
                  </Pressable>
                  <Pressable accessibilityLabel="Back one word" onPress={() => player.rewind(1)} className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: isDark ? '#111827' : '#E2E8F0' }}>
                    <ChevronLeft color={isDark ? '#F8FAFC' : '#0F172A'} size={18} />
                  </Pressable>
                  <Pressable accessibilityLabel={player.isPlaying ? 'Pause playback' : 'Play playback'} onPress={() => player.setIsPlaying(!player.isPlaying)} className="h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: isDark ? '#38BDF8' : '#E11D48' }}>
                    {player.isPlaying ? <Pause color="#FFFFFF" size={20} /> : <Play color="#FFFFFF" size={20} fill="#FFFFFF" />}
                  </Pressable>
                  <Pressable accessibilityLabel="Forward one word" onPress={() => player.forward(1)} className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: isDark ? '#111827' : '#E2E8F0' }}>
                    <ChevronRight color={isDark ? '#F8FAFC' : '#0F172A'} size={18} />
                  </Pressable>
                </View>

                <View className="ml-4 flex-1">
                  <View className="mb-1 flex-row items-center justify-between">
                    <Text style={{ color: isDark ? '#94A3B8' : '#475569' }}>Cadence</Text>
                    <Text style={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: '700' }}>{player.wpm} WPM</Text>
                  </View>
                  <Slider
                    minimumValue={100}
                    maximumValue={1000}
                    step={10}
                    value={player.wpm}
                    onValueChange={player.setWpm}
                    minimumTrackTintColor={isDark ? '#38BDF8' : '#E11D48'}
                    maximumTrackTintColor={isDark ? '#1E293B' : '#CBD5E1'}
                    thumbTintColor={isDark ? '#F8FAFC' : '#0F172A'}
                  />
                </View>
              </View>
            </View>
          </GlassPanel>
        </View>
      </View>
    </LinearGradient>
  );
}
