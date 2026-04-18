import { MeterReading } from '@/types/billing';

const STORAGE_KEY = 'estate_clarity.meterReadingDrafts.v1';

export interface MeterReadingDraft {
  electric: string;
  water: string;
}

export type MeterReadingDraftMap = Record<string, MeterReadingDraft>;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isNonNegativeNumericString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.trim() === '') return true;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

function buildDefaults(readings: MeterReading[]): MeterReadingDraftMap {
  return readings.reduce<MeterReadingDraftMap>((acc, reading) => {
    acc[reading.roomId] = {
      electric: reading.electricity.current?.toString() ?? '',
      water: reading.water.current?.toString() ?? '',
    };

    return acc;
  }, {});
}

export function loadMeterReadingDrafts(readings: MeterReading[]): MeterReadingDraftMap {
  const defaults = buildDefaults(readings);

  if (!isBrowser()) {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return defaults;
    }

    return Object.entries(defaults).reduce<MeterReadingDraftMap>(
      (acc, [roomId, fallbackDraft]) => {
        const draftCandidate = (parsed as Record<string, unknown>)[roomId];

        if (!draftCandidate || typeof draftCandidate !== 'object') {
          acc[roomId] = fallbackDraft;
          return acc;
        }

        const entry = draftCandidate as Record<string, unknown>;
        const electric = isNonNegativeNumericString(entry.electric)
          ? entry.electric
          : fallbackDraft.electric;
        const water = isNonNegativeNumericString(entry.water)
          ? entry.water
          : fallbackDraft.water;

        acc[roomId] = { electric, water };
        return acc;
      },
      {}
    );
  } catch {
    return defaults;
  }
}

export function saveMeterReadingDrafts(readings: MeterReadingDraftMap): void {
  if (!isBrowser()) return;

  const sanitized = Object.entries(readings).reduce<MeterReadingDraftMap>((acc, [roomId, draft]) => {
    const electric = isNonNegativeNumericString(draft.electric) ? draft.electric : '';
    const water = isNonNegativeNumericString(draft.water) ? draft.water : '';

    acc[roomId] = { electric, water };
    return acc;
  }, {});

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
}

export function parseReadingInput(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}
