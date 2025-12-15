import { useState, useEffect } from 'react';
import { Conversation, LLMCategory } from '../types';

const LLMS: Record<string, Omit<LLMCategory, 'conversations'>> = {
  chatgpt: {
    name: 'chatgpt',
    displayName: 'ChatGPT',
    color: '#00A67E',
    icon: '🤖'
  },
  claude: {
    name: 'claude',
    displayName: 'Claude',
    color: '#9C6644',
    icon: '🧠'
  },
  gemini: {
    name: 'gemini',
    displayName: 'Google Gemini',
    color: '#4285F4',
    icon: '✨'
  },
  copilot: {
    name: 'copilot',
    displayName: 'GitHub Copilot',
    color: '#000000',
    icon: '⚡'
  },
  other: {
    name: 'other',
    displayName: 'Other LLMs',
    color: '#6C757D',
    icon: '🔮'
  }
};

export const useLLMData = () => {
  const [llmCategories, setLlmCategories] = useState<LLMCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        // Load from localStorage or API
        const stored = localStorage.getItem('llm-conversations');
        if (stored) {
          const data = JSON.parse(stored);
          const categories = Object.values(LLMS).map(llm => ({
            ...llm,
            conversations: data[llm.name] || []
          }));
          setLlmCategories(categories);
        } else {
          // Initialize with empty categories
          const categories = Object.values(LLMS).map(llm => ({
            ...llm,
            conversations: []
          }));
          setLlmCategories(categories);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  const addConversation = (conversation: Conversation) => {
    setLlmCategories(prev => prev.map(category => {
      if (category.name === conversation.llm) {
        return {
          ...category,
          conversations: [...category.conversations, conversation]
        };
      }
      return category;
    }));
    persistConversations();
  };

  const removeConversation = (llm: string, conversationId: string) => {
    setLlmCategories(prev => prev.map(category => {
      if (category.name === llm) {
        return {
          ...category,
          conversations: category.conversations.filter(c => c.id !== conversationId)
        };
      }
      return category;
    }));
    persistConversations();
  };

  const persistConversations = () => {
    const data: Record<string, Conversation[]> = {};
    llmCategories.forEach(category => {
      data[category.name] = category.conversations;
    });
    localStorage.setItem('llm-conversations', JSON.stringify(data));
  };

  return {
    llmCategories,
    loading,
    addConversation,
    removeConversation,
    llmOptions: Object.values(LLMS)
  };
};
