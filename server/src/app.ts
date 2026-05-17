import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';
import { errorHandler } from './middleware/errorHandler';
dotenv.config();
const app = express();
const allowedOrigins = process.env.CLIENT_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const healthCheck = (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
};

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Lead Dashboard API',
    status: 'ok',
    health: '/health',
  });
});

app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use(errorHandler);
export default app;
