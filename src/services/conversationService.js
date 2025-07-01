import axiosClient from './axiosClient';
import { API_ENDPOINTS } from '../constants/api';

export const conversationService = {
  createConversation: async (conversationData) => {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.CONVERSATIONS, conversationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to create conversation',
      };
    }
  },
  
  getConversations: async () => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.CONVERSATIONS);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch conversations',
      };
    }
  },
  
  deleteConversation: async (conversationId) => {
    try {
      await axiosClient.delete(API_ENDPOINTS.DELETE_CONVERSATION(conversationId));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete conversation',
      };
    }
  },
};