import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryHistoryLog extends Document {
  userId: mongoose.Types.ObjectId;
  itemId: string;
  name: string;
  action: 'added' | 'removed' | 'consumed' | 'upgraded' | 'equipped';
  quantityChange: number;
  reason: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const InventoryHistoryLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  action: { 
    type: String, 
    enum: ['added', 'removed', 'consumed', 'upgraded', 'equipped'],
    required: true 
  },
  quantityChange: { type: Number, required: true },
  reason: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: { createdAt: true, updatedAt: false } });

InventoryHistoryLogSchema.index({ userId: 1, createdAt: -1 });
InventoryHistoryLogSchema.index({ userId: 1, itemId: 1 });

export default mongoose.model<IInventoryHistoryLog>('InventoryHistoryLog', InventoryHistoryLogSchema);
