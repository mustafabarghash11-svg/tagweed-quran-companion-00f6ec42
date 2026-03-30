import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Chat {
  id: string;
  title: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  createNewChat: () => void;
  deleteChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;
  setCurrentChat: (id: string) => void;
  addMessage: (chatId: string, message: { role: 'user' | 'assistant'; content: string }) => void;
  getCurrentChat: () => Chat | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // تحميل المحادثات من localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tagweed-chats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const restored = parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt)
        }));
        setChats(restored);
        if (restored.length > 0) {
          setCurrentChatId(restored[0].id);
        } else {
          createNewChat();
        }
      } catch { }
    } else {
      createNewChat();
    }
  }, []);

  // حفظ المحادثات في localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('tagweed-chats', JSON.stringify(chats));
    }
  }, [chats]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `محادثة جديدة ${chats.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const deleteChat = (id: string) => {
    setChats(prev => prev.filter(chat => chat.id !== id));
    if (currentChatId === id) {
      const remaining = chats.filter(chat => chat.id !== id);
      if (remaining.length > 0) {
        setCurrentChatId(remaining[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const updateChatTitle = (id: string, title: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === id ? { ...chat, title: title.trim() || 'محادثة', updatedAt: new Date() } : chat
    ));
  };

  const setCurrentChat = (id: string) => {
    setCurrentChatId(id);
  };

  const addMessage = (chatId: string, message: { role: 'user' | 'assistant'; content: string }) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? { ...chat, messages: [...chat.messages, message], updatedAt: new Date() }
        : chat
    ));
  };

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === currentChatId);
  };

  return (
    <ChatContext.Provider value={{
      chats,
      currentChatId,
      createNewChat,
      deleteChat,
      updateChatTitle,
      setCurrentChat,
      addMessage,
      getCurrentChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};
