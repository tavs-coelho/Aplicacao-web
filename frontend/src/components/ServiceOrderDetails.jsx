import { useGeolocation } from '../hooks/useGeolocation';
import { calculateHaversineDistance } from '../utils/haversine';

const PROXIMITY_THRESHOLD_METERS = 500;

/**
 * ServiceOrderDetails component for displaying service order details
 * and enabling service start based on technician proximity to client location.
 *
 * @param {Object} props
 * @param {Object} props.serviceOrder - Service order data
 * @param {string} props.serviceOrder.id - Service order ID
 * @param {string} props.serviceOrder.cliente - Client name
 * @param {string} props.serviceOrder.tecnico - Technician name
 * @param {string} props.serviceOrder.data - Service date
 * @param {string} props.serviceOrder.status - Service order status
 * @param {Object} props.serviceOrder.clientLocation - Client location coordinates
 * @param {number} props.serviceOrder.clientLocation.latitude - Client latitude
 * @param {number} props.serviceOrder.clientLocation.longitude - Client longitude
 * @param {Function} props.onStartService - Callback when service is started
 * @param {Function} props.onBack - Callback to go back
 */
function ServiceOrderDetails({ serviceOrder, onStartService, onBack }) {
  const { location, error: locationError, loading, refreshLocation } = useGeolocation();

  // Calculate distance between technician and client location
  let distance = null;
  if (location && serviceOrder?.clientLocation) {
    distance = calculateHaversineDistance(
      location.latitude,
      location.longitude,
      serviceOrder.clientLocation.latitude,
      serviceOrder.clientLocation.longitude
    );
  }

  // Determine if we should show the "too far" alert
  const alertMessage = distance !== null && distance >= PROXIMITY_THRESHOLD_METERS
    ? 'Você está longe do local'
    : null;

  const canStartService = distance !== null && distance < PROXIMITY_THRESHOLD_METERS;

  const handleStartService = () => {
    if (canStartService && onStartService) {
      onStartService(serviceOrder.id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'CONCLUIDO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EM_ANDAMENTO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONCLUIDO':
        return 'Concluído';
      case 'PENDENTE':
        return 'Pendente';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Detalhes da Ordem de Serviço
        </h2>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <span className="mr-1">←</span> Voltar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Cliente
          </label>
          <p className="text-lg text-gray-900">{serviceOrder?.cliente}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Técnico
          </label>
          <p className="text-lg text-gray-900">{serviceOrder?.tecnico}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Data
          </label>
          <p className="text-lg text-gray-900">
            {serviceOrder?.data ? formatDate(serviceOrder.data) : '-'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Status
          </label>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(serviceOrder?.status)}`}
          >
            {getStatusLabel(serviceOrder?.status)}
          </span>
        </div>
      </div>

      {/* Location Section */}
      <div className="border-t border-gray-200 pt-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Verificação de Proximidade
        </h3>

        {loading && (
          <div className="flex items-center text-blue-600 mb-4">
            <span className="mr-2">🔄</span>
            <span>Obtendo sua localização...</span>
          </div>
        )}

        {locationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center text-red-700">
              <span className="mr-2">⚠️</span>
              <span>{locationError}</span>
            </div>
            <button
              type="button"
              onClick={refreshLocation}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {location && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-gray-600">
              <span className="mr-2">📍</span>
              <span>
                Sua localização: {location.latitude.toFixed(6)},{' '}
                {location.longitude.toFixed(6)}
              </span>
            </div>
            {serviceOrder?.clientLocation && (
              <div className="flex items-center text-gray-600">
                <span className="mr-2">🏠</span>
                <span>
                  Local do cliente: {serviceOrder.clientLocation.latitude.toFixed(6)},{' '}
                  {serviceOrder.clientLocation.longitude.toFixed(6)}
                </span>
              </div>
            )}
            {distance !== null && (
              <div className="flex items-center text-gray-600">
                <span className="mr-2">📏</span>
                <span>
                  Distância: {distance.toFixed(0)} metros
                </span>
              </div>
            )}
          </div>
        )}

        {alertMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center text-yellow-700">
              <span className="mr-2">⚠️</span>
              <span>{alertMessage}</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Você precisa estar a menos de {PROXIMITY_THRESHOLD_METERS} metros do local do cliente para iniciar o serviço.
            </p>
          </div>
        )}

        {canStartService && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center text-green-700">
              <span className="mr-2">✅</span>
              <span>Você está próximo do local do cliente!</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={refreshLocation}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔄 Atualizar Localização
        </button>
        <button
          type="button"
          onClick={handleStartService}
          disabled={!canStartService || loading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            canStartService
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Iniciar Serviço
        </button>
      </div>
    </div>
  );
}

export default ServiceOrderDetails;
