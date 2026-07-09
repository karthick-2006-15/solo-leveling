import mongoose, { Document, Schema } from 'mongoose';

export interface IFinanceProfile extends Document {
  userId: mongoose.Types.ObjectId;
  monthlyIncome: number;
  monthlyBudget: number;
  currentSavings: number;
  emergencyFund: number;
  emergencyFundTarget: number;
  investments: number;
  financialGoals: Array<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const FinanceProfileSchema = new Schema<IFinanceProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthlyIncome: { type: Number, default: 0 },
  monthlyBudget: { type: Number, default: 0 },
  currentSavings: { type: Number, default: 0 },
  emergencyFund: { type: Number, default: 0 },
  emergencyFundTarget: { type: Number, default: 0 },
  investments: { type: Number, default: 0 },
  financialGoals: [{
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date }
  }]
}, { timestamps: true });

export default mongoose.model<IFinanceProfile>('FinanceProfile', FinanceProfileSchema);
