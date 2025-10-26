import React from 'react';
import type { Message } from '../../types/messages';
import { TokenCard } from '../ui/TokenCard';

// Text message component
const TextMessage: React.FC<{ message: any }> = ({ message }) => {
  return (
    <div className="p-3 rounded-lg bg-gray-800 text-gray-200 max-w-md">
      <p className="text-sm whitespace-pre-wrap">{message.content.text}</p>
    </div>
  );
};

// Token card message component
const TokenCardMessage: React.FC<{ message: any }> = ({ message }) => {
  const { tokenInfo, cardType = 'compact' } = message.content.data;

  return (
    <div className="my-2">
      <TokenCard data={tokenInfo} compact={cardType === 'compact'} />
    </div>
  );
};

// Message router component
export const MessageRenderer: React.FC<{ message: Message }> = ({ message }) => {
  const messageType = message.content.messageType || 'TEXT';

  switch (messageType) {
    case 'TOKEN_CARD':
      return <TokenCardMessage message={message} />;
    case 'TEXT':
    default:
      return <TextMessage message={message} />;
  }
};

// Message list component
export const MessageList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-lg ${
              message.sender === 'user' ? 'order-2' : 'order-1'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">
              {message.sender === 'user' ? 'You' : 'AI Assistant'}
            </div>
            <MessageRenderer message={message} />
          </div>
        </div>
      ))}
    </div>
  );
};