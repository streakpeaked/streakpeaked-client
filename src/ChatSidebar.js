// ChatSidebar.js
import React, { useEffect, useState, useRef } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import Picker from 'emoji-picker-react';
import { FaMicrophone, FaRegSmile } from 'react-icons/fa';
import './ChatSidebar.css';

function ChatSidebar({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    await addDoc(collection(db, 'chats'), {
      text: newMessage,
      timestamp: serverTimestamp(),
      uid: user.uid,
      name: user.displayName,
      photo: user.photoURL,
      replyTo: replyTo?.id || null,
      reactions: {}
    });
    setNewMessage('');
    setReplyTo(null);
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech Recognition not supported');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onresult = event => {
      setNewMessage(prev => prev + event.results[0][0].transcript);
    };
    recognition.start();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const groupedByDate = messages.reduce((acc, msg) => {
    const date = msg.timestamp?.toDate();
    const dateKey = formatDate(date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  return (
    <div className="chat-container">
      <div className="chat-body">
        {Object.entries(groupedByDate).map(([date, msgs]) => (
          <div key={date}>
            <div className="date-divider">{date}</div>
            {msgs.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.uid === user.uid ? 'own' : ''}`}>
                <div className="msg-header">
                  <img src={msg.photo} alt="avatar" className="avatar" />
                  <strong>{msg.name}</strong>
                  <span className="time">{formatTime(msg.timestamp?.toDate())}</span>
                </div>
                {msg.replyTo && (
                  <div className="reply-block">
                    <small>Replying to: {messages.find(m => m.id === msg.replyTo)?.text || '...'}</small>
                  </div>
                )}
                <div className="msg-text">{msg.text}</div>
                <div className="msg-actions">
                  <span className="emoji-react" onClick={() => setReplyTo(msg)}>↩️</span>
                  <span className="emoji-react">❤️</span>
                  <span className="emoji-react">😂</span>
                  <span className="emoji-react">👍</span>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {replyTo && (
        <div className="reply-preview">
          Replying to: {replyTo.text}
          <button onClick={() => setReplyTo(null)}>❌</button>
        </div>
      )}

      <div className="chat-input">
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="icon-btn"><FaRegSmile /></button>
        {showEmojiPicker && (
          <div className="emoji-box">
            <Picker onEmojiClick={handleEmojiClick} height={300} width={250} />
          </div>
        )}
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={toggleVoiceInput} className="icon-btn"><FaMicrophone /></button>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatSidebar;
