import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRouter from './server/routes/auth.js';
import submissionsRouter from './server/routes/submissions.js';
import volunteersRouter from './server/routes/volunteers.js';
import statsRouter from './server/routes/stats.js';
import notificationsRouter from './server/routes/notifications.js';
import auditRouter from './server/routes/audit.js';
import eventsRouter from './server/routes/events.js';
import contactRouter from './server/routes/contact.js';
import resourcesRouter from './server/routes/resources.js';
import certificatesRouter from './server/routes/certificates.js';
import announcementsRouter from './server/routes/announcements.js';
import faqsRouter from './server/routes/faqs.js';
import galleryRouter from './server/routes/gallery.js';
import aiRouter from './server/routes/ai.js';
import publicRouter from './server/routes/public.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust Cloud Run / Reverse Proxy for proper HTTPS detection and secure headers
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Security Headers Middleware
  app.use((req, res, next) => {
    // Prevent MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Strict Transport Security (HSTS) - enforce HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // Legacy XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https: wss:",
        "frame-ancestors 'self' https://*.run.app https://ai.studio https://*.google.com",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    );

    // Cross-Origin Resource Policy
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    next();
  });

  // JSON Body Parser with 10MB limit for proof file attachments
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes (Mounted first)
  app.use('/api/auth', authRouter);
  app.use('/api/submissions', submissionsRouter);
  app.use('/api/volunteers', volunteersRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/audit', auditRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/resources', resourcesRouter);
  app.use('/api/certificates', certificatesRouter);
  app.use('/api/announcements', announcementsRouter);
  app.use('/api/faqs', faqsRouter);
  app.use('/api/gallery', galleryRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/public', publicRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Volunteer Hours Portal API',
      timestamp: new Date().toISOString(),
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Volunteer Hours Portal server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
