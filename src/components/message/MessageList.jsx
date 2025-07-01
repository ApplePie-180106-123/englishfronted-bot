import React, { useEffect, useRef } from 'react';
import { formatters } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const MessageList = ({ messages, isLoading }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No messages yet</p>
          <p className="text-sm text-gray-400">Start a conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isUser = message.sender_id === 'user' || message.sender_id === user?.id;
        return (
          <div
            key={message._id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${isUser
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}>
              <p className="text-sm break-words whitespace-pre-line">{message.content}</p>
              <p
                className={`text-xs mt-1 ${isUser ? 'text-blue-100 text-right' : 'text-gray-500 text-left'
                  }`}
              >
                {formatters.relativeTime(message.timestamp)}
              </p>
              {/* Show correction and grammar score only for user messages */}
              {isUser && (message.corrections || message.grammar_score !== undefined) && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  {message.corrections && (
                    <div className="text-xs text-blue-100 text-right">
                      <span className="font-semibold">Corrected:</span> {message.corrections}
                    </div>
                  )}
                  {message.grammar_score !== undefined && (
                    <div className="text-xs text-blue-100 text-right">
                      <span className="font-semibold">Grammar Score:</span> {Math.round(message.grammar_score * 100)}%
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;