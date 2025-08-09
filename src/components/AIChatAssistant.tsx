import React, { useState, useEffect, useRef } from 'react';
import { EnergyLevel } from '../types/energy';
import { AIAssistantEngine, ChatMessage, PatternInsight, PersonalizedCoachingPlan, MessageFeedback } from '../services/AIAssistantEngine';
import { AIFeedbackSystem } from './AIFeedbackSystem';
import { AILearningDashboard } from './AILearningDashboard';
import './AIChatAssistant.css';

interface AIChatAssistantProps {
  data: EnergyLevel[];
  currentEnergy: EnergyLevel;
  isOpen: boolean;
  onToggle: () => void;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  data,
  currentEnergy,
  isOpen,
  onToggle
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'patterns' | 'coaching'>('chat');
  const [discoveredPatterns, setDiscoveredPatterns] = useState<PatternInsight[]>([]);
  const [coachingPlan, setCoachingPlan] = useState<PersonalizedCoachingPlan | null>(null);
  const [showLearningDashboard, setShowLearningDashboard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize AI Assistant when data changes
  useEffect(() => {
    if (data.length > 0) {
      AIAssistantEngine.initialize(data);
      setMessages(AIAssistantEngine.getChatHistory());
      setDiscoveredPatterns(AIAssistantEngine.getDiscoveredPatterns());
      setCoachingPlan(AIAssistantEngine.getCoachingPlan());

      // Add welcome message if no chat history
      if (AIAssistantEngine.getChatHistory().length === 0) {
        const patterns = AIAssistantEngine.getDiscoveredPatterns();
        const welcomeMessage: ChatMessage = {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: `👋 Hi there! I'm your AI Energy Assistant. I've analyzed your energy data and discovered some interesting patterns. 

**Here's what I can help you with:**
• 📊 **Analyze your energy patterns** - Ask about trends, peaks, and correlations
• 🔮 **Predict future energy levels** - Get forecasts for upcoming days
• 🎯 **Provide personalized coaching** - Receive tailored optimization strategies
• 💡 **Answer energy questions** - Get insights about your specific energy data

**Try asking me things like:**
- "What are my energy patterns?"
- "When am I most creative?"
- "How can I improve my energy levels?"
- "Predict my energy for tomorrow"

What would you like to explore first?`,
          timestamp: new Date(),
          metadata: {
            confidence: 100,
            sources: ['AI Assistant'],
            patterns: patterns.slice(0, 3),
          }
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [data]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      await AIAssistantEngine.processUserMessage(userMessage);
      const updatedMessages = AIAssistantEngine.getChatHistory();
      setMessages(updatedMessages);
      
      // Update patterns and coaching plan if they've changed
      setDiscoveredPatterns(AIAssistantEngine.getDiscoveredPatterns());
      setCoachingPlan(AIAssistantEngine.getCoachingPlan());
    } catch (error) {
      console.error('Error processing message:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your message. Please try rephrasing your question or ask something else!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Feedback handlers
  const handleFeedback = (messageId: string, feedback: Partial<MessageFeedback>) => {
    AIAssistantEngine.provideFeedback(messageId, feedback);
    // Update local state to reflect feedback
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback: { ...msg.feedback, ...feedback, timestamp: new Date() } as MessageFeedback }
          : msg
      )
    );
  };

  const handleToggleFavorite = (messageId: string) => {
    AIAssistantEngine.toggleFavoriteInsight(messageId);
    // Update local state
    setMessages(prev => 
      prev.map(msg => {
        if (msg.id === messageId) {
          const currentFavorite = msg.feedback?.isFavorite || false;
          return {
            ...msg,
            feedback: {
              ...msg.feedback,
              isFavorite: !currentFavorite,
              rating: msg.feedback?.rating || null,
              timestamp: new Date()
            } as MessageFeedback
          };
        }
        return msg;
      })
    );
  };

  const getSuggestionQuestions = (): string[] => {
    const suggestions = [
      "What are my energy patterns this week?",
      "When am I most creative?",
      "How can I improve my energy levels?",
      "Predict my energy for tomorrow",
      "What affects my mental energy?",
      "Show me my best and worst days",
    ];

    // Add pattern-specific suggestions
    if (discoveredPatterns.length > 0) {
      const patternTypes = discoveredPatterns.map(p => p.type);
      if (patternTypes.includes('cycle')) {
        suggestions.push("Tell me about my daily rhythm");
      }
      if (patternTypes.includes('correlation')) {
        suggestions.push("What energy types are connected?");
      }
    }

    return suggestions.slice(0, 4);
  };

  const formatMessageContent = (content: string): string => {
    // Convert markdown-like formatting to HTML-friendly format
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^•\s(.+)$/gm, '<div class="bullet-point">• $1</div>');
  };

  if (!isOpen) {
    return (
      <button
        className="ai-chat-fab"
        onClick={onToggle}
        title="Open AI Chat Assistant"
        aria-label="Open AI Chat Assistant"
      >
        🤖
      </button>
    );
  }

  return (
    <div className="ai-chat-assistant">
      <button
        className="ai-chat-close"
        onClick={onToggle}
        aria-label="Close AI Chat Assistant"
      >
        ✕
      </button>
      
      <div className="ai-chat-header">
        <div className="ai-header-top">
          <div className="ai-chat-title">
            <span className="ai-chat-icon">🤖</span>
            <h3>AI Energy Assistant</h3>
          </div>
          <button
            className="ai-learning-btn"
            onClick={() => setShowLearningDashboard(true)}
            title="View AI Learning Progress"
            aria-label="View AI Learning Progress"
          >
            📊
          </button>
        </div>
        <div className="ai-chat-status">
          {data.length > 0 ? `${discoveredPatterns.length} patterns found` : 'No data'}
        </div>
        
        <div className="ai-chat-tabs">
          <button
            className={`ai-tab ${activeView === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveView('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`ai-tab ${activeView === 'patterns' ? 'active' : ''}`}
            onClick={() => setActiveView('patterns')}
            disabled={discoveredPatterns.length === 0}
          >
            🔍 Patterns ({discoveredPatterns.length})
          </button>
          <button
            className={`ai-tab ${activeView === 'coaching' ? 'active' : ''}`}
            onClick={() => setActiveView('coaching')}
            disabled={!coachingPlan}
          >
            🎯 Coaching
          </button>
        </div>

        <button
          className="ai-chat-close"
          onClick={onToggle}
          aria-label="Close AI Chat Assistant"
        >
          ✕
        </button>
      </div>

      <div className="ai-chat-content">
        {activeView === 'chat' && (
          <>
            <div className="ai-chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`ai-message ${message.role === 'user' ? 'user' : 'assistant'}`}
                >
                  <div className="ai-message-content">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: formatMessageContent(message.content) 
                      }} 
                    />
                    {message.metadata && (
                      <div className="ai-message-metadata">
                        {message.metadata.confidence && (
                          <span className="ai-confidence">
                            {message.metadata.confidence}% confident
                          </span>
                        )}
                        {message.metadata.sources && message.metadata.sources.length > 0 && (
                          <span className="ai-sources">
                            Sources: {message.metadata.sources.join(', ')}
                          </span>
                        )}
                        {message.metadata.actionItems && message.metadata.actionItems.length > 0 && (
                          <div className="ai-action-items">
                            <strong>Action Items:</strong>
                            {message.metadata.actionItems.map((item, index) => (
                              <div key={index} className="action-item">• {item}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Add Feedback System for Assistant Messages */}
                  {message.role === 'assistant' && (
                    <AIFeedbackSystem
                      messageId={message.id}
                      currentFeedback={message.feedback}
                      onFeedback={handleFeedback}
                      onToggleFavorite={handleToggleFavorite}
                      isPrediction={message.content.toLowerCase().includes('prediction') || 
                                   message.content.toLowerCase().includes('forecast')}
                    />
                  )}
                  
                  <div className="ai-message-timestamp">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="ai-message assistant loading">
                  <div className="ai-message-content">
                    <div className="ai-loading">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      Analyzing your energy data...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="ai-suggestions">
                <div className="ai-suggestions-title">💡 Try asking:</div>
                <div className="ai-suggestions-grid">
                  {getSuggestionQuestions().map((suggestion, index) => (
                    <button
                      key={index}
                      className="ai-suggestion-btn"
                      onClick={() => setInputMessage(suggestion)}
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="ai-chat-input">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your energy patterns, predictions, or optimizations..."
                rows={2}
                disabled={isLoading}
                className="ai-input-field"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="ai-send-btn"
                aria-label="Send message"
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
          </>
        )}

        {activeView === 'patterns' && (
          <div className="ai-patterns-view">
            <div className="ai-patterns-header">
              <h4>🔍 Discovered Patterns</h4>
              <p>AI-identified insights from your energy data</p>
            </div>
            
            {discoveredPatterns.length === 0 ? (
              <div className="ai-empty-state">
                <div className="empty-icon">📊</div>
                <h5>No Patterns Yet</h5>
                <p>Keep logging your energy levels! I'll discover patterns as more data becomes available.</p>
              </div>
            ) : (
              <div className="ai-patterns-grid">
                {discoveredPatterns.map((pattern) => (
                  <div key={pattern.id} className={`ai-pattern-card ${pattern.type}`}>
                    <div className="ai-pattern-header">
                      <h5>{pattern.title}</h5>
                      <div className="ai-pattern-meta">
                        <span className={`ai-pattern-confidence ${pattern.confidence > 80 ? 'high' : pattern.confidence > 60 ? 'medium' : 'low'}`}>
                          {pattern.confidence}% confident
                        </span>
                        <span className={`ai-pattern-impact ${pattern.impact}`}>
                          {pattern.impact} impact
                        </span>
                      </div>
                    </div>
                    
                    <p className="ai-pattern-description">{pattern.description}</p>
                    
                    <div className="ai-pattern-timeframe">
                      📅 Timeframe: {pattern.timeframe}
                    </div>
                    
                    {pattern.suggestions && pattern.suggestions.length > 0 && (
                      <div className="ai-pattern-suggestions">
                        <strong>💡 Suggestions:</strong>
                        {pattern.suggestions.map((suggestion, index) => (
                          <div key={index} className="pattern-suggestion">• {suggestion}</div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      className="ai-pattern-chat-btn"
                      onClick={() => {
                        setInputMessage(`Tell me more about: ${pattern.title}`);
                        setActiveView('chat');
                      }}
                    >
                      Ask about this pattern
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'coaching' && (
          <div className="ai-coaching-view">
            <div className="ai-coaching-header">
              <h4>🎯 Personalized Coaching</h4>
              <p>AI-generated plan to optimize your energy</p>
            </div>
            
            {!coachingPlan ? (
              <div className="ai-empty-state">
                <div className="empty-icon">🎯</div>
                <h5>Coaching Plan Coming Soon</h5>
                <p>I need more energy data to create a personalized coaching plan. Keep tracking your energy levels!</p>
              </div>
            ) : (
              <div className="ai-coaching-content">
                <div className="ai-coaching-overview">
                  <h5>{coachingPlan.title}</h5>
                  <p>{coachingPlan.description}</p>
                  <div className="coaching-meta">
                    <span>📅 Timeline: {coachingPlan.timeline}</span>
                    <span>📍 Current Phase: {coachingPlan.currentPhase}</span>
                  </div>
                </div>
                
                <div className="ai-coaching-goals">
                  <h6>🎯 Goals</h6>
                  {coachingPlan.goals.map((goal) => (
                    <div key={goal.id} className="coaching-goal">
                      <div className="goal-header">
                        <strong>{goal.title}</strong>
                        <span className="goal-progress">{goal.progress}%</span>
                      </div>
                      <p>{goal.description}</p>
                      <div className="goal-metrics">
                        <span>Current: {goal.currentValue}</span>
                        <span>Target: {goal.targetValue}</span>
                        <span>Deadline: {goal.deadline.toLocaleDateString()}</span>
                      </div>
                      <div className="goal-progress-bar">
                        <div className={`goal-progress-fill progress-${goal.progress > 75 ? 'high' : goal.progress > 25 ? 'medium' : 'low'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="ai-coaching-strategies">
                  <h6>📋 Strategies</h6>
                  {coachingPlan.strategies.map((strategy) => (
                    <div key={strategy.id} className="coaching-strategy">
                      <div className="strategy-header">
                        <strong>{strategy.title}</strong>
                        <div className="strategy-meta">
                          <span className={`strategy-difficulty ${strategy.difficulty}`}>
                            {strategy.difficulty}
                          </span>
                          <span className="strategy-impact">
                            Impact: {strategy.estimatedImpact}/10
                          </span>
                        </div>
                      </div>
                      <p>{strategy.description}</p>
                      <div className="strategy-implementation">
                        <strong>Implementation:</strong>
                        {strategy.implementation.map((step, index) => (
                          <div key={index} className="implementation-step">• {step}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="ai-coaching-next-steps">
                  <h6>👣 Next Steps</h6>
                  {coachingPlan.nextSteps.map((step, index) => (
                    <div key={index} className="next-step">• {step}</div>
                  ))}
                </div>
                
                <button
                  className="ai-coaching-chat-btn"
                  onClick={() => {
                    setInputMessage("Help me implement my coaching plan");
                    setActiveView('chat');
                  }}
                >
                  Chat about my coaching plan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Learning Dashboard */}
      <AILearningDashboard
        isVisible={showLearningDashboard}
        onClose={() => setShowLearningDashboard(false)}
      />
    </div>
  );
};
