import { useEffect, useState } from 'react';
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

const STORAGE_KEY = 'ai-convo-records:uploads';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') ||
  'conversation';

const normalizeDate = (date?: string | Date) => {
  if (!date) {
    return new Date().toISOString();
  }

  if (date instanceof Date) {
    return date.toISOString();
  }

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const generateConversationId = (title: string, provider: string) =>
  slugify(`${provider}-${title}`);

type RawConversation = Omit<Conversation, 'date'> & {
  date?: string | Date;
  filename?: string;
  llm?: string;
};

const normalizeConversation = (conversation: Partial<RawConversation>): Conversation => {
  const provider = conversation.provider ?? conversation.llm ?? 'unknown';
  const title = conversation.title ?? 'Untitled Conversation';
  const id = conversation.id ?? generateConversationId(title, provider);

  const htmlPath = conversation.htmlPath ??
    (conversation as { filename?: string }).filename
      ? `/${(conversation as { filename?: string }).filename}`
      : undefined;

  return {
    id,
    title,
    provider,
    date: normalizeDate(conversation.date),
    htmlPath,
    content: conversation.content
  };
};

const loadStoredConversations = (): Conversation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeConversation);
  } catch (error) {
    console.error('Unable to read stored conversations', error);
    return [];
  }
};

const persistStoredConversations = (conversations: Conversation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Unable to persist conversations', error);
  }
};

const buildCategories = (conversations: Conversation[]): LLMCategory[] => {
  const categories = Object.values(LLMS).map(llm => ({
    ...llm,
    conversations: conversations.filter(c => c.provider === llm.name)
  }));

  const unmatched = conversations.filter(c => !LLMS[c.provider]);
  if (unmatched.length > 0) {
    categories.push({
      name: 'other',
      displayName: 'Other',
      color: '#6B7280',
      icon: '📁',
      conversations: unmatched
    });
  }

  return categories;
};

const fetchConfigConversations = async (): Promise<Conversation[]> => {
  const response = await fetch('/conversations.json', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load conversations config (${response.status})`);
  }

  const conversations = (await response.json()) as Partial<RawConversation>[];
  return conversations.map(normalizeConversation);
};

export const useLLMData = () => {
  const [llmCategories, setLlmCategories] = useState<LLMCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      const storedConversations = loadStoredConversations();

      try {
        const configConversations = await fetchConfigConversations();

        // Merge config and stored conversations by ID (stored overrides for duplicates)
        const merged = new Map<string, Conversation>();
        configConversations.forEach(c => merged.set(c.id, c));
        storedConversations.forEach(c => merged.set(c.id, c));

        setLlmCategories(buildCategories(Array.from(merged.values())));
      } catch (error) {
        console.error('Error loading conversations:', error);
        setLlmCategories(buildCategories(storedConversations));
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  const addConversation = (conversation: Omit<Conversation, 'id' | 'date'> & { date?: string | Date }) => {
    const normalized = normalizeConversation(conversation);

    setLlmCategories(prev => buildCategories([
      ...prev.flatMap(category => category.conversations),
      normalized
    ]));

    const stored = loadStoredConversations();
    const merged = new Map<string, Conversation>();
    stored.forEach(c => merged.set(c.id, c));
    merged.set(normalized.id, normalized);
    persistStoredConversations(Array.from(merged.values()));
  };

  const removeConversation = (provider: string, conversationId: string) => {
    setLlmCategories(prev => prev.map(category => {
      if (category.name === provider) {
        return {
          ...category,
          conversations: category.conversations.filter(c => c.id !== conversationId)
        };
      }
      return category;
    }));

    const stored = loadStoredConversations().filter(c => c.id !== conversationId);
    persistStoredConversations(stored);
  };

  const updateConversationTitle = (id: string, newTitle: string) => {
    setLlmCategories(prev => prev.map(category => ({
      ...category,
      conversations: category.conversations.map(c =>
        c.id === id ? { ...c, title: newTitle } : c
      )
    })));

    const allConversations = llmCategories.flatMap(c => c.conversations);
    const conversation = allConversations.find(c => c.id === id);

    if (conversation) {
      const updated = { ...conversation, title: newTitle };
      const stored = loadStoredConversations();
      const merged = new Map<string, Conversation>();

      stored.forEach(c => merged.set(c.id, c));
      merged.set(updated.id, updated);

      persistStoredConversations(Array.from(merged.values()));
    }
  };

  return {
    llmCategories,
    loading,
    addConversation,
    removeConversation,
    updateConversationTitle,
    llmOptions: Object.values(LLMS)
  };
};
