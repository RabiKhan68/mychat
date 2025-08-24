// src/App.jsx
import React, { useEffect, useState } from "react";
import { db, auth, messaging, requestNotificationPermission } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { onMessage } from "firebase/messaging";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [editId, setEditId] = useState(null);

  // 🔹 Restore username from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) setUsername(savedName);
  }, []);

  // 🔹 Join chat (set username)
  const joinChat = () => {
    if (tempName.trim()) {
      setUsername(tempName.trim());
      localStorage.setItem("username", tempName.trim());
    }
  };

  // 🔹 Logout / Change username
  const logout = () => {
    localStorage.removeItem("username");
    setUsername("");
    setTempName("");
  };

  // 🔹 Load messages in real-time
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Request notification permission + get FCM token
  useEffect(() => {
    const setupFCM = async () => {
      const token = await requestNotificationPermission();
      if (token) {
        console.log("FCM Token:", token);
        // ✅ You can send this token to your backend to send push notifications
      }
    };
    setupFCM();

    // 🔹 Handle foreground notifications
    onMessage(messaging, (payload) => {
      console.log("📩 Foreground message:", payload);
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: "/chat.png",
        });
      }
    });
  }, []);

  // 🔹 Send or edit a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !username) return;

    if (editId) {
      const ref = doc(db, "messages", editId);
      await updateDoc(ref, { text: newMsg });
      setEditId(null);
    } else {
      await addDoc(collection(db, "messages"), {
        text: newMsg,
        uid: auth.currentUser?.uid,
        user: username,
        createdAt: serverTimestamp(),
      });
      playSound("sent");
    }

    setNewMsg("");
  };

  // 🔹 Delete a message
  const deleteMessage = async (id) => {
    await deleteDoc(doc(db, "messages", id));
  };

  // 🔹 Play sound effects
  const playSound = (type) => {
    const audio = new Audio(type === "sent" ? "/sent.mp3" : "/received.mp3");
    audio.play().catch(() => {});
  };

  // 🔹 Play "received" sound when a new message comes (not mine)
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.user !== username) playSound("received");
    }
  }, [messages]);

  // 🔹 Username input screen
  if (!username) {
    return (
      <div className="app-container">
        <div className="username-box">
          <h2>Welcome to Room Chat</h2>
          <p>Please enter a username to continue:</p>
          <div className="username-input">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Enter username..."
            />
            <button onClick={joinChat}>Join Chat</button>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Chat screen
  return (
    <div className="app-container">
      <div className="chat-box">
        <h1>Room Chat</h1>
        <p className="logged-user">
          Logged in as: <b>{username}</b>
          <button onClick={logout} className="logout-btn">Logout</button>
        </p>

        <div className="messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.user === username ? "my-message" : "other-message"}`}
            >
              <b>{msg.user || "anon"}:</b> {msg.text}
              {msg.user === username && (
                <div className="actions">
                  <button onClick={() => { setEditId(msg.id); setNewMsg(msg.text); }}>Edit</button>
                  <button onClick={() => deleteMessage(msg.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="message-form">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder={editId ? "Edit message..." : "Type a message..."}
          />
          <button type="submit">{editId ? "Update" : "Send"}</button>
        </form>
      </div>
    </div>
  );
}

export default App;
