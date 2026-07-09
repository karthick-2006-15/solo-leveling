import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryItem extends Document {
  userId: mongoose.Types.ObjectId;
  itemId: string;
  name: string;
  type: string;
  description: string;
  category: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Monarch';
  icon: string;
  animation?: string;
  quantity: number;
  stackable: boolean;
  maxStackSize: number;
  obtainedAt: Date;
  source: string;
  status: 'active' | 'consumed' | 'equipped';
  isFavorite: boolean;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: String, required: true },
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
  animation: { type: String },
  quantity: { type: Number, default: 1 },
  stackable: { type: Boolean, default: false },
  maxStackSize: { type: Number, default: 1 },
  obtainedAt: { type: Date, default: Date.now },
  source: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'consumed', 'equipped'],
    default: 'active'
  },
  isFavorite: { type: Boolean, default: false },
  tags: [{ type: String }],
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Compound indexes for extremely fast queries
InventoryItemSchema.index({ userId: 1, category: 1 });
InventoryItemSchema.index({ userId: 1, rarity: 1 });
InventoryItemSchema.index({ userId: 1, itemId: 1 });
InventoryItemSchema.index({ userId: 1, isFavorite: 1 });

export default mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
