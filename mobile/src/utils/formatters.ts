import { ServiceOrderStatus } from '../types';

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
