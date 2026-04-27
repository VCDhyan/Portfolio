import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Cpu } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "SYSTEM ONLINE. I am DEV VERSE, Dhyan's personal portfolio assistant. Ask me about the portfolio, my creator, or request analytics for any project." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    // Gemini API requires chat history to always start with a user message, so we omit the initial AI greeting.
    const chatHistory = messages.slice(1);
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, history: chatHistory })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "CRITICAL ERROR: Neural link severed." }]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="glass-panel w-80 sm:w-96 h-[500px] mb-4 border border-[#00ffff]/30 flex flex-col overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.15)]"
          >
            {/* Header */}
            <div className="bg-[#020202] border-b border-[#00ffff]/30 p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2 text-[#00ffff]">
                  <Cpu size={20} className="animate-pulse" />
                  <span className="font-orbitron font-bold tracking-wider">DEV VERSE</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <span className="text-gray-500 font-mono text-[10px] mt-1 tracking-widest uppercase">Dhyan's Personal Portfolio Assistant</span>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-mono text-sm scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
                >
                  <span className={`text-[10px] mb-1 ${msg.role === 'user' ? 'text-[#ff00ff] self-end' : 'text-[#00ffff] self-start'}`}>
                    {msg.role === 'user' ? 'GUEST' : 'DEV VERSE'}
                  </span>
                  <div 
                    className={`p-3 rounded-sm ${
                      msg.role === 'user' 
                        ? 'bg-[#ff00ff]/10 border border-[#ff00ff]/30 text-white' 
                        : 'bg-[#00ffff]/10 border border-[#00ffff]/30 text-gray-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start flex flex-col max-w-[85%]">
                  <span className="text-[10px] mb-1 text-[#00ffff]">DEV VERSE</span>
                  <div className="p-3 bg-[#00ffff]/10 border border-[#00ffff]/30 rounded-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00ffff] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#00ffff] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-[#00ffff] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-[#020202] border-t border-[#00ffff]/30 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Initialize query..."
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-gray-600 px-2"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="p-2 bg-[#00ffff]/20 text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-colors rounded-sm disabled:opacity-50 cursor-pointer"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#00ffff]/20 border-2 border-[#00ffff] rounded-full flex items-center justify-center text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] cursor-pointer"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}
