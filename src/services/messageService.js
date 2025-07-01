import axiosClient from './axiosClient';
import { API_ENDPOINTS } from '../constants/api';

export const messageService = {
  sendMessage: async (conversationId, messageData) => {
    try {
      const response = await axiosClient.post(
        API_ENDPOINTS.ADD_MESSAGE(conversationId),
        messageData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to send message',
      };
    }
  },
  
  getConversationHistory: async (conversationId, limit = 20, offset = 0) => {
    try {
      const response = await axiosClient.get(
        API_ENDPOINTS.GET_HISTORY(conversationId),
        {
          params: { limit, offset },
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch messages',
      };
    }
  },
};