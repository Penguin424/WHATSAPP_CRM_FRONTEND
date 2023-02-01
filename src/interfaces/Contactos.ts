export interface IContactosDB {
  id: number;
  attributes: IContactosDBAttributes;
}

export interface IContactosDBAttributes {
  ultimo: string;
  createdAt: Date;
  updatedAt: Date;
  vendedor: Vendedor;
  cliente: Cliente;
}

export interface Cliente {
  data: ClienteData;
}

export interface ClienteData {
  id: number;
  attributes: PurpleAttributes;
}

export interface PurpleAttributes {
  nombre: string;
  telefono: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendedor {
  data: VendedorData | null;
}

export interface VendedorData {
  id: number;
  attributes: FluffyAttributes;
}

export interface FluffyAttributes {
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
