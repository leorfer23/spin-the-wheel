// Widget API Routes (for development)
// In production, these would be Supabase Edge Functions or similar

import { widgetService } from '@/services/widgetService';
import type { Request, Response } from 'express';

// This file demonstrates the API structure
// In development, we'll use Vite's proxy feature to handle these routes

export const widgetAPI = {
  // GET /api/widget/wheel/:wheelId
  async getWheelConfig(req: Request, res: Response) {
    const { wheelId } = req.params;
    
    try {
      const result = await widgetService.getWheelConfig(wheelId);
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cache-Control', 'public, max-age=300'); // Cache 5 mins
      
      if (result.success) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // GET /api/widget/store/:storeId/default-wheel
  async getDefaultWheel(req: Request, res: Response) {
    const { storeId } = req.params;
    
    try {
      const result = await widgetService.getDefaultWheelForStore(storeId);
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cache-Control', 'public, max-age=300');
      
      if (result.success) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // POST /api/widget/spin
  async recordSpin(req: Request, res: Response) {
    try {
      await widgetService.recordSpin(req.body);
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to record spin' });
    }
  },

  // POST /api/widget/prize-accepted
  async recordPrizeAcceptance(req: Request, res: Response) {
    try {
      await widgetService.recordPrizeAcceptance(req.body);
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to record prize acceptance' });
    }
  },

  // OPTIONS handler for CORS preflight
  async handleOptions(_req: Request, res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.status(204).send();
  }
};