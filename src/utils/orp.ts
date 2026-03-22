export type OrpSlice = {
  prefix: string;
  focus: string;
  suffix: string;
  pivotIndex: number;
};

const pivotMap = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4];

export function getPivotIndex(word: string) {
  const cleanWord = word.replace(/\s+/g, '');
  if (!cleanWord.length) return 0;
  if (cleanWord.length < pivotMap.length) return pivotMap[cleanWord.length];
  return 3;
}

export function splitWordToOrp(word: string): OrpSlice {
  const pivotIndex = Math.min(getPivotIndex(word), Math.max(word.length - 1, 0));
  return {
    prefix: word.slice(0, pivotIndex),
    focus: word.charAt(pivotIndex) || '',
    suffix: word.slice(pivotIndex + 1),
    pivotIndex
  };
}

export function tokenizeText(input: string) {
  return input
    .replace(/\r\n/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}
