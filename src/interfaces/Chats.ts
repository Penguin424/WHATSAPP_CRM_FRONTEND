export interface IChatsDB {
  id: number;
  ultimo: string;
  createdAt: Date;
  updatedAt: Date;
  vendedor: Vendedor;
  cliente: Cliente;
  campana: Campana;
  etapa: Cliente;
}

export interface Campana {
  id: number;
  nombre: string;
  claves: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  etapas: Cliente[];
}

export interface Cliente {
  id: number;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  telefono?: string;
}

export interface Vendedor {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
