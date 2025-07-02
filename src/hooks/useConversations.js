import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { conversationService } from '../services/conversationService';
import { MESSAGES } from '../constants/messages';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const useConversations = () => {
  const { conversations, dispatch } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchConversations = async () => {
    if (!user || !user.id) return;
    setIsLoading(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await conversationService.getConversations(user.id);
      if (result.success) {
        dispatch({ type: 'SET_CONVERSATIONS', payload: result.data });
      } else {
        toast.error(result.error || MESSAGES.CONVERSATION_LOAD_ERROR);
      }
    } catch (error) {
      toast.error(MESSAGES.CONVERSATION_LOAD_ERROR);
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createConversation = async (conversationData) => {
    try {
      const result = await conversationService.createConversation(conversationData);
      if (result.success) {
        dispatch({ type: 'ADD_CONVERSATION', payload: result.data });
        toast.success(MESSAGES.CONVERSATION_CREATED);
        return result.data;
      } else {
        // Handle error: if result.error is an object/array, stringify or show a generic message
        let errorMsg = result.error;
        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof errorMsg === 'object') {
          errorMsg = errorMsg.msg || JSON.stringify(errorMsg);
        }
        toast.error(errorMsg || MESSAGES.SOMETHING_WENT_WRONG);
        return null;
      }
    } catch (error) {
      toast.error(MESSAGES.SOMETHING_WENT_WRONG);
      return null;
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      const result = await conversationService.deleteConversation(conversationId);
      if (result.success) {
        dispatch({ type: 'REMOVE_CONVERSATION', payload: conversationId });
        toast.success(MESSAGES.CONVERSATION_DELETED);
        return true;
      } else {
        toast.error(result.error || MESSAGES.CONVERSATION_DELETE_ERROR);
        return false;
      }
    } catch (error) {
      toast.error(MESSAGES.CONVERSATION_DELETE_ERROR);
      return false;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    isLoading,
    fetchConversations,
    createConversation,
    deleteConversation,
  };
};