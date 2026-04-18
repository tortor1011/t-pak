import {
  loadPropertySettings,
  type AdditionalChargeRule,
} from '@/services/propertySettings';
import { Room } from '@/types/room';

function normalizeChargeAmount(amount: number): number {
  return Math.max(0, Math.round(amount));
}

export function calculateAdditionalChargePerRoom(
  rules: AdditionalChargeRule[]
): number {
  return normalizeChargeAmount(
    rules
      .filter((rule) => rule.isActive)
      .reduce((sum, rule) => sum + rule.amount, 0)
  );
}

export function loadAdditionalChargePerRoom(): number {
  const settings = loadPropertySettings();
  return calculateAdditionalChargePerRoom(settings.additionalChargeRules);
}

export function calculateRoomAdditionalCharge(
  room: Room,
  additionalChargePerRoom: number
): number {
  if (room.occupancy !== 'occupied') {
    return 0;
  }

  return normalizeChargeAmount(additionalChargePerRoom);
}

export function countActiveAdditionalChargeRules(
  rules: AdditionalChargeRule[]
): number {
  return rules.filter((rule) => rule.isActive).length;
}

export function loadActiveAdditionalChargeRuleCount(): number {
  const settings = loadPropertySettings();
  return countActiveAdditionalChargeRules(settings.additionalChargeRules);
}
