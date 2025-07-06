import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from '../../hooks/useMessages';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/layout/Layout';
import MessageList from '../../components/message/MessageList';
import MessageInput from '../../components/message/MessageInput';
import { MessageSquare, Pencil } from 'lucide-react';
import Modal from '../../components/common/Modal';
import VoiceChatModal from '../../components/message/VoiceChatModal';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { conversations } = useApp();
  const { messages, isLoading, isSending, sendMessage } = useMessages(conversationId);

  const currentConversation = conversations.find(conv => conv._id === conversationId);
  const [profileOpen, setProfileOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      navigate('/dashboard');
    }
  }, [conversationId, navigate]);

  const handleSendMessage = async (messageData) => {
    if (!conversationId) return;

    await sendMessage(messageData);
  };

  // For image upload (simulate backend update)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      // Simulate upload and preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // TODO: send to backend and update conversation imageUrl
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Voice chat handler: send user text to backend, get bot reply
  const handleVoiceChat = async (userText) => {
    if (!conversationId) return 'No conversation selected.';
    try {
      const result = await sendMessage({
        content: userText,
        sender_id: 'user',
        message_type: 'text',
      });
      if (result && result.content) {
        return result.content;
      } else {
        return 'Sorry, I could not get a reply from the bot.';
      }
    } catch (err) {
      return 'Sorry, there was a problem contacting the bot.';
    }
  };

  if (!conversationId) {
    return null;
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div
          className="bg-white border-b border-gray-200 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setProfileOpen(true)}
        >
          <div className="flex items-center gap-4">
            {/* Conversation avatar (icon style, matches sidebar, or image if set) */}
            {currentConversation?.imageUrl || imagePreview ? (
              <img
                src={imagePreview || currentConversation?.imageUrl}
                alt="Profile"
                className="h-12 w-12 rounded-full object-cover border border-gray-200 bg-white"
                onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {currentConversation?.title || 'Chat'}
              </h1>
              {currentConversation?.description && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {currentConversation.description}
                </p>
              )}
            </div>
            <Pencil className="h-5 w-5 text-gray-400 ml-2" />
          </div>
        </div>

        {/* Profile Modal */}
        <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} size="md" title={null}>
          <div className="flex flex-col items-center p-4 animate-fade-in">
            {/* Large profile image or icon */}
            <label className="relative group cursor-pointer mb-4">
              {currentConversation?.imageUrl || imagePreview ? (
                <img
                  src={imagePreview || currentConversation?.imageUrl}
                  alt="Profile"
                  className="h-28 w-28 rounded-full object-cover border-4 border-blue-200 shadow-lg transition-all duration-300 group-hover:opacity-80"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-200 shadow-lg transition-all duration-300 group-hover:opacity-80">
                  <MessageSquare className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageChange}
                disabled={uploading}
              />
              <span className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-md opacity-80 group-hover:opacity-100 transition-all">
                <Pencil className="h-4 w-4" />
              </span>
            </label>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center break-words">
              {currentConversation?.title || 'Chat'}
            </h2>
            {currentConversation?.description && (
              <p className="text-gray-700 text-center max-w-xs break-words mb-2">
                {currentConversation.description}
              </p>
            )}
            {/* (Optional: Save button for backend update) */}
          </div>
        </Modal>

        {/* Messages */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isSending}
          onVoiceChat={(userText) => handleVoiceChat(userText)}
        />
        <VoiceChatModal
          isOpen={voiceModalOpen}
          onClose={() => setVoiceModalOpen(false)}
          onSendToBackend={handleVoiceChat}
        />
      </div>
    </Layout>
  );
};

export default ChatPage;