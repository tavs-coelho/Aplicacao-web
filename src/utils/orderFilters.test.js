import { describe, it, expect } from 'vitest';

/**
 * Tests for the order filtering logic used in the GET /orders endpoint.
 * These tests validate the filter building logic without database dependencies.
 */

// Helper function to build filter clause (mirrors backend logic)
function buildOrderFilters({ search, status, techId }) {
  const whereClause = {};

  // Filter by status if provided
  if (status) {
    whereClause.status = status;
  }

  // Filter by techId if provided
  if (techId) {
    whereClause.tecnicoId = techId;
  }

  // Search filter: case-insensitive search on client name OR address
  if (search) {
    whereClause.cliente = {
      OR: [
        { nome: { contains: search, mode: 'insensitive' } },
        { endereco: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  return whereClause;
}

describe('buildOrderFilters', () => {
  it('should return empty object when no filters provided', () => {
    const result = buildOrderFilters({});
    expect(result).toEqual({});
  });

  it('should filter by status when status is provided', () => {
    const result = buildOrderFilters({ status: 'PENDENTE' });
    expect(result).toEqual({ status: 'PENDENTE' });
  });

  it('should filter by techId when techId is provided', () => {
    const techId = '123e4567-e89b-12d3-a456-426614174000';
    const result = buildOrderFilters({ techId });
    expect(result).toEqual({ tecnicoId: techId });
  });

  it('should build search filter for client name and address', () => {
    const result = buildOrderFilters({ search: 'João' });
    expect(result).toEqual({
      cliente: {
        OR: [
          { nome: { contains: 'João', mode: 'insensitive' } },
          { endereco: { contains: 'João', mode: 'insensitive' } },
        ],
      },
    });
  });

  it('should combine all filters when all are provided', () => {
    const techId = '123e4567-e89b-12d3-a456-426614174000';
    const result = buildOrderFilters({
      search: 'Maria',
      status: 'CONCLUIDO',
      techId,
    });

    expect(result).toEqual({
      status: 'CONCLUIDO',
      tecnicoId: techId,
      cliente: {
        OR: [
          { nome: { contains: 'Maria', mode: 'insensitive' } },
          { endereco: { contains: 'Maria', mode: 'insensitive' } },
        ],
      },
    });
  });

  it('should handle status EM_ANDAMENTO', () => {
    const result = buildOrderFilters({ status: 'EM_ANDAMENTO' });
    expect(result).toEqual({ status: 'EM_ANDAMENTO' });
  });

  it('should handle status CONCLUIDO', () => {
    const result = buildOrderFilters({ status: 'CONCLUIDO' });
    expect(result).toEqual({ status: 'CONCLUIDO' });
  });

  it('should not include undefined filters', () => {
    const result = buildOrderFilters({ search: undefined, status: undefined, techId: undefined });
    expect(result).toEqual({});
  });

  it('should not include null filters', () => {
    const result = buildOrderFilters({ search: null, status: null, techId: null });
    expect(result).toEqual({});
  });

  it('should not include empty string filters', () => {
    const result = buildOrderFilters({ search: '', status: '', techId: '' });
    expect(result).toEqual({});
  });
});
