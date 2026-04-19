import { err, ok, type Result } from '@/repositories/common/Result';
import type { SettingsRepository } from '@/repositories/settings/SettingsRepository';
import {
  loadPropertySettings,
  savePropertySettings,
  type PropertySettingsSnapshot,
  type PropertySettingsValues,
} from '@/services/propertySettings';

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

  savePropertySettings(
    values: PropertySettingsValues
  ): Result<PropertySettingsSnapshot> {
    try {
      return ok(savePropertySettings(values));
    } catch (error) {
      return err({
        code: 'VALIDATION_ERROR',
        message: 'Failed to save property settings.',
        details: error,
      });
    }
  }
}
