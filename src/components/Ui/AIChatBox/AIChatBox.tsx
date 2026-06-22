import React, { useState, useEffect, useRef } from 'react';
import styles from './AIChatBox.module.scss';
import { 
  CalendarBlank,
  Clock,
  PaperPlaneTilt, 
  Robot, 
  X, 
  Minus, 
  Plus,
  ChatCircleDots,
  DotsThreeOutline,
  Star,
  Sparkle,
  ClockCounterClockwise,
  Trash,
  SignIn
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotService, type ChatSession, type RAGMessageResponse } from '../../../services/chatbotService';
import { itineraryService, type GeneratedItinerary } from '../../../services/itineraryService';
import { type Hotel, type AdminItinerary, type ItineraryActivity } from '../../../services/adminService';
import { getAttractions, type HighlightItem } from '../../../services/highlightService';
import { getAttractionDetail, type Destination } from '../../../services/destinationService';

// Local Assets
import banhMiImg from '../../../assets/images/img/Bánh mì Phượng.jpg';
import comGaImg from '../../../assets/images/img/Cơm gà Bà Buội .jpg';
import caoLauImg from '../../../assets/images/img/Cao Lầu Thanh.jpg';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isItineraryList?: boolean;
  isLoginPrompt?: boolean;
  suggestions?: string[];
  hotels?: any[];
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  text: 'Xin chào! Tôi là TravelAi Assistant. Hãy chọn một lộ trình bên dưới để tôi tư vấn, hoặc yêu cầu bất cứ thông tin du lịch nào bạn cần nhé!',
  sender: 'ai',
  timestamp: new Date()
};

const QUICK_REPLIES = [
  { icon: '🗺️', text: 'Tối ưu lộ trình đã chọn', intent: 'optimize' },
  { icon: '🍽️', text: 'Gợi ý món ngon địa phương', intent: 'food' },
  { icon: '🏨', text: 'Tìm khách sạn gần đây', intent: 'hotel' },
  { icon: '🏛️', text: 'Địa điểm tham quan nổi bật', intent: 'place' },
];

interface AIChatBoxProps {
  itineraryId?: number;
}

interface FoodItem {
  name: string;
  desc: string;
  img: string;
}

// Helper to calculate distance in KM
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const TypewriterText: React.FC<{ text: string, speed?: number, onUpdate?: () => void }> = ({ text, speed = 8, onUpdate }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
        if (onUpdate) onUpdate();
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed, onUpdate]);

  return (
    <span>
      {displayedText}
      {index < text.length && <span className={styles.textCursor} />}
    </span>
  );
};

const AILogo: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="aiLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#33d7d1" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
      <filter id="aiGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Inner background shield */}
    <circle cx="16" cy="16" r="14" fill="#0f172a" fillOpacity="0.85" stroke="url(#aiLogoGrad)" strokeWidth="1.5" />
    
    {/* Neural network lines */}
    <path d="M8 16H24" stroke="url(#aiLogoGrad)" strokeWidth="0.75" strokeOpacity="0.35" strokeDasharray="2 2" />
    <path d="M16 8V24" stroke="url(#aiLogoGrad)" strokeWidth="0.75" strokeOpacity="0.35" strokeDasharray="2 2" />
    <path d="M10 10L22 22" stroke="url(#aiLogoGrad)" strokeWidth="0.75" strokeOpacity="0.35" strokeDasharray="2 2" />
    <path d="M22 10L10 22" stroke="url(#aiLogoGrad)" strokeWidth="0.75" strokeOpacity="0.35" strokeDasharray="2 2" />

    {/* Dynamic central AI sparkle */}
    <path 
      d="M16 8C16 12 12 16 8 16C12 16 16 20 16 24C16 20 20 16 24 16C20 16 16 12 16 8Z" 
      fill="url(#aiLogoGrad)" 
      filter="url(#aiGlow)" 
    />
    
    {/* Glowing network nodes */}
    <circle cx="16" cy="8" r="2" fill="#33d7d1" filter="url(#aiGlow)">
      <animate attributeName="r" values="1.5;2.5;1.5" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="16" cy="24" r="2" fill="#33d7d1" filter="url(#aiGlow)">
      <animate attributeName="r" values="2.5;1.5;2.5" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="8" cy="16" r="2" fill="#0ea5e9" filter="url(#aiGlow)">
      <animate attributeName="r" values="2;3;2" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="24" cy="16" r="2" fill="#0ea5e9" filter="url(#aiGlow)">
      <animate attributeName="r" values="3;2;3" dur="3s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const AIChatBox: React.FC<AIChatBoxProps> = ({ itineraryId: propItineraryId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [selectedItineraryId, setSelectedItineraryId] = useState<number | undefined>(propItineraryId);
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const messageAreaRef = useRef<HTMLDivElement>(null);
  
  // Sync selectedItineraryId with props if it changes (e.g. navigating to different itinerary)
  useEffect(() => {
    if (propItineraryId && propItineraryId !== selectedItineraryId) {
      setSelectedItineraryId(propItineraryId);
      setSessionId(null);
      setIsInitAttempted(false);
      setMessages([WELCOME_MESSAGE]);
    }
  }, [propItineraryId]);
  const [userItineraries, setUserItineraries] = useState<GeneratedItinerary[]>([]);
  const [isInitAttempted, setIsInitAttempted] = useState(false);
  const [lastUserId, setLastUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSelectionForm, setShowSelectionForm] = useState(true);
  const [selectionMode, setSelectionMode] = useState<'actions' | 'itineraries' | 'hotels' | 'places' | 'foods' | 'map'>('actions');
  const [nearbyHotels, setNearbyHotels] = useState<any[]>([]);
  const [suggestedFoods, setSuggestedFoods] = useState<FoodItem[]>([]);
  const [suggestedPlaces, setSuggestedPlaces] = useState<Partial<Destination>[]>([]);
  const [isLoadingItineraries, setIsLoadingItineraries] = useState(false);
  
  // Chat Sessions History States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [userSessions, setUserSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    const currentUserId = userStr ? JSON.parse(userStr).id : null;
    
    setIsLoggedIn(!!token);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(localStorage.getItem("username") || user.username || "Người dùng");
        setUserAvatar(localStorage.getItem("avatar") || user.avatarUrl || user.avatar_url || user.avatar || "");
      } catch (e) {
        setUserName("Người dùng");
        setUserAvatar("");
      }
    } else {
      setUserName("");
      setUserAvatar("");
    }

    // If logout detected or user changed, reset EVERYTHING
    if (!token || (currentUserId !== lastUserId && lastUserId !== null)) {
      console.log("[AIChatBox] User changed or logged out, resetting state");
      setSessionId(null);
      setIsInitAttempted(false);
      setMessages([WELCOME_MESSAGE]);
      setShowSelectionForm(true);
      setShowSuggestions(true);
      setLastUserId(currentUserId);
    } else if (currentUserId && lastUserId === null) {
      // First time setting the user
      setLastUserId(currentUserId);
    }
  }, [isOpen, lastUserId]);

  const scrollToBottom = (force = false) => {
    const area = messageAreaRef.current;
    if (!area) return;

    // Check if the user is close to the bottom (within 120px)
    const isCloseToBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 120;
    
    if (force || isCloseToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to bottom whenever messages or typing status changes
  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true);
    }
  }, [messages, isTyping, isOpen]);


  const handleNewChat = () => {
    setSessionId(null);
    setSelectedItineraryId(undefined);
    setMessages([WELCOME_MESSAGE]);
    setShowSelectionForm(true);
    setShowSuggestions(true);
    setSelectionMode('actions');
    setIsInitAttempted(false);
    fetchAndShowItineraries();
  };

  // Chat History operations
  const handleToggleHistory = () => {
    const nextState = !isHistoryOpen;
    setIsHistoryOpen(nextState);
    if (nextState) {
      fetchUserSessions();
    }
  };

  const fetchUserSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const res = await chatbotService.getUserSessions();
      if (res.data.status === 200 && res.data.data) {
        setUserSessions(res.data.data);
      }
    } catch (err) {
      console.error("[AIChatBox] Failed to fetch user sessions:", err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const getItineraryTitle = (itineraryId: number | null) => {
    if (!itineraryId) return "Trò chuyện chung";
    const found = userItineraries.find(it => {
      const rawId = it.id || (it as any).itineraryId;
      const id = typeof rawId === 'string' ? parseInt(rawId) : rawId;
      return id === itineraryId;
    });
    return found ? found.title : `Lộ trình #${itineraryId}`;
  };

  const handleSelectSession = async (session: ChatSession) => {
    setIsHistoryOpen(false);
    setSessionId(session.id);
    setSelectedItineraryId(session.itineraryId || undefined);
    setIsTyping(true);
    setShowSelectionForm(false);
    
    try {
      const historyRes = await chatbotService.getChatHistory(session.id);
      if (historyRes.data.status === 200 && historyRes.data.data) {
        const history: Message[] = [];
        
        historyRes.data.data.forEach((msg: RAGMessageResponse) => {
          if (msg.userMessage) {
            history.push({
              id: `${msg.id}-user`,
              text: msg.userMessage,
              sender: 'user',
              timestamp: new Date(msg.timestamp)
            });
          }
          if (msg.aiResponse) {
            history.push({
              id: `${msg.id}-ai`,
              text: msg.aiResponse,
              sender: 'ai',
              timestamp: new Date(msg.timestamp)
            });
          }
        });
        
        if (history.length > 0) {
          setMessages(history);
          setShowSuggestions(false);
        } else {
          setMessages([
            WELCOME_MESSAGE,
            {
              id: 'session-reconnect-' + Date.now(),
              text: `Đã kết nối lại với phiên chat của lộ trình: ${getItineraryTitle(session.itineraryId)}. Hãy đặt câu hỏi bất kỳ để tôi hỗ trợ bạn nhé!`,
              sender: 'ai',
              timestamp: new Date()
            }
          ]);
          setShowSuggestions(true);
        }
      }
    } catch (err) {
      console.error("[AIChatBox] Failed to load chat history:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Avoid triggering click to load session
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiên chat này không?")) return;
    
    try {
      const res = await chatbotService.deleteSession(id);
      if (res.data.status === 200 || res.data.status === 204) {
        setUserSessions(prev => prev.filter(s => s.id !== id));
        if (sessionId === id) {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error("[AIChatBox] Failed to delete session:", err);
    }
  };

  // Init session only when chat is opened and no session exists
  useEffect(() => {
    if (isOpen && !sessionId && !isInitAttempted) {
      initSession();
    }
  }, [isOpen, sessionId, isInitAttempted]);

  // Listen for propItineraryId changes (e.g., when parent finishes loading itinerary data asynchronously)
  useEffect(() => {
    if (propItineraryId) {
      console.log("[AIChatBox] propItineraryId loaded dynamically:", propItineraryId);
      setSelectedItineraryId(propItineraryId);
      
      // If the chat is already open, trigger a fresh session initialization for this specific itinerary
      if (isOpen) {
        setIsInitAttempted(false);
        setSessionId(null);
      }
    }
  }, [propItineraryId, isOpen]);

  const initSession = async () => {
    setIsInitAttempted(true);
    console.log("[AIChatBox] initSession - propItineraryId:", propItineraryId);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMessages(prev => [...prev, {
        id: 'require-login',
        text: 'Vui lòng đăng nhập để tôi có thể hỗ trợ bạn lưu lại lịch sử trò chuyện và tư vấn lộ trình cá nhân nhé!',
        sender: 'ai',
        timestamp: new Date(),
        isLoginPrompt: true
      }]);
      setShowSuggestions(false);
      return;
    }

    try {
      if (propItineraryId) {
        const res = await chatbotService.getOrCreateSession(propItineraryId);
        if (res.data.status === 200 && res.data.data) {
          const session = res.data.data;
          setSessionId(session.id);
          setShowSelectionForm(false); // Hide the selection form since it is already selected via props
          
          // Fetch history
          const historyRes = await chatbotService.getChatHistory(session.id);
          if (historyRes.data.status === 200 && historyRes.data.data) {
            const history: Message[] = [];
            
            historyRes.data.data.forEach((msg: RAGMessageResponse) => {
              // If it's a message from user
              if (msg.userMessage) {
                history.push({
                  id: `${msg.id}-user`,
                  text: msg.userMessage,
                  sender: 'user',
                  timestamp: new Date(msg.timestamp)
                });
              }
              
              // If it's a message from AI
              if (msg.aiResponse) {
                history.push({
                  id: `${msg.id}-ai`,
                  text: msg.aiResponse,
                  sender: 'ai',
                  timestamp: new Date(msg.timestamp)
                });
              }
            });
            
            if (history.length > 0) {
              setMessages(history);
              setShowSuggestions(false);
            } else {
              // Brand new session, greet user with selected itinerary title context
              setShowSuggestions(true);
              try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                  const user = JSON.parse(userStr);
                  const listRes = await itineraryService.getUserItineraries(user.id);
                  if (listRes.data.status === 200 && listRes.data.data) {
                    const itineraries = listRes.data.data;
                    setUserItineraries(itineraries);
                    const currentIt = itineraries.find((it: any) => {
                      const rawId = it.id || (it as any).itineraryId;
                      const id = typeof rawId === 'string' ? parseInt(rawId) : rawId;
                      return id === propItineraryId;
                    });
                    if (currentIt) {
                      setMessages(prev => [...prev, {
                        id: 'session-created-' + Date.now(),
                        text: `Đã kết nối thành công với lộ trình: ${currentIt.title}. Tôi đã sẵn sàng hỗ trợ bạn! Bạn muốn tôi tối ưu lại thời gian, gợi ý món ngon hay tìm thêm điểm tham quan cho lộ trình này?`,
                        sender: 'ai',
                        timestamp: new Date()
                      }]);
                    }
                  }
                }
              } catch (err) {
                console.error("[AIChatBox] Failed to resolve selected itinerary details:", err);
                setMessages(prev => [...prev, {
                  id: 'session-created-' + Date.now(),
                  text: `Đã kết nối thành công với lộ trình của bạn. Tôi đã sẵn sàng hỗ trợ bạn! Bạn muốn tôi tối ưu lại thời gian, gợi ý món ngon hay tìm thêm điểm tham quan cho lộ trình này?`,
                  sender: 'ai',
                  timestamp: new Date()
                }]);
              }
            }
          }
        }
      } else {
        // No itinerary selected yet (Home page). Start with a clean slate!
        setSessionId(null);
        setSelectedItineraryId(undefined);
        setMessages([WELCOME_MESSAGE]);
        setShowSuggestions(true);
        setShowSelectionForm(true);
        fetchAndShowItineraries();
      }
    } catch (error: any) {
      console.error("Failed to initialize chat session:", error);
      if (error.response?.status === 401) {
        handleTokenExpired();
      }
    }
  };

  const handleTokenExpired = () => {
    setMessages(prev => [...prev, {
      id: 'token-expired-' + Date.now(),
      text: 'Phiên đăng nhập của bạn đã hết hạn để đảm bảo bảo mật. Vui lòng đăng nhập lại để tiếp tục trò chuyện nhé!',
      sender: 'ai',
      timestamp: new Date(),
      isLoginPrompt: true
    }]);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  const fetchAndShowItineraries = async () => {
    try {
      setIsLoadingItineraries(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      
      const res = await itineraryService.getUserItineraries(user.id);
      if (res.data.status === 200 && res.data.data) {
        const itineraries = res.data.data;
        setUserItineraries(itineraries);
        setShowSelectionForm(true);
        
        if (itineraries.length > 0) {
          setMessages(prev => [...prev, {
            id: 'select-itinerary-' + Date.now(),
            text: 'Bạn đang cần tôi hỗ trợ lộ trình nào? Hãy chọn một trong các lộ trình đã lưu của bạn bên dưới nhé (hoặc bạn có thể trò chuyện trực tiếp với tôi về bất kỳ thông tin du lịch nào):',
            sender: 'ai',
            timestamp: new Date()
          }]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user itineraries:", error);
    } finally {
      setIsLoadingItineraries(false);
    }
  };

  const handleSelectItinerary = async (itinerary: GeneratedItinerary) => {
    console.log("[AIChatBox] Full itinerary object:", itinerary);
    const rawId = itinerary.id || (itinerary as any).itineraryId;
    const id = typeof rawId === 'string' ? parseInt(rawId) : rawId;
    
    console.log("[AIChatBox] handleSelectItinerary - Resolved ID:", id, "Title:", itinerary.title);
    
    if (!id) {
      console.error("[AIChatBox] Failed to resolve itinerary ID!");
      return;
    }

    setSelectedItineraryId(id);
    setShowSelectionForm(false);
    
    // Re-initialize session with selected itinerary context
    try {
      console.log("[AIChatBox] sync session with new itineraryId (getOrCreate):", id);
      const res = await chatbotService.getOrCreateSession(id);
      if (res.data.status === 200 || res.data.status === 201) {
        if (res.data.data) {
          const session = res.data.data;
          setSessionId(session.id);
          
          // Fetch history for this session
          const historyRes = await chatbotService.getChatHistory(session.id);
          if (historyRes.data.status === 200 && historyRes.data.data && historyRes.data.data.length > 0) {
            const history: Message[] = [];
            historyRes.data.data.forEach((msg: RAGMessageResponse) => {
              if (msg.userMessage) {
                history.push({
                  id: `${msg.id}-user`,
                  text: msg.userMessage,
                  sender: 'user',
                  timestamp: new Date(msg.timestamp)
                });
              }
              if (msg.aiResponse) {
                history.push({
                  id: `${msg.id}-ai`,
                  text: msg.aiResponse,
                  sender: 'ai',
                  timestamp: new Date(msg.timestamp)
                });
              }
            });
            if (history.length > 0) {
              setMessages(history);
              setShowSuggestions(false);
              return; // Stop here if history loaded
            }
          }
          
          // If no history, show success message from backend
          const successMsg: Message = {
            id: 'session-created-' + Date.now(),
            text: `${res.data.message || "Đã kết nối thành công"} cho lộ trình: ${itinerary.title}. Tôi đã sẵn sàng hỗ trợ bạn! Bạn muốn tôi tối ưu lại thời gian, gợi ý món ngon hay tìm thêm điểm tham quan cho lộ trình này?`,
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMsg]);
        }
      }
    } catch (error) {
      console.error("[AIChatBox] Failed to sync session with itinerary:", error);
    }
  };

  const handleSend = async (text?: string, itId?: number, intent: string = 'question', forcedSessionId?: number, hiddenContext?: string) => {
    const displayText = text || inputValue;
    const apiText = hiddenContext 
      ? `[HƯỚNG DẪN VIÊN DU LỊCH] Thông tin về ${displayText}: "${hiddenContext}". \n\nDựa trên thông tin trên và kiến thức chuyên sâu của bạn, hãy kể cho tôi nghe một câu chuyện lôi cuốn và chi tiết về địa danh này. Hãy đóng vai một hướng dẫn viên đang dẫn khách đi tham quan thực tế.` 
      : displayText;
    
    if (!displayText.trim()) return;

    // Clear input field if it was a manual send
    if (!text) setInputValue('');

    // Hide selection form once conversation starts
    setShowSelectionForm(false);

    // Enforce that the user must select an itinerary ONLY when they want to optimize the itinerary
    const isOptimizeIntent = displayText.includes('Tối ưu') || intent === 'optimize';
    if (isOptimizeIntent && !selectedItineraryId && !itId) {
      setSelectionMode('itineraries');
      setShowSelectionForm(true);
      fetchAndShowItineraries();
      
      // Preserve user typed text in the input box so they don't have to re-type
      if (!text) {
        setInputValue(displayText);
      }
      return;
    }

    let currentItId = itId || selectedItineraryId;
    const currentIntent = intent;
    console.log("[AIChatBox] handleSend - itId:", currentItId, "intent:", currentIntent);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: displayText,
      sender: 'user',
      timestamp: new Date()
    };

    if (!forcedSessionId) {
      setMessages(prev => [...prev, userMessage]);
      setShowSuggestions(false);
    }
    setIsTyping(true);

    // 1. Semantic Intent Detection
    const normalizedText = displayText.toLowerCase();
    let detectedIntent = intent;
    
    if (normalizedText.includes('đói') || normalizedText.includes('ăn') || normalizedText.includes('món') || normalizedText.includes('đặc sản')) {
      detectedIntent = 'food';
    } else if (normalizedText.includes('ngủ') || normalizedText.includes('khách sạn') || normalizedText.includes('ở đâu') || normalizedText.includes('chỗ ở')) {
      detectedIntent = 'hotel';
    } else if (normalizedText.includes('chơi') || normalizedText.includes('đi đâu') || normalizedText.includes('tham quan') || normalizedText.includes('đẹp')) {
      detectedIntent = 'place';
    } else if (normalizedText.includes('thời tiết') || normalizedText.includes('mưa') || normalizedText.includes('nắng')) {
      detectedIntent = 'weather';
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("[AIChatBox] No token found, showing login prompt");
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 'require-login-' + Date.now(),
            text: 'Bạn cần đăng nhập để tiếp tục trò chuyện với trợ lý AI nhé!',
            sender: 'ai',
            timestamp: new Date(),
            isLoginPrompt: true
          }]);
          setIsTyping(false);
        }, 800);
        return;
      }

      const currentSessionId = forcedSessionId || sessionId;
      console.log("[AIChatBox] currentSessionId:", currentSessionId);
      
      if (currentSessionId) {
        const startTime = Date.now();
        console.log("[AIChatBox] Calling chatbotService.sendMessage with intent:", detectedIntent);
        const res = await chatbotService.sendMessage(currentSessionId, apiText, currentItId, detectedIntent);
        console.log("[AIChatBox] sendMessage response:", res.data);
        
        // Ensure typing indicator shows for at least 1.2 seconds for realistic "thinking"
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = Math.max(0, 1200 - elapsedTime);
        
        if ((res.data.status === 200 || res.data.status === 201) && res.data.data) {
          const aiMsg = res.data.data;
          const aiResponse: Message = {
            id: aiMsg.id.toString(),
            text: aiMsg.aiResponse || "", // Using aiResponse from RAG response
            sender: 'ai',
            timestamp: new Date(aiMsg.timestamp) // Using timestamp from RAG response
          };
          
          setTimeout(() => {
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
          }, remainingDelay);

          // Dynamic card loading based on detected intent after the AI message loads
          setTimeout(async () => {
            const currentItinerary = userItineraries.find(it => it.id === currentItId);
            const provinceId = currentItinerary?.provinceId;

            if (detectedIntent === 'place') {
              try {
                const attractionRes = await getAttractions(0, 10, provinceId);
                const allPlaces = attractionRes.data.data?.content || [];
                const mappedPlaces = allPlaces.map(p => ({
                  id: p.id,
                  name: p.name || "Địa điểm tham quan",
                  price: p.averagePrice ? `${p.averagePrice.toLocaleString()}đ` : "Miễn phí",
                  rating: (p.rating || 0).toString(),
                  reviews: (p.reviewCount || 0).toString(),
                  description: p.description || "Địa danh nổi tiếng với giá trị lịch sử và văn hóa đặc sắc.",
                  heroImage: p.imageUrl || "https://placehold.co/600x400?text=Hình+ảnh+đang+cập+nhật"
                })).slice(0, 4);

                if (mappedPlaces.length > 0) {
                  setSuggestedPlaces(mappedPlaces);
                  setSelectionMode('places');
                  setShowSelectionForm(true);
                }
              } catch (e) {
                console.error("Failed to load attractions dynamically:", e);
              }
            } else if (detectedIntent === 'food') {
              const foodData = [
                { name: "Bánh mì Phượng", desc: "Bánh mì ngon nhất thế giới với nước sốt độc bản.", img: banhMiImg },
                { name: "Cơm gà Bà Buội", desc: "Đặc sản Hội An với thịt gà ta thả vườn và cơm dẻo.", img: comGaImg },
                { name: "Cao Lầu Thanh", desc: "Sợi mì vàng óng ăn kèm thịt xíu và rau sống Trà Quế.", img: caoLauImg }
              ];
              setSuggestedFoods(foodData);
              setSelectionMode('foods');
              setShowSelectionForm(true);
            }
          }, remainingDelay + 500);
        } else {
          setIsTyping(false);
        }
      } else {
        // If sessionId is missing, try to create it on the fly
        console.log("[AIChatBox] sessionId missing, attempting auto-creation with itId:", currentItId);
        
        let targetItId = currentItId;
        
        if (!targetItId && detectedIntent === 'optimize') {
          setMessages(prev => [...prev, {
            id: 'missing-itinerary-' + Date.now(),
            text: 'Vui lòng chọn hoặc tạo một lộ trình trước khi thực hiện tối ưu nhé!',
            sender: 'ai',
            timestamp: new Date()
          }]);
          setIsTyping(false);
          return;
        }

        // If targetItId is null/undefined (i.e. general chat), use POST createSession to create a session without itineraryId
        let sessionRes;
        if (!targetItId) {
          console.log("[AIChatBox] Creating general session using POST /chatbot-rag/sessions");
          sessionRes = await chatbotService.createSession(undefined);
        } else {
          console.log("[AIChatBox] Getting or creating itinerary-bound session using GET /chatbot-rag/sessions");
          sessionRes = await chatbotService.getOrCreateSession(targetItId);
        }
        if (sessionRes.data.status === 200 || sessionRes.data.status === 201) {
          if (sessionRes.data.data) {
            const newId = sessionRes.data.data.id;
            setSessionId(newId);
            
            // Pass the NEW id to the recursive call to prevent infinite loop
            // Keep currentItId as undefined so the message is sent generally
            handleSend(displayText, currentItId, detectedIntent, newId, hiddenContext);
          } else {
            setIsTyping(false);
          }
        } else {
          setIsTyping(false);
        }
      }
    } catch (error: unknown) {
      console.error("Failed to send message:", error);
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        handleTokenExpired();
      }
      setIsTyping(false);
    }
  };

  const renderMessageContent = (text: string, msgIndex: number, skipTypewriter: boolean = false) => {
    // Check if this is the latest message from AI to apply typewriter
    const isLatestAI = msgIndex === messages.length - 1;
    const shouldTypewrite = isLatestAI && !skipTypewriter;

    // Regex for [Ngày X HH:mm]
    const timePattern = /\[Ngày\s+(\d+)\s+(\d{1,2}:\d{2})\]/g;
    
    // Split by numbered list items 1. [Ngày
    const parts = text.split(/(\d+\.\s+\[Ngày)/g);
    
    if (parts.length < 2) {
      return shouldTypewrite ? (
        <TypewriterText text={text} onUpdate={scrollToBottom} />
      ) : (
        <span>{text}</span>
      );
    }

    return (
      <div className={styles.richContent}>
        {parts.map((part, i) => {
          if (i % 2 === 1) return null;
          
          let content = part;
          if (i > 0) {
            content = Math.floor(i/2 + 1) + ". [Ngày" + part;
          }

          const hasPattern = timePattern.test(content);
          if (hasPattern) {
            timePattern.lastIndex = 0; 
            const match = timePattern.exec(content);
            const day = match?.[1];
            const time = match?.[2];
            
            const rest = content.replace(timePattern, '').trim();
            const [title, ...descParts] = rest.split(':');
            const description = descParts.join(':');

            return (
              <div key={i} className={styles.activityCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.dayBadge}>
                    <CalendarBlank size={12} weight="bold" style={{ marginRight: '4px' }} /> Ngày {day}
                  </span>
                  <span className={styles.timeBadge}>
                    <Clock size={12} weight="bold" style={{ marginRight: '4px' }} /> {time}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <strong>{title.replace(/^\d+\.\s*/, '')}</strong>
                  <p>
                    {shouldTypewrite ? (
                      <TypewriterText text={description} onUpdate={scrollToBottom} />
                    ) : description}
                  </p>
                </div>
              </div>
            );
          }
          return (
            <span key={i}>
              {shouldTypewrite ? (
                <TypewriterText text={content} onUpdate={scrollToBottom} />
              ) : content}
            </span>
          );
        })}
      </div>
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className={styles.chatWrapper}>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            className={styles.floatingBtn}
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AILogo size={32} />
            <span className={styles.badge}>AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={styles.chatWindow}
          >
            <div className={styles.chatHeader}>
              <div className={styles.assistantInfo}>
                <div className={styles.avatar}>
                  <AILogo size={28} />
                </div>
                <div className={styles.infoText}>
                  <h3>TravelAi Assistant</h3>
                  <div className={styles.status}>Trực tuyến</div>
                </div>
              </div>
              <div className={styles.headerActions}>
                {isLoggedIn && (
                  <>
                    <button 
                      onClick={handleToggleHistory}
                      title="Lịch sử trò chuyện"
                      className={`${styles.newChatBtn} ${styles.historyToggle} ${isHistoryOpen ? styles.activeBtn : ''}`}
                    >
                      <ClockCounterClockwise size={18} weight="bold" />
                    </button>
                    <button 
                      onClick={handleNewChat}
                      title="Tư vấn lộ trình khác"
                      className={styles.newChatBtn}
                    >
                      <Plus size={18} weight="bold" />
                    </button>
                  </>
                )}
                <button onClick={() => setIsOpen(false)} title="Thu nhỏ">
                  <Minus size={18} weight="bold" />
                </button>
                <button className={styles.closeBtn} onClick={() => setIsOpen(false)} title="Đóng">
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Session History Panel Overlay */}
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={styles.historyPanel}
                >
                  <div className={styles.historyHeader}>
                    <h3>Lịch sử trò chuyện</h3>
                    <button className={styles.closeHistoryBtn} onClick={() => setIsHistoryOpen(false)}>
                      <X size={16} weight="bold" />
                    </button>
                  </div>
                  <div className={styles.historyList}>
                    {isLoadingSessions ? (
                      <div className={styles.historyLoading}>
                        <div className={styles.spinner} />
                        <span>Đang tải các phiên chat...</span>
                      </div>
                    ) : userSessions.length > 0 ? (
                      [...userSessions].sort((a, b) => b.id - a.id).map((session) => (
                        <div 
                          key={session.id} 
                          className={`${styles.sessionCard} ${sessionId === session.id ? styles.activeSession : ''}`}
                          onClick={() => handleSelectSession(session)}
                        >
                          <div className={styles.sessionInfo}>
                            <ChatCircleDots size={20} weight="bold" />
                            <div className={styles.sessionText}>
                              <strong>{getItineraryTitle(session.itineraryId)}</strong>
                              <span>
                                {new Date(session.updatedAt || session.createdAt).toLocaleDateString("vi-VN")} • {session.messageCount || 0} tin nhắn
                              </span>
                            </div>
                          </div>
                          <button 
                            className={styles.deleteSessionBtn}
                            onClick={(e) => handleDeleteSession(e, session.id)}
                            title="Xóa phiên chat"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyHistory}>
                        <ClockCounterClockwise size={32} weight="bold" />
                        <p>Chưa có lịch sử trò chuyện nào.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.messageArea} ref={messageAreaRef}>
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${styles.messageRow} ${msg.sender === 'user' ? styles.userRow : styles.aiRow}`}
                  >
                    {msg.sender === 'ai' ? (
                      <div className={styles.msgAvatar}>
                        <AILogo size={22} />
                      </div>
                    ) : (
                      <>
                        <div className={styles.userAvatar}>
                          <img 
                            src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=0ea5e9&color=fff`} 
                            alt="User Avatar" 
                          />
                        </div>
                        <div className={styles.userLabel}>{userName || "Bạn"}</div>
                      </>
                    )}
                    <div className={styles.msgMainContent}>
                      <div className={styles.bubble}>
                        {renderMessageContent(msg.text, idx)}
                        
                        {msg.hotels && (
                          <div className={styles.hotelGrid}>
                            {msg.hotels.map((h, hi) => (
                              <div key={hi} className={styles.hotelCard}>
                                <div className={styles.hImage}>
                                  <img src={h.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400"} alt={h.name} />
                                  <span className={styles.hDistance}>{h.distance.toFixed(1)} km</span>
                                </div>
                                <div className={styles.hContent}>
                                  <strong>{h.name}</strong>
                                  <p>{h.address || "Địa chỉ đang được cập nhật..."}</p>
                                  <button className={styles.viewHBtn}>Xem chi tiết</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {msg.isLoginPrompt && (
                          <div className={styles.loginPrompt}>
                            <button 
                              className={styles.loginBtn}
                              onClick={() => window.location.href = '/auth?mode=login'}
                            >
                              <SignIn size={18} weight="bold" />
                              Đăng nhập ngay
                            </button>
                          </div>
                        )}

                        <span className={styles.time}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {msg.sender === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className={styles.suggestionChips}>
                          {msg.suggestions.map((s, si) => (
                            <button 
                              key={si} 
                              className={styles.chip}
                              onClick={() => handleSend(s)}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {showSelectionForm && (
                  <motion.div 
                    key="selection-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={selectionMode === 'actions' ? styles.quickActionsWrapper : styles.selectionForm}
                  >
                    {selectionMode === 'hotels' ? (
                      <>
                        <div className={styles.formHeader}>
                          <h4>🏨 Khách sạn gần bạn</h4>
                          <button className={styles.backBtn} onClick={() => setShowSelectionForm(false)}>Đóng</button>
                        </div>
                        <div className={styles.formGrid}>
                          {nearbyHotels.map((h, hi) => (
                            <button 
                              key={hi} 
                              className={styles.formCard}
                              onClick={() => {
                                handleSend(`Tôi muốn đặt phòng tại ${h.name}`);
                                setShowSelectionForm(false);
                              }}
                            >
                              <div className={styles.cardImage}>
                                <img src={h.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400"} alt={h.name} />
                              </div>
                              <div className={styles.cardContent}>
                                <strong>{h.name}</strong>
                                <div className={styles.cardMeta}>
                                  <span className={styles.price}>{h.price}</span>
                                  <span className={styles.rating}>
                                    <Star size={12} weight="fill" color="#f59e0b" />
                                    {h.rating}
                                    {h.reviews && parseInt(h.reviews, 10) > 0 && <span className={styles.revCount}>({h.reviews})</span>}
                                  </span>
                                  <span className={styles.dist}>{h.distance.toFixed(1)}km</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : selectionMode === 'places' ? (
                      <>
                        <div className={styles.formHeader}>
                          <h4>📍 Địa điểm nổi bật</h4>
                          <button className={styles.backBtn} onClick={() => setShowSelectionForm(false)}>Đóng</button>
                        </div>
                        <div className={styles.formGrid}>
                          {suggestedPlaces.map((p, pi) => (
                            <button 
                              key={pi} 
                              className={styles.formCard}
                              onClick={async () => {
                                // Fetch full details to get the best description for AI context
                                try {
                                  const detailRes = await getAttractionDetail(p.id!);
                                  const fullDesc = detailRes.data.data?.description || p.description;
                                  handleSend(`Kể cho tôi về ${p.name}`, undefined, 'question', undefined, fullDesc);
                                } catch {
                                  handleSend(`Kể cho tôi về ${p.name}`, undefined, 'question', undefined, p.description);
                                }
                                setShowSelectionForm(false);
                              }}
                            >
                              <div className={styles.cardImage}>
                                <img src={p.heroImage} alt={p.name} />
                              </div>
                              <div className={styles.cardContent}>
                                <strong>{p.name}</strong>
                                <div className={styles.cardMeta}>
                                  <span className={styles.price}>{p.price}</span>
                                  <span className={styles.rating}>
                                    <Star size={12} weight="fill" color="#f59e0b" />
                                    {p.rating}
                                    {p.reviews && parseInt(p.reviews, 10) > 0 && <span className={styles.revCount}>({p.reviews})</span>}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : selectionMode === 'foods' ? (
                      <>
                        <div className={styles.formHeader}>
                          <h4>🍽️ Đặc sản địa phương</h4>
                          <button className={styles.backBtn} onClick={() => setShowSelectionForm(false)}>Đóng</button>
                        </div>
                        <div className={styles.formGrid}>
                          {suggestedFoods.map((f, fi) => (
                            <button 
                              key={fi} 
                              className={styles.formCard}
                              onClick={() => {
                                handleSend(`Cho tôi biết thêm về ${f.name}`, undefined, 'question', undefined, f.desc);
                                setShowSelectionForm(false);
                              }}
                            >
                              <div className={styles.cardImage}>
                                <img src={f.img} alt={f.name} />
                              </div>
                              <div className={styles.cardContent}>
                                <strong>{f.name}</strong>
                                <span>{f.desc}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : selectionMode === 'map' ? (
                      <>
                        <div className={styles.formHeader}>
                          <h4>🗺️ Bản đồ khu vực</h4>
                          <button className={styles.backBtn} onClick={() => setShowSelectionForm(false)}>Đóng</button>
                        </div>
                        <div className={styles.mapContainer}>
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(
                              userItineraries.find(it => it.id === selectedItineraryId)?.provinceName || "Da Nang"
                            )}&output=embed`}
                          ></iframe>
                          <div className={styles.mapOverlay}>
                            <span>Đang xem {userItineraries.find(it => it.id === selectedItineraryId)?.provinceName}</span>
                          </div>
                        </div>
                      </>
                    ) : selectionMode === 'itineraries' ? (
                      <>
                        <div className={styles.formHeader}>
                          <h4>📂 Lộ trình của bạn</h4>
                          <button className={styles.backBtn} onClick={() => setSelectionMode('actions')}>Quay lại</button>
                        </div>
                        <div className={styles.formGrid}>
                          {isLoadingItineraries ? (
                            [1, 2, 3].map(i => <div key={i} className={`${styles.formCard} ${styles.skeleton}`} style={{ height: '80px', opacity: 0.6 }} />)
                          ) : userItineraries.length > 0 ? (
                            [...userItineraries].sort((a, b) => (b.id || 0) - (a.id || 0)).map((it) => (
                              <button key={it.id} className={styles.formCard} onClick={() => handleSelectItinerary(it)}>
                                <div className={styles.cardImage}>
                                  <img 
                                    src={it.itineraryDays?.[0]?.activities?.find(a => a.imageUrl)?.imageUrl || it.hotels?.[0]?.imageUrl || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800"} 
                                    alt={it.title} 
                                  />
                                </div>
                                <div className={styles.cardContent}>
                                  <strong>{it.title}</strong>
                                  <span>{it.provinceName} • {it.days} ngày</span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <p className={styles.emptyMsg}>Bạn chưa có lộ trình nào được lưu.</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className={styles.quickActionsGrid}>
                        {QUICK_REPLIES.map((reply, i) => (
                          <button 
                            key={i} 
                            className={styles.quickActionChip} 
                            onClick={() => handleSend(reply.text, undefined, reply.intent)}
                          >
                            {reply.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
                
                {isTyping && (
                  <motion.div 
                    key="typing-indicator"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${styles.messageRow} ${styles.aiRow} ${styles.typingRow}`}
                  >
                    <div className={styles.msgAvatar}>
                      <AILogo size={22} />
                    </div>
                    <div className={`${styles.bubble} ${styles.typing}`}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.footer}>
              <div className={styles.inputArea}>
                <input 
                  type="text" 
                  placeholder="Hỏi trợ lý TravelAi..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className={styles.sendBtn} 
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <PaperPlaneTilt size={26} weight="fill" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatBox;
