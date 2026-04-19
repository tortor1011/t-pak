import type { RoomRepository } from '@/repositories/rooms/RoomRepository';
import type { BillingRepository } from '@/repositories/billing/BillingRepository';
import type { SettingsRepository } from '@/repositories/settings/SettingsRepository';
import { MockBillingRepository } from '@/repositories/adapters/mock/MockBillingRepository';
import { MockRoomRepository } from '@/repositories/adapters/mock/MockRoomRepository';
import { MockSettingsRepository } from '@/repositories/adapters/mock/MockSettingsRepository';

export interface Repositories {
  roomRepository: RoomRepository;
  billingRepository: BillingRepository;
  settingsRepository: SettingsRepository;
}

let activeRepositories: Repositories = {
  roomRepository: new MockRoomRepository(),
  billingRepository: new MockBillingRepository(),
  settingsRepository: new MockSettingsRepository(),
};

export function getRepositories(): Repositories {
  return activeRepositories;
}

export function setRepositories(repositories: Repositories): void {
  activeRepositories = repositories;
}
