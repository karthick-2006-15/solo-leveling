import mongoose, { Document, Schema } from 'mongoose';

export interface IInnerMonarch extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Progression
  monarchLevel: number;
  evolutionStage: 'Dormant' | 'Awakening' | 'Disciplined Mind' | 'Iron Will' | 'Elite Monarch' | 'Supreme Monarch' | 'Legendary Monarch';
  
  // Attributes (0-100)
  attributes: {
    willpower: number;
    focus: number;
    discipline: number;
    wisdom: number;
    resilience: number;
    courage: number;
    consistency: number;
    patience: number;
    adaptability: number;
    selfControl: number;
  };
  
  // Balance
  balance: {
    mind: number;
    body: number;
    discipline: number;
    recovery: number;
    overall: number;
  };

  // Abilities
  unlockedAbilities: string[]; // e.g., 'Iron Focus', 'Momentum', 'Second Wind'

  // Latest Inner Battle stats
  latestShadowStrength: number;
  latestInnerStrength: number;
  
  // History is stored in a separate timeseries-like collection or as array if small, but let's use a separate model for historical snapshots if needed, or store recent history.
  // We'll keep a history array of weekly snapshots to show trends without needing complex queries.
  history: Array<{
    date: Date;
    attributes: {
      willpower: number;
      focus: number;
      discipline: number;
      wisdom: number;
      resilience: number;
      courage: number;
      consistency: number;
      patience: number;
      adaptability: number;
      selfControl: number;
    }
  }>;

  updatedAt: Date;
  createdAt: Date;
}

const InnerMonarchSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  monarchLevel: { type: Number, default: 1 },
  evolutionStage: { 
    type: String, 
    enum: ['Dormant', 'Awakening', 'Disciplined Mind', 'Iron Will', 'Elite Monarch', 'Supreme Monarch', 'Legendary Monarch'],
    default: 'Dormant'
  },
  
  attributes: {
    willpower: { type: Number, default: 10, min: 0, max: 100 },
    focus: { type: Number, default: 10, min: 0, max: 100 },
    discipline: { type: Number, default: 10, min: 0, max: 100 },
    wisdom: { type: Number, default: 10, min: 0, max: 100 },
    resilience: { type: Number, default: 10, min: 0, max: 100 },
    courage: { type: Number, default: 10, min: 0, max: 100 },
    consistency: { type: Number, default: 10, min: 0, max: 100 },
    patience: { type: Number, default: 10, min: 0, max: 100 },
    adaptability: { type: Number, default: 10, min: 0, max: 100 },
    selfControl: { type: Number, default: 10, min: 0, max: 100 }
  },

  balance: {
    mind: { type: Number, default: 10 },
    body: { type: Number, default: 10 },
    discipline: { type: Number, default: 10 },
    recovery: { type: Number, default: 10 },
    overall: { type: Number, default: 10 }
  },

  unlockedAbilities: [{ type: String }],
  
  latestShadowStrength: { type: Number, default: 0 },
  latestInnerStrength: { type: Number, default: 10 },

  history: [{
    date: { type: Date },
    attributes: {
      willpower: Number,
      focus: Number,
      discipline: Number,
      wisdom: Number,
      resilience: Number,
      courage: Number,
      consistency: Number,
      patience: Number,
      adaptability: Number,
      selfControl: Number
    }
  }]

}, { timestamps: true });

export default mongoose.model<IInnerMonarch>('InnerMonarch', InnerMonarchSchema);
