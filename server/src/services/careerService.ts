import CareerProfile from '../models/CareerProfile';

export const getCareerProfile = async (userId: string) => {
  let profile = await CareerProfile.findOne({ userId });
  if (!profile) {
    profile = await CareerProfile.create({ userId });
  }
  return profile;
};

export const updateCareerProfile = async (userId: string, updateData: any) => {
  const profile = await CareerProfile.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, upsert: true }
  );
  return profile;
};
