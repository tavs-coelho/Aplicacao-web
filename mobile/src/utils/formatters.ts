import { Linking, Platform } from 'react-native';
import { ServiceOrderStatus } from '../types';

/**
 * Opens the native maps app with navigation to the specified coordinates.
 * Supports Google Maps, Apple Maps (iOS), and Waze as fallback.
 * @param latitude - Destination latitude
 * @param longitude - Destination longitude
 * @param label - Optional label for the destination
 */
export async function openMapsNavigation(
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> {
  const destination = `${latitude},${longitude}`;
  const encodedLabel = label ? encodeURIComponent(label) : '';

  // URLs for different map apps
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  const googleMapsAppUrl = `comgooglemaps://?daddr=${destination}&directionsmode=driving`;
  const appleMapsUrl = `maps://app?daddr=${destination}${encodedLabel ? `&dname=${encodedLabel}` : ''}`;
  const wazeAppUrl = `waze://?ll=${destination}&navigate=yes`;

  try {
    if (Platform.OS === 'ios') {
      // Try Apple Maps first on iOS
      const canOpenAppleMaps = await Linking.canOpenURL(appleMapsUrl);
      if (canOpenAppleMaps) {
        await Linking.openURL(appleMapsUrl);
        return;
      }
    }

    // Try Google Maps app (using custom URL scheme for proper detection)
    const canOpenGoogleMapsApp = await Linking.canOpenURL(googleMapsAppUrl);
    if (canOpenGoogleMapsApp) {
      await Linking.openURL(googleMapsAppUrl);
      return;
    }

    // Fallback to Waze app (using custom URL scheme for proper detection)
    const canOpenWazeApp = await Linking.canOpenURL(wazeAppUrl);
    if (canOpenWazeApp) {
      await Linking.openURL(wazeAppUrl);
      return;
    }

    // If no map app is installed, open Google Maps in browser
    await Linking.openURL(googleMapsUrl);
  } catch (error) {
    console.error('Error opening maps:', error);
    throw error;
  }
}

/**
 * Formats a date string to display time in HH:MM format
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a date string to display date in DD/MM/YYYY format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Returns the color for the status badge
 */
export function getStatusColor(status: ServiceOrderStatus): string {
  switch (status) {
    case 'PENDENTE':
      return '#FFA500';
    case 'EM_ANDAMENTO':
      return '#3498db';
    case 'CONCLUIDO':
      return '#2ecc71';
    default:
      return '#95a5a6';
  }
}

/**
 * Returns a human-readable status label
 */
export function getStatusLabel(status: ServiceOrderStatus): string {
  switch (status) {
    case 'PENDENTE':
      return 'Pendente';
    case 'EM_ANDAMENTO':
      return 'Em Andamento';
    case 'CONCLUIDO':
      return 'Concluído';
    default:
      return status;
  }
}
