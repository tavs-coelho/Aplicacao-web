import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTechnicianOrders } from '../services/api';
import { ServiceOrder } from '../types';

const ORDERS_CACHE_KEY = 'cached_orders';

interface UseOrdersResult {
  orders: ServiceOrder[];
  isLoading: boolean;
  isRefreshing: boolean;
  isOffline: boolean;
  error: string | null;
  loadOrders: () => Promise<void>;
  refresh: () => void;
}

/**
 * Custom hook to manage service orders with offline caching support.
 * Fetches orders from API and caches them in AsyncStorage.
 * Falls back to cached data when the API request fails (offline mode).
 */
export function useOrders(userId: string | undefined, token: string | null): UseOrdersResult {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!userId || !token) {
      setError('Usuário não autenticado');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsOffline(false);
      
      const response = await fetchTechnicianOrders(userId, token);
      setOrders(response.serviceOrders);
      
      // Cache the orders for offline use
      await AsyncStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(response.serviceOrders));
    } catch (err) {
      console.error('Error loading orders:', err);
      
      // Try to load cached orders when API fails
      try {
        const cachedData = await AsyncStorage.getItem(ORDERS_CACHE_KEY);
        if (cachedData) {
          const cachedOrders = JSON.parse(cachedData) as ServiceOrder[];
          setOrders(cachedOrders);
          setIsOffline(true);
          setError(null);
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar ordens';
          setError(errorMessage);
        }
      } catch (cacheError) {
        console.error('Error loading cached orders:', cacheError);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar ordens';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    isLoading,
    isRefreshing,
    isOffline,
    error,
    loadOrders,
    refresh,
  };
}
