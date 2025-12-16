import { useState, useEffect } from 'react';
import { Conversation, LLMCategory } from '../types';

const LLMS: Record<string, Omit<LLMCategory, 'conversations'>> = {
  gemini: {
    name: 'gemini',
    displayName: 'Google Gemini',
    color: '#4285F4',
    icon: '✨'
  },
  claude: {
    name: 'claude',
    displayName: 'Claude',
    color: '#9C6644',
    icon: '🧠'
  },
  chatgpt: {
    name: 'chatgpt',
    displayName: 'ChatGPT',
    color: '#00A67E',
    icon: '🤖'
  },
  abacus: {
    name: 'abacus',
    displayName: 'Abacus',
    color: '#E91E63',
    icon: '🧮'
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
        let initialData: Record<string, Conversation[]> = {};

        if (stored) {
          initialData = JSON.parse(stored);
        }

        const categories = Object.values(LLMS).map(llm => ({
          ...llm,
          conversations: initialData[llm.name] || []
        }));
        setLlmCategories(categories);

      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  const addConversation = (conversation: Conversation) => {
    setLlmCategories(prev => {
      const newCategories = prev.map(category => {
        if (category.name === conversation.llm) {
          return {
            ...category,
            conversations: [...category.conversations, conversation]
          };
        }
        return category;
      });
      // Persist immediately with the new state
      persistConversations(newCategories);
      return newCategories;
    });
  };

  const removeConversation = (llm: string, conversationId: string) => {
    setLlmCategories(prev => {
      const newCategories = prev.map(category => {
        if (category.name === llm) {
          return {
            ...category,
            conversations: category.conversations.filter(c => c.id !== conversationId)
          };
        }
        return category;
      });
      persistConversations(newCategories);
      return newCategories;
    });
  };

  const persistConversations = (categories: LLMCategory[]) => {
    const data: Record<string, Conversation[]> = {};
    categories.forEach(category => {
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
