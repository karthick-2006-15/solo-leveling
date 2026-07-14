import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationSettings extends Document {
  userId: mongoose.Types.ObjectId;
  push: {
    enabled: boolean;
    workoutReminder: { enabled: boolean; time: string };
    waterReminder: { enabled: boolean; intervalHours: number };
    mealReminder: { enabled: boolean; breakfast: string; lunch: string; dinner: string };
    sleepReminder: { enabled: boolean; time: string };
    studyReminder: { enabled: boolean; time: string };
    dsaReminder: { enabled: boolean; time: string };
    dailySummary: { enabled: boolean; time: string };
  };
  email: {
    enabled: boolean;
  };
  audio: {
    soundEnabled: boolean;
    masterVolume: number;
    musicVolume: number;
    effectsVolume: number;
    voiceVolume: number;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
  };
  pushSubscription?: any; // Web Push subscription object
}

const NotificationSettingsSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  push: {
    enabled: { type: Boolean, default: false },
    workoutReminder: {
      enabled: { type: Boolean, default: false },
      time: { type: String, default: '07:00' }
    },
    waterReminder: {
      enabled: { type: Boolean, default: false },
      intervalHours: { type: Number, default: 2 }
    },
    mealReminder: {
      enabled: { type: Boolean, default: false },
      breakfast: { type: String, default: '08:00' },
      lunch: { type: String, default: '13:00' },
      dinner: { type: String, default: '19:00' }
    },
    sleepReminder: {
      enabled: { type: Boolean, default: false },
      time: { type: String, default: '22:30' }
    },
    studyReminder: {
      enabled: { type: Boolean, default: false },
      time: { type: String, default: '20:00' }
    },
    dailySummary: {
      enabled: { type: Boolean, default: false },
      time: { type: String, default: '18:00' }
    },
    dsaReminder: {
      enabled: { type: Boolean, default: false },
      time: { type: String, default: '09:00' }
    }
  },
  email: {
    enabled: { type: Boolean, default: false }
  },
  audio: {
    soundEnabled: { type: Boolean, default: true },
    masterVolume: { type: Number, default: 1.0 },
    musicVolume: { type: Number, default: 0.5 },
    effectsVolume: { type: Number, default: 0.8 },
    voiceVolume: { type: Number, default: 1.0 }
  },
  accessibility: {
    reducedMotion: { type: Boolean, default: false },
    highContrast: { type: Boolean, default: false }
  },
  pushSubscription: { type: Schema.Types.Mixed, default: null }
});

export default mongoose.model<INotificationSettings>('NotificationSettings', NotificationSettingsSchema);
