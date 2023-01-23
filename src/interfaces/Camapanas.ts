export interface ICampanasDB {
  id: number;
  nombre: string;
  claves: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  etapas: Etapa[];
  chats: Chat[];
}

export interface Chat {
  id: number;
  ultimo: string;
  createdAt: Date;
  updatedAt: Date;
  etapa: Etapa;
}

export interface Etapa {
  id: number;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}
