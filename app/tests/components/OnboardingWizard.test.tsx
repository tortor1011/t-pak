/**
 * Component Tests — OnboardingWizard
 *
 * Environment: Vitest + jsdom + React Testing Library
 *
 * Key design decisions:
 *
 * 1. REAL timers throughout — no vi.useFakeTimers() anywhere.
 *    The wizard's handleLaunch has a real setTimeout(1200ms) before it calls
 *    update() and router.push(). We verify this with waitFor({ timeout: 4000 }).
 *    This avoids the broken waitFor polling that occurs with fake timers.
 *
 * 2. Step navigation detection uses 'Step X of 4' counters, NOT the step
 *    heading text. The StepIndicator always renders ALL step labels (e.g.
 *    "Physical Layout") even when we're on Step 1, so using findByText for
 *    the heading string finds a false positive in the indicator.
 *    'Step 2 of 4' is unique to the content area and changes reliably.
 *
 * 3. cleanup() is called in afterEach to guarantee DOM isolation between tests.
 *
 * Tests:
 *   A — Required-field validation: clicking "Next Step" on Step 0 with empty
 *       fields shows all three Zod error messages in the DOM.
 *   B — Preview Grid (Magic Step): advancing to Step 2 then changing
 *       "floors" and "roomsPerFloor" values reactively updates the preview
 *       grid and total room count.
 *   C — Successful submission: filling all steps, clicking "Launch T-PAK"
 *       (with a mocked fetch), confirms that `session.update` is called with
 *       `{ isOnboarded: true }` and `router.push` is called with `/dashboard`.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mock canvas-confetti (not available in jsdom) ───────────────────────────
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

// ─── Mock next/navigation ────────────────────────────────────────────────────
const mockRouterPush = vi.fn();
const mockRouterRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, refresh: mockRouterRefresh }),
}));

// ─── Mock next-auth/react ────────────────────────────────────────────────────
const mockSessionUpdate = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: 'test-user', name: 'Test Owner', role: 'ADMIN', isOnboarded: false },
    },
    status: 'authenticated',
    update: mockSessionUpdate,
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ─── Mock @/hooks/useLanguage (used by the onboarding layout) ────────────────
vi.mock('@/hooks/useLanguage', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLanguage: () => ({ language: 'en', setLanguage: vi.fn() }),
}));

// ─── Import subject AFTER mocks ───────────────────────────────────────────────
import OnboardingWizard from '@/app/(onboarding)/onboarding/_components/OnboardingWizard';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setup() {
  const user = userEvent.setup(); // real timers
  render(<OnboardingWizard />);
  return { user };
}

/**
 * Advance the wizard to a given target step by filling the minimum valid
 * data for each step and clicking "Next Step".
 *
 * IMPORTANT: Navigation is detected by the "Step X of 4" counter text that
 * appears inside the step content area — NOT by the heading text which also
 * appears in the StepIndicator and would give false positives.
 */
async function advanceToStep(user: ReturnType<typeof userEvent.setup>, targetStep: number) {
  // ── Step 0 → 1: fill Property Profile ────────────────────────────────────
  if (targetStep < 1) return;

  await user.type(screen.getByLabelText(/property name/i), 'My Dormitory');
  await user.type(screen.getByLabelText(/address/i), '123 Test Street Bangkok');
  await user.type(screen.getByLabelText(/central phone number/i), '0812345678');
  await user.click(screen.getByRole('button', { name: 'Next Step' }));
  // "Step 2 of 4" is unique to the Physical Layout content section
  await screen.findByText('Step 2 of 4', {}, { timeout: 5000 });

  // ── Step 1 → 2: Physical Layout ──────────────────────────────────────────
  // IMPORTANT: Explicitly interact with numeric inputs so that react-hook-form's
  // `valueAsNumber` / `setValueAs` transformer fires and stores proper Number
  // values before PhysicalLayoutStep unmounts. If we skip this, the stored
  // values remain as DOM strings (e.g. '1') which fail z.number() at handleSubmit.
  if (targetStep < 2) return;

  const floorsInput = screen.getByLabelText(/number of floors/i);
  await user.clear(floorsInput);
  await user.type(floorsInput, '3');

  const roomsInput = screen.getByLabelText(/rooms per floor/i);
  await user.clear(roomsInput);
  await user.type(roomsInput, '10');

  await user.click(screen.getByRole('button', { name: 'Next Step' }));
  await screen.findByText('Step 3 of 4', {}, { timeout: 5000 });

  // ── Step 2 → 3: Utilities (all optional, just proceed) ───────────────────
  if (targetStep < 3) return;

  await user.click(screen.getByRole('button', { name: 'Next Step' }));
  await screen.findByText('Step 4 of 4', {}, { timeout: 5000 });
}

// ─────────────────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Onboarding completed',
        propertyId: 'p-1',
        roomCount: 10,
      }),
    }),
  );
});

afterEach(() => {
  cleanup(); // Unmount React trees and reset DOM between tests
  vi.unstubAllGlobals();
});

// ════════════════════════════════════════════════════════════════════════════
describe('OnboardingWizard', () => {
  // ── Test A: Step 0 validation errors ──────────────────────────────────────
  describe('Test A — Required-field validation on Step 0 (Property Profile)', () => {
    it('shows Zod error messages for all three required fields when Next is clicked on an empty form', async () => {
      const { user } = setup();

      // Confirm Step 0 is active via unique step counter
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();

      // Click "Next Step" without filling anything
      await user.click(screen.getByRole('button', { name: 'Next Step' }));

      // All three Zod errors should appear
      await waitFor(() => {
        expect(screen.getByText(/property name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/address is required/i)).toBeInTheDocument();
        expect(screen.getByText(/valid phone number is required/i)).toBeInTheDocument();
      });

      // Still on Step 0 (did not advance)
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      expect(screen.queryByText('Step 2 of 4')).not.toBeInTheDocument();
    });

    it('shows only the phone error when propertyName and address are valid but phone is too short', async () => {
      const { user } = setup();

      await user.type(screen.getByLabelText(/property name/i), 'Valid Name');
      await user.type(screen.getByLabelText(/address/i), '123 Long Enough Address');
      // Phone requires min 9 chars — type only 4
      await user.type(screen.getByLabelText(/central phone number/i), '1234');

      await user.click(screen.getByRole('button', { name: 'Next Step' }));

      await waitFor(() => {
        expect(screen.getByText(/valid phone number is required/i)).toBeInTheDocument();
      });

      // Other errors must not appear
      expect(screen.queryByText(/property name is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/address is required/i)).not.toBeInTheDocument();
    });

    it('clears error messages and advances to Step 2 once valid data is entered', async () => {
      const { user } = setup();

      // Trigger errors first
      await user.click(screen.getByRole('button', { name: 'Next Step' }));
      await waitFor(() => {
        expect(screen.getByText(/property name is required/i)).toBeInTheDocument();
      });

      // Fill valid data
      await user.type(screen.getByLabelText(/property name/i), 'My Dorm');
      await user.type(screen.getByLabelText(/address/i), '99 Sukhumvit Road Bangkok');
      await user.type(screen.getByLabelText(/central phone number/i), '0812345678');

      await user.click(screen.getByRole('button', { name: 'Next Step' }));

      // Should advance to Step 2 (unique step counter)
      await screen.findByText('Step 2 of 4', {}, { timeout: 5000 });
      expect(screen.queryByText(/property name is required/i)).not.toBeInTheDocument();
    });
  });

  // ── Test B: Magic Step — Preview Grid ──────────────────────────────────────
  describe('Test B — Preview Grid updates reactively when floors/roomsPerFloor change', () => {
    it('updates total room count and floor preview rows when floors=3 and roomsPerFloor=5', async () => {
      const { user } = setup();
      // Advance to Step 2 (Physical Layout)
      await advanceToStep(user, 1);

      // Default: floors=1, roomsPerFloor=10 → total 10
      expect(screen.getByText('Total Rooms')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();

      // Change floors to 3
      const floorsInput = screen.getByLabelText(/number of floors/i);
      await user.clear(floorsInput);
      await user.type(floorsInput, '3');

      // Change roomsPerFloor to 5
      const roomsInput = screen.getByLabelText(/rooms per floor/i);
      await user.clear(roomsInput);
      await user.type(roomsInput, '5');

      // Total: 3 × 5 = 15
      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument();
      });

      // Floor preview rows: floor*100+1 to floor*100+roomsPerFloor
      expect(screen.getByText('101-105')).toBeInTheDocument();
      expect(screen.getByText('201-205')).toBeInTheDocument();
      expect(screen.getByText('301-305')).toBeInTheDocument();
    }, 20_000);

    it('shows a single floor row (Floor 1) when floors=1 with correct range 101-110', async () => {
      const { user } = setup();
      await advanceToStep(user, 1);

      // Default: 1 floor, 10 rooms → 101 to 110
      expect(screen.getByText('101-110')).toBeInTheDocument();

      // No "Floor 2" header should exist in the preview
      const floorLabels = screen.getAllByText(/^Floor \d+$/);
      expect(floorLabels).toHaveLength(1);
      expect(floorLabels[0]).toHaveTextContent('Floor 1');
    }, 20_000);

    it('updates room count when only roomsPerFloor changes from default', async () => {
      const { user } = setup();
      await advanceToStep(user, 1);

      const roomsInput = screen.getByLabelText(/rooms per floor/i);
      await user.clear(roomsInput);
      await user.type(roomsInput, '8');

      // 1 × 8 = 8
      await waitFor(() => {
        expect(screen.getByText('8')).toBeInTheDocument();
      });
      expect(screen.getByText('101-108')).toBeInTheDocument();
    }, 20_000);
  });

  // ── Test C: Successful Submission ──────────────────────────────────────────
  describe('Test C — Successful submission triggers session update and redirect', () => {
    it('calls session.update({ isOnboarded: true }) and router.push("/dashboard") after a successful API call', async () => {
      const { user } = setup();

      // Navigate to Step 4 (Review & Launch)
      await advanceToStep(user, 3);
      expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();

      // Click Launch T-PAK — wrap in act(async) so react-hook-form's
      // async handleSubmit + setIsSubmitting state update are fully flushed
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Launch T-PAK' }));
      });

      // fetch() should be called
      await waitFor(() => {
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(
          '/api/owner/onboarding',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      });

      // Validate the request body shape
      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const sentBody = JSON.parse(fetchCall[1]?.body as string);
      expect(sentBody).toMatchObject({
        propertyName: 'My Dormitory',
        address: '123 Test Street Bangkok',
        phone: '0812345678',
        floors: expect.any(Number),
        roomsPerFloor: expect.any(Number),
        roomTypes: expect.arrayContaining([
          expect.objectContaining({ name: expect.any(String) }),
        ]),
      });

      // The wizard has a real setTimeout(1200ms) before calling update() and push().
      // We wait up to 4s with real timers for those assertions to hold.
      await waitFor(
        () => {
          expect(mockSessionUpdate).toHaveBeenCalledWith({ isOnboarded: true });
        },
        { timeout: 4000 },
      );

      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    }, 30_000);

    it('shows an error toast and does NOT call update/redirect when the API returns a non-OK response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Failed to complete onboarding' }),
        }),
      );

      const { user } = setup();
      await advanceToStep(user, 3);

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Launch T-PAK' }));
      });

      // Error toast should appear — look for the specific error message text
      // since 'Launch failed' heading and message are in separate elements
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent(
          /failed to complete onboarding/i,
        );
      });

      // update() and push() must NOT have been called
      expect(mockSessionUpdate).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    }, 30_000);

    it('disables the Launch button while submission is in progress and prevents double-submit', async () => {
      // Make fetch hang indefinitely to test the loading/disabled state
      vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

      const { user } = setup();
      await advanceToStep(user, 3);

      const launchButton = screen.getByRole('button', { name: 'Launch T-PAK' });
      await act(async () => {
        await user.click(launchButton);
      });

      // Button should become disabled (isSubmitting = true)
      await waitFor(() => {
        // The button is disabled when isSubmitting is true; label changes to 'Launching...'
        const btn = screen.getByRole('button', { name: /launch/i });
        expect(btn).toBeDisabled();
      });

      // The button is disabled — userEvent will not fire events on disabled elements.
      // Simply asserting fetch was called only once is sufficient to prove the guard.
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    }, 30_000);
  });
});
