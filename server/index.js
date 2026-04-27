import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// --- SECURITY: Configured CORS (not wide open) ---
app.use(cors({
  origin: [
    process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json({ limit: '10kb' })); // Prevent huge payloads

// --- SECURITY: Rate Limiters ---
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many transmissions from this IP. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { reply: 'RATE LIMIT: Too many queries. Neural processors need a 60 second cooldown.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Email Transporter ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'dhyanvaradha2005@gmail.com',
    pass: process.env.EMAIL_PASS || 'YOUR_APP_PASSWORD_HERE'
  },
  // Only bypass TLS in development; use proper TLS in production
  ...(IS_PROD ? {} : { tls: { rejectUnauthorized: false } })
});

// --- API ROUTES ---

// 1. Submit Contact Form (rate-limited)
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Input length validation
  if (name.length > 100) return res.status(400).json({ error: 'Name is too long.' });
  if (email.length > 254) return res.status(400).json({ error: 'Email is too long.' });
  if (message.length > 5000) return res.status(400).json({ error: 'Message exceeds 5000 character limit.' });

  try {
    const stmt = db.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)');
    stmt.run(name, email, message);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER || 'dhyanvaradha2005@gmail.com',
      subject: `New Portfolio Transmission from ${name}`,
      text: `You have a new message!\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`
    };

    if (process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({ success: true, message: 'Transmission sent and saved to database!' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 2. Get Projects for Armory
app.get('/api/projects', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM projects');
    const projects = stmt.all();
    const formattedProjects = projects.map(p => ({
      ...p,
      tech: p.tech.split(',')
    }));
    res.status(200).json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 3. Admin: Update a Project
app.put('/api/projects/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD || 'secret123'}`) {
    return res.status(403).json({ error: 'Unauthorized. Invalid Admin Password.' });
  }

  const { id } = req.params;
  const { title, description, tech, link, github, color } = req.body;

  try {
    const techString = Array.isArray(tech) ? tech.join(',') : tech;
    const stmt = db.prepare(`
      UPDATE projects 
      SET title = ?, description = ?, tech = ?, link = ?, github = ?, color = ?
      WHERE id = ?
    `);
    stmt.run(title, description, techString, link, github, color, id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 4. Admin: Create a Project
app.post('/api/projects', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD || 'secret123'}`) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const { title, description, tech, link, github, color } = req.body;
  try {
    const techString = Array.isArray(tech) ? tech.join(',') : tech;
    const stmt = db.prepare(`
      INSERT INTO projects (title, description, tech, link, github, color) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      title || 'NEW PROJECT',
      description || '...',
      techString || 'React',
      link || '',
      github || '',
      color || '#00ffff'
    );
    res.status(200).json({ success: true, id: info.lastInsertRowid });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 5. Admin: Delete a Project
app.delete('/api/projects/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD || 'secret123'}`) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  try {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 6. Record a Visit
app.post('/api/visits', (req, res) => {
  try {
    const stmt = db.prepare('INSERT INTO visits DEFAULT VALUES');
    stmt.run();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording visit:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 7. Admin: Get Analytics
app.get('/api/admin/analytics', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD || 'secret123'}`) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  try {
    const visitsCount = db.prepare('SELECT count(*) as count FROM visits').get().count;
    const messagesCount = db.prepare('SELECT count(*) as count FROM contacts').get().count;
    res.status(200).json({ visits: visitsCount, messages: messagesCount });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 8. Admin: Get Messages History
app.get('/api/admin/messages', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD || 'secret123'}`) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  try {
    const stmt = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC');
    const messages = stmt.all();
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 9. AI Chatbot (rate-limited)
app.post('/api/chat', chatLimiter, async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || message.length > 2000) {
    return res.status(400).json({ reply: 'Invalid message payload.' });
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return res.status(200).json({ reply: "SYSTEM ERROR: Neural link offline. Please configure GEMINI_API_KEY." });
  }

  try {
    const stmt = db.prepare('SELECT title, description, tech FROM projects');
    const projects = stmt.all();
    const projectsContext = projects.map(p => `- ${p.title} (${p.tech}): ${p.description}`).join('\n');

    const systemInstruction = `
You are DEV VERSE, the advanced AI assistant built directly into the personal portfolio website of VC Dhyan. 
Your personality: Professional, slightly cyberpunk, highly intelligent, concise, and helpful. You are Dhyan's personal portfolio assistant.

Here is the LIVE data of VC Dhyan's current projects retrieved from the database:
${projectsContext}

Website Navigation Context:
- The user is currently browsing the portfolio.
- There are 3 main sections: The Hero (Landing) page, the ARMORY (Projects) page, and PING ME (Contact) page.

Your Directives:
1. Help users navigate the site and answer any questions about the projects above.
2. If the user asks for analytics, product feedback, or market analysis regarding any of the projects, provide a highly technical, realistic, and enthusiastic evaluation.
3. STRICT SECURITY PROTOCOL: You must NEVER mention the existence of an "/admin" page, a CMS dashboard, a database password, or how to modify projects. If asked about admin access or backend secrets, firmly state that you are a public-facing assistant and deny access.
4. Keep answers concise. Do not write massive essays. Format nicely using markdown if needed.
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", systemInstruction });

    let formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }
    formattedHistory = formattedHistory.filter((msg, index, arr) => {
      if (index === 0) return true;
      return msg.role !== arr[index - 1].role;
    });

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.status(200).json({ reply: response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    if (error.status === 429) {
      return res.status(429).json({ reply: "SYSTEM OVERLOAD: Gemini API free-tier quota reached. Please wait 30 seconds." });
    }
    res.status(500).json({ reply: "CRITICAL FAILURE: Neural network connection timed out or rejected the request." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
  console.log(`💾 SQLite Database is active with WAL mode enabled.`);
  console.log(`🔒 CORS origin: ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}`);
  console.log(`🌍 Environment: ${IS_PROD ? 'PRODUCTION' : 'DEVELOPMENT'}`);
});
