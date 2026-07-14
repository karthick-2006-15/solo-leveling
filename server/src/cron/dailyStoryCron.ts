import cron from 'node-cron';
import { storyGeneratorService } from '../services/storyGeneratorService';

export const startStoryCronJobs = () => {
  // Run at 23:55 every day
  cron.schedule('55 23 * * *', async () => {
    try {
      console.log('Running daily story generator cron...');
      await storyGeneratorService.runGlobalDailyRecap();
    } catch (err) {
      console.error('Error running daily story generator:', err);
    }
  });

  console.log('Daily story generator cron started.');
};
