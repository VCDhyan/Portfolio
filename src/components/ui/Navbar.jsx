import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Terminal } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  let navLinks = [];
  if (location.pathname === '/projects') {
    navLinks = [
      { name: 'SYSTEM_INIT', href: '/' },
      { name: 'PING_ME', href: '/contact' }
    ];
  } else if (location.pathname === '/contact' || location.pathname.startsWith('/admin')) {
    navLinks = [
      { name: 'SYSTEM_INIT', href: '/' },
      { name: 'ARMORY', href: '/projects' }
    ];
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-panel py-3' : 'py-6'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <Terminal className="text-[#00ffff] group-hover:text-[#ff00ff] transition-colors duration-300" size={28} />
          <span className="font-orbitron font-bold text-xl tracking-wider text-white text-glow">
            DHYAN<span className="text-[#00ffff]">.</span>DEV
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => {
            const isActive = location.pathname === link.href;
            return (
              <Link key={link.name} to={link.href}>
                <motion.div
                  whileHover={{ scale: 1.05, textShadow: '0 0 8px rgba(138,43,226,0.8)' }}
                  className={`px-4 py-2 border font-rajdhani font-semibold text-white tracking-widest text-sm transition-all box-glow cursor-pointer ${
                    isActive 
                      ? 'border-[#8a2be2] bg-[#8a2be2]/30 shadow-[0_0_10px_rgba(138,43,226,0.5)]' 
                      : 'border-[#8a2be2]/40 bg-[#8a2be2]/10 hover:bg-[#8a2be2]/20 hover:border-[#8a2be2]'
                  }`}
                >
                  <span className="text-[#00ffff] mr-1">0{i + 1}.</span> {link.name}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white focus:outline-none">
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-[#8a2be2]/30 mt-3 overflow-hidden"
          >
            <div className="flex flex-col items-center py-6 gap-6">
              {navLinks.map((link, i) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-rajdhani font-bold text-xl text-gray-300 tracking-widest hover:text-white"
                >
                  <span className="text-[#8a2be2] mr-2">0{i + 1}.</span> {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
