// @vitest-environment jsdom

import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage';
import {
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_UPDATED_EVENT,
} from '@/services/i18n';

interface MountedProbe {
  clickSetEn: () => Promise<void>;
  clickSetTh: () => Promise<void>;
  readLanguage: () => string;
  readTitle: () => string;
}

const mountedRoots: Array<{ root: Root; container: HTMLDivElement }> = [];

function queryRequiredText(container: HTMLElement, selector: string): string {
  const element = container.querySelector(selector);

  if (!element || !element.textContent) {
    throw new Error(`Could not find element for selector: ${selector}`);
  }

  return element.textContent;
}

function queryRequiredElement(
  container: HTMLElement,
  selector: string
): HTMLElement {
  const element = container.querySelector(selector);

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Could not find button for selector: ${selector}`);
  }

  return element;
}

function LanguageProbe({ id }: { id: string }) {
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    // Keep this side-effect so tests can verify language propagation to document.
    document.body.setAttribute(`data-probe-${id}`, language);
  }, [id, language]);

  return (
    <div data-testid={`${id}-root`}>
      <span data-testid={`${id}-language`}>{language}</span>
      <span data-testid={`${id}-title`}>{t('common.appTitle')}</span>
      <button
        type="button"
        data-testid={`${id}-set-en`}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
      <button
        type="button"
        data-testid={`${id}-set-th`}
        onClick={() => setLanguage('th')}
      >
        TH
      </button>
    </div>
  );
}

function mountLanguageProbe(id: string): MountedProbe {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(
      <LanguageProvider>
        <LanguageProbe id={id} />
      </LanguageProvider>
    );
  });

  mountedRoots.push({ root, container });

  return {
    clickSetEn: async () => {
      await act(async () => {
        queryRequiredElement(container, `[data-testid=\"${id}-set-en\"]`).click();
      });
    },
    clickSetTh: async () => {
      await act(async () => {
        queryRequiredElement(container, `[data-testid=\"${id}-set-th\"]`).click();
      });
    },
    readLanguage: () =>
      queryRequiredText(container, `[data-testid=\"${id}-language\"]`),
    readTitle: () => queryRequiredText(container, `[data-testid=\"${id}-title\"]`),
  };
}

describe('useLanguage integration', () => {
  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    window.localStorage.clear();
    document.documentElement.lang = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    for (const { root, container } of mountedRoots.splice(0)) {
      act(() => {
        root.unmount();
      });
      container.remove();
    }

    window.localStorage.clear();
    document.documentElement.lang = '';
    document.body.innerHTML = '';
  });

  it('hydrates language from localStorage and applies it to the document', () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');

    const probe = mountLanguageProbe('primary');

    expect(probe.readLanguage()).toBe('en');
    expect(probe.readTitle()).toBe('Dormitory Manager');
    expect(document.documentElement.lang).toBe('en');
  });

  it('persists language changes when toggled from provider state', async () => {
    const probe = mountLanguageProbe('primary');

    expect(probe.readLanguage()).toBe('th');

    await probe.clickSetEn();

    expect(probe.readLanguage()).toBe('en');
    expect(probe.readTitle()).toBe('Dormitory Manager');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');

    await probe.clickSetTh();

    expect(probe.readLanguage()).toBe('th');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('th');
    expect(document.documentElement.lang).toBe('th');
  });

  it('syncs multiple provider instances via the custom language updated event', async () => {
    const leftProbe = mountLanguageProbe('left');
    const rightProbe = mountLanguageProbe('right');

    expect(leftProbe.readLanguage()).toBe('th');
    expect(rightProbe.readLanguage()).toBe('th');

    await leftProbe.clickSetEn();

    expect(leftProbe.readLanguage()).toBe('en');
    expect(rightProbe.readLanguage()).toBe('en');
  });

  it('syncs when storage event is received after external localStorage updates', async () => {
    const probe = mountLanguageProbe('primary');

    expect(probe.readLanguage()).toBe('th');

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');

    await act(async () => {
      window.dispatchEvent(new Event('storage'));
    });

    expect(probe.readLanguage()).toBe('en');

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'th');

    await act(async () => {
      window.dispatchEvent(new Event(LANGUAGE_UPDATED_EVENT));
    });

    expect(probe.readLanguage()).toBe('th');
  });
});
