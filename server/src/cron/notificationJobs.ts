import cron from 'node-cron';
import NotificationSettings from '../models/NotificationSettings';
import User from '../models/User';
import WorkoutSession from '../models/WorkoutSession';
import FoodLog from '../models/FoodLog';
import StudySession from '../models/StudySession';
import DSAProblem from '../models/DSAProblem';
import WaterLog from '../models/WaterLog';
import { sendPushNotification, sendEmail } from '../services/notificationService';
import { generateWeeklyReviewInternal } from '../controllers/aiController';
import axios from 'axios';

// Utility to check if a specific time (HH:MM) matches current UTC hour/minute
const isTimeMatch = (timeString: string, currentHour: number, currentMinute: number): boolean => {
  if (!timeString) return false;
  const [h, m] = timeString.split(':').map(Number);
  return h === currentHour && m === currentMinute;
};

// Gets the start of today in UTC
const getStartOfToday = (): Date => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

export const startCronJobs = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentDayOfWeek = now.getUTCDay();
    const startOfToday = getStartOfToday();

    try {
      // Find all settings where either push or email is enabled
      const settingsList = await NotificationSettings.find({
        $or: [{ 'push.enabled': true }, { 'email.enabled': true }]
      });

      for (const settings of settingsList) {
        const userId = settings.userId;

        // PUSH REMINDERS
        if (settings.push.enabled) {
          
          // Workout Reminder
          if (settings.push.workoutReminder.enabled && isTimeMatch(settings.push.workoutReminder.time, currentHour, currentMinute)) {
            const hasWorkout = await WorkoutSession.exists({ userId, date: { $gte: startOfToday } });
            if (!hasWorkout) {
              await sendPushNotification(userId.toString(), {
                title: 'Time to Train, Hunter',
                body: 'You haven\'t logged a workout today. Get to it!',
                url: '/workouts'
              });
            }
          }

          // Meal Reminders
          if (settings.push.mealReminder.enabled) {
            const meals = [
              { type: 'Breakfast', time: settings.push.mealReminder.breakfast },
              { type: 'Lunch', time: settings.push.mealReminder.lunch },
              { type: 'Dinner', time: settings.push.mealReminder.dinner }
            ];

            for (const meal of meals) {
              if (isTimeMatch(meal.time, currentHour, currentMinute)) {
                const hasMeal = await FoodLog.exists({ userId, mealType: meal.type, date: { $gte: startOfToday } });
                if (!hasMeal) {
                  await sendPushNotification(userId.toString(), {
                    title: `${meal.type} Time`,
                    body: `Don't forget to fuel up with your ${meal.type.toLowerCase()}.`,
                    url: '/nutrition'
                  });
                }
              }
            }
          }

          // Study Reminder
          if (settings.push.studyReminder.enabled && isTimeMatch(settings.push.studyReminder.time, currentHour, currentMinute)) {
            const hasStudy = await StudySession.exists({ userId, date: { $gte: startOfToday } });
            if (!hasStudy) {
              await sendPushNotification(userId.toString(), {
                title: 'Level Up Your Mind',
                body: 'Time for your daily study session.',
                url: '/assistant'
              });
            }
          }

          // DSA Reminder
          if (settings.push.dsaReminder.enabled && isTimeMatch(settings.push.dsaReminder.time, currentHour, currentMinute)) {
            const hasDSA = await DSAProblem.exists({ userId, date: { $gte: startOfToday } });
            if (!hasDSA) {
              await sendPushNotification(userId.toString(), {
                title: 'DSA Practice',
                body: 'Keep your coding skills sharp. Solve a problem today!',
                url: '/assistant'
              });
            }
          }

          // Sleep Reminder (Unconditional)
          if (settings.push.sleepReminder.enabled && isTimeMatch(settings.push.sleepReminder.time, currentHour, currentMinute)) {
            await sendPushNotification(userId.toString(), {
              title: 'Wind Down',
              body: 'It\'s getting late. Time to rest and recover for tomorrow.',
              url: '/'
            });
          }

          // Water Reminder (Every N hours)
          if (settings.push.waterReminder.enabled) {
            // Simplistic check: If current hour is divisible by interval
            // And it's the 0th minute
            if (currentHour % settings.push.waterReminder.intervalHours === 0 && currentMinute === 0) {
              // Check if they met their goal today
              const waterLogs = await WaterLog.find({ userId, date: { $gte: startOfToday } });
              const totalWater = waterLogs.reduce((sum, log) => sum + log.amountMl, 0);
              const goal = 3000; // Assume 3000ml goal for now
              
              if (totalWater < goal) {
                await sendPushNotification(userId.toString(), {
                  title: 'Hydration Check',
                  body: `You've drank ${totalWater}ml today. Keep going to reach your goal!`,
                  url: '/nutrition'
                });
              }
            }
          }
        }

        // WEEKLY REVIEW EMAIL
        if (settings.email.enabled && settings.email.weeklyReview.enabled) {
          if (currentDayOfWeek === settings.email.weeklyReview.dayOfWeek && 
              isTimeMatch(settings.email.weeklyReview.time, currentHour, currentMinute)) {
            
            const user = await User.findById(userId);
            if (user) {
              // Generate the weekly review content via internal API call or direct function
              // For simplicity in cron context, we could fetch it via localhost API (since it requires LLM context generation)
              // Or just construct it here. Calling our own endpoint is easiest to reuse logic.
              try {
                const content = await generateWeeklyReviewInternal(userId.toString());
                
                if (content) {
                  const html = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 20px; border-radius: 8px;">
                      <h1 style="color: #00d4ff;">Your Weekly Review, Hunter</h1>
                      <div style="background: #1e293b; padding: 15px; border-radius: 6px;">
                        ${content.replace(/\n/g, '<br/>')}
                      </div>
                      <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Keep leveling up.</p>
                    </div>
                  `;
                  await sendEmail(user.email, 'Solo Leveling: Weekly Review', html);
                }
              } catch (err) {
                console.error(`Failed to generate/send weekly review for user ${userId}`, err);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in notification cron job:', err);
    }
  });

  console.log('Notification cron jobs started.');
};
