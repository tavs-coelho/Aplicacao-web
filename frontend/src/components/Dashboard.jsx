// Dashboard component with Sidebar and Service Orders table
// Componente Dashboard com Sidebar e tabela de Ordens de Serviço

import { useState } from 'react';
import PhotoCapture from './PhotoCapture';

const sampleServiceOrders = [
  {
    id: '1',
    cliente: 'João Silva',
    tecnico: 'Carlos Santos',
    data: '2024-01-15',
    status: 'CONCLUIDO',
  },
  {
    id: '2',
    cliente: 'Maria Oliveira',
    tecnico: 'Pedro Costa',
    data: '2024-01-16',
    status: 'PENDENTE',
  },
  {
    id: '3',
    cliente: 'Ana Souza',
    tecnico: 'Carlos Santos',
    data: '2024-01-17',
    status: 'EM_ANDAMENTO',
  },
  {
    id: '4',
    cliente: 'Roberto Lima',
    tecnico: 'Ana Pereira',
    data: '2024-01-18',
    status: 'CONCLUIDO',
  },
  {
    id: '5',
    cliente: 'Fernanda Rocha',
    tecnico: 'Pedro Costa',
    data: '2024-01-19',
    status: 'PENDENTE',
  },
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
function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: '📊', active: true },
    { name: 'Ordens de Serviço', icon: '📋', active: false },
    { name: 'Clientes', icon: '👥', active: false },
    { name: 'Técnicos', icon: '🔧', active: false },
    { name: 'Relatórios', icon: '📈', active: false },
    { name: 'Configurações', icon: '⚙️', active: false },
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
            <li key={item.name}>
              <button
                type="button"
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors text-left ${
                  item.active
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

// Service Orders Table component
function ServiceOrdersTable({ orders, onFinalizeOrder }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          Ordens de Serviço
        </h2>
        <p className="text-sm text-gray-500">
          Lista de todas as ordens de serviço
        </p>
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
            {orders.map((order) => (
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
            ))}
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
      // Here you would send photos to the backend
      // const formData = new FormData();
      // photos.forEach((photo, index) => {
      //   formData.append(`photo_${index}`, photo.file);
      // });
      // await fetch(`/api/orders/${order.id}/finalize`, { method: 'POST', body: formData });
      
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

// Main Dashboard component
function Dashboard() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState(sampleServiceOrders);

  const handleFinalizeOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">
            Bem-vindo ao Sistema de Gestão de Equipes Externas
          </p>
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
                  {
                    orders.filter((o) => o.status === 'CONCLUIDO')
                      .length
                  }
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
                  {
                    orders.filter((o) => o.status === 'PENDENTE')
                      .length
                  }
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
                  {
                    orders.filter(
                      (o) => o.status === 'EM_ANDAMENTO'
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Orders Table */}
        <ServiceOrdersTable orders={orders} onFinalizeOrder={handleFinalizeOrder} />
      </main>

      {/* Finalize Order Modal */}
      {selectedOrder && (
        <FinalizeOrderModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onSubmit={handleSubmitFinalization}
        />
      )}
    </div>
  );
}

export default Dashboard;
