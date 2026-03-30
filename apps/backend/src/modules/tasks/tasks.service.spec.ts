import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { SupabaseService } from '../../database/supabase.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const TOKEN = 'test-token';

const mockUserClient = { from: jest.fn() };
const mockSupabaseService = {
  getClient: jest.fn(),
  getUserClient: jest.fn().mockReturnValue(mockUserClient),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();
    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
    mockSupabaseService.getUserClient.mockReturnValue(mockUserClient);
  });

  const makeChain = (result: {
    data: unknown;
    error: { message: string } | null;
  }) => {
    const q = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue(result),
      single: jest.fn().mockResolvedValue(result),
    };
    mockUserClient.from.mockReturnValue(q);
    return q;
  };

  describe('findByProject', () => {
    it('throws NotFoundException when project not found', async () => {
      makeChain({ data: null, error: { message: 'not found' } });
      await expect(service.findByProject('p1', 'user1', TOKEN)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns tasks when project exists', async () => {
      let callCount = 0;
      const q = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1)
            return Promise.resolve({ data: { id: 'p1' }, error: null });
          return Promise.resolve({ data: null, error: null });
        }),
        order: jest.fn().mockResolvedValue({
          data: [{ id: 't1', title: 'Task' }],
          error: null,
        }),
      };
      mockUserClient.from.mockReturnValue(q);

      const result = await service.findByProject('p1', 'user1', TOKEN);
      expect(result).toEqual([{ id: 't1', title: 'Task' }]);
    });
  });

  describe('create', () => {
    it('throws NotFoundException when project not found', async () => {
      makeChain({ data: null, error: { message: 'not found' } });
      await expect(
        service.create({ title: 'T', project_id: 'p1' }, 'user1', TOKEN),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException on insert error', async () => {
      let callCount = 0;
      const q = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1)
            return Promise.resolve({ data: { id: 'p1' }, error: null });
          return Promise.resolve({
            data: null,
            error: { message: 'insert failed' },
          });
        }),
      };
      mockUserClient.from.mockReturnValue(q);
      await expect(
        service.create({ title: 'T', project_id: 'p1' }, 'user1', TOKEN),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when task not found', async () => {
      makeChain({ data: null, error: { message: 'not found' } });
      await expect(
        service.update('t1', { title: 'X' }, 'user1', TOKEN),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when task not found', async () => {
      makeChain({ data: null, error: { message: 'not found' } });
      await expect(service.remove('t1', 'user1', TOKEN)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns success message when task deleted', async () => {
      let callCount = 0;
      const q = {
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1)
            return Promise.resolve({ data: { id: 't1' }, error: null });
          return Promise.resolve({ data: null, error: null });
        }),
      };
      // delete chain resolves with no error
      const deleteQ = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      mockUserClient.from
        .mockReturnValueOnce(q) // first call: ownership check
        .mockReturnValueOnce(deleteQ); // second call: delete
      const result = await service.remove('t1', 'user1', TOKEN);
      expect(result).toEqual({ message: 'Task deleted successfully' });
    });
  });
});
