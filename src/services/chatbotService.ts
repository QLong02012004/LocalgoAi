import instance from "../utils/AxiosCustomize";
import type { BackendResponse } from "../types/backend";

export interface ChatSession {
  id: number;
  userId: number;
  itineraryId: number | null;
  messageCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageResponse {
  id: number;
  sessionId: number;
  sender: 'USER' | 'AI';
  content: string;
  createdAt: string;
}

export interface RAGMessageResponse {
  id: number;
  sessionId: number;
  itineraryId: number | null;
  userMessage: string | null;
  aiResponse: string | null;
  relevantActivities: any[] | null;
  timestamp: string;
  intent: string | null;
  processingTime: number | null;
}

export interface SendMessageRequest {
  sessionId: number;
  message: string;
}

export const chatbotService = {
  // Setup & Configuration
  createSession: (itineraryId?: number): Promise<{ data: BackendResponse<ChatSession> }> => {
    console.log("[ChatbotService] createSession called with itineraryId:", itineraryId);
    const params = itineraryId ? { itineraryId } : undefined;
    return instance.post('/chatbot-rag/sessions', {}, { params });
  },

  getOrCreateSession: (itineraryId?: number): Promise<{ data: BackendResponse<ChatSession> }> => {
    console.log("[ChatbotService] getOrCreateSession called with itineraryId:", itineraryId);
    const params = itineraryId ? { itineraryId } : undefined;
    return instance.get('/chatbot-rag/sessions', { params });
  },

  getUserSessions: (): Promise<{ data: BackendResponse<ChatSession[]> }> => {
    console.log("[ChatbotService] getUserSessions called");
    return instance.get('/chatbot-rag/sessions/my-sessions');
  },

  deleteSession: (sessionId: number): Promise<{ data: BackendResponse<void> }> =>
    instance.delete(`/chatbot-rag/sessions/${sessionId}`),

  // Chat Messages
  sendMessage: (sessionId: number, message: string, itineraryId?: number, intent: string = 'question'): Promise<{ data: BackendResponse<RAGMessageResponse> }> => {
    console.log("[ChatbotService] sendMessage called - URL: /chatbot-rag/messages", { sessionId, itineraryId, intent });
    const payload: any = {
      sessionId,
      message,
      userIntent: intent
    };
    if (itineraryId) {
      payload.itineraryId = itineraryId;
    }
    return instance.post('/chatbot-rag/messages', payload);
  },

  getChatHistory: (sessionId: number): Promise<{ data: BackendResponse<RAGMessageResponse[]> }> =>
    instance.get(`/chatbot-rag/sessions/${sessionId}/messages`),

  // Specific intents if needed
  sendMessageWithIntent: (sessionId: number, message: string, intent: 'QUESTION' | 'OPTIMIZE' | 'MODIFY'): Promise<{ data: BackendResponse<ChatMessageResponse> }> =>
    instance.post(`/chatbot-rag/chat/send-${intent.toLowerCase()}`, { sessionId, message }),
};
