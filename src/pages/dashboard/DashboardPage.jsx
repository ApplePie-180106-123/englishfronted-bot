import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, Clock } from 'lucide-react';
import { useConversations } from '../../hooks/useConversations';
import { formatters } from '../../utils/formatters';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DashboardPage = () => {
  const { conversations, isLoading } = useConversations();

  const recentConversations = conversations.slice(0, 5);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Linguabot
          </h1>
          <p className="text-gray-600">
            Your AI-powered conversational partner for language learning and practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {conversations.length}
                </p>
                <p className="text-sm text-gray-600">Total Conversations</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {recentConversations.length}
                </p>
                <p className="text-sm text-gray-600">Recent Chats</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Link to="/chat" className="block hover:bg-gray-50 transition-colors rounded-lg">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-lg font-semibold text-gray-900">Start New</p>
                  <p className="text-sm text-gray-600">Begin Conversation</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Conversations
            </h2>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <LoadingSpinner className="py-8" />
            ) : recentConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No conversations yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start your first conversation to begin practicing with AI.
                </p>
                <Button as={Link} to="/chat">
                  Start New Conversation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentConversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    to={`/chat/${conversation.id}`}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {conversation.title}
                        </h3>
                        {conversation.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {formatters.truncate(conversation.description, 100)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatters.relativeTime(conversation.last_message_at || conversation.created_at)}
                        </p>
                      </div>
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
                
                {conversations.length > 5 && (
                  <div className="text-center pt-4">
                    <Button
                      variant="ghost"
                      as={Link}
                      to="/conversations"
                    >
                      View All Conversations
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;