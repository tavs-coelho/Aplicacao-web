import { describe, it, expect } from 'vitest';

/**
 * Tests for the dashboard metrics calculation logic.
 * These tests validate the calculations without database dependencies.
 */

// Helper function to calculate average service time in minutes
function calculateAverageServiceTime(completedOrders) {
  if (!completedOrders || completedOrders.length === 0) {
    return null;
  }

  const ordersWithValidDates = completedOrders.filter(
    order => order.dataInicio && order.dataFim
  );

  if (ordersWithValidDates.length === 0) {
    return null;
  }

  const totalMinutes = ordersWithValidDates.reduce((acc, order) => {
    const diffMs = new Date(order.dataFim).getTime() - new Date(order.dataInicio).getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return acc + diffMinutes;
  }, 0);

  return totalMinutes / ordersWithValidDates.length;
}

// Helper function to calculate total revenue for the month
function calculateMonthlyRevenue(completedOrders) {
  if (!completedOrders || completedOrders.length === 0) {
    return 0;
  }

  return completedOrders.reduce((acc, order) => {
    return acc + (order.valor || 0);
  }, 0);
}

// Helper function to count pending orders
function countPendingOrders(orders) {
  if (!orders || orders.length === 0) {
    return 0;
  }

  return orders.filter(order => order.status === 'PENDENTE').length;
}

describe('calculateAverageServiceTime', () => {
  it('should return null for empty array', () => {
    const result = calculateAverageServiceTime([]);
    expect(result).toBeNull();
  });

  it('should return null for null input', () => {
    const result = calculateAverageServiceTime(null);
    expect(result).toBeNull();
  });

  it('should return null when no orders have valid dates', () => {
    const orders = [
      { dataInicio: null, dataFim: null },
      { dataInicio: null, dataFim: new Date() },
    ];
    const result = calculateAverageServiceTime(orders);
    expect(result).toBeNull();
  });

  it('should calculate average for single order', () => {
    const orders = [
      {
        dataInicio: new Date('2024-01-01T10:00:00'),
        dataFim: new Date('2024-01-01T12:00:00'), // 2 hours = 120 minutes
      },
    ];
    const result = calculateAverageServiceTime(orders);
    expect(result).toBe(120);
  });

  it('should calculate average for multiple orders', () => {
    const orders = [
      {
        dataInicio: new Date('2024-01-01T10:00:00'),
        dataFim: new Date('2024-01-01T12:00:00'), // 2 hours = 120 minutes
      },
      {
        dataInicio: new Date('2024-01-02T09:00:00'),
        dataFim: new Date('2024-01-02T10:00:00'), // 1 hour = 60 minutes
      },
    ];
    const result = calculateAverageServiceTime(orders);
    expect(result).toBe(90); // (120 + 60) / 2 = 90 minutes
  });

  it('should ignore orders without valid dates', () => {
    const orders = [
      {
        dataInicio: new Date('2024-01-01T10:00:00'),
        dataFim: new Date('2024-01-01T11:00:00'), // 1 hour = 60 minutes
      },
      {
        dataInicio: null,
        dataFim: new Date('2024-01-02T10:00:00'),
      },
    ];
    const result = calculateAverageServiceTime(orders);
    expect(result).toBe(60);
  });
});

describe('calculateMonthlyRevenue', () => {
  it('should return 0 for empty array', () => {
    const result = calculateMonthlyRevenue([]);
    expect(result).toBe(0);
  });

  it('should return 0 for null input', () => {
    const result = calculateMonthlyRevenue(null);
    expect(result).toBe(0);
  });

  it('should sum all order values', () => {
    const orders = [
      { valor: 100.50 },
      { valor: 200.00 },
      { valor: 50.25 },
    ];
    const result = calculateMonthlyRevenue(orders);
    expect(result).toBe(350.75);
  });

  it('should handle orders with null valor', () => {
    const orders = [
      { valor: 100.00 },
      { valor: null },
      { valor: 50.00 },
    ];
    const result = calculateMonthlyRevenue(orders);
    expect(result).toBe(150);
  });

  it('should handle single order', () => {
    const orders = [{ valor: 500 }];
    const result = calculateMonthlyRevenue(orders);
    expect(result).toBe(500);
  });
});

describe('countPendingOrders', () => {
  it('should return 0 for empty array', () => {
    const result = countPendingOrders([]);
    expect(result).toBe(0);
  });

  it('should return 0 for null input', () => {
    const result = countPendingOrders(null);
    expect(result).toBe(0);
  });

  it('should count only PENDENTE orders', () => {
    const orders = [
      { status: 'PENDENTE' },
      { status: 'CONCLUIDO' },
      { status: 'PENDENTE' },
      { status: 'EM_ANDAMENTO' },
    ];
    const result = countPendingOrders(orders);
    expect(result).toBe(2);
  });

  it('should return 0 when no pending orders', () => {
    const orders = [
      { status: 'CONCLUIDO' },
      { status: 'EM_ANDAMENTO' },
    ];
    const result = countPendingOrders(orders);
    expect(result).toBe(0);
  });

  it('should count all orders as pending when all are pending', () => {
    const orders = [
      { status: 'PENDENTE' },
      { status: 'PENDENTE' },
      { status: 'PENDENTE' },
    ];
    const result = countPendingOrders(orders);
    expect(result).toBe(3);
  });
});
