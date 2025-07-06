// Enhanced ChatSidebar.js
import React, { useState, useEffect, useRef } from 'react';
import './ChatSidebar.css';

const ChatSidebar = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState('general'); // 'general', 'study', 'motivation'
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const predefinedResponses = {
    general: [
      "How can I help you with your preparation today?",
      "What specific topic would you like to focus on?",
      "Are you feeling confident about your current progress?",
      "Would you like some study tips or motivation?"
    ],
    study: [
      "Try breaking down complex problems into smaller steps.",
      "Focus on understanding concepts rather than memorizing.",
      "Practice regularly and review your mistakes.",
      "Use active recall techniques while studying."
    ],
    motivation: [
      "You're doing great! Every question you solve makes you stronger.",
      "Remember, consistency is key to success.",
      "Believe in yourself - you have the potential to achieve your goals!",
      "Take breaks when needed, but don't give up on your dreams."
    ]
  };

  const quickActions = [
    { label: "Study Tips", action: "study_tips" },
    { label: "Motivation", action: "motivation" },
    { label: "Time Management", action: "time_management" },
    { label: "Exam Strategy", action: "exam_strategy" }
  ];

  useEffect(() => {
    // Add welcome message when chat opens
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: `Hi ${user?.displayName || 'there'}! I'm here to help you with your preparation. How can I assist you today?`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(newMessage);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    let response = '';
    
    // Simple keyword-based responses
    if (message.includes('help') || message.includes('stuck')) {
      response = "I understand you need help. Can you tell me which specific topic or question type you're struggling with?";
    } else if (message.includes('time') || message.includes('slow')) {
      response = "Time management is crucial! Try setting time limits for each question and practice with a timer. Speed comes with practice.";
    } else if (message.includes('difficult') || message.includes('hard')) {
      response = "Don't worry about difficult questions! Start with easier ones to build confidence, then gradually tackle harder problems.";
    } else if (message.includes('motivation') || message.includes('tired')) {
      response = "Remember why you started this journey. Every small step counts, and you're already doing better than those who haven't even started!";
    } else if (message.includes('strategy') || message.includes('approach')) {
      response = "Great question! Focus on accuracy first, then speed. Identify your strong and weak areas, and allocate time accordingly.";
    } else if (message.includes('thanks') || message.includes('thank')) {
      response = "You're welcome! I'm here whenever you need support. Keep up the great work!";
    } else {
      // Random response from current mode
      const responses = predefinedResponses[chatMode];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return {
      id: Date.now(),
      text: response,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'text'
    };
  };

  const handleQuickAction = (action) => {
    let response = '';
    
    switch (action) {
      case 'study_tips':
        response = "Here are some effective study tips:\n\n• Use active recall - test yourself frequently\n• Create mind maps for complex topics\n• Practice previous year questions\n• Take regular breaks (Pomodoro technique)\n• Review mistakes immediately";
        break;
      case 'motivation':
        response = "🌟 You're capable of amazing things! Remember:\n\n• Every expert was once a beginner\n• Progress, not perfection\n• Your future self will thank you\n• Success is the sum of small efforts repeated daily\n• Believe in yourself!";
        break;
      case 'time_management':
        response = "⏰ Time Management Tips:\n\n• Set specific study hours\n• Use a timer for each topic\n• Prioritize high-weightage topics\n• Don't spend too long on one question\n• Practice speed with accuracy";
        break;
      case 'exam_strategy':
        response = "🎯 Exam Strategy:\n\n• Read all questions first\n• Start with easier questions\n• Don't get stuck on one question\n• Manage your time wisely\n• Stay calm and focused\n• Review answers if time permits";
        break;
      default:
        response = "I'm here to help! What would you like to know more about?";
    }

    const botMessage = {
      id: Date.now(),
      text: response,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    setMessages([]);
    const welcomeMessage = {
      id: Date.now(),
      text: `Chat cleared! How can I help you now?`,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  };

  if (isMinimized) {
    return (
      <div className="chat-sidebar minimized">
        <div className="chat-header minimized" onClick={() => setIsMinimized(false)}>
          <div className="chat-title">💬 Chat</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <div className="chat-title">💬 Study Assistant</div>
        <div className="chat-controls">
          <button 
            className="minimize-btn"
            onClick={() => setIsMinimized(true)}
            title="Minimize"
          >
            ➖
          </button>
          <button 
            className="close-btn"
            onClick={onClose}
            title="Close chat"
          >
            ✖️
          </button>
        </div>
      </div>

      <div className="chat-mode-selector">
        <button 
          className={`mode-btn ${chatMode === 'general' ? 'active' : ''}`}
          onClick={() => setChatMode('general')}
        >
          General
        </button>
        <button 
          className={`mode-btn ${chatMode === 'study' ? 'active' : ''}`}
          onClick={() => setChatMode('study')}
        >
          Study
        </button>
        <button 
          className={`mode-btn ${chatMode === 'motivation' ? 'active' : ''}`}
          onClick={() => setChatMode('motivation')}
        >
          Motivation
        </button>
      </div>

      <div className="quick-actions">
        <div className="quick-actions-title">Quick Help:</div>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <button 
              key={index}
              className="quick-action-btn"
              onClick={() => handleQuickAction(action.action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="message-input"
          />
          <button 
            onClick={handleSendMessage}
            className="send-btn"
            disabled={newMessage.trim() === ''}
          >
            📤
          </button>
        </div>
        <div className="chat-actions">
          <button 
            className="clear-chat-btn"
            onClick={clearChat}
            title="Clear chat"
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;