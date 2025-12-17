import React, { useState } from 'react';
import { Conversation, LLMCategory } from '../types';
import './ConversationList.css';

interface ConversationListProps {
  category: LLMCategory;
  onBack: () => void;
  onDelete: (conversationId: string) => void;
  onView: (conversation: Conversation) => void;
  onRename: (conversationId: string, newTitle: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  category,
  onBack,
  onDelete,
  onView,
  onRename
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const formatDateTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Unknown date';

    return `${parsed.toLocaleDateString()} at ${parsed.toLocaleTimeString()}`;
  };

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

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
                {editingId === conversation.id ? (
                  <input
                    type="text"
                    className="title-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, conversation.id)}
                    autoFocus
                  />
                ) : (
                  <h3 className="conversation-title">{conversation.title}</h3>
                )}
                <p className="conversation-date">{formatDateTime(conversation.date)}</p>
              </div>
              <div className="conversation-actions">
                {editingId === conversation.id ? (
                  <>
                    <button
                      className="action-btn save-btn"
                      onClick={() => handleSaveEdit(conversation.id)}
                    >
                      Save
                    </button>
                    <button
                      className="action-btn cancel-btn"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleStartEdit(conversation)}
                    >
                      Edit
                    </button>
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
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
