import { projectsApi, tasksApi } from '@/lib/api-client';

// Mock auth module
jest.mock('@/lib/auth', () => ({
  getAccessToken: jest.fn().mockResolvedValue('mock-token'),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('projectsApi', () => {
  beforeEach(() => mockFetch.mockClear());

  it('list() sends GET with Authorization header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', name: 'Project' }],
    });
    const result = await projectsApi.list();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer mock-token' }),
      }),
    );
    expect(result).toEqual([{ id: '1', name: 'Project' }]);
  });

  it('create() sends POST with body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: '2', name: 'New' }),
    });
    await projectsApi.create({ name: 'New', description: 'Desc' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws Error when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Unauthorized' }),
    });
    await expect(projectsApi.list()).rejects.toThrow('Unauthorized');
  });

  it('delete() sends DELETE request', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    await projectsApi.delete('123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/123'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

describe('tasksApi', () => {
  beforeEach(() => mockFetch.mockClear());

  it('list() sends GET with projectId query param', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] });
    await tasksApi.list('proj-1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('projectId=proj-1'),
      expect.anything(),
    );
  });

  it('update() sends PATCH with body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 't1', status: 'done' }),
    });
    await tasksApi.update('t1', { status: 'done' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/tasks/t1'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
