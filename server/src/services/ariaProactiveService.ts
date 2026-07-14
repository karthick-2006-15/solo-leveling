import ConversationMessage from '../models/ConversationMessage';
import InnerMonarch from '../models/InnerMonarch';
import User from '../models/User';
import mongoose from 'mongoose';
import { sendPushNotification } from './notificationService';

class AriaProactiveService {
  async runHealthInterventionCheck(userId: string) {
    try {
      const monarchData = await InnerMonarch.findOne({ userId });
      if (!monarchData) return;

      const dopamine = monarchData.attributes.dopamineBalance ?? 100;
      const corruption = monarchData.attributes.corruption ?? 0;
      let interventionMessage = null;
      let urgency: 'normal' | 'high' | 'critical' = 'normal';

      if (corruption > 80) {
        interventionMessage = "CRITICAL WARNING: The Shadows are taking over. Your Corruption level is dangerously high. You must complete a purification quest immediately.";
        urgency = 'critical';
      } else if (dopamine < 30) {
        interventionMessage = "SYSTEM ALERT: Dopamine receptors severely depleted. You have been engaging in too many low-effort activities. Suggesting an immediate dopamine detox.";
        urgency = 'high';
      } else if (corruption > 50) {
        interventionMessage = "Warning: Corruption is spreading. Shadow resistance is dropping. Stay focused.";
        urgency = 'high';
      } else if (dopamine < 60) {
        interventionMessage = "Notice: Dopamine levels are dropping. Consider completing a challenging task to restore balance.";
        urgency = 'normal';
      }

      if (interventionMessage) {
        // Only intervene if we haven't sent a proactive message in the last 12 hours
        const lastMessage = await ConversationMessage.findOne({
          userId,
          role: 'assistant',
          isProactive: true,
          createdAt: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) }
        });

        if (!lastMessage) {
          // Send ARIA message
          const msg = new ConversationMessage({
            userId,
            role: 'assistant',
            content: interventionMessage,
            isProactive: true // Custom flag to track
          });
          await msg.save();

          // Send Push Notification
          await sendPushNotification(userId, {
            title: urgency === 'critical' ? 'CRITICAL SYSTEM ALERT' : 'ARIA Notice',
            body: interventionMessage,
            url: '/status'
          });
        }
      }

    } catch (error) {
      console.error(`Error in runHealthInterventionCheck for user ${userId}:`, error);
    }
  }

  async runGlobalInterventions() {
    console.log('[ARIA] Running global proactive health interventions...');
    const users = await User.find({ isActive: true });
    for (const user of users) {
      await this.runHealthInterventionCheck(user._id.toString());
    }
  }
}

export const ariaProactiveService = new AriaProactiveService();
