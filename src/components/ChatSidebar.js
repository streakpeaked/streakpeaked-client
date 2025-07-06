// Enhanced Real-time Multi-user ChatSidebar.js
import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  deleteDoc,
  where,
  getDocs
} from 'firebase/firestore';
import Picker from 'emoji-picker-react';
import { FaMicrophone, FaRegSmile, FaReply, FaTrash, FaUsers } from 'react-icons/fa';
import './ChatSidebar.css';

const ChatSidebar = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [chatMode, setChatMode] = useState('general');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Real-time messages listener
  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  // Online users listener
  useEffect(() => {
    const q = query(collection(db, 'onlineUsers'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOnlineUsers(users);
    });
    return () => unsubscribe();
  }, []);

  // Typing indicator listener
  useEffect(() => {
    const q = query(collection(db, 'typing'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const typing = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTypingUsers(typing.filter(t => t.uid !== user.uid));
    });
    return () => unsubscribe();
  }, [user.uid]);

  // Set user as online when component mounts
  useEffect(() => {
    const setUserOnline = async () => {
      await addDoc(collection(db, 'onlineUsers'), {
        uid: user.uid,
        name: user.displayName,
        photo: user.photoURL,
        timestamp: serverTimestamp()
      });
    };
    
    setUserOnline();
    
    // Remove user from online list when component unmounts
    return async () => {
      const q = query(collection(db, 'onlineUsers'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    };
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send message function
  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      await addDoc(collection(db, 'chats'), {
        text: newMessage,
        timestamp: serverTimestamp(),
        uid: user.uid,
        name: user.displayName,
        photo: user.photoURL,
        replyTo: replyTo?.id || null,
        reactions: {},
        chatMode: chatMode
      });

      setNewMessage('');
      setReplyTo(null);
      setShowEmojiPicker(false);
      
      // Clear typing indicator
      clearTypingIndicator();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  // Voice input functionality
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage(prev => prev + transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
    
    recognition.start();
  };

  // Handle typing indicator
  const handleTypingStart = async () => {
    if (!isTyping) {
      setIsTyping(true);
      try {
        await addDoc(collection(db, 'typing'), {
          uid: user.uid,
          name: user.displayName,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error('Error setting typing indicator:', error);
      }
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      clearTypingIndicator();
    }, 3000);
  };

  const clearTypingIndicator = async () => {
    if (isTyping) {
      setIsTyping(false);
      try {
        const q = query(collection(db, 'typing'), where('uid', '==', user.uid));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      } catch (error) {
        console.error('Error clearing typing indicator:', error);
      }
    }
  };

  // Handle message input change
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    handleTypingStart();
  };

  // Handle message reactions
  const handleReaction = async (messageId, emoji) => {
    try {
      const messageRef = doc(db, 'chats', messageId);
      const message = messages.find(m => m.id === messageId);
      const reactions = message.reactions || {};
      
      if (!reactions[user.uid]) {
        reactions[user.uid] = [];
      }
      
      if (reactions[user.uid].includes(emoji)) {
        reactions[user.uid] = reactions[user.uid].filter(e => e !== emoji);
      } else {
        reactions[user.uid].push(emoji);
      }
      
      await updateDoc(messageRef, { reactions });
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  // Delete message (only own messages)
  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'chats', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Group messages by date
  const groupByDate = (msgs) => {
    const grouped = {};
    msgs.forEach(msg => {
      if (msg.timestamp) {
        const date = msg.timestamp.toDate().toDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(msg);
      }
    });
    return grouped;
  };

  // Clear all messages (admin function)
  const clearAllMessages = async () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      try {
        const q = query(collection(db, 'chats'));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      } catch (error) {
        console.error('Error clearing messages:', error);
      }
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupedMessages = groupByDate(messages);

  // Minimized view
  if (isMinimized) {
    return (
      <div className="chat-sidebar minimized">
        <div className="chat-header minimized" onClick={() => setIsMinimized(false)}>
          <div className="chat-title">💬 Live Chat ({onlineUsers.length})</div>
          {messages.length > 0 && (
            <div className="unread-indicator">
              {messages.slice(-1)[0]?.name}: {messages.slice(-1)[0]?.text.substring(0, 20)}...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <div className="chat-title">
          💬 Live Chat 
          <span className="online-count">({onlineUsers.length} online)</span>
        </div>
        <div className="chat-controls">
          <button 
            className={`users-btn ${showUserList ? 'active' : ''}`}
            onClick={() => setShowUserList(!showUserList)}
            title="Show online users"
          >
            <FaUsers />
          </button>
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

      {/* Online Users List */}
      {showUserList && (
        <div className="online-users-list">
          <div className="users-header">Online Users ({onlineUsers.length})</div>
          <div className="users-grid">
            {onlineUsers.map((onlineUser) => (
              <div key={onlineUser.id} className="online-user">
                <img 
                  src={onlineUser.photo || '/default-avatar.png'} 
                  alt={onlineUser.name}
                  className="user-avatar"
                />
                <span className="user-name">{onlineUser.name}</span>
                <span className="online-indicator">🟢</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Mode Selector */}
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
          Help
        </button>
      </div>

      {/* Messages Container */}
      <div className="chat-messages" ref={chatContainerRef}>
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="date-separator">{date}</div>
            {msgs.map((msg) => {
              const isCurrentUser = msg.uid === user.uid;
              const replyToMessage = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
              
              return (
                <div key={msg.id} className={`message ${isCurrentUser ? 'user-message' : 'other-message'}`}>
                  <div className="message-header">
                    <img 
                      src={msg.photo || '/default-avatar.png'} 
                      alt={msg.name}
                      className="message-avatar"
                    />
                    <span className="message-author">{msg.name}</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                    {msg.chatMode && (
                      <span className={`message-mode ${msg.chatMode}`}>
                        {msg.chatMode}
                      </span>
                    )}
                  </div>
                  
                  <div className="message-content">
                    {replyToMessage && (
                      <div className="reply-reference">
                        <FaReply className="reply-icon" />
                        <span>Replying to {replyToMessage.name}: {replyToMessage.text.substring(0, 50)}...</span>
                      </div>
                    )}
                    
                    <div className="message-text">{msg.text}</div>
                    
                    {/* Reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="message-reactions">
                        {Object.entries(msg.reactions).map(([uid, emojis]) => 
                          emojis.map((emoji, index) => (
                            <span key={`${uid}-${index}`} className="reaction">
                              {emoji}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                    
                    {/* Message Actions */}
                    <div className="message-actions">
                      <button 
                        className="action-btn"
                        onClick={() => setReplyTo(msg)}
                        title="Reply"
                      >
                        <FaReply />
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleReaction(msg.id, '👍')}
                        title="Like"
                      >
                        👍
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleReaction(msg.id, '❤️')}
                        title="Love"
                      >
                        ❤️
                      </button>
                      {isCurrentUser && (
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => deleteMessage(msg.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="typing-indicators">
            {typingUsers.map((typingUser) => (
              <div key={typingUser.id} className="typing-indicator">
                <span className="typing-user">{typingUser.name}</span>
                <span className="typing-text">is typing</span>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="reply-preview">
          <div className="reply-content">
            <FaReply className="reply-icon" />
            <span>Replying to {replyTo.name}: {replyTo.text.substring(0, 50)}...</span>
          </div>
          <button 
            className="cancel-reply-btn"
            onClick={() => setReplyTo(null)}
          >
            ✖️
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker-container">
          <Picker 
            onEmojiClick={handleEmojiClick} 
            height={300} 
            width={280}
            theme="light"
          />
        </div>
      )}

      {/* Chat Input */}
      <div className="chat-input">
        <div className="input-container">
          <button 
            className="emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
          >
            <FaRegSmile />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={handleMessageChange}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="message-input"
          />
          
          <button 
            className="voice-btn"
            onClick={toggleVoiceInput}
            title="Voice input"
          >
            <FaMicrophone />
          </button>
          
          <button 
            onClick={sendMessage}
            className="send-btn"
            disabled={newMessage.trim() === ''}
          >
            Send
          </button>
        </div>
        
        <div className="chat-actions">
          <button 
            className="clear-chat-btn"
            onClick={clearAllMessages}
            title="Clear all messages"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;