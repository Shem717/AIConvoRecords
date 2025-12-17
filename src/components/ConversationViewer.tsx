import React, { useEffect, useState } from 'react';
import { Conversation, LLMCategory } from '../types';
import './ConversationViewer.css';

interface ConversationViewerProps {
  conversation: Conversation;
  llmCategory: LLMCategory;
  onBack: () => void;
}

export const ConversationViewer: React.FC<ConversationViewerProps> = ({
  conversation,
  llmCategory,
  onBack
}) => {
  const [content, setContent] = useState(conversation.content);
  const [loadError, setLoadError] = useState<string | null>(null);

  const formatDate = () => {
    const parsed = new Date(conversation.date);
    return Number.isNaN(parsed.getTime()) ? 'Unknown date' : parsed.toLocaleDateString();
  };

  useEffect(() => {
    setContent(conversation.content);
    setLoadError(null);

    const loadRemoteContent = async () => {
      if (conversation.content || !conversation.htmlPath) return;

      try {
        const response = await fetch(conversation.htmlPath);
        if (!response.ok) {
          throw new Error(`Failed to load HTML (${response.status})`);
        }

        const html = await response.text();
        setContent(html);
      } catch (error) {
        console.error('Unable to load conversation HTML', error);
        setLoadError('Unable to load this transcript.');
      }
    };

    loadRemoteContent();
  }, [conversation]);

  return (
    <div className="conversation-viewer fullscreen">
      <div className="viewer-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="viewer-title-section">
          <h2 className="viewer-title">{conversation.title}</h2>
          <p className="viewer-meta">
            <span className="llm-badge" style={{ backgroundColor: llmCategory.color }}>
              {llmCategory.icon} {llmCategory.displayName}
            </span>
            <span className="date-badge">
              {formatDate()}
            </span>
          </p>
        </div>
      </div>

      <div className="viewer-content">
        {loadError ? (
          <div className="empty-state">{loadError}</div>
        ) : (
          <iframe
            className="html-iframe"
            srcDoc={content ?? '<p>Loading conversation...</p>'}
            title={conversation.title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </div>
    </div>
  );
};
