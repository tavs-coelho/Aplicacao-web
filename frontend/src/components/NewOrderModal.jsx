// NewOrderModal component - modal for creating a new Service Order with spinner and toast

import { useState } from 'react';
import toast from 'react-hot-toast';

// Spinner component for button loading state
function Spinner() {
  return (
    <svg 
      className="animate-spin h-5 w-5 text-white" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

function NewOrderModal({ onClose, onSubmit, clients, technicians }) {
  const [formData, setFormData] = useState({
    cliente: '',
    clientePhone: '',
    tecnico: '',
    data: new Date().toISOString().split('T')[0],
    status: 'PENDENTE',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill phone when client is selected
    if (name === 'cliente' && clients) {
      const selectedClient = clients.find(c => c.nome === value);
      if (selectedClient) {
        setFormData(prev => ({ ...prev, clientePhone: selectedClient.telefone }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cliente || !formData.tecnico || !formData.data) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newOrder = {
        id: String(Date.now()),
        ...formData,
        clientLocation: { latitude: -23.550520, longitude: -46.633308 },
      };
      
      onSubmit(newOrder);
      toast.success('Ordem de Serviço criada com sucesso!', {
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10B981',
        },
      });
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar Ordem de Serviço. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Nova Ordem de Serviço
                </h2>
                <p className="text-sm text-gray-500">
                  Preencha os dados para criar uma nova OS
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                aria-label="Fechar modal"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  id="cliente"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione um cliente</option>
                  {clients?.map(client => (
                    <option key={client.id} value={client.nome}>
                      {client.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tecnico" className="block text-sm font-medium text-gray-700 mb-1">
                  Técnico *
                </label>
                <select
                  id="tecnico"
                  name="tecnico"
                  value={formData.tecnico}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione um técnico</option>
                  {technicians?.map(tech => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                  Data Agendada *
                </label>
                <input
                  type="date"
                  id="data"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status Inicial
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                </select>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      <span className="ml-2">Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Salvar Nova OS
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewOrderModal;
