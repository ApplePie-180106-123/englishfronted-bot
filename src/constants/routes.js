export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CHAT: '/chat/:conversationId',
  CHAT_BASE: '/chat',
};

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.CHAT_BASE,
];