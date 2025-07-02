import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Trash2, Menu } from 'lucide-react';
import { useConversations } from '../../hooks/useConversations';
import { formatters } from '../../utils/formatters';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { conversations, deleteConversation, isLoading, createConversation } = useConversations();
  const { user } = useAuth();
  const { clearMessages } = useApp();
  const [pendingMessage, setPendingMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [formError, setFormError] = useState("");

  const handleDeleteConversation = async (conversationId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(conversationId);
    }
  };

  const handleStartNewConversation = () => {
    setNewTitle("");
    setNewDescription("");
    setFormError("");
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) return;
    if (!newTitle.trim()) {
      setFormError("Title is required");
      return;
    }
    const conversation = await createConversation({ title: newTitle.trim(), description: newDescription.trim(), user_id: user.id });
    if (conversation && conversation._id) {
      clearMessages();
      setShowModal(false);
      navigate(`/chat/${conversation._id}`);
    }
  };

  // Close sidebar when a conversation is selected (on mobile)
  const handleConversationClick = (conversationId) => {
    if (window.innerWidth < 768) setSidebarOpen(false);
    // Add smooth transition for navigation
    setTimeout(() => {
      navigate(`/chat/${conversationId}`);
    }, 120);
  };

  // Overlay click closes sidebar
  const handleOverlayClick = () => setSidebarOpen(false);

  return (
    <>
      {/* Hamburger menu for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 bg-white rounded-full p-2 shadow-lg border border-gray-200"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6 text-blue-600" />
      </button>

      {/* Modal for new conversation title */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Start a New Conversation">
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conversation Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a cool title..."
              value={newTitle}
              onChange={e => { setNewTitle(e.target.value); setFormError(""); }}
              maxLength={40}
              autoFocus
            />
            {formError && <p className="text-sm text-red-600 mt-1">{formError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Describe your conversation..."
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              maxLength={120}
              rows={2}
            />
          </div>
          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-200 text-gray-900 rounded-lg py-2 font-semibold hover:bg-gray-300 transition-colors"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar itself */}
      <div
        className={
          `fixed md:static top-0 left-0 h-full z-40 transition-transform duration-300
          bg-gray-50 border-r border-gray-200 flex flex-col w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:z-0`
        }
        style={{ boxShadow: sidebarOpen ? '0 0 24px 0 rgba(0,0,0,0.10)' : undefined }}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Button
            onClick={handleStartNewConversation}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Conversation</span>
          </Button>
          {/* Close button for mobile sidebar */}
          <button
            className="md:hidden ml-2 p-2 rounded hover:bg-gray-200"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 via-white to-blue-100 transition-colors duration-500">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 pl-1 animate-fade-in">
            Conversations
          </h2>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 animate-fade-in">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50 animate-bounce" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation, idx) => (
                <div
                  key={conversation._id}
                  onClick={() => handleConversationClick(conversation._id)}
                  className="transition-transform duration-200"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div
                    className={`block p-3 rounded-xl shadow-sm hover:shadow-lg hover:bg-blue-100/60 transition-all group cursor-pointer border border-transparent ${location.pathname === `/chat/${conversation._id}` ? 'bg-blue-50 border-blue-300 scale-[1.03]' : 'bg-white hover:scale-[1.01]'}`}
                  >
                    <div className="flex items-start justify-between">
                      {/* Conversation avatar */}
                      <div className="flex-shrink-0 mr-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-200 via-white to-blue-400 flex items-center justify-center border-2 border-gray-300 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl">
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate tracking-wide">
                          {conversation.title}
                        </h3>
                        {conversation.description && (
                          <p className="text-xs text-blue-700/80 mt-1 truncate font-medium">
                            {formatters.truncate(conversation.description, 40)}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatters.relativeTime(conversation.last_message_at || conversation.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteConversation(conversation._id, e); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-100 text-red-600 transition-all ml-2"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;