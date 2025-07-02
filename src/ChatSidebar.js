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
  const recognitionRef = useRef(null);

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
    recognitionRef.current = recognition;
  };

  const handleReact = async (msgId, emoji) => {
    const msgRef = collection(db, 'chats');
    const msgDoc = messages.find(msg => msg.id === msgId);
    const currentReactions = msgDoc.reactions || {};
    const userReactions = currentReactions[user.uid] || [];
    const updatedUserReactions = userReactions.includes(emoji)
      ? userReactions.filter(e => e !== emoji)
      : [...userReactions, emoji];
    const updatedReactions = { ...currentReactions, [user.uid]: updatedUserReactions };
    await addDoc(collection(db, 'chats'), {
      ...msgDoc,
      reactions: updatedReactions
    });
  };

  const groupByDate = msgs => {
    const grouped = {};
    msgs.forEach(msg => {
      const date = msg.timestamp?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupByDate(messages);

  return (
    <div className="chat-sidebar">
      <div className="chat-messages">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="date-divider">{date}</div>
            {msgs.map(msg => (
              <div key={msg.id} className="chat-bubble">
                <div className="chat-header">
                  <img src={msg.photo} alt="avatar" className="chat-avatar" />
                  <strong>{msg.name}</strong>
                  <span className="timestamp">{msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {msg.replyTo && (
                  <div className="chat-reply">
                    Replying to: {messages.find(m => m.id === msg.replyTo)?.text || 'Unknown'}
                  </div>
                )}
                <div className="chat-content">{msg.text}</div>
                <div className="chat-actions">
                  <button onClick={() => setReplyTo(msg)} className="reply-btn">↩️</button>
                  <button onClick={() => handleReact(msg.id, '❤️')}>❤️</button>
                  <button onClick={() => handleReact(msg.id, '😂')}>😂</button>
                  <button onClick={() => handleReact(msg.id, '👍')}>👍</button>
                  <div className="chat-reactions">
                    {Object.values(msg.reactions || {}).flat().map((emoji, i) => <span key={i}>{emoji}</span>)}
                  </div>
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
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}><FaRegSmile /></button>
        {showEmojiPicker && (
          <div className="emoji-picker-container">
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
        <button onClick={toggleVoiceInput}><FaMicrophone /></button>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatSidebar;