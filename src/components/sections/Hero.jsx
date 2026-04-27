import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center relative px-6 md:px-12 pt-20"
    >
      <div className="max-w-5xl mx-auto w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="font-rajdhani text-[#00ffff] font-semibold tracking-widest text-lg md:text-xl mb-4 uppercase">
            Welcome to VC Dhyan personal portfolio
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glitch-wrapper mb-4"
        >
          <h1 
            className="glitch text-5xl md:text-7xl lg:text-8xl font-black font-orbitron tracking-tighter" 
            data-text="VC DHYAN"
          >
            VC DHYAN
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-3xl md:text-5xl font-orbitron font-bold text-gray-400 mb-8 text-glow">
            I build digital <span className="text-[#ff00ff]">experiences.</span>
          </h3>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-2xl text-gray-400 font-rajdhani text-lg md:text-xl leading-relaxed mb-10"
        >
          A creative developer specializing in building exceptional, high-performance websites, 
          applications, and interactive 3D experiences. Blending the line between anime aesthetics and modern web technology.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-wrap gap-4"
        >
          <Link to="/projects" className="relative group inline-block">
            <div className="absolute inset-0 bg-[#8a2be2] blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
            <button className="relative px-8 py-3 bg-[#050505] border border-[#8a2be2] text-white font-orbitron font-bold tracking-widest hover:bg-[#8a2be2] transition-colors duration-300 cursor-pointer">
              VIEW ARMORY
            </button>
          </Link>
          
          <Link to="/contact" className="relative group inline-block">
            <button className="relative px-8 py-3 bg-transparent border border-gray-600 text-gray-300 font-orbitron font-bold tracking-widest hover:border-[#00ffff] hover:text-[#00ffff] transition-colors duration-300 box-glow-hover cursor-pointer">
              PING ME
            </button>
          </Link>
        </motion.div>
      </div>

    </motion.section>
  );
}
