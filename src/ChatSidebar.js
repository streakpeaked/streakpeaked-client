// ChatSidebar.js
import React, { useEffect, useState, useRef } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';

const ChatSidebar = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'chat'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(chats);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await addDoc(collection(db, 'chat'), {
      text: input.trim(),
      sender: user.displayName,
      uid: user.uid,
      replyTo,
      timestamp: serverTimestamp()
    });
    setInput('');
    setReplyTo(null);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech Recognition not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (e) => setInput(prev => prev + e.results[0][0].transcript);
    recognition.start();
    recognitionRef.current = recognition;
  };

  const formatDate = (ts) => {
    const d = ts?.toDate();
    return d?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (ts) => {
    const d = ts?.toDate();
    return d?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, msg) => {
      const dateKey = formatDate(msg.timestamp);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(msg);
      return acc;
    }, {});
  };

  const handleReact = async (msgId, emoji) => {
    await addDoc(collection(db, 'chat'), {
      text: `${emoji}`,
      sender: user.displayName,
      uid: user.uid,
      replyTo: msgId,
      timestamp: serverTimestamp()
    });
  };

  const grouped = groupMessagesByDate(messages);

  return (
    <div style={{ padding: 10, backgroundColor: '#f8fafc', borderRadius: '8px', height: '500px', overflowY: 'auto', boxShadow: '0 0 8px rgba(0,0,0,0.1)' }}>
      <h3 style={{ textAlign: 'center', color: '#1e3a8a' }}>💬 Live Chat</h3>
      {Object.entries(grouped).map(([date, msgs]) => (
        <div key={date}>
          <div style={{ textAlign: 'center', color: '#6b7280', margin: '10px 0', fontSize: '14px' }}>{date}</div>
          {msgs.map(msg => (
            <div key={msg.id} style={{
              backgroundColor: msg.uid === user.uid ? '#dbeafe' : '#e5e7eb',
              padding: '10px',
              borderRadius: '10px',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{msg.sender}</div>
              {msg.replyTo && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>↪️ Replying to {msg.replyTo}</div>
              )}
              <div>{msg.text}</div>
              <div style={{ fontSize: '10px', textAlign: 'right', color: '#6b7280' }}>{formatTime(msg.timestamp)}</div>
              <div style={{ marginTop: '4px', display: 'flex', gap: '6px' }}>
                {['👍','❤️','😂','😮','👎'].map(e => (
                  <button key={e} onClick={() => handleReact(msg.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{e}</button>
                ))}
                <button onClick={() => setReplyTo(msg.text)} style={{ background: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer' }}>Reply</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div ref={chatEndRef} />

      {replyTo && (
        <div style={{ marginTop: 10, fontSize: '12px', color: '#6b7280' }}>
          ↩️ Replying to: "{replyTo}" <button onClick={() => setReplyTo(null)} style={{ marginLeft: 10, color: '#ef4444', background: 'none', border: 'none' }}>Cancel</button>
        </div>
      )}

      <div style={{ display: 'flex', marginTop: '10px', gap: '6px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button onClick={handleSend} style={{ padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px' }}>Send</button>
        <button onClick={startVoiceInput} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px' }}>🎙</button>
      </div>
    </div>
  );
};

export default ChatSidebar;