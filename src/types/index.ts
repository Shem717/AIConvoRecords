export interface Conversation {
  id: string;
  title: string;
  llm: string;
  date: Date;
  htmlPath: string;
  content?: string;
}

export interface LLMCategory {
  name: string;
  displayName: string;
  color: string;
  icon: string;
  conversations: Conversation[];
}
