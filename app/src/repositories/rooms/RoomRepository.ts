import type { Result } from '@/repositories/common/Result';
import type { Room } from '@/types/room';

export interface RoomRepository {
  listRooms(): Result<Room[]>;
}
