import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import TopAppBar, {
  TOP_APP_BAR_MOBILE_QUERY,
  isTopAppBarMobileViewport,
} from '@/components/layout/TopAppBar';

function createMediaQueryList(matches: boolean, media: string): MediaQueryList {
  return {
    matches,
    media,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
}

function attachWindowWithMatchMedia(matches: boolean): { queries: string[] } {
  const queries: string[] = [];

  Object.defineProperty(globalThis, 'window', {
    value: {
      matchMedia: (query: string) => {
        queries.push(query);
        return createMediaQueryList(matches, query);
      },
    },
    configurable: true,
    writable: true,
  });

  return { queries };
}

function detachMockWindow(): void {
  Reflect.deleteProperty(globalThis, 'window');
}

function renderTopAppBarHtml(
  props: Partial<React.ComponentProps<typeof TopAppBar>> = {}
): string {
  return renderToStaticMarkup(
    React.createElement(TopAppBar, {
      title: 'Overview',
      showNotification: false,
      ...props,
    })
  );
}

describe('TopAppBar responsive behavior', () => {
  afterEach(() => {
    detachMockWindow();
  });

  it('returns false when window is unavailable', () => {
    expect(isTopAppBarMobileViewport()).toBe(false);
  });

  it('uses the expected mobile media query to determine viewport', () => {
    const { queries } = attachWindowWithMatchMedia(true);

    expect(isTopAppBarMobileViewport()).toBe(true);
    expect(queries).toEqual([TOP_APP_BAR_MOBILE_QUERY]);
  });

  it('returns false when matchMedia is unavailable', () => {
    Object.defineProperty(globalThis, 'window', {
      value: {},
      configurable: true,
      writable: true,
    });

    expect(isTopAppBarMobileViewport()).toBe(false);
  });

  it('renders hamburger menu on mobile when showMenu is enabled and showBack is false', () => {
    attachWindowWithMatchMedia(true);

    const html = renderTopAppBarHtml({ showMenu: true, showBack: false });

    expect(html).toMatch(/>menu<\/button>/);
  });

  it('hides hamburger menu on desktop viewports', () => {
    attachWindowWithMatchMedia(false);

    const html = renderTopAppBarHtml({ showMenu: true, showBack: false });

    expect(html).not.toMatch(/>menu<\/button>/);
  });

  it('hides hamburger menu when back button is shown', () => {
    attachWindowWithMatchMedia(true);

    const html = renderTopAppBarHtml({ showMenu: true, showBack: true });

    expect(html).toContain('arrow_back');
    expect(html).not.toMatch(/>menu<\/button>/);
  });

  it('renders unread notification count when unread notifications exist', () => {
    const html = renderTopAppBarHtml({
      showNotification: true,
      notificationUnreadCount: 8,
    });

    expect(html).toContain('>8<');
  });

  it('renders notification panel content when panel is open', () => {
    const html = renderTopAppBarHtml({
      showNotification: true,
      isNotificationPanelOpen: true,
      notificationPanel: React.createElement('div', null, 'Notification Panel'),
    });

    expect(html).toContain('Notification Panel');
  });
});
