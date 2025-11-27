import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ServiceOrder } from '../types';

type OrderDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

/**
 * Formats a date string to display in DD/MM/YYYY format
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

export function OrderDetailsScreen({ route }: OrderDetailsScreenProps) {
  const { order } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
        </View>
      </View>

      {/* Client Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações do Cliente</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.icon}>👤</Text>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.value}>{order.cliente.nome}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📍</Text>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Endereço</Text>
              <Text style={styles.value}>{order.cliente.endereco}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📞</Text>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Telefone</Text>
              <Text style={styles.value}>{order.cliente.telefone}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Schedule Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agendamento</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📅</Text>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Data Agendada</Text>
              <Text style={styles.value}>
                {formatDate(order.dataAgendada)} às {formatTime(order.dataAgendada)}
              </Text>
            </View>
          </View>

          {order.dataInicio && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.icon}>🕐</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Início</Text>
                  <Text style={styles.value}>
                    {formatDate(order.dataInicio)} às {formatTime(order.dataInicio)}
                  </Text>
                </View>
              </View>
            </>
          )}

          {order.dataFim && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.icon}>✅</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Conclusão</Text>
                  <Text style={styles.value}>
                    {formatDate(order.dataFim)} às {formatTime(order.dataFim)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Technical Report Section */}
      {order.relatorioTecnico && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relatório Técnico</Text>
          <View style={styles.card}>
            <Text style={styles.reportText}>{order.relatorioTecnico}</Text>
          </View>
        </View>
      )}

      {/* Photos Section */}
      {order.photos && order.photos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotos ({order.photos.length})</Text>
          <View style={styles.card}>
            {order.photos.map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Text style={styles.photoType}>
                  {photo.tipo === 'ANTES' ? '📷 Antes' : '📷 Depois'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 4,
  },
  reportText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 22,
  },
  photoItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  photoType: {
    fontSize: 14,
    color: '#2c3e50',
  },
});
