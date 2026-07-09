import mongoose, { Document, Schema } from 'mongoose';

export interface IShopItem extends Document {
  itemId: string;
  name: string;
  type: string;
  description: string;
  category: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Monarch';
  icon: string;
  price: number;
  currencyType: 'coins';
  rotationType: 'permanent' | 'daily' | 'weekly' | 'limited';
  activeUntil?: Date;
  metadata?: Record<string, any>;
}

const ShopItemSchema: Schema = new Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  rarity: { 
    type: String, 
    enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Monarch'],
    default: 'Common'
  },
  icon: { type: String, required: true },
  price: { type: Number, required: true },
  currencyType: { type: String, default: 'coins' },
  rotationType: { 
    type: String, 
    enum: ['permanent', 'daily', 'weekly', 'limited'],
    default: 'permanent'
  },
  activeUntil: { type: Date },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

ShopItemSchema.index({ rotationType: 1 });
ShopItemSchema.index({ activeUntil: 1 });

export default mongoose.model<IShopItem>('ShopItem', ShopItemSchema);
