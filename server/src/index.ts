import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import modelRoutes from './routes/model.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';

import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  const log = `${new Date().toISOString()} [${req.method}] ${req.url} - Origin: ${req.headers.origin} - Host: ${req.headers.host}\n`;
  fs.appendFileSync(path.join(process.cwd(), 'access.log'), log);
  next();
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/user', userRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
