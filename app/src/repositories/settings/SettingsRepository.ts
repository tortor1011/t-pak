import type { Result } from '@/repositories/common/Result';
import type {
  PropertySettingsSnapshot,
  PropertySettingsValues,
} from '@/services/propertySettings';

export interface SettingsRepository {
  loadPropertySettings(): Result<PropertySettingsSnapshot>;
  savePropertySettings(
    values: PropertySettingsValues
  ): Result<PropertySettingsSnapshot>;
}
