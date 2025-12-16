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
        const response = await fetch('/conversations.json');
        if (!response.ok) {
           throw new Error('Failed to load conversations config');
        }
        const conversations: Conversation[] = await response.json();

        const categories = Object.values(LLMS).map(llm => ({
          ...llm,
          conversations: conversations.filter(c => c.provider === llm.name)
        }));
        setLlmCategories(categories);

      } catch (error) {
        console.error('Error loading conversations:', error);
        // Fallback to empty
        const categories = Object.values(LLMS).map(llm => ({
          ...llm,
          conversations: []
        }));
        setLlmCategories(categories);
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
  };

  return {
    llmCategories,
    loading,
    addConversation,
    removeConversation,
    llmOptions: Object.values(LLMS)
  };
};
