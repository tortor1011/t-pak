import { err, ok, type Result } from '@/repositories/common/Result';
import type { RoomRepository } from '@/repositories/rooms/RoomRepository';
import { MOCK_ROOMS } from '@/services/mockData';
import { buildOwnerRooms } from '@/services/ownerRooms';
import type { Room } from '@/types/room';

export class MockRoomRepository implements RoomRepository {
  listRooms(): Result<Room[]> {
    try {
      const rooms = buildOwnerRooms(MOCK_ROOMS);
      return ok(rooms);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load rooms from mock repository.',
        details: error,
      });
    }
  }
}
