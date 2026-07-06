import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export const validateEnv = () => {
  try {
    envSchema.parse(process.env);
    console.log('Environment variables validated successfully.');
  } catch (error: any) {
    console.error('💥 Environment validation failed:', error.errors);
    process.exit(1);
  }
};
