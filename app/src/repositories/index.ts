import type { RoomRepository } from '@/repositories/rooms/RoomRepository';
import type { BillingRepository } from '@/repositories/billing/BillingRepository';
import type { SettingsRepository } from '@/repositories/settings/SettingsRepository';
import type { ComplaintsRepository } from '@/repositories/complaints/ComplaintsRepository';
import type { ReportsRepository } from '@/repositories/reports/ReportsRepository';
import { MockBillingRepository } from '@/repositories/adapters/mock/MockBillingRepository';
import { MockComplaintsRepository } from '@/repositories/adapters/mock/MockComplaintsRepository';
import { MockReportsRepository } from '@/repositories/adapters/mock/MockReportsRepository';
import { MockRoomRepository } from '@/repositories/adapters/mock/MockRoomRepository';
import { MockSettingsRepository } from '@/repositories/adapters/mock/MockSettingsRepository';

export interface Repositories {
  roomRepository: RoomRepository;
  billingRepository: BillingRepository;
  settingsRepository: SettingsRepository;
  complaintsRepository: ComplaintsRepository;
  reportsRepository: ReportsRepository;
}

let activeRepositories: Repositories = {
  roomRepository: new MockRoomRepository(),
  billingRepository: new MockBillingRepository(),
  settingsRepository: new MockSettingsRepository(),
  complaintsRepository: new MockComplaintsRepository(),
  reportsRepository: new MockReportsRepository(),
};

export function getRepositories(): Repositories {
  return activeRepositories;
}

export function setRepositories(repositories: Repositories): void {
  activeRepositories = repositories;
}
