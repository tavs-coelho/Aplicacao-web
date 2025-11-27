import React, { useState, useEffect } from 'react';

/**
 * Modal component for creating a new Service Order (Ordem de Serviço - OS).
 * Provides form fields for selecting client, technician, and scheduling date/time.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback function when modal is closed
 * @param {Function} props.onSave - Optional callback after successful save
 * @param {string} props.apiBaseUrl - Base URL for API calls (default: '')
 * @param {string} props.authToken - JWT authentication token for API requests
 */
function NewOrderModal({ isOpen, onClose, onSave, apiBaseUrl = '', authToken }) {
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [selectedTecnicoId, setSelectedTecnicoId] = useState('');
  const [dataAgendada, setDataAgendada] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch clients and technicians when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchClientes();
      fetchTecnicos();
      // Reset form fields
      setSelectedClienteId('');
      setSelectedTecnicoId('');
      setDataAgendada('');
      setError('');
    }
  }, [isOpen]);

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/clients`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setClientes(data.clients || data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const fetchTecnicos = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/users?tipo=TECNICO`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTecnicos(data.users || data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar técnicos:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!selectedClienteId || !selectedTecnicoId || !dataAgendada) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clienteId: selectedClienteId,
          tecnicoId: selectedTecnicoId,
          dataAgendada: new Date(dataAgendada).toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (onSave) {
          onSave(result.serviceOrder);
        }
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar ordem de serviço');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error('Erro ao criar OS:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="modal-content" style={styles.modal}>
        <div className="modal-header" style={styles.header}>
          <h2 style={styles.title}>Nova Ordem de Serviço</h2>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div className="error-message" style={styles.error}>
              {error}
            </div>
          )}

          <div className="form-group" style={styles.formGroup}>
            <label htmlFor="cliente-select" style={styles.label}>
              Cliente
            </label>
            <select
              id="cliente-select"
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={styles.formGroup}>
            <label htmlFor="tecnico-select" style={styles.label}>
              Técnico
            </label>
            <select
              id="tecnico-select"
              value={selectedTecnicoId}
              onChange={(e) => setSelectedTecnicoId(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">Selecione um técnico</option>
              {tecnicos.map((tecnico) => (
                <option key={tecnico.id} value={tecnico.id}>
                  {tecnico.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={styles.formGroup}>
            <label htmlFor="data-agendada" style={styles.label}>
              Data e Hora Agendada
            </label>
            <input
              type="datetime-local"
              id="data-agendada"
              value={dataAgendada}
              onChange={(e) => setDataAgendada(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div className="form-actions" style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#333',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#666',
    lineHeight: 1,
    padding: '0 8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontWeight: '500',
    color: '#444',
    fontSize: '0.9rem',
  },
  select: {
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
  },
  cancelButton: {
    padding: '10px 20px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  saveButton: {
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c00',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
};

export default NewOrderModal;
