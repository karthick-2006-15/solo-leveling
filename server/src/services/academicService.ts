import AcademicProfile from '../models/AcademicProfile';

export const getAcademicProfile = async (userId: string) => {
  let profile = await AcademicProfile.findOne({ userId });
  if (!profile) {
    profile = await AcademicProfile.create({ userId });
  } else {
    let modified = false;
    if (!profile.semesters) {
      profile.semesters = [];
      modified = true;
    }
    if (!profile.projects) {
      profile.projects = [];
      modified = true;
    }
    if (!profile.codingTracker) {
      profile.codingTracker = {
        dsaSolved: 0,
        leetcodeSolved: 0,
        codeforcesRating: 0,
        githubCommits: 0,
        codingHours: 0,
        languages: []
      };
      modified = true;
    }
    if (!profile.studyPlans) {
      profile.studyPlans = [];
      modified = true;
    }
    if (modified) {
      await profile.save();
    }
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
