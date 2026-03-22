export const STORAGE_KEYS = {
  session: 'rsvp-reader/session'
};

export type ReaderSession = {
  sourceLabel: string;
  sourceText: string;
  wpm: number;
  index: number;
};
