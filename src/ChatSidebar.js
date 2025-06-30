import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './ChatSidebar.css';

function ChatSidebar({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    const q = query(collection(db, "userChats"), orderBy("timestamp"));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsub();
  }, []);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      await addDoc(collection(db, "userChats"), {
        text: newMsg,
        uid: user.uid,
        user: user.displayName || "Anonymous",
        timestamp: serverTimestamp()
      });
      setNewMsg("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <div className="chat-sidebar">
      <h4>Live Chat</h4>
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className="chat-message">
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMsg}
          placeholder="Type your message..."
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatSidebar;
