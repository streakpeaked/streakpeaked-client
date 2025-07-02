// ChatSidebar.js
import React, { useEffect, useState, useRef } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
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

  const toggleReaction = async (msgId, emoji) => {
    const msgDocRef = doc(db, 'chats', msgId);
    const msg = messages.find(m => m.id === msgId);
    const reactions = { ...msg.reactions };
    const userReactions = reactions[user.uid] || [];
    if (userReactions.includes(emoji)) {
      reactions[user.uid] = userReactions.filter(e => e !== emoji);
    } else {
      reactions[user.uid] = [...userReactions, emoji];
    }
    await updateDoc(msgDocRef, { reactions });
  };

  const groupByDate = msgs => {
    const grouped = {};
    msgs.forEach(msg => {
      const date = msg.timestamp?.toDate().toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupByDate(messages);

  return (
    <div style={{ backgroundColor: '#e5f6ff', borderRadius: '12px', padding: '10px', maxHeight: '600px', overflowY: 'auto', fontFamily: 'Segoe UI, sans-serif' }}>
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          <div style={{ textAlign: 'center', color: '#6b7280', margin: '12px 0', fontSize: '14px' }}>{date}</div>
          {msgs.map(msg => {
            const isCurrentUser = msg.uid === user.uid;
            const bubbleStyle = {
              backgroundColor: isCurrentUser ? '#dcf8c6' : '#ffffff',
              padding: '10px 15px',
              borderRadius: '8px',
              margin: '4px 0',
              maxWidth: '70%',
              alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
              boxShadow: '0 0 4px rgba(0,0,0,0.1)',
              position: 'relative'
            };
            const reactions = Object.entries(msg.reactions || {}).flatMap(([uid, emojis]) => emojis.map(e => `${e}`));
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isCurrentUser ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: 2 }}>{msg.name}</div>
                <div style={bubbleStyle}>
                  {msg.replyTo && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: 5, borderLeft: '2px solid #9ca3af', paddingLeft: 6 }}>
                      Replying to: {messages.find(m => m.id === msg.replyTo)?.text || 'Unknown'}
                    </div>
                  )}
                  <div style={{ fontSize: '14px' }}>{msg.text}</div>
                  <div style={{ fontSize: '10px', textAlign: 'right', marginTop: 4, color: '#4b5563' }}>{msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                    {["❤️", "😂", "👍"].map(emoji => (
                      <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{emoji}</button>
                    ))}
                  </div>
                  {reactions.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: '12px' }}>{[...new Set(reactions)].join(' ')}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={chatEndRef} />

      {replyTo && (
        <div style={{ backgroundColor: '#fef9c3', padding: '8px', borderRadius: '6px', marginBottom: '8px' }}>
          Replying to: {replyTo.text}
          <button onClick={() => setReplyTo(null)} style={{ marginLeft: 10, background: 'none', border: 'none', color: '#dc2626' }}>❌</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 10 }}>
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ background: 'none', border: 'none', fontSize: '18px' }}><FaRegSmile /></button>
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '70px', zIndex: 100 }}>
            <Picker onEmojiClick={handleEmojiClick} height={300} width={250} />
          </div>
        )}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
        />
        <button onClick={toggleVoiceInput} style={{ background: 'none', border: 'none', fontSize: '18px' }}><FaMicrophone /></button>
        <button onClick={sendMessage} style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 14px', border: 'none', borderRadius: '6px' }}>Send</button>
      </div>
    </div>
  );
}

export default ChatSidebar;
