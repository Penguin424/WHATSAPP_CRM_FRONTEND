export interface IChatsDB {
  data: Datum[];
  meta: Meta;
}

export interface Datum {
  id: number;
  attributes: DatumAttributes;
}

export interface DatumAttributes {
  ultimo: string;
  createdAt: Date;
  updatedAt: Date;
  cliente: Cliente;
}

export interface Cliente {
  data: Data;
}

export interface Data {
  id: number;
  attributes: DataAttributes;
}

export interface DataAttributes {
  nombre: string;
  telefono: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
}
