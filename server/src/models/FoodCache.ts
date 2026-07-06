import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodCache extends Document {
  foodName: string;
  thumbnail?: string;
  dataType?: string;
  baseQuantity: number; // Always 100
  baseUnit: string; // 'g' or 'ml'
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar?: number;
    sodium?: number;
    potassium?: number;
    calcium?: number;
    iron?: number;
    vitaminA?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminB12?: number;
    magnesium?: number;
    cholesterol?: number;
    saturatedFat?: number;
    unsaturatedFat?: number;
    water?: number;
  };
  source: string;
  rawApiResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const FoodCacheSchema: Schema = new Schema({
  foodName: { type: String, required: true, index: true }, // Index for fast searches
  thumbnail: { type: String },
  dataType: { type: String },
  baseQuantity: { type: Number, default: 100 },
  baseUnit: { type: String, default: 'g' },
  nutrients: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number },
    sodium: { type: Number },
    potassium: { type: Number },
    calcium: { type: Number },
    iron: { type: Number },
    vitaminA: { type: Number },
    vitaminC: { type: Number },
    vitaminD: { type: Number },
    vitaminB12: { type: Number },
    magnesium: { type: Number },
    cholesterol: { type: Number },
    saturatedFat: { type: Number },
    unsaturatedFat: { type: Number },
    water: { type: Number },
  },
  source: { type: String, default: 'openfoodfacts' },
  rawApiResponse: { type: Schema.Types.Mixed }, // Store original payload just in case
}, { timestamps: true });

// Case-insensitive text index for autocomplete/search capabilities
FoodCacheSchema.index({ foodName: 'text' });

export default mongoose.model<IFoodCache>('FoodCache', FoodCacheSchema);
