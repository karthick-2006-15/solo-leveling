import { monarchService } from './monarchService';
import ProgressionProfile from '../models/ProgressionProfile';
import User from '../models/User';
import QuestInstance from '../models/QuestInstance';
import Boss from '../models/Boss';
import WorkoutSession from '../models/WorkoutSession';
import FoodLog from '../models/FoodLog';
import WaterLog from '../models/WaterLog';
import SleepLog from '../models/SleepLog';
import StudySession from '../models/StudySession';
import HabitCompletion from '../models/HabitCompletion';
import { missionService } from './missionService';

class StatusService {
  async getStatusWindow(userId: string) {
    const user = await User.findById(userId);
    const profile = await ProgressionProfile.findOne({ userId });
    const monarch = await monarchService.getMonarchState(userId);

    if (!user || !profile || !monarch) {
      throw new Error("Missing critical profile data for status window.");
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    const day = weekStart.getUTCDay();
    const diff = weekStart.getUTCDate() - day + (day === 0 ? -6 : 1);
    weekStart.setUTCDate(diff);

    // 1. Calculate Primary Attributes (Dynamic)
    // STR: based on workouts and protein
    const lifetimeWorkouts = await WorkoutSession.countDocuments({ userId });
    const strScore = 10 + Math.floor(lifetimeWorkouts / 2);

    // INT: based on study sessions
    const lifetimeStudy = await StudySession.countDocuments({ userId });
    const intScore = 10 + Math.floor(lifetimeStudy / 2);

    // END: based on water and sleep
    const lifetimeWater = await WaterLog.countDocuments({ userId });
    const endScore = 10 + Math.floor(lifetimeWater / 5);

    // Update Monarch state with computed attributes
    monarch.attributes.STR = strScore;
    monarch.attributes.INT = intScore;
    monarch.attributes.END = endScore;
    
    // Fallbacks for other stats (can be expanded later)
    monarch.attributes.AGI = 10 + Math.floor(lifetimeWorkouts / 3);
    monarch.attributes.WIS = 10 + Math.floor(lifetimeStudy / 3);
    monarch.attributes.PER = 10 + Math.floor(profile.totalClaims / 2);
    monarch.attributes.CHA = 10 + Math.floor(profile.level / 2);
    monarch.attributes.MNT = 10 + Math.floor(monarch.attributes.willpower / 10);
    monarch.attributes.FOC = 10 + Math.floor(monarch.attributes.focus / 10);
    monarch.attributes.DIS = 10 + Math.floor(monarch.attributes.discipline / 10);
    monarch.attributes.REC = 10 + Math.floor(monarch.balance.recovery / 10);
    monarch.attributes.WIL = 10 + Math.floor(monarch.attributes.willpower / 10);
    
    await monarch.save();

    // 2. Compute Vitals
    const latestSleep = await SleepLog.findOne({ userId }).sort({ date: -1 });
    const recovery = latestSleep ? Math.min(100, Math.floor(latestSleep.quality || 80)) : 80;
    const fatigue = Math.max(0, 100 - recovery + (monarch.attributes.corruption * 0.5));
    const hp = 100 - (fatigue * 0.5);
    const mp = monarch.attributes.willpower;

    // 3. Compute Secondary Stats (from healthMetrics / logs)
    const weightLogs = await FoodLog.find({ userId }).sort({ date: -1 }).limit(1); // placeholder for weight logic
    // Using user healthMetrics if available
    const bmi = (user.healthMetrics as any)?.bmi || 22.5;
    const bodyFat = (user.healthMetrics as any)?.bodyFat || 15.0;

    const todayStudy = await StudySession.find({ userId, loggedAt: { $gte: today } });
    const studyHoursToday = todayStudy.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60;

    const todayWorkout = await WorkoutSession.find({ userId, date: { $gte: today } });
    const workoutHoursToday = todayWorkout.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60;

    const todayFood = await FoodLog.find({ userId, date: { $gte: today } });
    const caloriesBurned = todayWorkout.reduce((sum, s) => sum + ((s as any).caloriesBurned || 0), 0);
    const proteinIntake = todayFood.reduce((sum, l) => sum + l.nutrients.protein, 0);

    const todayWater = await WaterLog.find({ userId, date: { $gte: today } });
    const waterIntake = todayWater.reduce((sum, l) => sum + l.amountMl, 0);

    // 4. Power Score
    const combatPower = (strScore + monarch.attributes.AGI + endScore) * profile.level;
    const knowledgePower = (intScore + monarch.attributes.WIS + monarch.attributes.PER) * profile.level;
    const overallPower = combatPower + knowledgePower;

    // 5. Shadows & Bosses
    const shadows = await QuestInstance.find({ userId, status: 'failed', isShadow: true });
    const shadowArmySize = shadows.length;
    const bosses = await Boss.find({ userId, isDefeated: false });

    // 6. Buffs & Debuffs
    const buffs = [];
    if (profile.currentStreak >= 3) buffs.push({ name: 'Streak Buff', value: `+${Math.min(50, profile.currentStreak * 5)}% XP` });
    if (recovery > 85) buffs.push({ name: 'Sleep Buff', value: '+20% Recovery' });

    const debuffs = [];
    if (fatigue > 70) debuffs.push({ name: 'High Fatigue', value: '-20% STR' });
    if (monarch.attributes.corruption > 50) debuffs.push({ name: 'High Corruption', value: 'Shadow Resistance -30%' });

    return {
      status: {
        level: profile.level,
        rank: profile.rank,
        title: profile.hunterTitle || 'Beginner Hunter',
        class: profile.hunterClass || 'None',
        currentXP: profile.currentXP,
        nextLevelXP: profile.level * 1000,
      },
      vitals: {
        hp: Math.floor(hp),
        mp: Math.floor(mp),
        energy: Math.floor(100 - fatigue),
        recovery: Math.floor(recovery),
        fatigue: Math.floor(fatigue),
        stress: Math.max(0, Math.floor(fatigue * 0.8)),
        focus: Math.floor(monarch.attributes.focus),
        willpower: Math.floor(monarch.attributes.willpower),
      },
      primaryAttributes: {
        STR: strScore,
        AGI: monarch.attributes.AGI,
        END: endScore,
        INT: intScore,
        WIS: monarch.attributes.WIS,
        PER: monarch.attributes.PER,
        CHA: monarch.attributes.CHA,
        MNT: monarch.attributes.MNT,
        FOC: monarch.attributes.FOC,
        DIS: monarch.attributes.DIS,
        REC: monarch.attributes.REC,
        WIL: monarch.attributes.WIL,
      },
      secondaryStats: {
        bmi: bmi,
        bodyFat: bodyFat,
        caloriesBurned: Math.floor(caloriesBurned),
        proteinIntake: Math.floor(proteinIntake),
        waterIntakeMl: waterIntake,
        studyHoursToday: studyHoursToday.toFixed(1),
        workoutHoursToday: workoutHoursToday.toFixed(1),
      },
      powerScore: {
        overallPower,
        combatPower,
        knowledgePower,
        shadowResistance: 100 - monarch.attributes.corruption,
        corruption: monarch.attributes.corruption,
      },
      innerMonarch: monarch,
      shadows: {
        armySize: shadowArmySize,
        loyalty: Math.min(100, profile.level * 2),
        activeShadows: shadows.slice(0, 5)
      },
      bosses: bosses,
      buffs,
      debuffs,
      records: {
        highestStreak: profile.longestStreak,
        lifetimeXP: profile.totalXP,
        totalClaims: profile.totalClaims,
        hunterScore: profile.hunterScore,
      }
    };
  }
}

export const statusService = new StatusService();
