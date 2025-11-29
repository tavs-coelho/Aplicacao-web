// MyAccount component - Allows users to update their name and password
// Componente Minha Conta - Permite aos usuários atualizar nome e senha

import { useState } from 'react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function MyAccount({ currentUser, onUserUpdate }) {
  const [nome, setNome] = useState(currentUser?.nome || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validate password fields if user wants to change password
    if (novaSenha || confirmarSenha || senhaAtual) {
      if (!senhaAtual) {
        newErrors.senhaAtual = 'Informe a senha atual para alterar a senha';
      }
      if (!novaSenha) {
        newErrors.novaSenha = 'Informe a nova senha';
      } else if (novaSenha.length < 6) {
        newErrors.novaSenha = 'A nova senha deve ter pelo menos 6 caracteres';
      }
      if (novaSenha !== confirmarSenha) {
        newErrors.confirmarSenha = 'As senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get token from localStorage
      // NOTE: In a production app, this should use a secure auth context or httpOnly cookies
      // to prevent XSS attacks. For this demo app, localStorage is used for simplicity.
      const token = localStorage.getItem('token');
      
      // Build request body
      const body = {};
      
      // Only include name if it changed
      if (nome !== currentUser?.nome) {
        body.nome = nome.trim();
      }
      
      // Include password fields if user wants to change password
      if (novaSenha && senhaAtual) {
        body.senhaAtual = senhaAtual;
        body.novaSenha = novaSenha;
      }

      // Check if there's anything to update
      if (Object.keys(body).length === 0) {
        // Use info toast instead of success since no action was performed
        toast('Nenhuma alteração detectada', { icon: 'ℹ️' });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${API_URL}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          if (data.message?.includes('Senha atual')) {
            setErrors({ senhaAtual: data.message });
          } else {
            toast.error('Sessão expirada. Por favor, faça login novamente.');
          }
        } else {
          toast.error(data.message || 'Erro ao atualizar dados');
        }
        return;
      }

      // Update parent component with new user data
      if (onUserUpdate && data.user) {
        onUserUpdate(data.user);
      }

      // Clear password fields on success
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setErrors({});

      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Error updating user data:', error);
      toast.error('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Minha Conta</h2>
          <p className="text-sm text-gray-500">
            Atualize suas informações pessoais e senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Info Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700 border-b pb-2">
              Informações Pessoais
            </h3>
            
            {/* Email (read-only) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={currentUser?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                O email não pode ser alterado
              </p>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.nome ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Seu nome completo"
              />
              {errors.nome && (
                <p className="mt-1 text-xs text-red-500">{errors.nome}</p>
              )}
            </div>

            {/* User Type (read-only) */}
            <div>
              <label
                htmlFor="tipo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo de Usuário
              </label>
              <input
                type="text"
                id="tipo"
                value={currentUser?.tipo === 'ADMIN' ? 'Administrador' : 'Técnico'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700 border-b pb-2">
              Alterar Senha
            </h3>
            <p className="text-sm text-gray-500">
              Deixe os campos em branco se não quiser alterar a senha
            </p>

            {/* Current Password */}
            <div>
              <label
                htmlFor="senhaAtual"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha Atual
              </label>
              <input
                type="password"
                id="senhaAtual"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.senhaAtual ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite sua senha atual"
              />
              {errors.senhaAtual && (
                <p className="mt-1 text-xs text-red-500">{errors.senhaAtual}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="novaSenha"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nova Senha
              </label>
              <input
                type="password"
                id="novaSenha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.novaSenha ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite a nova senha"
              />
              {errors.novaSenha && (
                <p className="mt-1 text-xs text-red-500">{errors.novaSenha}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmarSenha"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirme a nova senha"
              />
              {errors.confirmarSenha && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmarSenha}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 animate-spin">⏳</span>
                  Salvando...
                </span>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MyAccount;
