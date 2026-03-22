import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const punctuationPause = /[,:;.!?]$/;

function getWordDelay(word: string, wpm: number) {
  const baseDelay = Math.max(60, Math.round(60000 / wpm));
  const cleanLength = word.replace(/[^\p{L}\p{N}]/gu, '').length;
  const longWordFactor = cleanLength >= 9 ? 1.35 : cleanLength >= 6 ? 1.15 : 1;
  const punctuationFactor = punctuationPause.test(word) ? 1.75 : 1;
  return Math.round(baseDelay * longWordFactor * punctuationFactor);
}

export function useRsvpPlayer(words: string[], initialWpm = 320) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(initialWpm);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clampedIndex = Math.min(index, Math.max(words.length - 1, 0));
  const currentWord = useMemo(() => words[clampedIndex] ?? 'Focus', [clampedIndex, words]);
  const progress = words.length ? clampedIndex / Math.max(words.length - 1, 1) : 0;

  useEffect(() => {
    if (index !== clampedIndex) {
      setIndex(clampedIndex);
    }
  }, [clampedIndex, index]);

  useEffect(() => {
    clearTimer();
    if (!isPlaying || words.length === 0) return;

    timerRef.current = setTimeout(() => {
      setIndex((prev) => {
        if (prev >= words.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, getWordDelay(currentWord, wpm));

    return clearTimer;
  }, [clearTimer, currentWord, isPlaying, words.length, wpm]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const rewind = useCallback((amount = 10) => {
    setIndex((prev) => Math.max(prev - amount, 0));
    setIsPlaying(false);
  }, []);

  const forward = useCallback((amount = 10) => {
    setIndex((prev) => Math.min(prev + amount, Math.max(words.length - 1, 0)));
    setIsPlaying(false);
  }, [words.length]);

  const restart = useCallback(() => {
    setIndex(0);
    setIsPlaying(false);
  }, []);

  return {
    currentWord,
    forward,
    index: clampedIndex,
    isPlaying,
    progress,
    restart,
    rewind,
    setIndex,
    setIsPlaying,
    setWpm,
    total: words.length,
    wpm
  };
}
