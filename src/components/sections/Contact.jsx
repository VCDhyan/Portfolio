import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { SiLeetcode, SiHackerrank } from 'react-icons/si';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Contact() {
  const [formOpen, setFormOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
    const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const responseData = await res.json();
      
      if (res.ok && responseData.success) {
        setStatus('success');
        e.target.reset();
        setTimeout(() => {
          setFormOpen(false);
          setStatus('idle');
        }, 4000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="py-32 pt-40 relative px-6 md:px-12 z-10 min-h-[80vh] flex flex-col items-center justify-center"
    >
      <div className="max-w-3xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotateX: 15, rotateY: -10 }}
            style={{ perspective: 1000 }}
            className="mb-6 inline-block"
          >
            <p className="font-rajdhani text-[#ff00ff] font-semibold tracking-widest text-xl inline-block px-6 py-2 border border-[#ff00ff]/40 bg-[#ff00ff]/10 shadow-[0_0_15px_rgba(255,0,255,0.3)] cursor-crosshair transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,0,255,0.6)]">
              &gt; LET'S CONNECT_
            </p>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-orbitron font-black text-white mb-6 text-glow">
            ESTABLISH COMMS
          </h2>
          <p className="text-gray-400 font-rajdhani text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            My inbox is always open. Whether you have a question, a project proposal, 
            or just want to say hi, I'll try my best to get back to you!
          </p>

          <AnimatePresence mode="wait">
            {!formOpen ? (
              <motion.div
                key="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative group inline-block"
              >
                <div className="absolute inset-0 bg-[#00ffff] blur-md opacity-30 group-hover:opacity-70 transition-opacity duration-300"></div>
                <button 
                  onClick={() => setFormOpen(true)}
                  className="relative px-12 py-4 bg-[#050505] border-2 border-[#00ffff] text-[#00ffff] font-orbitron font-bold tracking-widest text-lg hover:bg-[#00ffff] hover:text-black transition-all duration-300 cursor-pointer"
                >
                  SEND TRANSMISSION
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-panel p-8 text-left relative max-w-xl mx-auto w-full border border-[#00ffff]/50 box-glow"
              >
                {status === 'success' ? (
                  <div className="text-center py-10">
                    <h3 className="text-2xl font-orbitron text-[#00ffff] mb-4 text-glow-secondary">TRANSMISSION SENT!</h3>
                    <p className="text-gray-300 font-rajdhani">I have received your message and will reply shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-orbitron text-white">NEW DIRECTIVE</h3>
                      <button 
                        type="button" 
                        onClick={() => setFormOpen(false)}
                        className="text-gray-400 hover:text-[#ff00ff] font-orbitron text-sm transition-colors"
                      >
                        [ ABORT ]
                      </button>
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-[#00ffff] font-rajdhani tracking-widest mb-2 text-sm">IDENTIFICATION</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        required 
                        className="w-full bg-[#020202] border border-gray-700 p-3 text-white focus:border-[#00ffff] focus:outline-none transition-colors font-mono text-sm"
                        placeholder="Enter your name..."
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-[#00ffff] font-rajdhani tracking-widest mb-2 text-sm">RETURN FREQUENCY (EMAIL)</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required 
                        className="w-full bg-[#020202] border border-gray-700 p-3 text-white focus:border-[#00ffff] focus:outline-none transition-colors font-mono text-sm"
                        placeholder="Enter your email..."
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-[#00ffff] font-rajdhani tracking-widest mb-2 text-sm">ENCRYPTED MESSAGE</label>
                      <textarea 
                        id="message" 
                        name="message" 
                        required 
                        rows="4"
                        className="w-full bg-[#020202] border border-gray-700 p-3 text-white focus:border-[#00ffff] focus:outline-none transition-colors font-mono text-sm resize-none"
                        placeholder="Type your message..."
                      ></textarea>
                    </div>

                    {status === 'error' && (
                      <p className="text-red-500 font-rajdhani text-sm">ERROR: Failed to establish secure connection or send email. Please try again later.</p>
                    )}

                    <button 
                      type="submit" 
                      disabled={status === 'submitting'}
                      className="mt-4 w-full py-4 bg-[#8a2be2]/20 border border-[#8a2be2] text-white hover:bg-[#8a2be2] font-orbitron font-bold tracking-widest transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {status === 'submitting' ? 'UPLOADING...' : 'EXECUTE'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-32"
        >
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {[
              { icon: FaGithub, link: 'https://github.com/VCDhyan', label: 'GitHub' },
              { icon: FaLinkedin, link: 'https://www.linkedin.com/in/vcdhyan/', label: 'LinkedIn' },
              { icon: SiLeetcode, link: 'https://leetcode.com/u/VCDhyan/', label: 'LeetCode' },
              { icon: SiHackerrank, link: 'https://www.hackerrank.com/profile/VCDhyan', label: 'HackerRank' }
            ].map((social, idx) => {
              const Icon = social.icon;
              return (
                <a 
                  key={idx} 
                  href={social.link} 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-[#00ffff] border border-[#00ffff]/50 bg-[#00ffff]/10 hover:bg-[#00ffff]/30 shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all p-3 rounded-sm group flex items-center justify-center cursor-pointer"
                >
                  <Icon size={28} className="group-hover:scale-110 transition-transform" />
                </a>
              );
            })}
          </div>
          <p className="font-rajdhani text-gray-600 text-sm tracking-widest">
            DESIGNED & BUILT BY VC DHYAN © {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
