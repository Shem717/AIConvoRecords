import React, { useState } from 'react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`conversation-viewer ${isFullscreen ? 'fullscreen' : ''}`}>
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
              {new Date(conversation.date).toLocaleDateString()}
            </span>
          </p>
        </div>
        <button
          className="fullscreen-btn"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '⛔' : '⛶'}
        </button>
      </div>

      <div className="viewer-content">
        <iframe
          className="html-iframe"
          srcDoc={conversation.content}
          title={conversation.title}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};
