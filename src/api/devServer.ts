// Development server middleware for widget API
import type { Plugin } from 'vite';
import { widgetService } from '../services/widgetService';

export function widgetAPIPlugin(): Plugin {
  return {
    name: 'widget-api',
    configureServer(server) {
      // GET /api/widget/wheel/:wheelId
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/widget/wheel/') && req.method === 'GET') {
          const wheelId = req.url.split('/').pop() || '';
          const result = await widgetService.getWheelConfig(wheelId);
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.setHeader('Cache-Control', 'public, max-age=300');
          
          if (result.success) {
            res.statusCode = 200;
            res.end(JSON.stringify(result.data));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: result.error }));
          }
          return;
        }
        
        // GET /api/widget/store/:storeId/active-wheel
        if (req.url?.match(/^\/api\/widget\/store\/[^\/]+\/active-wheel/) && req.method === 'GET') {
          const urlParts = req.url.split('?');
          const matches = urlParts[0].match(/\/api\/widget\/store\/([^\/]+)\/active-wheel/);
          const storeId = matches?.[1] || '';
          
          console.log('[Widget API] Fetching active wheel for store:', storeId);
          console.log('[Widget API] Request URL:', req.url);
          
          // Extract context from query params or headers
          const context = {
            url: req.headers.referer || '',
            userAgent: req.headers['user-agent'] || '',
            timestamp: new Date().toISOString()
          };
          
          const result = await widgetService.getActiveWheelForStore(storeId, context);
          
          console.log('[Widget API] Result:', { success: result.success, error: result.error });
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Store-ID');
          res.setHeader('Cache-Control', 'public, max-age=300');
          
          if (result.success) {
            res.statusCode = 200;
            res.end(JSON.stringify(result.data));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: result.error }));
          }
          return;
        }
        
        // POST /api/widget/spin
        if (req.url === '/api/widget/spin' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              await widgetService.recordSpin(data);
              
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to record spin' }));
            }
          });
          return;
        }
        
        // POST /api/widget/prize-accepted
        if (req.url === '/api/widget/prize-accepted' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              await widgetService.recordPrizeAcceptance(data);
              
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to record prize acceptance' }));
            }
          });
          return;
        }
        
        // OPTIONS handler for CORS preflight
        if (req.url?.startsWith('/api/widget/') && req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.setHeader('Access-Control-Max-Age', '86400');
          res.statusCode = 204;
          res.end();
          return;
        }
        
        next();
      });
    }
  };
}