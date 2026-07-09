import cron from 'node-cron';
import User from '../models/User';
import { generateDailyMissions } from '../services/missionEngine';
import logger from '../utils/logger';

// Runs at 00:01 every day
export const startMissionGenerator = () => {
  cron.schedule('1 0 * * *', async () => {
    logger.info('Starting Daily Mission Generation Job');
    
    try {
      const users = await User.find({});
      for (const user of users) {
        try {
          await generateDailyMissions(user._id.toString());
        } catch (err) {
          logger.error(`Failed to generate missions for user ${user._id}:`, err);
        }
      }
      logger.info('Daily Mission Generation Complete');
    } catch (err) {
      logger.error('Error in Mission Generator Job:', err);
    }
  });
};
