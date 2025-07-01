export const API_BASE_URL = 'https://englishbot-devs.onrender.com';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  GET_USER: '/auth/user',
  SIGNUP: '/auth/signup',

  // Conversations
  CONVERSATIONS: '/conversation/',
  DELETE_CONVERSATION: (id) => `/conversation/${id}`,

  // Messages
  ADD_MESSAGE: (conversationId) => `/message/${conversationId}/message`,
  GET_HISTORY: (conversationId) => `/message/${conversationId}/history`,
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};