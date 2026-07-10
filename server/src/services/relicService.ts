import mongoose from 'mongoose';
import ProgressionProfile from '../models/ProgressionProfile';
import InventoryItem from '../models/InventoryItem';

class RelicService {
  async equipRelic(userId: string, itemDocId: string) {
    const item = await InventoryItem.findOne({ _id: itemDocId, userId, category: 'Relic', status: 'active' });
    if (!item) throw new Error("Relic not found or not active.");

    const profile = await ProgressionProfile.findOne({ userId });
    if (!profile) throw new Error("Profile not found.");

    if (!profile.equippedRelics) {
      profile.equippedRelics = [];
    }

    const objectId = new mongoose.Types.ObjectId(itemDocId);

    if (profile.equippedRelics.some(id => id.toString() === objectId.toString())) {
      throw new Error("Relic already equipped.");
    }

    // Limit active relics (e.g., 3 slots max for now)
    if (profile.equippedRelics.length >= 3) {
      throw new Error("Maximum relic slots equipped. Unequip a relic first.");
    }

    profile.equippedRelics.push(objectId);
    item.status = 'equipped';
    await item.save();
    await profile.save();

    return { success: true, equippedRelics: profile.equippedRelics };
  }

  async unequipRelic(userId: string, itemDocId: string) {
    const profile = await ProgressionProfile.findOne({ userId });
    if (!profile) throw new Error("Profile not found.");

    const objectId = new mongoose.Types.ObjectId(itemDocId);
    profile.equippedRelics = profile.equippedRelics.filter((id: mongoose.Types.ObjectId) => id.toString() !== objectId.toString());
    
    await InventoryItem.updateOne({ _id: itemDocId, userId }, { status: 'active' });
    await profile.save();

    return { success: true, equippedRelics: profile.equippedRelics };
  }
}

export const relicService = new RelicService();
