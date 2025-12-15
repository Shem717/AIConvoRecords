import React, { useState } from 'react';
import './LLMCard.css';

interface LLMCardProps {
  name: string;
  displayName: string;
  color: string;
  icon: string;
  conversationCount: number;
  onClick: () => void;
  onUpload: (file: File) => void;
}

export const LLMCard: React.FC<LLMCardProps> = ({
  displayName,
  color,
  icon,
  conversationCount,
  onClick,
  onUpload
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  };

  return (
    <div
      className={`llm-card ${isDragOver ? 'drag-over' : ''}`}
      style={{ borderColor: color }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="llm-header">
        <span className="llm-icon">{icon}</span>
        <h3 className="llm-title">{displayName}</h3>
      </div>

      <div className="llm-content">
        <div className="conversation-count">
          <span className="count-number">{conversationCount}</span>
          <span className="count-label">conversation{conversationCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="llm-actions">
        <button
          className="action-btn view-btn"
          onClick={onClick}
          disabled={conversationCount === 0}
        >
          View Conversations →
        </button>

        <label className="action-btn upload-btn">
          Upload HTML
          <input
            type="file"
            accept=".html"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
};
