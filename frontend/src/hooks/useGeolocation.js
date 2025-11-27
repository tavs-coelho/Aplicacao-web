import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for obtaining the user's current geolocation using the browser's Geolocation API.
 * This serves as a web equivalent of expo-location functionality.
 * 
 * @returns {Object} Geolocation state and actions
 * @property {Object|null} location - Current location with latitude and longitude
 * @property {string|null} error - Error message if geolocation fails
 * @property {boolean} loading - Loading state while obtaining location
 * @property {Function} refreshLocation - Function to manually refresh the location
 */
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Informação de localização indisponível';
            break;
          case err.TIMEOUT:
            errorMessage = 'Tempo esgotado ao obter localização';
            break;
          default:
            errorMessage = 'Erro desconhecido ao obter localização';
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    location,
    error,
    loading,
    refreshLocation: getCurrentLocation,
  };
}
