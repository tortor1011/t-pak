/**
 * Global test setup for Vitest component tests (jsdom environment).
 * Extends Vitest's `expect` with @testing-library/jest-dom matchers
 * such as .toBeInTheDocument(), .toBeVisible(), .toHaveValue(), etc.
 */
import '@testing-library/jest-dom/vitest';
