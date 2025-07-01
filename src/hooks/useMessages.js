import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { messageService } from '../services/messageService';
import { MESSAGES } from '../constants/messages';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

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

    // Optimistically add the user's message to the chat
    const tempId = uuidv4();
    const optimisticMessage = {
      ...messageData,
      _id: tempId,
      conversation_id: conversationId,
      timestamp: new Date().toISOString(),
      corrections: '',
      grammar_score: undefined,
      isOptimistic: true,
    };
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId, message: optimisticMessage },
    });

    try {
      const result = await messageService.sendMessage(conversationId, messageData);
      if (result.success) {
        // Instead of replacing the user's message, update it with corrections/grammar from the bot's response
        // and add the bot's reply as a new message
        const updatedUserMessage = {
          ...optimisticMessage,
          corrections: result.data.corrections,
          grammar_score: result.data.grammar_score,
          isOptimistic: false,
        };
        const botMessage = result.data;
        dispatch({
          type: 'SET_MESSAGES',
          payload: {
            conversationId,
            messages: [
              ...conversationMessages.filter((msg) => msg._id !== tempId),
              updatedUserMessage,
              botMessage,
            ],
          },
        });
        return result.data;
      } else {
        // Remove the optimistic message and show error
        dispatch({
          type: 'SET_MESSAGES',
          payload: {
            conversationId,
            messages: conversationMessages.filter((msg) => msg._id !== tempId),
          },
        });
        toast.error(result.error || MESSAGES.MESSAGE_SEND_ERROR);
        return null;
      }
    } catch (error) {
      // Remove the optimistic message and show error
      dispatch({
        type: 'SET_MESSAGES',
        payload: {
          conversationId,
          messages: conversationMessages.filter((msg) => msg._id !== tempId),
        },
      });
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