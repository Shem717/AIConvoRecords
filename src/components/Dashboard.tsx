import React, { useState } from 'react';
import { LLMCard } from './LLMCard';
import { ConversationList } from './ConversationList';
import { ConversationViewer } from './ConversationViewer';
import { useLLMData } from '../utils/useLLMData';
import { Conversation, LLMCategory } from '../types';
import './Dashboard.css';

type ViewState = 'dashboard' | 'list' | 'viewer';

export const Dashboard: React.FC = () => {
  const { llmCategories, loading, addConversation, removeConversation } = useLLMData();
  const [viewState, setViewState] = useState<ViewState>('dashboard');
  const [selectedLLM, setSelectedLLM] = useState<LLMCategory | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const handleLLMClick = (category: LLMCategory) => {
    setSelectedLLM(category);
    setViewState('list');
  };

  const handleUpload = async (llmName: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const conversation: Conversation = {
        id: Date.now().toString(),
        title: file.name.replace('.html', ''),
        llm: llmName,
        date: new Date(),
        htmlPath: URL.createObjectURL(file),
        content
      };
      addConversation(conversation);
    };
    reader.readAsText(file);
  };

  const handleViewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setViewState('viewer');
  };

  const handleBackToList = () => {
    setViewState('list');
    setSelectedConversation(null);
  };

  const handleBackToDashboard = () => {
    setViewState('dashboard');
    setSelectedLLM(null);
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (selectedLLM) {
      removeConversation(selectedLLM.name, conversationId);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {viewState === 'dashboard' && (
        <div className="dashboard-view">
          <header className="dashboard-header">
            <h1 className="dashboard-title">AI Conversation Records</h1>
            <p className="dashboard-subtitle">
              Organize and view your AI conversations by LLM provider
            </p>
          </header>

          <div className="llm-grid">
            {llmCategories.map(category => (
              <LLMCard
                key={category.name}
                name={category.name}
                displayName={category.displayName}
                color={category.color}
                icon={category.icon}
                conversationCount={category.conversations.length}
                onClick={() => handleLLMClick(category)}
                onUpload={(file) => handleUpload(category.name, file)}
              />
            ))}
          </div>
        </div>
      )}

      {viewState === 'list' && selectedLLM && (
        <ConversationList
          category={selectedLLM}
          onBack={handleBackToDashboard}
          onDelete={handleDeleteConversation}
          onView={handleViewConversation}
        />
      )}

      {viewState === 'viewer' && selectedConversation && selectedLLM && (
        <ConversationViewer
          conversation={selectedConversation}
          llmCategory={selectedLLM}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};
