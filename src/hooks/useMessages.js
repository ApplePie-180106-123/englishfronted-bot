import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { messageService } from '../services/messageService';
import { MESSAGES } from '../constants/messages';
import toast from 'react-hot-toast';

export const useMessages = (conversationId) => {
  const { messages, dispatch } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const conversationMessages = messages[conversationId] || [];

  const fetchMessages = async (limit = 50, offset = 0) => {
    if (!conversationId) return;
    
    setIsLoading(true);
    
    try {
      const result = await messageService.getConversationHistory(conversationId, limit, offset);
      if (result.success) {
        dispatch({
          type: 'SET_MESSAGES',
          payload: { conversationId, messages: result.data.reverse() },
        });
      } else {
        toast.error(result.error || MESSAGES.MESSAGE_LOAD_ERROR);
      }
    } catch (error) {
      toast.error(MESSAGES.MESSAGE_LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageData) => {
    if (!conversationId) return;
    
    setIsSending(true);
    
    try {
      const result = await messageService.sendMessage(conversationId, messageData);
      if (result.success) {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { conversationId, message: result.data },
        });
        return result.data;
      } else {
        toast.error(result.error || MESSAGES.MESSAGE_SEND_ERROR);
        return null;
      }
    } catch (error) {
      toast.error(MESSAGES.MESSAGE_SEND_ERROR);
      return null;
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  return {
    messages: conversationMessages,
    isLoading,
    isSending,
    fetchMessages,
    sendMessage,
  };
};