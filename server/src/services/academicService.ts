import AcademicProfile from '../models/AcademicProfile';

export const getAcademicProfile = async (userId: string) => {
  let profile = await AcademicProfile.findOne({ userId });
  if (!profile) {
    profile = await AcademicProfile.create({ userId });
  }
  return profile;
};

export const updateAcademicProfile = async (userId: string, updateData: any) => {
  const profile = await AcademicProfile.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, upsert: true }
  );
  return profile;
};
