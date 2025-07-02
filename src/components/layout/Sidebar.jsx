import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { useConversations } from '../../hooks/useConversations';
import { formatters } from '../../utils/formatters';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { conversations, deleteConversation, isLoading, createConversation } = useConversations();
  const { user } = useAuth();
  const { clearMessages } = useApp();

  const handleDeleteConversation = async (conversationId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(conversationId);
    }
  };

  const handleCreateConversation = async () => {
    if (!user || !user.id) {
      // Optionally show an error toast here
      return;
    }
    const conversation = await createConversation({ title: 'new title', user_id: user.id });
    if (conversation && conversation._id) {
      clearMessages(); // Clear all messages state before navigating
      navigate(`/chat/${conversation._id}`);
    }
  };

  return (
    <>
      <div className="w-64 bg-gray-50 border-r border-gray-200 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={handleCreateConversation}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Conversation</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Conversations
          </h2>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Link
                  key={conversation._id}
                  to={`/chat/${conversation._id}`}
                  className={`block p-3 rounded-lg hover:bg-gray-100 transition-colors group ${location.pathname === `/chat/${conversation._id}` ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title}
                      </h3>
                      {conversation.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {formatters.truncate(conversation.description, 40)}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatters.relativeTime(conversation.last_message_at || conversation.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conversation._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-600 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;