// Custom hook for fetching dashboard metrics
import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Hook to fetch dashboard metrics from the API
 * Returns: { metrics, loading, error, refetch }
 * 
 * Metrics structure:
 * - total_faturamento_mes: Sum of all completed service orders this month
 * - os_pendentes: Count of pending service orders
 * - tempo_medio_atendimento: Average service time in minutes
 */
function useDashboardMetrics(authToken) {
  const [metrics, setMetrics] = useState({
    total_faturamento_mes: 0,
    os_pendentes: 0,
    tempo_medio_atendimento: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/dashboard/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMetrics({
        total_faturamento_mes: data.total_faturamento_mes || 0,
        os_pendentes: data.os_pendentes || 0,
        tempo_medio_atendimento: data.tempo_medio_atendimento,
      });
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
}

export default useDashboardMetrics;
