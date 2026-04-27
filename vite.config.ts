import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';


export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        configureServer: (server) => {
          let currentSessionFile = 'performance.jsonl';
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/log' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const logDir = path.resolve(__dirname, 'logs');
                  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
                  
                  const entry = JSON.parse(body);
                  
                  // Rotate file on session start
                  if (entry.type === 'session_started') {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    currentSessionFile = `session-${timestamp}.jsonl`;
                  }
                  
                  const logFile = path.resolve(logDir, currentSessionFile);
                  // Append as JSONL (one object per line)
                  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
                  
                  res.statusCode = 200;
                  res.end('OK');
                } catch (e) {
                  res.statusCode = 500;
                  res.end('Error parsing log');
                }
              });
            } else {
              next();
            }
          });
        }
      },
      plugins: [],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
