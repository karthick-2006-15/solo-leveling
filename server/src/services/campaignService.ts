import Campaign from '../models/Campaign';
import { dungeonService } from './dungeonService';

class CampaignService {
  async getActiveCampaigns(userId: string) {
    return await Campaign.find({ userId, status: 'Active' }).populate('dungeons');
  }

  async startCampaign(userId: string, name: string, type: string, days: number) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    const campaign = await Campaign.create({
      userId,
      name,
      type,
      startDate,
      endDate,
      status: 'Active'
    });

    return campaign;
  }
}

export const campaignService = new CampaignService();
