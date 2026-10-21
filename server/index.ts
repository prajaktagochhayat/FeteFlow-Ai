import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import { storageService } from './services/storageService.js';
import { aiService } from './services/aiProvider.js';
import {
  EventWizardInputSchema,
  EventPlanSchema,
} from './schemas/eventPlanSchema.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Load persisted settings and configure AI provider on boot
const initialSettings = storageService.getSettings();
if (initialSettings.geminiApiKey) {
  aiService.refreshConfig(initialSettings.geminiApiKey, initialSettings.geminiModel);
}

// Security: limit body size and enable CORS
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Request logging middleware (excluding credentials)
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// --- API ROUTES ---

// Health & AI status
app.get('/api/health', (_req: Request, res: Response) => {
  const aiStatus = aiService.getStatus();
  res.json({
    status: 'ok',
    service: 'FêteFlow AI Core API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    ai: aiStatus,
  });
});

// Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  const settings = storageService.getSettings();
  const effectiveKey = settings.geminiApiKey || process.env.GEMINI_API_KEY || '';
  const maskedKey = effectiveKey
    ? `${effectiveKey.slice(0, 4)}...${effectiveKey.slice(-4)}`
    : '';
  const aiStatus = aiService.getStatus();
  res.json({
    ...settings,
    geminiApiKey: maskedKey,
    hasApiKey: aiStatus.isConfigured,
    aiStatus,
  });
});

app.post('/api/settings', (req: Request, res: Response) => {
  try {
    const { geminiApiKey, geminiModel, defaultCurrency, theme, reducedMotion } = req.body;
    const current = storageService.getSettings();

    const updates: any = {};
    if (geminiModel !== undefined) updates.geminiModel = geminiModel;
    if (defaultCurrency !== undefined) updates.defaultCurrency = defaultCurrency;
    if (theme !== undefined) updates.theme = theme;
    if (reducedMotion !== undefined) updates.reducedMotion = reducedMotion;

    // Only update key if explicitly sent and not the masked placeholder
    if (geminiApiKey !== undefined && !geminiApiKey.includes('...')) {
      updates.geminiApiKey = geminiApiKey.trim();
      aiService.refreshConfig(updates.geminiApiKey, updates.geminiModel || current.geminiModel);
    } else if (updates.geminiModel) {
      aiService.refreshConfig(current.geminiApiKey || process.env.GEMINI_API_KEY, updates.geminiModel);
    }

    const saved = storageService.updateSettings(updates);
    const effectiveKey = saved.geminiApiKey || process.env.GEMINI_API_KEY || '';
    const maskedKey = effectiveKey
      ? `${effectiveKey.slice(0, 4)}...${effectiveKey.slice(-4)}`
      : '';
    const aiStatus = aiService.getStatus();

    res.json({
      ...saved,
      geminiApiKey: maskedKey,
      hasApiKey: aiStatus.isConfigured,
      aiStatus,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

app.post('/api/settings/reset', (_req: Request, res: Response) => {
  storageService.resetToDefaults();
  res.json({ success: true, message: 'Reset to factory seed events and defaults' });
});

// Event CRUD
app.get('/api/events', (_req: Request, res: Response) => {
  const events = storageService.getAllEvents();
  res.json(events);
});

app.get('/api/events/:id', (req: Request, res: Response) => {
  const event = storageService.getEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

app.post('/api/events', (req: Request, res: Response) => {
  try {
    const parsed = EventPlanSchema.parse(req.body);
    const created = storageService.createEvent(parsed);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: 'Validation failed', details: err.errors || err.message });
  }
});

app.put('/api/events/:id', (req: Request, res: Response) => {
  try {
    const updated = storageService.updateEvent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update event', details: err.message });
  }
});

app.delete('/api/events/:id', (req: Request, res: Response) => {
  const success = storageService.deleteEvent(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json({ success: true, id: req.params.id });
});

// --- GENAI ENDPOINTS ---

// 1. Full Event Plan Generation from Wizard
app.post('/api/ai/generate-plan', async (req: Request, res: Response) => {
  try {
    const validation = EventWizardInputSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid event requirements provided',
        details: validation.error.format(),
      });
    }

    const { plan, provider } = await aiService.generateFullEventPlan(validation.data);
    res.json({ plan, provider });
  } catch (err: any) {
    console.error('Plan generation route error:', err);
    res.status(500).json({ error: 'Failed to generate event plan', details: err.message });
  }
});

// 2. Contextual AI Chat Assistant
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { eventId, message, history = [] } = req.body;
    if (!eventId || !message) {
      return res.status(400).json({ error: 'eventId and message are required' });
    }

    const event = storageService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const result = await aiService.chatWithPlanner(event, history, message);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Chat planner error', details: err.message });
  }
});

// 3. Budget Optimization
app.post('/api/ai/optimize-budget', async (req: Request, res: Response) => {
  try {
    const { eventId, instruction } = req.body;
    if (!eventId || !instruction) {
      return res.status(400).json({ error: 'eventId and instruction are required' });
    }

    const event = storageService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const result = await aiService.optimizeBudget(event, instruction);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Budget optimization error', details: err.message });
  }
});

// 4. Vendor Brief & RFC Generator
app.post('/api/ai/vendor-brief', async (req: Request, res: Response) => {
  try {
    const { eventId, category } = req.body;
    if (!eventId || !category) {
      return res.status(400).json({ error: 'eventId and category are required' });
    }

    const event = storageService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const result = await aiService.generateVendorBrief(event, category);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Vendor brief error', details: err.message });
  }
});

// 5. Timeline Recovery Assistant
app.post('/api/ai/timeline-recovery', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    const event = storageService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const overdue = event.timeline.filter(t => !t.completed && new Date(t.dueDate) < new Date());
    const result = await aiService.generateTimelineRecovery(event, overdue);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Timeline recovery error', details: err.message });
  }
});

// 6. Invitation Copy Generator
app.post('/api/ai/invitations', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    const event = storageService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const result = await aiService.generateInvitationCopy(event);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Invitation generator error', details: err.message });
  }
});

// 7. Executive Summary & Risk Overview
app.post('/api/ai/executive-summary', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    const event = storageService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const result = await aiService.generateExecutiveSummary(event);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Executive summary error', details: err.message });
  }
});

// Serve built frontend if in production
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
  });
});

app.listen(PORT, () => {
  console.log(`✨ FêteFlow AI Server is listening on http://localhost:${PORT}`);
  console.log(`🤖 AI Status: ${JSON.stringify(aiService.getStatus())}`);
});

export default app;
