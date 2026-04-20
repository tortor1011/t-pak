import type { Result } from '@/repositories/common/Result';
import type {
  AdditionalChargeRule,
  PropertySettingsSnapshot,
  PropertySettingsValues,
} from '@/services/propertySettings';

export interface SettingsRepository {
  loadPropertySettings(): Result<PropertySettingsSnapshot>;
  loadActiveAdditionalChargeRules(): Result<AdditionalChargeRule[]>;
  savePropertySettings(
    values: PropertySettingsValues
  ): Result<PropertySettingsSnapshot>;
}
