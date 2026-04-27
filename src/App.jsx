import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import Scene from './components/canvas/Scene';
import Navbar from './components/ui/Navbar';
import Hero from './components/sections/Hero';
import Projects from './components/sections/Projects';
import Contact from './components/sections/Contact';
import AdminDashboard from './components/admin/AdminDashboard';
import ChatBot from './components/ui/ChatBot';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AnimatedRoutes() {
  const location = useLocation();
  
  useEffect(() => {
    // Record visit only ONCE per browser session (not on every navigation)
    if (location.pathname === '/' && !sessionStorage.getItem('visit_recorded')) {
      fetch(`${API_URL}/api/visits`, { method: 'POST' }).catch(() => {});
      sessionStorage.setItem('visit_recorded', 'true');
    }
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Hero />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* 404 catch-all — redirect to hero */}
        <Route path="*" element={<Hero />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="relative w-full h-screen overflow-x-hidden bg-[#020202]">
        {/* 3D Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </div>

        {/* UI Overlay */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
        </div>
        <ChatBot />
      </div>
    </BrowserRouter>
  );
}

export default App;
