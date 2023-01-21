export interface IMessagesDB {
  id: number;
  createdAt: Date;
  dataWS: DataWS;
  de: string;
  a: string;
  tipo: string;
  updatedAt: Date;
  body: string;
  chat: Chat;
}

export interface Chat {
  id: number;
  ultimo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataWS {
  id: ID;
  to: string;
  ack: number;
  body: string;
  from: string;
  type: string;
  _data: Data;
  isGif: boolean;
  fromMe: boolean;
  vCards: any[];
  hasMedia: boolean;
  isStarred: boolean;
  timestamp: number;
  deviceType: string;
  isForwarded: boolean;
  hasQuotedMsg: boolean;
  mentionedIds: any[];
  forwardingScore: number;
}

export interface Data {
  t: number;
  id: ID;
  to: From;
  ack: number;
  body: string;
  from: From;
  self: string;
  star: boolean;
  type: string;
  isAvatar: boolean;
  isNewMsg: boolean;
  hasReaction: boolean;
  isForwarded: boolean;
  kicNotified: boolean;
  stickerSentTs: number;
  isFromTemplate: boolean;
  isMdHistoryMsg: boolean;
  pollInvalidated: boolean;
  latestEditMsgKey: null;
  mentionedJidList: any[];
  lastPlaybackProgress: number;
  isSentCagPollCreation: boolean;
  isVcardOverMmsDocument: boolean;
  isDynamicReplyButtonsMsg: boolean;
  requiresDirectConnection: null;
  disappearingModeInitiator: string;
  productHeaderImageRejected: boolean;
  latestEditSenderTimestampMs: null;
  pttForwardedFeaturesEnabled: boolean;
}

export interface From {
  user: string;
  server: string;
  _serialized: string;
}

export interface ID {
  id: string;
  fromMe: boolean;
  remote: From;
  _serialized: string;
}
