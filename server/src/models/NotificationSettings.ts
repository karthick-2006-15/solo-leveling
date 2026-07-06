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
  };
  email: {
    enabled: boolean;
    weeklyReview: { enabled: boolean; dayOfWeek: number; time: string };
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
    dsaReminder: {
      enabled: { type: Boolean, default: false },
      time: { type: String, default: '09:00' }
    }
  },
  email: {
    enabled: { type: Boolean, default: false },
    weeklyReview: {
      enabled: { type: Boolean, default: false },
      dayOfWeek: { type: Number, default: 0 }, // 0 = Sunday
      time: { type: String, default: '08:00' }
    }
  },
  pushSubscription: { type: Schema.Types.Mixed, default: null }
});

export default mongoose.model<INotificationSettings>('NotificationSettings', NotificationSettingsSchema);
