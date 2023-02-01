export interface IMessagesDB {
  id: number;
  dataWS: DataWS;
  de: string;
  a: string;
  tipo: string;
  createdAt: Date;
  updatedAt: Date;
  body: string;
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
  links: any[];
  fromMe: boolean;
  vCards: any[];
  hasMedia: boolean;
  isStatus: boolean;
  broadcast: boolean;
  isStarred: boolean;
  timestamp: number;
  deviceType: string;
  isEphemeral: boolean;
  isForwarded: boolean;
  hasQuotedMsg: boolean;
  mentionedIds: any[];
  forwardingScore: number;
}

export interface Data {
  t: number;
  id: ID;
  to: string;
  ack: number;
  body: string;
  from: string;
  self: string;
  star: boolean;
  type: string;
  links: any[];
  labels: any[];
  subtype: string;
  isAvatar: boolean;
  isNewMsg: boolean;
  broadcast: boolean;
  recvFresh: boolean;
  thumbnail: string;
  isStatusV3: boolean;
  notifyName: string;
  ctwaContext: CtwaContext;
  hasReaction: boolean;
  isEphemeral: boolean;
  isForwarded: boolean;
  kicNotified: boolean;
  inviteGrpType: string;
  stickerSentTs: number;
  isFromTemplate: boolean;
  isMdHistoryMsg: boolean;
  pollInvalidated: boolean;
  richPreviewType: number;
  latestEditMsgKey: null;
  mentionedJidList: any[];
  lastPlaybackProgress: number;
  isSentCagPollCreation: boolean;
  isVcardOverMmsDocument: boolean;
  isDynamicReplyButtonsMsg: boolean;
  requiresDirectConnection: boolean;
  productHeaderImageRejected: boolean;
  latestEditSenderTimestampMs: null;
  pttForwardedFeaturesEnabled: boolean;
}

export interface CtwaContext {
  title: string;
  mediaType: number;
  sourceUrl: string;
  thumbnail: string;
  description: string;
  thumbnailUrl: string;
  conversionData: ConversionData;
  conversionSource: string;
}

export interface ConversionData {}

export interface ID {
  id: string;
  fromMe: boolean;
  remote: string;
  _serialized: string;
}
