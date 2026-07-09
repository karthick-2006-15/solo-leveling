import FinanceProfile from '../models/FinanceProfile';

export const getFinanceProfile = async (userId: string) => {
  let profile = await FinanceProfile.findOne({ userId });
  if (!profile) {
    profile = await FinanceProfile.create({ userId });
  }
  return profile;
};

export const updateFinanceProfile = async (userId: string, updateData: any) => {
  const profile = await FinanceProfile.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, upsert: true }
  );
  return profile;
};
