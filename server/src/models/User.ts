import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  bodyFatPercent?: number;
  targetWeight?: number;
  targetBodyFat?: number;
  medicalNotes?: string;
  fitnessGoal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'general_health';
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number;
  dailyWaterGoalLiters?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  healthMetrics?: {
    sleepQuality: number;
    energyLevel: number;
    stressLevel: number;
    screenTimeHours: number;
    lastCheckIn: Date;
  };
  specialDays?: Array<{
    date: Date;
    type: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  googleId: { type: String },
  
  // Profile Stats
  age: { type: Number },
  gender: { type: String },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  bodyFatPercent: { type: Number },
  targetWeight: { type: Number }, // in kg
  targetBodyFat: { type: Number },
  medicalNotes: { type: String },
  
  // Goals
  fitnessGoal: { 
    type: String, 
    enum: ['lose_weight', 'gain_muscle', 'maintain', 'general_health'] 
  },
  dailyCalorieGoal: { type: Number },
  dailyProteinGoal: { type: Number },
  dailyWaterGoalLiters: { type: Number },
  
  // Levels
  activityLevel: { 
    type: String, 
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] 
  },
  experienceLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'] 
  },
  
  healthMetrics: {
    sleepQuality: { type: Number },
    energyLevel: { type: Number },
    stressLevel: { type: Number },
    screenTimeHours: { type: Number },
    lastCheckIn: { type: Date }
  },
  
  specialDays: [{
    date: { type: Date },
    type: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
