import { TechOrdersResponse } from '../types';

// API base URL - should be configured via environment or config
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetches service orders for a specific technician
 * @param technicianId - The ID of the technician
 * @param token - The authentication token
 * @returns Promise with technician info and their service orders
 */
export async function fetchTechnicianOrders(
  technicianId: string,
  token: string
): Promise<TechOrdersResponse> {
  const response = await fetch(`${API_BASE_URL}/orders/tech/${technicianId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
