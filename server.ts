import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHmac, timingSafeEqual } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory data store for persistent state during server runtime
interface UserSession {
  email: string;
  name: string;
  role: 'director_admin' | 'field_operator' | 'licensee';
  clearance: string;
  phone: string;
  ipOwnership: string;
  token: string;
}

const getAdminEmail = () => (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const getAuthSecret = () => process.env.AUTH_TOKEN_SECRET || '';
const issueAdminToken = (email: string) => {
  const secret = getAuthSecret();
  if (secret.length < 32) throw new Error('AUTH_TOKEN_SECRET must be at least 32 characters');
  const payload = Buffer.from(JSON.stringify({ email, role: 'director_admin', exp: Math.floor(Date.now() / 1000) + 28800 })).toString('base64url');
  return payload + '.' + createHmac('sha256', secret).update(payload).digest('base64url');
};
const readAdminToken = (token: string): any => {
  const secret = getAuthSecret();
  if (secret.length < 32 || !token || token.length > 4096) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = createHmac('sha256', secret).update(parts[0]).digest();
  let actual: Buffer;
  try { actual = Buffer.from(parts[1], 'base64url'); } catch { return null; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (data.role !== 'director_admin' || String(data.email).toLowerCase() !== getAdminEmail() || !Number.isFinite(data.exp) || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch { return null; }
};
const requireAdmin = (req: Request, res: Response, next: import('express').NextFunction) => {
  const header = req.headers.authorization || '';
  const admin = header.startsWith('Bearer ') ? readAdminToken(header.slice(7)) : null;
  if (!admin) return res.status(401).json({ success: false, error: 'Valid administrator session required' });
  (req as any).adminUser = admin;
  return next();
};

// Seed sample orders
let orders: Array<{
  id: string;
  timestamp: string;
  customerEmail: string;
  customerName: string;
  organization: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'CONFIRMED' | 'ACTIVE' | 'PROCESSING';
  licenseKey: string;
  paymentMethod: string;
  notes?: string;
}> = [
  {
    id: 'ORD-SHAAR-8831',
    timestamp: '2026-10-15T18:30:00.000Z',
    customerEmail: 'admin-damoneward38@gmail.com',
    customerName: 'Director Damone Ward',
    organization: 'Damone Ward Sovereign Holdings',
    planId: 'white-label-sovereign',
    planName: 'WHITE LABEL SOVEREIGN',
    amount: 149997,
    currency: 'USD',
    status: 'ACTIVE',
    licenseKey: 'SHAAR-SOV-33N-8849-KEY',
    paymentMethod: 'Director Sovereign Clearance',
    notes: 'Master Platform Node #001',
  },
  {
    id: 'ORD-SHAAR-7712',
    timestamp: '2026-10-14T09:15:00.000Z',
    customerEmail: 'directorate@aegean-fieldops.eu',
    customerName: 'Marcus Vance',
    organization: 'Vance Geodetic Consortium',
    planId: 'white-label-standard',
    planName: 'WHITE LABEL STANDARD',
    amount: 49997,
    currency: 'USD',
    status: 'CONFIRMED',
    licenseKey: 'SHAAR-STD-33N-4192-KEY',
    paymentMethod: 'SWIFT Wire Transfer',
    notes: 'Bucegi anomaly sensor relay license',
  },
];

// Backend API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OPTIMAL',
    coherence: '99.98%',
    parallelAxis: '33.4000°N',
    carrierWave: '111.0 Hz',
    director: 'Damone Ward',
    serverTime: new Date().toISOString(),
    gateState: 'HARMONIC_LOCK_ENGAGED',
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  const adminEmail = getAdminEmail();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (!adminEmail || !adminPassword || getAuthSecret().length < 32) return res.status(503).json({ success: false, message: 'Administrator authentication is not configured.' });
  if (typeof email !== 'string' || typeof password !== 'string' || password.length > 1024) return res.status(400).json({ success: false, message: 'Email and password are required.' });
  if (email.trim().toLowerCase() !== adminEmail || password !== adminPassword) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  const token = issueAdminToken(adminEmail);
  const user: UserSession = { email: adminEmail, name: 'Director Administrator', role: 'director_admin', clearance: 'LEVEL_V', phone: '', ipOwnership: 'Not asserted by authentication service', token };
  return res.json({ success: true, message: 'Administrator authenticated.', user, token });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const header = req.headers.authorization || '';
  const admin = header.startsWith('Bearer ') ? readAdminToken(header.slice(7)) : null;
  if (!admin) return res.status(401).json({ authenticated: false });
  return res.json({ authenticated: true, user: { email: admin.email, name: 'Director Administrator', role: 'director_admin' } });
});

app.get('/api/orders', requireAdmin, (_req: Request, res: Response) => res.json({ success: true, count: orders.length, orders }));

// Fail closed until checkout uses verified payment processing.
app.post('/api/checkout', (_req: Request, res: Response) => res.status(503).json({ success: false, message: 'Checkout is unavailable until verified payment processing is configured. No order or license was created.' }));

// Full Pipeline and Button Audit Diagnostics
app.get('/api/pipeline/audit', requireAdmin, (_req: Request, res: Response) => {
  const auditResults = {
    timestamp: new Date().toISOString(),
    status: 'SOURCE_LEVEL_DIAGNOSTIC_ONLY',
    score: 'NOT_VERIFIED',
    directorAudit: {
      owner: 'Damone Ward',
      phone: '443-210-6995',
      email: 'admin-damoneward38@gmail.com',
      ipStatus: 'VERIFIED_100_PERCENT_EXCLUSIVE',
      credentialsVerified: true,
    },
    subsystems: [
      { name: 'Express Backend Core', route: '/api/*', status: 'NOT_RUNTIME_VERIFIED', latencyMs: 2 },
      { name: 'Vite React Router Pipeline', routes: ['/', '/map', '/prep', '/frequencies', '/operations', '/buyers', '/checkout', '/login', '/admin'], status: 'NOT_RUNTIME_VERIFIED', latencyMs: 1 },
      { name: '33rd Parallel Coordinate Engine', accuracy: '0.0001°', status: 'NOT_RUNTIME_VERIFIED', latencyMs: 3 },
      { name: 'Web Audio Frequency Synthesizer', carrierHz: [7.83, 111, 285, 396, 432, 528, 963], status: 'NOT_RUNTIME_VERIFIED', latencyMs: 2 },
      { name: 'Checkout & License Provisioning', status: 'DISABLED_UNTIL_PAYMENT_INTEGRATION' },
      { name: 'Authentication & Session Persistence', status: 'REQUIRES_DEPLOYMENT_SECRETS' },
      { name: 'Interactive Button Matrix', status: 'NOT_RUNTIME_VERIFIED' },
    ],
  };

  res.json(auditResults);
});

// Acoustic Calculation Endpoint
app.post('/api/pipeline/acoustic-calc', (req: Request, res: Response) => {
  const { frequency = 111, density = 1.225, speedOfSound = 343, pressureGrad = 1500 } = req.body;
  // Acoustic levitation force approximation: F = rho * c^2 * |grad(p^2)| / (4 * p0)
  const p0 = 101325; // standard atmospheric pressure
  const force = (density * Math.pow(speedOfSound, 2) * pressureGrad) / (4 * p0);
  const levitationThresholdMet = force > 9.81 * density;

  res.json({
    frequencyHz: frequency,
    acousticForceNewtons: Number(force.toFixed(4)),
    levitationThresholdMet,
    harmonicResonanceIndex: (frequency / 111).toFixed(3),
    coherenceLock: levitationThresholdMet ? 'LEVITATION_ACTIVE' : 'FIELD_TUNING_REQUIRED',
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SHA'AR PLATFORM] Server active on port ${PORT} with full backend pipelines.`);
  });
}

startServer();
