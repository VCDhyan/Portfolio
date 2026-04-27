import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'portfolio.db');
const IS_DEV = process.env.NODE_ENV !== 'production';

// Initialize database — verbose SQL logging only in development
const db = new Database(dbPath, IS_DEV ? { verbose: console.log } : {});

// Enable WAL mode for massive concurrency and performance
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech TEXT NOT NULL,
    link TEXT,
    github TEXT,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert initial projects if the table is empty
const stmt = db.prepare('SELECT count(*) as count FROM projects');
const result = stmt.get();

if (result.count === 0) {
  const insert = db.prepare('INSERT INTO projects (title, description, tech, link, github, color) VALUES (@title, @description, @tech, @link, @github, @color)');
  
  const initialProjects = [
    { title: 'NEON GENESIS E-COMMERCE', description: 'A highly interactive, 3D-integrated e-commerce platform built for a streetwear brand.', tech: 'React,Three.js,Node.js', link: '#', github: '#', color: '#00ffff' },
    { title: 'CYBER-DASHBOARD', description: 'A data visualization dashboard with a futuristic aesthetic.', tech: 'Vue.js,D3.js,Firebase', link: '#', github: '#', color: '#ff00ff' },
    { title: 'AKIRA CHAT APP', description: 'End-to-end encrypted messaging application with a dystopian UI design.', tech: 'React Native,Socket.io,MongoDB', link: '#', github: '#', color: '#8a2be2' },
    { title: 'MECHA PORTFOLIO V1', description: 'My previous portfolio iteration focused heavily on complex WebGL shaders.', tech: 'Three.js,GLSL,Vite', link: '#', github: '#', color: '#00ffff' }
  ];

  const insertMany = db.transaction((projects) => {
    for (const project of projects) insert.run(project);
  });

  insertMany(initialProjects);
}

export default db;
