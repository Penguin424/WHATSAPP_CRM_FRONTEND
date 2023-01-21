export interface IChatsDB {
  id: number;
  ultimo: string;
  createdAt: Date;
  updatedAt: Date;
  vendedor: Vendedor;
  cliente: Cliente;
}

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendedor {
  id: number;
  username: string;
  email: string;
  provider: string;
  password: string;
  resetPasswordToken: null;
  confirmationToken: null;
  confirmed: boolean;
  blocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
