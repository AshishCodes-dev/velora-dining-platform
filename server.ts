import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { db } from './backend/config/db.ts';
import { apiRouter } from './backend/routes/apiRoutes.ts';
import { apiRateLimiter, authRateLimiter } from './backend/utils/security.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

export function createExpressApp() {
  const app = express();

  // Trust proxy: required for rate limiters, secure headers behind Render / reverse proxy
  app.set('trust proxy', 1);

  // Helmet: Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Vite SPA handles inline styles & script chunks
      crossOriginEmbedderPolicy: false,
    })
  );

  // Compression for text/json responses
  app.use(compression());

  // CORS: Explicit allow-list from CLIENT_URL, never default to '*' in production
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';
  const clientUrlEnv = process.env.CLIENT_URL?.trim();
  const allowedOrigins = clientUrlEnv
    ? clientUrlEnv.split(',').map((u) => u.trim().replace(/\/$/, '')).filter(Boolean)
    : [];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, supertest)
        if (!origin || isTest) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, '');

        if (!isProd) {
          // In development, allow localhost ports and matching CLIENT_URL
          if (
            normalizedOrigin.startsWith('http://localhost') ||
            normalizedOrigin.startsWith('http://127.0.0.1') ||
            allowedOrigins.includes(normalizedOrigin)
          ) {
            return callback(null, true);
          }
        }

        if (allowedOrigins.length > 0 && allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }

        if (isProd && allowedOrigins.length === 0) {
          // If in production and CLIENT_URL not set, allow same-origin only
          return callback(new Error('CORS blocked: CLIENT_URL is not configured for cross-origin access.'));
        }

        return callback(new Error(`CORS blocked: origin ${origin} is not allowed.`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
    })
  );

  app.use(express.json({ limit: '10mb' }));

  // Strict rate limiters on sensitive authentication endpoints (bypassed in test)
  if (!isTest) {
    app.use('/api/auth/login', authRateLimiter);
    app.use('/api/auth/register', authRateLimiter);
    app.use('/api/auth/forgot-password', authRateLimiter);
  }

  // Health check endpoint (for Render / load balancers)
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'VELORA Restaurant API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      dbConnected: db.isConnected(),
    });
  });

  // General API routes with rate limiter
  if (isTest) {
    app.use('/api', apiRouter);
  } else {
    app.use('/api', apiRateLimiter, apiRouter);
  }

  // API 404 Handler (API routes must never fall through to SPA HTML)
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Static images directory
  app.use(
    '/images',
    express.static(path.join(__dirname, 'public/images'))
  );

  // Centralized Express Error Handler (never leaks stack traces in production)
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[VELORA Server Error]:', err.message);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while processing your request.',
      error: isProd
        ? 'Internal server error.'
        : err.message || 'An unexpected server error occurred.',
    });
  });

  return app;
}

export async function startServer() {
  await db.connectMongo();

  const app = createExpressApp();
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    // SPA fallback excluding /api/*
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app.listen(PORT, '0.0.0.0', () => {
    console.log(`VELORA server listening on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
