import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Dashboard Data
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState({ visits: 0, messages: 0 });
  
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [activeTab, setActiveTab] = useState('projects');

  // Validate password against the server BEFORE granting access
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_URL}/api/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${password}` }
      });

      if (res.status === 403) {
        setLoginError('ACCESS DENIED: Invalid admin key.');
        setLoginLoading(false);
        return;
      }

      // Password is correct — load all data
      const data = await res.json();
      if (!data.error) setAnalytics(data);
      setIsAuthenticated(true);
      fetchProjects();
      fetchMessages();
    } catch (err) {
      setLoginError('CONNECTION ERROR: Cannot reach backend server.');
    }
    setLoginLoading(false);
  };

  const showStatus = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // --- Fetchers ---
  const fetchProjects = () => {
    fetch(`${API_URL}/api/projects`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setProjects(data); })
      .catch(err => console.error(err));
  };

  const fetchAnalytics = () => {
    fetch(`${API_URL}/api/admin/analytics`, { headers: { 'Authorization': `Bearer ${password}` }})
      .then(res => { if(res.status === 403) { setIsAuthenticated(false); } return res.json(); })
      .then(data => { if (!data.error) setAnalytics(data); })
      .catch(err => console.error(err));
  };

  const fetchMessages = () => {
    fetch(`${API_URL}/api/admin/messages`, { headers: { 'Authorization': `Bearer ${password}` }})
      .then(res => { if(res.status === 403) setIsAuthenticated(false); return res.json(); })
      .then(data => { if (Array.isArray(data)) setMessages(data); })
      .catch(err => console.error(err));
  };

  // --- Project Handlers ---
  const handleUpdate = async (project) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` },
        body: JSON.stringify(project)
      });
      const data = await res.json();
      if (res.ok && data.success) showStatus('Project updated successfully!');
      else { showStatus(data.error || 'Failed to update.'); if (res.status === 403) setIsAuthenticated(false); }
    } catch (err) { showStatus('Error updating project.'); }
    setLoading(false);
  };

  const handleChange = (id, field, value) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` },
        body: JSON.stringify({ title: 'NEW PROJECT', description: 'Description here...', tech: 'React, Vite', color: '#00ffff' })
      });
      const data = await res.json();
      if (res.ok && data.success) { fetchProjects(); showStatus('Project created!'); }
      else { showStatus(data.error || 'Failed to create.'); if (res.status === 403) setIsAuthenticated(false); }
    } catch (err) { showStatus('Error creating project.'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${password}` }
      });
      const data = await res.json();
      if (res.ok && data.success) { setProjects(projects.filter(p => p.id !== id)); showStatus('Project deleted!'); }
      else { showStatus(data.error || 'Failed to delete.'); if (res.status === 403) setIsAuthenticated(false); }
    } catch (err) { showStatus('Error deleting project.'); }
    setLoading(false);
  };

  // --- Auth Render ---
  if (!isAuthenticated) {
    return (
      <section className="min-h-screen flex items-center justify-center relative px-6 z-10">
        <form onSubmit={handleLogin} className="glass-panel p-8 max-w-md w-full border border-[#00ffff]/50">
          <h2 className="text-2xl font-orbitron text-[#00ffff] mb-2 text-center">SYSTEM OVERRIDE</h2>
          <p className="text-gray-600 font-mono text-xs text-center mb-6 tracking-widest">ADMIN ACCESS REQUIRED</p>
          
          <input 
            type="password" 
            placeholder="Enter Admin Key..." 
            value={password}
            onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
            className={`w-full bg-[#020202] border p-3 text-white focus:outline-none transition-colors font-mono text-sm mb-3 ${
              loginError ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-[#00ffff]'
            }`}
          />

          {/* Error message */}
          {loginError && (
            <p className="text-red-500 font-mono text-xs mb-4 tracking-wide border border-red-500/30 bg-red-500/10 p-2">
              ⛔ {loginError}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loginLoading}
            className="w-full py-3 bg-[#00ffff]/20 border border-[#00ffff] text-white hover:bg-[#00ffff] hover:text-black font-orbitron font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginLoading ? 'VERIFYING...' : 'AUTHORIZE'}
          </button>
        </form>
      </section>
    );
  }

  // --- Main Dashboard Render ---
  return (
    <section className="py-32 pt-40 relative px-6 md:px-12 z-10 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-orbitron font-bold text-white tracking-wider">
            <span className="text-[#00ffff]">CMS</span> DASHBOARD
          </h2>
          <p className="text-[#00ffff] font-mono">{statusMsg}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-10 border-b border-gray-800 pb-2">
          {['projects', 'enquiries', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); fetchAnalytics(); fetchMessages(); }}
              className={`font-orbitron font-bold tracking-widest px-6 py-2 transition-all ${
                activeTab === tab 
                  ? 'bg-[#00ffff]/20 text-[#00ffff] border-b-2 border-[#00ffff]' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-end mb-6">
              <button onClick={handleAdd} disabled={loading} className="px-4 py-2 bg-[#00ffff]/20 border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black font-orbitron font-bold text-sm transition-colors cursor-pointer">
                + ADD PROJECT
              </button>
            </div>
            <div className="flex flex-col gap-8">
              {projects.map((project) => (
                <div key={project.id} className="glass-panel p-6 border border-[#8a2be2]/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-500 font-mono block mb-1">TITLE</label>
                      <input className="w-full bg-[#020202] border border-gray-700 p-2 text-white font-rajdhani text-lg" value={project.title} onChange={(e) => handleChange(project.id, 'title', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-mono block mb-1">COLOR (HEX)</label>
                      <input className="w-full bg-[#020202] border border-gray-700 p-2 text-white font-mono text-sm" value={project.color} onChange={(e) => handleChange(project.id, 'color', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 font-mono block mb-1">DESCRIPTION</label>
                      <textarea className="w-full bg-[#020202] border border-gray-700 p-2 text-white font-rajdhani text-md" rows="2" value={project.description} onChange={(e) => handleChange(project.id, 'description', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-mono block mb-1">TECH (Comma Separated)</label>
                      <input className="w-full bg-[#020202] border border-gray-700 p-2 text-white font-mono text-sm" value={Array.isArray(project.tech) ? project.tech.join(',') : project.tech} onChange={(e) => handleChange(project.id, 'tech', e.target.value.split(','))} />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 font-mono block mb-1">LIVE LINK</label>
                        <input className="w-full bg-[#020202] border border-gray-700 p-2 text-white font-mono text-sm" value={project.link || ''} onChange={(e) => handleChange(project.id, 'link', e.target.value)} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 font-mono block mb-1">GITHUB LINK</label>
                        <input className="w-full bg-[#020202] border border-gray-700 p-2 text-white font-mono text-sm" value={project.github || ''} onChange={(e) => handleChange(project.id, 'github', e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button onClick={() => handleDelete(project.id)} disabled={loading} className="px-6 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 font-orbitron text-sm transition-colors cursor-pointer">DELETE</button>
                    <button onClick={() => handleUpdate(project)} disabled={loading} className="px-6 py-2 bg-[#8a2be2]/20 border border-[#8a2be2] text-white hover:bg-[#8a2be2] font-orbitron text-sm transition-colors cursor-pointer">SAVE CHANGES</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ENQUIRIES TAB */}
        {activeTab === 'enquiries' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 gap-6">
              {messages.length === 0 ? (
                <p className="text-gray-500 font-mono text-center py-10">NO TRANSMISSIONS RECEIVED YET.</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="glass-panel p-6 border-l-4 border-l-[#ff00ff]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-[#00ffff] font-orbitron font-bold text-xl">{msg.name}</h4>
                        <a href={`mailto:${msg.email}`} className="text-gray-400 font-mono text-sm hover:text-[#ff00ff] transition-colors">{msg.email}</a>
                      </div>
                      <span className="text-gray-600 font-mono text-xs">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <div className="bg-[#020202] p-4 border border-gray-800 rounded-sm">
                      <p className="text-gray-300 font-rajdhani text-lg whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-10 flex flex-col items-center justify-center border border-[#00ffff]/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#00ffff]/5 blur-3xl rounded-full group-hover:bg-[#00ffff]/10 transition-colors"></div>
              <h3 className="text-gray-500 font-orbitron tracking-widest mb-4 z-10">TOTAL SITE VISITS</h3>
              <p className="text-7xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-br from-[#00ffff] to-[#8a2be2] z-10 text-glow">
                {analytics.visits}
              </p>
            </div>
            
            <div className="glass-panel p-10 flex flex-col items-center justify-center border border-[#ff00ff]/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#ff00ff]/5 blur-3xl rounded-full group-hover:bg-[#ff00ff]/10 transition-colors"></div>
              <h3 className="text-gray-500 font-orbitron tracking-widest mb-4 z-10">TOTAL ENQUIRIES</h3>
              <p className="text-7xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-br from-[#ff00ff] to-[#8a2be2] z-10 drop-shadow-[0_0_15px_rgba(255,0,255,0.5)]">
                {analytics.messages}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
