// Dashboard Metrics Cards Component
// Componente de Cards de Métricas para o Dashboard
// Exibe métricas em cards grandes no topo do Dashboard

/**
 * Format currency value in BRL (Brazilian Real)
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format time in minutes to a human-readable format
 * @param {number|null} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
function formatTime(minutes) {
  if (minutes === null || minutes === undefined) {
    return 'N/A';
  }

  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

/**
 * MetricCard - A large card component for displaying a single metric
 */
function MetricCard({ icon, title, value, subtitle, bgColor, textColor, loading = false }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 transition-transform hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <div className="mt-2">
            {loading ? (
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
            ) : (
              <p className={`text-3xl font-bold ${textColor || 'text-gray-900'}`}>
                {value}
              </p>
            )}
          </div>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${bgColor || 'bg-gray-100'}`}>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * DashboardMetricsCards - Component to display dashboard metrics in large cards
 * 
 * Props:
 * - metrics: Object containing total_faturamento_mes, os_pendentes, tempo_medio_atendimento
 * - loading: Boolean indicating if data is loading
 */
function DashboardMetricsCards({ metrics, loading }) {
  const { total_faturamento_mes, os_pendentes, tempo_medio_atendimento } = metrics || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Faturamento do Mês */}
      <MetricCard
        icon="💰"
        title="Faturamento do Mês"
        value={formatCurrency(total_faturamento_mes || 0)}
        subtitle="Soma de todas as OS concluídas este mês"
        bgColor="bg-green-100"
        textColor="text-green-600"
        loading={loading}
      />

      {/* OS Pendentes */}
      <MetricCard
        icon="📋"
        title="OS Pendentes"
        value={os_pendentes || 0}
        subtitle="Ordens de serviço aguardando atendimento"
        bgColor="bg-yellow-100"
        textColor="text-yellow-600"
        loading={loading}
      />

      {/* Tempo Médio de Atendimento */}
      <MetricCard
        icon="⏱️"
        title="Tempo Médio de Atendimento"
        value={formatTime(tempo_medio_atendimento)}
        subtitle="Média de tempo para concluir uma OS"
        bgColor="bg-blue-100"
        textColor="text-blue-600"
        loading={loading}
      />
    </div>
  );
}

export default DashboardMetricsCards;
