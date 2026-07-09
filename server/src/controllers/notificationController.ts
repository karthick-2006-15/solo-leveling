import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import NotificationSettings from '../models/NotificationSettings';
import { sendPushNotification } from '../services/notificationService';

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    let settings = await NotificationSettings.findOne({ userId });
    
    if (!settings) {
      settings = await NotificationSettings.create({ userId });
    }
    
    res.json(settings);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const update = req.body;
    
    // Prevent updating pushSubscription directly through this route
    delete update.pushSubscription;
    delete update.userId;

    const settings = await NotificationSettings.findOneAndUpdate(
      { userId },
      { $set: update },
      { new: true, upsert: true }
    );
    
    res.json(settings);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const subscribePush = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { subscription } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ error: 'No subscription provided' });
    }

    const settings = await NotificationSettings.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          pushSubscription: subscription,
          'push.enabled': true
        } 
      },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to subscribe to push notifications' });
  }
};

export const unsubscribePush = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const settings = await NotificationSettings.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          pushSubscription: null,
          'push.enabled': false
        } 
      },
      { new: true }
    );

    res.json(settings);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to unsubscribe from push notifications' });
  }
};

export const testPush = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    await sendPushNotification(userId!, {
      title: 'System Initialized',
      body: 'Notifications are actively linked to your Hunter profile.',
      url: '/settings/notifications'
    });
    
    res.json({ message: 'Test notification queued' });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to send test push' });
  }
};
