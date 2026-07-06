import mongoose, { Document, Schema } from 'mongoose';

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  days: {
    date: Date;
    meals: {
      mealType: string;
      description: string;
      estimatedCalories: number;
      estimatedProtein: number;
    }[];
  }[];
  generatedBy: string;
  createdAt: Date;
}

const MealPlanSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: Date, required: true },
  days: [{
    date: { type: Date, required: true },
    meals: [{
      mealType: { type: String, required: true },
      description: { type: String, required: true },
      estimatedCalories: { type: Number, required: true },
      estimatedProtein: { type: Number, required: true }
    }]
  }],
  generatedBy: { type: String, default: 'aria' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);
