export interface Conversation {
  id: string;
  title: string;
  provider: string;
  date: string;
  htmlPath?: string;
  content?: string;
}

export interface LLMCategory {
  name: string;
  displayName: string;
  color: string;
  icon: string;
  conversations: Conversation[];
}
