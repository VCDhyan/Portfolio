import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Code, Folder } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Projects() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/projects`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
          console.error("API returned non-array:", data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load projects:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <motion.section className="py-32 pt-40 relative px-6 md:px-12 z-10 min-h-screen flex items-center justify-center">
        <h2 className="font-orbitron text-2xl text-[#00ffff] animate-pulse">LOADING ARMORY...</h2>
      </motion.section>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="py-32 pt-40 relative px-6 md:px-12 z-10"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white tracking-wider">
            <span className="text-[#8a2be2]">02.</span> ARMORY
          </h2>
          <div className="h-px bg-gray-700 flex-grow ml-4 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#00ffff] rotate-45"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, i) => {
            // Define wildly unique animations per card to make it standout
            let hoverAnim = {};
            if (i === 0) {
              hoverAnim = { 
                scale: 1.05, 
                x: [0, -3, 3, -3, 3, 0], 
                transition: { x: { repeat: Infinity, duration: 0.2 } },
                boxShadow: `0 0 20px ${project.color}40`,
                borderColor: project.color
              }; // Glitch
            } else if (i === 1) {
              hoverAnim = { 
                scale: 1.1, 
                rotateY: 10, 
                rotateX: 5,
                boxShadow: `0 0 30px ${project.color}60`,
                borderColor: project.color
              }; // 3D Tilt
            } else if (i === 2) {
              hoverAnim = { 
                scale: 1.05, 
                y: -15, 
                boxShadow: `0 25px 30px ${project.color}50`,
                borderColor: project.color
              }; // Anti-gravity Elevate
            } else {
              hoverAnim = { 
                scale: 1.02, 
                backgroundColor: `${project.color}33`,
                boxShadow: `0 0 15px ${project.color}80`,
                borderColor: project.color,
                transition: { backgroundColor: { repeat: Infinity, repeatType: 'reverse', duration: 0.5 } }
              }; // Neon Pulse
            }

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={hoverAnim}
                onHoverStart={() => setHoveredIndex(i)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={() => {
                  const url = project.github || project.link;
                  if (url && url !== '#') window.open(url, '_blank');
                }}
                className="glass-panel p-8 relative overflow-hidden group rounded-sm border-[rgba(138,43,226,0.2)] cursor-pointer"
              >
                {/* Background gradient on hover */}
                <AnimatePresence>
                  {hoveredIndex === i && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-0 pointer-events-none"
                      style={{ backgroundColor: project.color }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <Folder size={40} style={{ color: project.color }} className="drop-shadow-[0_0_8px_currentColor]" />
                    <div className="flex gap-4">
                      {project.github && project.github !== '#' && (
                        <a href={project.github} onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-white transition-colors cursor-pointer" target="_blank" rel="noopener noreferrer">
                          <Code size={22} />
                        </a>
                      )}
                      {project.link && project.link !== '#' && (
                        <a href={project.link} onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-white transition-colors cursor-pointer" target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={22} />
                        </a>
                      )}
                    </div>
                  </div>

                  <h3 className="text-2xl font-orbitron font-bold text-gray-200 mb-3 group-hover:text-white transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-400 font-rajdhani text-lg mb-6 flex-grow leading-relaxed">
                    {project.description}
                  </p>

                  <ul className="flex flex-wrap gap-4 font-mono text-sm text-gray-500">
                    {(Array.isArray(project.tech) ? project.tech : (typeof project.tech === 'string' ? project.tech.split(',') : [])).map((tech, j) => (
                      <li key={j} style={{ color: hoveredIndex === i ? project.color : '' }} className="transition-colors">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
