import type { TokenData } from './token';

export interface BaseMessage {
  id: string;
  content: {
    text: string;
    messageType?: 'TEXT' | 'TOKEN_CARD' | 'NEWS' | 'IMAGE';
    data?: any;
  };
  sender: 'user' | 'agent';
  timestamp: Date;
}

export interface TokenCardMessage extends BaseMessage {
  content: {
    text: string;
    messageType: 'TOKEN_CARD';
    data: {
      tokenInfo: TokenData;
      cardType?: 'detailed' | 'compact';
    };
  };
}

export interface TextMessage extends BaseMessage {
  content: {
    text: string;
    messageType: 'TEXT';
  };
}

export type Message = TextMessage | TokenCardMessage;