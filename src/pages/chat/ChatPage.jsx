import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from '../../hooks/useMessages';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/layout/Layout';
import MessageList from '../../components/message/MessageList';
import MessageInput from '../../components/message/MessageInput';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { conversations } = useApp();
  const { messages, isLoading, isSending, sendMessage } = useMessages(conversationId);

  const currentConversation = conversations.find(conv => conv.id === conversationId);

  useEffect(() => {
    if (!conversationId) {
      navigate('/dashboard');
    }
  }, [conversationId, navigate]);

  const handleSendMessage = async (messageData) => {
    if (!conversationId) return;
    
    await sendMessage(messageData);
  };

  if (!conversationId) {
    return null;
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                {currentConversation?.title || 'Chat'}
              </h1>
              {currentConversation?.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {currentConversation.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Message Input */}
        <MessageInput onSendMessage={handleSendMessage} isLoading={isSending} />
      </div>
    </Layout>
  );
};

export default ChatPage;