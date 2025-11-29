// Types based on backend Prisma schema

export type UserType = 'ADMIN' | 'TECNICO';

export type ServiceOrderStatus = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export type PhotoType = 'ANTES' | 'DEPOIS';

export interface User {
  id: string;
  nome: string;
  email: string;
  tipo: UserType;
}

export interface Client {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  telefone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePhoto {
  id: string;
  url: string;
  tipo: PhotoType;
  createdAt: string;
  updatedAt: string;
  serviceOrderId: string;
}

export interface ServiceOrder {
  id: string;
  dataAgendada: string;
  status: ServiceOrderStatus;
  dataInicio: string | null;
  dataFim: string | null;
  relatorioTecnico: string | null;
  rating: number | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  tecnicoId: string;
  clienteId: string;
  cliente: Client;
  photos: ServicePhoto[];
}

export interface TechOrdersResponse {
  tecnico: {
    id: string;
    nome: string;
  };
  serviceOrders: ServiceOrder[];
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// Navigation Types
export type RootStackParamList = {
  MyOrders: undefined;
  OrderDetails: { order: ServiceOrder };
  Rating: { orderId: string };
};
