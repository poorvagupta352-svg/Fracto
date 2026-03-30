import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { SupabaseService } from '../../database/supabase.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const TOKEN = 'test-token';

const mockUserClient = { from: jest.fn() };
const mockSupabaseService = {
  getClient: jest.fn(),
  getUserClient: jest.fn().mockReturnValue(mockUserClient),
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();
    service = module.get<ProjectsService>(ProjectsService);
    jest.clearAllMocks();
    mockSupabaseService.getUserClient.mockReturnValue(mockUserClient);
  });

  const chain = (overrides: Record<string, jest.Mock> = {}) => {
    const base = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      ...overrides,
    };
    mockUserClient.from.mockReturnValue(base);
    return base;
  };

  describe('findAll', () => {
    it('returns projects list', async () => {
      chain({
        order: jest
          .fn()
          .mockResolvedValue({ data: [{ id: '1' }], error: null }),
      });

      const result = await service.findAll('user1', TOKEN);
      expect(result).toEqual([{ id: '1' }]);
      expect(mockSupabaseService.getUserClient).toHaveBeenCalledWith(TOKEN);
    });

    it('throws BadRequestException on error', async () => {
      chain({
        order: jest
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'fail' } }),
      });
      await expect(service.findAll('user1', TOKEN)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('returns a project', async () => {
      chain({
        single: jest.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
      });

      const result = await service.findOne('1', 'user1', TOKEN);
      expect(result).toEqual({ id: '1' });
    });

    it('throws NotFoundException when not found', async () => {
      chain({
        single: jest
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'not found' } }),
      });
      await expect(service.findOne('1', 'user1', TOKEN)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates and returns a project', async () => {
      chain({
        single: jest
          .fn()
          .mockResolvedValue({ data: { id: '1', name: 'Test' }, error: null }),
      });

      const result = await service.create({ name: 'Test' }, 'user1', TOKEN);
      expect(result).toEqual({ id: '1', name: 'Test' });
    });

    it('throws BadRequestException on insert error', async () => {
      chain({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'insert failed' },
        }),
      });
      await expect(
        service.create({ name: 'Test' }, 'user1', TOKEN),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('returns updated project', async () => {
      chain({
        single: jest.fn().mockResolvedValue({
          data: { id: '1', name: 'Updated' },
          error: null,
        }),
      });

      const result = await service.update(
        '1',
        { name: 'Updated' },
        'user1',
        TOKEN,
      );
      expect(result).toEqual({ id: '1', name: 'Updated' });
    });

    it('throws BadRequestException on update error', async () => {
      chain({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'update failed' },
        }),
      });
      await expect(
        service.update('1', { name: 'X' }, 'user1', TOKEN),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('returns success message', async () => {
      let callCount = 0;
      const q = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount >= 2) return Promise.resolve({ error: null });
          return q;
        }),
      };
      mockUserClient.from.mockReturnValue(q);
      const result = await service.remove('1', 'user1', TOKEN);
      expect(result).toEqual({ message: 'Project deleted successfully' });
    });

    it('throws BadRequestException on delete error', async () => {
      let callCount = 0;
      const q = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount >= 2)
            return Promise.resolve({ error: { message: 'delete failed' } });
          return q;
        }),
      };
      mockUserClient.from.mockReturnValue(q);
      await expect(service.remove('1', 'user1', TOKEN)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
