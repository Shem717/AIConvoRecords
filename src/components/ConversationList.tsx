import React from 'react';
import { Conversation, LLMCategory } from '../types';
import './ConversationList.css';

interface ConversationListProps {
  category: LLMCategory;
  onBack: () => void;
  onDelete: (conversationId: string) => void;
  onView: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  category,
  onBack,
  onDelete,
  onView
}) => {
  return (
    <div className="conversation-list">
      <div className="list-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <h2 className="list-title">
          <span className="category-icon">{category.icon}</span>
          {category.displayName} Conversations
        </h2>
        <div className="list-stats">
          {category.conversations.length} conversation{category.conversations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {category.conversations.length === 0 ? (
        <div className="empty-state">
          <p>No conversations yet. Upload an HTML file to get started!</p>
        </div>
      ) : (
        <div className="conversations">
          {category.conversations.map(conversation => (
            <div key={conversation.id} className="conversation-item">
              <div className="conversation-info">
                <h3 className="conversation-title">{conversation.title}</h3>
                <p className="conversation-date">
                  {new Date(conversation.date).toLocaleDateString()} at{' '}
                  {new Date(conversation.date).toLocaleTimeString()}
                </p>
              </div>
              <div className="conversation-actions">
                <button
                  className="action-btn view-btn"
                  onClick={() => onView(conversation)}
                >
                  View
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => onDelete(conversation.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
