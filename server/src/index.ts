import dns from 'node:dns';

// Override the broken Node.js DNS resolver on Windows to ensure MongoDB SRV resolution works
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import statusRoutes from './routes/statusRoutes';
import path from 'path';
import dotenvSafe from 'dotenv-safe';
import mongoose from 'mongoose';
import guardianRoutes from './routes/guardianRoutes';

// Ensure unhandled rejections and exceptions are logged clearly before anything else starts
process.on('uncaughtException', (err) => {
  console.error('\n[CRASH] 💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, _promise) => {
  console.error('\n[CRASH] 💥 UNHANDLED REJECTION! Shutting down...');
  if (reason instanceof Error) {
    console.error(reason.name, reason.message);
    console.error(reason.stack);
  } else {
    console.error(reason);
  }
  process.exit(1);
});

async function bootstrap() {
  try {
    console.log('[BOOT] 1. Loading Environment Variables...');
    dotenvSafe.config({ path: '../.env', example: '../.env.example', allowEmptyValues: true });

    console.log('[BOOT] 2. Validating Environment Variables...');
    const { validateEnv } = await import('./validations/envValidation');
    validateEnv();

    console.log('[BOOT] 3. Connecting to Database...');
    let MONGODB_URI = process.env.MONGODB_URI;

    if (process.env.QA_MODE === 'true') {
      console.log('[BOOT] QA_MODE active: Starting mongodb-memory-server...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      MONGODB_URI = mongoServer.getUri();
    }

    if (!MONGODB_URI) {
      console.warn('[BOOT] MONGODB_URI is not defined! System cannot start without a database.');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('[BOOT] ✅ Connected to MongoDB. Database is READY.');

    console.log('[BOOT] 4. Connecting to Redis...');
    const { connectRedis } = await import('./config/redis');
    connectRedis();

    console.log('[BOOT] 5. Importing and Registering Application Logic...');
    
    // Middlewares
    const cors = (await import('cors')).default;
    const cookieParser = (await import('cookie-parser')).default;
    const helmet = (await import('helmet')).default;
    const rateLimit = (await import('express-rate-limit')).default;
    const mongoSanitize = (await import('express-mongo-sanitize')).default;

    // Routes
    const authRoutes = (await import('./routes/authRoutes')).default;
    const userRoutes = (await import('./routes/userRoutes')).default;
    const progressionRoutes = (await import('./routes/progressionRoutes')).default;
    const habitRoutes = (await import('./routes/habitRoutes')).default;
    const workoutRoutes = (await import('./routes/workoutRoutes')).default;
    const nutritionRoutes = (await import('./routes/nutritionRoutes')).default;
    const skillRoutes = (await import('./routes/skillRoutes')).default;
    const dsaRoutes = (await import('./routes/dsaRoutes')).default;
    const aiRoutes = (await import('./routes/aiRoutes')).default;
    const missionRoutes = (await import('./routes/missionRoutes')).default;
    const weightRoutes = (await import('./routes/weightRoutes')).default;
    const analyticsRoutes = (await import('./routes/analyticsRoutes')).default;
    const achievementRoutes = (await import('./routes/achievementRoutes')).default;
    const notificationRoutes = (await import('./routes/notificationRoutes')).default;
    
    // Additional Subsystem Routes
    const academicRoutes = (await import('./routes/academicRoutes')).default;
    const ariaRoutes = (await import('./routes/ariaRoutes')).default;
    const careerRoutes = (await import('./routes/careerRoutes')).default;
    const dungeonRoutes = (await import('./routes/dungeonRoutes')).default;
    const economyRoutes = (await import('./routes/economyRoutes')).default;
    const financeRoutes = (await import('./routes/financeRoutes')).default;
    const healthRoutes = (await import('./routes/healthRoutes')).default;
    const inventoryRoutes = (await import('./routes/inventoryRoutes')).default;
    const monarchRoutes = (await import('./routes/monarchRoutes')).default;
    const rewardRoutes = (await import('./routes/rewardRoutes')).default;
    const storyRoutes = (await import('./routes/storyRoutes')).default;
    const screenTimeRoutes = (await import('./routes/screenTimeRoutes')).default;
    
    // Error Handler
    const { globalErrorHandler } = await import('./middleware/errorHandler');
    // Cron Jobs
    const { startCronJobs } = await import('./cron/notificationJobs');
    const { startStoryCronJobs } = await import('./cron/dailyStoryCron');

    const app = express();
    const PORT = process.env.PORT || 5000;
    const isDev = process.env.NODE_ENV !== 'production';

    // Application Middleware Configuration
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });

    app.use(helmet());
    app.use(mongoSanitize());

    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isDev ? 5000 : 300, // 5000 in dev, 300 in prod per 15 minutes
      message: 'Too many requests from this IP, please try again after 15 minutes',
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use('/api', apiLimiter);

    app.use(cors({
      origin: 'http://localhost:5173', // Vite default port
      credentials: true,
    }));
    app.use(express.json());
    app.use(cookieParser());

    // Register Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/progression', progressionRoutes);
    app.use('/api/habits', habitRoutes);
    app.use('/api/workouts', workoutRoutes);
    app.use('/api/nutrition', nutritionRoutes);
    app.use('/api/skills', skillRoutes);
    app.use('/api/dsa', dsaRoutes);
    app.use('/api/missions', missionRoutes);
    app.use('/api/weight', weightRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/achievements', achievementRoutes);
    app.use('/api/assistant', aiRoutes);
    app.use('/api/notifications', notificationRoutes);
    
    // Additional Subsystem Mounting
    app.use('/api/academics', academicRoutes);
    app.use('/api/status', statusRoutes);
    app.use('/api/aria', ariaRoutes);
    app.use('/api/career', careerRoutes);
    app.use('/api/dungeons', dungeonRoutes);
    app.use('/api/economy', economyRoutes);
    app.use('/api/finance', financeRoutes);
    app.use('/api/health', healthRoutes);
    app.use('/api/inventory', inventoryRoutes);
    app.use('/api/monarch', monarchRoutes);
    app.use('/api/rewards', rewardRoutes);
    app.use('/api/story', storyRoutes);
    app.use('/api/screentime', screenTimeRoutes);
    app.use('/api/guardian', guardianRoutes);

    // Serve Frontend in Production
    if (process.env.NODE_ENV === 'production') {
      const clientBuildPath = path.join(__dirname, '../../client/dist');
      app.use(express.static(clientBuildPath));
      
      app.get('*', (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
      });
    }

    // Register Global Error Handler (MUST BE LAST)
    app.use(globalErrorHandler);

    console.log('[BOOT] 6. Starting HTTP Server...');
    const connections = new Set<any>();
    
    const server = app.listen(PORT, () => {
      console.log(`[BOOT] ✅ Server is successfully running and bound to port ${PORT}`);
      console.log('[BOOT] 7. Initializing Background Tasks...');
      startCronJobs();
      startStoryCronJobs();
      console.log('[BOOT] ✅ SYSTEM FULLY ONLINE AND READY');
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[CRASH] Port ${PORT} is already in use. Exiting.`);
      } else {
        console.error('[CRASH] Server error:', err);
      }
      process.exit(1);
    });

    server.on('connection', (connection: any) => {
      connections.add(connection);
      connection.on('close', () => connections.delete(connection));
    });

    // --- GRACEFUL SHUTDOWN HANDLERS ---
    const gracefulShutdown = (signal: string) => {
      console.log(`\n[SHUTDOWN] Received ${signal}. Shutting down gracefully...`);
      
      for (const connection of connections) {
        connection.destroy();
      }
      
      server.close(async () => {
        console.log('[SHUTDOWN] HTTP server closed.');
        try {
          await mongoose.connection.close(false);
          console.log('[SHUTDOWN] MongoDB connection closed.');
          
          if (signal === 'SIGUSR2') {
            process.kill(process.pid, 'SIGUSR2');
          } else {
            process.exit(0);
          }
        } catch (err) {
          console.error('[SHUTDOWN] Error during shutdown:', err);
          process.exit(1);
        }
      });

      // Force close after 5 seconds if hanging
      setTimeout(() => {
        console.error('[SHUTDOWN] Forcing shutdown after 5s timeout.');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart signal

  } catch (error) {
    console.error('\n[CRASH] 💥 FAILED TO BOOT SYSTEM:', error);
    process.exit(1);
  }
}

bootstrap();
