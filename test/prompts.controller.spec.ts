import Fastify from 'fastify';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import promptsRoutes from '../src/modules/prompts/controller';

describe('prompts routes (controller)', () => {
  let app: ReturnType<typeof Fastify>;
  const mockService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  } as any;

  beforeEach(async () => {
    app = Fastify();
    await app.register(promptsRoutes as any, { service: mockService });
  });

  it('returns empty list from findAll', async () => {
    mockService.findAll.mockResolvedValue([]);
    const res = await app.inject({ method: 'GET', url: '/' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual([]);
  });

  it('creates a prompt', async () => {
    const payload = { title: 'a', content: 'b' };
    mockService.create.mockResolvedValue({ id: 1, ...payload, created_at: new Date().toISOString() });
    const res = await app.inject({ method: 'POST', url: '/', payload });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.id).toBe(1);
    expect(mockService.create).toHaveBeenCalledWith(payload);
  });

  it('returns 404 when not found by id', async () => {
    mockService.findById.mockResolvedValue(null);
    const res = await app.inject({ method: 'GET', url: '/999' });
    expect(res.statusCode).toBe(404);
  });

  it('updates an existing prompt', async () => {
    mockService.update.mockResolvedValue({ id: 2, title: 'x', content: 'y', created_at: new Date().toISOString() });
    const res = await app.inject({ method: 'PUT', url: '/2', payload: { title: 'x' } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.id).toBe(2);
    expect(mockService.update).toHaveBeenCalledWith(2, { title: 'x', content: undefined });
  });

  it('deletes a prompt', async () => {
    mockService.delete.mockResolvedValue(true);
    const res = await app.inject({ method: 'DELETE', url: '/5' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ deleted: true });
  });
});
