import React, { useState } from 'react';
import { MessageFeedback } from '../services/AIAssistantEngine';
import './AIFeedbackSystem.css';

interface AIFeedbackSystemProps {
  messageId: string;
  currentFeedback?: MessageFeedback;
  onFeedback: (messageId: string, feedback: Partial<MessageFeedback>) => void;
  onToggleFavorite: (messageId: string) => void;
  isPrediction?: boolean;
}

export const AIFeedbackSystem: React.FC<AIFeedbackSystemProps> = ({
  messageId,
  currentFeedback,
  onFeedback,
  onToggleFavorite,
  isPrediction = false
}) => {
  const [showAccuracyRating, setShowAccuracyRating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(currentFeedback?.userNotes || '');

  const handleRating = (rating: 'helpful' | 'not-helpful' | 'very-helpful') => {
    onFeedback(messageId, { rating });
  };

  const handleAccuracyRating = (accuracyRating: number) => {
    onFeedback(messageId, { accuracyRating });
    setShowAccuracyRating(false);
  };

  const handleNotesSubmit = () => {
    onFeedback(messageId, { userNotes: notes });
    setShowNotes(false);
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'very-helpful': return '🌟';
      case 'helpful': return '👍';
      case 'not-helpful': return '👎';
      default: return '';
    }
  };

  return (
    <div className="ai-feedback-system">
      <div className="feedback-actions">
        {/* Rating Buttons */}
        <div className="feedback-rating">
          <button
            className={`feedback-btn ${currentFeedback?.rating === 'very-helpful' ? 'active' : ''}`}
            onClick={() => handleRating('very-helpful')}
            title="Very Helpful"
          >
            🌟
          </button>
          <button
            className={`feedback-btn ${currentFeedback?.rating === 'helpful' ? 'active' : ''}`}
            onClick={() => handleRating('helpful')}
            title="Helpful"
          >
            👍
          </button>
          <button
            className={`feedback-btn ${currentFeedback?.rating === 'not-helpful' ? 'active' : ''}`}
            onClick={() => handleRating('not-helpful')}
            title="Not Helpful"
          >
            👎
          </button>
        </div>

        {/* Favorite Button */}
        <button
          className={`feedback-btn favorite-btn ${currentFeedback?.isFavorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite(messageId)}
          title="Save as Favorite Insight"
        >
          {currentFeedback?.isFavorite ? '❤️' : '🤍'}
        </button>

        {/* Prediction Accuracy (for predictions) */}
        {isPrediction && (
          <button
            className="feedback-btn accuracy-btn"
            onClick={() => setShowAccuracyRating(!showAccuracyRating)}
            title="Rate Prediction Accuracy"
          >
            🎯
          </button>
        )}

        {/* Notes Button */}
        <button
          className="feedback-btn notes-btn"
          onClick={() => setShowNotes(!showNotes)}
          title="Add Notes"
        >
          📝
        </button>
      </div>

      {/* Accuracy Rating Panel */}
      {showAccuracyRating && (
        <div className="accuracy-rating-panel">
          <div className="accuracy-title">How accurate was this prediction?</div>
          <div className="accuracy-buttons">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                className={`accuracy-star ${currentFeedback?.accuracyRating === rating ? 'active' : ''}`}
                onClick={() => handleAccuracyRating(rating)}
              >
                ⭐
              </button>
            ))}
          </div>
          {currentFeedback?.accuracyRating && (
            <div className="accuracy-display">
              Rated: {currentFeedback.accuracyRating}/5 stars
            </div>
          )}
        </div>
      )}

      {/* Notes Panel */}
      {showNotes && (
        <div className="notes-panel">
          <textarea
            className="feedback-notes"
            placeholder="Add your notes about this response..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <div className="notes-actions">
            <button className="notes-save" onClick={handleNotesSubmit}>
              Save Notes
            </button>
            <button className="notes-cancel" onClick={() => setShowNotes(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feedback Status */}
      {currentFeedback?.rating && (
        <div className="feedback-status">
          <span className="feedback-indicator">
            {getRatingIcon(currentFeedback.rating)} Feedback received
          </span>
        </div>
      )}
    </div>
  );
};
