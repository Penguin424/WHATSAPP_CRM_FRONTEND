export interface IMessagesDB {
  data: Datum[];
  meta: Meta;
}

export interface Datum {
  id: number;
  attributes: DatumAttributes;
}

export interface DatumAttributes {
  dataWS: DataWS;
  de: A;
  a: A;
  tipo: Tipo;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  chat: Chat;
}

export enum A {
  The5213315326783CUs = "5213315326783@c.us",
  The5213319747514CUs = "5213319747514@c.us",
}

export interface Chat {
  data: Data;
}

export interface Data {
  id: number;
  attributes: DataAttributes;
}

export interface DataAttributes {
  ultimo: Ultimo;
  createdAt: Date;
  updatedAt: Date;
}

export enum Ultimo {
  Ohhh = "Ohhh",
}

export interface DataWS {
  id: ID;
  to: A;
  ack: number;
  body: string;
  from: A;
  type: Type;
  _data: DataClass;
  isGif: boolean;
  links?: any[];
  fromMe: boolean;
  vCards: any[];
  hasMedia: boolean;
  isStatus?: boolean;
  broadcast?: boolean;
  isStarred: boolean;
  timestamp: number;
  deviceType: DeviceType;
  isEphemeral?: boolean;
  isForwarded?: boolean;
  hasQuotedMsg: boolean;
  mentionedIds: any[];
  forwardingScore: number;
}

export interface DataClass {
  t: number;
  id: ID;
  to: FromClass | A;
  ack: number;
  body: string;
  from: FromClass | A;
  self: Self;
  star: boolean;
  type: Type;
  links?: any[];
  isAvatar: boolean;
  isNewMsg: boolean;
  broadcast?: boolean;
  recvFresh?: boolean;
  isStatusV3?: boolean;
  notifyName?: NotifyName;
  hasReaction: boolean;
  isEphemeral?: boolean;
  isForwarded?: boolean;
  kicNotified: boolean;
  stickerSentTs: number;
  isFromTemplate: boolean;
  isMdHistoryMsg: boolean;
  pollInvalidated: boolean;
  latestEditMsgKey: null;
  mentionedJidList: any[];
  ephemeralOutOfSync?: boolean;
  lastPlaybackProgress: number;
  isSentCagPollCreation: boolean;
  isVcardOverMmsDocument: boolean;
  isDynamicReplyButtonsMsg: boolean;
  requiresDirectConnection: boolean | null;
  productHeaderImageRejected: boolean;
  latestEditSenderTimestampMs: null;
  pttForwardedFeaturesEnabled: boolean;
  quotedMsg?: QuotedMsg;
  thumbnail?: string;
  inviteGrpType?: string;
  quotedStanzaID?: string;
  quotedParticipant?: A;
  disappearingModeInitiator?: Type;
}

export enum Type {
  Chat = "chat",
  Image = "image",
  Video = "video",
  Audio = "ptt",
  Sticker = "sticker",
}

export interface FromClass {
  user: string;
  server: string;
  _serialized: A;
}

export interface ID {
  id: string;
  fromMe: boolean;
  remote: FromClass | A;
  _serialized: string;
}

export enum NotifyName {
  MaríaMay = "María May",
}

export interface QuotedMsg {
  body: string;
  type: Type;
}

export enum Self {
  In = "in",
  Out = "out",
}

export enum DeviceType {
  Android = "android",
  Web = "web",
}

export enum Tipo {
  Entrante = "ENTRANTE",
  Enviado = "ENVIADO",
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface IMessageSocket {
  id: number;
  dataWS: DataWS;
  de: string;
  a: string;
  tipo: string;
  createdAt: Date;
  updatedAt: Date;
  body: string;
}
