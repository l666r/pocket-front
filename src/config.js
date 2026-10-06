// PocketRoute API Base Configuration
// Automatically connects to localhost:5000 during local development, or Render backend in production
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5000' : 'https://pocket-back-1.onrender.com');
