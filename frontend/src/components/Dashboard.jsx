// Dashboard component with Sidebar and Service Orders table
// Componente Dashboard com Sidebar e tabela de Ordens de Serviço

import { useState, useCallback, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import PhotoCapture from './PhotoCapture';
import TechnicianPerformanceChart from './TechnicianPerformanceChart';
import DashboardMetricsCards from './DashboardMetricsCards';
import { aggregateTechnicianPerformance } from '../utils/aggregateTechnicianPerformance';
import WhatsAppReminderButton from './WhatsAppReminderButton';
import { exportOrdersToCSV } from '../utils/csvExport';
import { ToastContainer } from './Toast';
import useSocket from '../hooks/useSocket';
import useDashboardMetrics from '../hooks/useDashboardMetrics';
import TableSkeleton from './TableSkeleton';
import NewOrderModal from './NewOrderModal';

const sampleServiceOrders = [
  {
    id: '1',
    cliente: 'João Silva',
    clientePhone: '5511999998888',
    tecnico: 'Carlos Santos',
    data: '2024-01-15',
    status: 'CONCLUIDO',
    clientLocation: { latitude: -23.550520, longitude: -46.633308 }, // São Paulo
  },
  {
    id: '2',
    cliente: 'Maria Oliveira',
    clientePhone: '5521988887777',
    tecnico: 'Pedro Costa',
    data: '2024-01-16',
    status: 'PENDENTE',
    clientLocation: { latitude: -22.906847, longitude: -43.172896 }, // Rio de Janeiro
  },
  {
    id: '3',
    cliente: 'Ana Souza',
    clientePhone: '5531977776666',
    tecnico: 'Carlos Santos',
    data: '2024-01-17',
    status: 'EM_ANDAMENTO',
    clientLocation: { latitude: -19.919052, longitude: -43.938639 }, // Belo Horizonte
  },
  {
    id: '4',
    cliente: 'Roberto Lima',
    clientePhone: '5541966665555',
    tecnico: 'Ana Pereira',
    data: '2024-01-18',
    status: 'CONCLUIDO',
    clientLocation: { latitude: -25.428954, longitude: -49.267137 }, // Curitiba
  },
  {
    id: '5',
    cliente: 'Fernanda Rocha',
    clientePhone: '5551955554444',
    tecnico: 'Pedro Costa',
    data: '2024-01-19',
    status: 'PENDENTE',
    clientLocation: { latitude: -30.027704, longitude: -51.228735 }, // Porto Alegre
  },
];

// Sample clients data for the Clientes view
const sampleClients = [
  { id: '1', nome: 'João Silva', telefone: '5511999998888', email: 'joao.silva@email.com' },
  { id: '2', nome: 'Maria Oliveira', telefone: '5521988887777', email: 'maria.oliveira@email.com' },
  { id: '3', nome: 'Ana Souza', telefone: '5531977776666', email: 'ana.souza@email.com' },
  { id: '4', nome: 'Roberto Lima', telefone: '5541966665555', email: 'roberto.lima@email.com' },
  { id: '5', nome: 'Fernanda Rocha', telefone: '5551955554444', email: 'fernanda.rocha@email.com' },
];

// Sample technicians data for the filter dropdown
const sampleTechnicians = [
  { id: 'tech-1', nome: 'Carlos Santos' },
  { id: 'tech-2', nome: 'Pedro Costa' },
  { id: 'tech-3', nome: 'Ana Pereira' },
];

// Status badge component with color-coded styling
function StatusBadge({ status }) {
  const getStatusStyles = () => {
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

  const getStatusLabel = () => {
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
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}
    >
      {getStatusLabel()}
    </span>
  );
}

// Sidebar component
function Sidebar({ activeView, onViewChange }) {
  const menuItems = [
    { name: 'Dashboard', key: 'dashboard', icon: '📊' },
    { name: 'Ordens de Serviço', key: 'orders', icon: '📋' },
    { name: 'Clientes', key: 'clients', icon: '👥' },
    { name: 'Técnicos', key: 'technicians', icon: '🔧' },
    { name: 'Relatórios', key: 'reports', icon: '📈' },
    { name: 'Configurações', key: 'settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Sistema FSM</h1>
        <p className="text-gray-400 text-sm">Gestão de Equipes</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onViewChange(item.key)}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors text-left ${
                  activeView === item.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-400">admin@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Service Orders Table component with search and filter functionality
function ServiceOrdersTable({ orders, onFinalizeOrder, onExport, onNewOrder, isLoading }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return <TableSkeleton rows={5} columns={5} />;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Ordens de Serviço
          </h2>
          <p className="text-sm text-gray-500">
            Lista de todas as ordens de serviço
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onNewOrder}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <span className="mr-2">➕</span>
            Nova OS
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="mr-2">📥</span>
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Cliente
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Técnico
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Data
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  Nenhuma ordem de serviço encontrada.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.cliente}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.tecnico}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(order.data)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.status === 'EM_ANDAMENTO' && (
                      <button
                        type="button"
                        onClick={() => onFinalizeOrder(order)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        <span className="mr-1">✅</span>
                        Finalizar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Modal component for finalizing service order with photo capture
function FinalizeOrderModal({ order, onClose, onSubmit }) {
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotosChange = (newPhotos) => {
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      alert('Por favor, adicione pelo menos uma foto para finalizar a OS.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(order, photos);
    } catch (error) {
      console.error('Error finalizing order:', error);
      alert('Erro ao finalizar a OS. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Finalizar Ordem de Serviço
                </h2>
                <p className="text-sm text-gray-500">
                  Cliente: {order.cliente} | Técnico: {order.tecnico}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar modal"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Importante:</span> Para finalizar a OS, é necessário adicionar pelo menos uma foto documentando o serviço realizado.
              </p>
            </div>
            
            <PhotoCapture onPhotosChange={handlePhotosChange} />
          </div>
          
          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || photos.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Finalizando...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✅</span>
                    Finalizar OS ({photos.length} {photos.length === 1 ? 'foto' : 'fotos'})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Clients Table component with WhatsApp reminder button
function ClientsTable({ clients }) {
  const formatPhone = (phone) => {
    // Format phone for display: +55 (11) 99999-8888
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Clientes</h2>
        <p className="text-sm text-gray-500">Lista de todos os clientes</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nome
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Telefone
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {client.nome}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatPhone(client.telefone)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{client.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <WhatsAppReminderButton
                    clientName={client.nome}
                    phone={client.telefone}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main Dashboard component
function Dashboard() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState(sampleServiceOrders);
  const [activeView, setActiveView] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // Fetch dashboard metrics from API
  // Note: In production, pass a real auth token from context/state
  const { metrics, loading: metricsLoading } = useDashboardMetrics(null);

  // Handle order completed events from Socket.IO
  const handleOrderCompleted = useCallback((data) => {
    const { tecnicoNome, clienteNome, orderId } = data;
    
    // Add a new toast notification
    const newToast = {
      id: Date.now(),
      message: `O técnico ${tecnicoNome} acabou de finalizar a OS no cliente ${clienteNome}`,
      type: 'success',
      duration: 7000,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Update the order in the list if it exists
    setOrders(prev => 
      prev.map(o => 
        o.id === orderId ? { ...o, status: 'CONCLUIDO' } : o
      )
    );
  }, []);

  // Initialize Socket.IO connection
  useSocket(handleOrderCompleted);

  // Remove toast from the list
  const handleRemoveToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleFinalizeOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleExportOrders = () => {
    exportOrdersToCSV(orders);
  };

  const handleSubmitFinalization = (order, photos) => {
    // Update order status to CONCLUIDO
    setOrders(prev => 
      prev.map(o => 
        o.id === order.id ? { ...o, status: 'CONCLUIDO' } : o
      )
    );
    setSelectedOrder(null);
    alert(`OS #${order.id} finalizada com sucesso! ${photos.length} foto(s) enviada(s).`);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleNewOrder = () => {
    setShowNewOrderModal(true);
  };

  const handleCloseNewOrderModal = () => {
    setShowNewOrderModal(false);
  };

  const handleSubmitNewOrder = (newOrder) => {
    setOrders(prev => [...prev, newOrder]);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Bem-vindo ao Sistema de Gestão de Equipes Externas' };
      case 'orders':
        return { title: 'Ordens de Serviço', subtitle: 'Gerencie as ordens de serviço' };
      case 'clients':
        return { title: 'Clientes', subtitle: 'Lista de todos os clientes cadastrados' };
      case 'technicians':
        return { title: 'Técnicos', subtitle: 'Gerencie os técnicos' };
      case 'reports':
        return { title: 'Relatórios', subtitle: 'Visualize os relatórios do sistema' };
      case 'settings':
        return { title: 'Configurações', subtitle: 'Configure o sistema' };
      default:
        return { title: 'Dashboard', subtitle: 'Bem-vindo ao Sistema de Gestão de Equipes Externas' };
    }
  };

  const viewInfo = getViewTitle();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{viewInfo.title}</h1>
          <p className="text-gray-600">{viewInfo.subtitle}</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total de Ordens</p>
                <p className="text-2xl font-bold text-gray-800">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Concluídas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {orders.filter((o) => o.status === 'CONCLUIDO').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-gray-800">
                  {orders.filter((o) => o.status === 'PENDENTE').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-800">
                  {orders.filter((o) => o.status === 'EM_ANDAMENTO').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technician Performance Chart */}
        <div className="mb-8">
          <TechnicianPerformanceChart data={aggregateTechnicianPerformance(orders)} />
        </div>

        {/* Service Orders Table */}
        <ServiceOrdersTable orders={orders} onFinalizeOrder={handleFinalizeOrder} />

        {/* Dashboard View - Stats cards */}
        {activeView === 'dashboard' && (
          <>
            {/* Dashboard Metrics Cards - Large cards for key metrics from API */}
            <DashboardMetricsCards metrics={metrics} loading={metricsLoading} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total de Ordens</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {orders.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Concluídas</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {orders.filter((o) => o.status === 'CONCLUIDO').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Pendentes</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {orders.filter((o) => o.status === 'PENDENTE').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Em Andamento</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {orders.filter((o) => o.status === 'EM_ANDAMENTO').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Technician Performance Chart */}
            <div className="mb-8">
              <TechnicianPerformanceChart data={aggregateTechnicianPerformance(orders)} />
            </div>
            <ServiceOrdersTable 
              orders={orders} 
              onFinalizeOrder={handleFinalizeOrder} 
              onExport={handleExportOrders}
              onNewOrder={handleNewOrder}
              isLoading={isLoading}
            />
          </>
        )}

        {/* Orders View */}
        {activeView === 'orders' && (
          <ServiceOrdersTable 
            orders={orders} 
            onFinalizeOrder={handleFinalizeOrder} 
            onExport={handleExportOrders}
            onNewOrder={handleNewOrder}
            isLoading={isLoading}
          />
        )}

        {/* Clients View */}
        {activeView === 'clients' && (
          <ClientsTable clients={sampleClients} />
        )}

        {/* Placeholder views for other sections */}
        {(activeView === 'technicians' || activeView === 'reports' || activeView === 'settings') && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Esta seção está em desenvolvimento.</p>
          </div>
        )}
      </main>

      {/* Toast notifications for real-time updates */}
      <ToastContainer toasts={toasts} onRemoveToast={handleRemoveToast} />

      {/* Finalize Order Modal */}
      {selectedOrder && (
        <FinalizeOrderModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onSubmit={handleSubmitFinalization}
        />
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <NewOrderModal
          onClose={handleCloseNewOrderModal}
          onSubmit={handleSubmitNewOrder}
          clients={sampleClients}
          technicians={sampleTechnicians}
        />
      )}
    </div>
  );
}

export default Dashboard;
