import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodLog extends Document {
  userId: mongoose.Types.ObjectId;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: Date;
  rawDescription: string;
  servingDescription: string;
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  source: 'nutritionix' | 'usda' | 'manual';
  createdAt: Date;
}

const FoodLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mealType: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack'], 
    required: true 
  },
  date: { type: Date, default: Date.now },
  rawDescription: { type: String, required: true },
  servingDescription: { type: String, required: true },
  nutrients: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number },
    sugar: { type: Number },
    sodium: { type: Number }
  },
  source: { 
    type: String, 
    enum: ['nutritionix', 'usda', 'manual'], 
    required: true 
  }
}, { timestamps: true });

FoodLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IFoodLog>('FoodLog', FoodLogSchema);
