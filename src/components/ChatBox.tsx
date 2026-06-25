"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col h-[550px] bg-[#090909] rounded-[32px] border border-[#242424] overflow-hidden shadow-2xl">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#090909]/50">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex items-end gap-3", msg.sender === 'Admin' ? 'flex-row-reverse' : 'flex-row')}>
            <div className="w-8 h-8 rounded-xl bg-[#121212] border border-[#242424] flex items-center justify-center shrink-0">
                <User size={14} className={msg.sender === 'Admin' ? 'text-[#FF2D2D]' : 'text-blue-400'} />
            </div>
            <div className={cn(
              "max-w-[75%] p-4 rounded-2xl text-sm font-medium shadow-lg leading-relaxed",
              msg.sender === 'Admin'
                ? 'bg-[#FF2D2D] text-white rounded-br-none'
                : 'bg-[#121212] text-slate-300 border border-[#242424] rounded-bl-none'
            )}>
              {msg.text}
              <div className={cn(
                "text-[9px] mt-2 font-black uppercase tracking-widest opacity-60",
                msg.sender === 'Admin' ? 'text-white' : 'text-slate-500'
              )}>
                 {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={handleSend} className="p-6 bg-[#121212] border-t border-[#242424] flex gap-3">
        <input
          type="text"
          className="flex-1 px-5 py-4 bg-[#090909] border border-[#242424] text-white rounded-2xl outline-none focus:border-[#FF2D2D] text-sm font-bold transition-all placeholder:text-slate-800"
          placeholder="Construct terminal response..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="p-4 premium-gradient text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-900/20">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
