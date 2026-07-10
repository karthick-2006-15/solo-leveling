import ShopItem from '../models/ShopItem';
import ProgressionProfile from '../models/ProgressionProfile';
import { inventoryService } from './inventoryService';
import { rewardEngine } from './rewardEngine';
import InventoryItem from '../models/InventoryItem';

class ShopService {
  async getShopItems() {
    const now = new Date();
    // Return permanent items + active limited/daily/weekly
    return await ShopItem.find({
      $or: [
        { rotationType: 'permanent' },
        { activeUntil: { $gt: now } }
      ]
    }).sort({ price: 1 });
  }

  async purchaseItem(userId: string, shopItemId: string) {
    const shopItem = await ShopItem.findOne({ itemId: shopItemId });
    if (!shopItem) {
      throw new Error("Shop item not found.");
    }

    if (shopItem.activeUntil && new Date() > shopItem.activeUntil) {
      throw new Error("This item is no longer available.");
    }

    const profile = await ProgressionProfile.findOne({ userId });
    if (!profile) throw new Error("Profile not found.");

    if (profile.coins < shopItem.price) {
      throw new Error("Not enough coins.");
    }

    // Duplicate Check for uniques
    if (['theme', 'title', 'badge', 'profile_border'].includes(shopItem.category.toLowerCase())) {
      const existing = await InventoryItem.findOne({ userId, itemId: shopItem.itemId });
      if (existing) {
        throw new Error("You already own this unique item.");
      }
    }

    // Deduct coins atomically via reward engine logic (negative dispatch)
    // Actually rewardEngine handles positive, so we'll deduct directly
    const updatedProfile = await ProgressionProfile.findOneAndUpdate(
      { userId, coins: { $gte: shopItem.price } },
      { 
        $inc: { 
          coins: -shopItem.price,
          lifetimeCoinsSpent: shopItem.price 
        } 
      },
      { new: true }
    );

    if (!updatedProfile) {
      throw new Error("Transaction failed. Not enough coins or concurrent modification.");
    }

    // Add to inventory
    const grantedItem = await inventoryService.addItem({
      userId,
      itemId: shopItem.itemId,
      name: shopItem.name,
      type: shopItem.type,
      category: shopItem.category,
      rarity: shopItem.rarity,
      icon: shopItem.icon,
      description: shopItem.description,
      source: 'Purchased from Shop',
      metadata: shopItem.metadata
    });

    return { success: true, item: grantedItem, remainingCoins: updatedProfile.coins };
  }
}

export const shopService = new ShopService();
