import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ServiceOrder } from '../types';

interface OrderCardProps {
  order: ServiceOrder;
  onPress: (order: ServiceOrder) => void;
}

/**
 * Formats a date string to display time in HH:MM format
 */
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a date string to display date in DD/MM/YYYY format
 */
function formatDate(dateString: string): string {
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
function getStatusColor(status: ServiceOrder['status']): string {
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
function getStatusLabel(status: ServiceOrder['status']): string {
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

export function OrderCard({ order, onPress }: OrderCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(order)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.clientName} numberOfLines={1}>
          {order.cliente.nome}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.address} numberOfLines={2}>
          {order.cliente.endereco}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.icon}>📅</Text>
        <Text style={styles.dateTime}>
          {formatDate(order.dataAgendada)} às {formatTime(order.dataAgendada)}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.viewDetails}>Ver detalhes →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
    width: 24,
  },
  address: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
    lineHeight: 20,
  },
  dateTime: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  footer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  viewDetails: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
});
