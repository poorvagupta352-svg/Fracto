import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

const mockAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ auth: mockAuth })),
}));

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
    if (key === 'SUPABASE_KEY') return 'test-key';
    return null;
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('returns user and session on success', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: { id: 'u1' }, session: { access_token: 'tok' } },
        error: null,
      });
      const result = await service.signUp('a@b.com', 'pass123');
      expect(result).toEqual({
        user: { id: 'u1' },
        session: { access_token: 'tok' },
      });
    });

    it('throws BadRequestException on error', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: {},
        error: { message: 'Email taken' },
      });
      await expect(service.signUp('a@b.com', 'pass123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signIn', () => {
    it('returns user, session and access_token on success', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'u1' }, session: { access_token: 'tok' } },
        error: null,
      });
      const result = await service.signIn('a@b.com', 'pass123');
      expect(result.access_token).toBe('tok');
      expect(result.user).toEqual({ id: 'u1' });
    });

    it('throws UnauthorizedException on invalid credentials', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: {},
        error: { message: 'Invalid credentials' },
      });
      await expect(service.signIn('a@b.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
