import { err, ok, type Result } from '@/repositories/common/Result';
import type { SettingsRepository } from '@/repositories/settings/SettingsRepository';
import {
  type AdditionalChargeRule,
  loadPropertySettings,
  savePropertySettings,
  type PropertySettingsSnapshot,
  type PropertySettingsValues,
} from '@/services/propertySettings';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function dispatchBillingStateUpdated(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event('estate_clarity.billing_state_updated'));
}

export class MockSettingsRepository implements SettingsRepository {
  loadPropertySettings(): Result<PropertySettingsSnapshot> {
    try {
      return ok(loadPropertySettings());
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load property settings.',
        details: error,
      });
    }
  }

  loadActiveAdditionalChargeRules(): Result<AdditionalChargeRule[]> {
    try {
      const settings = loadPropertySettings();
      const activeRules = settings.additionalChargeRules.filter(
        (rule) => rule.isActive
      );

      return ok(activeRules);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load active additional-charge rules.',
        details: error,
      });
    }
  }

  savePropertySettings(
    values: PropertySettingsValues
  ): Result<PropertySettingsSnapshot> {
    try {
      const snapshot = savePropertySettings(values);
      dispatchBillingStateUpdated();

      return ok(snapshot);
    } catch (error) {
      return err({
        code: 'VALIDATION_ERROR',
        message: 'Failed to save property settings.',
        details: error,
      });
    }
  }
}
