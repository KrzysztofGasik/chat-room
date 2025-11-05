import { RoomAdminGuard } from './room-admin.guard';

describe('RoomAdminGuard', () => {
  it('should be defined', () => {
    expect(new RoomAdminGuard()).toBeDefined();
  });
});
