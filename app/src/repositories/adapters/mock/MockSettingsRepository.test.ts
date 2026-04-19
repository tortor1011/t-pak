import { describe, expect, it } from 'vitest';
import { MockSettingsRepository } from '@/repositories/adapters/mock/MockSettingsRepository';

const VALID_SETTINGS = {
  electricityRate: 9,
  waterRate: 21,
  lateFee: 250,
  lateFeeDay: 6,
  additionalChargeRules: [],
};

describe('MockSettingsRepository', () => {
  it('loads property settings from repository contract', () => {
    const repository = new MockSettingsRepository();

    const result = repository.loadPropertySettings();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveProperty('electricityRate');
      expect(result.value).toHaveProperty('updatedAt');
    }
  });

  it('saves property settings via repository contract', () => {
    const repository = new MockSettingsRepository();

    const result = repository.savePropertySettings(VALID_SETTINGS);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.electricityRate).toBe(9);
      expect(result.value.waterRate).toBe(21);
    }
  });
});
