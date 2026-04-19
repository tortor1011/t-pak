import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_UPDATED_EVENT,
  applyLanguageToDocument,
  isLanguage,
  loadLanguagePreference,
  saveLanguagePreference,
  translate,
  type TranslationKey,
} from '@/services/i18n';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key) ?? null : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

class MockWindow extends EventTarget {
  constructor(public localStorage: Storage) {
    super();
  }
}

function attachMockWindow(localStorage: Storage): MockWindow {
  const mockWindow = new MockWindow(localStorage);

  Object.defineProperty(globalThis, 'window', {
    value: mockWindow,
    configurable: true,
    writable: true,
  });

  return mockWindow;
}

function detachMockWindow(): void {
  Reflect.deleteProperty(globalThis, 'window');
}

function attachMockDocument(): void {
  Object.defineProperty(globalThis, 'document', {
    value: {
      documentElement: {
        lang: '',
      },
    },
    configurable: true,
    writable: true,
  });
}

function detachMockDocument(): void {
  Reflect.deleteProperty(globalThis, 'document');
}

describe('i18n service', () => {
  let localStorage: MemoryStorage;

  beforeEach(() => {
    localStorage = new MemoryStorage();
  });

  afterEach(() => {
    detachMockWindow();
    detachMockDocument();
  });

  it('recognizes only supported languages', () => {
    expect(isLanguage('th')).toBe(true);
    expect(isLanguage('en')).toBe(true);
    expect(isLanguage('jp')).toBe(false);
    expect(isLanguage(null)).toBe(false);
    expect(isLanguage(undefined)).toBe(false);
  });

  it('returns default language when there is no browser window', () => {
    expect(loadLanguagePreference()).toBe(DEFAULT_LANGUAGE);
  });

  it('loads persisted language when storage value is valid', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    attachMockWindow(localStorage);

    expect(loadLanguagePreference()).toBe('en');
  });

  it('falls back to default language when storage value is invalid', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'unknown');
    attachMockWindow(localStorage);

    expect(loadLanguagePreference()).toBe(DEFAULT_LANGUAGE);
  });

  it('saves language preference and emits the language updated event', () => {
    const mockWindow = attachMockWindow(localStorage);
    const onLanguageUpdated = vi.fn();

    mockWindow.addEventListener(
      LANGUAGE_UPDATED_EVENT,
      onLanguageUpdated as EventListener
    );

    saveLanguagePreference('en');

    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(onLanguageUpdated).toHaveBeenCalledTimes(1);
  });

  it('applies language to the document html lang attribute', () => {
    attachMockWindow(localStorage);
    attachMockDocument();

    applyLanguageToDocument('en');

    expect(document.documentElement.lang).toBe('en');
  });

  it('interpolates translation params in the target language', () => {
    expect(translate('dashboard.ofRooms', 'en', { total: 12 })).toBe(
      'of 12 rooms'
    );
    expect(translate('roomDetail.title', 'th', { room: '205' })).toBe(
      'รายละเอียดห้อง 205'
    );
  });

  it('resolves new billing generate delivery keys in both languages', () => {
    expect(translate('generate.deliveryMode', 'th')).toBe('วิธีส่งบิล');
    expect(translate('generate.tabOnlineDelivery', 'th')).toBe('ส่งบิลออนไลน์');
    expect(translate('generate.sendOnlineCta', 'en')).toBe(
      'Generate and Send Online Bills'
    );
    expect(translate('generate.printPdfCta', 'en')).toBe(
      'Generate and Print PDF Bills'
    );
  });

  it('returns the key when translation key is missing in all dictionaries', () => {
    const missingKey = 'missing.translation.key' as unknown as TranslationKey;

    expect(translate(missingKey, 'en')).toBe(
      'missing.translation.key'
    );
  });
});
