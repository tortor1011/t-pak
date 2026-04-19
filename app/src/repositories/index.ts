import type { RoomRepository } from '@/repositories/rooms/RoomRepository';
import type { BillingRepository } from '@/repositories/billing/BillingRepository';
import type { SettingsRepository } from '@/repositories/settings/SettingsRepository';
import type { ComplaintsRepository } from '@/repositories/complaints/ComplaintsRepository';
import type { ReportsRepository } from '@/repositories/reports/ReportsRepository';
import type { DeliveryRepository } from '@/repositories/deliveries/DeliveryRepository';
import type { VehicleRepository } from '@/repositories/vehicles/VehicleRepository';
import type { NotificationRepository } from '@/repositories/notifications/NotificationRepository';
import { MockBillingRepository } from '@/repositories/adapters/mock/MockBillingRepository';
import { MockComplaintsRepository } from '@/repositories/adapters/mock/MockComplaintsRepository';
import { MockDeliveryRepository } from '@/repositories/adapters/mock/MockDeliveryRepository';
import { MockNotificationRepository } from '@/repositories/adapters/mock/MockNotificationRepository';
import { MockReportsRepository } from '@/repositories/adapters/mock/MockReportsRepository';
import { MockRoomRepository } from '@/repositories/adapters/mock/MockRoomRepository';
import { MockSettingsRepository } from '@/repositories/adapters/mock/MockSettingsRepository';
import { MockVehicleRepository } from '@/repositories/adapters/mock/MockVehicleRepository';

export interface Repositories {
  roomRepository: RoomRepository;
  billingRepository: BillingRepository;
  settingsRepository: SettingsRepository;
  complaintsRepository: ComplaintsRepository;
  reportsRepository: ReportsRepository;
  deliveryRepository: DeliveryRepository;
  vehicleRepository: VehicleRepository;
  notificationRepository: NotificationRepository;
}

const notificationRepository = new MockNotificationRepository();

let activeRepositories: Repositories = {
  roomRepository: new MockRoomRepository(),
  billingRepository: new MockBillingRepository(),
  settingsRepository: new MockSettingsRepository(),
  complaintsRepository: new MockComplaintsRepository(),
  reportsRepository: new MockReportsRepository(),
  deliveryRepository: new MockDeliveryRepository(notificationRepository),
  vehicleRepository: new MockVehicleRepository(),
  notificationRepository,
};

export function getRepositories(): Repositories {
  return activeRepositories;
}

export function setRepositories(repositories: Repositories): void {
  activeRepositories = repositories;
}
