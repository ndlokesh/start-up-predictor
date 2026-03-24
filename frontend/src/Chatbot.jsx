import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Welcome! I am your AI VC Consultant. How can I assist you with funding rounds or strategy in India?", sender: 'bot' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
    } catch {
      setMessages(prev => [...prev, { text: "Network error. Server offline.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full text-white shadow-neon flex items-center justify-center hover:scale-110 transition-transform ${isOpen ? 'hidden' : 'block'} z-50`}
      >
        <MessageSquare size={24} fill="currentColor" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 bg-white shadow-2xl rounded-2xl border border-slate-200 z-50 overflow-hidden flex flex-col"
            style={{ height: '420px' }}
          >
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-cyan-400" />
                <span className="font-bold text-sm tracking-wide">AI Consultant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition"><X size={18}/></button>
            </div>

            <div ref={chatRef} className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2.5 max-w-[85%] rounded-2xl text-xs font-semibold leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-sm shadow-sm' : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-sm flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s'}} />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s'}} />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Series funding..."
                className="flex-1 bg-slate-100 text-xs px-3 py-2.5 rounded-lg font-medium text-slate-800 outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button type="submit" disabled={isTyping || !input.trim()} className="bg-slate-900 text-white w-9 h-9 rounded-lg flex justify-center items-center disabled:opacity-50 transition">
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
