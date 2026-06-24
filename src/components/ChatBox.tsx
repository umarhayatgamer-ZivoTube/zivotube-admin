"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Timestamp;
}

export const ChatBox = ({ ticketId }: { ticketId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ticketId) return;
    const q = query(
      collection(db, "support_tickets", ticketId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });
    return () => unsubscribe();
  }, [ticketId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "support_tickets", ticketId, "messages"), {
      text: newMessage,
      sender: 'Admin',
      timestamp: serverTimestamp()
    });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-slate-50 rounded-2xl border border-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-2xl text-sm font-medium ${
              msg.sender === 'Admin' ? 'bg-red-500 text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none'
            }`}>
              {msg.text}
              <div className={`text-[9px] mt-1 opacity-70 ${msg.sender === 'Admin' ? 'text-white' : 'text-gray-400'}`}>
                 {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          className="flex-1 p-2.5 bg-gray-50 rounded-xl outline-none focus:ring-1 focus:ring-red-500 text-sm"
          placeholder="Type your reply..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
