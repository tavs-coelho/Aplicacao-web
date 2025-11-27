import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ServiceOrder } from '../types';
import { formatDate, formatTime, getStatusColor, getStatusLabel } from '../utils/formatters';

interface OrderCardProps {
  order: ServiceOrder;
  onPress: (order: ServiceOrder) => void;
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
